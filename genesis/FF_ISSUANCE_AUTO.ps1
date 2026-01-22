# F&F Token Issuance - AUTOMATED (No Human Gate)
# Network: Digital Giant Private Network ; January 2026
# Cost: $0.00 per issuance (zero XLM required)

$ErrorActionPreference = "Continue"

# Issuer on YOUR Private L1
$IssuerSecret = "SCBH7ZPFBGAJUKP5MICLHHGO4MCABSXYSNGCLO2TNA57E6SCTSYPH4MM"
$ApiUrl = "http://localhost:13000"

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "F&F AUTOMATED ISSUANCE - PRIVATE L1" -ForegroundColor Magenta
Write-Host "Network: Digital Giant Private Network" -ForegroundColor Cyan
Write-Host "Cost: \$0.00 (zero fees)" -ForegroundColor Green
Write-Host "API: $ApiUrl" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Magenta

# Wait for API to be ready
Write-Host "Checking API availability..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0
$apiReady = $false

while (-not $apiReady -and $retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "$ApiUrl/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $apiReady = $true
            Write-Host "âœ" API ready!" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "  Waiting for API... ($retryCount/$maxRetries)" -ForegroundColor DarkGray
        Start-Sleep -Seconds 2
    }
}

if (-not $apiReady) {
    Write-Host "`nâŒ API not responding at $ApiUrl" -ForegroundColor Red
    Write-Host "Start the Digital Giant API first:" -ForegroundColor Yellow
    Write-Host "  cd stellar-banking" -ForegroundColor White
    Write-Host "  docker-compose -f docker-compose.full.yml up -d`n" -ForegroundColor White
    exit 1
}

$issuances = @(
    @{ namespace = "ben.x"; asset = "BEN"; supply = 35000; dist_pub = "GDYJH2DDKTYMSOHP7JSWLHO64KSOUZIOFDIW2DRKBGA752AM7UDG3ZLB3"; dist_sec = "SCTMSLT57Z6W6QNXL75IJEGIG7R725LJ52FFWUHXTJ5EHMYRKFK2FELH"; tier = "Mid-Tier (\$35K)" },
    @{ namespace = "rogue.x"; asset = "ROGUE"; supply = 35000; dist_pub = "GCRQAXCBFYXRYEDHZXJMR76NCMBWCWOGTKILDNIQ3OZF5SPLNTP7QP3R"; dist_sec = "SAOXFQVOQSYF6V6BAA77GSPYHMOQEXBRT5SLSKGYKIBVVXQ5HS723EUN"; tier = "Mid-Tier (\$35K)" },
    @{ namespace = "77.x"; asset = "N77"; supply = 35000; dist_pub = "GAARKP4YZKZ4YSOMGSKRGBBG5U3RLJOA2BMJ22QXZJB5GOIEOVYGKGKX6"; dist_sec = "SBQCYYDYLGAAVLLS3KOUBKKLBKVYCO4MPHZXJF6H43ZJKLYELMM6FGJB"; tier = "Numeric (\$35K)" },
    @{ namespace = "222.x"; asset = "N222"; supply = 30000; dist_pub = "GCA5H5ZCJ7XDBPCJBS6Y3MYRJ2G6FFNBUKZGMWCFIKOEQ5MBC5WZZB63"; dist_sec = "SCDF47PFA3PAWOKVF34DUTS6RV2B5WKYBONKVSVCESYT5VGNCEZF2NSL"; tier = "Numeric (\$30K)" },
    @{ namespace = "buck.x"; asset = "BUCK"; supply = 50000; dist_pub = "GAYDDPDYFJCFACBXYZX2EUXLOVNCWJKIRRRAJIIAB4X4YRIDXG6H3YSY"; dist_sec = "SA2M74QSLL5IA4CYGGZBUX54ZJL4GNCIBEHBRZ2SCNPROJQOVCJ37KDP"; tier = "Premium (\$50K)" },
    @{ namespace = "jimi.x"; asset = "JIMI"; supply = 50000; dist_pub = "GCXMKIIXJXVEOMZ267PZTZHZ7RL4J3VBU3W6H2PI6OFXXKW7VP4MWZ5R"; dist_sec = "SCNFBYQHNYKKA46QX3NAOU7CBWH5FWNHIIZN3JLJUVXVE6TP7KHGV65Y"; tier = "Premium (\$50K)" },
    @{ namespace = "yoda.x"; asset = "YODA"; supply = 50000; dist_pub = "GCPN7ILTKSO2ZR2QJTXYO5ORGIJ6T5H4VANXT5O3JYLMTS7SRK66UYJO"; dist_sec = "SCR32ZYXQOQY7OY76ILTDA5DWDDJTD4VQS6CVWABWNLYZZC4J6BJQIVM"; tier = "Premium (\$50K)" },
    @{ namespace = "trump.x"; asset = "TRUMP"; supply = 50000; dist_pub = "GA5WEWNGRA3XTQW3IUH6M2HDC2QTS57ZBNX4LY2LZHVW63H6QTG24VEX"; dist_sec = "SDEATZBA3F3ZOCQP3BM2243CQAWQF2ACHH2DMZH6I57M52W7FXE3O3WC"; tier = "Premium (\$50K)" },
    @{ namespace = "kaci.x"; asset = "KACI"; supply = 25000; dist_pub = "GB5ORUDHXQI5EVMGFCFVX7SHLUHEKLOL7HY2WDWKHPVZFVDN6ZX5VR7X"; dist_sec = "SAIZQX6F2PHPXS2TZLM57JGIGWYIUHFG5YCRZLACDLVXDEET2BNULZQW"; tier = "Standard (\$25K)" },
    @{ namespace = "konnor.x"; asset = "KONNOR"; supply = 25000; dist_pub = "GBINT6RQBFBLZVW7NVLYQWK5GYB7C5MSB356T6JDAQANVAKYHPLM2EJI"; dist_sec = "SCO67GJECIVWQ45NNQPMUULGT53FKNNZQJIWG6YK7KHEAUFZ6VNDQXSG"; tier = "Standard (\$25K)" },
    @{ namespace = "lael.x"; asset = "LAEL"; supply = 25000; dist_pub = "GABW33GLSNRGSDAUJ7LSCO6DXOODFF5K5XEVVXHUGTCFWVMRNK77F5WY"; dist_sec = "SABZNVWB6VRTWDSTQEVFGN4TEZIWT2NJSJ3NDM4JED7VLVQUFTI262HJ"; tier = "Standard (\$25K)" }
)

