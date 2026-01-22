# Start Telnyx Webhook Server
#
# This script starts the webhook server and verifies it's running

param(
    [int]$Port = 3000
)

Write-Host "`n🚀 Kevan.tel.x Webhook Server Launcher" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Check binary exists
$binary = "..\target\release\webhook-server.exe"
if (!(Test-Path $binary)) {
    Write-Host "❌ Binary not found: $binary" -ForegroundColor Red
    Write-Host "   Run: cargo build --release --bin webhook-server" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Binary found: $((Get-Item $binary).Length) bytes`n" -ForegroundColor Green

# Kill any existing instances
Get-Process -Name "webhook-server" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Set environment
$env:TELNYX_API_KEY = "KEY_REDACTED"
$env:PORT = $Port.ToString()
$env:EVENT_DB_PATH = "kevan.events.db"
$env:CERT_PATH = "..\kevan-resolver\certs.json"

Write-Host "🔧 Configuration:" -ForegroundColor Cyan
Write-Host "   Port: $Port" -ForegroundColor White
Write-Host "   Database: kevan.events.db" -ForegroundColor White
Write-Host "   API Key: KEY019BCAD...b3T7`n" -ForegroundColor White

# Start server
Write-Host "🚀 Starting webhook server..." -ForegroundColor Cyan
$process = Start-Process -FilePath $binary -WorkingDirectory $PSScriptRoot -PassThru -NoNewWindow -RedirectStandardOutput "webhook-server.log" -RedirectStandardError "webhook-server.error.log"

# Wait for startup
Write-Host "   Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test health endpoint
Write-Host "📡 Testing health endpoint..." -ForegroundColor Cyan
$maxAttempts = 5
$attempt = 1
$success = $false

while ($attempt -le $maxAttempts -and !$success) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:$Port/health" -Method GET -TimeoutSec 2
        if ($health.status -eq "ok") {
            Write-Host "✅ Server running: $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
            $success = $true
        }
    } catch {
        if ($attempt -lt $maxAttempts) {
            Write-Host "   Attempt $attempt/$maxAttempts failed, retrying..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
        $attempt++
    }
}

if (!$success) {
    Write-Host "❌ Server failed to start" -ForegroundColor Red
    Write-Host "   Check webhook-server.error.log for details" -ForegroundColor Yellow
    $process | Stop-Process -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "`n✅ WEBHOOK SERVER OPERATIONAL" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

Write-Host "🌐 Endpoints:" -ForegroundColor Cyan
Write-Host "   Health:  GET  http://localhost:$Port/health" -ForegroundColor White
Write-Host "   Webhook: POST http://localhost:$Port/webhooks/telnyx`n" -ForegroundColor White

Write-Host "📞 Ready for calls to:" -ForegroundColor Cyan
Write-Host "   Primary: +1-770-230-0635" -ForegroundColor White
Write-Host "   Vanity:  +1-888-611-5384 (611-JEXT)" -ForegroundColor White
Write-Host "            +1-888-474-8738 (474-TREE)" -ForegroundColor White
Write-Host "            +1-888-676-2825 (676-DUCK)" -ForegroundColor White
Write-Host "   + 22 more toll-free numbers`n" -ForegroundColor White

Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Expose to internet:" -ForegroundColor White
Write-Host "      cloudflared tunnel --url http://localhost:$Port" -ForegroundColor Yellow
Write-Host "   2. Copy the public URL (https://random.trycloudflare.com)" -ForegroundColor White
Write-Host "   3. Configure Telnyx webhook:" -ForegroundColor White
Write-Host "      https://portal.telnyx.com/" -ForegroundColor Yellow
Write-Host "      → Call Control → Applications" -ForegroundColor White
Write-Host "      → Set webhook URL: https://your-url.com/webhooks/telnyx`n" -ForegroundColor Yellow

Write-Host "📊 Logs:" -ForegroundColor Cyan
Write-Host "   Output: webhook-server.log" -ForegroundColor White
Write-Host "   Errors: webhook-server.error.log`n" -ForegroundColor White

Write-Host "🛑 To stop server:" -ForegroundColor Cyan
Write-Host "   Stop-Process -Id $($process.Id) -Force`n" -ForegroundColor Yellow

Write-Host "Press Enter to tail logs (Ctrl+C to exit)..." -ForegroundColor Cyan
Read-Host

# Tail logs
Get-Content -Path "webhook-server.log" -Wait -Tail 20
