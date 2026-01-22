# Y3K Canonical Genesis — Ceremony Day Checklist

**Execution Date:** 2026-01-15  
**Execution Time:** 00:00:00 UTC  
**Location:** Air-gapped workstation  
**Operator:** Y3K Genesis Authority

---

## Pre-Ceremony (24 Hours Before)

### ✅ Verification

- [ ] **PRE_COMMIT.json published** (IPFS + GitHub + y3k.digital)
  - Verify CID is publicly accessible
  - Verify commitment_hash: `d4f2c8e9a3b7f5d6c9e8a4b2f7d5c3e9a6b8f4d7c5e9a3b6f8d4c7e5a9b3f6d8`

- [ ] **Authority keys backed up**
  - USB backup verified: `F:\y3k-genesis-authority-keys\`
  - Local backup verified: `$env:USERPROFILE\Y3K_Genesis_Keys_SECURE\`
  - Keys tested: Ed25519 sign/verify works

- [ ] **Genesis runner validated**
  - Mock genesis completed successfully
  - Binary hash verified
  - Dry-run mode tested

### 🔧 Equipment Preparation

- [ ] **Air-gapped machine ready**
  - Network disabled (Wi-Fi + Ethernet off)
  - Clean OS install verified
  - No external software (minimal OS + Rust toolchain only)
  
- [ ] **Backup drives connected**
  - USB drive F:\ mounted (SanDisk 232GB)
  - Secondary backup drive ready
  - Drive health verified

- [ ] **Power backup**
  - UPS connected
  - Battery at 100%
  - Estimated runtime > 4 hours

### 📄 Documentation Ready

- [ ] ENTROPY_RULES.md printed (paper backup)
- [ ] This checklist printed (paper backup)
- [ ] Command reference printed (no network during ceremony)

---

## T-Minus 1 Hour (23:00 UTC, Day Before)

### 🔒 Final Security Checks

- [ ] **Network isolation confirmed**
  ```powershell
  # Verify no network
  Test-Connection google.com -Count 1
  # Should fail: "Destination host unreachable"
  ```

- [ ] **Keys present and verified**
  ```powershell
  # List authority keys
  Get-ChildItem genesis\SECRETS\*.sk | Select-Object Name, Length
  
  # Expected:
  # y3k-ed25519-genesis-01.sk       64 bytes
  # y3k-dilithium5-genesis-01.sk    9792 bytes
  ```

- [ ] **Operator seed verified**
  ```powershell
  # Display seed (should match pre-commit)
  Get-Content genesis\SECRETS\operator-commitment-seed.txt
  
  # Expected:
  # 7f3c8e9a2b1d6f4c8e7a3d5b9f2e6c8a4d7b5f3e8c9a6d4b7f5e3c8a9d6b4f7e
  ```

### 🎬 Ceremony Preparation

- [ ] **Terminal session started**
  - Working directory: `C:\Users\Kevan\web3 true web3 rarity\`
  - PowerShell version confirmed
  - Script execution policy set: `Set-ExecutionPolicy Bypass -Scope Process`

- [ ] **Logging enabled**
  ```powershell
  # Start transcript (record entire ceremony)
  Start-Transcript -Path "genesis\LOGS\CEREMONY_2026-01-15_TRANSCRIPT.txt"
  ```

---

## T-Zero: 00:00:00 UTC (Execution Window)

### PHASE 1: Entropy Materialization

#### Step 1.1: Timestamp Lock
```powershell
# Record exact execution time
$ceremonyTime = Get-Date -Format "o"
Write-Host "CEREMONY START: $ceremonyTime"

# Expected: 2026-01-15T00:00:XX UTC (within 5 minutes of midnight)
```

**Status:** [ ]  
**Time recorded:** _______________

---

#### Step 1.2: Fetch Bitcoin Block

**NOTE:** This requires temporary network access to fetch block data.

```powershell
# Enable network temporarily
# (Or use pre-fetched data if block already mined)

# Option A: Use blockchain.info API
$btcLatest = Invoke-RestMethod "https://blockchain.info/latestblock"

Write-Host "Bitcoin Block:"
Write-Host "  Height: $($btcLatest.height)"
Write-Host "  Hash: $($btcLatest.hash)"
Write-Host "  Time: $(Get-Date -UnixTimeSeconds $btcLatest.time -Format 'o')"

