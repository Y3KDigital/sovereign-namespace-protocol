# Verify Y3K Markets deployment truth (Cloudflare Pages)
#
# Purpose:
# - Provide a single-command, audit-friendly verification that the *served* HTML matches expectations.
# - Prefer raw HTTP headers + bodies and avoid reliance on extractors/snapshots.
#
# Usage examples:
#   .\scripts\verify-deploy.ps1
#   .\scripts\verify-deploy.ps1 -BaseUrls "https://y3kmarkets.com","https://x.y3kmarkets.com"
#   .\scripts\verify-deploy.ps1 -BaseUrls "https://18215cb2.y3kmarkets.pages.dev"
#
# Exit codes:
#   0 = PASS
#   1 = FAIL

[CmdletBinding()]
param(
  [Parameter()]
  [string[]]$BaseUrls = @(
    'https://y3kmarkets.pages.dev',
    'https://x.y3kmarkets.com',
    'https://y3kmarkets.com'
  ),

  # HTML must not be cached across deployments.
  [Parameter()]
  [string]$ExpectedHtmlCacheControl = 'no-store',

  # Markers we should NOT see in the homepage body (legacy tier ranges).
  [Parameter()]
  [string[]]$HomepageForbiddenBodyPatterns = @(
    '(?i)mathematically\s+impossible',
    '(?i)physically\s+impossible',
    '9,500\+',
    '9,000\s*-\s*9,499',
    '8,000\s*-\s*8,999',
    '7,000\s*-\s*7,999',
    '6,000\s*-\s*6,999'
  ),

  # Markers we should see in the homepage body (current 0–1000 tier set).
  # Note: HTML may contain encoded dash characters; we check for tier labels + numbers.
  [Parameter()]
  [string[]]$HomepageRequiredBodyPatterns = @(
    'Tier\s*6',
    'Tier\s*1',
    '901',
    '0[-–]1000',
    'Examples are illustrative only'
  ),

  # Status page should never display a loopback API base.
  [Parameter()]
  [string[]]$StatusForbiddenBodyPatterns = @(
    'API Base:\s*http://127\.0\.0\.1',
    'API Base:\s*http://localhost',
    'API Base:\s*http://0\.0\.0\.0',
    'API Base:\s*http://\[::1\]'
  )
)

$ErrorActionPreference = 'Stop'

function Write-Section([string]$Title) {
  Write-Host "" 
  Write-Host $Title -ForegroundColor Cyan
  Write-Host ('-' * $Title.Length) -ForegroundColor DarkCyan
}

function Fail([string]$Message) {
  Write-Host "FAIL: $Message" -ForegroundColor Red
  $script:Failed = $true
}

function Pass([string]$Message) {
  Write-Host "PASS: $Message" -ForegroundColor Green
}

function Assert-HeaderContains([hashtable]$Headers, [string]$HeaderName, [string]$ExpectedSubstring, [string]$Context) {
  $key = $Headers.Keys | Where-Object { $_ -ieq $HeaderName } | Select-Object -First 1
  if (-not $key) {
    Fail "$Context missing header '$HeaderName'"
    return
  }

  $value = [string]$Headers[$key]
  if ($value -notmatch [regex]::Escape($ExpectedSubstring)) {
    Fail "$Context header '$HeaderName' value '$value' does not include '$ExpectedSubstring'"
  } else {
    Pass "$Context header '$HeaderName' includes '$ExpectedSubstring'"
  }
}

function Get-Headers([string]$Url) {
  # curl.exe prints headers to stdout with -D -, and we discard the body.
  $raw = & curl.exe -s -D - -o NUL -m 20 $Url
  if ($LASTEXITCODE -ne 0) {
    throw "curl.exe failed fetching headers: $Url"
  }

  $lines = $raw -split "\r?\n"
  $headers = @{}

  foreach ($line in $lines) {
    if ($line -match '^HTTP/') { continue }
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    $idx = $line.IndexOf(':')
    if ($idx -lt 1) { continue }

    $name = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim()

    # Coalesce multiple header occurrences.
    if ($headers.ContainsKey($name)) {
      $headers[$name] = "$($headers[$name]), $value"
    } else {
      $headers[$name] = $value
    }
  }

  return $headers
}

function Get-Body([string]$Url) {
  $body = & curl.exe --compressed -s -m 20 $Url
  if ($LASTEXITCODE -ne 0) {
    throw "curl.exe failed fetching body: $Url"
  }
  return $body
}

function Assert-BodyAbsent([string]$Body, [string]$Pattern, [string]$Context) {
  if ($Body -match $Pattern) {
    Fail "$Context body unexpectedly matched forbidden pattern: $Pattern"
  } else {
    Pass "$Context body does not match forbidden pattern: $Pattern"
  }
}

function Assert-BodyPresent([string]$Body, [string]$Pattern, [string]$Context) {
  if ($Body -match $Pattern) {
    Pass "$Context body matched required pattern: $Pattern"
  } else {
    Fail "$Context body did NOT match required pattern: $Pattern"
  }
}

$script:Failed = $false

# Normalize BaseUrls: allow callers to pass a single comma-separated string.
$BaseUrls = @(
  $BaseUrls |
    ForEach-Object { $_ -split ',' } |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ }
)

Write-Section "Deployment verification"
Write-Host "Authoritative method: raw HTTP headers + body (curl.exe)" -ForegroundColor DarkGray

foreach ($base in $BaseUrls) {
  $baseTrimmed = $base.TrimEnd('/')
  $homeUrl = "$baseTrimmed/"
  $statusUrl = "$baseTrimmed/status/"

  Write-Section "Endpoint: $baseTrimmed"

  # 1) Header checks
  $headers = Get-Headers $homeUrl
  Assert-HeaderContains -Headers $headers -HeaderName 'Cache-Control' -ExpectedSubstring $ExpectedHtmlCacheControl -Context "GET $homeUrl"

  # 2) Homepage body checks
  $homeBody = Get-Body $homeUrl

  # Fail fast on the known homepage encoding regression (U+0018 / 0x18).
  if ($homeBody.IndexOf([char]0x18) -ge 0) {
    Fail "GET $homeUrl body contains forbidden control character 0x18 (U+0018)"
  } else {
    Pass "GET $homeUrl body does not contain control character 0x18 (U+0018)"
  }

  foreach ($p in $HomepageForbiddenBodyPatterns) {
    Assert-BodyAbsent -Body $homeBody -Pattern $p -Context "GET $homeUrl"
  }

  foreach ($p in $HomepageRequiredBodyPatterns) {
    Assert-BodyPresent -Body $homeBody -Pattern $p -Context "GET $homeUrl"
  }

  # 3) Status page loopback guard checks
  $statusBody = Get-Body $statusUrl
  foreach ($p in $StatusForbiddenBodyPatterns) {
    Assert-BodyAbsent -Body $statusBody -Pattern $p -Context "GET $statusUrl"
  }
}

Write-Section "Result"
if ($script:Failed) {
  Write-Host "One or more checks failed." -ForegroundColor Red
  exit 1
}

Write-Host "All checks passed." -ForegroundColor Green
exit 0
