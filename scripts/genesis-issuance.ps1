param(
  [string]$ApiBase = "http://localhost:8088",
  [string]$FFFile = "data/ff-namespaces.json"
)

Write-Host "⛏️ Genesis issuance…" -ForegroundColor Yellow
$ff = Get-Content $FFFile | ConvertFrom-Json

# Register assets
foreach ($a in $ff) {
  Write-Host "Asset ready: $($a.symbol) ($($a.name))"
}

# Credit initial balances (UCRED to treasuries)
$treasuries = @(
  "acct:treasury:MAIN",
  "acct:treasury:FTH",
  "acct:treasury:MOG"
)

# Helper: POST /internal/posting (credit)
function Post-Credit([string]$account, [string]$asset, [string]$amountWei, [string]$memo) {
  $post = @{
    account = $account
    asset = $asset
    side = "CR"
    amount_wei = $amountWei
    memo = $memo
  } | ConvertTo-Json

  try {
    $result = Invoke-RestMethod "$ApiBase/internal/posting" -Method POST -Body $post -ContentType "application/json"
    if ($result.ok) {
      return $result.id
    } else {
      Write-Warning "Failed: $($result.error)"
      return $null
    }
  } catch {
    Write-Warning "HTTP error: $_"
    return $null
  }
}

Write-Host "→ Crediting UCRED genesis to treasuries" -ForegroundColor Cyan
$oneThousand = "1000000000000000000000"  # 1,000 UCRED (18 decimals)

foreach ($t in $treasuries) {
  $id = Post-Credit -account $t -asset "UCRED" -amountWei $oneThousand -memo "GENESIS"
  if ($id) {
    Write-Host "  ✓ credited 1,000 UCRED to $t (posting: $id)" -ForegroundColor Green
  }
}

Write-Host "`n✅ Genesis issuance completed." -ForegroundColor Green
Write-Host "`nVerify with:" -ForegroundColor Yellow
Write-Host "  GET $ApiBase/assets"
Write-Host "  GET $ApiBase/balances?account=acct:treasury:MAIN"
Write-Host "  GET $ApiBase/audit"
