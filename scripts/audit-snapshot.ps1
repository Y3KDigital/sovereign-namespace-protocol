# Daily Audit Snapshot
# Schedule: Windows Task Scheduler → Daily at 00:05 UTC
# Run: pwsh -ExecutionPolicy Bypass -File scripts/audit-snapshot.ps1

param(
  [string]$ApiBase = "http://localhost:8088",
  [string]$LogFile = "data/audit-log.csv"
)

$ErrorActionPreference = "Stop"

try {
  # Fetch current audit hash
  $audit = Invoke-RestMethod "$ApiBase/audit"
  $hash = $audit.hash_hex
  $scope = $audit.scope
  $date = (Get-Date).ToString("yyyy-MM-dd")
  $timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
  
  # Ensure log directory exists
  $logDir = Split-Path $LogFile -Parent
  if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
  }
  
  # Write header if file doesn't exist
  if (-not (Test-Path $LogFile)) {
    "date,timestamp,scope,hash_hex" | Out-File $LogFile -Encoding UTF8
  }
  
  # Append snapshot
  "$date,$timestamp,$scope,$hash" | Out-File $LogFile -Append -Encoding UTF8
  
  Write-Host "✅ Snapshot recorded: $date → $hash" -ForegroundColor Green
  
  # Optional: Pin to IPFS (if ipfs CLI available)
  if (Get-Command ipfs -ErrorAction SilentlyContinue) {
    $cid = ipfs add -Q $LogFile
    Write-Host "📌 Pinned to IPFS: $cid" -ForegroundColor Cyan
  }
  
  exit 0
} catch {
  Write-Host "❌ Snapshot failed: $_" -ForegroundColor Red
  exit 1
}
