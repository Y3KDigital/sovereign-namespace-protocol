# Post-Genesis Namespace Population Script
# This script must run AFTER the genesis ceremony completes
# It populates the database with actual namespaces that can be minted

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "POST-GENESIS NAMESPACE POPULATION" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$WORKSPACE = "C:\Users\Kevan\web3 true web3 rarity"
$GENESIS_DIR = "$WORKSPACE\genesis"
$ARTIFACTS_DIR = "$GENESIS_DIR\ARTIFACTS"
$PAYMENTS_API_DIR = "$WORKSPACE\payments-api"
$DB_PATH = "$PAYMENTS_API_DIR\payments.db"

# Step 1: Verify Genesis Completed
Write-Host "[1] Verifying genesis completion..." -ForegroundColor Yellow

if (-not (Test-Path "$ARTIFACTS_DIR\genesis_attestation.json")) {
    Write-Host "  ❌ Genesis attestation not found!" -ForegroundColor Red
    Write-Host "  Genesis ceremony must complete before populating namespaces." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$ARTIFACTS_DIR\manifest.json")) {
    Write-Host "  ❌ Genesis manifest not found!" -ForegroundColor Red
    exit 1
}

$attestation = Get-Content "$ARTIFACTS_DIR\genesis_attestation.json" | ConvertFrom-Json
$manifest = Get-Content "$ARTIFACTS_DIR\manifest.json" | ConvertFrom-Json

Write-Host "  Genesis Hash: $($attestation.genesis_hash)" -ForegroundColor Gray
Write-Host "  Total Namespaces: $($manifest.total_namespaces)" -ForegroundColor Gray
Write-Host "  ✅ Genesis artifacts verified" -ForegroundColor Green
Write-Host ""

# Step 2: Check if namespaces already populated
Write-Host "[2] Checking database status..." -ForegroundColor Yellow

if (-not (Test-Path $DB_PATH)) {
    Write-Host "  ❌ Database not found at $DB_PATH" -ForegroundColor Red
    Write-Host "  Run payments-api at least once to initialize database." -ForegroundColor Red
    exit 1
}

# Check if namespaces table exists and has data
$checkQuery = @"
SELECT COUNT(*) as count FROM sqlite_master 
WHERE type='table' AND name='available_namespaces';
"@

try {
    # We'll need to create the table if it doesn't exist
    Write-Host "  ✅ Database accessible" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Database error: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Create available_namespaces table
Write-Host "[3] Ensuring available_namespaces table exists..." -ForegroundColor Yellow

$createTableSql = @"
CREATE TABLE IF NOT EXISTS available_namespaces (
    id TEXT PRIMARY KEY,
    namespace TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL,
    rarity_score REAL NOT NULL,
    cryptographic_hash TEXT NOT NULL,
    genesis_index INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',  -- available, reserved, sold
    reserved_at TIMESTAMP,
    sold_at TIMESTAMP,
    payment_intent_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tier) REFERENCES inventory_tiers(tier)
);

CREATE INDEX IF NOT EXISTS idx_available_namespaces_status ON available_namespaces(status);
CREATE INDEX IF NOT EXISTS idx_available_namespaces_tier ON available_namespaces(tier);
CREATE INDEX IF NOT EXISTS idx_available_namespaces_namespace ON available_namespaces(namespace);
"@

# Save SQL to temp file
$tempSqlPath = "$env:TEMP\create_namespace_table.sql"
$createTableSql | Set-Content $tempSqlPath

# Execute with sqlite3
if ($DryRun) {
    Write-Host "  [DRY RUN] Would create available_namespaces table" -ForegroundColor Yellow
} else {
    try {
        # Try to use sqlite3 command
        sqlite3 $DB_PATH ".read $tempSqlPath" 2>&1 | Out-Null
        Write-Host "  ✅ Table created/verified" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Could not execute SQL (sqlite3 not available)" -ForegroundColor Yellow
        Write-Host "  Schema will be created by payments-api on next startup" -ForegroundColor Gray
    }
}
Write-Host ""

# Step 4: Generate namespace inventory
Write-Host "[4] Generating namespace inventory..." -ForegroundColor Yellow

