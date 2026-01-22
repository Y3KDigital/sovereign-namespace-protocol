# Pre-Test Verification - Option A Architecture

Write-Host "`n🔍 PRE-TEST VERIFICATION`n" -ForegroundColor Cyan

$allGood = $true

# 1. Check code changes
Write-Host "[1/5] Verifying code changes..." -ForegroundColor Yellow
$hasDialMethod = Select-String -Path ".\src\telnyx_api.rs" -Pattern "pub async fn dial_number" -Quiet
$hasDialCall = Select-String -Path ".\src\bin\webhook-server.rs" -Pattern "dial_number.*18722548473" -Quiet

if ($hasDialMethod -and $hasDialCall) {
    Write-Host "   ✅ Code updated (dial_number method + webhook call)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Code changes missing" -ForegroundColor Red
    $allGood = $false
}

# 2. Check binary built
Write-Host "`n[2/5] Checking binary..." -ForegroundColor Yellow
if (Test-Path ".\target\release\webhook-server.exe") {
    $buildTime = (Get-Item ".\target\release\webhook-server.exe").LastWriteTime
    Write-Host "   ✅ Binary exists (built: $buildTime)" -ForegroundColor Green
    
    # Check if rebuild needed
    $sourceModified = (Get-Item ".\src\bin\webhook-server.rs").LastWriteTime
    if ($sourceModified -gt $buildTime) {
        Write-Host "   ⚠️  Source newer than binary - rebuild needed" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host "   ❌ Binary not found - build needed" -ForegroundColor Red
    $allGood = $false
}

# 3. Check server running
Write-Host "`n[3/5] Checking webhook server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 3
    Write-Host "   ✅ Server responding on port 3000" -ForegroundColor Green
    Write-Host "      Status: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
    
    Write-Host "   ⚠️  NOTE: Server is running OLD code" -ForegroundColor Yellow
    Write-Host "      Must restart after rebuild" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ Server not responding" -ForegroundColor Red
    Write-Host "      $_" -ForegroundColor Gray
    $allGood = $false
}

# 4. Check SIM configuration
Write-Host "`n[4/5] Verifying SIM configuration..." -ForegroundColor Yellow
$apiKey = "KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7"
$h = @{Authorization = "Bearer $apiKey"}

try {
    $sim = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/116016e3-61f6-4ed0-996a-3f6b4bdc7f0f" -Headers $h
    
    $simEnabled = $sim.data.status -eq "enabled"
    $hasCorrectMSISDN = $sim.data.phone_number -like "*8722548473"
    
    if ($simEnabled) {
        Write-Host "   ✅ SIM status: enabled" -ForegroundColor Green
    } else {
        Write-Host "   ❌ SIM status: $($sim.data.status)" -ForegroundColor Red
        $allGood = $false
    }
    
    Write-Host "   MSISDN: $($sim.data.phone_number)" -ForegroundColor Gray
    Write-Host "   ICCID: $($sim.data.iccid)" -ForegroundColor Gray
    
} catch {
    Write-Host "   ❌ Failed to check SIM: $_" -ForegroundColor Red
    $allGood = $false
}

# 5. Check number routing
Write-Host "`n[5/5] Verifying number routing..." -ForegroundColor Yellow
try {
    $num = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/phone_numbers/+13214858333" -Headers $h
    
    $routedToVoice = $num.data.connection_name -like "*voice*"
    
    if ($routedToVoice) {
        Write-Host "   ✅ +1-321-485-8333 routes to: $($num.data.connection_name)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Unexpected routing: $($num.data.connection_name)" -ForegroundColor Yellow
    }
    
    Write-Host "   Connection type: $($num.data.connection_type)" -ForegroundColor Gray
    Write-Host "   Status: $($num.data.status)" -ForegroundColor Gray
    
} catch {
    Write-Host "   ❌ Failed to check number: $_" -ForegroundColor Red
    $allGood = $false
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════" -ForegroundColor Gray
if ($allGood) {
    Write-Host "`n✅ ALL CHECKS PASSED - READY FOR REBUILD" -ForegroundColor Green
    Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "   1. cargo build --release --bin webhook-server" -ForegroundColor White
    Write-Host "   2. .\restart-webhook-server.ps1" -ForegroundColor White
    Write-Host "   3. Call +1-321-485-8333 from another phone" -ForegroundColor White
    Write-Host "   4. iPhone should ring natively!" -ForegroundColor White
} else {
    Write-Host "`n⚠️  ISSUES FOUND - FIX BEFORE TESTING" -ForegroundColor Yellow
    Write-Host "`nReview errors above and:" -ForegroundColor White
    Write-Host "   - Rebuild binary if needed" -ForegroundColor Gray
    Write-Host "   - Verify SIM enabled in portal if status wrong" -ForegroundColor Gray
    Write-Host "   - Check network connectivity if API calls failed" -ForegroundColor Gray
}
Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
