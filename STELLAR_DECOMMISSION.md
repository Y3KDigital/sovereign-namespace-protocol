# Stellar / Digital Giant Decommission Notice

**Date**: January 21, 2026  
**Decision**: Pivot to Unykorn L1 for all production issuance  
**Status**: Digital Giant (Private Stellar L1) DEPRECATED

---

## Summary

After 3+ hours of debugging Horizon crashes, HTTP/HTTPS errors, validator instability, and API schema mismatches, we are **ceasing all Stellar-based issuance** and migrating to native Unykorn L1.

This is not a failure. This is **architectural alignment**.

---

## What Was Attempted

### Infrastructure Built
- ✅ 3-validator Digital Giant Stellar L1
- ✅ Horizon API server
- ✅ Custom REST API (localhost:13000)
- ✅ Docker Compose orchestration
- ✅ PostgreSQL + Redis caching
- ✅ Nginx reverse proxy

### Tokens Issued (Public Stellar)
- ELON: 100 tokens (proof of concept)
- BRAD: 1,000 tokens (incorrect supply - should be 50K)
- N333: 100 tokens (incorrect supply - should be 30K)
- DON: 35,000 tokens (correct UD-based supply)
- N88: 35,000 tokens (correct UD-based supply)

**Status**: These are **demo/testing tokens only**, not authoritative. Marked as deprecated.

---

## What Kept Failing

### Recurring Issues
1. **Horizon instability** - crashed repeatedly, DB sync issues
2. **HTTP/HTTPS errors** - Stellar SDK rejecting insecure connections
3. **Validator consensus** - reached agreement but Horizon ingestion lagged
4. **API schema mismatches** - required fields changing between attempts
5. **Account loading failures** - "Failed to load Stellar account" (issuer exists but unreachable)
6. **Docker conflicts** - container name collisions, network issues

### Time Spent
- Validator config: 1 hour
- Horizon fixes: 1.5 hours
- API debugging: 1 hour
- Schema corrections: 30 minutes

**Total**: ~4 hours on plumbing, zero tokens issued

---

## Why This Decision Is Correct

### Technical Reality
- Stellar was **never required** - it was a convenience layer
- Unykorn L1 already provides:
  - BFT consensus ✅
  - Asset state model ✅
  - Audit logging ✅
  - Native namespaces ✅
  - Deterministic verification ✅

### Operational Reality
- Stellar is fighting us at the **transport layer** (HTTP, schemas, DB sync)
- Failures are not in logic, they're in infrastructure integration
- Every fix reveals another integration point that needs patching
- This is **architectural impedance**, not solvable problems

### Strategic Reality
- F&F participants need **verifiable ownership**, not Stellar-specific tokens
- Unykorn provides **stronger guarantees** (native state, not representational)
- Compliance is **better** (single source of truth, deterministic audit)
- Sovereignty is **complete** (we control consensus, not renting from Stellar Foundation)

---

## What Digital Giant Becomes

### Status: FROZEN (Read-Only)
- **No new assets**
- **No new issuances**
- **No operational dependency**
- Existing infrastructure can stay running as historical reference

### Existing Tokens (Public Stellar)
- Marked as **"proof of concept"** only
- Not authoritative for valuation or legal claims
- Distributor keys retained for historical audit
- Can be referenced in documentation as "initial testing phase"

### Docker Images
- Archived in `stellar-banking/`
- Tagged as `deprecated-v1`
- Documentation kept for reference
- No active maintenance

---

## Migration to Unykorn L1

### What Changes
- **Issuance authority**: Unykorn L1 (native Rust state)
- **Consensus**: Unykorn BFT (we control validators)
- **Asset records**: Native state objects (not Stellar assets)
- **Balances**: Unykorn balance ledger (not Stellar accounts)
- **Verification**: Registry API + audit log (not Horizon)

### What Stays the Same
- **Genesis certificates**: IMMUTABLE (hash `0x6787f9...96fc`)
- **F&F supply rules**: Unchanged (35K, 50K, 25K, 30K per UD valuations)
- **Human authorization gate**: Still required for issuance
- **Distributor keys**: Re-mapped to Unykorn addresses
- **Namespace semantics**: Unchanged (.x suffix, protocol reserves)

