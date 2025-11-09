"use client"

import { useState, useEffect, useCallback } from "react"
import { KubernetesVisualization } from "@/components/kubernetes-visualization"
import { DataStreamPanel } from "@/components/data-stream-panel"
import { useWebSocket } from "@/hooks/use-websocket"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [clusterData, setClusterData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: streamData, sendMessage, connect, disconnect } = useWebSocket()

  // Process incoming WebSocket data
  useEffect(() => {
    if (streamData) {
      try {
        setClusterData(JSON.parse(streamData))
      } catch (e) {
        console.error("Failed to parse stream data:", e)
      }
    }
  }, [streamData])

  const handleConnect = useCallback(async () => {
    const ws = new WebSocket("ws://localhost:3001/api/k8s-stream")

    ws.onopen = () => {
      setIsConnected(true)
      connect("ws://localhost:3001/api/k8s-stream")
    }

    ws.onerror = () => {
      // Fallback: Use demo data with polling
      setIsConnected(false)
      loadDemoData()
      // Poll demo data every 2 seconds
      const interval = setInterval(loadDemoData, 2000)
      return () => clearInterval(interval)
    }
  }, [connect])

  const loadDemoData = () => {
    // Demo data for visualization
    const demoData = {
      pods: [
        { name: "orders-7697b6b748-6b4b8", status: "Running", ready: "1/1", restarts: 0, age: "21m" },
        { name: "orders-7697b6b748-zxrmq", status: "Running", ready: "1/1", restarts: 0, age: "21m" },
        { name: "postgres-77b77ffdf5-lw5f5", status: "Running", ready: "1/1", restarts: 0, age: "23m" },
        { name: "redis-5c54dd6c44-kp9mb", status: "Running", ready: "1/1", restarts: 0, age: "23m" },
      ],
      services: [
        { name: "kubernetes", type: "ClusterIP", clusterIP: "10.96.0.1", ports: "443/TCP" },
        {
          name: "orders",
          type: "LoadBalancer",
          clusterIP: "10.96.152.23",
          externalIP: "pending",
          ports: "4001:31001/TCP",
        },
        { name: "postgres", type: "ClusterIP", clusterIP: "10.96.250.136", ports: "5432/TCP" },
        { name: "redis", type: "ClusterIP", clusterIP: "10.96.171.97", ports: "6379/TCP" },
      ],
      deployments: [
        { name: "orders", ready: "2/2", upToDate: 2, available: 2, age: "21m" },
        { name: "postgres", ready: "1/1", upToDate: 1, available: 1, age: "23m" },
        { name: "redis", ready: "1/1", upToDate: 1, available: 1, age: "23m" },
      ],
      nodes: [
        { name: "orders", type: "deployment", replicas: 2, color: "#3b82f6" },
        { name: "postgres", type: "deployment", replicas: 1, color: "#10b981" },
        { name: "redis", type: "deployment", replicas: 1, color: "#f59e0b" },
      ],
    }
    setClusterData(demoData)
  }

  useEffect(() => {
    loadDemoData()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Kubernetes Cluster Visualizer</h1>
          <p className="text-muted-foreground">
            Real-time dynamic visualization of your K8s cluster with live data streaming
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-orange-500"}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Connected to WebSocket" : 'Using demo data (Click "Connect Stream" to enable real-time)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main visualization */}
          <div className="lg:col-span-3">
            <Card className="p-6 bg-card border-border shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Cluster Architecture</h2>
              {clusterData && <KubernetesVisualization data={clusterData} />}
            </Card>
          </div>

          {/* Data stream panel */}
          <div className="lg:col-span-1">
            <DataStreamPanel
              clusterData={clusterData}
              isConnected={isConnected}
              onConnect={handleConnect}
              onDisconnect={() => setIsConnected(false)}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
