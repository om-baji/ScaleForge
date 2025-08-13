$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up Turbo Repo..." -ForegroundColor Cyan

Set-Location service
npm install -g bun
bun install

$dirs = @(
    "apps",
    "apps/inventory-service",
    "apps/order-service",
    "apps/broker",
    "packages",
    "packages/db"
)

foreach ($dir in $dirs) {
    Write-Host "📦 Installing in $dir..." -ForegroundColor Yellow
    Push-Location $dir
    bun install
    Pop-Location
}

Write-Host "🔄 Running Prisma generate..." -ForegroundColor Magenta
Push-Location packages/db
npx prisma generate
Pop-Location

Write-Host "✅ Setup Complete" -ForegroundColor Green
