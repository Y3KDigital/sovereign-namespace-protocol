# Initialize Digital Giant Stellar Network (PowerShell Version)
# This script bootstraps the entire blockchain infrastructure

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Digital Giant Stellar Network Initializer" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Generate validator keys
Write-Host "Step 1: Generating validator keys..." -ForegroundColor Yellow

docker-compose -f docker-compose.full.yml run --rm validator-1 stellar-core gen-seed | Out-File -FilePath validator1.key
docker-compose -f docker-compose.full.yml run --rm validator-2 stellar-core gen-seed | Out-File -FilePath validator2.key
docker-compose -f docker-compose.full.yml run --rm validator-3 stellar-core gen-seed | Out-File -FilePath validator3.key

Write-Host "Validator keys generated!" -ForegroundColor Green
Write-Host ""

# Extract public keys
$val1Content = Get-Content validator1.key
$val2Content = Get-Content validator2.key
$val3Content = Get-Content validator3.key

$VAL1_PUBLIC = ($val1Content | Select-String "Public:").ToString().Split()[-1]
$VAL2_PUBLIC = ($val2Content | Select-String "Public:").ToString().Split()[-1]
$VAL3_PUBLIC = ($val3Content | Select-String "Public:").ToString().Split()[-1]

Write-Host "Validator 1 Public Key: $VAL1_PUBLIC" -ForegroundColor Cyan
Write-Host "Validator 2 Public Key: $VAL2_PUBLIC" -ForegroundColor Cyan
Write-Host "Validator 3 Public Key: $VAL3_PUBLIC" -ForegroundColor Cyan
Write-Host ""

# Step 2: Update configurations
Write-Host "Step 2: Updating validator configurations..." -ForegroundColor Yellow

Get-ChildItem "stellar-core\*.cfg" | ForEach-Object {
    $content = Get-Content $_.FullName
    $content = $content -replace "VALIDATOR1_PUBLIC_KEY_HERE", $VAL1_PUBLIC
    $content = $content -replace "VALIDATOR2_PUBLIC_KEY_HERE", $VAL2_PUBLIC
    $content = $content -replace "VALIDATOR3_PUBLIC_KEY_HERE", $VAL3_PUBLIC
    Set-Content -Path $_.FullName -Value $content
}

Write-Host "Configurations updated!" -ForegroundColor Green
Write-Host ""

# Step 3: Initialize databases
Write-Host "Step 3: Starting databases..." -ForegroundColor Yellow

docker-compose -f docker-compose.full.yml up -d postgres-core postgres-horizon postgres-app redis

Write-Host "Waiting for databases to be ready..."
Start-Sleep -Seconds 10

Write-Host "Databases started!" -ForegroundColor Green
Write-Host ""

# Step 4: Start validators
Write-Host "Step 4: Starting validator nodes..." -ForegroundColor Yellow

docker-compose -f docker-compose.full.yml up -d validator-1 validator-2 validator-3

Write-Host "Waiting for validators to sync..."
Start-Sleep -Seconds 30

Write-Host "Validators started!" -ForegroundColor Green
Write-Host ""

# Step 5: Start Horizon
Write-Host "Step 5: Starting Horizon API server..." -ForegroundColor Yellow

docker-compose -f docker-compose.full.yml up -d horizon

Write-Host "Waiting for Horizon to initialize..."
Start-Sleep -Seconds 20

Write-Host "Horizon started!" -ForegroundColor Green
Write-Host ""

# Step 6: Start application services
Write-Host "Step 6: Starting application services..." -ForegroundColor Yellow

docker-compose -f docker-compose.full.yml up -d api nginx

Write-Host "Application services started!" -ForegroundColor Green
Write-Host ""

# Step 7: Verify network
Write-Host "Step 7: Verifying network status..." -ForegroundColor Yellow

try {
    $val1Response = Invoke-WebRequest -Uri "http://localhost:11626/info" -UseBasicParsing -ErrorAction Stop
    if ($val1Response.Content -match "state") {
        Write-Host "✓ Validator 1 is running" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Validator 1 check failed" -ForegroundColor Red
}

try {
    $horizonResponse = Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing -ErrorAction Stop
    if ($horizonResponse.Content -match "horizon") {
        Write-Host "✓ Horizon is running" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Horizon check failed" -ForegroundColor Red
}

try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -ErrorAction Stop
    if ($apiResponse.Content -match "healthy") {
        Write-Host "✓ API is running" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ API check failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Digital Giant Stellar Network is LIVE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Yellow
Write-Host "  - Validator 1: http://localhost:11626"
Write-Host "  - Validator 2: http://localhost:12626"
Write-Host "  - Validator 3: http://localhost:13626"
Write-Host "  - Horizon API: http://localhost:8000"
Write-Host "  - Application API: http://localhost:3000"
Write-Host "  - Web Interface: http://localhost:80"
Write-Host ""
Write-Host "Network Info:" -ForegroundColor Yellow
Write-Host "  - Network Passphrase: Digital Giant Stellar Network ; January 2026"
Write-Host "  - Validator Keys saved in: validator1.key, validator2.key, validator3.key"
Write-Host ""
Write-Host "IMPORTANT: Keep your validator keys secure!" -ForegroundColor Yellow
Write-Host ""