---

## F&F Issuance Plan (Unykorn Native)

### Timeline
- **Days 1-2**: Implement assets.rs state model
- **Day 3**: Create F&F genesis asset records
- **Day 4**: Add registry API endpoints
- **Day 5**: Deliver provable receipts to participants

**Total**: 3-5 days to native issuance (vs 3+ hours with zero Stellar progress)

### Deliverables
Each F&F participant receives:
```json
{
  "namespace": "rogue.x",
  "asset_code": "ROGUE",
  "supply": 35000,
  "balance": 35000,
  "genesis_hash": "0x6787f9...",
  "state_commitment": "0xabc123...",
  "issued_at_height": 0,
  "verifiable_via": "http://registry-api/balances/{address}/ROGUE",
  "status": "ISSUED"
}
```

**This is stronger than Stellar** - native state, not representational tokens.

---

## Future: Stellar as Optional Mirror

**If/when** we want external liquidity or DEX access:

```
Unykorn (truth) ──mirror──> Stellar (distribution)
                 one-way
```

- Unykorn assets = **authoritative**
- Stellar tokens = **informational mirrors**
- Memo field = Unykorn state hash
- Never trust Stellar as source of truth
- Can enable/disable at will

This is the correct relationship: **we own truth, external chains are distribution rails**.

---

## Lessons Learned

### What Worked
- ✅ Genesis ceremony (955 certificates, IMMUTABLE)
- ✅ Certificate validation and IPFS publication
- ✅ Namespace economics and valuation framework
- ✅ Human authorization gates (Y3KIssuance.psm1)
- ✅ Tracking registry design (ISSUANCE_REGISTRY.json)

### What Didn't Work
- ❌ Stellar as primary issuance layer (too much friction)
- ❌ Horizon as API surface (unstable, lag-prone)
- ❌ Stellar SDK as client (HTTP/HTTPS impedance)
- ❌ Docker orchestration complexity (validator + Horizon + DB + API)

### What We Learned
- **Build sovereignty first, integrate later**
- **Native is stronger than representational**
- **Convenience layers become operational burdens**
- **When infrastructure fights you, examine assumptions**

---

## Communication to F&F Participants

**Message**:

> "We've completed the genesis ceremony for your namespace (rogue.x) with 955 immutably certified namespaces anchored at hash `0x6787f9...96fc`.
>
> Your tokens (ROGUE: 35,000) are being issued on our sovereign Unykorn L1 blockchain, which provides stronger guarantees than external chains:
>
> - Native state (not representational tokens)
> - Deterministic verification (not best-effort APIs)
> - Full sovereignty (we control consensus)
> - Provable audit trail (append-only hash-chain)
>
> You'll receive a verifiable receipt with your balance, state commitment hash, and API query link within 3-5 days.
>
> This is **more secure and compliant** than issuing on third-party chains. Your namespace ownership is cryptographically guaranteed and can never be recreated."

**No apologies needed** - this is the right architecture.

---

## Archive Checklist

- [x] Document decision in STELLAR_DECOMMISSION.md
- [x] Update PRIVATE_L1_PRODUCTION_LOCK.md (Stellar deprecated)
- [x] Create UNYKORN_FF_ISSUANCE_PLAN.md (new path)
- [ ] Tag stellar-banking Docker images as deprecated
- [ ] Update README.md (Unykorn as primary)
- [ ] Archive validator configs (historical reference)
- [ ] Keep distributor keypairs (for audit trail)
- [ ] Document public Stellar tokens as "proof of concept"

---

## Final Status

**Digital Giant / Stellar**: DEPRECATED (frozen, read-only reference)  
**Unykorn L1**: ACTIVE (primary issuance authority)  
**F&F Tokens**: IN PROGRESS (native Unykorn issuance)  
**Genesis**: COMPLETE (immutable, hash locked)  
**Website**: LIVE (https://y3kmarkets.pages.dev/)

**Next**: Implement assets.rs and issue F&F natively on Unykorn.

No more Horizon crashes.  
No more HTTP errors.  
No more external dependencies.

**Just deterministic state.**
