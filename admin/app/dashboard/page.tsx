"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { GrafanaDashboard } from "@/components/grafana-dashboard"
import { RCAAnalysis } from "@/components/rca-analysis"
import { RCAChatbot } from "@/components/rca-chatbot"
import { NotificationsView } from "@/components/notifications-view"
import { DeploymentPage } from "@/components/deployment-page"

type ViewType = "overview" | "grafana" | "analysis" | "chatbot" | "notifications" | "deployment"

export default function DashboardPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<ViewType>("overview")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/login")
      return
    }
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary mb-4 animate-pulse">
            <span className="text-primary-foreground font-bold">RCA</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader activeView={activeView} />

        <main className="flex-1 overflow-auto">
          {activeView === "overview" && <OverviewView />}
          {activeView === "grafana" && <GrafanaDashboard />}
          {activeView === "analysis" && <RCAAnalysis />}
          {activeView === "chatbot" && <RCAChatbot />}
          {activeView === "notifications" && <NotificationsView />}
          {activeView === "deployment" && <DeploymentPage />}
        </main>
      </div>
    </div>
  )
}

function OverviewView() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="System Status" value="Healthy" status="healthy" />
        <StatCard label="Active Incidents" value="2" status="warning" />
        <StatCard label="Avg Response Time" value="245ms" status="healthy" />
        <StatCard label="Error Rate" value="0.12%" status="healthy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Incidents</h3>
            <div className="space-y-3">
              <IncidentRow title="Database Connection Timeout" time="2 hours ago" severity="high" />
              <IncidentRow title="Memory Usage Spike" time="5 hours ago" severity="medium" />
              <IncidentRow title="API Latency Increase" time="1 day ago" severity="low" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-sm font-medium">
              View Grafana
            </button>
            <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-muted transition-colors text-sm font-medium border border-border">
              Start RCA
            </button>
            <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-muted transition-colors text-sm font-medium border border-border">
              Chat with AI
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Health Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthMetric label="CPU Usage" value="42%" status="healthy" />
          <HealthMetric label="Memory Usage" value="68%" status="warning" />
          <HealthMetric label="Disk Usage" value="55%" status="healthy" />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  status,
}: { label: string; value: string; status: "healthy" | "warning" | "critical" }) {
  const statusColors = {
    healthy: "bg-green-500/20 text-green-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    critical: "bg-red-500/20 text-red-400",
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-accent transition-colors">
      <p className="text-muted-foreground text-sm mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
      </div>
    </div>
  )
}

function IncidentRow({ title, time, severity }: { title: string; time: string; severity: "high" | "medium" | "low" }) {
  const severityColors = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-blue-500/20 text-blue-400",
  }

  return (
    <div className="flex items-center justify-between p-3 bg-secondary rounded-md hover:bg-muted transition-colors">
      <div>
        <p className="text-foreground font-medium text-sm">{title}</p>
        <p className="text-muted-foreground text-xs">{time}</p>
      </div>
      <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[severity]}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    </div>
  )
}

function HealthMetric({
  label,
  value,
  status,
}: { label: string; value: string; status: "healthy" | "warning" | "critical" }) {
  const statusColors = {
    healthy: "bg-green-500/20 text-green-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    critical: "bg-red-500/20 text-red-400",
  }

  const percentage = Number.parseInt(value)
  const barColor = status === "healthy" ? "bg-green-500" : status === "warning" ? "bg-yellow-500" : "bg-red-500"

  return (
    <div className="bg-secondary rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <span className={`text-sm font-semibold ${statusColors[status]}`}>{value}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
