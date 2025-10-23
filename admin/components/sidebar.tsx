"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  BarChart3,
  AlertCircle,
  MessageSquare,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cloud,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"

type ViewType = "overview" | "grafana" | "analysis" | "chatbot" | "notifications" | "deployment"

interface SidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

  const menuItems = [
    { id: "overview" as ViewType, label: "Overview", icon: LayoutDashboard },
    { id: "grafana" as ViewType, label: "Monitoring", icon: BarChart3 },
    { id: "analysis" as ViewType, label: "RCA Analysis", icon: AlertCircle },
    { id: "chatbot" as ViewType, label: "AI Assistant", icon: MessageSquare },
    { id: "notifications" as ViewType, label: "Notifications", icon: Bell },
    { id: "deployment" as ViewType, label: "Deploy", icon: Cloud },
  ]

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/login")
  }

  return (
    <aside
      className={`bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm">RCA</span>
          </div>
          {!isCollapsed && <span className="text-sidebar-foreground font-semibold text-sm">Admin</span>}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
