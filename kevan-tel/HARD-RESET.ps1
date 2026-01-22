# HARD RESET - Deterministic Process Cleanup and Restart

Write-Host "`n🔴 HARD RESET - KILLING ALL PROCESSES ON PORT 3000`n" -ForegroundColor Red

# STEP 1: Find what's bound to port 3000
Write-Host "[1/5] Finding process on port 3000..." -ForegroundColor Yellow

$netstatOutput = netstat -ano | Select-String "LISTENING" | Select-String ":3000"

if ($netstatOutput) {
    Write-Host "Found processes on port 3000:" -ForegroundColor White
    $netstatOutput | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
    
    # Extract all PIDs
    $pids = $netstatOutput | ForEach-Object {
        $line = $_.ToString()
        if ($line -match '\s+(\d+)\s*$') {
            $matches[1]
        }
    }
    
    # Kill each PID
    $pids | ForEach-Object {
        $pid = $_
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "  Killing PID $pid ($($process.ProcessName))" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
        }
    }
    
    Start-Sleep -Seconds 2
    Write-Host "✅ Port 3000 cleared" -ForegroundColor Green
} else {
    Write-Host "✅ Port 3000 is already free" -ForegroundColor Green
}

# STEP 2: Verify port is free
Write-Host "`n[2/5] Verifying port 3000 is free..." -ForegroundColor Yellow

$stillBound = netstat -ano | Select-String "LISTENING" | Select-String ":3000"

if ($stillBound) {
    Write-Host "❌ PORT STILL BOUND:" -ForegroundColor Red
    $stillBound | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host "`n⚠️  MANUAL ACTION REQUIRED" -ForegroundColor Yellow
    Write-Host "Run this to force kill:" -ForegroundColor White
    $stillBound | ForEach-Object {
        $line = $_.ToString()
        if ($line -match '\s+(\d+)\s*$') {
            $pid = $matches[1]
            Write-Host "  taskkill /F /PID $pid" -ForegroundColor Gray
        }
    }
    exit 1
} else {
    Write-Host "✅ Port 3000 is FREE" -ForegroundColor Green
}

# STEP 3: Check binary exists
Write-Host "`n[3/5] Checking binary..." -ForegroundColor Yellow

$binaryPath = ".\target\release\webhook-server.exe"
if (Test-Path $binaryPath) {
    $buildTime = (Get-Item $binaryPath).LastWriteTime
    Write-Host "✅ Binary found (built: $buildTime)" -ForegroundColor Green
} else {
    Write-Host "❌ Binary not found" -ForegroundColor Red
    Write-Host "Run: cargo build --release --bin webhook-server" -ForegroundColor Yellow
    exit 1
}

# STEP 4: Verify code has dial_number
Write-Host "`n[4/5] Verifying code changes..." -ForegroundColor Yellow

$hasDialInHandler = Select-String -Path ".\src\bin\webhook-server.rs" -Pattern "dial_number.*18722548473" -Quiet

if ($hasDialInHandler) {
    Write-Host "✅ Code contains dial_number call to SIM" -ForegroundColor Green
} else {
    Write-Host "❌ Code does NOT contain dial to SIM" -ForegroundColor Red
    Write-Host "Check src/bin/webhook-server.rs" -ForegroundColor Yellow
    exit 1
}

# STEP 5: Start new server
Write-Host "`n[5/5] Starting webhook server..." -ForegroundColor Yellow
Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Gray
Write-Host "🚀 NEW SERVER STARTING - DIAL MODE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Gray
Write-Host "`nArchitecture:" -ForegroundColor Cyan
Write-Host "  +1-321-485-8333 (public)" -ForegroundColor White
Write-Host "         ↓" -ForegroundColor Gray
Write-Host "  xxxiii-voice webhook" -ForegroundColor White
Write-Host "         ↓ DIAL" -ForegroundColor Yellow
Write-Host "  +1-872-254-8473 (SIM)" -ForegroundColor Green
Write-Host "         ↓" -ForegroundColor Gray
Write-Host "  iPhone rings natively" -ForegroundColor Green
Write-Host "`nExpected logs on incoming call:" -ForegroundColor Cyan
Write-Host "  📞 Telnyx webhook received" -ForegroundColor Gray
Write-Host "  ✅ Authenticated/Allowlisted" -ForegroundColor Gray
Write-Host "  Action: Dialing SIM (+18722548473)  ← KEY LINE" -ForegroundColor Yellow
Write-Host "  ✅ Dial command sent to Telnyx" -ForegroundColor Gray
Write-Host "`nWatching for calls to +1-321-485-8333...`n" -ForegroundColor White
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Gray

.\target\release\webhook-server.exe
