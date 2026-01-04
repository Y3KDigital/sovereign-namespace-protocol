param(
    [string]$CsvPath = $(Join-Path $PSScriptRoot "affiliates.created.csv"),
    [string]$OutDir = $(Join-Path $PSScriptRoot "outreach"),
    [switch]$SingleFile,
    [string]$SingleFileName = "broker-invites.txt"
)

function Fail($msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $CsvPath)) {
    Fail "CSV not found: $CsvPath"
}

if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$rows = Import-Csv -Path $CsvPath
if (-not $rows -or $rows.Count -eq 0) {
    Fail "CSV is empty: $CsvPath"
}

function RequireColumns($rows, [string[]]$cols) {
    $props = @()
    if ($rows -and $rows.Count -gt 0) {
        $props = @($rows[0].PSObject.Properties.Name)
    }
    foreach ($c in $cols) {
        if (-not ($props -contains $c)) {
            Fail "CSV missing required column '$c'. Present columns: $($props -join ', ')"
        }
    }
}

RequireColumns $rows @('display_name', 'portal_url', 'referral_url')

for ($i = 0; $i -lt $rows.Count; $i++) {
    $row = $rows[$i]
    $who = ("$($row.display_name)".Trim())
    if (-not $who) { $who = "row $($i + 1)" }

    $portal = ("$($row.portal_url)".Trim())
    $ref = ("$($row.referral_url)".Trim())

    if (-not $portal) { Fail "Missing portal_url for $who" }
    if (-not $ref) { Fail "Missing referral_url for $who" }
}

function RenderInvite($row) {
@"
Subject: Your Y3K Markets Partner Portal (private access)

$row.display_name,

As discussed, here is your private Partner Portal link. This is your console for attribution, conversions, and commission visibility.

Partner Portal (private — do not forward):
$row.portal_url

Your referral invite link (public — share with prospects):
$row.referral_url

Operating note:
- The portal link functions as an access credential.
- The invite link records attribution and captures leads.

If you need your commission schedule adjusted or prefer a branded invite page, reply to this message and we will align it.

Respectfully,
Y3K Markets
"@
}

if ($SingleFile) {
    $outPath = Join-Path $OutDir $SingleFileName
    $content = @()
    foreach ($row in $rows) {
        $content += (RenderInvite $row)
        $content += "---"
        $content += ""
    }
    $content | Set-Content -Path $outPath -Encoding UTF8
    Write-Host ("Wrote {0}" -f $outPath) -ForegroundColor Green
    exit 0
}

foreach ($row in $rows) {
    $name = ("$($row.display_name)".Trim())
    if (-not $name) { $name = 'broker' }

    $safe = $name.ToLowerInvariant()
    $safe = $safe -replace '[^a-z0-9]+','-'
    $safe = $safe.Trim('-')

    $outPath = Join-Path $OutDir ("invite-{0}.txt" -f $safe)
    (RenderInvite $row) | Set-Content -Path $outPath -Encoding UTF8
}

Write-Host ("Wrote {0} invite files to {1}" -f $rows.Count, $OutDir) -ForegroundColor Green
