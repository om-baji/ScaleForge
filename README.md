# Auto-Forge

Auto-Forge is a comprehensive microservices-based automotive parts inventory and order management system. It provides a scalable solution for managing automotive parts inventory, processing orders, and monitoring system performance in real-time.

## 🏗️ Architecture Overview

The system is built using a microservices architecture with the following key components:

- **Admin Service**: Dashboard and management interface for system administrators
- **Client Service**: User-facing application for inventory and order management
- **Inventory Service**: Handles inventory management and stock tracking
- **Orders Service**: Manages order processing and fulfillment
- **Serverless Functions**: Handles background jobs and async processing
- **Webhook Service**: Manages external integrations and notifications

## 🚀 Technologies Used

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: NestJS, tRPC, Prisma
- **Database**: PostgreSQL
- **Caching**: Redis
- **Monitoring**: Grafana, Prometheus, Loki
- **Container Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Load Testing**: Artillery.io, K6
- **Kubernetes Visualization**: K9s, Lens
- **Service Mesh**: Istio

## 📦 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Kubernetes cluster (for production deployment)
- pnpm (package manager)
- PostgreSQL
- Redis

## 🔧 Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/om-baji/Auto-Forge.git
   cd Auto-Forge
   ```

2. Install dependencies for all services:
   ```bash
   # Install dependencies for admin service
   cd admin && pnpm install
   
   # Install dependencies for client service
   cd ../client && pnpm install
   
   # Install dependencies for inventory service
   cd ../inventory-svc && pnpm install
   
   # Install dependencies for orders service
   cd ../orders-svc && pnpm install
   ```

3. Set up environment variables:
   - Copy the example env files for each service
   - Configure database connections and other required variables

4. Start the development environment:
   ```bash
   # Start all services using Docker Compose
   docker-compose up -d
   ```

## 🌐 Deployment

### Kubernetes Deployment

1. Configure Kubernetes cluster:
   ```bash
   # Apply Kubernetes configurations
   kubectl apply -f k8s/inventory/
   kubectl apply -f k8s/orders/
   kubectl apply -f k8s/postgres/
   kubectl apply -f k8s/redis/

   # Apply HPA configurations
   kubectl apply -f k8s/hpa/
   ```

2. Set up monitoring stack:
   ```bash
   # Deploy monitoring components
   cd monitoring
   docker-compose up -d
   ```

3. Configure Ingress and SSL:
   - Update ingress configurations in k8s manifests
   - Configure SSL certificates
   - Set up DNS records

4. Horizontal Pod Autoscaling (HPA):
   ```bash
   # View HPA status
   kubectl get hpa
   
   # Monitor scaling events
   kubectl describe hpa [hpa-name]
   ```

5. Kubernetes Visualization:
   ```bash
   # Using K9s
   k9s
   
   # Or access Lens Dashboard
   lens
   ```

The system uses HPA for automatic scaling based on metrics like CPU utilization and request count:

![Kubernetes Architecture](assets/image.png)

HPA in action during load testing shows automatic scaling of pods:

![HPA Scaling](assets/hpa.jpg)

### Monitoring Setup

1. Access Grafana dashboards:
   - Default URL: http://localhost:3000
   - Default credentials: admin/admin

2. Configure data sources:
   - Add Prometheus data source
   - Add Loki for log aggregation

3. Import dashboards:
   - System metrics dashboard
   - Service-specific dashboards
   - Custom metrics dashboards

## 🔍 Microservices Details

### Inventory Service
- **Port**: 3001
- **Responsibilities**:
  - Inventory management
  - Stock level tracking
  - Product information
  - Inventory alerts
- **API Documentation**: Available at `/api/docs` when running locally

### Orders Service
- **Port**: 3002
- **Responsibilities**:
  - Order processing
  - Order status management
  - Order history
  - Payment integration
- **API Documentation**: Available at `/api/docs` when running locally

### Admin Dashboard
- **Port**: 3003
- **Features**:
  - System monitoring
  - User management
  - Configuration management
  - Analytics dashboard

### Client Application
- **Port**: 3000
- **Features**:
  - Product catalog
  - Order management
  - Inventory status
  - Real-time notifications

## 📊 Monitoring and Observability

### Metrics Collection
- System metrics via Prometheus
- Custom business metrics
- Service-level indicators (SLIs)
- Service-level objectives (SLOs)
- HPA metrics tracking
- Real-time pod scaling metrics

### Logging
- Centralized logging with Loki
- Log aggregation and searching
- Error tracking and alerting
- Stress test logs analysis
- Performance bottleneck identification

### Alerting
- Alert configuration in Grafana
- Integration with notification channels
- Custom alert rules and thresholds
- Scaling event notifications
- Performance degradation alerts

### Load Testing and Performance
- Artillery.io for API endpoint stress testing
- K6 for performance benchmarking
- Stress test scenarios:
  ```bash
  # Run API stress test
  artillery run load-tests/api-test.yml
  
  # Run K6 performance test
  k6 run k6/performance-test.js
  ```
- Automatic scaling validation
- Performance metrics collection

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting
- Data encryption at rest and in transit
- Regular security updates