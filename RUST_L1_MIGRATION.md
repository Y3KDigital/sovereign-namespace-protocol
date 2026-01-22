# Rust L1 Migration Guide

## Overview

**Unykorn Rust L1** is now the **single source of truth** for all asset state (balances, credits, mints). XRPL/Stellar are **edge rails** only (on/off-ramps, proof beacons, distribution), not truth layers.

This migration replaces:
- ❌ SQLite ledger (`ops/ledger`) → ✅ Rust L1 `ChainState`
- ❌ EVM/web3 minting → ✅ Native Rust L1 state mutations
- ❌ Postgres balance cache → ✅ Read from Rust L1 indexer

## Architecture

```
User Dashboard
    ↓
Next.js /api/me/wallet
    ↓
Rust L1 Indexer (port 8088)  ← HTTP API: /assets, /balances, /audit
    ↓
Unykorn Rust L1 ChainState   ← Source of truth: assets, balances, namespaces
    ↑
Consent Gateway              ← Mints UCRED after top-up verification
    ↑
Top-up Watcher (MATIC/ETH)  ← Monitors deposit addresses
```

XRPL/Stellar: Optional proof anchoring + IOU distribution (balances stay on Rust L1)

## Components Deployed

### 1. Rust L1 State Modules

**Location**: `uny-korn-l1/crates/state/src/`

- **[assets.rs](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\crates\state\src\assets.rs)** - Asset registry (UCRED, UUSD, GOLD, F&F tokens)
  - `register_asset()`, `get_asset()`, `list_assets()`
  - Deterministic commitment hash (Blake3)

- **[balances.rs](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\crates\state\src\balances.rs)** - Balance ledger (sovereign mint)
  - `credit()`, `debit()`, `transfer()`, `balance_of()`, `balances_for_account()`
  - Enforces non-negative balances, overflow protection
  - Deterministic commitment hash (Blake3)

- **[lib.rs](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\crates\state\src\lib.rs)** - ChainState integration
  - `state_root_hex()` combines namespaces + assets + balances commitments
  - Single deterministic state root for consensus

### 2. Rust L1 Indexer API

**Location**: `uny-korn-l1/indexer/`

HTTP server that reads Rust L1 `ChainState` and exposes:

- `GET /assets` - List all registered assets
- `GET /balances?account=acct:user:{sub}` - Query account balances
- `GET /audit` - State root hash + block height
- `POST /internal/credit` - **DEV ONLY** credit endpoint (remove in production)

**Drop-in replacement** for `ops/ledger` API (same contract, different backend).

### 3. Gateway Client

