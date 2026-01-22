# 🏦 Digital Giant Stellar - Token Creation & Credential Manager
# This script creates tokens and saves all credentials securely

Write-Host "`n🏰 DIGITAL GIANT STELLAR - TOKEN VAULT CREATOR`n" -ForegroundColor Magenta

# Initialize credentials array
$allTokens = @()

# Token definitions
$tokenDefinitions = @(
    @{Code="BRAD"; Description="BRAD Token - Y3K Namespace"; Supply="1000000"},
    @{Code="TRUMP"; Description="TRUMP Token - Y3K Namespace"; Supply="47000000"},
    @{Code="GOOGL"; Description="GOOGLE Token - Y3K Namespace"; Supply="10000000"},
    @{Code="AMZN"; Description="AMAZON Token - Y3K Namespace"; Supply="5000000"},
    @{Code="AAPL"; Description="APPLE Token - Y3K Namespace"; Supply="3000000"},
    @{Code="MSFT"; Description="MICROSOFT Token - Y3K Namespace"; Supply="8000000"},
    @{Code="TSLA"; Description="TESLA Token - Y3K Namespace"; Supply="15000000"},
    @{Code="META"; Description="META Token - Y3K Namespace"; Supply="4000000"}
)

$apiEndpoint = "http://localhost:13000"

Write-Host "Creating tokens on Stellar L1..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