# Verify time >= 2026-01-15T00:00:00Z
$genesisUnix = 1768435200
if ($btcLatest.time -ge $genesisUnix) {
    Write-Host "✅ Block satisfies rule (time >= genesis timestamp)"
} else {
    Write-Host "❌ Block BEFORE genesis timestamp - wait for next block"
    # Wait and retry
}

# Record values manually:
```

**Bitcoin Block Data:**
- Height: _______________
- Hash: _______________________________________________
- Timestamp: _______________
- Rule satisfied: [ ] Yes [ ] No

**Status:** [ ]

---

#### Step 1.3: Fetch NIST Beacon Pulse

```powershell
# Query NIST Beacon at genesis timestamp
$genesisUnix = 1768435200
$nistUrl = "https://beacon.nist.gov/beacon/2.0/chain/1/pulse/time/$genesisUnix"

try {
    $nistPulse = Invoke-RestMethod $nistUrl
    
    Write-Host "NIST Beacon Pulse:"
    Write-Host "  Index: $($nistPulse.pulse.pulseIndex)"
    Write-Host "  Output: $($nistPulse.pulse.outputValue)"
    Write-Host "  Timestamp: $($nistPulse.pulse.timeStamp)"
    
    # Verify timestamp
    $pulseTime = [DateTimeOffset]::Parse($nistPulse.pulse.timeStamp)
    if ($pulseTime.ToUnixTimeSeconds() -ge $genesisUnix) {
        Write-Host "✅ Pulse satisfies rule"
    }
} catch {
    Write-Host "❌ NIST Beacon query failed: $_"
    Write-Host "Using next available pulse..."
}

# Record values manually:
```

**NIST Beacon Data:**
- Pulse Index: _______________
- Output Value: _______________________________________________
- Timestamp: _______________
- Rule satisfied: [ ] Yes [ ] No

**Status:** [ ]

---

#### Step 1.3.1: Re-Disable Network (Critical Security Window)

**⚠️ CRITICAL: Network must be disabled BEFORE seed reveal**

```powershell
# Hard network shutdown before revealing operator seed
Get-NetAdapter | Disable-NetAdapter -Confirm:$false

# Verify shutdown
Test-Connection google.com -Count 1
# Must fail: "Destination host unreachable" or "No route to host"
```

**Network Disabled Before Reveal:** [ ] Yes [ ] No

**Status:** [ ]

---

#### Step 1.4: Reveal Operator Seed

```powershell
# Read pre-committed seed
$operatorSeed = Get-Content "genesis\SECRETS\operator-commitment-seed.txt" -Raw

Write-Host "Operator Seed (REVEALED):"
Write-Host "  $operatorSeed"

# Expected: 7f3c8e9a2b1d6f4c8e7a3d5b9f2e6c8a4d7b5f3e8c9a6d4b7f5e3c8a9d6b4f7e
```

**Operator Seed:** _______________________________________________

**Status:** [ ]

---

#### Step 1.5: Verify Commitment Hash

**CRITICAL: If this fails, ABORT ceremony.**

```powershell
# Compute SHA3-256 of operator seed
# (Note: PowerShell uses SHA256, not SHA3-256 - use snp-keygen for SHA3)

.\target\release\snp-keygen.exe fingerprint --pub genesis\SECRETS\operator-commitment-seed.txt

