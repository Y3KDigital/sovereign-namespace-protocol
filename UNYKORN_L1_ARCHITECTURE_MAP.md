# Unykorn L1 Complete Architecture Map

**Generated**: January 21, 2026  
**Status**: ✅ Operational with indexer on port 8089

---

## Workspace Structure

```
uny-korn-l1/
├── Cargo.toml                 ✅ Workspace root (10 members)
├── crates/                    ✅ Core blockchain modules
│   ├── state/                 ✅ ChainState (namespaces, assets, balances)
│   ├── consensus/             ✅ BFT consensus
│   ├── governance/            ✅ Policy governance
│   ├── tev/                   ✅ TEV (consensus + decision)
│   ├── execution/             ✅ Transaction execution
│   ├── audit/                 ✅ Audit trail
│   ├── runtime/               ✅ Runtime orchestration
│   └── verifier/              ✅ State verifier
├── node/                      ✅ Validator node binary
├── indexer/                   ✅ NEW - HTTP API (port 8089)
├── registry-api/              ✅ Namespace registry HTTP API
└── scripts/                   ✅ Utilities (policy hash generator)
```

---

## Critical Components

### 1. State Layer (crates/state/)

**[lib.rs](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\crates\state\src\lib.rs)**
```rust
pub struct ChainState {
    pub namespaces: NamespaceRegistry,  // TLD registry
    pub assets: AssetRegistry,          // UCRED, UUSD, GOLD, etc.
    pub balances: BalanceLedger,        // Sovereign mint
}

pub fn state_root_hex(&self) -> String {
    // Combines: namespaces + assets + balances
    // Blake3 deterministic commitment
}
```

**Status**: ✅ Fully implemented (namespaces, assets, balances)

### 2. Validator Node (node/)

**[main.rs](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\node\src\main.rs)**
```rust
fn main() {
    let mut rt = Runtime::new(RuntimeConfig {
        node_id: "node-1",
        chain_id: "uny-korn",
        policy_hash: env::var("UNYKORN_POLICY_HASH"),
    });
    rt.init_genesis_y3k()?;
    rt.tick_once()?;
    // Outputs audit JSON
}
```

**Purpose**: BFT validator with genesis initialization  
**Status**: ✅ Functional (outputs audit JSON)

### 3. Registry API (registry-api/)

**[main.rs](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\registry-api\src\main.rs)**
```rust
// Actix-web HTTP service
struct AppState {
    chain_state: Arc<Mutex<ChainState>>,
}

// Endpoints:
POST /register        - Register namespace
GET  /query/{name}    - Query namespace
GET  /list            - List all namespaces
```

**Purpose**: HTTP interface for namespace registry  
**Port**: Not specified (likely 3333 from dashboard config)  
**Status**: ✅ Functional

### 4. Indexer API (indexer/) **NEW**

**[main.rs](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\indexer\src\main.rs)**
```rust
// Axum HTTP service
struct AppState {
    chain_state: Arc<RwLock<ChainState>>,
    height: Arc<RwLock<u64>>,
}

// Endpoints:
GET  /assets                  - List all assets
GET  /balances?account=X      - Query balances
GET  /audit                   - State root + height
POST /internal/credit         - DEV ONLY (remove in prod)
```

**Purpose**: Balance ledger API (drop-in for ops/ledger)  
**Port**: **8089** (8088 occupied by Docker)  
**Status**: ✅ Operational, verified

---

## Integration Points

### Dashboard (y3k-markets-web/)

