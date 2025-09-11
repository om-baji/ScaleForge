"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Package, DollarSign, Building, AlertTriangle, Plus, Minus } from "lucide-react"
import { useState } from "react"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  lowStockThreshold: number
  status: string
  description: string
  supplier: string
  lastUpdated: string
}

interface ProductDetailsModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onStockUpdate: (productId: string, newStock: number) => void
}

const statusColors = {
  active: "default",
  "low-stock": "secondary",
  "out-of-stock": "destructive",
  inactive: "outline",
} as const

export function ProductDetailsModal({ product, isOpen, onClose, onStockUpdate }: ProductDetailsModalProps) {
  const [stockAdjustment, setStockAdjustment] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  const handleStockUpdate = (type: "add" | "reduce" | "set") => {
    let newStock = product.stock

    if (type === "add") {
      newStock = product.stock + Math.abs(stockAdjustment)
    } else if (type === "reduce") {
      newStock = Math.max(0, product.stock - Math.abs(stockAdjustment))
    } else if (type === "set") {
      newStock = Math.max(0, stockAdjustment)
    }

    onStockUpdate(product.id, newStock)
    setStockAdjustment(0)
    onClose()
  }

  const isLowStock = product.stock <= product.lowStockThreshold
  const isOutOfStock = product.stock === 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Details - {product.name}
          </DialogTitle>
          <DialogDescription>Complete information and stock management for this product</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Status and Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={statusColors[product.status as keyof typeof statusColors]}>{product.status}</Badge>
              {isLowStock && (
                <div className="flex items-center gap-1 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Low Stock Alert</span>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel Edit" : "Edit Product"}
            </Button>
          </div>

          <Separator />

          {/* Product Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-4 w-4" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Product ID</p>
                  <p className="text-foreground">{product.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SKU</p>
                  <p className="text-foreground font-mono">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-foreground">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-foreground text-sm">{product.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing and Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-4 w-4" />
                  Pricing & Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unit Price</p>
                  <p className="text-foreground font-semibold text-lg">${product.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Stock</p>
                  <p className={`text-foreground font-semibold text-lg ${isLowStock ? "text-destructive" : ""}`}>
                    {product.stock} units
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Threshold</p>
                  <p className="text-foreground">{product.lowStockThreshold} units</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-foreground font-semibold">${(product.price * product.stock).toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supplier and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-4 w-4" />
                Supplier & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                <p className="text-foreground">{product.supplier}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-foreground">{product.lastUpdated}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stock Management */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Management</CardTitle>
              <CardDescription>Adjust inventory levels for this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="stockAdjustment">Stock Adjustment</Label>
                  <Input
                    id="stockAdjustment"
                    type="number"
                    value={stockAdjustment}
                    onChange={(e) => setStockAdjustment(Number.parseInt(e.target.value) || 0)}
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="flex gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStockUpdate("add")}
                    disabled={stockAdjustment <= 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStockUpdate("reduce")}
                    disabled={stockAdjustment <= 0}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Reduce
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStockUpdate("set")}
                    disabled={stockAdjustment < 0}
                  >
                    Set To
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {isOutOfStock && (
              <Button
                onClick={() => {
                  setStockAdjustment(product.lowStockThreshold + 5)
                  handleStockUpdate("set")
                }}
              >
                Restock Now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
