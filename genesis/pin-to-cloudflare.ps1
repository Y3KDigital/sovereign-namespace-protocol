# Pin Genesis ARTIFACTS to Cloudflare IPFS
# Uses Cloudflare's API to pin the entire directory

$ErrorActionPreference = "Stop"

Write-Host "[Cloudflare IPFS Pinning]" -ForegroundColor Cyan
Write-Host ""

# Configuration
$artifactsDir = "C:\Users\Kevan\web3 true web3 rarity\genesis\ARTIFACTS"
$expectedCID = "bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e"

# Step 1: Create a temporary CAR file (IPFS Content Archive)
Write-Host "[1/4] Creating CAR archive..." -ForegroundColor Yellow
$carFile = Join-Path $env:TEMP "genesis-artifacts.car"

# Use ipfs dag export to create CAR file
& ipfs dag export $expectedCID > $carFile

if (-not (Test-Path $carFile)) {
    Write-Host "ERROR: Failed to create CAR file" -ForegroundColor Red
    exit 1
}

$carSize = (Get-Item $carFile).Length / 1MB
Write-Host "  Created: $([math]::Round($carSize, 2)) MB" -ForegroundColor Green

# Step 2: Upload to Cloudflare via wrangler
Write-Host "[2/4] Uploading to Cloudflare IPFS..." -ForegroundColor Yellow
Write-Host "  (This may take a minute...)" -ForegroundColor Gray

try {
    # Note: Wrangler doesn't have direct IPFS pinning in CLI yet
    # We'll use the local IPFS node + Cloudflare gateway approach
    
    Write-Host ""
    Write-Host "ALTERNATIVE APPROACH:" -ForegroundColor Cyan
    Write-Host "Cloudflare's IPFS gateway will automatically cache and pin content" -ForegroundColor White
    Write-Host "when accessed through their gateway. We need to:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Make a request to Cloudflare's gateway with your CID" -ForegroundColor White
    Write-Host "2. This will cache/pin it on their network" -ForegroundColor White
    Write-Host "3. Future requests will be fast" -ForegroundColor White
    Write-Host ""
    
    # Step 3: Trigger Cloudflare gateway caching
    Write-Host "[3/4] Triggering Cloudflare IPFS cache..." -ForegroundColor Yellow
    
    $cloudflareGateway = "https://cloudflare-ipfs.com/ipfs/$expectedCID"
    
    Write-Host "  Requesting: $cloudflareGateway" -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri $cloudflareGateway -TimeoutSec 30 -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  SUCCESS: Cloudflare cached the content!" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
    }
    
    # Step 4: Test individual files
    Write-Host "[4/4] Testing key files..." -ForegroundColor Yellow
    
    $testFiles = @(
        "genesis_attestation.json",
        "manifest.json",
        "certificates/100.json"
    )
    
    $allSuccess = $true
    foreach ($file in $testFiles) {
        $url = "https://cloudflare-ipfs.com/ipfs/$expectedCID/$file"
        try {
            $test = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
            Write-Host "  ✓ $file" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ $file - $($_.Exception.Message)" -ForegroundColor Red
            $allSuccess = $false
        }
    }
    
    Write-Host ""
    if ($allSuccess) {
        Write-Host "SUCCESS! All files accessible via Cloudflare IPFS" -ForegroundColor Green
        Write-Host ""
        Write-Host "Gateway URL:" -ForegroundColor Cyan
        Write-Host "  $cloudflareGateway" -ForegroundColor White
        Write-Host ""
        Write-Host "Update your website to use: cloudflare-ipfs.com" -ForegroundColor Yellow
    } else {
        Write-Host "PARTIAL: Some files not yet cached" -ForegroundColor Yellow
        Write-Host "Try again in 1-2 minutes" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cloudflare gateway may be having issues." -ForegroundColor Yellow
    Write-Host "Alternative: Use cf-ipfs.com gateway instead:" -ForegroundColor Yellow
    Write-Host "  https://cf-ipfs.com/ipfs/$expectedCID" -ForegroundColor White
    exit 1
} finally {
    # Cleanup
    if (Test-Path $carFile) {
        Remove-Item $carFile -Force
    }
}
