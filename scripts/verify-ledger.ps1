# Ledger Verification Script
# Run: pwsh -ExecutionPolicy Bypass -File scripts/verify-ledger.ps1

param(
  [string]$ApiBase = "http://localhost:8088"
)

Write-Host "`n🔍 Verifying Unykorn Ledger API" -ForegroundColor Cyan
Write-Host "=" * 60

$errors = 0

# Test 1: Assets endpoint
Write-Host "`n[1/3] Testing /assets..." -ForegroundColor Yellow
try {
  $assets = Invoke-RestMethod "$ApiBase/assets"
  $count = $assets.Count
  Write-Host "  ✓ Retrieved $count assets" -ForegroundColor Green
  
  $expected = @("UUSD", "UCRED", "GOLD", "FTH", "MOG", "XXXIII", "OPTKAS1", "KBURNS", "EUR", "GBP", "DRUNKS")
  $found = $assets | Select-Object -ExpandProperty symbol
  
  foreach ($exp in $expected) {
    if ($found -contains $exp) {
      Write-Host "    • $exp ✓" -ForegroundColor Gray
    } else {
      Write-Host "    • $exp ✗ MISSING" -ForegroundColor Red
      $errors++
    }
  }
} catch {
  Write-Host "  ✗ FAILED: $_" -ForegroundColor Red
  $errors++
}

# Test 2: Balances endpoint
Write-Host "`n[2/3] Testing /balances..." -ForegroundColor Yellow
$testAccounts = @("acct:treasury:MAIN", "acct:treasury:FTH", "acct:treasury:MOG")

foreach ($acct in $testAccounts) {
  try {
    $balances = Invoke-RestMethod "$ApiBase/balances?account=$([Uri]::EscapeDataString($acct))"
    $ucred = $balances | Where-Object { $_.asset -eq "UCRED" } | Select-Object -First 1
    
    if ($ucred) {
      $amount = [bigint]::Parse($ucred.balance_wei)
      $expected = [bigint]::Parse("1000000000000000000000")
      
      if ($amount -eq $expected) {
        Write-Host "  ✓ $acct has 1,000 UCRED" -ForegroundColor Green
      } else {
        Write-Host "  ✗ $acct has wrong balance: $amount" -ForegroundColor Red
        $errors++
      }
    } else {
      Write-Host "  ✗ $acct has no UCRED balance" -ForegroundColor Red
      $errors++
    }
  } catch {
    Write-Host "  ✗ FAILED for ${acct}: $_" -ForegroundColor Red
    $errors++
  }
}

# Test 3: Audit endpoint
Write-Host "`n[3/3] Testing /audit..." -ForegroundColor Yellow
try {
  $audit = Invoke-RestMethod "$ApiBase/audit"
  $hash = $audit.hash_hex
  
  if ($hash -match '^[0-9a-f]{64}$') {
    Write-Host "  ✓ Audit hash: $hash" -ForegroundColor Green
  } else {
    Write-Host "  ✗ Invalid hash format: $hash" -ForegroundColor Red
    $errors++
  }
} catch {
  Write-Host "  ✗ FAILED: $_" -ForegroundColor Red
  $errors++
}

# Summary
Write-Host "`n" + ("=" * 60)
if ($errors -eq 0) {
  Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green
  Write-Host "`nLedger is operational and ready for production." -ForegroundColor Cyan
  exit 0
} else {
  Write-Host "❌ $errors TEST(S) FAILED" -ForegroundColor Red
  Write-Host "`nFix errors above before proceeding." -ForegroundColor Yellow
  exit 1
}
