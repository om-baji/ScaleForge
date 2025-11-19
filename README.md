# Auto-Forge

Auto-Forge is a microservices-based automotive parts inventory & order management platform with production-grade observability, adaptive scaling via Kubernetes HPA, an integrated stress client, real-time cluster visualization, and an AI-assisted Root Cause Analysis (RCA) bot powered by logs + metrics + vector search.

## 📚 Table of Contents
1. Overview & Goals
2. Architecture & Services
3. Core Technologies
4. Local Development Quickstart
5. Environment Variables & Secrets
6. Kubernetes Deployment (with HPA)
7. Monitoring & Observability Stack
8. Stress Testing & Scaling Validation
9. Root Cause Analysis (AI Bot + Vector Store)
10. Kubernetes Visualization (UI + K9s + Lens)
11. CI/CD
12. Security Practices
13. Troubleshooting & Operational Runbooks
14. Roadmap / Next Steps

---
## 1. Overview & Goals
Auto-Forge demonstrates a complete operational lifecycle: build → deploy → observe → stress → diagnose → remediate. The system is designed for:
* Scalable inventory and order processing
* Rapid incident triage using AI + contextual logs
* Continuous performance verification under synthetic load
* Transparent cluster state visualization for operators

---
## 2. Architecture & Services
| Service | Purpose | Port (dev) |
|--------|---------|------------|
| Client (Next.js) | End-user product catalog, ordering & inventory visibility | 3000 |
| Admin (Next.js + tRPC) | Ops dashboard, monitoring views, RCA bot, cluster viz | 3003 |
| Inventory Service (NestJS) | Stock, product, inventory rules | 4002 (container) |
| Orders Service (NestJS) | Order lifecycle, status & history | 4001 (container) |
| Serverless Jobs | Log ingestion & vector embedding (Pinecone) | n/a |
| Webhook Service | External integrations & notifications | varies |

Supporting infrastructure: PostgreSQL, Redis, Prometheus, Loki, Grafana, (optionally) Pinecone, GROQ LLM API.

---
## 3. Core Technologies
Frontend: Next.js 14+, TypeScript, Tailwind CSS
Backend: NestJS, tRPC, Prisma
Data: PostgreSQL (relational), Redis (cache), Pinecone (vector store for logs)
Observability: Prometheus (metrics), Loki (logs), Grafana (dashboards), custom tRPC streaming
AI & RCA: GROQ API (Gemma2 model), Pinecone embeddings (log similarity), structured prompt engineering
Kubernetes: Deployments, Services (LoadBalancer), HPA (autoscaling based on CPU, memory, custom RPS metric)
Load / Stress: Built-in Node stress client, Artillery, K6

---
## 4. Local Development Quickstart
```bash
git clone https://github.com/om-baji/Auto-Forge.git
cd Auto-Forge

# Frontend / Admin / Services
cd admin && pnpm install
cd ../client && pnpm install
cd ../inventory-svc && pnpm install
cd ../orders-svc && pnpm install

# (Optional) Serverless jobs
cd ../serverless && pnpm install
```

Start selected services (example using Docker Compose if provided or individual start scripts):
```bash
docker-compose up -d   # if a compose file aggregates services
```

Then visit:
* Client: http://localhost:3000
* Admin: http://localhost:3003

---
## 5. Environment Variables & Secrets
Do NOT commit real credentials. Replace with placeholders in your local `.env` files.

Common variables (per service):
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=prefer
REDIS_URL=redis://host:6379

# AI / Vector Search (Admin + Serverless jobs)
GROQ_API_KEY=<groq-api-key>
PINECONE_API_KEY=<pinecone-api-key>          # Used in admin (simple search)
PINECONE_SECRET=<pinecone-api-key>           # Used in serverless vector job (embedding + upserts)
PINECONE_INDEX_NAME=logs-vectorized          # Default index name

