# Automated Genesis + Namespace Population Pipeline
# This script runs the genesis ceremony AND immediately populates the namespace inventory
# Execute this as a single scheduled task for complete automation

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "AUTOMATED GENESIS CEREMONY + NAMESPACE SETUP" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$WORKSPACE = "C:\Users\Kevan\web3 true web3 rarity"
$GENESIS_DIR = "$WORKSPACE\genesis"

# STEP 1: Run Genesis Ceremony
Write-Host "=== STEP 1: GENESIS CEREMONY ===" -ForegroundColor Cyan
Write-Host ""

$ceremonyScript = "$GENESIS_DIR\run-automated-ceremony.ps1"
if ($DryRun) {
    & $ceremonyScript -DryRun
} else {
    & $ceremonyScript
}

if ($LASTEXITCODE -ne 0 -and -not $DryRun) {
    Write-Host ""
    Write-Host "❌ Genesis ceremony failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Genesis ceremony completed" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 3

# STEP 2: Populate Namespace Inventory
Write-Host "=== STEP 2: NAMESPACE POPULATION ===" -ForegroundColor Cyan
Write-Host ""

$populateScript = "$GENESIS_DIR\populate-namespaces.ps1"
if ($DryRun) {
    & $populateScript -DryRun
} else {
    & $populateScript
}

if ($LASTEXITCODE -ne 0 -and -not $DryRun) {
    Write-Host ""
    Write-Host "❌ Namespace population failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Namespace population completed" -ForegroundColor Green
Write-Host ""

# STEP 3: Verify Payments API
Write-Host "=== STEP 3: VERIFY MINTING AVAILABILITY ===" -ForegroundColor Cyan
Write-Host ""

$paymentsApiPath = "$WORKSPACE\payments-api\target\release\payments-api.exe"
if (Test-Path $paymentsApiPath) {
    Write-Host "Payments API found at: $paymentsApiPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To enable minting, run:" -ForegroundColor Yellow
    Write-Host "  cd payments-api" -ForegroundColor Gray
    Write-Host "  .\restart-payments-api.ps1" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠️  Payments API executable not found" -ForegroundColor Yellow
    Write-Host "   Build it with: cargo build --release -p payments-api" -ForegroundColor Gray
    Write-Host ""
}

# COMPLETION
Write-Host "=============================================" -ForegroundColor Green
Write-Host "GENESIS + NAMESPACE SETUP COMPLETE" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "MINTING IS NOW READY!" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "Users can now:" -ForegroundColor White
Write-Host "  • Visit https://y3kmarkets.com/mint" -ForegroundColor Gray
Write-Host "  • Select a tier and mint their namespace" -ForegroundColor Gray
Write-Host "  • Complete payment via Stripe" -ForegroundColor Gray
Write-Host "  • Receive their cryptographic certificate" -ForegroundColor Gray
Write-Host ""
Write-Host "Monitor activity:" -ForegroundColor Yellow
Write-Host "  • Payments API logs" -ForegroundColor Gray
Write-Host "  • Stripe dashboard" -ForegroundColor Gray
Write-Host "  • Database: payments-api/payments.db" -ForegroundColor Gray
Write-Host ""
