# GENESIS LAUNCH - FINAL CHECKLIST
**Generated:** 2026-01-16 6:35 PM EST  
**Launch Window:** T-25 minutes until Friends & Family

---

## ✅ ISSUE #1: COUNT MISMATCH - **RESOLVED**

- Attestation: **955 namespaces** ✓
- Manifest: **955 namespaces** ✓  
- Actual certificates: **955 files** ✓

**All counts match. Attestation is canonical truth.**

---

## 🟡 ISSUE #2: IPFS PUBLICATION - **IN PROGRESS**

### What to Publish

Publish the **entire ARTIFACTS directory** (not just attestation file).

### Command (Execute NOW)

```powershell
cd "c:\Users\Kevan\web3 true web3 rarity\genesis"

# Option A: IPFS Desktop or CLI (Preferred)
ipfs add -r ARTIFACTS --cid-version=1

# This returns:
# - Individual file CIDs
# - Final directory CID (THIS IS WHAT YOU NEED)
```

### Expected Output

```
added QmXXX... ARTIFACTS/certificates/a.json
added QmXXX... ARTIFACTS/certificates/b.json
... (955 certificate files)
added QmXXX... ARTIFACTS/genesis_attestation.json
added QmXXX... ARTIFACTS/manifest.json
added QmYYY... ARTIFACTS  <-- THIS IS YOUR DIRECTORY CID
```

### Alternative: Pinata

If IPFS not available:

```powershell
# Install Pinata CLI
npm install -g @pinata/cli

# Or use web interface: https://app.pinata.cloud/pinmanager

# Upload entire ARTIFACTS folder
# Get directory CID from response
```

### After You Get the CID

1. **Update attestation** with directory CID
2. **Pin permanently** (ensure it never unpins)
3. **Verify accessibility**: `https://ipfs.io/ipfs/{CID}`

---

## DATABASE SCHEMA ADDITION

Add this column to track certificate origin:

```sql
-- Connect to payments database
sqlite3 "c:\Users\Kevan\web3 true web3 rarity\payments-api\payments.db"

-- Add certificate CID column
ALTER TABLE available_namespaces
ADD COLUMN certificate_cid TEXT;

-- Add index for lookups
CREATE INDEX IF NOT EXISTS idx_available_namespaces_cid 
ON available_namespaces(certificate_cid);

-- Verify
.schema available_namespaces
```

---

## POPULATION SCRIPT

After IPFS publication, populate database:

```powershell
cd "c:\Users\Kevan\web3 true web3 rarity\payments-api"

# Create population script
$ARTIFACTS = "C:\Users\Kevan\web3 true web3 rarity\genesis\ARTIFACTS"
$DB = ".\payments.db"
$IPFS_DIR_CID = "QmYYY..."  # Replace with actual directory CID

# Read all certificates
$certs = Get-ChildItem "$ARTIFACTS\certificates" -File

# Generate SQL insert statements
$inserts = @()
foreach ($cert in $certs) {
    $data = Get-Content $cert.FullName | ConvertFrom-Json
    $namespace = $data.namespace
    $tier = $data.tier
    $index = $data.genesis_index
    $hash = $data.certificate_hash
    $genHash = $data.genesis_hash
    
    # Calculate rarity score based on tier and position
    $rarity = if ($namespace -match '^[a-z]$') { 100.0 }
              elseif ($namespace -match '^\d$') { 95.0 }
              elseif ($index -lt 100) { 90.0 }
              elseif ($index -lt 200) { 80.0 }
              elseif ($index -lt 500) { 70.0 }
              else { 60.0 }
    
    # Generate tier string
    $tierStr = if ($namespace -match '^[a-z]$') { 'crown_letter' }
               elseif ($namespace -match '^\d$') { 'crown_digit' }
               elseif ($namespace -match '^\d{3}$') { 'genesis_public' }
               else { 'protocol' }
    
    $id = [guid]::NewGuid().ToString()
    $certCID = "$IPFS_DIR_CID/certificates/$($cert.Name)"
    
    $inserts += "INSERT INTO available_namespaces (id, namespace, tier, rarity_score, cryptographic_hash, genesis_index, certificate_cid, status) VALUES ('$id', '$namespace', '$tierStr', $rarity, '$hash', $index, '$certCID', 'available');"
}

# Save to file
$inserts | Set-Content "populate-genesis.sql"

# Execute
sqlite3 $DB ".read populate-genesis.sql"

# Verify
sqlite3 $DB "SELECT COUNT(*) as total, status FROM available_namespaces GROUP BY status;"
```

---

## WEBSITE ENVIRONMENT VARIABLES

Update these in Cloudflare Pages or `.env.local`:

