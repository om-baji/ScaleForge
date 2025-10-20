"use client"

import { Bell, Search, User } from "lucide-react"

type ViewType = "overview" | "grafana" | "analysis" | "chatbot"

interface DashboardHeaderProps {
  activeView: ViewType
}

export function DashboardHeader({ activeView }: DashboardHeaderProps) {
  const titles = {
    overview: "Dashboard Overview",
    grafana: "Monitoring & Observability",
    analysis: "Root Cause Analysis",
    chatbot: "AI Assistant",
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{titles[activeView]}</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and analyze system incidents</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 border border-border hover:border-accent transition-colors">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search incidents..."
            className="bg-transparent text-foreground placeholder-muted-foreground text-sm outline-none w-48"
          />
        </div>

        {/* Notification Bell */}
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors relative group">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg p-2 text-xs text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            2 new alerts
          </div>
        </button>

        {/* User Profile */}
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <User className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </header>
  )
}
