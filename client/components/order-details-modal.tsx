"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Package, CreditCard, Calendar, User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface Order {
  id: string
  customer: string
  customerEmail: string
  status: string
  amount: number
  date: string
  items: number
  shippingAddress: string
  paymentMethod: string
}

interface OrderDetailsModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (orderId: string, newStatus: string) => Promise<void>
}

const statusColors = {
  completed: "default",
  processing: "secondary",
  pending: "outline",
  cancelled: "destructive",
} as const

export function OrderDetailsModal({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsModalProps) {
  const [newStatus, setNewStatus] = useState(order.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async () => {
    if (newStatus !== order.status) {
      try {
        setIsUpdating(true)
        await onStatusUpdate(order.id, newStatus)
        toast("Status Updated", {
          description: `Order ${order.id} status updated to ${newStatus}`,
        })
        onClose()
      } catch (error) {
        toast("Update Failed", {
          description: error instanceof Error ? error.message : "Failed to update order status",
        })
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleCancelOrder = async () => {
    try {
      setIsUpdating(true)
      await onStatusUpdate(order.id, "cancelled")
      toast("Order Cancelled", {
        description: `Order ${order.id} has been cancelled`,
      })
      onClose()
    } catch (error) {
      toast("Cancellation Failed", {
        description: error instanceof Error ? error.message : "Failed to cancel order",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details - {order.id}
          </DialogTitle>
          <DialogDescription>Complete information about this order</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={statusColors[order.status as keyof typeof statusColors]}>{order.status}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleStatusUpdate} disabled={newStatus === order.status || isUpdating}>
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-foreground">{order.customer}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{order.customerEmail}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-4 w-4" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                  <p className="text-foreground">{order.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-foreground">{order.items}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-foreground font-semibold">${order.amount.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-4 w-4" />
                  Payment & Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="text-foreground">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shipping Address</p>
                  <p className="text-foreground">{order.shippingAddress}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {order.status !== "cancelled" && order.status !== "completed" && (
              <Button variant="destructive" onClick={handleCancelOrder} disabled={isUpdating}>
                {isUpdating ? "Cancelling..." : "Cancel Order"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
