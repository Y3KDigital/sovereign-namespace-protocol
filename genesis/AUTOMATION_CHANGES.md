# Automated Genesis Ceremony — Implementation Changes

**Date:** January 16, 2026  
**Reason:** Shift from manual air-gapped execution to automated scheduled execution  
**New Execution Time:** 2026-01-16T20:00:00Z (3:00 PM EST)

---

## What Changed

### Original Design (Manual)
- Air-gapped execution (network disabled)
- Human operator at each gate
- Manual GO/NO-GO decisions
- ~4 hour supervised process
- Maximum security, minimal automation

### New Design (Automated)
- Network-connected execution
- Fully automated entropy fetching
- Automated verification gates
- ~2 hour unattended process
- Scheduled execution via script

---

## Why the Change

**User Requirement:** "it was supposed to be automatic proving its ability to do this"

The manual approach was designed for maximum security (institution-grade air-gapped ceremony).
The automated approach proves the system's ability to execute genesis autonomously.

---

## Key Differences

| Aspect | Manual (Original) | Automated (New) |
|--------|-------------------|-----------------|
| **Network** | Air-gapped (disabled) | Connected (for entropy fetch) |
| **Operator** | Human at each gate | Unattended |
| **Entropy** | Manual fetch → offline execution | Automated fetch |
| **Verification** | Manual GO/NO-GO | Automated checks |
| **Runtime** | ~4 hours | ~2 hours |
| **Security** | Maximum | Moderate |

---

## Implementation

**Script:** `genesis/run-automated-ceremony.ps1`

**What it does:**
1. Fetches Bitcoin block (blockchain.info API)
2. Fetches NIST Beacon pulse (beacon.nist.gov API)
3. Loads operator seed (from SECRETS/)
4. Creates entropy bundle (JSON)
5. Executes snp-genesis.exe (or creates mock artifacts)
6. Verifies outputs
7. Logs full transcript

**Execution modes:**
- `.\run-automated-ceremony.ps1` → Full execution
- `.\run-automated-ceremony.ps1 -DryRun` → Test mode (no genesis)

---

## Scheduled Execution

**Time:** 2026-01-16T20:00:00Z (3:00 PM EST)  
**Method:** Windows Task Scheduler  
**Trigger:** One-time at exact timestamp  

**Command:**
```powershell
PowerShell.exe -ExecutionPolicy Bypass -File "C:\Users\Kevan\web3 true web3 rarity\genesis\run-automated-ceremony.ps1"
```

---

## Artifacts Created

After execution, these files will exist:

```
genesis/
  ARTIFACTS/
    genesis_attestation.json   ← Genesis hash + signatures
    manifest.json              ← Registry metadata
    genesis_registry.json      ← Full namespace registry
    certificates/              ← 1000 certificate files
  INPUTS/
    entropy_bundle.json        ← Bitcoin + NIST + Operator seed
  LOGS/
    CEREMONY_AUTO_*.txt        ← Full execution transcript
```

---

## Security Trade-offs

**Lost:**
- Air-gap isolation
- Manual verification gates
- Human operator oversight

**Gained:**
- Automated execution
- Scheduled reliability
- Reproducible process
- Public entropy verification

**Verdict:** Appropriate for protocol demonstration, not for production high-value genesis.

---

## Countdown Page Update

Original countdown targeted 2026-01-15T00:00:00Z (manual execution).  
New countdown targets 2026-01-16T20:00:00Z (automated execution).

Page updated to reflect automated ceremony approach.

---

## Audit Status

**Original audit:** Approved for manual air-gapped ceremony (GO status)  
**Automated approach:** Not audited (different security model)

This is acceptable for demonstration/proof-of-concept, but would require re-audit for production use.

---

## Next Steps After Ceremony

1. **Verify transcript:** Review LOGS/CEREMONY_AUTO_*.txt
2. **Check artifacts:** Confirm genesis_attestation.json exists
3. **Extract genesis hash:** From attestation file
4. **Update website:** Add hash to y3kmarkets.com
5. **Publish to IPFS:** Upload public artifacts
6. **Restore marketplace:** Optional (or keep genesis page)

---

## Rollback Plan

If automated ceremony fails:
1. Review transcript in LOGS/
2. Identify failure point
3. Options:
   - Fix issue and re-run immediately
   - Revert to manual ceremony (original checklist)
   - Reschedule automated ceremony

---

**This change prioritizes automation demonstration over maximum security.**

**For production genesis, revert to manual air-gapped approach.**
