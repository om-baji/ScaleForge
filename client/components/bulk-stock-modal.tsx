"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  lowStockThreshold: number
  status: string
}

interface BulkStockModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onBulkUpdate: (updates: Array<{ productId: string; stock: number }>) => Promise<void>
}

interface BulkUpdateItem {
  productId: string
  currentStock: number
  newStock: number
  selected: boolean
}

export function BulkStockModal({ isOpen, onClose, products, onBulkUpdate }: BulkStockModalProps) {
  const [bulkItems, setBulkItems] = useState<BulkUpdateItem[]>(
    products.map((product) => ({
      productId: product.id,
      currentStock: product.stock,
      newStock: product.stock,
      selected: false,
    })),
  )
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleSelectAll = (checked: boolean) => {
    setBulkItems((items) => items.map((item) => ({ ...item, selected: checked })))
  }

  const handleSelectItem = (productId: string, checked: boolean) => {
    setBulkItems((items) => items.map((item) => (item.productId === productId ? { ...item, selected: checked } : item)))
  }

  const handleStockChange = (productId: string, newStock: number) => {
    setBulkItems((items) =>
      items.map((item) => (item.productId === productId ? { ...item, newStock: Math.max(0, newStock) } : item)),
    )
  }

  const handleBulkUpdate = async () => {
    const selectedItems = bulkItems.filter((item) => item.selected && item.newStock !== item.currentStock)

    if (selectedItems.length === 0) {
      toast({
        title: "No Changes",
        description: "Please select items with stock changes to update",
        variant: "destructive",
      })
      return
    }

    const updateData = selectedItems.map((item) => ({
      productId: item.productId,
      stock: item.newStock,
    }))

    try {
      setIsUpdating(true)
      await onBulkUpdate(updateData)

      toast({
        title: "Bulk Update Complete",
        description: `Successfully updated ${selectedItems.length} products`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update stock levels",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const selectedCount = bulkItems.filter((item) => item.selected).length
  const changedCount = bulkItems.filter((item) => item.selected && item.newStock !== item.currentStock).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Stock Update</DialogTitle>
          <DialogDescription>Update stock levels for multiple products at once</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Products</p>
                    <p className="text-2xl font-bold">{selectedCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">With Changes</p>
                    <p className="text-2xl font-bold">{changedCount}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSelectAll(true)}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSelectAll(false)}>
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox checked={selectedCount === products.length} onCheckedChange={handleSelectAll} />
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>New Stock</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, index) => {
                      const bulkItem = bulkItems[index]
                      const stockChange = bulkItem.newStock - bulkItem.currentStock
                      const isLowStock = product.stock <= product.lowStockThreshold

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Checkbox
                              checked={bulkItem.selected}
                              onCheckedChange={(checked) => handleSelectItem(product.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.id}</p>
                              </div>
                              {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{product.sku}</TableCell>
                          <TableCell>
                            <span className={isLowStock ? "text-destructive font-medium" : ""}>{product.stock}</span>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={bulkItem.newStock}
                              onChange={(e) => handleStockChange(product.id, Number.parseInt(e.target.value) || 0)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            {stockChange !== 0 && (
                              <Badge variant={stockChange > 0 ? "default" : "destructive"}>
                                {stockChange > 0 ? "+" : ""}
                                {stockChange}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate} disabled={changedCount === 0 || isUpdating}>
              {isUpdating ? "Updating..." : `Update ${changedCount} Products`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
