# 🚀 F&F Token Issuance - QUICK START

**Status**: ✅ READY  
**Time to First Token**: ~5 minutes

---

## Prerequisites Check

```powershell
# 1. Verify Stellar banking system
Test-Path "C:\Users\Kevan\web3 true web3 rarity\stellar-banking\dist\services\token-minting.service.js"
# Should return: True ✅

# 2. Verify bridge script
Test-Path "C:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\scripts\namespace-issuance.js"
# Should return: True ✅

# 3. Check Node.js
node --version
# Should show: v18.x or higher

# 4. Check npm packages
cd "C:\Users\Kevan\web3 true web3 rarity\stellar-banking"
npm list @stellar/stellar-sdk
# Should show: @stellar/stellar-sdk@12.x.x
```

---

## Step 1: Get Your Issuer Account

You already have one (used for ELON token):

**Issuer Public Key**: GDMPZQ...6AQ72M (your full key from ELON issuance)

```powershell
# Check balance
Start-Process "https://stellar.expert/explorer/public/account/GDMPZQ...6AQ72M"
```

**Need**: Minimum 5 XLM per token (80 XLM total for 16 F&F tokens)

If balance low, fund from:
- Stellar wallet (Lobstr, Freighter)
- Exchange (Kraken, Binance) → Withdraw to Stellar address

---

## Step 2: Create Distributor Account

```powershell
# Generate new keypair
cd "C:\Users\Kevan\web3 true web3 rarity\stellar-banking"
node -e "const { Keypair } = require('@stellar/stellar-sdk'); const pair = Keypair.random(); console.log('Public:', pair.publicKey()); console.log('Secret:', pair.secret());"
```

**Save both keys!** You'll need:
- Public key for PowerShell command
- Secret key for future token distribution

Fund distributor with 2 XLM minimum (from your issuer account or wallet).

---

## Step 3: Test Issuance (333.x)

```powershell
# Load PowerShell module
Import-Module "C:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\scripts\Y3KIssuance.psm1" -Force

# Issue test token (replace YOUR_* with actual keys)
Approve-Namespace `
    -Namespace "333.x" `
    -Supply 100 `
    -IssuerSecret "YOUR_ISSUER_SECRET_KEY" `
    -DistributorPublicKey "YOUR_DISTRIBUTOR_PUBLIC_KEY"
```

**You'll see**:
1. Genesis certificate loaded (333.json)
2. Asset code derived (N333)
3. Issuance summary
4. **Prompt: "Type YES to authorize"**

**Type**: `YES` (then Enter)

**Expected output**:
- ✅ ISSUANCE COMPLETE
- 🔗 Transaction Hash: (64-character hex)
- 🌐 Stellar Expert: (clickable URL)
- ✅ Session state updated

---

## Step 4: Verify on Blockchain

```powershell
# Copy transaction hash from output
$TxHash = "paste_your_transaction_hash_here"

# Open in browser
Start-Process "https://stellar.expert/explorer/public/tx/$TxHash"
```

**Should see**:
- ✅ Transaction status: Success
- ✅ Operation type: Payment
- ✅ Amount: 100 N333
- ✅ From: Your issuer
- ✅ To: Your distributor

---

## Step 5: Batch Issue F&F Tokens

Once test succeeds, batch all 16:

```powershell
# Define F&F list
$FandFNamespaces = @(
    "brad.x", "buck.x", "jimi.x", "don.x", "ben.x",
    "kaci.x", "konnor.x", "lael.x", "rogue.x", "trump.x", "yoda.x",
    "222.x", "333.x", "45.x", "77.x", "88.x"
)

# Your credentials (replace with actual keys)
$IssuerSecret = "YOUR_ISSUER_SECRET_KEY"
$DistributorPublicKey = "YOUR_DISTRIBUTOR_PUBLIC_KEY"

# Batch issue
foreach ($Namespace in $FandFNamespaces) {
    Write-Host "`n━━━━━ Issuing: $Namespace ━━━━━" -ForegroundColor Cyan
    
    Approve-Namespace `
        -Namespace $Namespace `
        -Supply 1000000 `
        -IssuerSecret $IssuerSecret `
        -DistributorPublicKey $DistributorPublicKey
    
    # Type YES when prompted for each namespace
    
    Start-Sleep -Seconds 2  # Rate limiting
}
```

**Time**: ~15 minutes (you'll type YES 16 times)

---

## Step 6: Verify All Tokens

```powershell
# Open your issuer account on Stellar Expert
Start-Process "https://stellar.expert/explorer/public/account/YOUR_ISSUER_PUBLIC_KEY"
```

**Should see** in "Assets" tab:
- BRAD (1,000,000 supply)
- BUCK (1,000,000 supply)
- JIMI (1,000,000 supply)
- ... (all 16 tokens)

---

## Troubleshooting

### Error: "Cannot find module"
```powershell
cd "C:\Users\Kevan\web3 true web3 rarity\stellar-banking"
npm install
```

### Error: "Account not found"
Your issuer needs funding. Send XLM from wallet first.

### Error: "Invalid secret key"
Secret key format: `S` + 55 more characters (56 total)

### PowerShell command not found
```powershell
Import-Module "C:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\scripts\Y3KIssuance.psm1" -Force
```

### Transaction fails silently
Check Horizon status: https://status.stellar.org/

---

## Quick Reference

```powershell
# Import module
Import-Module "C:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\scripts\Y3KIssuance.psm1" -Force

# Issue single token
Approve-Namespace -Namespace "333.x" -Supply 100 -IssuerSecret "S..." -DistributorPublicKey "G..."

# Check issuer balance
Start-Process "https://stellar.expert/explorer/public/account/GDMPZQ..."

# View asset
Start-Process "https://stellar.expert/explorer/public/asset/N333-GDMPZQ..."
```

---

## Asset Code Derivation Rules

- **Letters**: brad.x → BRAD
- **Numbers < 100**: 77.x → N77
- **Numbers ≥ 100**: 333.x → N333
- **Max length**: 12 characters
- **Allowed**: A-Z, 0-9 only

---

## Safety Checklist

Before issuing on mainnet:

- [ ] Tested with 333.x (small amount)
- [ ] Issuer account funded (80+ XLM)
- [ ] Distributor account created and funded
- [ ] Secret keys stored securely (NOT in plaintext files)
- [ ] PowerShell module loaded successfully
- [ ] Ready to type YES 16 times (human authorization)

---

## After Issuance

1. **Save Transaction Hashes**
   - Document each token's txHash
   - Store in genesis/ARTIFACTS/ff-issuance-results.csv

2. **Send Invitations**
   - Use INVITATION_EMAIL_TEMPLATE.md
   - Include Stellar Explorer links

3. **Monitor Trustlines**
   - Recipients must establish trustlines before receiving tokens
   - Check Stellar Expert for trustline activity

4. **Prepare ISSUED → ACTIVE Transition**
   - Wait 4-7 days (ceremonial period)
   - Review initial activity
   - Enable public trading via PowerShell

---

**Ready?**

```powershell
Import-Module "C:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\scripts\Y3KIssuance.psm1" -Force
Approve-Namespace -Namespace "333.x" -Supply 100 -IssuerSecret "YOUR_SECRET" -DistributorPublicKey "YOUR_DISTRIBUTOR"
```

**Type YES when prompted.**

The economic layer awaits. 🚀
