# Quick iPhone Status Check
$apiKey = "KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7"
$h = @{ "Authorization" = "Bearer $apiKey" }

$sim = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297" -Headers $h

Write-Host "`n═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   iPhone eSIM Quick Status Check" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Output "ICCID:       $($sim.data.sim_card_id)"
Write-Output "Status:      $($sim.data.status.value)"
Write-Output "Phone:       $($sim.data.phone_number)"
Write-Output "Voice:       $($sim.data.voice_enabled)"
Write-Output "Data:        $($sim.data.data_enabled)"

Write-Host "`n═══════════════════════════════════════════════" -ForegroundColor Cyan

if ($sim.data.status.value -eq "enabled" -and 
    $sim.data.phone_number -eq "+13214858333" -and
    $sim.data.voice_enabled -and
    $sim.data.data_enabled) {
    
    Write-Host "`n✅ ALL GOOD! Your iPhone should be working!" -ForegroundColor Green
    Write-Host "`nOn iPhone: Settings → Cellular → Phone Number" -ForegroundColor White
    Write-Host "Should show: +1 (321) 485-8333" -ForegroundColor Green
    Write-Host "`nTest: Call that number - iPhone should ring!`n" -ForegroundColor Cyan
    
} else {
    Write-Host "`n❌ PROBLEMS DETECTED:`n" -ForegroundColor Red
    
    if ($sim.data.status.value -ne "enabled") {
        Write-Host "   ⚠️ SIM Status: $($sim.data.status.value)" -ForegroundColor Yellow
    }
    if ($sim.data.phone_number -ne "+13214858333") {
        Write-Host "   ⚠️ Wrong Number: $($sim.data.phone_number)" -ForegroundColor Yellow
    }
    if (-not $sim.data.voice_enabled) {
        Write-Host "   ⚠️ Voice is disabled" -ForegroundColor Yellow
    }
    if (-not $sim.data.data_enabled) {
        Write-Host "   ⚠️ Data is disabled" -ForegroundColor Yellow
    }
    
    Write-Host "`n   Run: .\FIX-ESIM.ps1" -ForegroundColor Cyan
    Write-Host ""
}
