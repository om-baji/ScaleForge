"use client"

import { useState, useEffect } from "react"
import { ordersApi, type Order, type CreateOrderRequest } from "../api/orders"
import { ApiError } from "../api-client"

export function useOrders(filters?: { status?: string; userId?: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ordersApi.getOrders(filters)
      setOrders(response.orders)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch orders"
      setError(errorMessage)
      console.error("Error fetching orders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [filters?.status, filters?.userId])

  const createOrder = async (orderData: CreateOrderRequest) => {
    try {
      const newOrder = await ordersApi.createOrder(orderData)
      setOrders((prev) => [newOrder, ...prev])
      return newOrder
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to create order"
      throw new Error(errorMessage)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updatedOrder = await ordersApi.updateOrderStatus(orderId, { status: status as any })
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)))
      return updatedOrder
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to update order status"
      throw new Error(errorMessage)
    }
  }

  const cancelOrder = async (orderId: string) => {
    try {
      const cancelledOrder = await ordersApi.cancelOrder(orderId)
      setOrders((prev) => prev.map((order) => (order.id === orderId ? cancelledOrder : order)))
      return cancelledOrder
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to cancel order"
      throw new Error(errorMessage)
    }
  }

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrderStatus,
    cancelOrder,
  }
}

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        const orderData = await ordersApi.getOrderById(orderId)
        setOrder(orderData)
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch order"
        setError(errorMessage)
        console.error("Error fetching order:", err)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  return { order, loading, error }
}
