#!/usr/bin/env pwsh
# Y3K Genesis - Local IPFS Verification Script

$GENESIS_CID = "bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e"
$GENESIS_HASH = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Y3K GENESIS - LOCAL IPFS VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if IPFS daemon is running
Write-Host "[1/5] Checking IPFS daemon..." -ForegroundColor Yellow
try {
    $ipfsIdRaw = ipfs id --timeout=5s 2>&1 | Out-String
    $ipfsId = $ipfsIdRaw | ConvertFrom-Json
    Write-Host "  [OK] IPFS daemon running" -ForegroundColor Green
    Write-Host "  Peer ID: $($ipfsId.ID)" -ForegroundColor Gray
}
catch {
    Write-Host "  [FAIL] IPFS daemon not running" -ForegroundColor Red
    Write-Host "`nStart IPFS daemon with: ipfs daemon" -ForegroundColor Yellow
    exit 1
}

# Check if genesis CID is pinned
Write-Host "`n[2/5] Checking genesis pin..." -ForegroundColor Yellow
$pinned = ipfs pin ls $GENESIS_CID --type=recursive 2>&1
if ($pinned -match $GENESIS_CID) {
    Write-Host "  [OK] Genesis artifacts pinned locally" -ForegroundColor Green
}
else {
    Write-Host "  [FAIL] Genesis CID not pinned" -ForegroundColor Red
    exit 1
}

# Verify attestation file exists
Write-Host "`n[3/5] Verifying attestation..." -ForegroundColor Yellow
$attestationRaw = ipfs cat "$GENESIS_CID/genesis_attestation.json"
$attestation = $attestationRaw | ConvertFrom-Json

if ($attestation.genesis_hash -eq $GENESIS_HASH) {
    Write-Host "  [OK] Genesis hash matches" -ForegroundColor Green
}
else {
    Write-Host "  [FAIL] Genesis hash mismatch!" -ForegroundColor Red
    exit 1
}

$total = 0
if ($attestation.totals -and $attestation.totals.total_namespaces) {
    $total = $attestation.totals.total_namespaces
}
elseif ($attestation.total_namespaces) {
    $total = $attestation.total_namespaces
}
elseif ($attestation.total) {
    $total = $attestation.total
}

if ($total -eq 955) {
    Write-Host "  [OK] Total namespaces: 955" -ForegroundColor Green
}
else {
    Write-Host "  [FAIL] Wrong namespace count: $total" -ForegroundColor Red
    exit 1
}

# Verify manifest exists
Write-Host "`n[4/5] Verifying manifest..." -ForegroundColor Yellow
$manifestRaw = ipfs cat "$GENESIS_CID/manifest.json"
$manifest = $manifestRaw | ConvertFrom-Json
$manifestCount = 0

if ($manifest.total_namespaces) {
    $manifestCount = $manifest.total_namespaces
}
elseif ($manifest.certificate_count) {
    $manifestCount = $manifest.certificate_count
}
elseif ($manifest.namespaces) {
    $manifestCount = $manifest.namespaces.Count
}

if ($manifestCount -eq 955) {
    Write-Host "  [OK] Manifest contains 955 namespaces" -ForegroundColor Green
}
else {
    Write-Host "  [FAIL] Wrong manifest count: $manifestCount" -ForegroundColor Red
    exit 1
}

# Spot check certificates
Write-Host "`n[5/5] Spot-checking certificates..." -ForegroundColor Yellow
$spotChecks = @("a", "z", "0", "9", "100", "500", "999")

foreach ($ns in $spotChecks) {
    $certRaw = ipfs cat "$GENESIS_CID/certificates/$ns.json"
    $cert = $certRaw | ConvertFrom-Json
    if ($cert.genesis_hash -eq $GENESIS_HASH) {
        Write-Host "  [OK] Certificate $ns.json valid" -ForegroundColor Green
    }
    else {
        Write-Host "  [FAIL] Certificate $ns.json wrong hash" -ForegroundColor Red
        exit 1
    }
}

# Success summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "[SUCCESS] LOCAL IPFS VERIFICATION COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nGenesis artifacts are:" -ForegroundColor Cyan
Write-Host "  - Pinned in your local IPFS node" -ForegroundColor White
Write-Host "  - Available at CID: $GENESIS_CID" -ForegroundColor White
Write-Host "  - Verified with hash: $GENESIS_HASH" -ForegroundColor White

Write-Host "`nAccess methods:" -ForegroundColor Cyan
Write-Host "  - Local: http://127.0.0.1:8080/ipfs/$GENESIS_CID" -ForegroundColor White
Write-Host "  - Public: https://ipfs.io/ipfs/$GENESIS_CID" -ForegroundColor White

Write-Host ""
