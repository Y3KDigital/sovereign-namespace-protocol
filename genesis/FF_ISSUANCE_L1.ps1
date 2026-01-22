# F&F Token Issuance - Private L1 Edition
# Network: Digital Giant Private Network ; January 2026
# Cost: $0.00 per issuance (zero XLM required)

Import-Module ".\y3k-markets-web\scripts\Y3KIssuance.psm1" -Force

# Issuer on YOUR Private L1
$IssuerSecret = "SCBH7ZPFBGAJUKP5MICLHHGO4MCABSXYSNGCLO2TNA57E6SCTSYPH4MM"

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "F&F TOKEN ISSUANCE - PRIVATE L1 BATCH" -ForegroundColor Magenta
Write-Host "Network: Digital Giant Private Network" -ForegroundColor Cyan
Write-Host "Cost: \$0.00 (zero fees)" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Magenta

$issuanceResults = @()

# MID-TIER ($35,000 valuation) - 35,000 tokens
Write-Host "MID-TIER NAMESPACES ($35K valuation - 35,000 tokens each)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------`n" -ForegroundColor DarkGray

# 1. ben.x
Write-Host "1. ben.x -> BEN (35,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "ben.x" -Supply 35000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GDYJH2DDKTYMSOHP7JSWLHO64KSOUZIOFDIW2DRKBGA752AM7UDG3ZLB3" `
    -DistributorSecret "SCTMSLT57Z6W6QNXL75IJEGIG7R725LJ52FFWUHXTJ5EHMYRKFK2FELH"
$issuanceResults += $result

# 2. rogue.x  
Write-Host "`n3. rogue.x -> ROGUE (35,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "rogue.x" -Supply 35000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GCRQAXCBFYXRYEDHZXJMR76NCMBWCWOGTKILDNIQ3OZF5SPLNTP7QP3R" `
    -DistributorSecret "SAOXFQVOQSYF6V6BAA77GSPYHMOQEXBRT5SLSKGYKIBVVXQ5HS723EUN"
$issuanceResults += $result

# NUMERIC PREMIUM
Write-Host "`n`nNUMERIC PREMIUM ($30-35K valuation)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------`n" -ForegroundColor DarkGray

# 3. 77.x (lucky number)
Write-Host "4. 77.x -> N77 (35,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "77.x" -Supply 35000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GAARKP4YZKZ4YSOMGSKRGBBG5U3RLJOA2BMJ22QXZJB5GOIEOVYGKGKX6" `
    -DistributorSecret "SBQCYYDYLGAAVLLS3KOUBKKLBKVYCO4MPHZXJF6H43ZJKLYELMM6FGJB"
$issuanceResults += $result

# 4. 222.x (triple repeating)
Write-Host "`n6. 222.x -> N222 (30,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "222.x" -Supply 30000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GCA5H5ZCJ7XDBPCJBS6Y3MYRJ2G6FFNBUKZGMWCFIKOEQ5MBC5WZZB63" `
    -DistributorSecret "SCDF47PFA3PAWOKVF34DUTS6RV2B5WKYBONKVSVCESYT5VGNCEZF2NSL"
$issuanceResults += $result

# PREMIUM TIER ($50,000 valuation) - 50,000 tokens  
Write-Host "`n`nPREMIUM TIER ($50K valuation - 50,000 tokens each)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------`n" -ForegroundColor DarkGray

# 5. buck.x
Write-Host "7. buck.x -> BUCK (50,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "buck.x" -Supply 50000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GAYDDPDYFJCFACBXYZX2EUXLOVNCWJKIRRRAJIIAB4X4YRIDXG6H3YSY" `
    -DistributorSecret "SA2M74QSLL5IA4CYGGZBUX54ZJL4GNCIBEHBRZ2SCNPROJQOVCJ37KDP"
$issuanceResults += $result

# 6. jimi.x
Write-Host "`n8. jimi.x -> JIMI (50,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "jimi.x" -Supply 50000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GCXMKIIXJXVEOMZ267PZTZHZ7RL4J3VBU3W6H2PI6OFXXKW7VP4MWZ5R" `
    -DistributorSecret "SCNFBYQHNYKKA46QX3NAOU7CBWH5FWNHIIZN3JLJUVXVE6TP7KHGV65Y"
$issuanceResults += $result

# 7. yoda.x
Write-Host "`n9. yoda.x -> YODA (50,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "yoda.x" -Supply 50000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GCPN7ILTKSO2ZR2QJTXYO5ORGIJ6T5H4VANXT5O3JYLMTS7SRK66UYJO" `
    -DistributorSecret "SCR32ZYXQOQY7OY76ILTDA5DWDDJTD4VQS6CVWABWNLYZZC4J6BJQIVM"
$issuanceResults += $result

# 8. trump.x
Write-Host "`n10. trump.x -> TRUMP (50,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "trump.x" -Supply 50000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GA5WEWNGRA3XTQW3IUH6M2HDC2QTS57ZBNX4LY2LZHVW63H6QTG24VEX" `
    -DistributorSecret "SDEATZBA3F3ZOCQP3BM2243CQAWQF2ACHH2DMZH6I57M52W7FXE3O3WC"
$issuanceResults += $result

# STANDARD TIER ($25,000 valuation) - 25,000 tokens
Write-Host "`n`nSTANDARD TIER ($25K valuation - 25,000 tokens each)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------`n" -ForegroundColor DarkGray

# 9. kaci.x
Write-Host "11. kaci.x -> KACI (25,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "kaci.x" -Supply 25000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GB5ORUDHXQI5EVMGFCFVX7SHLUHEKLOL7HY2WDWKHPVZFVDN6ZX5VR7X" `
    -DistributorSecret "SAIZQX6F2PHPXS2TZLM57JGIGWYIUHFG5YCRZLACDLVXDEET2BNULZQW"
$issuanceResults += $result

# 10. konnor.x
Write-Host "`n12. konnor.x -> KONNOR (25,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "konnor.x" -Supply 25000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GBINT6RQBFBLZVW7NVLYQWK5GYB7C5MSB356T6JDAQANVAKYHPLM2EJI" `
    -DistributorSecret "SCO67GJECIVWQ45NNQPMUULGT53FKNNZQJIWG6YK7KHEAUFZ6VNDQXSG"
$issuanceResults += $result

# 11. lael.x
Write-Host "`n13. lael.x -> LAEL (25,000)" -ForegroundColor Yellow
$result = Approve-Namespace -Namespace "lael.x" -Supply 25000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GABW33GLSNRGSDAUJ7LSCO6DXOODFF5K5XEVVXHUGTCFWVMRNK77F5WY" `
    -DistributorSecret "SABZNVWB6VRTWDSTQEVFGN4TEZIWT2NJSJ3NDM4JED7VLVQUFTI262HJ"
$issuanceResults += $result

# Summary
Write-Host "`n`n========================================" -ForegroundColor Green
Write-Host "BATCH COMPLETE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$successful = ($issuanceResults | Where-Object { $_.success -eq $true }).Count
$failed = ($issuanceResults | Where-Object { $_.success -ne $true }).Count

Write-Host "Successful: $successful / 11" -ForegroundColor Green
Write-Host "Failed: $failed / 11" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "Network: Digital Giant Private L1" -ForegroundColor Cyan
Write-Host "Total Cost: \$0.00 (zero fees)`n" -ForegroundColor Green

# Export results
$issuanceResults | ConvertTo-Json -Depth 10 | Out-File -FilePath ".\genesis\FF_ISSUANCE_RESULTS_L1.json" -Encoding UTF8
Write-Host "Results saved to: genesis\FF_ISSUANCE_RESULTS_L1.json" -ForegroundColor White
