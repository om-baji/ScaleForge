"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader,
} from "lucide-react";

interface Dashboard {
  id: string;
  name: string;
  url: string;
  description: string;
  status: "healthy" | "warning" | "error";
  lastUpdated: string;
}

export function GrafanaDashboard() {
  const [selectedDashboard, setSelectedDashboard] = useState("prometheus");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [timeRange, setTimeRange] = useState("6h");

  const dashboards: Dashboard[] = [
    {
      id: "prometheus",
      name: "Prometheus Metrics",
      url:
        process.env.NEXT_PUBLIC_GRAFANA_PROMETHEUS_URL ||
        "http://localhost:3000/d/prometheus-dashboard",
      description: "System metrics and performance indicators",
      status: "healthy",
      lastUpdated: "2 minutes ago",
    },
    {
      id: "loki",
      name: "Loki Logs",
      url:
        process.env.NEXT_PUBLIC_GRAFANA_LOKI_URL ||
        "http://localhost:3000/d/loki-dashboard",
      description: "Application and system logs",
      status: "healthy",
      lastUpdated: "1 minute ago",
    },
    {
      id: "combined",
      name: "Combined View",
      url:
        process.env.NEXT_PUBLIC_GRAFANA_COMBINED_URL ||
        "http://localhost:3000/d/combined-dashboard",
      description: "Metrics and logs combined",
      status: "warning",
      lastUpdated: "5 minutes ago",
    },
    {
      id: "alerts",
      name: "Alerts & Incidents",
      url:
        process.env.NEXT_PUBLIC_GRAFANA_ALERTS_URL ||
        "http://localhost:3000/d/alerts-dashboard",
      description: "Active alerts and incident tracking",
      status: "healthy",
      lastUpdated: "Just now",
    },
  ];

  const currentDashboard = dashboards.find((d) => d.id === selectedDashboard);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setIframeLoading(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false);
    setIframeError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeLoading(false);
    setIframeError(true);
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    if (status === "healthy")
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "warning")
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    if (status === "error")
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  }, []);

  const getIframeUrl = useCallback(() => {
    if (!currentDashboard) return "";
    const url = new URL(currentDashboard.url);
    url.searchParams.set("from", `now-${timeRange}`);
    url.searchParams.set("to", "now");
    url.searchParams.set("refresh", "30s");
    return url.toString();
  }, [currentDashboard, timeRange]);

  useEffect(() => {
    setIframeLoading(true);
  }, [selectedDashboard, timeRange]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-muted to-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">Grafana Dashboards</h1>
          <p className="text-sm text-muted-foreground">
            Real-time observability and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
          <button className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-6 py-3 border-b border-border bg-card/70 backdrop-blur-md">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dashboards.map((dashboard) => (
            <button
              key={dashboard.id}
              onClick={() => setSelectedDashboard(dashboard.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
                selectedDashboard === dashboard.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary hover:bg-muted"
              }`}
            >
              {getStatusIcon(dashboard.status)}
              {dashboard.name}
            </button>
          ))}
        </div>
        {currentDashboard && (
          <div className="mt-3 flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border">
            <div>
              <p className="font-medium text-sm">{currentDashboard.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {currentDashboard.lastUpdated}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-background border border-border rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary"
              >
                <option value="1h">Last 1h</option>
                <option value="6h">Last 6h</option>
                <option value="24h">Last 24h</option>
                <option value="7d">Last 7d</option>
                <option value="30d">Last 30d</option>
              </select>
              <div className="flex items-center gap-2">
                {getStatusIcon(currentDashboard.status)}
                <span className="text-xs capitalize">
                  {currentDashboard.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <main className="flex-1 relative p-4 bg-background/50 backdrop-blur-sm">
        <div className="h-full w-full rounded-xl border border-border overflow-hidden shadow-lg bg-card">
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 z-10">
              <Loader className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading dashboard...</p>
            </div>
          )}
          {iframeError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3 bg-background z-10">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <p className="font-medium">Failed to load dashboard</p>
              <p className="text-xs text-muted-foreground">
                Please verify your Grafana URLs
              </p>
              <button
                onClick={handleRefresh}
                className="mt-2 px-3 py-1 rounded bg-primary text-primary-foreground text-xs hover:opacity-90"
              >
                Retry
              </button>
            </div>
          ) : (
            <iframe
              key={selectedDashboard}
              src={getIframeUrl()}
              className="w-full h-full border-none"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </div>
      </main>

      <footer className="px-6 py-3 text-xs text-muted-foreground border-t border-border bg-card/70 backdrop-blur-md flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Configure Grafana URLs via environment variables:
        NEXT_PUBLIC_GRAFANA_PROMETHEUS_URL, NEXT_PUBLIC_GRAFANA_LOKI_URL,
        NEXT_PUBLIC_GRAFANA_COMBINED_URL, NEXT_PUBLIC_GRAFANA_ALERTS_URL
      </footer>
    </div>
  );
}
