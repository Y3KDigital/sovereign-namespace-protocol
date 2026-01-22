# Execute Genesis SQL using .NET SQLite
# Windows-native approach without external dependencies

$ErrorActionPreference = "Stop"

$DB_PATH = "C:\Users\Kevan\web3 true web3 rarity\payments-api\payments.db"
$SQL_FILE = "C:\Users\Kevan\web3 true web3 rarity\payments-api\genesis-population.sql"

Write-Host "`n=== EXECUTING GENESIS DATABASE POPULATION ===" -ForegroundColor Cyan
Write-Host "Database: $DB_PATH"
Write-Host "SQL File: $SQL_FILE`n"

# Check files exist
if (-not (Test-Path $DB_PATH)) {
    Write-Host "❌ ERROR: Database not found at $DB_PATH" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $SQL_FILE)) {
    Write-Host "❌ ERROR: SQL file not found at $SQL_FILE" -ForegroundColor Red
    exit 1
}

# Load System.Data.SQLite assembly
try {
    Add-Type -Path "C:\Windows\Microsoft.NET\assembly\GAC_MSIL\System.Data.SQLite\v4.0_1.0.118.0__db937bc2d44ff139\System.Data.SQLite.dll"
} catch {
    Write-Host "⚠️ System.Data.SQLite not found in GAC, trying NuGet package..." -ForegroundColor Yellow
    
    # Alternative: Download SQLite package
    $nugetUrl = "https://www.nuget.org/api/v2/package/System.Data.SQLite.Core/1.0.118"
    $packagePath = "$env:TEMP\sqlite-package.zip"
    
    Write-Host "Downloading SQLite package..."
    Invoke-WebRequest -Uri $nugetUrl -OutFile $packagePath
    
    Expand-Archive -Path $packagePath -DestinationPath "$env:TEMP\sqlite" -Force
    
    $dllPath = "$env:TEMP\sqlite\lib\net46\System.Data.SQLite.dll"
    if (Test-Path $dllPath) {
        Add-Type -Path $dllPath
        Write-Host "✅ Loaded SQLite from NuGet package" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: Could not load System.Data.SQLite" -ForegroundColor Red
        Write-Host "   Falling back to manual execution instructions..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "MANUAL EXECUTION REQUIRED:" -ForegroundColor Yellow
        Write-Host "1. Download DB Browser for SQLite: https://sqlitebrowser.org/dl/"
        Write-Host "2. Open: $DB_PATH"
        Write-Host "3. Go to 'Execute SQL' tab"
        Write-Host "4. Load SQL file: $SQL_FILE"
        Write-Host "5. Click 'Execute'"
        Write-Host "6. Verify: SELECT COUNT(*) FROM available_namespaces; -- Must be 955"
        Write-Host ""
        Write-Host "OR use sqlite3.exe command-line:"
        Write-Host "   sqlite3.exe `"$DB_PATH`" < `"$SQL_FILE`""
        Write-Host ""
        exit 1
    }
}

# Read SQL file
Write-Host "Reading SQL file..." -ForegroundColor Gray
$sql = Get-Content $SQL_FILE -Raw

# Create connection
Write-Host "Connecting to database..." -ForegroundColor Gray
$connectionString = "Data Source=$DB_PATH;Version=3;"
$connection = New-Object System.Data.SQLite.SQLiteConnection($connectionString)

try {
    $connection.Open()
    Write-Host "✅ Connected to database" -ForegroundColor Green
    
    # Execute SQL
    Write-Host "`nExecuting SQL (955 inserts)..." -ForegroundColor Cyan
    $command = $connection.CreateCommand()
    $command.CommandText = $sql
    $command.ExecuteNonQuery() | Out-Null
    
    Write-Host "✅ SQL executed successfully" -ForegroundColor Green
    
    # Verify counts
    Write-Host "`n=== VERIFICATION ===" -ForegroundColor Yellow
    
    $countCmd = $connection.CreateCommand()
    $countCmd.CommandText = "SELECT COUNT(*) FROM available_namespaces"
    $total = $countCmd.ExecuteScalar()
    
    $availCmd = $connection.CreateCommand()
    $availCmd.CommandText = "SELECT COUNT(*) FROM available_namespaces WHERE status='available'"
    $available = $availCmd.ExecuteScalar()
    
    $resCmd = $connection.CreateCommand()
    $resCmd.CommandText = "SELECT COUNT(*) FROM available_namespaces WHERE status='reserved'"
    $reserved = $resCmd.ExecuteScalar()
    
    Write-Host "Total rows: $total"
    Write-Host "Available (public mint): $available"
    Write-Host "Reserved (protocol): $reserved"
    
    if ($total -eq 955) {
        Write-Host "`n✅ DATABASE POPULATION COMPLETE" -ForegroundColor Green
        Write-Host "✅ READY FOR FRIENDS & FAMILY LAUNCH" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "`n❌ ERROR: Expected 955 rows, got $total" -ForegroundColor Red
        Write-Host "❌ DATABASE IS NOT READY" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
}
catch {
    Write-Host "`n❌ ERROR: $_" -ForegroundColor Red
    exit 1
}
finally {
    if ($connection.State -eq [System.Data.ConnectionState]::Open) {
        $connection.Close()
    }
}

Write-Host "Next: Generate F&F codes and send activation emails`n"
