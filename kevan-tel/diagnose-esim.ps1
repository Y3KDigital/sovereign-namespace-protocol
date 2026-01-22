# Complete eSIM Diagnostic and Fix Script
$ErrorActionPreference = "Stop"

$apiKey = "KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7"
$headers = @{ 
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

Write-Host "`n╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     iPhone eSIM Complete Diagnostic          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# STEP 1: Check eSIM Status
Write-Host "[1/5] Checking eSIM status..." -ForegroundColor Yellow
try {
    $sim = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297" -Headers $headers
    
    Write-Host "`n  eSIM Details:" -ForegroundColor White
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "  ICCID:        $($sim.data.sim_card_id)"
    Write-Host "  Status:       $($sim.data.status.value)" -ForegroundColor $(if($sim.data.status.value -eq "enabled"){"Green"}else{"Red"})
    Write-Host "  Phone Number: $($sim.data.phone_number)" -ForegroundColor $(if($sim.data.phone_number -eq "+13214858333"){"Green"}else{"Red"})
    Write-Host "  Voice:        $(if($sim.data.voice_enabled){"✅ Enabled"}else{"❌ Disabled"})" -ForegroundColor $(if($sim.data.voice_enabled){"Green"}else{"Red"})
    Write-Host "  Data:         $(if($sim.data.data_enabled){"✅ Enabled"}else{"❌ Disabled"})" -ForegroundColor $(if($sim.data.data_enabled){"Green"}else{"Red"})
    
    $currentNumber = $sim.data.phone_number
    $needsAssignment = $currentNumber -ne "+13214858333"
    
} catch {
    Write-Host "  ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# STEP 2: Check Phone Number
Write-Host "`n[2/5] Checking phone number +1-321-485-8333..." -ForegroundColor Yellow
try {
    $number = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/phone_numbers/+13214858333" -Headers $headers
    
    Write-Host "`n  Number Details:" -ForegroundColor White
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "  Number:       $($number.data.phone_number)"
    Write-Host "  Status:       $($number.data.status)"
    Write-Host "  Connection:   $($number.data.connection_name)"
    Write-Host "  Type:         $($number.data.connection_type)"
    
} catch {
    Write-Host "  ⚠️  Could not fetch number details: $($_.Exception.Message)" -ForegroundColor Yellow
}

# STEP 3: Fix number assignment if needed
if ($needsAssignment) {
    Write-Host "`n[3/5] ❌ PROBLEM: Number NOT assigned to eSIM!" -ForegroundColor Red
    Write-Host "  Current: $currentNumber" -ForegroundColor Yellow
    Write-Host "  Target:  +13214858333" -ForegroundColor Green
    Write-Host "`n  Attempting to fix..." -ForegroundColor Yellow
    
    $assignBody = @{ "phone_number" = "+13214858333" } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297" `
            -Method PATCH -Headers $headers -Body $assignBody
        
        Write-Host "  ✅ Assignment command sent!" -ForegroundColor Green
        
        # Verify the change
        Start-Sleep -Seconds 2
        $simVerify = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297" -Headers $headers
        
        if ($simVerify.data.phone_number -eq "+13214858333") {
            Write-Host "  ✅ VERIFIED: Number successfully assigned!" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Verification shows: $($simVerify.data.phone_number)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ❌ Assignment failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n  Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
} else {
    Write-Host "`n[3/5] ✅ Number correctly assigned to eSIM" -ForegroundColor Green
}

# STEP 4: Enable voice if needed
Write-Host "`n[4/5] Checking voice capability..." -ForegroundColor Yellow
if (-not $sim.data.voice_enabled) {
    Write-Host "  ⚠️  Voice is disabled. Enabling..." -ForegroundColor Yellow
    
    $voiceBody = @{ "voice_enabled" = $true } | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297" `
            -Method PATCH -Headers $headers -Body $voiceBody
        Write-Host "  ✅ Voice enabled!" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Could not enable voice: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ✅ Voice is enabled" -ForegroundColor Green
}

# STEP 5: Final status
Write-Host "`n[5/5] Final Configuration Check..." -ForegroundColor Yellow
$finalSim = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/89311210000005749297" -Headers $headers

Write-Host "`n╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║             FINAL STATUS                     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n  eSIM Status:     " -NoNewline
if ($finalSim.data.status.value -eq "enabled") {
    Write-Host "✅ ENABLED" -ForegroundColor Green
} else {
    Write-Host "❌ $($finalSim.data.status.value)" -ForegroundColor Red
}

Write-Host "  Phone Number:    " -NoNewline
if ($finalSim.data.phone_number -eq "+13214858333") {
    Write-Host "✅ +1-321-485-8333" -ForegroundColor Green
} else {
    Write-Host "❌ $($finalSim.data.phone_number)" -ForegroundColor Red
}

Write-Host "  Voice Enabled:   " -NoNewline
if ($finalSim.data.voice_enabled) {
    Write-Host "✅ YES" -ForegroundColor Green
} else {
    Write-Host "❌ NO" -ForegroundColor Red
}

Write-Host "  Data Enabled:    " -NoNewline
if ($finalSim.data.data_enabled) {
    Write-Host "✅ YES" -ForegroundColor Green
} else {
    Write-Host "❌ NO" -ForegroundColor Red
}

Write-Host "`n" -NoNewline
if ($finalSim.data.phone_number -eq "+13214858333" -and $finalSim.data.voice_enabled -and $finalSim.data.status.value -eq "enabled") {
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   ✅ iPhone SHOULD BE READY!                  ║" -ForegroundColor Green
    Write-Host "║                                              ║" -ForegroundColor Green
    Write-Host "║   Check your iPhone:                         ║" -ForegroundColor Green
    Write-Host "║   Settings → Cellular → Phone Number         ║" -ForegroundColor Green
    Write-Host "║   Should show: +1-321-485-8333               ║" -ForegroundColor Green
    Write-Host "║                                              ║" -ForegroundColor Green
    Write-Host "║   Test: Call +1-321-485-8333                 ║" -ForegroundColor Green
    Write-Host "║   iPhone should ring natively!               ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
} else {
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║   ⚠️  CONFIGURATION INCOMPLETE                ║" -ForegroundColor Red
    Write-Host "║                                              ║" -ForegroundColor Red
    Write-Host "║   Issues detected. Check output above.       ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Red
}

Write-Host ""
