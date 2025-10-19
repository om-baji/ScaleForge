const ORDER_API_BASE_URL = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL || "http://localhost:5000"

export class OrderApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message)
    this.name = "OrderApiError"
  }
}

async function orderApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${ORDER_API_BASE_URL}${endpoint}`

  // Get authentication token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new OrderApiError(errorData.message || `HTTP error! status: ${response.status}`, response.status, errorData)
    }

    // Handle empty responses (like DELETE requests)
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return {} as T
    }

    return await response.json()
  } catch (error) {
    if (error instanceof OrderApiError) {
      throw error
    }
    throw new OrderApiError("Network error or invalid JSON response", 0, error)
  }
}

export const orderApi = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    orderApiRequest<T>(endpoint, { method: 'GET', ...options }),
  
  post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    orderApiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),
  
  put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    orderApiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),
  
  patch: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    orderApiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),
  
  delete: <T>(endpoint: string, options?: RequestInit) =>
    orderApiRequest<T>(endpoint, { method: 'DELETE', ...options }),
}