# Should output:
# d4f2c8e9a3b7f5d6c9e8a4b2f7d5c3e9a6b8f4d7c5e9a3b6f8d4c7e5a9b3f6d8
```

**Commitment Verification:**
- Computed hash: _______________________________________________
- Expected hash: `d4f2c8e9a3b7f5d6c9e8a4b2f7d5c3e9a6b8f4d7c5e9a3b6f8d4c7e5a9b3f6d8`
- Match: [ ] Yes [ ] No

**If NO MATCH → ABORT CEREMONY**

**Status:** [ ]

---

### PHASE 2: Entropy Bundle Construction

#### Step 2.1: Create entropy_bundle.json

```powershell
# Construct final entropy bundle (manual edit)
notepad genesis\INPUTS\entropy_bundle.json
```

**Template:**
```json
{
  "ceremony": {
    "timestamp": "2026-01-15T00:00:00Z",
    "executed_at": "<ACTUAL_TIME_FROM_STEP_1.1>"
  },
  "sources": [
    {
      "type": "bitcoin_block",
      "height": <FROM_STEP_1.2>,
      "hash": "<FROM_STEP_1.2>",
      "timestamp": "<FROM_STEP_1.2>",
      "rule": "first_block_after_2026-01-15T00:00:00Z",
      "verified": true
    },
    {
      "type": "nist_beacon",
      "pulse_index": "<FROM_STEP_1.3>",
      "output_value": "<FROM_STEP_1.3>",
      "timestamp": "<FROM_STEP_1.3>",
      "rule": "first_pulse_after_2026-01-15T00:00:00Z",
      "verified": true
    },
    {
      "type": "operator_commitment",
      "seed": "7f3c8e9a2b1d6f4c8e7a3d5b9f2e6c8a4d7b5f3e8c9a6d4b7f5e3c8a9d6b4f7e",
      "commitment_hash": "d4f2c8e9a3b7f5d6c9e8a4b2f7d5c3e9a6b8f4d7c5e9a3b6f8d4c7e5a9b3f6d8",
      "committed_at": "2026-01-03T00:00:00Z",
      "revealed_at": "2026-01-15T00:00:00Z",
      "verified": true
    }
  ],
  "mixing": {
    "algorithm": "SHA3-256",
    "input": "bitcoin_hash || nist_output || operator_seed"
  }
}
```

**Status:** [ ]

---

#### Step 2.2: Verify Entropy Bundle

```powershell
# Validate JSON syntax
Get-Content genesis\INPUTS\entropy_bundle.json | ConvertFrom-Json

# Should parse without errors
```

**Entropy Bundle Validated:** [ ] Yes [ ] No

**Status:** [ ]

---

### PHASE 3: Genesis Execution

#### Step 3.1: Disable Network (Final)

```powershell
# Disable all network adapters
Get-NetAdapter | Disable-NetAdapter -Confirm:$false

# Verify
Test-Connection google.com -Count 1
# Should fail: "No route to host"
```

**Network Disabled:** [ ] Yes [ ] No

**Status:** [ ]

---

#### Step 3.2: Dry-Run (Validation Only)

```powershell
# Test genesis WITHOUT writing files
.\target\release\snp-genesis.exe run `
  --config genesis\GENESIS_CONFIG.json `
  --entropy genesis\INPUTS\entropy_bundle.json `
  --key genesis\SECRETS\y3k-ed25519-genesis-01.sk `
  --offline `
  --dry-run

# Expected output:
# ✅ Config loaded
# ✅ Entropy validated
# ✅ Keys verified
# ✅ Dry-run successful
# ℹ️  No files written (dry-run mode)
```

**Dry-Run Status:**
- Config validated: [ ] Yes [ ] No
- Entropy validated: [ ] Yes [ ] No
- Keys verified: [ ] Yes [ ] No
- Ready for execution: [ ] Yes [ ] No

**Status:** [ ]

---

#### Step 3.3: Execute Canonical Genesis

**⚠️ POINT OF NO RETURN ⚠️**

This command will:
- Generate 1000 namespaces
- Compute rarity for each
- Create 1000 certificates
- Sign genesis attestation
- Create manifest
- Output is IMMUTABLE and IRREVERSIBLE

```powershell
# Record start time
$genesisStart = Get-Date
Write-Host "🚀 CANONICAL GENESIS STARTING: $genesisStart"

# Execute
.\target\release\snp-genesis.exe run `
  --config genesis\GENESIS_CONFIG.json `
  --entropy genesis\INPUTS\entropy_bundle.json `
  --key genesis\SECRETS\y3k-ed25519-genesis-01.sk `
  --offline `
  --ceremony

# Expected runtime: ~2 hours
```

**Execution Log:**

- Start time: _______________
- Phase 1 (Namespace generation): [ ] Complete
- Phase 2 (Rarity computation): [ ] Complete
- Phase 3 (Certificate generation): [ ] Complete
- Phase 4 (Attestation signing): [ ] Complete
- Phase 5 (Manifest creation): [ ] Complete
- End time: _______________
- Total runtime: _______________

**Status:** [ ]

---

### PHASE 4: Verification

#### Step 4.1: Verify Output Files

```powershell
# Check artifacts directory
Get-ChildItem genesis\ARTIFACTS\ -Recurse | Select-Object Name, Length

