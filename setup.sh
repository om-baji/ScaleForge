#!/bin/bash
set -e

echo "🚀 Setting up Turbo Repo..."

cd service
npm install -g bun
bun install

dirs=(
  "apps"
  "apps/inventory-service"
  "apps/order-service"
  "apps/broker"
  "packages"
  "packages/db"
)

for dir in "${dirs[@]}"; do
  echo "📦 Installing in $dir..."
  (cd "$dir" && bun install)
done

echo "🔄 Running Prisma generate..."
(cd packages/db && npx prisma generate)

echo "✅ Setup Complete"
