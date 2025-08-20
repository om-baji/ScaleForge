#!/bin/bash
set -e

echo "Starting Observability Stack..."
cd monitoring
docker compose up -d
cd ..

echo "Observability started."

echo "Starting Services..."
cd services
docker compose up -d
cd ..

echo "All services are running!"
