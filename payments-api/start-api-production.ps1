# Y3K Markets - Production API Startup Script
# Starts payments-api and exposes it via Cloudflare Tunnel at api.y3kmarkets.com

Write-Host "`n=== Y3K Markets API - Production Startup ===" -ForegroundColor Cyan
Write-Host "Target: api.y3kmarkets.com`n" -ForegroundColor Cyan

# Stop any existing processes
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Get-Process payments-api -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process cloudflared -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*8081*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# Set environment variables
$env:BIND_ADDRESS = "127.0.0.1:8081"
$env:RUST_LOG = "info"

# Start API server in background
Write-Host "Starting payments-api server on port 8081..." -ForegroundColor Green
$apiProcess = Start-Process -FilePath "c:\Users\Kevan\web3 true web3 rarity\target\release\payments-api.exe" `
    -WorkingDirectory "c:\Users\Kevan\web3 true web3 rarity\payments-api" `
    -PassThru `
    -WindowStyle Normal

Write-Host "API Process ID: $($apiProcess.Id)" -ForegroundColor Cyan

# Wait for API to start
Write-Host "`nWaiting for API to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Test API health
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:8081/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ API is LIVE and responding" -ForegroundColor Green
    Write-Host "   Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API health check failed: $_" -ForegroundColor Red
    Write-Host "   Check the API window for errors" -ForegroundColor Yellow
    exit 1
}

# Start Cloudflare Tunnel
Write-Host "`nStarting Cloudflare Tunnel..." -ForegroundColor Green
Write-Host "Exposing http://127.0.0.1:8081 → https://api.y3kmarkets.com" -ForegroundColor Cyan

$tunnelProcess = Start-Process -FilePath "cloudflared" `
    -ArgumentList "tunnel", "--url", "http://127.0.0.1:8081" `
    -PassThru `
    -WindowStyle Normal

Write-Host "Tunnel Process ID: $($tunnelProcess.Id)" -ForegroundColor Cyan

# Wait for tunnel to establish
Start-Sleep -Seconds 6

Write-Host "`n✅ PRODUCTION API IS LIVE" -ForegroundColor Green
Write-Host "   Local:  http://127.0.0.1:8081/api/health" -ForegroundColor Gray
Write-Host "   Public: https://api.y3kmarkets.com/api/health" -ForegroundColor Gray
Write-Host "`nBoth windows will remain open. Close them to stop the services.`n" -ForegroundColor Yellow
