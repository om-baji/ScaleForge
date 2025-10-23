# 🚀 Auto-Forge

**Auto-Forge** is a full-stack, microservices-driven automation platform built with **NestJS**, **Next.js**, and **AWS serverless components**.
It enables complete lifecycle management for **Inventory** and **Order** systems — from front-end dashboards to backend monitoring, intelligent log analysis, and automated deployments.

---

## 🧩 Architecture Overview

The platform is composed of multiple independent modules:

| Module                 | Description                                                                                                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **client/**            | Next.js web application for managing Inventory and Orders.                                                                                                                                                                       |
| **admin/**             | Next.js Admin Dashboard for DevOps and SRE teams with:<br> - Root Cause Analysis Chatbot (using Loki logs)<br> - Blue-Green & Canary Deployment controls for EC2 services<br> - Service monitoring and deployment status panels. |
| **server/**            | Core backend built with **NestJS microservices** managing Inventory, Orders, and inter-service messaging.                                                                                                                        |
| **monitoring/**        | Complete observability stack with **Grafana**, **Prometheus**, and **Loki** via Docker Compose and YAML manifests.                                                                                                               |
| **serverless/**        | AWS Lambda function that streams Loki logs to **S3** and **Pinecone** for vector-based log intelligence.                                                                                                                         |
| **webhook/**           | Lambda-based webhook that syncs user data from **AWS Cognito** into internal databases/services.                                                                                                                                 |
| **.github/workflows/** | GitHub Actions workflows for CI/CD pipelines and automatic EC2 deployments.                                                                                                                                                      |

---

## ⚙️ Tech Stack

### Frontend

* **Next.js 15**
* **TypeScript**
* **tRPC**
* **TailwindCSS / Shad CN**

### Backend

* **NestJS Microservices**

  * Handles Inventory and Orders services.
  * Communicates via message brokers (e.g., Redis / NATS / RabbitMQ).

### Monitoring

* **Grafana** dashboards for real-time metrics.
* **Prometheus** for metrics collection.
* **Loki** for centralized logging.
* **Root Cause Chatbot** powered by Pinecone + OpenAI API.

### Cloud & Serverless

* **AWS Lambda** for serverless processing.
* **S3** for log archival.
* **Pinecone Vector DB** for semantic search on logs.
* **AWS Cognito** for user identity management.
* **EC2 Blue-Green and Canary Deployments** integrated with GitHub Actions.

---

## 🏗️ Repository Structure

```
Auto-Forge/
├── .github/
│   └── workflows/        # CI/CD pipelines & EC2 auto-deploy flows
├── admin/                # Next.js Admin Dashboard
├── client/               # Next.js Inventory & Orders Website
├── monitoring/           # Grafana + Prometheus + Loki setup
├── server/               # NestJS Microservices (Inventory & Orders)
├── serverless/           # AWS Lambda for Loki → S3/Pinecone
├── webhook/              # AWS Cognito → Internal system sync
├── .gitignore
└── README.md
```

---

## 🧠 Features

### 🧾 Inventory & Orders

* Manage inventory lifecycle and order processing.
* Real-time synchronization between services using NestJS microservices.

### 🧑‍💼 Admin Dashboard

* Visualize deployments and service health.
* Launch Blue-Green or Canary deployments from UI.
* Root Cause Chatbot — query historical logs from Loki, backed by Pinecone embeddings.

### 🔍 Observability

* Centralized monitoring via Grafana + Prometheus + Loki stack.
* Auto-provisioned dashboards and alerts.
* Metrics and logs exported to S3.

### ☁️ Serverless Intelligence

* Lambda collects and indexes logs in Pinecone for semantic debugging.
* Webhook auto-populates Cognito user changes to internal DBs.

### 🚀 CI/CD & Deployment

* GitHub Actions automate:

  * Build → Test → Deploy cycles.
  * Blue-Green and Canary rollout on EC2.
  * Infrastructure provisioning and rollback mechanisms.

---

## 🧰 Setup Instructions

### Prerequisites

* Node.js ≥ 18
* Docker & Docker Compose
* AWS credentials configured (`aws configure`)
* Pinecone API key
* OpenAI API key (for chatbot)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/Auto-Forge.git
cd Auto-Forge
```

### 2. Start Monitoring Stack

```bash
cd monitoring
docker-compose up -d
```

### 3. Start Backend (NestJS)

```bash
cd server
npm install
npm run start:dev
```

### 4. Start Client Applications

```bash
cd client
npm install
npm run dev

cd ../admin
npm install
npm run dev
```

### 5. Deploy Serverless Functions

Deploy using AWS SAM or the Serverless Framework:

```bash
cd serverless
sls deploy
```

---

## 📈 Monitoring & RCA Chatbot

1. Access Grafana at `http://localhost:3000`
2. Loki, Prometheus, and alerting dashboards auto-provisioned.
3. Use the **RCA Chatbot** in the Admin panel to query issues semantically:

   * Example: *"Why did the EC2 deployment fail yesterday?"*

---

## 🔄 CI/CD Workflows

* Located under `.github/workflows/`
* Includes:

  * **Build & Test**: Runs linting, tests, and build for all services.
  * **Deploy to EC2**: Blue-Green and Canary deployment strategy.
  * **Serverless Deployment**: Lambda updates and rollbacks.
  * **Monitor & Alert**: Triggered on failed deployments or high error rates.

---

## 🧭 Future Roadmap

* ✅ Add distributed tracing with OpenTelemetry
* ✅ Expand RCA Chatbot with multi-source log enrichment
* 🔲 Introduce Kubernetes Helm charts for easier deployments
* 🔲 Add fine-grained role-based access control (RBAC) in Admin panel

---

## 📜 License

MIT © 2025 — **Auto-Forge Dev Team**

---
