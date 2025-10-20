"use client"

import { useState } from "react"
import { RefreshCw, Download, Settings, AlertCircle, CheckCircle, Clock, Loader } from "lucide-react"

interface Dashboard {
  id: string
  name: string
  url: string
  description: string
  status: "healthy" | "warning" | "error"
  lastUpdated: string
}

export function GrafanaDashboard() {
  const [selectedDashboard, setSelectedDashboard] = useState("prometheus")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeError, setIframeError] = useState(false)
  const [timeRange, setTimeRange] = useState("6h")

  const dashboards: Dashboard[] = [
    {
      id: "prometheus",
      name: "Prometheus Metrics",
      url: process.env.NEXT_PUBLIC_GRAFANA_PROMETHEUS_URL || "http://localhost:3000/d/prometheus-dashboard",
      description: "System metrics and performance indicators",
      status: "healthy",
      lastUpdated: "2 minutes ago",
    },
    {
      id: "loki",
      name: "Loki Logs",
      url: process.env.NEXT_PUBLIC_GRAFANA_LOKI_URL || "http://localhost:3000/d/loki-dashboard",
      description: "Application and system logs",
      status: "healthy",
      lastUpdated: "1 minute ago",
    },
    {
      id: "combined",
      name: "Combined View",
      url: process.env.NEXT_PUBLIC_GRAFANA_COMBINED_URL || "http://localhost:3000/d/combined-dashboard",
      description: "Metrics and logs combined",
      status: "warning",
      lastUpdated: "5 minutes ago",
    },
    {
      id: "alerts",
      name: "Alerts & Incidents",
      url: process.env.NEXT_PUBLIC_GRAFANA_ALERTS_URL || "http://localhost:3000/d/alerts-dashboard",
      description: "Active alerts and incident tracking",
      status: "healthy",
      lastUpdated: "Just now",
    },
  ]

  const currentDashboard = dashboards.find((d) => d.id === selectedDashboard)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setIframeLoading(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleIframeLoad = () => {
    setIframeLoading(false)
    setIframeError(false)
  }

  const handleIframeError = () => {
    setIframeLoading(false)
    setIframeError(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getIframeUrl = () => {
    if (!currentDashboard) return ""
    const url = new URL(currentDashboard.url)
    url.searchParams.set("from", `now-${timeRange}`)
    url.searchParams.set("to", "now")
    url.searchParams.set("refresh", "30s")
    return url.toString()
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with Controls */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Grafana Dashboards</h2>
            <p className="text-muted-foreground text-sm mt-1">Real-time monitoring and observability</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-5 h-5 text-foreground ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors" title="Download dashboard">
              <Download className="w-5 h-5 text-foreground" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors" title="Dashboard settings">
              <Settings className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Dashboard Selector */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dashboards.map((dashboard) => (
              <button
                key={dashboard.id}
                onClick={() => {
                  setSelectedDashboard(dashboard.id)
                  setIframeLoading(true)
                }}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium flex items-center gap-2 ${
                  selectedDashboard === dashboard.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary text-foreground hover:bg-muted"
                }`}
              >
                {getStatusIcon(dashboard.status)}
                {dashboard.name}
              </button>
            ))}
          </div>

          {currentDashboard && (
            <div className="flex items-center justify-between bg-secondary rounded-lg p-3">
              <div className="flex-1">
                <p className="text-foreground text-sm font-medium">{currentDashboard.description}</p>
                <p className="text-muted-foreground text-xs mt-1">Last updated: {currentDashboard.lastUpdated}</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(e.target.value)
                    setIframeLoading(true)
                  }}
                  className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1h">Last 1 hour</option>
                  <option value="6h">Last 6 hours</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentDashboard.status)}
                  <span className="text-xs font-medium text-muted-foreground capitalize">
                    {currentDashboard.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grafana Iframe Container */}
      <div className="flex-1 overflow-hidden p-4 relative">
        <div className="w-full h-full bg-card border border-border rounded-lg overflow-hidden shadow-lg relative">
          {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          )}

          {iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-foreground">Failed to load dashboard</p>
                  <p className="text-xs text-muted-foreground mt-1">Please check your Grafana URL configuration</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:opacity-90"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <iframe
            key={selectedDashboard}
            src={getIframeUrl()}
            className="w-full h-full border-none"
            title={currentDashboard?.name}
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-secondary border-t border-border px-6 py-3 text-sm text-muted-foreground flex items-center gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <p>
          Configure Grafana URLs using environment variables: NEXT_PUBLIC_GRAFANA_PROMETHEUS_URL,
          NEXT_PUBLIC_GRAFANA_LOKI_URL, NEXT_PUBLIC_GRAFANA_COMBINED_URL, NEXT_PUBLIC_GRAFANA_ALERTS_URL
        </p>
      </div>
    </div>
  )
}