# Grafana / Loki integration (serverless jobs)
GRAFANA_API_TOKEN=<grafana-api-token-with-loki-perms>
```

Vector job expects: `serverless/jobs/vector.ts` & log fetcher `serverless/jobs/inject.ts` (Loki queries). Adjust `remoteApiURL` if Loki isn’t on localhost.

Rotate API keys periodically; consider external secret managers (e.g., Vault, SOPS, Kubernetes Secrets + SealedSecrets) for production.

---
## 6. Kubernetes Deployment (with HPA)
Apply core workloads:
```bash
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/
kubectl apply -f k8s/inventory/
kubectl apply -f k8s/orders/
```

Example Deployment (`k8s/inventory/inventory.yml`):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
   name: inventory
spec:
   replicas: 2
   template:
      spec:
         containers:
            - name: inventory
               image: ombaji/inventory-svc
               resources:
                  requests:
                     cpu: 200m
                     memory: 256Mi
```

### Horizontal Pod Autoscaler
HPA uses multi-metric autoscaling (CPU, memory, and a custom per-pod Requests/Second metric):
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
   name: inventory-hpa
spec:
   scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: inventory
   minReplicas: 2
   maxReplicas: 4
   metrics:
      - type: Resource
         resource:
            name: cpu
            target:
               type: Utilization
               averageUtilization: 60
      - type: Resource
         resource:
            name: memory
            target:
               type: Utilization
               averageUtilization: 70
      - type: Pods
         pods:
            metric:
               name: http_requests_per_second
            target:
               type: AverageValue
               averageValue: "5"
```

Validate scaling:
```bash
kubectl get hpa
kubectl describe hpa inventory-hpa
```

If custom metrics aren’t appearing, ensure Prometheus Adapter or Metrics API is configured to expose `http_requests_per_second`.

### Ingress & TLS
* Configure ingress manifests (not shown here) for client/admin routes.
* Use cert-manager for automated certificate provisioning.
* Add DNS records → Ingress controller (e.g., NGINX / Traefik).

---
## 7. Monitoring & Observability Stack
Stack components (folder: `monitoring/`):
* Prometheus – scrapes service & cluster metrics
* Loki – aggregates logs; logs are queried for RCA & vectorization
* Grafana – dashboards (auto-provisioned via `grafana/provisioning/`)

Bring the stack up locally:
```bash
cd monitoring
docker-compose up -d
```

Grafana default: http://localhost:3000 (admin / admin) – CHANGE PASSWORD immediately.

Dashboards:
* `basic.json` – starter system view (extend with per-service latency & error panels)
* Create custom panels for HPA target utilization & pod replica count trends.

Logs → Vector Store Flow:
1. Application emits structured HTTP logs to Loki.
2. `serverless/jobs/inject.ts` pulls recent logs via LogQL.
3. `vector.ts` generates embeddings (Llama text embed) & upserts to Pinecone.
4. RCA service queries Pinecone (`pinecone-service.ts`) for top-k context.

Alerting ideas (add later):
* High error ratio (5xx / total req)
* Sustained p95 latency spike
* Replica flapping (oscillating scaling every minute)
* Vector search mismatch (no relevant logs for high-severity incident)

---
## 8. Stress Testing & Scaling Validation

### Built-in Kubernetes Stress Client
ConfigMap embeds a Node script (`k8s/stress-client/config.yml`) generating high RPS vs service metrics endpoints.
Deployment examples: `stress-inventory` / `stress-orders`:
```yaml
env:
   - name: SERVICE_URL
      value: "orders"
   - name: SERVICE_PORT
      value: "4001"
   - name: ENDPOINT
      value: "/metrics"
   - name: CONCURRENT
      value: "50"
   - name: DURATION
      value: "600"
