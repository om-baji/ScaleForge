# Cloud Computing Course Project

A comprehensive monitoring and observability project built with Node.js, Express, Prometheus, Grafana, and Loki for metrics collection, visualization, and logging.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Monitoring & Observability](#monitoring--observability)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🚀 Overview

This project demonstrates a complete observability stack for a Node.js application with:

- **Express.js API** - Main application with sample endpoints
- **Prometheus** - Metrics collection and storage
- **Grafana** - Data visualization and dashboards
- **Loki** - Log aggregation and storage
- **Winston** - Application logging with Loki integration

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express App   │────│   Prometheus    │────│    Grafana      │
│   (Port 5000)   │    │   (Port 9090)   │    │   (Port 3000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         │              ┌─────────────────┐             │
         └──────────────│      Loki       │─────────────┘
                        │   (Port 3100)   │
                        └─────────────────┘
```

## 📋 Prerequisites

You can follow the steps or just run

```bash
./start.ps1
```

Make sure you have the following installed on your system:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Docker** (v20 or higher)
- **Docker Compose** (v1.27 or higher)
- **Git**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Javaboiiii/Cloud-Computing-Course-project.git
cd Cloud-Computing-Course-project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

The project uses a `.env` file for configuration. The default configuration is:

```env
PORT=5000
```

## ⚙️ Configuration

### Prometheus Configuration

The `prometheus.yml` file configures Prometheus to scrape metrics from your application:

```yaml
global: 
  scrape_interval: 4s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['192.168.1.9:5000']  # Update this IP to your machine's IP
```

**Important**: Update the target IP address in `prometheus.yml` to match your machine's local IP address.

### Docker Compose Services

The `docker-compose.yaml` sets up the following services:

- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3000`
- **Loki**: `http://localhost:3100`

## 🚦 Running the Project

### Method 1: Full Stack with Docker Compose (Recommended)

1. **Start the monitoring stack:**
   ```bash
   docker-compose up -d
   ```

2. **Start the Node.js application:**
   ```bash
   npm start
   ```

### Method 2: Individual Services

1. **Start monitoring services:**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Or start individual services
   docker-compose up -d prom-server
   docker-compose up -d grafana
   docker-compose up -d loki
   ```

2. **Start the application:**
   ```bash
   # Development mode with nodemon
   npm start
   
   # Or directly with node
   node app.js
   ```

### Stopping Services

```bash
# Stop the application (Ctrl+C if running in foreground)

# Stop Docker services
docker-compose down
```

## 🔗 API Endpoints

### Application Endpoints

| Endpoint | Method | Description | Response Time |
|----------|---------|-------------|---------------|
| `/` | GET | Health check endpoint | Instant |
| `/slow` | GET | Simulated slow endpoint with random failures | 2 seconds |
| `/metrics` | GET | Prometheus metrics endpoint | Instant |

### Example Requests

```bash
# Health check
curl http://localhost:5000/

# Slow endpoint (may fail randomly)
curl http://localhost:5000/slow

# Metrics for Prometheus
curl http://localhost:5000/metrics
```

## 📊 Monitoring & Observability

### Accessing Services

1. **Grafana Dashboard**: http://localhost:3000
   - Default credentials: `admin` / `admin`
   - Configure Prometheus datasource: `http://prom-server:9090`
   - Configure Loki datasource: `http://loki:3100`

2. **Prometheus**: http://localhost:9090
   - Query metrics and explore targets
   - Check target health at: http://localhost:9090/targets

3. **Application**: http://localhost:5000
   - Main API endpoints
   - Metrics endpoint for Prometheus scraping

### Setting up Grafana

1. **Login to Grafana** (admin/admin)
2. **Add Prometheus Datasource:**
   - Go to Configuration → Data Sources
   - Add Prometheus: `http://prom-server:9090`
3. **Add Loki Datasource:**
   - Add Loki: `http://loki:3100`
4. **Create Dashboards** for your metrics and logs

### Key Metrics Available

- Node.js default metrics (CPU, memory, event loop, etc.)
- HTTP request metrics
- Custom application metrics
- Application logs via Loki

## 📁 Project Structure

```
├── app.js                 # Main Express application
├── prom_client.js         # Prometheus client configuration
├── loki.js               # Winston + Loki logging setup
├── package.json          # Node.js dependencies and scripts
├── docker-compose.yaml   # Docker services configuration
├── prometheus.yml        # Prometheus scraping configuration
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Refused Errors:**
   - Ensure Docker services are running: `docker-compose ps`
   - Check if ports are available: `netstat -an | findstr "3000\|9090\|3100\|5000"`

2. **Prometheus Can't Scrape Metrics:**
   - Update the IP address in `prometheus.yml` to your machine's local IP
   - Ensure the Node.js app is running on the specified IP and port
   - Check Prometheus targets: http://localhost:9090/targets

3. **Application Won't Start:**
   ```bash
   # Check if port 5000 is already in use
   netstat -an | findstr "5000"
   
   # Kill process using port 5000 (if needed)
   # Find PID and kill it
   ```

4. **Docker Issues:**
   ```bash
   # Restart Docker services
   docker-compose down
   docker-compose up -d
   
   # Check service logs
   docker-compose logs [service-name]
   ```

### Useful Commands

```bash
# Check running containers
docker ps

# View logs for specific service
docker-compose logs grafana
docker-compose logs prom-server
docker-compose logs loki

# Restart specific service
docker-compose restart grafana

# Clean up everything
docker-compose down -v
docker system prune -f
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Prometheus for metrics collection
- Grafana for visualization
- Loki for log aggregation
- Express.js for the web framework
- Winston for logging

---

**Happy Monitoring!** 🚀

For any issues or questions, please open an issue on the [GitHub repository](https://github.com/Javaboiiii/Cloud-Computing-Course-project/issues).
