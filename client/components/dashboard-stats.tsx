import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, DollarSign, AlertTriangle } from "lucide-react"

const stats = [
  {
    title: "Total Orders",
    value: "1,247",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: ShoppingCart,
    description: "vs last month",
  },
  {
    title: "Revenue",
    value: "$84,532",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "vs last month",
  },
  {
    title: "Products",
    value: "2,847",
    change: "+3.1%",
    changeType: "positive" as const,
    icon: Package,
    description: "in inventory",
  },
  {
    title: "Low Stock",
    value: "23",
    change: "-2",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "items need restock",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                  {stat.change}
                </Badge>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
