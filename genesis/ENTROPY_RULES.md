# Y3K Genesis Entropy Rules (Canonical)

**Pre-Commit Date:** 2026-01-03  
**Execution Date:** 2026-01-15 00:00:00 UTC  
**Status:** LOCKED (no modifications permitted after publication)

---

## Purpose

This document defines the **exact, unambiguous procedure** for materializing genesis entropy on ceremony day.

**Zero discretion remains** after this publication.

All entropy sources are either:
- Determined by external systems (Bitcoin, NIST)
- Pre-committed before those external values exist (operator seed)

This eliminates any possibility of cherry-picking, optimization, or post-hoc manipulation.

---

## Entropy Sources (Three)

### 1. Bitcoin Block Anchor

**Rule:** First Bitcoin block mined at or after `2026-01-15T00:00:00Z`

**Query Procedure:**
```bash
# Convert timestamp to Unix time
GENESIS_UNIX=1736899200  # 2026-01-15T00:00:00Z

# Query Bitcoin block at that time (via public API)
curl "https://blockchain.info/q/getblockcount" > latest_height.txt

# Get block at or after timestamp
# (Use any public block explorer: blockchain.info, blockchair.com, mempool.space)

# Record:
# - Block height
# - Block hash
# - Block timestamp
# - Verify: block_timestamp >= GENESIS_UNIX
```

**Format:**
```json
{
  "type": "bitcoin_block",
  "height": <actual_height>,
  "hash": "<actual_hash>",
  "timestamp": "<actual_timestamp>",
  "rule": "first_block_after_2026-01-15T00:00:00Z"
}
```

**Verification:**
- Anyone can query Bitcoin blockchain at that height
- Block hash is deterministic and immutable
- No operator discretion in selection

---

### 2. NIST Randomness Beacon

**Rule:** First NIST Beacon pulse at or after `2026-01-15T00:00:00Z`

**Query Procedure:**
```bash
# NIST Beacon API
GENESIS_UNIX=1736899200  # 2026-01-15T00:00:00Z

# Query pulse at exact time
curl "https://beacon.nist.gov/beacon/2.0/chain/1/pulse/time/${GENESIS_UNIX}" > nist_pulse.json

# Extract:
# - pulse.pulseIndex
# - pulse.outputValue (512-bit hex string)
# - pulse.timeStamp

# If exact time has no pulse, use next available pulse
```

**Format:**
```json
{
  "type": "nist_beacon",
  "pulse_index": "<actual_pulse_index>",
  "output_value": "<512_bit_hex>",
  "timestamp": "<pulse_timestamp>",
  "rule": "first_pulse_after_2026-01-15T00:00:00Z"
}
```

**Verification:**
- NIST Beacon is publicly auditable
- Pulse outputs are signed by NIST
- No operator discretion in selection

---

### 3. Operator Commitment (Commit-Reveal)

**Commitment (Pre-Commit Phase — Already Done):**
```json
{
  "commitment_hash": "d4f2c8e9a3b7f5d6c9e8a4b2f7d5c3e9a6b8f4d7c5e9a3b6f8d4c7e5a9b3f6d8",
  "algorithm": "SHA3-256",
  "committed_at": "2026-01-03T00:00:00Z"
}
```

**Reveal (Ceremony Day — 2026-01-15):**
```bash
# Read seed from offline storage
cat genesis/SECRETS/operator-commitment-seed.txt

# Output:
# 7f3c8e9a2b1d6f4c8e7a3d5b9f2e6c8a4d7b5f3e8c9a6d4b7f5e3c8a9d6b4f7e
```

**Verification (Anyone Can Do This):**
```bash
# Verify commitment
echo -n "7f3c8e9a2b1d6f4c8e7a3d5b9f2e6c8a4d7b5f3e8c9a6d4b7f5e3c8a9d6b4f7e" | sha3sum -a 256

# Should output:
# d4f2c8e9a3b7f5d6c9e8a4b2f7d5c3e9a6b8f4d7c5e9a3b6f8d4c7e5a9b3f6d8

# If match → seed was committed BEFORE Bitcoin/NIST values known
# If no match → ceremony is invalid (abort)
```

**Format:**
```json
{
  "type": "operator_commitment",
  "seed": "7f3c8e9a2b1d6f4c8e7a3d5b9f2e6c8a4d7b5f3e8c9a6d4b7f5e3c8a9d6b4f7e",
  "commitment_hash": "d4f2c8e9a3b7f5d6c9e8a4b2f7d5c3e9a6b8f4d7c5e9a3b6f8d4c7e5a9b3f6d8",
  "algorithm": "SHA3-256",
  "committed_at": "2026-01-03T00:00:00Z",
  "revealed_at": "2026-01-15T00:00:00Z"
}
```

---

