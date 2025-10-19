import { api } from "./api-client"

// Types for Inventory API
export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  price: number
  stock: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateProductRequest {
  name: string
  sku: string
  description?: string
  price: number
  stock: number
}

export interface UpdateProductRequest {
  name?: string
  sku?: string
  description?: string
  price?: number
  stock?: number
}

export interface BulkStockUpdateRequest {
  updates: Array<{
    productId: string
    quantity: number
  }>
}

export interface StockUpdateRequest {
  quantity: number
}

export interface StockReduceRequest {
  quantity: number
}

export interface StockReserveRequest {
  quantity: number
}

// Inventory API service functions
export const inventoryApi = {
  // GET /api/v1/inventory/products - Get all products
  getProducts: async (): Promise<Product[]> => {
    return api.get("/api/v1/inventory/products")
  },

  // POST /api/v1/inventory/products - Create a new product
  createProduct: async (productData: CreateProductRequest): Promise<Product> => {
    return api.post("/api/v1/inventory/products", productData)
  },

  // GET /api/v1/inventory/products/{id} - Get product by ID
  getProductById: async (productId: string): Promise<Product> => {
    return api.get(`/api/v1/inventory/products/${productId}`)
  },

  // PUT /api/v1/inventory/products/{id} - Update product
  updateProduct: async (productId: string, productData: UpdateProductRequest): Promise<Product> => {
    return api.put(`/api/v1/inventory/products/${productId}`, productData)
  },

  // DELETE /api/v1/inventory/products/{id} - Delete product
  deleteProduct: async (productId: string): Promise<void> => {
    return api.delete(`/api/v1/inventory/products/${productId}`)
  },

  // GET /api/v1/inventory/products/low-stock - Get low stock products
  getLowStockProducts: async (threshold?: number): Promise<Product[]> => {
    const query = threshold ? `?threshold=${threshold}` : ""
    return api.get(`/api/v1/inventory/products/low-stock${query}`)
  },

  // PATCH /api/v1/inventory/products/stock/bulk-update - Bulk update stock
  bulkUpdateStock: async (updateData: BulkStockUpdateRequest): Promise<{ updated: number }> => {
    return api.patch("/api/v1/inventory/products/stock/bulk-update", updateData)
  },

  // PATCH /api/v1/inventory/products/{id}/stock - Update product stock
  updateProductStock: async (productId: string, stockData: StockUpdateRequest): Promise<Product> => {
    return api.patch(`/api/v1/inventory/products/${productId}/stock`, stockData)
  },

  // PATCH /api/v1/inventory/products/{id}/stock/reduce - Reduce product stock
  reduceProductStock: async (productId: string, reduceData: StockReduceRequest): Promise<Product> => {
    return api.patch(`/api/v1/inventory/products/${productId}/stock/reduce`, reduceData)
  },

  // GET /api/v1/inventory/products/{id}/stock/check - Check product stock
  checkProductStock: async (productId: string): Promise<{ stock: number; available: boolean }> => {
    return api.get(`/api/v1/inventory/products/${productId}/stock/check`)
  },

  // PATCH /api/v1/inventory/products/{id}/stock/reserve - Reserve product stock
  reserveProductStock: async (
    productId: string,
    reserveData: StockReserveRequest,
  ): Promise<{ reserved: number; reservationId: string }> => {
    return api.patch(`/api/v1/inventory/products/${productId}/stock/reserve`, reserveData)
  },
}
