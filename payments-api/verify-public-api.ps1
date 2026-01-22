param(
  [Parameter(Mandatory = $false)]
  [string]$BaseUrl = "https://api.y3kmarkets.com",

  # The browser origin you want to simulate for CORS checks.
  [Parameter(Mandatory = $false)]
  [string]$Origin = "https://y3kmarkets.com",

  # If set, fail the check unless /api/health reports stripe_configured=true.
  [Parameter(Mandatory = $false)]
  [switch]$RequireStripe
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
  Write-Error $Message
  exit 1
}

function Normalize-BaseUrl([string]$Url) {
  $u = $Url.Trim()
  if ($u.EndsWith("/")) { $u = $u.TrimEnd("/") }
  return $u
}

function Get-Json([string]$Url) {
  $headers = @{
    "Accept" = "application/json"
    "Origin" = $Origin
  }

  # Use Invoke-WebRequest for raw status + headers.
  $resp = Invoke-WebRequest -Uri $Url -Method GET -Headers $headers -UseBasicParsing

  return @{ resp = $resp; json = ($resp.Content | ConvertFrom-Json) }
}

function Assert-HeaderContains($Headers, [string]$Name, [string]$Needle) {
  $val = $Headers[$Name]
  if (-not $val) { Fail "Missing required header: $Name" }
  $s = [string]$val
  if ($s -notmatch [regex]::Escape($Needle)) {
    Fail "Header $Name did not contain '$Needle'. Actual: $s"
  }
}

function Assert-Cors($Headers) {
  $acao = $Headers["Access-Control-Allow-Origin"]
  if (-not $acao) {
    Fail "Missing Access-Control-Allow-Origin (CORS)"
  }

  $acao = [string]$acao
  if ($acao -ne $Origin -and $acao -ne "*") {
    Fail "Access-Control-Allow-Origin mismatch. Expected '$Origin' (or '*'), got '$acao'"
  }

  # Vary: Origin is the safer default when echoing origins.
  $vary = $Headers["Vary"]
  if ($vary) {
    $vary = [string]$vary
    if ($vary -notmatch "(?i)\bOrigin\b") {
      Fail "Vary header exists but does not include 'Origin'. Actual: $vary"
    }
  }
}

$base = Normalize-BaseUrl $BaseUrl

Write-Host "Verifying public Payments API..." -ForegroundColor Cyan
Write-Host "  BaseUrl: $base"
Write-Host "  Origin:  $Origin"

# 1) /api/health
$healthUrl = "$base/api/health"
Write-Host "\nGET $healthUrl" -ForegroundColor Gray

$health = Get-Json $healthUrl
if ($health.resp.StatusCode -ne 200) { Fail "Expected 200 from /api/health" }

Assert-Cors $health.resp.Headers
Assert-HeaderContains $health.resp.Headers "Cache-Control" "no-store"

if ($health.json.status -ne "healthy") { Fail "health.status != 'healthy'" }
if ($health.json.service -ne "payments-api") { Fail "health.service != 'payments-api'" }
if (-not $health.json.version) { Fail "health.version missing" }

if ($RequireStripe -and (-not $health.json.stripe_configured)) {
  $diag = $health.json.stripe_env

  if ($diag) {
    Write-Host "  Stripe diagnostics (non-secret):" -ForegroundColor Yellow
    Write-Host "    api_key_present:    $($diag.api_key_present)" -ForegroundColor Yellow
    Write-Host "    api_key_accepted:   $($diag.api_key_accepted)" -ForegroundColor Yellow
    if ($diag.api_key_source) { Write-Host "    api_key_source:     $($diag.api_key_source)" -ForegroundColor Yellow }
    if ($diag.api_key_rejected_reason) { Write-Host "    api_key_reject:     $($diag.api_key_rejected_reason)" -ForegroundColor Yellow }
    Write-Host "    webhook_present:    $($diag.webhook_secret_present)" -ForegroundColor Yellow
    Write-Host "    webhook_accepted:   $($diag.webhook_secret_accepted)" -ForegroundColor Yellow
    if ($diag.webhook_secret_rejected_reason) { Write-Host "    webhook_reject:     $($diag.webhook_secret_rejected_reason)" -ForegroundColor Yellow }
    Write-Host "    require_stripe:     $($diag.require_stripe)" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor Yellow
  }

  Fail "Stripe is not configured (health.stripe_configured=false). Ensure STRIPE_API_KEY (or STRIPE_SECRET_KEY/STRIPE_SECRET) and STRIPE_WEBHOOK_SECRET are set to full, real values (no '< >', no '...', no inline comments), then restart the API."
}

Write-Host "  OK: health.status=$($health.json.status), version=$($health.json.version)" -ForegroundColor Green

# 2) /api/inventory/status
$invUrl = "$base/api/inventory/status"
Write-Host "\nGET $invUrl" -ForegroundColor Gray

$inv = Get-Json $invUrl
if ($inv.resp.StatusCode -ne 200) { Fail "Expected 200 from /api/inventory/status" }

Assert-Cors $inv.resp.Headers
Assert-HeaderContains $inv.resp.Headers "Cache-Control" "no-store"

# We expect an array of tier objects.
if (-not ($inv.json -is [System.Collections.IEnumerable])) {
  Fail "inventory response is not an array"
}

# Basic shape checks: at least 6 tiers and includes 'mythic'.
$invArray = @($inv.json)
if ($invArray.Count -lt 6) { Fail "inventory array too small: $($invArray.Count)" }

$tiers = $invArray | ForEach-Object { $_.tier }
if ($tiers -notcontains "mythic") { Fail "inventory missing expected tier: mythic" }

Write-Host "  OK: inventory tiers=$($tiers -join ', ')" -ForegroundColor Green

Write-Host "\nAll backend public checks passed." -ForegroundColor Green
