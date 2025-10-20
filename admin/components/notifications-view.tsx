"use client"

import { Bell, AlertCircle, CheckCircle, Info, X } from "lucide-react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  title: string
  message: string
  type: "error" | "warning" | "success" | "info"
  timestamp: string
  read: boolean
}

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Database Connection Timeout",
      message: "The primary database connection timed out. Failover to secondary database initiated.",
      type: "error",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      title: "Memory Usage Spike",
      message: "Memory usage exceeded 80% threshold. Auto-scaling triggered.",
      type: "warning",
      timestamp: "5 hours ago",
      read: false,
    },
    {
      id: "3",
      title: "System Recovery Complete",
      message: "All services have been restored to normal operation.",
      type: "success",
      timestamp: "1 day ago",
      read: true,
    },
    {
      id: "4",
      title: "Scheduled Maintenance",
      message: "Scheduled maintenance window completed successfully.",
      type: "info",
      timestamp: "2 days ago",
      read: true,
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "success":
        return "default"
      case "info":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}>
          Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No notifications</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all ${!notification.read ? "border-accent bg-accent/5" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getIcon(notification.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="text-xs">
                        Mark read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
