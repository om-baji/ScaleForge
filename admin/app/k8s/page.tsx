"use client"

import { useState, useEffect } from "react"
import { KubernetesVisualization } from "@/components/kubernetes-visualization"
import { DataStreamPanel } from "@/components/data-stream-panel"
import { Card } from "@/components/ui/card"

const MOCK_CLUSTER_DATA = {
  deployments: [
    { id: "1", name: "frontend-api", ready: "3/3", image: "nginx:latest" },
    { id: "2", name: "backend-svc", ready: "2/2", image: "node:18" },
    { id: "3", name: "database", ready: "1/1", image: "postgres:15" },
  ],
  services: [
    { id: "1", name: "frontend-svc", type: "ClusterIP", clusterIP: "10.0.1.10", ports: "80:8080", externalIP: null },
    { id: "2", name: "api-svc", type: "ClusterIP", clusterIP: "10.0.1.11", ports: "3000:3000", externalIP: null },
    { id: "3", name: "db-svc", type: "ClusterIP", clusterIP: "10.0.1.12", ports: "5432:5432", externalIP: null },
  ],
  pods: [
    { id: "1", name: "frontend-api-7d4f8b5c9", status: "Running", ready: "1/1", restarts: 0, age: "2d 14h" },
    { id: "2", name: "frontend-api-8e9g2h1x5", status: "Running", ready: "1/1", restarts: 0, age: "2d 14h" },
    { id: "3", name: "frontend-api-5k3j8l2m9", status: "Running", ready: "1/1", restarts: 2, age: "1d 3h" },
    { id: "4", name: "backend-svc-4a6b8c2d1", status: "Running", ready: "1/1", restarts: 0, age: "5d 7h" },
    { id: "5", name: "backend-svc-9e3f5g7h2", status: "Running", ready: "1/1", restarts: 1, age: "3d 12h" },
    { id: "6", name: "database-6x2p4q9r8", status: "Running", ready: "1/1", restarts: 0, age: "30d 2h" },
    { id: "7", name: "monitoring-1m3n5o7p", status: "Pending", ready: "0/1", restarts: 0, age: "5m" },
    { id: "8", name: "logging-2q4r6s8t", status: "ContainerCreating", ready: "0/1", restarts: 0, age: "2m" },
  ],
}

export default function Home() {
  const [clusterData, setClusterData] = useState(MOCK_CLUSTER_DATA)
  const [isConnected, setIsConnected] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(true)

  useEffect(() => {
    if (!isPolling) return

    let intervalId: NodeJS.Timeout

    const fetchClusterData = async () => {
      try {
        const response = await fetch("http://localhost:8080/cluster")
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        setClusterData(data)
        setIsConnected(true)
        setError(null)
      } catch (err) {
        setIsConnected(false)
        setError(err instanceof Error ? err.message : "Failed to fetch cluster data")
        setClusterData(MOCK_CLUSTER_DATA)
      }
    }

    fetchClusterData()
    intervalId = setInterval(fetchClusterData, 2000)

    return () => clearInterval(intervalId)
  }, [isPolling])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Kubernetes Cluster Visualizer</h1>
          <p className="text-muted-foreground">Real-time visualization of your K8s cluster with live data polling</p>
          <div className="flex items-center gap-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-orange-500"}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Connected to cluster" : "Using mock data"}
            </span>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="p-6 bg-card border-border shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Cluster Architecture</h2>
              {clusterData && <KubernetesVisualization data={clusterData} />}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <DataStreamPanel
              clusterData={clusterData}
              isConnected={isConnected}
              onTogglePolling={setIsPolling}
              isPolling={isPolling}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
