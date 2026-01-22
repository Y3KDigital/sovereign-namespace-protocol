# Phase 1: Hardening Execution Plan

## 🎯 Objective
Remove dev-only `/internal/credit` endpoint and add production-ready security controls.

---

## Step 1: Remove Dev Credit Endpoint

**File**: [indexer/src/main.rs](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\indexer\src\main.rs)

**Changes**:
1. Remove `.route("/internal/credit", post(dev_credit))` from Router
2. Remove `dev_credit` handler function (lines ~220-250)
3. Remove unused `CreditRequest` and `CreditResponse` structs

**Command**:
```powershell
cd uny-korn-l1
# Edit indexer/src/main.rs (remove 3 sections)
cargo build --release -p rust-l1-indexer
```

---

## Step 2: Add Environment-Based Configuration

**File**: [indexer/src/main.rs](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\indexer\src\main.rs)

**Add**:
```rust
// Read from env
let bind_addr = std::env::var("INDEXER_BIND_ADDR")
    .unwrap_or_else(|_| "0.0.0.0:8089".to_string());

let admin_token = std::env::var("INDEXER_ADMIN_TOKEN").ok();
```

---

## Step 3: Add Health Check Endpoint

**File**: [indexer/src/main.rs](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\indexer\src\main.rs)

**Add**:
```rust
.route("/health", get(health_check))

async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "rust-l1-indexer",
        "version": env!("CARGO_PKG_VERSION")
    }))
}
```

---

## Step 4: Add Prometheus Metrics (Optional)

**File**: [indexer/Cargo.toml](file://c:\Users\Kevan\web3 true web3 rarity\uny-korn-l1\indexer\Cargo.toml)

**Add**:
```toml
metrics = "0.21"
metrics-exporter-prometheus = "0.13"
```

---

## Step 5: Update Consent Gateway

**File**: `ops/home/.env`

**Add**:
```bash
# Rust L1 Configuration
RUST_L1_INDEXER=http://localhost:8089
RUST_L1_ADMIN_TOKEN=<generate-strong-random>

# Deprecated (remove after migration)
# SOVEREIGN_RPC=...
# MINTER_PK=...
```

**Python Code**: Update consent-gateway to use `rust_l1_gateway.py`

---

## Step 6: Test Execution

**Smoke Test**:
```powershell
# 1. Verify current state
curl http://localhost:8089/assets
curl http://localhost:8089/balances?account=acct:treasury:MAIN
curl http://localhost:8089/audit

# 2. Rebuild indexer (after removing dev endpoint)
cd uny-korn-l1
cargo build --release -p rust-l1-indexer

# 3. Stop old process
Get-Process | Where-Object { $_.Name -eq "rust-l1-indexer" } | Stop-Process -Force

# 4. Start new process
Start-Process -NoNewWindow -FilePath "./target/release/rust-l1-indexer.exe"
Start-Sleep -Seconds 2

# 5. Verify dev endpoint removed
try {
    curl http://localhost:8089/internal/credit
    Write-Host "❌ FAIL: Dev endpoint still accessible" -ForegroundColor Red
} catch {
    Write-Host "✅ PASS: Dev endpoint removed" -ForegroundColor Green
}

# 6. Verify production endpoints working
curl http://localhost:8089/health
curl http://localhost:8089/assets
curl http://localhost:8089/audit
```

---

## Step 7: Update Documentation

**Files**:
- [RUST_L1_MIGRATION.md](file://c:\Users\Kevan\web3 true web3 rarity\RUST_L1_MIGRATION.md) - Mark dev endpoint as removed
- [RUST_L1_COMPLETE.md](file://c:\Users\Kevan\web3 true web3 rarity\RUST_L1_COMPLETE.md) - Update status

---

## Timeline

| Step | Time | Risk |
|------|------|------|
| Remove dev endpoint | 5 min | 🟢 Low |
| Add env config | 5 min | 🟢 Low |
| Add health check | 5 min | 🟢 Low |
| Rebuild & test | 10 min | 🟢 Low |
| Update gateway | 20 min | 🟡 Medium |
| Smoke test | 10 min | 🟢 Low |

**Total**: ~1 hour

---

## Rollback Plan

If anything breaks:

```powershell
# Restore old indexer binary
cd uny-korn-l1
git checkout indexer/src/main.rs
cargo build --release -p rust-l1-indexer
Stop-Process -Name "rust-l1-indexer" -Force
Start-Process -NoNewWindow -FilePath "./target/release/rust-l1-indexer.exe"
```

---

## Success Criteria

- [ ] `/internal/credit` returns 404
- [ ] `/health` returns healthy status
- [ ] `/assets`, `/balances`, `/audit` still working
- [ ] Gateway can mint via new path (after wiring)
- [ ] Dashboard shows balances (unchanged)

---

**Ready to execute?** Let me know and I'll make the code changes.
