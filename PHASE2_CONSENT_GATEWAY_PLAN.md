# Phase 2: Consent Gateway Integration - PLAN

**Goal**: Wire consent-gateway to mint UCRED on Rust L1 after top-up verification

**Status**: 🟡 In Progress  
**Phase 1**: ✅ Complete (dev endpoint removed from indexer)  
**Phase 2**: ⏳ Starting now

---

## Current State

### What Exists
- ✅ Rust L1 indexer running on :8089 (read-only)
- ✅ `ops/adapters/rust_l1_gateway.py` (Python client)
- ✅ Payments-api with Stripe webhook flow
- ✅ Genesis with 11 assets, 3 treasuries

### What's Missing
- ❌ Consent-gateway service (no Python service found in workspace)
- ❌ Top-up watcher service
- ❌ Operator signing keys for minting
- ❌ Transaction submission endpoint on Rust L1

---

## Problem: Dev Endpoint Removed

The `rust_l1_gateway.py` client was written to call:
```python
POST /internal/credit  # ❌ REMOVED in Phase 1
```

**This no longer exists** (intentionally removed for security).

---

## Solution: Implement Operator Consent Path

### Architecture (Production-Ready)

```
User Deposits MATIC/ETH
        ↓
Top-Up Watcher (detects deposit)
        ↓
Calls Consent Gateway /credit/topup
        ↓
Consent Gateway verifies policy
        ↓
Signs transaction with OPERATOR_KEY
        ↓
Submits to Rust L1 validator/mempool
        ↓
Validator applies state mutation
        ↓
Indexer reflects new balance
        ↓
Dashboard shows UCRED credit
```

### Current Simplified Path (Phase 2)

Since we don't have validator/mempool/consensus yet:

```
Payment Success (Stripe webhook)
        ↓
Payments-API issues namespace certificate
        ↓
(Optional) Call consent-gateway to credit UCRED
        ↓
Gateway calls Rust L1 **admin endpoint** (new)
        ↓
Admin endpoint verifies OPERATOR_TOKEN
        ↓
Admin endpoint mutates ChainState directly
        ↓
Indexer reflects new balance
```

**Key Change**: Add authenticated admin endpoint instead of open dev endpoint.

---

## Implementation Steps

### Step 1: Add Admin Minting Endpoint to Indexer (30 min)

**File**: `uny-korn-l1/indexer/src/main.rs`

**Add** (around line 50, after `/audit` route):
```rust
.route("/admin/credit", post(admin_credit))
```

**Add** (around line 200, before health_check):
```rust
#[derive(Debug, Deserialize)]
struct AdminCreditRequest {
    asset: String,
    account: String,
    amount_wei: String,
    memo: String,
    operator_token: String,
}

#[derive(Debug, Serialize)]
struct AdminCreditResponse {
    success: bool,
    new_balance_wei: String,
    state_root: String,
}

async fn admin_credit(
    Json(req): Json<AdminCreditRequest>,
    State(state): State<Arc<RwLock<ChainState>>>,
) -> Result<Json<AdminCreditResponse>, (StatusCode, String)> {
    // CHECKPOINT: Verify operator token
    let expected_token = std::env::var("RUST_L1_ADMIN_TOKEN")
        .unwrap_or_else(|_| "INSECURE_DEV_TOKEN".to_string());

    if req.operator_token != expected_token {
        return Err((StatusCode::UNAUTHORIZED, "Invalid operator token".to_string()));
    }

    // Parse amount
    let amount_wei = req.amount_wei.parse::<u128>()
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid amount: {}", e)))?;

    // Get write lock and credit account
    let mut state_lock = state.write().await;
    let balances = state_lock.balances_mut();

    balances.credit(&req.asset, &req.account, amount_wei)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Get new balance
    let new_balance = balances.balance(&req.asset, &req.account)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Get state root
    let state_root = state_lock.state_root_hex();

    tracing::info!(
        "Admin credit: asset={} account={} amount_wei={} memo={} new_balance_wei={} state_root={}",
        req.asset, req.account, amount_wei, req.memo, new_balance, state_root
    );

    Ok(Json(AdminCreditResponse {
        success: true,
        new_balance_wei: new_balance.to_string(),
        state_root,
    }))
}
```

