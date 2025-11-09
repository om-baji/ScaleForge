#!/bin/bash

# Kubernetes Data Stream Script
# This script continuously streams Kubernetes cluster data in JSON format
# Pipe this to your visualization app via WebSocket or HTTP

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Kubernetes Data Stream...${NC}"

while true; do
  # Get all Kubernetes resources and format as JSON
  TIMESTAMP=$(date +%s%N)
  
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} Streaming cluster data..."
  
  # Convert kubectl output to JSON
  kubectl get all -o json | jq '{
    timestamp: '${TIMESTAMP}',
    pods: [.items[] | select(.kind=="Pod") | {
      name: .metadata.name,
      namespace: .metadata.namespace,
      status: .status.phase,
      ready: (.status.containerStatuses | map(select(.ready) | 1) | length),
      totalContainers: (.status.containerStatuses | length),
      restarts: (.status.containerStatuses[0].restartCount // 0),
      creationTime: .metadata.creationTimestamp
    }],
    services: [.items[] | select(.kind=="Service") | {
      name: .metadata.name,
      namespace: .metadata.namespace,
      type: .spec.type,
      clusterIP: .spec.clusterIP,
      externalIP: (.spec.externalIPs[0] // "none"),
      ports: (.spec.ports | map(.port) | @csv)
    }],
    deployments: [.items[] | select(.kind=="Deployment") | {
      name: .metadata.name,
      namespace: .metadata.namespace,
      replicas: .spec.replicas,
      ready: .status.readyReplicas,
      available: .status.availableReplicas,
      creationTime: .metadata.creationTimestamp
    }]
  }'
  
  # Wait 2 seconds before next update
  sleep 2
done
