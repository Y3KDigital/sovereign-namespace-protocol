# GENESIS DATABASE POPULATION - Rust Approach
# Generates SQL and executes via Rust SQLite bindings

$ErrorActionPreference = "Stop"

$ARTIFACTS = "C:\Users\Kevan\web3 true web3 rarity\genesis\ARTIFACTS"
$IPFS_CID = "bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e"

Write-Host "`n=== GENESIS DATABASE POPULATION ===" -ForegroundColor Cyan
Write-Host "Generating SQL for 955 genesis roots`n"

# Load all certificates
$certs = Get-ChildItem "$ARTIFACTS\certificates" -Filter "*.json" | Sort-Object Name

Write-Host "Found $($certs.Count) certificate files"

if ($certs.Count -ne 955) {
    Write-Host "❌ ERROR: Expected 955 certificates, found $($certs.Count)" -ForegroundColor Red
    exit 1
}

# Generate SQL inserts
$sqlLines = @()
$sqlLines += "-- GENESIS DATABASE POPULATION"
$sqlLines += "-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$sqlLines += "-- Total Roots: 955"
$sqlLines += ""
$sqlLines += "BEGIN TRANSACTION;"
$sqlLines += ""

$processed = 0

foreach ($certFile in $certs) {
    try {
        $cert = Get-Content $certFile.FullName -Raw | ConvertFrom-Json
        $namespace = $cert.namespace
        $genesisIndex = $cert.genesis_index
        $genesisHash = $cert.genesis_hash
        
        # Determine tier
        $tier = if ($namespace -match '^[a-z]$') { 
            'crown_letter' 
        } elseif ($namespace -match '^\d$') { 
            'crown_digit' 
        } elseif ($namespace -match '^\d{3}$') { 
            'genesis_public' 
        } else { 
            'protocol_infrastructure' 
        }
        
        # Calculate rarity score
        $rarityScore = if ($tier -eq 'crown_letter') { 
            100.0 
        } elseif ($tier -eq 'crown_digit') { 
            95.0 
        } else { 
            [math]::Round(70.0 + ($genesisIndex / 955.0 * 20.0), 2)
        }
        
        # Generate unique ID
        $id = [guid]::NewGuid().ToString()
        
        # Certificate CID path
        $certCID = "$IPFS_CID/certificates/$($certFile.Name)"
        
        # Status
        $status = if ($tier -eq 'genesis_public') { 'available' } else { 'reserved' }
        
        # Price (cents) - position-based for public roots
        $priceUsd = if ($status -eq 'reserved') { 
            0 
        } else {
            # Linear pricing: 100-999 → $100-$500
            $position = [int]$namespace
            [math]::Floor(100 + (($position - 100) / 899.0) * 400)
        }
        
        # Build INSERT
        $insert = "INSERT INTO available_namespaces (id, namespace, tier, rarity_score, cryptographic_hash, genesis_index, certificate_cid, status, price_usd_cents) VALUES ('$id', '$namespace', '$tier', $rarityScore, '$genesisHash', $genesisIndex, '$certCID', '$status', $priceUsd);"
        
        $sqlLines += $insert
        $processed++
        
        if ($processed % 100 -eq 0) {
            Write-Host "  Generated $processed / 955..." -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ ERROR processing $($certFile.Name): $_" -ForegroundColor Red
        Write-Host "Certificate content:" -ForegroundColor Red
        Get-Content $certFile.FullName
        exit 1
    }
}

$sqlLines += ""
$sqlLines += "COMMIT;"
$sqlLines += ""
$sqlLines += "-- VERIFICATION QUERIES"
$sqlLines += "-- Run these manually to verify:"
$sqlLines += "-- SELECT COUNT(*) FROM available_namespaces; -- Must be 955"
$sqlLines += "-- SELECT COUNT(*) FROM available_namespaces WHERE status='available'; -- Must be 900"
$sqlLines += "-- SELECT COUNT(*) FROM available_namespaces WHERE status='reserved'; -- Must be 55"

Write-Host "`nGenerated $processed INSERT statements"

# Write SQL file
$sqlFile = "C:\Users\Kevan\web3 true web3 rarity\payments-api\genesis-population.sql"
$sqlLines | Set-Content $sqlFile -Encoding UTF8

Write-Host "✅ SQL file written: $sqlFile" -ForegroundColor Green

# Create sample verification script
$verifyScript = @"
# MANUAL VERIFICATION
# After executing genesis-population.sql, run these checks:

# Method 1: If you have sqlite3 CLI
# sqlite3 payments.db < genesis-population.sql
# sqlite3 payments.db "SELECT COUNT(*) FROM available_namespaces;"

# Method 2: Use Rust tool
# cargo run --bin verify-genesis-db

# Method 3: Check via payments API
# Start API server and hit GET /api/namespaces/stats
"@

$verifyScript | Set-Content "C:\Users\Kevan\web3 true web3 rarity\payments-api\verify-population.txt"

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Yellow
Write-Host "1. Execute SQL file against payments.db"
Write-Host "   Options:"
Write-Host "   a) Use SQLite browser GUI to open payments.db and execute SQL"
Write-Host "   b) Use Rust: Create small tool to execute this SQL"
Write-Host "   c) If you have sqlite3.exe: sqlite3 payments.db < genesis-population.sql"
Write-Host ""
Write-Host "2. Verify count = 955"
Write-Host ""
Write-Host "SQL file location:"
Write-Host "  $sqlFile"
Write-Host ""
