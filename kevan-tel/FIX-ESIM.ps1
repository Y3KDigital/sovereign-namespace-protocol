# Fix All eSIM Issues
$ErrorActionPreference = "Continue"

$apiKey = "KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7"
$h = @{ 
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

Write-Host "`n🔧 FIXING iPhone eSIM CONFIGURATION...`n" -ForegroundColor Yellow

# Fix 1: Enable SIM
Write-Host "[1/4] Enabling SIM..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297/actions/enable" `
        -Method POST -Headers $h | Out-Null
    Write-Host "      ✅ SIM enabled" -ForegroundColor Green
} catch {
    Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
}
Start-Sleep -Seconds 2

# Fix 2: Enable Voice
Write-Host "[2/4] Enabling voice..." -ForegroundColor Cyan
try {
    $body = '{"voice_enabled": true}'
    Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297" `
        -Method PATCH -Headers $h -Body $body | Out-Null
    Write-Host "      ✅ Voice enabled" -ForegroundColor Green
} catch {
    Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
}
Start-Sleep -Seconds 2

# Fix 3: Enable Data
Write-Host "[3/4] Enabling data..." -ForegroundColor Cyan
try {
    $body = '{"data_enabled": true}'
    Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297" `
        -Method PATCH -Headers $h -Body $body | Out-Null
    Write-Host "      ✅ Data enabled" -ForegroundColor Green
} catch {
    Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
}
Start-Sleep -Seconds 2

# Fix 4: Assign Phone Number
Write-Host "[4/4] Assigning +1-321-485-8333..." -ForegroundColor Cyan
try {
    $body = '{"phone_number": "+13214858333"}'
    Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297" `
        -Method PATCH -Headers $h -Body $body | Out-Null
    Write-Host "      ✅ Number assigned" -ForegroundColor Green
} catch {
    Write-Host "      ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n⏳ Waiting for changes to propagate..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verify
Write-Host "`n✅ VERIFICATION:" -ForegroundColor Green
$sim = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297" -Headers $h

Write-Output "`nStatus:      $($sim.data.status.value)"
Write-Output "Phone:       $($sim.data.phone_number)"
Write-Output "Voice:       $($sim.data.voice_enabled)"
Write-Output "Data:        $($sim.data.data_enabled)"

if ($sim.data.status.value -eq "enabled" -and 
    $sim.data.phone_number -eq "+13214858333" -and
    $sim.data.voice_enabled -and
    $sim.data.data_enabled) {
    
    Write-Host "`n🎉 ALL FIXED!" -ForegroundColor Green
    Write-Host "`n📱 Check iPhone: Settings → Cellular" -ForegroundColor Cyan
    Write-Host "Should show: +1 (321) 485-8333" -ForegroundColor White
    Write-Host "`n📞 Test: Call that number from another phone`n" -ForegroundColor Cyan
    
} else {
    Write-Host "`n⚠️ Some issues may remain. Contact Telnyx support." -ForegroundColor Yellow
}
