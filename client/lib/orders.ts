import { orderApi } from "./order-api-client"

// Types for Order API
export interface Order {
  id: string
  userId: string
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELED"
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
}

export interface CreateOrderRequest {
  userId: string
  items: Array<{
    productId: string
    quantity: number
  }>
}

export interface UpdateOrderStatusRequest {
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELED"
}

// Orders API service functions
export const ordersApi = {
  // POST /api/v1/order - Create a new order
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    return orderApi.post("/api/v1/order", orderData)
  },

  // GET /api/v1/order/{id} - Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    return orderApi.get(`/api/v1/order/${orderId}`)
  },

  // GET /api/v1/order/user/{id} - Get all orders for a user
  getOrdersByUserId: async (userId: string): Promise<{ orders: Order[] }> => {
    return orderApi.get(`/api/v1/order/user/${userId}`)
  },

  // PATCH /api/v1/order/{id}/status - Update order status
  updateOrderStatus: async (orderId: string, statusData: UpdateOrderStatusRequest): Promise<Order> => {
    return orderApi.patch(`/api/v1/order/${orderId}/status`, statusData)
  },

  // PATCH /api/v1/order/{id}/cancel - Cancel an order
  cancelOrder: async (orderId: string): Promise<Order> => {
    return orderApi.patch(`/api/v1/order/${orderId}/cancel`)
  },
}