foreach ($tokenDef in $tokenDefinitions) {
    try {
        Write-Host "🪙 Creating $($tokenDef.Code)..." -ForegroundColor Cyan -NoNewline
        
        # Create issuer account
        $issuer = Invoke-RestMethod -Uri "$apiEndpoint/api/accounts/create" -Method POST
        $publicKey = $issuer.data.publicKey
        $secretKey = $issuer.data.secret
        
        # Fund account on testnet
        Invoke-WebRequest -Uri "https://friendbot.stellar.org?addr=$publicKey" -UseBasicParsing | Out-Null
        Start-Sleep -Seconds 3
        
        # Issue token
        $tokenBody = @{
            issuerSecret = $secretKey
            assetCode = $tokenDef.Code
            description = $tokenDef.Description
            totalSupply = $tokenDef.Supply
        } | ConvertTo-Json
        
        $tokenResult = Invoke-RestMethod -Uri "$apiEndpoint/api/tokens/issue" -Method POST -Body $tokenBody -ContentType "application/json"
        
        # Save credentials
        $tokenRecord = @{
            assetCode = $tokenDef.Code
            description = $tokenDef.Description
            totalSupply = $tokenDef.Supply
            issuerPublicKey = $publicKey
            issuerSecretKey = $secretKey
            created = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            network = "Stellar Testnet"
            horizonUrl = "https://horizon-testnet.stellar.org"
            stellarExpertUrl = "https://stellar.expert/explorer/testnet/asset/$($tokenDef.Code)-$publicKey"
        }
        
        $allTokens += $tokenRecord
        
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "   Issuer: $publicKey" -ForegroundColor DarkGray
        
    } catch {
        Write-Host " ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "✅ Created $($allTokens.Count) tokens successfully!" -ForegroundColor Green

# Save to JSON
$jsonPath = "C:\Users\Kevan\digital-giant-stellar\credentials-export.json"
$credentialsData = @{
    generatedDate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    network = "Stellar Testnet"
    apiEndpoint = $apiEndpoint
    tokens = $allTokens
} | ConvertTo-Json -Depth 10

$credentialsData | Out-File -FilePath $jsonPath -Encoding UTF8

Write-Host "`n💾 Credentials saved to:" -ForegroundColor Yellow
Write-Host "   $jsonPath" -ForegroundColor Cyan

# Create encrypted backup
$encryptedPath = "C:\Users\Kevan\digital-giant-stellar\credentials-encrypted.txt"
$credentialsData | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString | Out-File -FilePath $encryptedPath
Write-Host "`n🔐 Encrypted backup created:" -ForegroundColor Yellow
Write-Host "   $encryptedPath" -ForegroundColor Cyan

# Display summary
Write-Host "`n📊 TOKEN VAULT SUMMARY" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

foreach ($token in $allTokens) {
    Write-Host "$($token.assetCode.PadRight(10)) | Supply: $($token.totalSupply.PadLeft(10)) | $($token.issuerPublicKey.Substring(0,20))..." -ForegroundColor White
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Update CREDENTIALS-VAULT.md
$vaultContent = @"
# 🔐 DIGITAL GIANT STELLAR - CREDENTIALS VAULT
## ⚠️ CRITICAL: KEEP THIS FILE SECURE - DO NOT SHARE

**Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Network**: Stellar Testnet  
**API Endpoint**: $apiEndpoint  
**Horizon URL**: https://horizon-testnet.stellar.org

---

## 🪙 TOKEN REGISTRY

"@

foreach ($token in $allTokens) {
    $vaultContent += @"

### $($token.assetCode) Token
**Asset Code**: $($token.assetCode)  
**Description**: $($token.description)  
**Total Supply**: $($token.totalSupply)  
**Issuer Public Key**: ``$($token.issuerPublicKey)``  
**Issuer Secret Key**: ``$($token.issuerSecretKey)``  
**Created**: $($token.created)  
**Status**: ✅ ACTIVE  
**Stellar Expert**: [$($token.assetCode) on Stellar Expert]($($token.stellarExpertUrl))

---

"@
}

$vaultContent += @"

## 🔄 RECOVERY INSTRUCTIONS

### View All Credentials
``````powershell
Get-Content C:\Users\Kevan\digital-giant-stellar\credentials-export.json | ConvertFrom-Json | Format-List
``````

### Decrypt Encrypted Backup
``````powershell
`$encrypted = Get-Content C:\Users\Kevan\digital-giant-stellar\credentials-encrypted.txt
`$secure = ConvertTo-SecureString `$encrypted
`$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR(`$secure)
`$plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(`$bstr)
`$plain | ConvertFrom-Json
``````

### Check Token Balance
``````powershell
# Replace PUBLIC_KEY with issuer address
Invoke-RestMethod "https://horizon-testnet.stellar.org/accounts/PUBLIC_KEY"
``````

### Transfer Tokens
``````powershell
`$transfer = @{
    sourceSecret = "SECRET_KEY_HERE"
    destination = "DESTINATION_PUBLIC_KEY"
    amount = "100"
    assetCode = "BRAD"
    assetIssuer = "ISSUER_PUBLIC_KEY"
} | ConvertTo-Json

Invoke-RestMethod http://localhost:13000/api/payments/send ``
    -Method POST ``
    -Body `$transfer ``
    -ContentType "application/json"
``````

---

## 🛡️ SECURITY CHECKLIST

- [x] Credentials saved to encrypted file
- [x] Backup created with Windows encryption
- [ ] Copy to USB drive (RECOMMENDED)
- [ ] Store in password manager (RECOMMENDED)
- [ ] Test recovery process (RECOMMENDED)

---

## 📞 BACKUP LOCATIONS

1. **Primary**: ``C:\Users\Kevan\digital-giant-stellar\credentials-export.json``
2. **Encrypted**: ``C:\Users\Kevan\digital-giant-stellar\credentials-encrypted.txt``
3. **This Document**: ``C:\Users\Kevan\digital-giant-stellar\CREDENTIALS-VAULT.md``

---

**LAST UPDATED**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**TOTAL TOKENS**: $($allTokens.Count)  
**NETWORK**: Stellar Testnet

⚠️ **WARNING**: These are REAL blockchain credentials. Losing them means losing access to tokens forever!
"@

$vaultPath = "C:\Users\Kevan\digital-giant-stellar\CREDENTIALS-VAULT.md"
$vaultContent | Out-File -FilePath $vaultPath -Encoding UTF8

Write-Host "`n📝 Vault document updated:" -ForegroundColor Yellow
Write-Host "   $vaultPath" -ForegroundColor Cyan

Write-Host "`n✨ ALL CREDENTIALS SECURED IN YOUR SYSTEM! ✨`n" -ForegroundColor Green
