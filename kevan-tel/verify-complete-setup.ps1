# Complete Setup Verification
# Run this after configuring eSIM in Telnyx Portal

$apiKey = "KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7"
$h = @{ "Authorization" = "Bearer $apiKey" }

Write-Host "`n╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Complete iPhone Setup Verification         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$uuid = "f648a79a-d1ba-4d61-80b0-f7dc6e396c70"
$targetNumber = "+13214858333"

# Check 1: eSIM Status
Write-Host "[1/3] Checking eSIM..." -ForegroundColor Yellow
try {
    $sim = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/$uuid" -Headers $h
    
    $simStatus = $sim.data.status.value
    $simPhone = $sim.data.phone_number
    $simVoice = $sim.data.voice_enabled
    $simData = $sim.data.data_enabled
    
    Write-Host "`n  eSIM Configuration:" -ForegroundColor White
    Write-Host "  ┌─────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "  │ Status:  $simStatus" -ForegroundColor $(if($simStatus -eq "enabled"){"Green"}else{"Red"})
    Write-Host "  │ Phone:   $simPhone" -ForegroundColor $(if($simPhone -eq $targetNumber){"Green"}else{"Yellow"})
    Write-Host "  │ Voice:   $simVoice" -ForegroundColor $(if($simVoice){"Green"}else{"Red"})
    Write-Host "  │ Data:    $simData" -ForegroundColor $(if($simData){"Green"}else{"Red"})
    Write-Host "  └─────────────────────────────────────" -ForegroundColor DarkGray
    
    $simOK = ($simStatus -eq "enabled") -and $simVoice -and $simData
    
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $simOK = $false
}

# Check 2: Phone Number Routing
Write-Host "`n[2/3] Checking phone number routing..." -ForegroundColor Yellow
try {
    $num = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/phone_numbers/$targetNumber" -Headers $h
    
    $numConnection = $num.data.connection_name
    $numType = $num.data.connection_type
    $numStatus = $num.data.status
    
    Write-Host "`n  Number Configuration:" -ForegroundColor White
    Write-Host "  ┌─────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "  │ Number:      $($num.data.phone_number)"
    Write-Host "  │ Status:      $numStatus" -ForegroundColor $(if($numStatus -eq "active"){"Green"}else{"Red"})
    Write-Host "  │ Connection:  $numConnection" -ForegroundColor White
    Write-Host "  │ Type:        $numType" -ForegroundColor $(if($numType -eq "wireless"){"Green"}else{"Yellow"})
    Write-Host "  └─────────────────────────────────────" -ForegroundColor DarkGray
    
    $routingOK = $numType -eq "wireless"
    
    if (-not $routingOK) {
        Write-Host "`n  ⚠️  Number is routed to '$numConnection' (not eSIM)" -ForegroundColor Yellow
        Write-Host "  In Telnyx Portal:" -ForegroundColor Cyan
        Write-Host "    1. Go to Phone Numbers" -ForegroundColor White
        Write-Host "    2. Click on +1-321-485-8333" -ForegroundColor White
        Write-Host "    3. Change Connection to your eSIM" -ForegroundColor White
    }
    
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $routingOK = $false
}

# Check 3: Overall Status
Write-Host "`n[3/3] Overall assessment..." -ForegroundColor Yellow

Write-Host "`n╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           VERIFICATION RESULTS                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "  Checklist:" -ForegroundColor White
Write-Host "  ┌─────────────────────────────────────" -ForegroundColor DarkGray

if ($simStatus -eq "enabled") {
    Write-Host "  │ ✅ eSIM is enabled" -ForegroundColor Green
} else {
    Write-Host "  │ ❌ eSIM is $simStatus" -ForegroundColor Red
}

if ($simVoice) {
    Write-Host "  │ ✅ Voice service enabled" -ForegroundColor Green
} else {
    Write-Host "  │ ❌ Voice service disabled" -ForegroundColor Red
}

if ($simData) {
    Write-Host "  │ ✅ Data service enabled" -ForegroundColor Green
} else {
    Write-Host "  │ ❌ Data service disabled" -ForegroundColor Red
}

if ($numStatus -eq "active") {
    Write-Host "  │ ✅ Phone number is active" -ForegroundColor Green
} else {
    Write-Host "  │ ❌ Phone number status: $numStatus" -ForegroundColor Red
}

if ($routingOK) {
    Write-Host "  │ ✅ Number routed to eSIM" -ForegroundColor Green
} else {
    Write-Host "  │ ❌ Number routed to: $numConnection" -ForegroundColor Red
}

Write-Host "  └─────────────────────────────────────`n" -ForegroundColor DarkGray

# Final verdict
if ($simOK -and $routingOK) {
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   🎉 ALL CONFIGURED CORRECTLY!               ║" -ForegroundColor Green
    Write-Host "║                                              ║" -ForegroundColor Green
    Write-Host "║   Your iPhone should be working now!         ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
    
    Write-Host "`n📱 On your iPhone:" -ForegroundColor Cyan
    Write-Host "   • Go to: Settings → Cellular" -ForegroundColor White
    Write-Host "   • Should show: +1 (321) 485-8333" -ForegroundColor Green
    
    Write-Host "`n📞 TEST IT:" -ForegroundColor Cyan
    Write-Host "   • Call +1-321-485-8333 from another phone" -ForegroundColor White
    Write-Host "   • Your iPhone should ring! 🔔" -ForegroundColor Green
    
    Write-Host "`n✨ Works natively - no apps needed!`n" -ForegroundColor Green
    
} elseif ($simOK -and -not $routingOK) {
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║   ⚠️  eSIM OK, but wrong routing            ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Yellow
    
    Write-Host "`n🔧 TO FIX:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://portal.telnyx.com" -ForegroundColor White
    Write-Host "   2. Navigate to: Phone Numbers" -ForegroundColor White
    Write-Host "   3. Click on: +1-321-485-8333" -ForegroundColor White
    Write-Host "   4. Change 'Connection' from '$numConnection' to your eSIM" -ForegroundColor White
    Write-Host "   5. Save changes" -ForegroundColor White
    Write-Host "   6. Run this script again to verify`n" -ForegroundColor White
    
} elseif (-not $simOK) {
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║   ❌ eSIM Configuration Issues               ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Red
    
    Write-Host "`n🔧 TO FIX:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://portal.telnyx.com" -ForegroundColor White
    Write-Host "   2. Navigate to: SIM Cards" -ForegroundColor White
    Write-Host "   3. Find ICCID: 89311210000005749297" -ForegroundColor White
    
    if ($simStatus -ne "enabled") {
        Write-Host "   4. Click 'Enable' or 'Unblock'" -ForegroundColor White
    }
    if (-not $simVoice) {
        Write-Host "   5. Enable 'Voice' service" -ForegroundColor White
    }
    if (-not $simData) {
        Write-Host "   6. Enable 'Data' service" -ForegroundColor White
    }
    
    Write-Host "   7. Save changes" -ForegroundColor White
    Write-Host "   8. Run this script again to verify`n" -ForegroundColor White
    
} else {
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║   ❌ Configuration Issues Detected           ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Red
    
    Write-Host "`nSee: COMPLETE-DIAGNOSIS.md for detailed instructions`n" -ForegroundColor Cyan
}
