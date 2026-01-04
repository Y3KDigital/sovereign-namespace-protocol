param(
    [string]$ApiBaseUrl = $(if ($env:PAYMENTS_API_BASE_URL) { $env:PAYMENTS_API_BASE_URL } else { "http://127.0.0.1:8081" }),
    [string]$AdminToken = $env:AFFILIATE_ADMIN_TOKEN,
    [string]$CsvPath = $(Join-Path $PSScriptRoot "affiliates.sample.csv"),
    [int]$DefaultCommissionBps = 1000,
    [long]$DefaultBonusCents = 0,
    [string]$OutCsvPath = $(Join-Path $PSScriptRoot "affiliates.created.csv"),
    [switch]$NoOutputFile
)

function Fail($msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

if (-not $AdminToken) {
    Fail "AFFILIATE_ADMIN_TOKEN is not set. Provide -AdminToken or set AFFILIATE_ADMIN_TOKEN in your environment (and on the payments-api server)."
}

if (-not (Test-Path $CsvPath)) {
    Fail "CSV not found: $CsvPath`nCreate one like affiliates.sample.csv (columns: display_name,email,commission_bps,bonus_cents)."
}

$api = $ApiBaseUrl.TrimEnd('/')
$endpoint = "$api/api/affiliates"

$rows = Import-Csv -Path $CsvPath
if (-not $rows -or $rows.Count -eq 0) {
    Fail "CSV is empty: $CsvPath"
}

$headers = @{
    'X-Admin-Token' = $AdminToken
}

$results = @()
$failures = @()

Write-Host ("Creating affiliates via {0}" -f $endpoint) -ForegroundColor Cyan

foreach ($row in $rows) {
    $displayName = "$(if ($null -ne $row.display_name) { $row.display_name } else { '' })".Trim()
    $email = "$(if ($null -ne $row.email) { $row.email } else { '' })".Trim()

    if (-not $displayName) {
        $failures += [pscustomobject]@{ display_name = $row.display_name; email = $row.email; error = "display_name missing" }
        continue
    }
    if (-not $email) {
        $failures += [pscustomobject]@{ display_name = $displayName; email = $row.email; error = "email missing" }
        continue
    }

    $commission = $DefaultCommissionBps
    $commissionRaw = "$(if ($null -ne $row.commission_bps) { $row.commission_bps } else { '' })".Trim()
    if ($commissionRaw -ne "") {
        $commission = [int]$commissionRaw
    }

    $bonus = $DefaultBonusCents
    $bonusRaw = "$(if ($null -ne $row.bonus_cents) { $row.bonus_cents } else { '' })".Trim()
    if ($bonusRaw -ne "") {
        $bonus = [long]$bonusRaw
    }

    $body = @{
        display_name = $displayName
        email = $email
        commission_bps = $commission
        bonus_cents = $bonus
    } | ConvertTo-Json

    try {
        $resp = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $body -ContentType 'application/json'

        $results += [pscustomobject]@{
            display_name = $resp.affiliate.display_name
            email = $resp.affiliate.email
            affiliate_id = $resp.affiliate.id
            commission_bps = $resp.affiliate.commission_bps
            bonus_cents = $resp.affiliate.bonus_cents
            portal_url = $resp.portal_url
            referral_url = $resp.referral_url
            portal_token = $resp.affiliate.portal_token
            referral_code = $resp.affiliate.referral_code
            created_at = $resp.affiliate.created_at
        }

        Write-Host ("OK   {0}" -f $displayName) -ForegroundColor Green
    } catch {
        $msg = $_.Exception.Message
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $msg = $_.ErrorDetails.Message
        }

        $failures += [pscustomobject]@{ display_name = $displayName; email = $email; error = $msg }
        Write-Host ("FAIL {0} - {1}" -f $displayName, $msg) -ForegroundColor Red
    }
}

    Write-Host ''
    Write-Host ("Created: {0}; Failed: {1}" -f $results.Count, $failures.Count) -ForegroundColor Cyan

if ($results.Count -gt 0) {
    $results | Select-Object display_name, email, portal_url, referral_url | Format-Table -AutoSize

    if (-not $NoOutputFile) {
        $results | Export-Csv -Path $OutCsvPath -NoTypeInformation
        Write-Host ''
        Write-Host ("Wrote {0}" -f $OutCsvPath) -ForegroundColor Green
    }
}

if ($failures.Count -gt 0) {
    Write-Host ''
    Write-Host 'Failures:' -ForegroundColor Yellow
    $failures | Select-Object display_name, email, error | Format-Table -AutoSize

    exit 2
}
