import { api } from "../api-client"

// Types for Order API
export interface Order {
  id: string
  customer: string
  customerEmail: string
  status: "pending" | "processing" | "completed" | "cancelled"
  amount: number
  date: string
  items: number
  shippingAddress: string
  paymentMethod: string
}

export interface CreateOrderRequest {
  customer: string
  customerEmail: string
  shippingAddress: string
  paymentMethod: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
}

export interface UpdateOrderStatusRequest {
  status: "pending" | "processing" | "completed" | "cancelled"
}

// Orders API service functions
export const ordersApi = {
  // GET /api/v1/orders - Get all orders (with optional filters)
  getOrders: async (params?: {
    status?: string
    userId?: string
    limit?: number
    offset?: number
  }): Promise<{ orders: Order[]; total: number }> => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append("status", params.status)
    if (params?.userId) searchParams.append("userId", params.userId)
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.offset) searchParams.append("offset", params.offset.toString())

    const query = searchParams.toString()
    return api.get(`/api/v1/orders${query ? `?${query}` : ""}`)
  },

  // POST /api/v1/orders - Create a new order
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    return api.post("/api/v1/orders", orderData)
  },

  // GET /api/v1/orders/{id} - Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    return api.get(`/api/v1/orders/${orderId}`)
  },

  // GET /api/v1/orders/user/{id} - Get all orders for a user
  getOrdersByUserId: async (userId: string): Promise<{ orders: Order[] }> => {
    return api.get(`/api/v1/orders/user/${userId}`)
  },

  // PATCH /api/v1/orders/{id}/status - Update order status
  updateOrderStatus: async (orderId: string, statusData: UpdateOrderStatusRequest): Promise<Order> => {
    return api.patch(`/api/v1/orders/${orderId}/status`, statusData)
  },

  // PATCH /api/v1/orders/{id}/cancel - Cancel an order
  cancelOrder: async (orderId: string): Promise<Order> => {
    return api.patch(`/api/v1/orders/${orderId}/cancel`)
  },
}
