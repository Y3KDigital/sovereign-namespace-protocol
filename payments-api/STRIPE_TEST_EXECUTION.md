# STRIPE TEST EXECUTION — REFERENCE PROTOCOL

**Status**: READY TO EXECUTE  
**Date**: 2026-01-03  
**Objective**: Prove payment spine WITHOUT issuance  

---

## PRE-FLIGHT CHECKLIST

Before starting tests:

- [ ] Stripe test account created (get `sk_test_...` key)
- [ ] `.env` configured with Stripe test keys (placeholders like `sk_test_your_stripe_key_here` are treated as **NOT configured**)
- [ ] Database migrations run (`sqlx migrate run`)
- [ ] Stripe CLI installed (`stripe version` works)
- [ ] No production keys in environment
- [ ] `GET /api/health` shows `stripe_configured: true` before running payment tests

> PowerShell note: `curl` is an alias for `Invoke-WebRequest`.
> For copy/paste reliability below, prefer **`curl.exe`** (explicit) or `Invoke-RestMethod`.

---

## TEST EXECUTION SEQUENCE

### 1. START LOCAL STACK

**Terminal 1:**

```powershell
cd c:\Users\Kevan\web3 true web3 rarity\payments-api
cargo build --release
cargo run --release
```

**Expected Output:**
```
✔ Database connected (sqlite://payments.db)
✔ Inventory tables initialized
✔ Server listening on 127.0.0.1:8081
```

**Validation:**
```powershell
curl.exe http://127.0.0.1:8081/api/inventory/status
```

**Expected Response:**
```json
[
  {"tier":"mythic","genesis_supply":5,"presell_cap":3,"presold_count":0,"remaining":3,"availability":"available"},
  {"tier":"legendary","genesis_supply":25,"presell_cap":15,"presold_count":0,"remaining":15,"availability":"available"},
  {"tier":"epic","genesis_supply":100,"presell_cap":60,"presold_count":0,"remaining":60,"availability":"available"},
  {"tier":"rare","genesis_supply":300,"presell_cap":180,"presold_count":0,"remaining":180,"availability":"available"},
  {"tier":"uncommon","genesis_supply":1000,"presell_cap":500,"presold_count":0,"remaining":500,"availability":"available"},
  {"tier":"common","genesis_supply":10000,"presell_cap":10000,"presold_count":0,"remaining":10000,"availability":"available"}
]
```

✅ **PASS**: All tiers show `presold_count=0`, availability correct  
❌ **FAIL**: Stop — database not initialized

---

### 2. START STRIPE WEBHOOK FORWARDING

**Terminal 2:**

```powershell
stripe login
stripe listen --forward-to http://127.0.0.1:8081/api/payments/webhook
```

**Expected Output:**
```
> Ready! Your webhook signing secret is whsec_...
```

**CRITICAL**: Copy `whsec_...` value → Update `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Restart server** (Terminal 1: Ctrl+C, then `cargo run --release`)

✅ **PASS**: Webhook secret configured  
❌ **FAIL**: Signature verification will fail

---

### 3. TEST 1: CREATE ORDER (RARE)

**Terminal 3:**

```powershell
curl.exe -X POST http://127.0.0.1:8081/api/payments/create-intent `
  -H "Content-Type: application/json" `
  -d '{
    "customer_email": "buyer1@test.com",
    "rarity_tier": "rare",
    "partner_id": null,
    "affiliate_id": null
  }'
```

**Expected Response:**
```json
{
  "client_secret": "pi_...client_secret_...",
  "payment_intent_id": "pi_...",
  "amount_cents": 35000
}
```

**Validation Queries:**

```powershell
# Check inventory decreased
curl.exe http://127.0.0.1:8081/api/inventory/status

# Expected: rare presold_count=1, remaining=179

# Check reservation created (SQL)
sqlite3 payments.db "SELECT * FROM inventory_reservations WHERE status='RESERVED';"
```

