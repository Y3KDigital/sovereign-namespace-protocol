# Test Webhook Server Locally
#
# Prerequisites:
# - Webhook server compiled: cargo build --release --bin webhook-server
# - Binary at: ../target/release/webhook-server.exe

Write-Host "🧪 Testing Kevan.tel.x Webhook Server" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check binary exists
$binary = "..\target\release\webhook-server.exe"
if (!(Test-Path $binary)) {
    Write-Host "❌ Binary not found: $binary" -ForegroundColor Red
    Write-Host "   Run: cargo build --release --bin webhook-server" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Binary found: $((Get-Item $binary).Length) bytes" -ForegroundColor Green

# Set environment
$env:TELNYX_API_KEY = "KEY_REDACTED"
$env:EVENT_DB_PATH = "kevan.events.db"
$env:CERT_PATH = "../kevan-resolver/certs.json"

Write-Host "`n🚀 Starting webhook server..." -ForegroundColor Cyan
Write-Host "   (Press Ctrl+C to stop)`n"

# Start server in background
$server = Start-Process -FilePath $binary -WorkingDirectory $PSScriptRoot -PassThru -NoNewWindow

# Wait for server to start
Start-Sleep -Seconds 2

try {
    # Test health endpoint
    Write-Host "📡 Testing health endpoint..." -ForegroundColor Cyan
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method GET
        if ($health.status -eq "ok") {
            Write-Host "✅ Health check passed: $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
        } else {
            Write-Host "❌ Health check failed: $($health | ConvertTo-Json)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    }

    # Test webhook endpoint (simulate Telnyx call.initiated)
    Write-Host "`n📞 Testing webhook endpoint..." -ForegroundColor Cyan
    $webhookBody = @{
        data = @{
            event_type = "call.initiated"
            id = "test_event_$(Get-Date -Format 'yyyyMMddHHmmss')"
            occurred_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            payload = @{
                call_control_id = "v3:test_call_$(Get-Random)"
                call_leg_id = "test_leg_123"
                call_session_id = "test_session_456"
                client_state = ""
                connection_id = "1234567890"
                direction = "incoming"
                from = "+15551234567"
                state = "parked"
                to = "+18886115384"
            }
            record_type = "event"
        }
        meta = @{
            attempt = 1
            delivered_to = "http://localhost:8080/webhooks/telnyx"
        }
    } | ConvertTo-Json -Depth 10

    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/webhooks/telnyx" -Method POST -Body $webhookBody -ContentType "application/json"
        Write-Host "✅ Webhook processed: $($response | ConvertTo-Json -Compress)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Webhook failed: $_" -ForegroundColor Red
    }

    # Test 404
    Write-Host "`n🚫 Testing 404..." -ForegroundColor Cyan
    try {
        $notfound = Invoke-RestMethod -Uri "http://localhost:8080/nonexistent" -Method GET
        Write-Host "❌ Should have returned 404" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "✅ 404 handled correctly" -ForegroundColor Green
        } else {
            Write-Host "❌ Unexpected error: $_" -ForegroundColor Red
        }
    }

    Write-Host "`n✅ All tests complete!" -ForegroundColor Green
    Write-Host "`n📊 Check events database:" -ForegroundColor Cyan
    Write-Host "   sqlite3 kevan.events.db `"SELECT * FROM events WHERE event_type LIKE 'tel.call_%' ORDER BY timestamp DESC LIMIT 5;`"" -ForegroundColor Yellow

    Write-Host "`n🌐 Server ready for deployment:" -ForegroundColor Cyan
    Write-Host "   Option A: cloudflared tunnel --url http://localhost:8080" -ForegroundColor Yellow
    Write-Host "   Option B: ngrok http 8080" -ForegroundColor Yellow

    Write-Host "`nPress Enter to stop server..." -ForegroundColor Cyan
    Read-Host
} finally {
    # Stop server
    Write-Host "`n🛑 Stopping server..." -ForegroundColor Cyan
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Server stopped" -ForegroundColor Green
}
