# Restart payments-api cleanly (Windows).
# - Stops any running payments-api.exe
# - Starts payments-api via run-payments-api.cmd so dotenv loads payments-api/.env
# - Prints local + public health (including stripe_configured)

$ErrorActionPreference = 'Stop'

$here = $PSScriptRoot
$repoRoot = Split-Path -Parent $here

$exeName = 'payments-api'

$procs = Get-Process $exeName -ErrorAction SilentlyContinue
if ($procs) {
  Write-Host "Stopping $($procs.Count) running $exeName process(es)..." -ForegroundColor Yellow
  $procs | Stop-Process -Force
  Start-Sleep -Milliseconds 400
}

Write-Host "Starting payments-api via run-payments-api.cmd (loads .env)..." -ForegroundColor Cyan
$cmd = Join-Path $here 'run-payments-api.cmd'
if (-not (Test-Path -LiteralPath $cmd)) {
  throw "Missing: $cmd"
}

# Start in a new hidden window; logs are written by run-payments-api.cmd
Start-Process -FilePath $cmd -WorkingDirectory $here -WindowStyle Hidden | Out-Null
Start-Sleep -Seconds 1

function Get-Health($url) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 10
    return @{ ok = $true; status = $r.StatusCode; body = ($r.Content | ConvertFrom-Json) }
  } catch {
    return @{ ok = $false; error = $_.Exception.Message }
  }
}

$local = Get-Health 'http://127.0.0.1:8081/api/health'
if (-not $local.ok) {
  Write-Host "Local health FAILED: $($local.error)" -ForegroundColor Red
  exit 1
}

Write-Host "Local health OK: stripe_configured=$($local.body.stripe_configured)" -ForegroundColor Green

$public = Get-Health 'https://api.y3kmarkets.com/api/health'
if ($public.ok) {
  Write-Host "Public health OK: stripe_configured=$($public.body.stripe_configured)" -ForegroundColor Green
} else {
  Write-Host "Public health check failed (tunnel/DNS?): $($public.error)" -ForegroundColor Yellow
}
