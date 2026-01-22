# Download and install sqlite3 CLI tool
$ErrorActionPreference = "Stop"

$SQLITE_URL = "https://www.sqlite.org/2024/sqlite-tools-win-x64-3460100.zip"
$DOWNLOAD_PATH = "$env:TEMP\sqlite-tools.zip"
$EXTRACT_PATH = "C:\Users\Kevan\web3 true web3 rarity\payments-api\sqlite-tools"

Write-Host "`n=== DOWNLOADING SQLITE3 CLI ===" -ForegroundColor Cyan

if (Test-Path "$EXTRACT_PATH\sqlite3.exe") {
    Write-Host "✅ sqlite3.exe already exists at $EXTRACT_PATH" -ForegroundColor Green
} else {
    Write-Host "Downloading from sqlite.org..."
    
    try {
        Invoke-WebRequest -Uri $SQLITE_URL -OutFile $DOWNLOAD_PATH -UseBasicParsing
        Write-Host "✅ Downloaded" -ForegroundColor Green
        
        Write-Host "Extracting..."
        Expand-Archive -Path $DOWNLOAD_PATH -DestinationPath $EXTRACT_PATH -Force
        Write-Host "✅ Extracted to $EXTRACT_PATH" -ForegroundColor Green
        
        Remove-Item $DOWNLOAD_PATH
    } catch {
        Write-Host "❌ ERROR: $_" -ForegroundColor Red
        exit 1
    }
}

$SQLITE_EXE = "$EXTRACT_PATH\sqlite-tools-win-x64-3460100\sqlite3.exe"

if (-not (Test-Path $SQLITE_EXE)) {
    Write-Host "❌ ERROR: sqlite3.exe not found at $SQLITE_EXE" -ForegroundColor Red
    Get-ChildItem $EXTRACT_PATH -Recurse | Format-Table Name, FullName
    exit 1
}

Write-Host "`nsqlite3.exe location: $SQLITE_EXE"
Write-Host ""

# Now execute the genesis SQL
$DB_PATH = "C:\Users\Kevan\web3 true web3 rarity\payments-api\payments.db"
$SQL_FILE = "C:\Users\Kevan\web3 true web3 rarity\payments-api\genesis-population.sql"

Write-Host "=== EXECUTING GENESIS SQL ===" -ForegroundColor Cyan
Write-Host "Database: $DB_PATH"
Write-Host "SQL File: $SQL_FILE`n"

# Execute SQL
Write-Host "Executing 955 INSERT statements..." -ForegroundColor Cyan

$output = & $SQLITE_EXE $DB_PATH ".read `"$SQL_FILE`""

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SQL executed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR executing SQL: $output" -ForegroundColor Red
    exit 1
}

# Verify
Write-Host "`n=== VERIFICATION ===" -ForegroundColor Yellow

$total = & $SQLITE_EXE $DB_PATH "SELECT COUNT(*) FROM available_namespaces;"
$available = & $SQLITE_EXE $DB_PATH "SELECT COUNT(*) FROM available_namespaces WHERE status='available';"
$reserved = & $SQLITE_EXE $DB_PATH "SELECT COUNT(*) FROM available_namespaces WHERE status='reserved';"

Write-Host "Total rows: $total"
Write-Host "Available (public mint): $available"
Write-Host "Reserved (protocol): $reserved"

if ($total -eq "955") {
    Write-Host "`n✅ DATABASE POPULATION COMPLETE" -ForegroundColor Green
    Write-Host "✅ READY FOR FRIENDS & FAMILY LAUNCH" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "`n❌ ERROR: Expected 955 rows, got $total" -ForegroundColor Red
    Write-Host "❌ DATABASE IS NOT READY" -ForegroundColor Red
    exit 1
}