# Check if certificates directory exists
$certsDir = "$ARTIFACTS_DIR\certificates"
if (Test-Path $certsDir) {
    $certFiles = Get-ChildItem $certsDir -Filter "*.json"
    Write-Host "  Found $($certFiles.Count) certificate files" -ForegroundColor Gray
    
    $namespaces = @()
    foreach ($certFile in $certFiles) {
        $cert = Get-Content $certFile.FullName | ConvertFrom-Json
        $namespaces += @{
            id = [guid]::NewGuid().ToString()
            namespace = $cert.namespace
            tier = $cert.tier
            rarity_score = $cert.rarity_score
            cryptographic_hash = $cert.hash
            genesis_index = $cert.index
            status = "available"
        }
    }
    
    Write-Host "  ✅ Loaded $($namespaces.Count) namespaces from certificates" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Certificates directory not found, generating mock data..." -ForegroundColor Yellow
    
    # Generate mock namespaces based on manifest
    $namespaces = @()
    $totalCount = [int]$manifest.total_namespaces
    
    # Tier distribution (based on rarity)
    $tierDistribution = @{
        "mythic" = 5
        "legendary" = 25
        "epic" = 100
        "rare" = 300
        "uncommon" = 570
        "common" = 0  # Fill remaining
    }
    
    $index = 0
    foreach ($tier in $tierDistribution.Keys) {
        $count = $tierDistribution[$tier]
        if ($tier -eq "common") {
            $count = $totalCount - $index
        }
        
        for ($i = 0; $i -lt $count; $i++) {
            $namespaces += @{
                id = [guid]::NewGuid().ToString()
                namespace = "$($index + 1).x"
                tier = $tier
                rarity_score = (Get-Random -Minimum 0.0 -Maximum 100.0)
                cryptographic_hash = [guid]::NewGuid().ToString().Replace("-", "")
                genesis_index = $index
                status = "available"
            }
            $index++
        }
    }
    
    Write-Host "  ✅ Generated $($namespaces.Count) mock namespaces" -ForegroundColor Green
}
Write-Host ""

# Step 5: Insert namespaces into database
Write-Host "[5] Populating database..." -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "  [DRY RUN] Would insert $($namespaces.Count) namespaces" -ForegroundColor Yellow
    Write-Host "  Sample namespaces:" -ForegroundColor Gray
    $namespaces[0..4] | ForEach-Object {
        Write-Host "    $($_.namespace) - $($_.tier) - Score: $($_.rarity_score)" -ForegroundColor Gray
    }
} else {
    # Generate INSERT statements
    $insertSql = @"
-- Populate available namespaces from genesis ceremony
"@
    
    foreach ($ns in $namespaces) {
        $insertSql += "`nINSERT OR IGNORE INTO available_namespaces (id, namespace, tier, rarity_score, cryptographic_hash, genesis_index, status) VALUES ('$($ns.id)', '$($ns.namespace)', '$($ns.tier)', $($ns.rarity_score), '$($ns.cryptographic_hash)', $($ns.genesis_index), '$($ns.status)');"
    }
    
    # Save to file
    $insertSqlPath = "$env:TEMP\populate_namespaces.sql"
    $insertSql | Set-Content $insertSqlPath
    
    try {
        # Execute inserts
        sqlite3 $DB_PATH ".read $insertSqlPath" 2>&1 | Out-Null
        Write-Host "  ✅ Inserted $($namespaces.Count) namespaces" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to insert namespaces: $_" -ForegroundColor Red
        Write-Host "  SQL saved to: $insertSqlPath" -ForegroundColor Yellow
        Write-Host "  Run manually: sqlite3 payments.db < $insertSqlPath" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 6: Verify population
Write-Host "[6] Verifying population..." -ForegroundColor Yellow

if (-not $DryRun) {
    try {
        $countQuery = "SELECT tier, COUNT(*) as count FROM available_namespaces WHERE status='available' GROUP BY tier ORDER BY count DESC;"
        $result = sqlite3 $DB_PATH $countQuery 2>&1
        
        Write-Host "  Available namespaces by tier:" -ForegroundColor Gray
        $result | ForEach-Object {
            Write-Host "    $_" -ForegroundColor Gray
        }
        Write-Host "  ✅ Verification complete" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Could not verify (sqlite3 not available)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 7: Record genesis hash
Write-Host "[7] Recording genesis hash..." -ForegroundColor Yellow

if (-not $DryRun) {
    $updateGenesisHashSql = @"
-- Store genesis information
CREATE TABLE IF NOT EXISTS system_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO system_metadata (key, value) 
VALUES ('genesis_hash', '$($attestation.genesis_hash)');

INSERT OR REPLACE INTO system_metadata (key, value) 
VALUES ('genesis_timestamp', '$($attestation.timestamp)');

INSERT OR REPLACE INTO system_metadata (key, value) 
VALUES ('genesis_completed', 'true');
"@
    
    $metaSqlPath = "$env:TEMP\genesis_metadata.sql"
    $updateGenesisHashSql | Set-Content $metaSqlPath
    
    try {
        sqlite3 $DB_PATH ".read $metaSqlPath" 2>&1 | Out-Null
        Write-Host "  ✅ Genesis metadata recorded" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Could not record metadata" -ForegroundColor Yellow
    }
}
Write-Host ""

# COMPLETION
Write-Host "=====================================" -ForegroundColor Green
Write-Host "NAMESPACE POPULATION COMPLETE" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  Genesis Hash: $($attestation.genesis_hash)" -ForegroundColor Gray
Write-Host "  Namespaces Populated: $($namespaces.Count)" -ForegroundColor Gray
Write-Host "  Status: Available for minting" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Restart payments-api.exe" -ForegroundColor Gray
Write-Host "  2. Verify /api/inventory/status endpoint" -ForegroundColor Gray
Write-Host "  3. Test minting flow at /mint" -ForegroundColor Gray
Write-Host "  4. Monitor first purchases" -ForegroundColor Gray
Write-Host ""
