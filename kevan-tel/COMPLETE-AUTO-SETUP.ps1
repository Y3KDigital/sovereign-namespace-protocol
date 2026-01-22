# Complete Automated Setup Script
# Run this AFTER unblocking SIM in portal

param(
    [switch]$UnblockInPortal,
    [switch]$SkipWait
)

$apiKey = "KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7"
$headers = @{ 
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$simUuid = "f648a79a-d1ba-4d61-80b0-f7dc6e396c70"
$targetNumber = "+13214858333"

Write-Host "`n╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Complete iPhone Setup Automation           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 0: Check if SIM is blocked
Write-Host "[Checking] eSIM status..." -ForegroundColor Yellow
$sim = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$simUuid" -Headers $headers

if ($sim.data.status.value -eq "blocked") {
    Write-Host "`n❌ SIM IS BLOCKED!" -ForegroundColor Red
    Write-Host "════════════════════════════════════════════" -ForegroundColor Red
    
    if ($UnblockInPortal) {
        Write-Host "`n📋 PORTAL UNBLOCK STEPS:" -ForegroundColor Cyan
        Write-Host "1. Open: https://portal.telnyx.com" -ForegroundColor White
        Write-Host "2. Click: SIM Cards (left sidebar)" -ForegroundColor White
        Write-Host "3. Find: ICCID 89311210000005749297" -ForegroundColor White
        Write-Host "4. Click: The SIM card row" -ForegroundColor White
        Write-Host "5. Click: 'Enable' or 'Unblock' button" -ForegroundColor White
        Write-Host "6. Save changes" -ForegroundColor White
        Write-Host "`n⏳ After unblocking, run this script again:`n" -ForegroundColor Cyan
        Write-Host "   .\COMPLETE-AUTO-SETUP.ps1`n" -ForegroundColor Yellow
    } else {
        Write-Host "`nRun with -UnblockInPortal flag for instructions:`n" -ForegroundColor Yellow
        Write-Host "   .\COMPLETE-AUTO-SETUP.ps1 -UnblockInPortal`n" -ForegroundColor White
    }
    
    exit 1
}

Write-Host "   ✅ SIM is not blocked (status: $($sim.data.status.value))" -ForegroundColor Green

# Step 1: Enable SIM if not enabled
if ($sim.data.status.value -ne "enabled") {
    Write-Host "`n[1/5] Enabling SIM..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$simUuid/actions/enable" `
            -Method POST -Headers $headers | Out-Null
        Write-Host "      ✅ Enabled" -ForegroundColor Green
        if (-not $SkipWait) { Start-Sleep -Seconds 3 }
    } catch {
        Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[1/5] SIM already enabled ✅" -ForegroundColor Green
}

# Step 2: Enable Voice
Write-Host "`n[2/5] Enabling voice service..." -ForegroundColor Yellow
try {
    $body = '{"voice_enabled": true}'
    Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$simUuid" `
        -Method PATCH -Headers $headers -Body $body | Out-Null
    Write-Host "      ✅ Voice enabled" -ForegroundColor Green
    if (-not $SkipWait) { Start-Sleep -Seconds 2 }
} catch {
    Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 3: Enable Data
Write-Host "`n[3/5] Enabling data service..." -ForegroundColor Yellow
try {
    $body = '{"data_enabled": true}'
    Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$simUuid" `
        -Method PATCH -Headers $headers -Body $body | Out-Null
    Write-Host "      ✅ Data enabled" -ForegroundColor Green
    if (-not $SkipWait) { Start-Sleep -Seconds 2 }
} catch {
    Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 4: Assign Phone Number
Write-Host "`n[4/5] Assigning phone number..." -ForegroundColor Yellow
try {
    $body = "{`"phone_number`": `"$targetNumber`"}"
    Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$simUuid" `
        -Method PATCH -Headers $headers -Body $body | Out-Null
    Write-Host "      ✅ Number assigned" -ForegroundColor Green
    if (-not $SkipWait) { Start-Sleep -Seconds 3 }
} catch {
    Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 5: Update Number Routing (if possible via API)
Write-Host "`n[5/5] Checking number routing..." -ForegroundColor Yellow
try {
    $num = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/phone_numbers/$targetNumber" -Headers $headers
    $currentConnection = $num.data.connection_name
    
    if ($currentConnection -ne "wireless") {
        Write-Host "      ⚠️ Number still routed to: $currentConnection" -ForegroundColor Yellow
        Write-Host "`n      Manual step required:" -ForegroundColor Cyan
        Write-Host "      1. Portal → Phone Numbers → +1-321-485-8333" -ForegroundColor White
        Write-Host "      2. Change Connection dropdown to: eSIM" -ForegroundColor White
        Write-Host "      3. Save" -ForegroundColor White
    } else {
        Write-Host "      ✅ Already routed to wireless" -ForegroundColor Green
    }
} catch {
    Write-Host "      Could not check routing" -ForegroundColor Yellow
}

# Final Verification
Write-Host "`n⏳ Verifying configuration..." -ForegroundColor Cyan
if (-not $SkipWait) { Start-Sleep -Seconds 3 }

$finalSim = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$simUuid" -Headers $headers

Write-Host "`n╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           CONFIGURATION COMPLETE              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$status = $finalSim.data.status.value
$phone = $finalSim.data.phone_number
$voice = $finalSim.data.voice_enabled
$data = $finalSim.data.data_enabled

Write-Output "  Status:       $status"
Write-Output "  Phone Number: $phone"
Write-Output "  Voice:        $voice"
Write-Output "  Data:         $data"
Write-Host ""

$allGood = ($status -eq "enabled") -and ($phone -eq $targetNumber) -and $voice -and $data

if ($allGood) {
    Write-Host "🎉 eSIM CONFIGURED!" -ForegroundColor Green
    Write-Host "`n📱 On iPhone:" -ForegroundColor Cyan
    Write-Host "   Settings → Cellular → Telnyx" -ForegroundColor White
    Write-Host "   Should show: +1 (321) 485-8333" -ForegroundColor Green
    
    Write-Host "`n📞 TEST:" -ForegroundColor Cyan
    Write-Host "   Call that number from another phone" -ForegroundColor White
    Write-Host "   iPhone should ring! 🔔`n" -ForegroundColor Green
    
} else {
    Write-Host "⚠️ Configuration incomplete:" -ForegroundColor Yellow
    if ($status -ne "enabled") { Write-Host "   - Status: $status" -ForegroundColor Red }
    if ($phone -ne $targetNumber) { Write-Host "   - Phone: $phone" -ForegroundColor Red }
    if (-not $voice) { Write-Host "   - Voice: disabled" -ForegroundColor Red }
    if (-not $data) { Write-Host "   - Data: disabled" -ForegroundColor Red }
    Write-Host ""
}
