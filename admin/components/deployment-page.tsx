"use client"

import { useState } from "react"
import { Upload, Loader2, CheckCircle, AlertCircle, Plus, Trash2 } from "lucide-react"
import { trpc } from "@/lib/trpc-client"

interface Service {
  id: string
  dockerImage: string
  ec2Host: string
  containerPort: number
  hostPort: number
  sshKey: string
  envVars: Record<string, string>
}

type DeploymentStrategy = "simple" | "blue-green" | "canary"

export function DeploymentPage() {
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      dockerImage: "",
      ec2Host: "",
      containerPort: 3000,
      hostPort: 3000,
      sshKey: "",
      envVars: {},
    },
  ])
  const [deploymentStrategy, setDeploymentStrategy] = useState<DeploymentStrategy>("simple")
  const [canaryPercentage, setCanaryPercentage] = useState(10)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<any>(null)
  const [expandedService, setExpandedService] = useState<string>("1")
  const [envKey, setEnvKey] = useState<Record<string, string>>({})
  const [envValue, setEnvValue] = useState<Record<string, string>>({})

  const addService = () => {
    const newId = String(Math.max(...services.map((s) => Number.parseInt(s.id)), 0) + 1)
    setServices([
      ...services,
      {
        id: newId,
        dockerImage: "",
        ec2Host: "",
        containerPort: 3000,
        hostPort: 3000,
        sshKey: "",
        envVars: {},
      },
    ])
    setExpandedService(newId)
  }

  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter((s) => s.id !== id))
    }
  }

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(services.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const handleAddEnvVar = (serviceId: string) => {
    const key = envKey[serviceId] || ""
    const value = envValue[serviceId] || ""
    if (key && value) {
      const service = services.find((s) => s.id === serviceId)
      if (service) {
        updateService(serviceId, {
          envVars: { ...service.envVars, [key]: value },
        })
        setEnvKey({ ...envKey, [serviceId]: "" })
        setEnvValue({ ...envValue, [serviceId]: "" })
      }
    }
  }

  const handleRemoveEnvVar = (serviceId: string, key: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      const newVars = { ...service.envVars }
      delete newVars[key]
      updateService(serviceId, { envVars: newVars })
    }
  }

  const handleDeploy = async () => {
    const allValid = services.every((s) => s.dockerImage && s.ec2Host && s.sshKey)
    if (!allValid) {
      alert("Please fill in all required fields for all services")
      return
    }

    setIsDeploying(true)
    try {
      const result = await trpc.deployment.deployMultiple.mutate({
        services: services.map((s) => ({
          dockerImage: s.dockerImage,
          ec2Host: s.ec2Host,
          sshKey: s.sshKey,
          envVars: s.envVars,
          containerPort: s.containerPort,
          hostPort: s.hostPort,
        })),
        strategy: deploymentStrategy,
        canaryPercentage: deploymentStrategy === "canary" ? canaryPercentage : undefined,
      })
      setDeploymentResult(result)
    } catch (error) {
      setDeploymentResult({
        success: false,
        message: error instanceof Error ? error.message : "Deployment failed",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Deploy to EC2</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Deploy Docker containers to your EC2 instances with multiple services and deployment strategies
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl space-y-6">
          {/* Deployment Strategy Selection */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Deployment Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["simple", "blue-green", "canary"] as const).map((strategy) => (
                <button
                  key={strategy}
                  onClick={() => setDeploymentStrategy(strategy)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    deploymentStrategy === strategy
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium text-foreground capitalize">{strategy.replace("-", " ")}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {strategy === "simple" && "Direct replacement deployment"}
                    {strategy === "blue-green" && "Zero-downtime with rollback"}
                    {strategy === "canary" && "Gradual rollout with monitoring"}
                  </div>
                </button>
              ))}
            </div>

            {/* Canary Percentage Slider */}
            {deploymentStrategy === "canary" && (
              <div className="space-y-2 pt-4 border-t border-border">
                <label className="text-sm font-medium text-foreground">
                  Canary Traffic Percentage: {canaryPercentage}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={canaryPercentage}
                  onChange={(e) => setCanaryPercentage(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Percentage of traffic to route to new version</p>
              </div>
            )}
          </div>

          {/* Services */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Services ({services.length})</h3>
              <button
                onClick={addService}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            {services.map((service, index) => (
              <div key={service.id} className="bg-card border border-border rounded-lg overflow-hidden">
                {/* Service Header */}
                <button
                  onClick={() => setExpandedService(expandedService === service.id ? "" : service.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors border-b border-border"
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold text-foreground">
                      Service {index + 1}
                      {service.dockerImage && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({service.dockerImage.split("/").pop()})
                        </span>
                      )}
                    </div>
                    {service.ec2Host && <div className="text-xs text-muted-foreground mt-1">{service.ec2Host}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    {services.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeService(service.id)
                        }}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </button>

                {/* Service Details */}
                {expandedService === service.id && (
                  <div className="px-6 py-4 space-y-6 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Docker Image */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Docker Image *</label>
                        <input
                          type="text"
                          placeholder="myregistry/myapp:v1.0.0"
                          value={service.dockerImage}
                          onChange={(e) => updateService(service.id, { dockerImage: e.target.value })}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                          Full Docker image URI including registry and tag
                        </p>
                      </div>

                      {/* EC2 Host */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">EC2 Host *</label>
                        <input
                          type="text"
                          placeholder="ec2-52-1-2-3.compute-1.amazonaws.com"
                          value={service.ec2Host}
                          onChange={(e) => updateService(service.id, { ec2Host: e.target.value })}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground">EC2 instance hostname or IP address</p>
                      </div>

                      {/* Container Port */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Container Port</label>
                        <input
                          type="number"
                          value={service.containerPort}
                          onChange={(e) => updateService(service.id, { containerPort: Number(e.target.value) })}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground">Port exposed by the container</p>
                      </div>

                      {/* Host Port */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Host Port</label>
                        <input
                          type="number"
                          value={service.hostPort}
                          onChange={(e) => updateService(service.id, { hostPort: Number(e.target.value) })}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground">Port to expose on the EC2 instance</p>
                      </div>
                    </div>

                    {/* SSH Key */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">SSH Private Key *</label>
                      <textarea
                        placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                        value={service.sshKey}
                        onChange={(e) => updateService(service.id, { sshKey: e.target.value })}
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                        rows={6}
                      />
                      <p className="text-xs text-muted-foreground">Your EC2 instance SSH private key (PEM format)</p>
                    </div>

                    {/* Environment Variables */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Environment Variables</label>
                      <div className="space-y-2">
                        {Object.entries(service.envVars).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-2 p-3 bg-secondary rounded-lg border border-border"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-mono text-foreground truncate">
                                {key}={value}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveEnvVar(service.id, key)}
                              className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Variable name"
                          value={envKey[service.id] || ""}
                          onChange={(e) => setEnvKey({ ...envKey, [service.id]: e.target.value })}
                          className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="Variable value"
                          value={envValue[service.id] || ""}
                          onChange={(e) => setEnvValue({ ...envValue, [service.id]: e.target.value })}
                          className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={() => handleAddEnvVar(service.id)}
                          className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors border border-border text-sm font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Deploy Button */}
          <button
            onClick={handleDeploy}
            disabled={isDeploying || services.some((s) => !s.dockerImage || !s.ec2Host || !s.sshKey)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Deploy All Services
              </>
            )}
          </button>

          {/* Deployment Result */}
          {deploymentResult && (
            <div
              className={`border rounded-lg p-6 ${
                deploymentResult.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {deploymentResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold ${deploymentResult.success ? "text-green-400" : "text-red-400"}`}>
                    {deploymentResult.message}
                  </h3>
                  {deploymentResult.logs && (
                    <div className="mt-3 bg-background rounded p-3 max-h-48 overflow-auto">
                      <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
                        {deploymentResult.logs}
                      </pre>
                    </div>
                  )}
                  {deploymentResult.timestamp && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(deploymentResult.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Deployment History */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Deployments</h3>
            <div className="space-y-3">
              <div className="p-4 bg-secondary rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-foreground font-medium text-sm">myapp:v1.0.0</p>
                    <p className="text-muted-foreground text-xs">ec2-52-1-2-3.compute-1.amazonaws.com</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">Success</span>
                </div>
                <p className="text-muted-foreground text-xs">1 day ago</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-foreground font-medium text-sm">myapp:v0.9.0</p>
                    <p className="text-muted-foreground text-xs">ec2-52-1-2-3.compute-1.amazonaws.com</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">Success</span>
                </div>
                <p className="text-muted-foreground text-xs">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
