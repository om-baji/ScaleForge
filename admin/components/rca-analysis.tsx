"use client"

import { useState } from "react"
import { Plus, Trash2, ChevronDown, Filter, Search, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc-client"

interface RCAItem {
  id: string
  title: string
  description: string
  rootCause: string
  impact: "high" | "medium" | "low"
  status: "open" | "investigating" | "resolved"
  timeline: string[]
  analysis?: string
  logs?: any[]
}

export function RCAAnalysis() {
  const [rcaItems, setRcaItems] = useState<RCAItem[]>([
    {
      id: "1",
      title: "Database Connection Pool Exhaustion",
      description: "Connection pool reached maximum capacity causing service degradation",
      rootCause: "Inefficient connection management in legacy service",
      impact: "high",
      status: "investigating",
      timeline: ["14:30 - Alert triggered", "14:35 - Investigation started", "14:45 - Root cause identified"],
    },
    {
      id: "2",
      title: "Memory Leak in Cache Service",
      description: "Gradual memory increase leading to OOM errors",
      rootCause: "Unreleased references in cache eviction logic",
      impact: "high",
      status: "resolved",
      timeline: ["10:15 - Anomaly detected", "10:30 - Service restarted", "11:00 - Fix deployed"],
    },
  ])

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "investigating" | "resolved">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [newIssueDescription, setNewIssueDescription] = useState("")
  const [showNewRCAForm, setShowNewRCAForm] = useState(false)

  const impactColors = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-blue-500/20 text-blue-400",
  }

  const statusColors = {
    open: "bg-gray-500/20 text-gray-400",
    investigating: "bg-yellow-500/20 text-yellow-400",
    resolved: "bg-green-500/20 text-green-400",
  }

  const handleAnalyzeIssue = async () => {
    if (!newIssueDescription.trim()) return

    setIsAnalyzing(true)
    try {
      const result = await trpc.rca.analyze.mutate({
        issue: newIssueDescription,
      })

      const newRCA: RCAItem = {
        id: Date.now().toString(),
        title: newIssueDescription.substring(0, 50) + (newIssueDescription.length > 50 ? "..." : ""),
        description: newIssueDescription,
        rootCause: result.analysis || "Analysis in progress...",
        impact: "high",
        status: "investigating",
        timeline: [
          `${new Date().toLocaleTimeString()} - Analysis started`,
          `${new Date().toLocaleTimeString()} - Pinecone search completed`,
          `${new Date().toLocaleTimeString()} - AI analysis completed`,
        ],
        analysis: result.analysis,
        logs: result.logs,
      }

      setRcaItems([newRCA, ...rcaItems])
      setNewIssueDescription("")
      setShowNewRCAForm(false)
      setExpandedId(newRCA.id)
    } catch (error) {
      console.error("Analysis failed:", error)
      alert("Failed to analyze issue. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const filteredItems = rcaItems.filter((item) => {
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Root Cause Analysis</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Track and manage incident investigations with AI-powered analysis
            </p>
          </div>
          <button
            onClick={() => setShowNewRCAForm(!showNewRCAForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New RCA</span>
          </button>
        </div>

        {showNewRCAForm && (
          <div className="mb-4 p-4 bg-secondary rounded-lg border border-border space-y-3">
            <textarea
              placeholder="Describe the issue or incident..."
              value={newIssueDescription}
              onChange={(e) => setNewIssueDescription(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground placeholder-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAnalyzeIssue}
                disabled={isAnalyzing || !newIssueDescription.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                <span className="text-sm font-medium">{isAnalyzing ? "Analyzing..." : "Analyze with AI"}</span>
              </button>
              <button
                onClick={() => {
                  setShowNewRCAForm(false)
                  setNewIssueDescription("")
                }}
                className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors border border-border text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 border border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="bg-transparent text-foreground text-sm outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* RCA List */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-muted-foreground text-sm">No incidents found</p>
              <p className="text-muted-foreground text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition-colors"
            >
              {/* Summary */}
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                      expandedId === item.id ? "rotate-180" : ""
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-semibold truncate">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${impactColors[item.impact]}`}
                  >
                    {item.impact.charAt(0).toUpperCase() + item.impact.slice(1)} Impact
                  </span>
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${statusColors[item.status]}`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === item.id && (
                <div className="border-t border-border px-6 py-4 bg-secondary space-y-4">
                  <div>
                    <h4 className="text-foreground font-semibold text-sm mb-2">Root Cause</h4>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">{item.rootCause}</p>
                  </div>

                  {item.analysis && (
                    <div>
                      <h4 className="text-foreground font-semibold text-sm mb-2">AI Analysis</h4>
                      <p className="text-muted-foreground text-sm whitespace-pre-wrap">{item.analysis}</p>
                    </div>
                  )}

                  {item.logs && item.logs.length > 0 && (
                    <div>
                      <h4 className="text-foreground font-semibold text-sm mb-2">Relevant Logs</h4>
                      <div className="space-y-2 max-h-48 overflow-auto">
                        {item.logs.map((log, idx) => (
                          <div key={idx} className="bg-background rounded p-2 text-xs font-mono text-muted-foreground">
                            <div className="text-blue-400">
                              [{log.service}] {log.level}
                            </div>
                            <div className="text-gray-400">{log.text}</div>
                            <div className="text-gray-500 text-xs mt-1">Score: {log.score?.toFixed(3)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-foreground font-semibold text-sm mb-2">Timeline</h4>
                    <div className="space-y-2">
                      {item.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          <span className="text-muted-foreground">{event}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">
                      Edit
                    </button>
                    <button className="px-3 py-2 bg-secondary text-foreground rounded text-sm font-medium hover:bg-muted transition-colors border border-border">
                      Add Note
                    </button>
                    <button className="ml-auto p-2 text-destructive hover:bg-destructive/10 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
