#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}\nStarting Docker containers${NC}"
if ! docker compose up -d; then
  echo -e "${RED}\nDocker compose failed. Is Docker Desktop running?${NC}"
  exit 1
fi

echo -e "${GREEN}\nStarting npm app${NC}"
if ! npm run start; then
  echo -e "${RED}\nnpm start failed. Try running 'npm install' first.${NC}"
  docker compose down
  exit 1
fi

trap 'echo -e "${YELLOW}\nClosing the process${NC}"; docker compose down' EXIT
