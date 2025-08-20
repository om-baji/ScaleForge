import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, TrendingDown } from "lucide-react"

const alerts = [
  {
    id: 1,
    product: "Wireless Headphones",
    sku: "WH-001",
    stock: 5,
    threshold: 10,
    type: "low-stock",
    severity: "warning",
  },
  {
    id: 2,
    product: "Gaming Mouse",
    sku: "GM-002",
    stock: 0,
    threshold: 15,
    type: "out-of-stock",
    severity: "critical",
  },
  {
    id: 3,
    product: "USB Cable",
    sku: "UC-003",
    stock: 8,
    threshold: 20,
    type: "low-stock",
    severity: "warning",
  },
  {
    id: 4,
    product: "Laptop Stand",
    sku: "LS-004",
    stock: 2,
    threshold: 12,
    type: "low-stock",
    severity: "warning",
  },
]

export function InventoryAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Inventory Alerts
        </CardTitle>
        <CardDescription>Products requiring immediate attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    alert.severity === "critical"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-secondary/10 text-secondary"
                  }`}
                >
                  {alert.type === "out-of-stock" ? (
                    <Package className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{alert.product}</p>
                  <p className="text-xs text-muted-foreground">{alert.sku}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                  {alert.stock} left
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Min: {alert.threshold}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-4 bg-transparent">
            View All Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
