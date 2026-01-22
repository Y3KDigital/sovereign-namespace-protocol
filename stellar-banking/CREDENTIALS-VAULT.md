# 🔐 DIGITAL GIANT STELLAR - CREDENTIALS VAULT
## ⚠️ CRITICAL: KEEP THIS FILE SECURE - DO NOT SHARE

**Created**: January 20, 2026  
**Network**: Stellar Testnet  
**API Endpoint**: http://localhost:13000

---

## 🏦 MASTER ACCOUNTS

### Infrastructure Accounts
These accounts power the Digital Giant Stellar system.

---

## 🪙 TOKEN ISSUERS & WALLETS

### BRAD Token (brad.x Namespace)
**Asset Code**: BRAD  
**Issuer Public Key**: `GCRP6UEZO6S6AFSXQZJKL4H6NOOQPX3ATBQIVV6EV45WJUC7A3I6HEZV`  
**Issuer Secret Key**: `[STORED IN master-credentials.json]`  
**Total Supply**: 1,000,000 BRAD  
**Description**: BRAD Token - Y3K Namespace  
**Status**: ✅ ACTIVE  
**Created**: 2026-01-20  
**Stellar Expert**: https://stellar.expert/explorer/testnet/asset/BRAD-GCRP6UEZO6S6AFSXQZJKL4H6NOOQPX3ATBQIVV6EV45WJUC7A3I6HEZV

---

### ELON Token (elon.x Namespace)
**Asset Code**: ELON  
**Issuer Public Key**: `GCBJXM5TZUVDUQYXYDG5HC5MDGTZDG2QHMNZBW5ZLVBD5B7EI7TDRQNC`  
**Issuer Secret Key**: `SDD5MN6DLC744R2K46TZ34BR22P3WXE4O4IP2UXIMD76QX7Y45P4ZXLE`  
**Total Supply**: 1,000,000 ELON  
**Description**: ELON Token - Y3K Namespace  
**Status**: ✅ ACTIVE  
**Created**: 2026-01-20  
**Stellar Expert**: https://stellar.expert/explorer/testnet/asset/ELON-GCBJXM5TZUVDUQYXYDG5HC5MDGTZDG2QHMNZBW5ZLVBD5B7EI7TDRQNC

---

### DOGE Token (doge.x Namespace)
**Asset Code**: DOGE  
**Issuer Public Key**: `GDD24JUHBBO5VP6FD4T4QEMZUKTWTIVWQM6EBRSTXY32EU4QXHEVTLCL`  
**Issuer Secret Key**: `SDB6MRHI4X6BIYRMYPOJOHBPANC4UFIAL646TS76VEVODQD3VN2KHAEM`  
**Total Supply**: 1,000,000 DOGE  
**Description**: DOGE Token - Y3K Namespace  
**Status**: ✅ ACTIVE  
**Created**: 2026-01-20  
**Stellar Expert**: https://stellar.expert/explorer/testnet/asset/DOGE-GDD24JUHBBO5VP6FD4T4QEMZUKTWTIVWQM6EBRSTXY32EU4QXHEVTLCL

---

### PEPE Token (pepe.x Namespace)
**Asset Code**: PEPE  
**Issuer Public Key**: `GDGIQESPREV53WMC7JL277PUX4D5EWK7SPR55TGGEQDZCRJSOO5OMFBW`  
**Issuer Secret Key**: `SAQKFIN6US6O2P4YUH4SJIDYTVPNDVGEOAW3SNQZJWNK3CUFXFUPLI7L`  
**Total Supply**: 1,000,000 PEPE  
**Description**: PEPE Token - Y3K Namespace  
**Status**: ✅ ACTIVE  
**Created**: 2026-01-20  
**Stellar Expert**: https://stellar.expert/explorer/testnet/asset/PEPE-GDGIQESPREV53WMC7JL277PUX4D5EWK7SPR55TGGEQDZCRJSOO5OMFBW

---

## 📝 BACKUP INSTRUCTIONS

### Export All Credentials
```powershell
# View this file
Get-Content C:\Users\Kevan\digital-giant-stellar\CREDENTIALS-VAULT.md

# Create encrypted backup
Get-Content C:\Users\Kevan\digital-giant-stellar\credentials-export.json | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString | Out-File C:\Users\Kevan\digital-giant-stellar\credentials-encrypted.txt
```

### Import Credentials to Another System
```powershell
# Copy these files to new system:
# 1. credentials-export.json
# 2. CREDENTIALS-VAULT.md
# 3. .env
```

---

## 🛡️ SECURITY NOTES

1. **Never commit this file to Git** - Added to .gitignore
2. **Backup regularly** - Copy to encrypted USB drive
3. **Use hardware wallet for production** - Testnet keys only here
4. **Rotate keys quarterly** - Update this file when rotated
5. **Restrict file permissions** - Windows: Right-click → Properties → Security → Edit

---

## 🔄 KEY ROTATION SCHEDULE

| Account Type | Last Rotated | Next Rotation | Status |
|--------------|--------------|---------------|--------|
| BRAD Issuer | 2026-01-20 | 2026-04-20 | ✅ Current |

---

## 📞 RECOVERY CONTACTS

**Primary**: Your secure location  
**Backup**: Encrypted cloud storage (specify location)  
**Emergency**: Hardware wallet backup (if using)

---

## ⚡ QUICK REFERENCE

### Check Balance
```powershell
# Replace PUBLIC_KEY with any address above
Invoke-RestMethod "https://horizon-testnet.stellar.org/accounts/PUBLIC_KEY"
```

### Send Payment
```powershell
$payment = @{
  sourceSecret = "SECRET_KEY_HERE"
  destination = "DESTINATION_PUBLIC_KEY"
  amount = "100"
  assetCode = "BRAD"
  assetIssuer = "ISSUER_PUBLIC_KEY"
} | ConvertTo-Json

Invoke-RestMethod http://localhost:13000/api/payments/send -Method POST -Body $payment -ContentType "application/json"
```

---

**LAST UPDATED**: 2026-01-20  
**VERSION**: 1.0  