```

Deploy:
```bash
kubectl apply -f k8s/stress-client/config.yml
kubectl apply -f k8s/stress-client/orders.yml
kubectl apply -f k8s/stress-client/inventory.yml
```

Watch scaling effects:
```bash
kubectl get hpa -w
kubectl top pods
```

### Artillery / K6 (optional)
```bash
artillery run load-tests/api-test.yml
k6 run k6/performance-test.js
```
Tune thresholds until HPA consistently scales before saturation (CPU or RPS crossing targets).

---
## 9. Root Cause Analysis (AI Bot + Vector Store)
RCA combines:
* User symptom description (prompt)
* Top-K semantically similar logs (Pinecone query)
* Structured AI response (GROQ Gemma2 model)

Flow:
1. Logs embedded & upserted (`vector.ts`).
2. User describes incident in Admin → RCA Analysis component.
3. `rca-service.ts` queries Pinecone, builds prompt with log context.
4. Model returns structured assessment (Root Cause, Affected Service, Severity, Fixes).
5. Result stored in in-memory list (extend with persistence later).

Chat interface (`rca-chatbot.tsx`) supports conversational follow-up across prior messages (history passed to model).

### Enabling RCA
Set required env vars in Admin & Serverless jobs:
```
GROQ_API_KEY=<key>
PINECONE_API_KEY=<key>
PINECONE_SECRET=<key>
PINECONE_INDEX_NAME=logs-vectorized
GRAFANA_API_TOKEN=<token>
```
Run vector population periodically (cron / job runner):
```bash
pnpm ts-node serverless/jobs/vector.ts   # Example invocation
```

### Suggested Prompts
* “Analyze database connection pool exhaustion”
* “Why are p95 latencies spiking during deploy?”
* “Memory leak symptoms in cache layer”

---
## 10. Kubernetes Visualization
Inside Admin dashboard, a custom canvas (`kubernetes-visualization.tsx`) renders logical relationships: Deployments → Services → Pods with animated flow lines. Features:
* Click services to open Port Forward dialog.
* Visual mental map of workloads without leaving the app.
* Complements CLI tools:
   * `k9s` for deep interactive terminal UI.
   * Lens GUI for multi-cluster introspection.

Future enhancements: live metrics overlay, pod health coloring, real-time events streaming.

---
## 11. CI/CD
GitHub Actions workflows (`.github/workflows/`):
* `ci.yml` – build, lint, test pipeline
* `cd.yml` – image build & push
* `deploy.yml` – apply k8s manifests (ensure RBAC & kubeconfig secrets configured)

Add caching (pnpm store) & vulnerability scanning (Trivy) as hardening steps.

---
## 12. Security Practices
* JWT auth & planned RBAC expansion
* Rate limiting (to be enforced at API gateway or middleware)
* TLS termination at ingress
* Regular dependency audit (e.g., `pnpm audit` + Snyk)
* Secret rotation & principle of least privilege for API tokens

---
## 13. Troubleshooting & Operational Runbooks
| Symptom | Check | Action |
|---------|-------|--------|
| HPA not scaling | `kubectl describe hpa` | Verify metrics API; inspect events |
| High latency | Grafana p95 panel | Look for CPU throttling / DB saturation |
| RCA empty logs | Pinecone query returns none | Re-run vector job; confirm Loki retention |
| Stress client errors | Pod logs (`kubectl logs`) | Adjust CONCURRENT or increase limits |
| Custom metric missing | Prometheus targets page | Ensure exporter / instrumentation deployed |

Log queries (Loki):
```logql
{app="inventory-service"} |= "ERROR"
{app="order-service"} | json | latencyMs > 500
```

---
## 14. Roadmap / Next Steps
* Persist RCA investigations (PostgreSQL table)
* Add anomaly detection (metrics delta z-score)
* Dashboard drill-down linking pods → logs → traces
* Introduce OpenTelemetry for distributed tracing
* Fine-grained RBAC & multi-tenant support
* Automated chaos experiments (Litmus / KubeMonkey)

---
## Assets
Architecture:
![Kubernetes Architecture](assets/image.png)

HPA Scaling Example:
![HPA Scaling](assets/hpa.jpg)

---
