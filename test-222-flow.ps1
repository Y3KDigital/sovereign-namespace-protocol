# Test 222.x Complete Flow

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING 222.x COMPLETE FLOW" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Token Validation
Write-Host "[1/5] Testing token validation..." -ForegroundColor Yellow
$testToken = "222"
$apiUrl = "http://localhost:3000/api/claim/validate"

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body (@{token=$testToken} | ConvertTo-Json) -ContentType "application/json"
    if ($response.valid) {
        Write-Host "  ✓ Token valid: $($response.namespace)" -ForegroundColor Green
        Write-Host "  - Tier: $($response.tier)" -ForegroundColor Gray
        Write-Host "  - Rarity: $($response.rarity)" -ForegroundColor Gray
        Write-Host "  - Certificates: $($response.certificates.Count)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Token validation failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ✗ API error (is server running?): $_" -ForegroundColor Red
    exit 1
}

# Test 2: Certificate Files Exist
Write-Host "`n[2/5] Checking certificate files..." -ForegroundColor Yellow
$certPath = "genesis\SOVEREIGN_SUBNAMESPACES\222.x.json"
if (Test-Path $certPath) {
    $cert = Get-Content $certPath -Raw | ConvertFrom-Json
    Write-Host "  ✓ Certificate file exists" -ForegroundColor Green
    Write-Host "  - Namespace: $($cert.namespace)" -ForegroundColor Gray
    Write-Host "  - Type: $($cert.type)" -ForegroundColor Gray
    Write-Host "  - Status: $($cert.status)" -ForegroundColor Gray
} else {
    Write-Host "  ✗ Certificate file not found" -ForegroundColor Red
    exit 1
}

# Test 3: Dashboard Page Exists
Write-Host "`n[3/5] Checking dashboard page..." -ForegroundColor Yellow
$dashboardPath = "y3k-markets-web\app\dashboard\page.tsx"
if (Test-Path $dashboardPath) {
    Write-Host "  ✓ Dashboard page exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Dashboard page not found" -ForegroundColor Red
    exit 1
}

# Test 4: Claim Page Updated
Write-Host "`n[4/5] Checking claim page updates..." -ForegroundColor Yellow
$claimPath = "y3k-markets-web\app\claim\page.tsx"
$claimContent = Get-Content $claimPath -Raw
if ($claimContent -match "claimed_namespace") {
    Write-Host "  ✓ Claim page saves to localStorage" -ForegroundColor Green
} else {
    Write-Host "  ✗ Claim page missing localStorage save" -ForegroundColor Red
    exit 1
}

if ($claimContent -match "/dashboard") {
    Write-Host "  ✓ Claim page redirects to dashboard" -ForegroundColor Green
} else {
    Write-Host "  ✗ Claim page missing dashboard redirect" -ForegroundColor Red
    exit 1
}

if ($claimContent -notmatch "fakeCid") {
    Write-Host "  ✓ No fake IPFS CIDs" -ForegroundColor Green
} else {
    Write-Host "  ✗ Still generating fake CIDs!" -ForegroundColor Red
    exit 1
}

# Test 5: Ceremonial Invitation
Write-Host "`n[5/5] Checking ceremonial invitation..." -ForegroundColor Yellow
$invitePath = "genesis\222_CEREMONIAL_INVITATION.md"
if (Test-Path $invitePath) {
    $inviteContent = Get-Content $invitePath -Raw
    if ($inviteContent -like "*222.x*") {
        Write-Host "  ✓ Ceremonial invitation exists" -ForegroundColor Green
        $lines = ($inviteContent -split "`n").Count
        Write-Host "  - Document length: $lines lines" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Invitation missing namespace reference" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✗ Ceremonial invitation not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ALL TESTS PASSED ✓" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start dev server: npm run dev" -ForegroundColor Gray
Write-Host "  2. Visit: http://localhost:3000/claim?token=222" -ForegroundColor Gray
Write-Host "  3. Complete claim flow" -ForegroundColor Gray
Write-Host "  4. Verify dashboard loads with namespace data" -ForegroundColor Gray
Write-Host "  5. Test wallet connection" -ForegroundColor Gray
Write-Host "  6. Publish to IPFS: .\publish-all-ceremonial-certs.ps1`n" -ForegroundColor Gray
