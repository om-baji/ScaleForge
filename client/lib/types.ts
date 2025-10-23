interface OrderItem {
  productId: string;
  quantity: number;
}

interface CreateOrderRequest {
  userId: string;
  items: OrderItem[];
}

interface Order {
  id: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELED";
  createdAt: string;
  items?: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
  }>;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

interface UpdateOrderStatusRequest {
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELED";
}

interface HealthStatus {
  service: string;
  status: string;
  time: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface UseOrderReturn {
  getHealth: () => Promise<ApiResponse<HealthStatus>>;
  createOrder: (orderData: CreateOrderRequest) => Promise<ApiResponse<Order>>;
  getOrder: (id: string) => Promise<ApiResponse<Order>>;
  getUserOrders: (userId: string) => Promise<ApiResponse<Order[]>>;
  updateOrderStatus: (
    id: string,
    statusData: UpdateOrderStatusRequest,
  ) => Promise<ApiResponse<Order>>;
  cancelOrder: (id: string) => Promise<ApiResponse<Order>>;
}