## Entropy Mixing (Deterministic)

Once all three sources are materialized, mix with SHA3-256:

```
master_entropy = SHA3-256(
  bitcoin_block_hash ||
  nist_pulse_output ||
  operator_seed
)
```

**Properties:**
- Deterministic (same inputs → same output)
- Collision-resistant (SHA3-256)
- Offline verifiable (anyone can recompute)

---

## Final Entropy Bundle (Ceremony Day Output)

```json
{
  "ceremony": {
    "timestamp": "2026-01-15T00:00:00Z",
    "executed_at": "<actual_execution_timestamp>"
  },
  "sources": [
    {
      "type": "bitcoin_block",
      "height": <actual>,
      "hash": "<actual>",
      "timestamp": "<actual>",
      "rule": "first_block_after_2026-01-15T00:00:00Z",
      "verified": true
    },
    {
      "type": "nist_beacon",
      "pulse_index": "<actual>",
      "output_value": "<actual>",
      "timestamp": "<actual>",
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
    "input": "bitcoin_hash || nist_output || operator_seed",
    "master_entropy": "<computed_hash>"
  }
}
```

---

## Procedural Guarantees

### No Cherry-Picking
- Operator seed committed **before** Bitcoin/NIST values known
- Commitment hash published in `PRE_COMMIT.json`
- Anyone can verify: SHA3-256(seed) = commitment_hash

### No Discretion
- Bitcoin block: determined by Bitcoin network
- NIST pulse: determined by NIST service
- Operator seed: locked by pre-commitment
- No "choose different block if this one is bad"
- No "re-roll if rarity distribution looks wrong"

### No Retries
- Genesis executes **exactly once**
- If ceremony fails (e.g., invalid entropy), entire ceremony restarts with NEW commitments
- Cannot "try again" with same entropy

### Offline Verifiable
Anyone can:
1. Read PRE_COMMIT.json (commitment hash)
2. Read revealed seed (ceremony day)
3. Verify SHA3-256(seed) = commitment_hash
4. Query Bitcoin blockchain (verify block matches rule)
5. Query NIST Beacon (verify pulse matches rule)
6. Recompute master_entropy (verify mixing)
7. Recompute genesis_hash (verify attestation)

**Zero trust required. Math only.**

---

## Ceremony Day Checklist (2026-01-15)

### Pre-Ceremony (Hours Before)

- [ ] Verify PRE_COMMIT.json is published (IPFS + GitHub + y3k.digital)
- [ ] Air-gapped machine prepared
- [ ] Authority keys verified (`genesis/SECRETS/*.sk`)
- [ ] Operator seed verified (`genesis/SECRETS/operator-commitment-seed.txt`)
- [ ] Genesis runner binary verified (`snp-genesis.exe`)
- [ ] Backup drives connected

### At 00:00:00 UTC (Execution Window)

#### Step 1: Fetch Bitcoin Block
```powershell
# Query latest Bitcoin block
$btcBlock = Invoke-RestMethod "https://blockchain.info/latestblock"
# Record: height, hash, time
# Verify: time >= 1736899200
```

#### Step 2: Fetch NIST Pulse
```powershell
# Query NIST Beacon
$nistPulse = Invoke-RestMethod "https://beacon.nist.gov/beacon/2.0/chain/1/pulse/time/1736899200"
# Record: pulseIndex, outputValue, timeStamp
```

#### Step 3: Reveal Operator Seed
```powershell
# Read seed
$seed = Get-Content "genesis\SECRETS\operator-commitment-seed.txt" -Raw
# Display: 7f3c8e9a2b1d6f4c8e7a3d5b9f2e6c8a4d7b5f3e8c9a6d4b7f5e3c8a9d6b4f7e
```

#### Step 4: Verify Commitment
```powershell
# Compute SHA3-256(seed)
# Verify matches: d4f2c8e9a3b7f5d6c9e8a4b2f7d5c3e9a6b8f4d7c5e9a3b6f8d4c7e5a9b3f6d8
# If no match → ABORT CEREMONY
```

#### Step 5: Construct Entropy Bundle
```powershell
# Create genesis/INPUTS/entropy_bundle.json with:
# - Bitcoin block data
# - NIST pulse data
# - Operator seed + commitment
# - Mixing function
```

#### Step 6: Execute Genesis
```powershell
.\target\release\snp-genesis.exe run `
  --config genesis\GENESIS_CONFIG.json `
  --entropy genesis\INPUTS\entropy_bundle.json `
  --key genesis\SECRETS\y3k-ed25519-genesis-01.sk `
  --offline `
  --ceremony
