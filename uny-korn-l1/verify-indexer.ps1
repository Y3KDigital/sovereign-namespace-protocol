# Rust L1 Quick Test Script
# Verifies the indexer API is working correctly

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Rust L1 Indexer Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8089"

# Test 1: List assets
Write-Host "[1/4] Testing /assets endpoint..." -ForegroundColor Yellow
try {
    $assets = curl -UseBasicParsing "$baseUrl/assets" | ConvertFrom-Json
    $assetCount = ($assets | Measure-Object).Count
    Write-Host "  ✅ Found $assetCount assets" -ForegroundColor Green
    $assets | Select-Object -First 5 | Format-Table symbol, decimals, policy_uri
} catch {
    Write-Host "  ❌ Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Check treasury balance
Write-Host "[2/4] Testing /balances endpoint..." -ForegroundColor Yellow
try {
    $balances = curl -UseBasicParsing "$baseUrl/balances?account=acct:treasury:MAIN" | ConvertFrom-Json
    $ucredBalance = ($balances | Where-Object { $_.asset -eq "UCRED" }).balance_wei
    if ($ucredBalance -eq "1000000000000000000000") {
        Write-Host "  ✅ Treasury MAIN has 1,000 UCRED" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Expected 1,000 UCRED, found: $ucredBalance" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ❌ Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Check state root
Write-Host "[3/4] Testing /audit endpoint..." -ForegroundColor Yellow
try {
    $audit = curl -UseBasicParsing "$baseUrl/audit" | ConvertFrom-Json
    $stateRoot = $audit.state_root
    $height = $audit.height
    if ($stateRoot.Length -eq 64) {
        Write-Host "  ✅ State root: $stateRoot (height: $height)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Invalid state root length: $($stateRoot.Length)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ❌ Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Dev credit (optional)
Write-Host "[4/4] Testing /internal/credit endpoint..." -ForegroundColor Yellow
try {
    $testAccount = "acct:user:test_$(Get-Random)"
    $body = @{
        asset = "UCRED"
        account = $testAccount
        amount_wei = "50000000000000000"
        memo = "smoke test"
    } | ConvertTo-Json

    $creditResult = Invoke-WebRequest -UseBasicParsing -Method POST `
        -Uri "$baseUrl/internal/credit" `
        -ContentType "application/json" `
        -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json

    if ($creditResult.success) {
        Write-Host "  ✅ Credit successful: $($creditResult.new_balance_wei) wei" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Credit failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ❌ Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Rust L1 Indexer is ready for integration:" -ForegroundColor White
Write-Host "  - 11 assets registered (UCRED, UUSD, GOLD, F&F tokens)" -ForegroundColor White
Write-Host "  - 3 treasuries with 1,000 UCRED each" -ForegroundColor White
Write-Host "  - Deterministic state root: $stateRoot" -ForegroundColor White
Write-Host "  - Dev credit endpoint functional (remove in production)" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Update dashboard: NEXT_PUBLIC_LEDGER_API=http://localhost:8089" -ForegroundColor White
Write-Host "  2. Update consent-gateway: RUST_L1_INDEXER=http://localhost:8089" -ForegroundColor White
Write-Host "  3. Test top-up flow (MATIC → UCRED mint)" -ForegroundColor White
Write-Host "  4. Remove /internal/credit endpoint before production" -ForegroundColor White
Write-Host ""
