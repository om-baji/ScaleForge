"use client"

import { useState, useEffect } from "react"
import { inventoryApi, type Product, type CreateProductRequest } from "../api/inventory"
import { ApiError } from "../api-client"

export function useProducts(filters?: { category?: string; status?: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await inventoryApi.getProducts(filters)
      setProducts(response.products)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch products"
      setError(errorMessage)
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [filters?.category, filters?.status])

  const createProduct = async (productData: CreateProductRequest) => {
    try {
      const newProduct = await inventoryApi.createProduct(productData)
      setProducts((prev) => [newProduct, ...prev])
      return newProduct
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to create product"
      throw new Error(errorMessage)
    }
  }

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      const updatedProduct = await inventoryApi.updateProduct(productId, productData)
      setProducts((prev) => prev.map((product) => (product.id === productId ? updatedProduct : product)))
      return updatedProduct
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to update product"
      throw new Error(errorMessage)
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      await inventoryApi.deleteProduct(productId)
      setProducts((prev) => prev.filter((product) => product.id !== productId))
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to delete product"
      throw new Error(errorMessage)
    }
  }

  const updateStock = async (productId: string, newStock: number) => {
    try {
      const updatedProduct = await inventoryApi.updateProductStock(productId, { stock: newStock })
      setProducts((prev) => prev.map((product) => (product.id === productId ? updatedProduct : product)))
      return updatedProduct
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to update stock"
      throw new Error(errorMessage)
    }
  }

  const bulkUpdateStock = async (updates: Array<{ productId: string; stock: number }>) => {
    try {
      await inventoryApi.bulkUpdateStock({ updates })
      // Refresh products after bulk update
      await fetchProducts()
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to bulk update stock"
      throw new Error(errorMessage)
    }
  }

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    bulkUpdateStock,
  }
}

export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const productData = await inventoryApi.getProductById(productId)
        setProduct(productData)
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch product"
        setError(errorMessage)
        console.error("Error fetching product:", err)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  return { product, loading, error }
}

export function useLowStockProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await inventoryApi.getLowStockProducts()
        setProducts(response.products)
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch low stock products"
        setError(errorMessage)
        console.error("Error fetching low stock products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLowStockProducts()
  }, [])

  return { products, loading, error }
}