✅ **PASS**: Inventory decremented, reservation created, Stripe PaymentIntent returned  
❌ **FAIL**: Stop — reservation logic broken

---

### 4. TEST 2: SIMULATE PAYMENT SUCCESS

**Terminal 3:**

```powershell
stripe trigger payment_intent.succeeded
```

**Expected Server Logs (Terminal 1):**
```
[INFO] Webhook received: payment_intent.succeeded
[INFO] Signature verified: ✓
[INFO] Payment intent pi_... succeeded
[INFO] Order status updated: PAID_AWAITING_GENESIS
[INFO] Reservation retained (no certificate issuance)
```

**CRITICAL VALIDATION**: Check that NO certificate was issued:

```powershell
sqlite3 payments.db "SELECT COUNT(*) FROM issuances;"
```

**Expected**: `0` (zero issuances)

✅ **PASS**: Webhook processed, status=PAID_AWAITING_GENESIS, NO issuance  
❌ **FAIL**: If issuance occurred → PROTOCOL VIOLATION

---

### 5. TEST 3: PAYMENT IDEMPOTENCY

**Terminal 3:**

```powershell
# Replay the same webhook
stripe trigger payment_intent.succeeded
```

**Expected Server Logs:**
```
[INFO] Webhook received: payment_intent.succeeded (duplicate)
[INFO] Payment intent pi_... already processed
[INFO] Ignoring duplicate webhook
```

**Validation:**

```powershell
# Check inventory did NOT decrement again
curl http://127.0.0.1:8081/api/inventory/status

# Expected: rare presold_count still =1 (not 2)
```

✅ **PASS**: Duplicate webhook ignored, inventory unchanged  
❌ **FAIL**: Inventory double-decremented → CRITICAL BUG

---

### 6. TEST 4: PAYMENT FAILURE RELEASES INVENTORY

**Terminal 3:**

```powershell
# Create another order
curl.exe -X POST http://127.0.0.1:8081/api/payments/create-intent `
  -H "Content-Type: application/json" `
  -d '{
    "customer_email": "buyer2@test.com",
    "rarity_tier": "rare"
  }'

# Trigger payment failure
stripe trigger payment_intent.payment_failed
```

**Expected Server Logs:**
```
[INFO] Webhook received: payment_intent.payment_failed
[INFO] Payment intent pi_... failed
[INFO] Releasing inventory reservation
[INFO] Order status updated: FAILED
```

**Validation:**

```powershell
curl.exe http://127.0.0.1:8081/api/inventory/status

# Expected: rare presold_count back to 1 (released)
```

✅ **PASS**: Failed payment released inventory  
❌ **FAIL**: Inventory not released → LEAKAGE BUG

---

### 7. TEST 5: TIER EXHAUSTION (MYTHIC)

**Terminal 3:**

```powershell
# Create 3 Mythic orders (cap = 3)
curl.exe -X POST http://127.0.0.1:8081/api/payments/create-intent `
  -H "Content-Type: application/json" `
  -d '{"customer_email":"m1@test.com","rarity_tier":"mythic"}'

curl.exe -X POST http://127.0.0.1:8081/api/payments/create-intent `
  -H "Content-Type: application/json" `
  -d '{"customer_email":"m2@test.com","rarity_tier":"mythic"}'

curl -X POST http://127.0.0.1:8081/api/payments/create-intent `
  -H "Content-Type: application/json" `
  -d '{"customer_email":"m3@test.com","rarity_tier":"mythic"}'

# 4th order should be REJECTED
curl -X POST http://127.0.0.1:8081/api/payments/create-intent `
  -H "Content-Type: application/json" `
  -d '{"customer_email":"m4@test.com","rarity_tier":"mythic"}'
```

**Expected Response (4th order):**
```json
{
  "error": "InventoryExhausted",
  "tier": "mythic"
}
```

**Validation:**