# Expected files:
# genesis_attestation.json
# genesis_registry.json
# manifest.json
# certificates\ (1000 files: 1.x_certificate.json through 1000.x_certificate.json)
```

**Output Files Present:**
- genesis_attestation.json: [ ] Yes [ ] No
- genesis_registry.json: [ ] Yes [ ] No
- manifest.json: [ ] Yes [ ] No
- certificates (1000): [ ] Yes [ ] No

**Status:** [ ]

---

#### Step 4.2: Verify Genesis Hash

```powershell
# Extract genesis hash from attestation
$attestation = Get-Content genesis\ARTIFACTS\genesis_attestation.json | ConvertFrom-Json
$genesisHash = $attestation.genesis_hash

Write-Host "Genesis Hash: $genesisHash"

# Record manually:
```

**Genesis Hash:** _______________________________________________

**Status:** [ ]

---

#### Step 4.3: Verify Ed25519 Signature

```powershell
# Verify attestation signature
.\target\release\snp-verify.exe attestation `
  --file genesis\ARTIFACTS\genesis_attestation.json `
  --pubkey genesis\SECRETS\y3k-ed25519-genesis-01.pk

# Expected:
# ✅ Signature valid
# ✅ Signed by: y3k-ed25519-genesis-01
# ✅ Attestation verified
```

**Signature Status:**
- Signature valid: [ ] Yes [ ] No
- Signed by correct key: [ ] Yes [ ] No

**Status:** [ ]

---

#### Step 4.4: Spot-Check Certificates

```powershell
# Verify 10 random certificates
$certs = 1,10,100,500,777,999,1000
foreach ($id in $certs) {
    Write-Host "Verifying certificate $id.x..."
    
    .\target\release\snp-verify.exe certificate `
      --file "genesis\ARTIFACTS\certificates\${id}.x_certificate.json" `
      --pubkey genesis\SECRETS\y3k-ed25519-genesis-01.pk
}

# All should show: ✅ Signature valid
```

**Certificates Verified:** [ ] All passed [ ] Some failed

**Status:** [ ]

---

#### Step 4.5: Verify Manifest Hashes

```powershell
# Recompute manifest
.\target\release\snp-genesis.exe verify-manifest `
  --manifest genesis\ARTIFACTS\manifest.json `
  --artifacts genesis\ARTIFACTS\

# Expected:
# ✅ All hashes match
# ✅ Manifest verified
```

**Manifest Status:**
- All hashes match: [ ] Yes [ ] No

**Status:** [ ]

---

### PHASE 5: Backup

#### Step 5.1: USB Backup

```powershell
# Create backup directory on USB
New-Item -Path "F:\y3k-genesis-ceremony-2026-01-15\" -ItemType Directory

# Copy all artifacts
Copy-Item genesis\ARTIFACTS\* "F:\y3k-genesis-ceremony-2026-01-15\ARTIFACTS\" -Recurse
Copy-Item genesis\INPUTS\entropy_bundle.json "F:\y3k-genesis-ceremony-2026-01-15\"
Copy-Item genesis\PRE_COMMIT.json "F:\y3k-genesis-ceremony-2026-01-15\"
Copy-Item genesis\LOGS\CEREMONY_2026-01-15_TRANSCRIPT.txt "F:\y3k-genesis-ceremony-2026-01-15\"

Write-Host "✅ USB backup complete"
```

**USB Backup:** [ ] Complete

---

#### Step 5.2: Local Encrypted Backup

```powershell
# Create secure local backup
New-Item -Path "$env:USERPROFILE\Y3K_Genesis_Ceremony_SECURE\" -ItemType Directory

Copy-Item genesis\ARTIFACTS\* "$env:USERPROFILE\Y3K_Genesis_Ceremony_SECURE\ARTIFACTS\" -Recurse
Copy-Item genesis\INPUTS\entropy_bundle.json "$env:USERPROFILE\Y3K_Genesis_Ceremony_SECURE\"
Copy-Item genesis\PRE_COMMIT.json "$env:USERPROFILE\Y3K_Genesis_Ceremony_SECURE\"

Write-Host "✅ Local backup complete"
```

**Local Backup:** [ ] Complete

---

### PHASE 6: Publication Preparation

#### Step 6.1: Package Public Artifacts

```powershell
# Create IPFS upload package (PUBLIC ONLY)
New-Item -Path "genesis\PUBLIC_IPFS_PACKAGE\" -ItemType Directory