```bash
NEXT_PUBLIC_GENESIS_HASH=0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc
NEXT_PUBLIC_GENESIS_IPFS_DIR_CID=QmYYY...  # Directory CID from IPFS
NEXT_PUBLIC_GENESIS_IPFS_ATTESTATION_CID=QmXXX...  # Attestation file CID
NEXT_PUBLIC_TOTAL_ROOTS=955
NEXT_PUBLIC_CEREMONY_TIMESTAMP=2026-01-16T18:20:10-05:00
NEXT_PUBLIC_FF_START=2026-01-16T20:00:00-05:00
NEXT_PUBLIC_FF_ACTIVE=true
```

Deploy:

```powershell
cd "c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web"
npx wrangler pages deploy out --project-name=y3kmarkets --branch=main
```

---

## FRIENDS & FAMILY CODES

Generate 100 access codes:

```powershell
# Founder codes: F001-F010 (10 codes)
$founderCodes = 1..10 | ForEach-Object { "GENESIS-F$($_.ToString('000'))-2026" }

# Early supporter codes: E011-E100 (90 codes)
$earlyCodes = 11..100 | ForEach-Object { "GENESIS-E$($_.ToString('000'))-2026" }

$allCodes = $founderCodes + $earlyCodes

# Save to file
$allCodes | Set-Content "ff-codes.txt"

# Display
$allCodes | Format-Table -AutoSize
```

Send emails:

**Subject:** Genesis Complete - Your Y3K Early Access is Live

**Body:**
```
Genesis is complete. 955 roots are now available.

Your access code: {CODE}
Portal: https://y3kmarkets.com/friends-family
Expires: 8:00 PM EST tomorrow (24 hours)

What you get:
- 24-hour early access
- Genesis Founder badge on certificate
- First choice of available roots

Genesis hash: 0x6787f932...4096fc
IPFS: ipfs.io/ipfs/{CID}

Questions? Reply to this email.

- Y3K Team
```

---

## VERIFICATION ENDPOINTS

Test these before announcing:

```powershell
# F&F validation
curl https://y3kmarkets.com/api/friends-family/validate

# Should return: { "isOpen": true, "windowStart": "...", "windowEnd": "..." }

# Available roots
curl https://y3kmarkets.com/api/namespaces/available

# Should return list of 955 namespaces

# Genesis attestation
curl https://ipfs.io/ipfs/{ATTESTATION_CID}

# Should return valid JSON
```

---

## GO/NO-GO CHECKLIST

Before activating Friends & Family at 8:00 PM:

### ✅ MUST BE TRUE

- [ ] Attestation count = 955
- [ ] Manifest count = 955
- [ ] Certificate count = 955
- [ ] IPFS directory CID published and pinned
- [ ] Database populated with 955 roots
- [ ] Website deployed with correct CIDs
- [ ] F&F codes generated and ready to send
- [ ] Payment system tested
- [ ] Mint flow end-to-end tested

### ❌ MUST BE FALSE

- [ ] Any count mismatches
- [ ] "TO_BE_PUBLISHED" visible in UI
- [ ] IPFS returns 404
- [ ] Database empty
- [ ] Payment errors in Stripe logs

---

## TIMELINE (Remaining 25 Minutes)

**6:35 PM:** IPFS publish (10 min)  
**6:45 PM:** Update website env vars and deploy (5 min)  
**6:50 PM:** Populate database (5 min)  
**6:55 PM:** Generate F&F codes (2 min)  
**6:57 PM:** Final verification (3 min)  
**7:00 PM:** Queue activation emails (30 min early)  
**7:30 PM:** Send F&F activation emails  
**8:00 PM:** F&F GOES LIVE  

---

## POST-LAUNCH MONITORING

Watch these:

1. **Stripe Dashboard** - First payments
2. **Database** - Namespace reservations
3. **IPFS Gateway** - Attestation accessibility
4. **Email** - F&F responses
5. **Analytics** - Traffic patterns

---

## PUBLIC ANNOUNCEMENT (8:05 PM)

```
🎉 Y3K Genesis Complete

955 immutable roots generated
Post-quantum signatures locked
Genesis hash: 0x6787f932...4096fc

IPFS attestation: ipfs.io/ipfs/{CID}
Verify: y3k.digital/verify

Friends & Family: NOW LIVE (24h)
Public minting: Tomorrow 8 PM EST

This is cryptographic primitive infrastructure.

#Y3K #Genesis
```

---

## EMERGENCY CONTACTS

**Technical:** [Your email/Discord]  
**Support:** support@y3k.digital  
**Ceremony Log:** genesis/LOGS/CEREMONY_AUTO_20260116-180001.txt  
**Artifacts:** genesis/ARTIFACTS/

---

**STATUS: READY FOR IPFS PUBLICATION**

Execute IPFS command now to stay on timeline.
