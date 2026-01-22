# Unykorn L1 F&F Issuance Plan
**Decision: Pivot from Stellar to Unykorn for F&F token issuance**

## Context
- **Genesis Complete**: 955 certificates, hash `0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc`
- **Stellar Status**: DEPRECATED - validators unstable, Horizon crashes, API impedance
- **Unykorn Status**: READY - 58 Rust files, BFT consensus, native state machine

## Why This Works

### What You Already Have
```
✅ Native namespace registry (namespaces.rs)
✅ Asset state model (assets.rs - placeholder, needs expansion)
✅ BFT consensus runtime (runtime/)
✅ Audit log (append-only, hash-chained)
✅ Governance + TEV gates (capital_gate)
✅ 955 genesis certificates (IMMUTABLE)
```

### What Stellar Was Giving You
- Consensus → **Unykorn has BFT**
- Asset issuance → **Unykorn has native state**
- Verifiability → **Unykorn has audit log**
- APIs → **Unykorn has registry-api/**

**You don't need Stellar. You never did.**

---

## Implementation Path (3-5 days)

### Phase 1: Asset State Model (Day 1)
**File**: `uny-korn-l1/crates/state/src/assets.rs`

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asset {
    pub asset_code: String,           // "ROGUE"
    pub namespace: String,             // "rogue.x"
    pub total_supply: u64,             // 35_000
    pub genesis_hash: String,          // Your genesis hash
    pub issued_at: u64,                // Block height
    pub issuer_authority: Address,     // F&F issuer key
    pub certificate_cid: String,       // IPFS CID
}

#[derive(Debug, Default)]
pub struct AssetRegistry {
    assets: BTreeMap<String, Asset>,   // asset_code -> Asset
}

impl AssetRegistry {
    pub fn issue_genesis_asset(&mut self, asset: Asset) -> Result<()> {
        // Validate certificate exists
        // Check namespace authority
        // Enforce supply rules
        // Record to audit log
        // Return commitment hash
    }
    
    pub fn commitment_hash_hex(&self) -> String {
        // Deterministic hash over all assets
        // Used for state root
    }
}
```

**Status**: Placeholder exists, needs implementation

---

### Phase 2: F&F Genesis Issuance (Day 2)
**File**: `uny-korn-l1/genesis/ff-namespaces.json`

```json
{
  "genesis_hash": "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc",
  "issued_at_height": 0,
  "issuer_authority": "KEVAN_FF_ISSUER_KEY",
  "assets": [
    {
      "namespace": "ben.x",
      "asset_code": "BEN",
      "supply": 35000,
      "tier": "Mid-Tier ($35K)",
      "certificate_cid": "QmVr7U9y59aBWCGbd7MLH1pw1guAvoJJVuVaXNjkuTfPXn",
      "distributor": "GDYJH2DDKTYMSOHP7JSWLHO64KSOUZIOFDIW2DRKBGA752AM7UDG3ZLB3"
    },
    {
      "namespace": "rogue.x",
      "asset_code": "ROGUE",
      "supply": 35000,
      "tier": "Mid-Tier ($35K)",
      "certificate_cid": "QmVr7U9y59aBWCGbd7MLH1pw1guAvoJJVuVaXNjkuTfPXn",
      "distributor": "GCRQAXCBFYXRYEDHZXJMR76NCMBWCWOGTKILDNIQ3OZF5SPLNTP7QP3R"
    }
    // ... 9 more
  ]
}
```

**Script**: `genesis/issue-ff-native.rs`
```rust
// Read ff-namespaces.json
// For each asset:
//   1. Verify genesis certificate
//   2. Check human authorization (offline or cli confirm)
//   3. Call AssetRegistry::issue_genesis_asset()
//   4. Mint to distributor balance
//   5. Log to audit trail
//   6. Return state commitment hash
```

---

### Phase 3: Balance Ledger (Day 3)
**File**: `uny-korn-l1/crates/state/src/balances.rs`

```rust
type BalanceKey = (Address, String); // (account, asset_code)

#[derive(Debug, Default)]
pub struct BalanceLedger {
    balances: BTreeMap<BalanceKey, u64>,
}

impl BalanceLedger {
    pub fn mint(&mut self, to: Address, asset: &str, amount: u64) -> Result<()> {
        // Check asset exists in AssetRegistry
        // Add to balance
        // Log to audit
    }
    
    pub fn balance(&self, account: &Address, asset: &str) -> u64 {
        self.balances.get(&(*account, asset.to_string())).copied().unwrap_or(0)
    }
}
```

**Minting flow**:
```
issue_genesis_asset() → mint_to_distributor() → audit_log
```

---

### Phase 4: Registry API Endpoints (Day 4)
**File**: `uny-korn-l1/registry-api/src/main.rs`

Add endpoints:
```rust
GET  /assets                    // List all issued assets
GET  /assets/{code}             // Get asset details
GET  /balances/{address}        // Get all balances for address
GET  /balances/{address}/{asset} // Get specific balance
GET  /audit/issuances           // Audit log of all issuances
GET  /state/commitment          // Current state root hash
```

**No write endpoints** - issuance is genesis-only (for now)

---

### Phase 5: F&F Delivery (Day 5)
**Deliverable**: Provable receipts for each F&F participant

```json
{
  "namespace": "rogue.x",
  "asset_code": "ROGUE",
  "supply": 35000,
  "distributor": "GCRQAXCBFYXRYEDHZXJMR76NCMBWCWOGTKILDNIQ3OZF5SPLNTP7QP3R",
  "balance": 35000,
  "issued_at_height": 0,
  "genesis_hash": "0x6787f9...",
  "state_commitment": "0xabc123...",
  "audit_log_entry": 42,
  "verifiable_via": "http://localhost:3000/audit/issuances/42",
  "status": "ISSUED"
}
```

**Human-readable**: "You own 35,000 ROGUE tokens, issued at genesis block 0, verifiable on Unykorn L1"

---

## Advantages Over Stellar

| Concern | Stellar | Unykorn |
|---------|---------|---------|
| **Consensus** | BFT but external dependency | BFT native, you control |
| **Issuance** | Via Horizon + SDK | Direct state transition |
| **Verification** | Horizon API (can lag/fail) | Local state query |
| **HTTP/HTTPS** | Required, causes errors | Optional (local RPC) |
| **Account loading** | Intermittent failures | Deterministic state |
| **Supply rules** | Trustline semantics | Native validation |
| **Audit trail** | Transaction history | Append-only hash-chain |
| **Compliance** | "Best effort" | Provably deterministic |
| **Cost** | XLM fees | Zero (your chain) |
| **Sovereignty** | Rented | Owned |

---

## Migration Plan (Stellar → Unykorn)

### Immediate (Today)
1. ✅ **Freeze Digital Giant** - no new issuances
2. ✅ **Declare Stellar deprecated** - document in PRIVATE_L1_PRODUCTION_LOCK.md
3. ✅ **Mark existing tokens as "proof of concept"** - ELON, BRAD, N333, DON, N88 on public Stellar

### Phase 1 (Days 1-5)
1. **Implement asset state model** (assets.rs)
2. **Create F&F genesis issuance** (ff-namespaces.json + script)
3. **Mint to distributor balances** (balances.rs)
4. **Expose registry API** (registry-api endpoints)
5. **Deliver provable receipts** to F&F participants

### Phase 2 (Week 2+)
1. **Optional**: Mirror Unykorn assets to Stellar (read-only, informational)
2. **Optional**: Bridge to XRPL for liquidity (Unykorn = truth, XRPL = distribution)
3. **Never**: Trust external chains as source of truth

---

## Success Criteria

✅ **All 11 F&F tokens issued natively on Unykorn**  
✅ **Each participant has verifiable balance**  
✅ **State commitment hash published**  
✅ **Audit log shows all issuances**  
✅ **API serves asset/balance queries**  
✅ **Zero Stellar dependency**

---

## Timeline

- **Day 1**: Implement assets.rs (4-6 hours)
- **Day 2**: Create F&F genesis data + issuance script (4-6 hours)
- **Day 3**: Implement balance minting (3-4 hours)
- **Day 4**: Add registry API endpoints (4-6 hours)
- **Day 5**: Generate F&F receipts + documentation (2-3 hours)

**Total**: ~20-25 hours = 3-5 days solo, or 2-3 days with focus

---

## Next Actions

1. **Review this plan** - confirm approach
2. **Implement assets.rs** - expand placeholder
3. **Create ff-namespaces.json** - map 11 F&F tokens
4. **Build issuance script** - genesis asset registration
5. **Test locally** - verify state transitions
6. **Deploy** - issue F&F tokens natively
7. **Deliver** - send receipts to participants

**No Stellar. No Horizon. No HTTP errors. Just deterministic state.**

---

## Documentation Updates

After completion:
- Update README.md: "F&F tokens issued on Unykorn L1"
- Create FF_ISSUANCE_RECEIPTS.md: Links to registry API queries
- Archive stellar-banking/: Mark as "deprecated, reference only"
- Update FINAL_STATUS_READY_TO_LAUNCH.md: "Unykorn L1 operational, F&F complete"

---

## Future: Stellar as Optional Mirror

When calm, if desired:

```rust
// Mirror Unykorn → Stellar (one-way)
fn mirror_to_stellar(unykorn_asset: &Asset) -> Result<StellarTx> {
    // Read from Unykorn (source of truth)
    // Issue representational token on Stellar
    // Include Unykorn state hash in memo
    // Purely informational - not authoritative
}
```

Unykorn = **truth**  
Stellar/XRPL = **distribution rails**

Never the other way around.
