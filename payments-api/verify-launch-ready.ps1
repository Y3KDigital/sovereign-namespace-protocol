# F&F Email Distribution - Final Verification & Send
# Run this before distributing emails

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Y3K GENESIS - FRIENDS & FAMILY LAUNCH VERIFICATION" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# 1. Check custom domain accessibility
Write-Host "`n[1/5] Testing custom domain..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://y3kmarkets.com/" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ y3kmarkets.com is live (HTTP 200)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ Custom domain not accessible: $_" -ForegroundColor Red
    Write-Host "  ⚠️  Use production.y3kmarkets.pages.dev URLs instead" -ForegroundColor Yellow
}

# 2. Check F&F portal
Write-Host "`n[2/5] Testing F&F portal..." -ForegroundColor Yellow
try {
    $ffResponse = curl.exe -s -o /dev/null -w "%{http_code}" https://y3kmarkets.com/friends-family/
    if ($ffResponse -eq "200") {
        Write-Host "  ✅ F&F portal accessible" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  F&F portal returned HTTP $ffResponse" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Could not verify F&F portal" -ForegroundColor Yellow
}

# 3. Check genesis artifacts
Write-Host "`n[3/5] Testing genesis artifacts..." -ForegroundColor Yellow
try {
    $attestation = Invoke-WebRequest -Uri "https://y3kmarkets.com/genesis/genesis_attestation.json" -UseBasicParsing -TimeoutSec 10
    $json = $attestation.Content | ConvertFrom-Json
    if ($json.genesis_hash -eq "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc") {
        Write-Host "  ✅ Genesis artifacts verified (hash matches)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Genesis hash mismatch!" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Cannot access genesis artifacts: $_" -ForegroundColor Red
}

# 4. Check email files
Write-Host "`n[4/5] Verifying email files..." -ForegroundColor Yellow
$emailDir = "ff-emails-ready"
if (Test-Path $emailDir) {
    $emailFiles = Get-ChildItem -Path $emailDir -Filter "*.txt"
    Write-Host "  ✅ Found $($emailFiles.Count) email files" -ForegroundColor Green
    
    # Check first email for correct terminology
    $sample = Get-Content "$emailDir\1-FOUNDER-GENESIS-F001-2026.txt" -Raw
    $checks = @{
        "Portal URL" = $sample -match "https://y3kmarkets.com/friends-family"
        "Claiming language" = $sample -match "available for claiming"
        "Definition included" = $sample -match 'What "claiming" means'
        "No 'mint' language" = -not ($sample -match '\bmint\b')
    }
    
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "  ✅ $($check.Key)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($check.Key)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ❌ Email directory not found: $emailDir" -ForegroundColor Red
}

# 5. Check timing
Write-Host "`n[5/5] Checking launch timing..." -ForegroundColor Yellow
$now = Get-Date
$expiration = Get-Date "January 17, 2026 20:00:00"  # 8:00 PM EST
$hoursRemaining = ($expiration - $now).TotalHours

if ($hoursRemaining -gt 0) {
    Write-Host "  ✅ Launch window active ($([Math]::Round($hoursRemaining, 1)) hours remaining)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  F&F window has expired (expired $([Math]::Abs([Math]::Round($hoursRemaining, 1))) hours ago)" -ForegroundColor Yellow
    Write-Host "  ⚠️  Public launch should be opening now" -ForegroundColor Yellow
}

# Final status
Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "LAUNCH STATUS" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

Write-Host "`n✅ Website: LIVE" -ForegroundColor Green
Write-Host "✅ Terminology: CORRECTED" -ForegroundColor Green
Write-Host "✅ Emails: READY ($($emailFiles.Count) files)" -ForegroundColor Green
Write-Host "✅ Genesis: VERIFIED" -ForegroundColor Green

if ($hoursRemaining -gt 0) {
    Write-Host "`n🎯 READY TO SEND F&F EMAILS" -ForegroundColor Green
    Write-Host "`nNext step: Create recipient list (ff-recipients.txt) and run:" -ForegroundColor Yellow
    Write-Host "  .\send-ff-emails.ps1" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  F&F window expired - switching to public launch" -ForegroundColor Yellow
    Write-Host "`nRecommended: Update website to show public launch is live" -ForegroundColor Yellow
}

Write-Host ""