# Copy PUBLIC artifacts only (NO PRIVATE KEYS)
Copy-Item genesis\PRE_COMMIT.json genesis\PUBLIC_IPFS_PACKAGE\
Copy-Item genesis\INPUTS\entropy_bundle.json genesis\PUBLIC_IPFS_PACKAGE\
Copy-Item genesis\ARTIFACTS\genesis_attestation.json genesis\PUBLIC_IPFS_PACKAGE\
Copy-Item genesis\ARTIFACTS\manifest.json genesis\PUBLIC_IPFS_PACKAGE\
Copy-Item genesis\ARTIFACTS\genesis_registry.json genesis\PUBLIC_IPFS_PACKAGE\
Copy-Item genesis\ARTIFACTS\certificates\* genesis\PUBLIC_IPFS_PACKAGE\certificates\ -Recurse

# Verify NO private keys
Get-ChildItem genesis\PUBLIC_IPFS_PACKAGE\ -Recurse -Filter "*.sk"
# Should return: nothing (no .sk files)

Write-Host "✅ Public package ready (NO PRIVATE KEYS)"
```

**Public Package:** [ ] Ready [ ] Contains private keys (ABORT)

---

#### Step 6.2: Compute Package Hash

```powershell
# Create TAR archive for canonical hashing
tar -cf genesis\public_package.tar genesis\PUBLIC_IPFS_PACKAGE

# Hash TAR file
$packageHash = (Get-FileHash genesis\public_package.tar -Algorithm SHA256).Hash
Write-Host "Public Package Hash (TAR): $packageHash"
Write-Host "TAR File: genesis\public_package.tar"
Write-Host "TAR Created: $(Get-Date -Format 'o')"
```

**Package TAR Hash:** _______________________________________________  
**TAR Filename:** `public_package.tar`  
**TAR Created:** _______________

---

### PHASE 7: Ceremony Complete

#### Step 7.1: Stop Transcript

```powershell
Stop-Transcript
```

**Transcript Saved:** [ ] Yes

---

#### Step 7.2: Final Verification Summary

**Genesis Ceremony 2026-01-15 — Final Status**

- [ ] Entropy materialized (Bitcoin + NIST + Operator)
- [ ] Commitment verified (SHA3-256 match)
- [ ] Genesis executed (1000 namespaces)
- [ ] Attestation signed (Ed25519)
- [ ] Manifest verified (all hashes match)
- [ ] Certificates validated (spot-check passed)
- [ ] Backups complete (USB + local)
- [ ] Public package ready (no private keys)
- [ ] Transcript saved

**Genesis Hash:** _______________________________________________

**Ceremony Status:** [ ] SUCCESS [ ] FAILURE

---

## Post-Ceremony (Next 24 Hours)

### IPFS Publication

**NOTE:** Requires network access (re-enable on separate machine)

```bash
# Upload public package to IPFS
ipfs add -r genesis/PUBLIC_IPFS_PACKAGE

# Record CIDs:
# - Package root CID: _______________________________
# - Attestation CID: _______________________________
# - Manifest CID: _______________________________
# - Registry CID: _______________________________
```

### GitHub Publication

```bash
# Add public artifacts to repository (NOT private keys)
git add genesis/PRE_COMMIT.json
git add genesis/INPUTS/entropy_bundle.json
git add genesis/ARTIFACTS/genesis_attestation.json
git add genesis/ARTIFACTS/manifest.json
git add genesis/ARTIFACTS/genesis_registry.json

git commit -m "Genesis ceremony complete - 2026-01-15T00:00:00Z"
git push origin main
```

### Website Publication

- [ ] Update y3k.digital with genesis hash
- [ ] Publish IPFS CIDs
- [ ] Add verification guide
- [ ] Announce genesis completion

---

## Emergency Procedures

### If Ceremony Fails

1. **DO NOT retry with same entropy**
2. **Create NEW pre-commit** (different operator seed)
3. **Choose NEW ceremony date**
4. **Publish NEW pre-commitment**
5. **Execute NEW ceremony**

### If Verification Fails

1. **STOP immediately**
2. **Archive failed ceremony artifacts**
3. **Analyze failure** (logs, transcript)
4. **Fix issue** (if software bug)
5. **Restart with NEW ceremony**

### If Network Fails During Entropy Fetch

1. **Use pre-fetched data** (if available)
2. **OR delay ceremony** until network restored
3. **DO NOT fabricate entropy values**

---

## Signatures

**Ceremony Operator:** _____________________________  
**Date:** _____________________________  
**Witness (if present):** _____________________________  
**Date:** _____________________________

---

**This ceremony creates the canonical origin of the Y3K namespace universe.**

**Once complete, genesis can never be repeated, only verified.**

**Proceed with care and precision.**