**Config**: [.env.local](file://c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\.env.local)
```bash
NEXT_PUBLIC_LEDGER_API=http://localhost:8089        # ✅ NEW - Points to indexer
NEXT_PUBLIC_BLOCKCHAIN_API=http://127.0.0.1:3333   # Registry API
```

**Client**: [ledger-client.ts](file://c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\lib\ledger-client.ts)
- `getBalances(account)` → `/balances?account=X`
- `getAssets()` → `/assets`
- `getAuditHash()` → `/audit`

**Status**: ✅ Configured, ready to use

### Consent Gateway (ops/home/)

**Current**: Uses web3/EVM minting (deprecated)  
**Required**: Switch to Rust L1 indexer

**Config Change**:
```bash
# ops/home/.env
RUST_L1_INDEXER=http://localhost:8089  # or http://rust-l1-indexer:8089 in Docker
ADMIN_TOKEN=<strong-random-secret>
```

**Python Client**: [ops/adapters/rust_l1_gateway.py](file://c:\Users\Kevan\web3 true web3 rarity\ops\adapters\rust_l1_gateway.py)
```python
gateway = RustL1Gateway(indexer_url="http://localhost:8089")
gateway.credit_account(
    asset="UCRED",
    account=f"acct:user:{user_sub}",
    amount_wei=100_000_000_000_000_000,
    memo=f"topup:{tx_hash}",
)
```

**Status**: ⏳ Needs wiring (code exists, env not set)

---

## Critical Paths

### Genesis Flow
```
node/main.rs
  ↓
runtime.init_genesis_y3k()
  ↓
ChainState (empty namespaces, seeded assets, seeded balances)
  ↓
indexer boots → seeds same genesis state
```

### Balance Query Flow
```
Dashboard → ledger-client.ts
  ↓
GET /balances?account=acct:user:{sub}
  ↓
Indexer reads ChainState.balances
  ↓
Returns [{"asset":"UCRED","balance_wei":"1000..."}]
```

### Top-Up Flow (CURRENT - Needs Update)
```
User deposits MATIC/ETH
  ↓
topup_watcher.py detects deposit
  ↓
Calls consent-gateway /credit/topup
  ↓
❌ Gateway mints via web3/EVM (DEPRECATED)
  ↓
✅ Should mint via Rust L1 indexer /internal/credit (dev) or signed tx (prod)
```

### Namespace Registration Flow
```
Studio UI → POST /register
  ↓
registry-api validates
  ↓
Mutates ChainState.namespaces
  ↓
Returns commitment_hash
```

---

## Safety Checklist (DO NOT BREAK)

### ✅ Already Verified Safe
- [x] State modules compile (`cargo test --all` passed)
- [x] Indexer serves correct data (verify-indexer.ps1 ✅)
- [x] State root deterministic (Blake3 commitment)
- [x] Dashboard configured (points to :8089)

### ⚠️ Changes Required (Safe to Proceed)

1. **Remove `/internal/credit` endpoint** (indexer/src/main.rs)
   - Comment out route in Router::new()
   - Delete `dev_credit` handler function
   - Force: Requires rebuilding indexer

2. **Wire consent-gateway to indexer** (ops/home/)
   - Update .env: `RUST_L1_INDEXER=http://localhost:8089`
   - Update Python minting code to use `rust_l1_gateway.py`
   - Force: No rebuild, env + code change only

3. **Connect XRPL/Stellar adapters** (ops/adapters/)
   - Update `xrpl_adapter.py` and `stellar_adapter.py`
   - Point `LEDGER_URL` to `http://localhost:8089`
   - Force: No rebuild, env change only

### 🚫 DO NOT TOUCH (Critical Stability)

- ❌ **crates/state/src/lib.rs** - ChainState structure (working)
- ❌ **crates/state/src/assets.rs** - Asset registry (tested)
- ❌ **crates/state/src/balances.rs** - Balance ledger (tested)
- ❌ **crates/state/src/namespaces.rs** - Namespace registry (working)
- ❌ **node/src/main.rs** - Validator node (functional)
- ❌ **registry-api/src/main.rs** - Namespace HTTP API (functional)

Only touch **indexer/** and **ops/** configuration.

---

## Build Commands (Safe)

### Build All (Verify Nothing Broken)
```powershell
cd uny-korn-l1
cargo test --all
```
**Expected**: 7+ tests pass, no errors

### Build Indexer Only
```powershell
cd uny-korn-l1
cargo build --release -p rust-l1-indexer
```
**Expected**: Compiles to `target/release/rust-l1-indexer.exe`

### Run Validator Node (Test Genesis)
```powershell
cd uny-korn-l1
cargo run --release -p node
```
**Expected**: Outputs audit JSON with state_root

### Run Registry API (Test Namespaces)
```powershell
cd uny-korn-l1/registry-api
cargo run --release
```
**Expected**: Listens on configured port (likely :3333)

---

## Production Hardening Sequence

### Phase 1: Remove Dev Endpoint (30 min)
1. Edit indexer/src/main.rs (remove /internal/credit)
2. Rebuild: `cargo build --release -p rust-l1-indexer`
3. Restart indexer
4. Verify: `curl http://localhost:8089/internal/credit` → 404

### Phase 2: Wire Gateway (1 hour)
1. Update ops/home/.env
2. Update consent-gateway Python code to use rust_l1_gateway.py
3. Add JWT auth to indexer (optional, but recommended)
4. Test smoke: Admin mint → verify balance

### Phase 3: Adapters (1 hour)
1. Update xrpl_adapter.py and stellar_adapter.py
2. Point to :8089 instead of ops/ledger
3. Test: External payment → verify Rust L1 credit

### Phase 4: Observability (30 min)
1. Add Prometheus metrics to indexer
2. Ship logs to Loki
3. Set up Grafana dashboard

### Phase 5: Backups (30 min)
1. Add RocksDB persistence to indexer (optional for dev)
2. Hourly snapshot to S3/IPFS
3. Restore test

---

## Port Map

| Service | Port | Purpose |
|---------|------|---------|
| Dashboard | 8080 | Next.js UI |
| Payments API | 3005 | Stripe checkout |
| Registry API | 3333 | Namespace registry |
| **Indexer** | **8089** | **Balance ledger (NEW)** |
| Consent Gateway | TBD | Admin minting |
| Grafana | 3000 | Observability |

---

## State Root Verification

**Current State Root**: `13a441f673cdab318c220e8aac57a06107dc637fcb4bd64d37b6e8b28848a4e7`

This is deterministic over:
- Namespaces: 0 (empty genesis)
- Assets: 11 (UCRED, UUSD, GOLD, F&F tokens)
- Balances: 3 treasuries × 1,000 UCRED

**After any state mutation**, state root will change. Use `/audit` to verify.

---

## Risk Assessment

### 🟢 Low Risk (Proceed Immediately)
- Remove `/internal/credit` endpoint
- Update dashboard env (already done)
- Wire consent-gateway env

### 🟡 Medium Risk (Test Thoroughly)
- Switch gateway minting code to Rust L1
- Connect XRPL/Stellar adapters
- Add JWT auth to indexer

### 🔴 High Risk (Production Only)
- Remove all dev endpoints
- Change bind address to 127.0.0.1 (internal only)
- Deploy behind HTTPS reverse proxy

---

## Rollback Plan

If anything breaks:

1. **Indexer issues**: Kill process, restore ops/ledger (SQLite backup)
2. **Gateway issues**: Revert .env, restart with old web3 code
3. **State corruption**: Restart indexer (reseeds genesis)
4. **Namespace registry issues**: Node is immutable (safe)

**Critical**: Genesis state is **immutable** (seeded on boot). No risk of losing historical data in dev mode.

---

## Next Commands (Safe Execution Order)

```powershell
# 1. Verify current state is clean
cd uny-korn-l1
cargo test --all
.\verify-indexer.ps1

# 2. Remove dev endpoint (edit indexer/src/main.rs)
# Comment out .route("/internal/credit", post(dev_credit))

# 3. Rebuild indexer
cargo build --release -p rust-l1-indexer

# 4. Restart indexer (kill old process first)
Stop-Process -Name "rust-l1-indexer" -Force -ErrorAction SilentlyContinue
Start-Process -NoNewWindow -FilePath "./target/release/rust-l1-indexer.exe"

# 5. Verify dev endpoint removed
curl http://localhost:8089/internal/credit
# Expected: 404 or connection refused

# 6. Update gateway env (ops/home/.env)
# Add: RUST_L1_INDEXER=http://localhost:8089

# 7. Test smoke
# (Manual admin mint via gateway → verify balance)
```

---

**Status**: ✅ **SAFE TO PROCEED** with hardening steps. Core blockchain modules are stable and tested.