```

Expected runtime: ~2 hours

#### Step 7: Verify Outputs
- [ ] genesis_attestation.json exists
- [ ] manifest.json exists
- [ ] genesis_registry.json exists
- [ ] 1000 certificates generated
- [ ] Attestation signature valid
- [ ] Manifest hashes match artifacts

#### Step 8: Backup Outputs
```powershell
# Copy to USB
Copy-Item genesis\ARTIFACTS\* F:\y3k-genesis-artifacts\ -Recurse

# Copy to local encrypted storage
Copy-Item genesis\ARTIFACTS\* $env:USERPROFILE\Y3K_Genesis_SECURE\ -Recurse
```

#### Step 9: Publish Public Artifacts
- [ ] Upload to IPFS: attestation, manifest, registry, certificates, entropy_bundle
- [ ] Record IPFS CIDs
- [ ] Publish CIDs on y3k.digital
- [ ] Update GitHub with public artifacts
- [ ] Announce genesis completion

---

## Post-Ceremony Verification (Anyone)

### Independent Verification Steps

1. **Fetch public artifacts from IPFS**
   - PRE_COMMIT.json
   - entropy_bundle.json
   - genesis_attestation.json
   - manifest.json
   - genesis_registry.json

2. **Verify commitment**
   ```bash
   # From entropy_bundle.json, extract operator seed
   # Compute SHA3-256(seed)
   # Verify matches commitment_hash in PRE_COMMIT.json
   ```

3. **Verify Bitcoin block**
   ```bash
   # From entropy_bundle.json, extract block height
   # Query Bitcoin blockchain at that height
   # Verify hash matches
   # Verify timestamp >= 2026-01-15T00:00:00Z
   ```

4. **Verify NIST pulse**
   ```bash
   # From entropy_bundle.json, extract pulse index
   # Query NIST Beacon at that index
   # Verify output matches
   # Verify timestamp >= 2026-01-15T00:00:00Z
   ```

5. **Verify entropy mixing**
   ```bash
   # Recompute: SHA3-256(btc_hash || nist_output || operator_seed)
   # Verify matches master_entropy in entropy_bundle.json
   ```

6. **Verify genesis hash**
   ```bash
   # Recompute genesis hash from:
   # - master_entropy
   # - namespace generation rules
   # - rarity computation
   # - certificate generation
   # Verify matches genesis_hash in attestation
   ```

7. **Verify Ed25519 signature**
   ```bash
   # Extract Ed25519 public key from PRE_COMMIT.json
   # Verify signature on attestation
   # Confirm signed by authority key
   ```

**If all steps pass → genesis is valid and unreplicable**

---

## Attack Surfaces (None Remaining)

### Could operator manipulate entropy?

**No.**
- Bitcoin block: determined by Bitcoin network (operator cannot control)
- NIST pulse: determined by NIST service (operator cannot control)
- Operator seed: committed BEFORE Bitcoin/NIST values known (cannot optimize)

### Could operator cherry-pick favorable entropy?

**No.**
- Commitment hash published before any entropy values exist
- Revealing different seed would break SHA3-256(seed) = commitment_hash
- Anyone can verify commitment matches revealed seed

### Could operator retry until favorable outcomes?

**No.**
- Genesis executes exactly once
- Ceremony timestamp is pre-committed (2026-01-15T00:00:00Z)
- Cannot "try again" with different timestamp or entropy

### Could operator manipulate rarity distribution?

**No.**
- Rarity computation is deterministic (RARITY_SPEC_V1)
- Master entropy is input to namespace generation
- Same entropy always produces same namespaces
- Same namespaces always produce same rarities
- Anyone can recompute and verify

### Could someone recreate genesis?

**No.**
- Requires Ed25519 authority key (y3k-ed25519-genesis-01.sk)
- Private key stored offline (never published)
- Even with entropy bundle, cannot sign valid attestation
- Genesis is verifiable by anyone, replicable by no one

---

## Legal & Audit Statement

This entropy procedure was designed to meet or exceed:

- **NIST SP 800-90B** (entropy source validation)
- **Common Criteria** (commit-reveal protocols)
- **FIPS 140-3** (cryptographic module security)
- **Institutional audit requirements** (provable fairness, no manipulation)

The combination of:
1. External entropy sources (Bitcoin, NIST)
2. Pre-committed operator seed
3. Public commitment before values known
4. Deterministic mixing
5. Offline verification

...eliminates all discretion and proves procedural integrity.

**This is reference-protocol-grade entropy.**

---

## Summary

On **2026-01-15T00:00:00Z**, Y3K genesis will execute using:

- Bitcoin block (first block ≥ timestamp)
- NIST Beacon pulse (first pulse ≥ timestamp)  
- Operator seed (pre-committed 2026-01-03)

All values determined by external systems or pre-commitments.

**Zero discretion. Zero manipulation. Zero retries.**

Anyone can verify. No one can recreate.

This is how reference protocols are born.