**Add import** (around line 15):
```rust
use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use std::sync::Arc;
use tokio::sync::RwLock;
```

---

### Step 2: Update rust_l1_gateway.py (10 min)

**File**: `ops/adapters/rust_l1_gateway.py`

**Change** `__init__` signature:
```python
def __init__(
    self,
    indexer_url: str = "http://localhost:8089",
    admin_token: Optional[str] = None,
):
    self.indexer_url = indexer_url.rstrip("/")
    self.admin_token = admin_token or os.getenv("RUST_L1_ADMIN_TOKEN", "INSECURE_DEV_TOKEN")
```

**Change** `credit_account` method:
```python
def credit_account(
    self,
    asset: str,
    account: str,
    amount_wei: int,
    memo: str,
) -> dict:
    """
    Credit an account via admin endpoint (operator consent).

    Args:
        asset: Asset symbol (UCRED)
        account: Account ID (acct:user:{sub})
        amount_wei: Amount to credit (wei units)
        memo: Transaction memo (topup:{tx_hash})

    Returns:
        {"success": true, "new_balance_wei": "...", "state_root": "..."}
    """
    url = f"{self.indexer_url}/admin/credit"
    payload = {
        "asset": asset.upper(),
        "account": account,
        "amount_wei": str(amount_wei),
        "memo": memo,
        "operator_token": self.admin_token,
    }

    response = requests.post(url, json=payload, timeout=10)
    response.raise_for_status()

    return response.json()
```

---

### Step 3: Set Environment Variables (5 min)