$results = @()
$successCount = 0
$failCount = 0

foreach ($token in $issuances) {
    Write-Host "`n-----------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "$($token.namespace) -> $($token.asset) ($($token.supply.ToString('N0')) tokens) [$($token.tier)]" -ForegroundColor Cyan
    Write-Host "-----------------------------------------------------------" -ForegroundColor DarkGray

    try {
        # Call Node.js issuance script with proper flags
        $result = node ".\y3k-markets-web\scripts\namespace-issuance-dg.js" `
            --namespace $token.namespace `
            --assetCode $token.asset `
            --supply $token.supply `
            --issuerSecret $IssuerSecret `
            --distributor $token.dist_pub `
            --distributorSecret $token.dist_sec `
            2>&1 | Out-String

        # Parse JSON result
        $jsonMatch = $result -match '(?s)\{.*"success".*\}'
        if ($jsonMatch) {
            $jsonText = $Matches[0]
            $parsed = $jsonText | ConvertFrom-Json

            if ($parsed.success) {
                Write-Host "âœ" SUCCESS" -ForegroundColor Green
                Write-Host "  Asset: $($parsed.asset.code)" -ForegroundColor White
                Write-Host "  Supply: $($parsed.asset.supply)" -ForegroundColor White
                Write-Host "  Tx Hash: $($parsed.txHash)" -ForegroundColor White
                Write-Host "  Ledger: $($parsed.ledger)" -ForegroundColor White
                $successCount++
            } else {
                Write-Host "âŒ FAILED: $($parsed.error)" -ForegroundColor Red
                $failCount++
            }

            $results += $parsed
        } else {
            Write-Host "âŒ FAILED: Could not parse response" -ForegroundColor Red
            Write-Host $result -ForegroundColor DarkGray
            $failCount++
        }

    } catch {
        Write-Host "âŒ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }

    Start-Sleep -Milliseconds 500
}

# Summary
Write-Host "`n`n========================================" -ForegroundColor Green
Write-Host "BATCH COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Successful: $successCount / $($issuances.Count)" -ForegroundColor $(if ($successCount -eq $issuances.Count) { "Green" } else { "Yellow" })
Write-Host "Failed: $failCount / $($issuances.Count)" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "Network: Digital Giant Private L1" -ForegroundColor Cyan
Write-Host "Total Cost: \$0.00 (zero fees)`n" -ForegroundColor Green

# Export results
if ($results.Count -gt 0) {
    $results | ConvertTo-Json -Depth 10 | Out-File -FilePath ".\genesis\FF_ISSUANCE_RESULTS_L1_AUTO.json" -Encoding UTF8
    Write-Host "Results: genesis\FF_ISSUANCE_RESULTS_L1_AUTO.json" -ForegroundColor White
}

# Query registry
Write-Host "`nQuerying issuance registry..." -ForegroundColor Yellow
try {
    $registryOutput = node ".\y3k-markets-web\scripts\track-issuance.js" list 2>&1
    Write-Host $registryOutput -ForegroundColor White
} catch {
    Write-Host "Registry query failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDone!`n" -ForegroundColor Green
