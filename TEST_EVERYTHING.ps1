# Test Everything - One Command

Write-Host "`n=== Y3K COMPLETE TEST ===" -ForegroundColor Cyan

# 1. Test server running
Write-Host "`n[1/4] Testing server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  ✓ Server running" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Server not running. Start with: npm run dev" -ForegroundColor Red
    exit 1
}

# 2. Test claim page loads
Write-Host "`n[2/4] Testing claim page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/claim?token=222" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  ✓ Claim page loads" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Claim page error: $_" -ForegroundColor Red
}

# 3. Test ceremony page loads
Write-Host "`n[3/4] Testing ceremony page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/ceremony" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  ✓ Ceremony page loads" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Ceremony page error: $_" -ForegroundColor Red
}

# 4. Test dashboard loads
Write-Host "`n[4/4] Testing dashboard..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/dashboard" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  ✓ Dashboard loads" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Dashboard error: $_" -ForegroundColor Red
}

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Test 222.x claim: http://localhost:3000/claim?token=222" -ForegroundColor White
Write-Host "2. Test ceremony view: http://localhost:3000/ceremony" -ForegroundColor White
Write-Host "3. After claiming, test dashboard" -ForegroundColor White
Write-Host "4. Publish certs to IPFS: .\genesis\publish-all-ceremonial-certs.ps1`n" -ForegroundColor White
