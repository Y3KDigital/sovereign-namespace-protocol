# GENESIS DATABASE POPULATION
# Inserts exactly 955 rows from certificate artifacts
# CRITICAL: Do not run twice - includes uniqueness checks

$ErrorActionPreference = "Stop"

$ARTIFACTS = "C:\Users\Kevan\web3 true web3 rarity\genesis\ARTIFACTS"
$DB_PATH = "C:\Users\Kevan\web3 true web3 rarity\payments-api\payments.db"
$IPFS_CID = "bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e"

Write-Host "`n=== GENESIS DATABASE POPULATION ===" -ForegroundColor Cyan
Write-Host "Target: 955 rows"
Write-Host "Source: $ARTIFACTS\certificates"
Write-Host "Database: $DB_PATH`n"

# Check if already populated
$existingCount = sqlite3 $DB_PATH "SELECT COUNT(*) FROM available_namespaces WHERE status='available';"
if ($existingCount -ge 955) {
    Write-Host "❌ ABORT: Database already has $existingCount rows. Manual verification required." -ForegroundColor Red
    exit 1
}

# Load all certificates
$certs = Get-ChildItem "$ARTIFACTS\certificates" -Filter "*.json"
Write-Host "Found $($certs.Count) certificate files"

if ($certs.Count -ne 955) {
    Write-Host "❌ ERROR: Expected 955 certificates, found $($certs.Count)" -ForegroundColor Red
    exit 1
}

# Generate SQL inserts
$inserts = @()
$processed = 0

foreach ($certFile in $certs) {
    try {
        $cert = Get-Content $certFile.FullName | ConvertFrom-Json
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
        
        # Calculate rarity score (position-based for genesis)
        $rarityScore = if ($tier -eq 'crown_letter') { 
            100.0 
        } elseif ($tier -eq 'crown_digit') { 
            95.0 
        } else { 
            70.0 + ($genesisIndex / 955.0 * 20.0)  # 70-90 range for public roots
        }
        
        # Generate unique ID
        $id = [guid]::NewGuid().ToString()
        
        # Certificate CID path
        $certCID = "$IPFS_CID/certificates/$($certFile.Name)"
        
        # Status: crown/protocol = reserved, public = available
        $status = if ($tier -eq 'genesis_public') { 'available' } else { 'reserved' }
        
        # Build INSERT
        $insert = "INSERT INTO available_namespaces (id, namespace, tier, rarity_score, cryptographic_hash, genesis_index, certificate_cid, status) VALUES ('$id', '$namespace', '$tier', $rarityScore, '$genesisHash', $genesisIndex, '$certCID', '$status');"
        
        $inserts += $insert
        $processed++
        
        if ($processed % 100 -eq 0) {
            Write-Host "  Processed $processed / 955..." -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ ERROR processing $($certFile.Name): $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nGenerated $($inserts.Count) INSERT statements"

# Write SQL file
$sqlFile = "C:\Users\Kevan\web3 true web3 rarity\payments-api\genesis-population.sql"
$inserts | Set-Content $sqlFile -Encoding UTF8

Write-Host "SQL file written: $sqlFile"

# Execute against database
Write-Host "`nExecuting SQL inserts..." -ForegroundColor Cyan

try {
    sqlite3 $DB_PATH ".read $sqlFile"
    Write-Host "✅ SQL execution complete" -ForegroundColor Green
}
catch {
    Write-Host "❌ SQL execution failed: $_" -ForegroundColor Red
    exit 1
}

# CRITICAL VERIFICATION
Write-Host "`n=== VERIFICATION ===" -ForegroundColor Yellow

$finalCount = sqlite3 $DB_PATH "SELECT COUNT(*) FROM available_namespaces;"
$availableCount = sqlite3 $DB_PATH "SELECT COUNT(*) FROM available_namespaces WHERE status='available';"
$reservedCount = sqlite3 $DB_PATH "SELECT COUNT(*) FROM available_namespaces WHERE status='reserved';"

Write-Host "Total rows: $finalCount"
Write-Host "Available (public mint): $availableCount"
Write-Host "Reserved (protocol): $reservedCount"

if ($finalCount -ne 955) {
    Write-Host "`n❌ CRITICAL ERROR: Expected 955 rows, got $finalCount" -ForegroundColor Red
    Write-Host "DATABASE IS NOT READY FOR LAUNCH" -ForegroundColor Red
    exit 1
}

if ($availableCount -ne 900) {
    Write-Host "`n⚠️ WARNING: Expected 900 available, got $availableCount" -ForegroundColor Yellow
}

if ($reservedCount -ne 55) {
    Write-Host "`n⚠️ WARNING: Expected 55 reserved, got $reservedCount" -ForegroundColor Yellow
}

# Spot check a few namespaces
Write-Host "`n=== SPOT CHECK ===" -ForegroundColor Yellow
$sample = sqlite3 $DB_PATH "SELECT namespace, tier, status FROM available_namespaces WHERE namespace IN ('100', '500', '999', 'a', '0') ORDER BY namespace;"
Write-Host $sample

Write-Host "`n✅ DATABASE POPULATION COMPLETE" -ForegroundColor Green
Write-Host "✅ READY FOR FRIENDS & FAMILY LAUNCH" -ForegroundColor Green
Write-Host "`nNext: Generate F&F codes and send activation emails`n"
