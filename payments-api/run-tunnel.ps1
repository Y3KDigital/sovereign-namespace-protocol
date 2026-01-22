# Run Cloudflare Tunnel for the payments-api.
#
# This uses the repo-local tunnel config in `payments-api/cloudflared.yml` so it won't accidentally
# start whatever tunnel is configured in your user profile config.yml.
#
# Logs are written to `payments-api/run.cloudflared.log`.

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$cfg = Join-Path $PSScriptRoot 'cloudflared.yml'
$log = Join-Path $PSScriptRoot 'run.cloudflared.log'
$errLog = Join-Path $PSScriptRoot 'run.cloudflared.err.log'

if (-not (Test-Path -LiteralPath $cfg)) {
  throw "Missing tunnel config: $cfg"
}

$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
  throw 'cloudflared not found on PATH. Install it, then re-run.'
}

"[$(Get-Date -Format o)] starting cloudflared tunnel (config=$cfg)" | Out-File -FilePath $log -Append -Encoding utf8

"[$(Get-Date -Format o)] starting cloudflared tunnel (config=$cfg)" | Out-File -FilePath $errLog -Append -Encoding utf8

$argString = "tunnel --config `"$cfg`" run"

$proc = Start-Process -FilePath $cloudflared.Source -WorkingDirectory $repoRoot -ArgumentList $argString -RedirectStandardOutput $log -RedirectStandardError $errLog -WindowStyle Hidden -PassThru

Write-Host "cloudflared started (pid=$($proc.Id)). Logs: $log (stderr: $errLog)" -ForegroundColor Green
