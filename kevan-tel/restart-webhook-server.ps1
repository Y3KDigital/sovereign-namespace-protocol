# Restart Webhook Server with Updated Code

Write-Host "`n🔄 RESTARTING WEBHOOK SERVER...`n" -ForegroundColor Cyan

# Step 1: Kill old server
Write-Host "[1/4] Stopping old webhook server..." -ForegroundColor Yellow
$webhookProcesses = Get-Process | Where-Object {
    $_.ProcessName -like '*webhook*' -or
    ($_.MainWindowTitle -like '*webhook*') -or
    ($_.CommandLine -like '*webhook-server*')
}

if ($webhookProcesses) {
    $webhookProcesses | ForEach-Object {
        Write-Host "   Killing PID $($_.Id): $($_.ProcessName)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force
    }
    Write-Host "✅ Old server stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No old server found" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Step 2: Verify binary exists
Write-Host "`n[2/4] Checking binary..." -ForegroundColor Yellow
$binaryPath = ".\target\release\webhook-server.exe"

if (Test-Path $binaryPath) {
    $buildTime = (Get-Item $binaryPath).LastWriteTime
    Write-Host "✅ Binary found (built: $buildTime)" -ForegroundColor Green
} else {
    Write-Host "❌ Binary not found - run cargo build first" -ForegroundColor Red
    exit 1
}

# Step 3: Start new server
Write-Host "`n[3/4] Starting webhook server..." -ForegroundColor Yellow

# Start in new window so logs are visible
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'c:\Users\Kevan\web3 true web3 rarity\kevan-tel'; Write-Host '🚀 WEBHOOK SERVER - DIAL MODE' -ForegroundColor Green; Write-Host '   Architecture: +1-321-485-8333 → xxxiii-voice → DIAL → +1-872-254-8473 (SIM)' -ForegroundColor Cyan; Write-Host ''; .\target\release\webhook-server.exe"
)

Write-Host "✅ Server started in new window" -ForegroundColor Green

Start-Sleep -Seconds 3

# Step 4: Health check
Write-Host "`n[4/4] Testing server health..." -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Server responding: $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
    
    Write-Host "`n🎯 SERVER READY FOR TESTING" -ForegroundColor Green
    Write-Host "`n📞 Test by calling: +1-321-485-8333" -ForegroundColor Cyan
    Write-Host "   Expected: iPhone rings natively via SIM" -ForegroundColor White
    Write-Host "`n📋 Watch server window for logs:" -ForegroundColor Cyan
    Write-Host "   - 📞 Telnyx webhook received" -ForegroundColor Gray
    Write-Host "   - ✅ Authenticated/Allowlisted" -ForegroundColor Gray
    Write-Host "   - ✅ Dial command sent to Telnyx" -ForegroundColor Gray
    Write-Host "   - (iPhone should ring)" -ForegroundColor Gray
    
} catch {
    Write-Host "⚠️  Health check failed: $_" -ForegroundColor Yellow
    Write-Host "   Server may still be starting..." -ForegroundColor Gray
    Write-Host "   Check the new PowerShell window for errors" -ForegroundColor Gray
}

Write-Host ""