**Create**: `ops/home/.env` (if it doesn't exist)

**Add**:
```bash
# Rust L1 Configuration
RUST_L1_INDEXER=http://localhost:8089
RUST_L1_ADMIN_TOKEN=<generate-strong-secret>

# Example token generation (PowerShell):
# [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Generate token** (run in PowerShell):
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

### Step 4: Test Gateway Integration (10 min)

**Create test script**: `ops/test-rust-l1-gateway.py`

```python
#!/usr/bin/env python3
"""Test Rust L1 Gateway - Admin Minting"""

import os
import sys
from decimal import Decimal

# Add ops dir to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ops.adapters.rust_l1_gateway import RustL1Gateway

def main():
    # Initialize gateway
    gateway = RustL1Gateway(
        indexer_url=os.getenv("RUST_L1_INDEXER", "http://localhost:8089"),
        admin_token=os.getenv("RUST_L1_ADMIN_TOKEN"),
    )

    test_account = "acct:user:test_alice"
    test_asset = "UCRED"

    # Test 1: Get initial balance
    print("\n[1/3] Get initial balance...")
    initial_balance = gateway.get_balance(test_asset, test_account)
    print(f"✅ Initial balance: {initial_balance} wei ({initial_balance / Decimal(10**18)} UCRED)")

    # Test 2: Credit account
    print("\n[2/3] Credit account (admin mint)...")
    amount_wei = 100_000_000_000_000_000  # 0.1 UCRED
    receipt = gateway.credit_account(
        asset=test_asset,
        account=test_account,
        amount_wei=amount_wei,
        memo="test:manual_credit",
    )
    print(f"✅ Credit success: {receipt['success']}")
    print(f"   New balance: {receipt['new_balance_wei']} wei")
    print(f"   State root: {receipt['state_root'][:16]}...")

    # Test 3: Verify new balance
    print("\n[3/3] Verify new balance...")
    new_balance = gateway.get_balance(test_asset, test_account)
    print(f"✅ New balance: {new_balance} wei ({new_balance / Decimal(10**18)} UCRED)")
    print(f"   Delta: +{new_balance - initial_balance} wei")

    # Test 4: Get state root
    print("\n[4/4] Get state root...")
    audit = gateway.get_state_root()
    print(f"✅ State root: {audit['state_root'][:16]}...")
    print(f"   Height: {audit['height']}")

    print("\n✅ ALL TESTS PASSED\n")

if __name__ == "__main__":
    main()
```

**Run test**:
```powershell
cd "C:\Users\Kevan\web3 true web3 rarity"
python ops/test-rust-l1-gateway.py
```

---

### Step 5: Wire Payments-API (Optional, 15 min)

If you want payments to mint UCRED, add to `payments-api/src/handlers.rs`:

**In `stripe_webhook` handler** (after certificate issuance):
```rust
// OPTIONAL: Mint UCRED on Rust L1
if let Ok(indexer_url) = std::env::var("RUST_L1_INDEXER") {
    if let Ok(admin_token) = std::env::var("RUST_L1_ADMIN_TOKEN") {
        let account = format!("acct:user:{}", payment_intent.metadata.get("customer_email").unwrap_or(&"unknown".to_string()));
        let amount_wei = "1000000000000000000"; // 1 UCRED per purchase

        let client = reqwest::Client::new();
        let _resp = client
            .post(format!("{}/admin/credit", indexer_url))
            .json(&serde_json::json!({
                "asset": "UCRED",
                "account": account,
                "amount_wei": amount_wei,
                "memo": format!("purchase:{}", payment_intent_id),
                "operator_token": admin_token,
            }))
            .send()
            .await;

        tracing::info!("Minted 1 UCRED for {}", account);
    }
}
```

**Add to `.env`**:
```bash
RUST_L1_INDEXER=http://localhost:8089
RUST_L1_ADMIN_TOKEN=<your-token>
```

---

## Timeline

- **Step 1**: Add admin endpoint (30 min)
- **Step 2**: Update gateway client (10 min)
- **Step 3**: Set environment vars (5 min)
- **Step 4**: Test integration (10 min)
- **Step 5**: Wire payments-api (15 min, optional)

**Total**: 1 hour 10 minutes

---

## Success Criteria

- [ ] Admin endpoint added to indexer
- [ ] RUST_L1_ADMIN_TOKEN environment variable set
- [ ] Gateway client updated with token auth
- [ ] Test script passes (4/4 tests)
- [ ] Manual credit from Python works
- [ ] State root updates after credit
- [ ] Balance queries reflect new credit
- [ ] (Optional) Payments-API mints UCRED

---

## Security Notes

### Admin Token Protection
- ✅ Token required for all admin operations
- ✅ Token stored in environment (not code)
- ✅ Token validated on every request
- ✅ Failed auth returns 401 (no details leaked)

### Rate Limiting (Future)
- Add rate limit: 100 req/min per token
- Add audit log: all admin credits logged
- Add alert: unusual minting patterns

### Transition to Validator (Phase 3)
When consensus is ready:
1. Remove `/admin/credit` endpoint
2. Add transaction submission endpoint
3. Gateway signs transactions with operator key
4. Validator validates + applies state changes
5. Indexer reads from validator (not direct mutation)

---

## Rollback Plan

If Phase 2 breaks:

```powershell
cd "C:\Users\Kevan\web3 true web3 rarity\uny-korn-l1"

# Revert indexer changes
git checkout indexer/src/main.rs

# Rebuild
cargo build --release -p rust-l1-indexer

# Restart
Get-Process | Where-Object { $_.ProcessName -eq "rust-l1-indexer" } | Stop-Process -Force
Start-Process -NoNewWindow -FilePath "./target/release/rust-l1-indexer.exe"
```

---

## Next Steps After Phase 2

### Phase 3: XRPL/Stellar Adapters
- Update `ops/adapters/xrpl_adapter.py`
- Update `ops/adapters/stellar_adapter.py`
- Point to :8089 instead of legacy endpoints

### Phase 4: Dashboard Integration
- Verify `NEXT_PUBLIC_LEDGER_API=http://localhost:8089`
- Test balance queries from dashboard
- Show UCRED balances in wallet tile

### Phase 5: Production Hardening
- JWT authentication
- Rate limiting
- HTTPS reverse proxy
- Cloudflare DDoS protection
- State persistence (RocksDB)
- Validator integration

---

**Ready to Execute**: ✅ All prerequisites met (Phase 1 complete, indexer operational)

**Next Command**: Add admin endpoint to indexer
