# Genesis Countdown Deployment Script
# Deploys the minimal genesis observability page to y3kmarkets.com

Write-Host "=== Y3K Genesis Countdown Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Change to website directory
Set-Location "c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web"

Write-Host "1. Building Next.js site..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build complete" -ForegroundColor Green
Write-Host ""

Write-Host "2. Deploying to Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy out --project-name=y3kmarkets --branch=main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment complete" -ForegroundColor Green
Write-Host ""

Write-Host "=== Genesis Countdown Live ===" -ForegroundColor Cyan
Write-Host "URL: https://y3kmarkets.com" -ForegroundColor White
Write-Host ""
Write-Host "Observability page active. No commerce. No CTAs." -ForegroundColor Gray
Write-Host "Countdown to: 2026-01-15T00:00:00Z" -ForegroundColor Gray
Write-Host ""