```powershell
curl http://127.0.0.1:8081/api/inventory/status

# Expected: mythic presold_count=3, remaining=0, availability="sold_out"
```

✅ **PASS**: 4th order rejected, tier marked sold_out  
❌ **FAIL**: Over-allocation occurred → CRITICAL FAILURE

---

### 8. TEST 6: PARTNER ALLOCATION (IF IMPLEMENTED)

**Setup Partner Inventory:**

```sql
sqlite3 payments.db <<EOF
INSERT INTO partner_inventory (partner_id, tier, allocation, sold)
VALUES ('partner_alpha', 'legendary', 5, 0);
EOF
```

**Test Partner Order:**

```powershell
curl -X POST http://127.0.0.1:8081/api/payments/create-intent `
  -H "Content-Type: application/json" `
  -d '{
    "customer_email": "partner_buyer@test.com",
    "rarity_tier": "legendary",
    "partner_id": "partner_alpha"
  }'
```

**Expected**: Success (partner has 5 allocation)

**Exhaust Partner Allocation:**

```powershell
# Create 5 more orders for same partner
# 6th should be rejected
```

✅ **PASS**: Partner allocation enforced independently  
❌ **FAIL**: Partner drained global pool → LOGIC ERROR

---

### 9. TEST 7: SECRETS HYGIENE

**Check all logs and responses for:**

- ❌ Private keys
- ❌ Webhook secrets
- ❌ Unencrypted payment details
- ❌ Full credit card numbers
- ❌ Database connection strings

**Scan:**

```powershell
Get-Content payments.log | Select-String "sk_live|whsec|password|secret"
```

✅ **PASS**: No secrets in logs  
❌ **FAIL**: Secrets exposed → SECURITY VIOLATION

---

## SUCCESS CRITERIA (ALL MUST PASS)

| Test | Pass | Fail | Blocker? |
|------|------|------|----------|
| Inventory loads correctly | ⬜ | ⬜ | YES |
| Webhook signature verified | ⬜ | ⬜ | YES |
| Order creates reservation | ⬜ | ⬜ | YES |
| Payment success → PAID_AWAITING_GENESIS | ⬜ | ⬜ | YES |
| NO certificate issued pre-genesis | ⬜ | ⬜ | **CRITICAL** |
| Duplicate webhooks ignored | ⬜ | ⬜ | YES |
| Payment failure releases inventory | ⬜ | ⬜ | YES |
| Tier exhaustion rejected | ⬜ | ⬜ | YES |
| Partner allocation enforced | ⬜ | ⬜ | NO (if partners not used) |
| No secrets in logs | ⬜ | ⬜ | YES |

---

## COMPLETION STATEMENT

After running ALL tests, report:

**✅ "Stripe tests passed — enable live payments"**

OR

**❌ "Stripe test failed at: [test name + reason]"**

---

## APPENDIX: TROUBLESHOOTING

### Issue: "Webhook signature verification failed"

**Fix:**
1. Check `.env` has correct `STRIPE_WEBHOOK_SECRET=whsec_...`
2. Restart server after updating `.env`
3. Verify Stripe CLI is forwarding to correct port

### Issue: "Inventory not decrementing"

**Debug:**
```sql
sqlite3 payments.db "SELECT * FROM inventory_tiers;"
sqlite3 payments.db "SELECT * FROM inventory_reservations;"
```

Check transaction commits.

### Issue: "Certificate issued pre-genesis"

**PROTOCOL VIOLATION**:
- Check `issuance.rs` — `issue_certificate` should NOT be called before genesis
- Webhook handler must update status to `PAID_AWAITING_GENESIS`, NOT trigger issuance

### Issue: "Database locked"

**Fix:**
```powershell
# Stop server, remove lock
Remove-Item payments.db-shm, payments.db-wal -ErrorAction SilentlyContinue
cargo run --release
```

---

**END OF TEST PROTOCOL**