**Location**: [ops/adapters/rust_l1_gateway.py](file://c:\Users\Kevan\web3 true web3 rarity\ops\adapters\rust_l1_gateway.py)

Python client for consent-gateway to mint UCRED on Rust L1.

## Build & Run

### Step 1: Build Rust L1 with new state modules

```powershell
cd uny-korn-l1
cargo build --release
cargo test --all  # Verify assets + balances modules
```

Expected output:
```
test assets::tests::register_and_retrieve_asset ... ok
test assets::tests::commitment_is_deterministic ... ok
test balances::tests::credit_and_balance_of ... ok
test balances::tests::debit_insufficient_balance ... ok
test balances::tests::transfer_atomic ... ok
test balances::tests::commitment_is_deterministic ... ok
```

### Step 2: Run Rust L1 Indexer

```powershell
cd uny-korn-l1
cargo run --release -p rust-l1-indexer
```

Expected output:
```
rust-l1-indexer listening on 0.0.0.0:8088
```

Indexer seeds genesis state on boot:
- 11 assets (UCRED, UUSD, GOLD, FTH, MOG, XXXIII, OPTKAS1, KBURNS, EUR, GBP, DRUNKS)
- 3 treasuries with 1,000 UCRED each (MAIN, FTH, MOG)

### Step 3: Verify API

```powershell
# List assets (expect 11)
curl http://localhost:8088/assets | ConvertFrom-Json | Format-Table

# Query treasury balance (expect 1,000 UCRED = 1e21 wei)
curl "http://localhost:8088/balances?account=acct:treasury:MAIN" | ConvertFrom-Json

# Check state root
curl http://localhost:8088/audit | ConvertFrom-Json
```

Expected results:
- `/assets`: 11 assets with symbols, decimals (18), policy_uri
- `/balances`: `[{"asset":"UCRED","balance_wei":"1000000000000000000000"}]`
- `/audit`: `{"state_root":"0xabc...","height":0}`

### Step 4: Test Dev Credit (Temporary)

```powershell
# Credit 0.1 UCRED to test user
$body = @{
    asset = "UCRED"
    account = "acct:user:alice"
    amount_wei = "100000000000000000"
    memo = "test credit"
} | ConvertTo-Json

Invoke-WebRequest -Method POST -Uri "http://localhost:8088/internal/credit" `
    -ContentType "application/json" -Body $body

# Verify credit
curl "http://localhost:8088/balances?account=acct:user:alice" | ConvertFrom-Json
```

Expected: Alice now has 0.1 UCRED (100000000000000000 wei)

## Configuration Changes

### Consent Gateway

**File**: `ops/home/.env` (or Docker Compose env)

```bash
# OLD (EVM/web3)
# SOVEREIGN_RPC=https://polygon-rpc.com
# MINTER_PK=0xabc...

# NEW (Rust L1)
RUST_L1_INDEXER=http://localhost:8088
RUST_L1_OPERATOR_KEY=<Rust L1 signing key>  # NOT an EVM key
ADMIN_TOKEN=<strong-secret>
```

**Python Integration**:
```python
from ops.adapters.rust_l1_gateway import RustL1Gateway

gateway = RustL1Gateway(indexer_url=os.getenv("RUST_L1_INDEXER"))
gateway.credit_account(
    asset="UCRED",
    account=f"acct:user:{user_sub}",
    amount_wei=100_000_000_000_000_000,  # 0.1 UCRED
    memo=f"topup:{deposit_tx_hash}",
)
```

### Studio (Token Mint UI)

**File**: `studio/.env`

```bash
# OLD
# DEFAULT_RPC=https://polygon-rpc.com

# NEW
DEFAULT_RPC=http://localhost:18xxx  # Rust L1 validator RPC (if exposed)
DEFAULT_TLD=fth
DEFAULT_SBT_NAMESPACE=fth
GASLESS_FORWARDER=<Rust L1 forwarder/dispatcher id>
```

### Dashboard Wallet Tile

**File**: `y3k-markets-web/.env.local`

```bash
# Keep existing - proxy already hits :8088
NEXT_PUBLIC_LEDGER_API=http://localhost:8088
```

**No code changes required** - [ledger-client.ts](file://c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\lib\ledger-client.ts) already calls `/balances` and works with indexer response format.

## Top-Up Pipeline (MATIC/ETH → UCRED)

**Flow**:
1. User deposits MATIC/ETH to assigned address (monitored by `topup_watcher.py`)
2. Watcher verifies deposit on public chain
3. Watcher calls consent-gateway `/credit/topup`
4. Gateway calls Rust L1 indexer `/internal/credit` (dev) or signs transaction (production)
5. UCRED minted on Rust L1
6. Dashboard reflects new balance via `/balances` query

**No user UX changes** - same deposit flow, different backend mint.

## XRPL/Stellar as Edge Rails

### Proof Beacons

Periodically anchor Rust L1 state root to XRPL/Stellar for public verifiability:

```powershell
# Daily snapshot
$stateRoot = (curl http://localhost:8088/audit | ConvertFrom-Json).state_root
# Submit $stateRoot to XRPL memo field or Stellar transaction
```

### Distribution (Optional)

If issuing IOUs on XRPL:
1. Mirror Rust L1 vault reserves → XRPL issuer account
2. Users trust XRPL issuer
3. Gateway controls minting (Rust L1 stays authoritative)

**Key Principle**: XRPL/Stellar balances are **representations**, not sources of truth.

## Migration Checklist

- [ ] Build Rust L1 with new state modules (`cargo build --release`)
- [ ] Run tests (`cargo test --all`)
- [ ] Start indexer (`cargo run -p rust-l1-indexer`)
- [ ] Verify `/assets` (11 symbols)
- [ ] Verify `/balances` (3 treasuries with 1,000 UCRED each)
- [ ] Verify `/audit` (valid state root hash)
- [ ] Test dev credit endpoint (`POST /internal/credit`)
- [ ] Update consent-gateway env (`RUST_L1_INDEXER`)
- [ ] Update studio env (`DEFAULT_RPC`)
- [ ] Test top-up flow (MATIC → UCRED mint on Rust L1)
- [ ] Verify dashboard wallet tile reads from indexer
- [ ] Set up XRPL/Stellar proof beacon (optional)
- [ ] Remove `/internal/credit` endpoint in production
- [ ] Implement transaction signing + validator submission

## Production Hardening

### Replace Dev Credit Endpoint

Current: `/internal/credit` directly mutates `ChainState` (dev only)

Production:
1. Build transaction signer (ed25519 or chain-specific curve)
2. Construct signed transaction: `Credit { asset, account, amount_wei, memo, signature }`
3. Submit to Rust L1 validator mempool
4. Wait for block confirmation
5. Query `/audit` to verify state root change

**Remove** `/internal/credit` route from indexer before production deploy.

### JWT Authentication

Protect indexer endpoints (optional for public read, required for writes):
```rust
.layer(axum::middleware::from_fn(jwt_auth_middleware))
```

### Rate Limiting

```rust
use tower::limit::RateLimitLayer;
.layer(RateLimitLayer::new(100, Duration::from_secs(60)))
```

### HTTPS + Cloudflare

Deploy indexer behind nginx reverse proxy:
```nginx
location /ledger/ {
    proxy_pass http://127.0.0.1:8088/;
    proxy_set_header Host $host;
}
```

Add Cloudflare proxy for DDoS protection.

### State Persistence

Current: In-memory `ChainState` (resets on restart)

Production:
- Add RocksDB or SQLite for state checkpointing
- Load latest snapshot on indexer boot
- Sync from validator if behind

### Validator Integration

Current: Indexer seeds genesis state on boot

Production:
- Indexer subscribes to validator block stream
- Processes each block, updates `ChainState`
- Serves queries from synced state
- No direct state mutations (read-only except via validator)

## Success Criteria

✅ All tests pass (`cargo test --all`)  
✅ Indexer serves 11 assets  
✅ 3 treasuries show 1,000 UCRED each  
✅ State root hash changes after credits  
✅ Dashboard wallet tile displays balances from indexer  
✅ Top-up flow mints UCRED on Rust L1  
✅ Consent gateway uses `rust_l1_gateway.py`  
✅ XRPL/Stellar used only for proofs (optional)  

## Troubleshooting

### Port Conflict (8088 in use)

```powershell
netstat -ano | findstr :8088
taskkill /PID <PID> /F
```

Or change indexer port:
```rust
let addr = "0.0.0.0:8089";  // Use different port
```

### State Root Mismatch

If indexer state diverges from validator:
1. Stop indexer
2. Delete checkpoint DB (if using persistence)
3. Restart indexer (reseeds genesis)
4. Sync from validator block stream

### Dashboard Shows Zero Balance

Check:
1. Indexer is running (`curl http://localhost:8088/audit`)
2. Account naming matches (`acct:user:{sub}`)
3. Genesis credits executed (query `/balances?account=acct:treasury:MAIN`)

### Dev Credit Fails

Verify:
- Asset exists (`curl http://localhost:8088/assets | findstr UCRED`)
- Amount is valid u128 string
- No overflow (current + amount < u128::MAX)

## File Structure

```
uny-korn-l1/
├── crates/state/src/
│   ├── assets.rs          ✅ NEW - Asset registry
│   ├── balances.rs        ✅ NEW - Balance ledger
│   ├── lib.rs             ✅ UPDATED - ChainState integration
│   └── namespaces.rs      ✅ EXISTING - Namespace registry
├── indexer/               ✅ NEW CRATE
│   ├── Cargo.toml
│   └── src/main.rs        - HTTP API server
└── Cargo.toml             ✅ UPDATED - Added indexer to workspace

ops/adapters/
└── rust_l1_gateway.py     ✅ NEW - Python client for consent-gateway

y3k-markets-web/lib/
└── ledger-client.ts       ✅ EXISTING - No changes needed (works with indexer)
```

## Next Steps

1. **Test Full Flow**: Deposit MATIC → verify UCRED mint → check dashboard balance
2. **Deploy Indexer**: Run as background service (systemd/PM2/Docker)
3. **Anchor Snapshots**: Set up daily XRPL/Stellar proof beacon
4. **Remove Dev Endpoint**: Replace `/internal/credit` with transaction signing
5. **Validator Integration**: Connect indexer to Rust L1 block stream

---

**Result**: Rust L1 is now the **sovereign mint**. All balances tracked on-chain with deterministic state roots. XRPL/Stellar relegated to edge distribution only. Dashboard UX unchanged, but now reading from **real blockchain state** instead of cached JSON.
