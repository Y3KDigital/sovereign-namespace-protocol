# Configure eSIM After Unblocking
# Run this AFTER Telnyx unblocks your eSIM

$ErrorActionPreference = "Continue"

$apiKey = "KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7"
$headers = @{ 
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$uuid = "f648a79a-d1ba-4d61-80b0-f7dc6e396c70"
$targetNumber = "+13214858333"

Write-Host "`n╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Configure eSIM for iPhone                  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Check current status
Write-Host "[1/5] Checking current eSIM status..." -ForegroundColor Yellow
try {
    $sim = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$uuid" -Headers $headers
    
    Write-Host "      Current Status: $($sim.data.status.value)" -ForegroundColor White
    
    if ($sim.data.status.value -eq "blocked") {
        Write-Host "`n      ❌ SIM is still BLOCKED!" -ForegroundColor Red
        Write-Host "      Please unblock it in Telnyx portal first." -ForegroundColor Yellow
        Write-Host "      See: IPHONE-STATUS-AND-FIX.md`n" -ForegroundColor Cyan
        exit 1
    }
    
} catch {
    Write-Host "      ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Enable if needed
Write-Host "`n[2/5] Ensuring SIM is enabled..." -ForegroundColor Yellow
if ($sim.data.status.value -ne "enabled") {
    try {
        Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$uuid/actions/enable" `
            -Method POST -Headers $headers | Out-Null
        Write-Host "      ✅ SIM enabled" -ForegroundColor Green
        Start-Sleep -Seconds 3
    } catch {
        Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "      ✅ Already enabled" -ForegroundColor Green
}

# Step 3: Enable voice
Write-Host "`n[3/5] Enabling voice service..." -ForegroundColor Yellow
try {
    $body = '{"voice_enabled": true}'
    Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$uuid" `
        -Method PATCH -Headers $headers -Body $body | Out-Null
    Write-Host "      ✅ Voice enabled" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 4: Enable data
Write-Host "`n[4/5] Enabling data service..." -ForegroundColor Yellow
try {
    $body = '{"data_enabled": true}'
    Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$uuid" `
        -Method PATCH -Headers $headers -Body $body | Out-Null
    Write-Host "      ✅ Data enabled" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 5: Assign phone number
Write-Host "`n[5/5] Assigning +1-321-485-8333..." -ForegroundColor Yellow
try {
    $body = "{`"phone_number`": `"$targetNumber`"}"
    Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$uuid" `
        -Method PATCH -Headers $headers -Body $body | Out-Null
    Write-Host "      ✅ Number assigned" -ForegroundColor Green
    Start-Sleep -Seconds 3
} catch {
    Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
}

# Final verification
Write-Host "`n⏳ Verifying configuration..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

$final = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$uuid" -Headers $headers

Write-Host "`n╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           FINAL CONFIGURATION                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Output "  Status:       $($final.data.status.value)"
Write-Output "  Phone Number: $($final.data.phone_number)"
Write-Output "  Voice:        $($final.data.voice_enabled)"
Write-Output "  Data:         $($final.data.data_enabled)"

Write-Host ""

# Check if everything is configured correctly
$isEnabled = $final.data.status.value -eq "enabled"
$hasNumber = $final.data.phone_number -eq $targetNumber
$hasVoice = $final.data.voice_enabled -eq $true
$hasData = $final.data.data_enabled -eq $true

if ($isEnabled -and $hasNumber -and $hasVoice -and $hasData) {
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   🎉 SUCCESS! iPhone is Ready!               ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
    
    Write-Host "`n📱 On your iPhone:" -ForegroundColor Cyan
    Write-Host "   1. Go to: Settings → Cellular" -ForegroundColor White
    Write-Host "   2. Tap on: Telnyx (your eSIM)" -ForegroundColor White
    Write-Host "   3. Should show: +1 (321) 485-8333" -ForegroundColor Green
    
    Write-Host "`n📞 TEST NOW:" -ForegroundColor Cyan
    Write-Host "   Call: +1-321-485-8333" -ForegroundColor White
    Write-Host "   From: Another phone" -ForegroundColor White
    Write-Host "   Result: Your iPhone should ring natively! 🔔" -ForegroundColor Green
    
    Write-Host "`n✅ No apps needed - works like regular cellular!`n" -ForegroundColor Green
    
} else {
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║   ⚠️  Configuration Incomplete               ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Yellow
    
    Write-Host "`nIssues detected:" -ForegroundColor Yellow
    if (-not $isEnabled) { Write-Host "   ❌ SIM not enabled" -ForegroundColor Red }
    if (-not $hasNumber) { Write-Host "   ❌ Number not assigned (showing: $($final.data.phone_number))" -ForegroundColor Red }
    if (-not $hasVoice) { Write-Host "   ❌ Voice not enabled" -ForegroundColor Red }
    if (-not $hasData) { Write-Host "   ❌ Data not enabled" -ForegroundColor Red }
    
    Write-Host "`n   Try configuring manually in Telnyx portal:" -ForegroundColor Cyan
    Write-Host "   https://portal.telnyx.com`n" -ForegroundColor White
}
