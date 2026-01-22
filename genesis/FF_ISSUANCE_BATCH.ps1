# F&F Token Issuance Batch Script
# Based on Unstoppable Domains Valuation Comparables
# Issuer: GDMPZQEQHWZ7KGEILXYVBNOT4QCOWSVFDDHMWL42IM2VZWUEZC6AQ72M

# Import module
Import-Module ".\y3k-markets-web\scripts\Y3KIssuance.psm1" -Force

$IssuerSecret = "SCBH7ZPFBGAJUKP5MICLHHGO4MCABSXYSNGCLO2TNA57E6SCTSYPH4MM"

# Already Issued (Symbolic Tests - WRONG SUPPLY)
# brad.x: 1,000 BRAD (should be 50,000)
# 333.x: 100 N333 (should be 30,000)

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "F&F TOKEN ISSUANCE - BATCH EXECUTION" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# MID-TIER ($35,000 valuation) - 35,000 tokens
Write-Host "MID-TIER NAMESPACES ($35K valuation - 35,000 tokens each)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------`n" -ForegroundColor DarkGray

# 1. ben.x
Write-Host "1. ben.x -> BEN (35,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "ben.x" -Supply 35000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GDYJH2DDKTYMSOHP7JSWLHO64KSOUZIOFDIW DRKBGA752AM7UDG3ZLB3" `
    -DistributorSecret "SCTMSLT57Z6W6QNXL75IJEGIG7R725LJ52FFWUHXTJ5EHMYRKFK2FELH"

# 2. don.x
Write-Host "`n2. don.x -> DON (35,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "don.x" -Supply 35000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GD5DP6GGUIXVBONNRVK42IBNB7ILXXVGD7N3KJ7RTJNHNRNDUJFBYYZC" `
    -DistributorSecret "SAJC2MPMWLUAUN2EU4R5O5IKLTHSIVAS3JFXDB5G4NV3YNUCL36BPJRV"

# 3. rogue.x
Write-Host "`n3. rogue.x -> ROGUE (35,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "rogue.x" -Supply 35000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GCRQAXCBFYXRYEDHZXJMR76NCMBWCWOGT KILDNIQ3OZF5SPLNTP7QP3R" `
    -DistributorSecret "SAOXFQVOQSYF6V6BAA77GSPYHMOQEXBRT5SLSKGYKIBVVXQ5HS723EUN"

# NUMERIC PREMIUM ($30-35K valuation) - 30,000-35,000 tokens
Write-Host "`n`nNUMERIC PREMIUM ($30-35K valuation)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------`n" -ForegroundColor DarkGray

# 4. 77.x (lucky number, double)
Write-Host "4. 77.x -> N77 (35,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "77.x" -Supply 35000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GAARKP4YZKZ4YSOMGSKRGBBG5U3RLJOA BMJ22QXZJB5GOIEOVYGKGKX6" `
    -DistributorSecret "SBQCYYDYLGAAVLLS3KOUBKKLBKVYCO4MPHZXJF6H43ZJKLYELMM6FGJB"

# 5. 88.x (Chinese lucky number)
Write-Host "`n5. 88.x -> N88 (35,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "88.x" -Supply 35000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GCVADSG2LDHWWGX3FQN5ID46MW5MBD2KGJLYSUBTNHTYS5M5DEQBLKKM" `
    -DistributorSecret "SAQSVQK7EN4S5TQ6VFLXWJFPA4LLHPBP3TWFQ3RFDM75WZXXKDSLGXFD"

# 6. 222.x (triple repeating)
Write-Host "`n6. 222.x -> N222 (30,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "222.x" -Supply 30000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GCA5H5ZCJ7XDBPCJBS6Y3MYRJ2G6FFNBUKZGMWCFIKOEQ5MBC5WZZB63" `
    -DistributorSecret "SCDF47PFA3PAWOKVF34DUTS6RV2B5WKYBONKVSVCESYT5VGNCEZF2NSL"

# PREMIUM TIER ($50,000 valuation) - 50,000 tokens
Write-Host "`n`nPREMIUM TIER ($50K valuation - 50,000 tokens each)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------`n" -ForegroundColor DarkGray

# 7. buck.x
Write-Host "7. buck.x -> BUCK (50,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "buck.x" -Supply 50000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GAYDDPDYFJCFACBXYZX2EUXLOVNCWJKIRRRAJIIAB4X4YRIDXG6H3YSY" `
    -DistributorSecret "SA2M74QSLL5IA4CYGGZBUX54ZJL4GNCIBEHBRZ2SCNPROJQOVCJ37KDP"

# 8. jimi.x
Write-Host "`n8. jimi.x -> JIMI (50,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "jimi.x" -Supply 50000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GCXMKIIXJXVEOMZ267PZTZHZ7RL4J3VBU3W6H2PI6OFXXKW7VP4MWZ5R" `
    -DistributorSecret "SCNFBYQHNYKKA46QX3NAOU7CBWH5FWNHIIZN3JLJUVXVE6TP7KHGV65Y"

# 9. yoda.x
Write-Host "`n9. yoda.x -> YODA (50,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "yoda.x" -Supply 50000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GCPN7ILTKSO2ZR2QJTXYO5ORGIJ6T5H4VANXT5O3JYLMTS7SRK66UYJO" `
    -DistributorSecret "SCR32ZYXQOQY7OY76ILTDA5DWDDJTD4VQS6CVWABWNLYZZC4J6BJQIVM"

# 10. trump.x
Write-Host "`n10. trump.x -> TRUMP (50,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "trump.x" -Supply 50000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GA5WEWNGRA3XTQW3IUH6M2HDC2QTS57ZBNX4LY2LZHVW63H6QTG24VEX" `
    -DistributorSecret "SDEATZBA3F3ZOCQP3BM2243CQAWQF2ACHH2DMZH6I57M52W7FXE3O3WC"

# STANDARD TIER ($25,000 valuation) - 25,000 tokens
Write-Host "`n`nSTANDARD TIER ($25K valuation - 25,000 tokens each)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------`n" -ForegroundColor DarkGray

# 11. kaci.x
Write-Host "11. kaci.x -> KACI (25,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "kaci.x" -Supply 25000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GB5ORUDHXQI5EVMGFCFVX7SHLUHEKLOL7HY2WDWKHPVZFVDN6ZX5VR7X" `
    -DistributorSecret "SAIZQX6F2PHPXS2TZLM57JGIGWYIUHFG5YCRZLACDLVXDEET2BNULZQW"

# 12. konnor.x
Write-Host "`n12. konnor.x -> KONNOR (25,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "konnor.x" -Supply 25000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GBINT6RQBFBLZVW7NVLYQWK5GYB7C5MSB356T6JDAQANVAKYHPLM2EJI" `
    -DistributorSecret "SCO67GJECIVWQ45NNQPMUULGT53FKNNZQJIWG6YK7KHEAUFZ6VNDQXSG"

# 13. lael.x
Write-Host "`n13. lael.x -> LAEL (25,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "lael.x" -Supply 25000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GABW33GLSNRGSDAUJ7LSCO6DXOODFF5K5XEVVXHUGTCFWVMRNK77F5WY" `
    -DistributorSecret "SABZNVWB6VRTWDSTQEVFGN4TEZIWT2NJSJ3NDM4JED7VLVQUFTI262HJ"

# 14. 45.x (historical reference)
Write-Host "`n14. 45.x -> N45 (25,000)" -ForegroundColor Yellow
Approve-Namespace -Namespace "45.x" -Supply 25000 `
    -IssuerSecret $IssuerSecret `
    -DistributorPublicKey "GDJG2IYTEOH23MBNNGJZM24GCFMEMLCNKAD4TBM2EWYYE6VYYIUO6JLC" `
    -DistributorSecret "SA5XJECPTRJCCI5WPICCA6UTSMO6KQW2P4SSWRH33D5QHBQSEMFAJ37G"

Write-Host "`n`n========================================" -ForegroundColor Green
Write-Host "BATCH COMPLETE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
Write-Host "Total Issued: 14 F&F namespaces" -ForegroundColor White
Write-Host "Total Token Supply: 485,000 tokens" -ForegroundColor White
Write-Host "Average Valuation: $34,643 per namespace`n" -ForegroundColor White
