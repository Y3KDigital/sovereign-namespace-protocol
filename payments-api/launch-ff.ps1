# Y3K Genesis - Friends and Family Email Distribution
# Quick launcher script

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Y3K GENESIS - FRIENDS AND FAMILY LAUNCH" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$CODES_FILE = "FF-CODES-2026-01-16.txt"
$PORTAL_URL = "https://e087d611.y3kmarkets.pages.dev/friends-family"
$GENESIS_HASH = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"
$IPFS_CID = "bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e"

# Check codes file exists
if (-not (Test-Path $CODES_FILE)) {
    Write-Host "[ERROR] Codes file not found: $CODES_FILE" -ForegroundColor Red
    exit 1
}

# Read codes
$codes = Get-Content $CODES_FILE | Where-Object { $_ -match '^GENESIS-' }
Write-Host "[OK] Loaded $($codes.Count) access codes" -ForegroundColor Green

# Create email template
$emailTemplate = @"
Subject: Genesis Complete - Your Y3K Early Access is Live

Genesis is complete. 955 roots are now available.

Your access code: {CODE}
Portal: $PORTAL_URL
Expires: January 17, 2026 at 8:00 PM EST (24 hours)

What you get:
- 24-hour early access before public launch
- Genesis Founder badge on your certificate
- First choice of available roots (900 available)

Genesis verification:
Hash: $GENESIS_HASH
IPFS: https://ipfs.io/ipfs/$IPFS_CID

You can independently verify the ceremony artifacts on IPFS.

Questions? Reply to this email.

- Y3K Team
"@

# Create email files for manual sending
Write-Host ""
Write-Host "Creating email files for manual distribution..." -ForegroundColor Cyan

$outputDir = "ff-emails-ready"
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# Create individual email files
for ($i = 0; $i -lt $codes.Count; $i++) {
    $code = $codes[$i]
    $emailBody = $emailTemplate -replace '\{CODE\}', $code
    
    $tier = if ($code -match '-F\d+-') { "FOUNDER" } else { "EARLY" }
    $num = $i + 1
    
    $filename = "$outputDir/$num-$tier-$code.txt"
    $emailBody | Set-Content $filename -Encoding UTF8
}

Write-Host "[OK] Created $($codes.Count) email files in: $outputDir\" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Open $outputDir\ folder" -ForegroundColor White
Write-Host "2. Each file contains an email with an access code" -ForegroundColor White
Write-Host "3. Send each email to your F&F recipients" -ForegroundColor White
Write-Host "4. Portal activates at 8:00 PM EST" -ForegroundColor White
Write-Host ""
Write-Host "Portal URL: $PORTAL_URL" -ForegroundColor Cyan
Write-Host ""

# Open folder
$fullPath = (Resolve-Path $outputDir).Path
Start-Process explorer.exe $fullPath

Write-Host "[READY] Friends and Family launch materials prepared!" -ForegroundColor Green
Write-Host ""
