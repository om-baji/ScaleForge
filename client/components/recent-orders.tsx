import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

const orders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    status: "completed",
    amount: "$234.50",
    date: "2024-01-15",
    items: 3,
  },
  {
    id: "ORD-002",
    customer: "Sarah Johnson",
    status: "processing",
    amount: "$156.75",
    date: "2024-01-15",
    items: 2,
  },
  {
    id: "ORD-003",
    customer: "Mike Davis",
    status: "pending",
    amount: "$89.99",
    date: "2024-01-14",
    items: 1,
  },
  {
    id: "ORD-004",
    customer: "Emily Brown",
    status: "completed",
    amount: "$445.20",
    date: "2024-01-14",
    items: 5,
  },
  {
    id: "ORD-005",
    customer: "David Wilson",
    status: "cancelled",
    amount: "$67.30",
    date: "2024-01-13",
    items: 2,
  },
]

const statusColors = {
  completed: "default",
  processing: "secondary",
  pending: "outline",
  cancelled: "destructive",
} as const

export function RecentOrders() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders and their status</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium text-foreground">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <Badge variant={statusColors[order.status as keyof typeof statusColors]}>{order.status}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-foreground">{order.amount}</p>
                  <p className="text-sm text-muted-foreground">{order.items} items</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
