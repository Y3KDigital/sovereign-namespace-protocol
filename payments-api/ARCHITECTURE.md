# Genesis Payment v1 Architecture

## Non-Negotiables (Satisfied)
1. ✅ Funds go directly to your wallets (no custody)
2. ✅ Keys generated client-side (no server access)
3. ✅ Confirmation is objective (blockchain truth)
4. ✅ Everything is open-source and self-hosted

## Design: Intent-Based Payments (Pattern 1)

### Flow
1. User chooses root (e.g., 777)
2. Server creates payment intent → generates payment_id
3. UI shows: wallet addresses + required amount per asset
4. User sends funds to YOUR wallet
5. Monitor service detects transaction
6. After confirmations → payment marked "confirmed"
7. Mint gate unlocks → user generates keys client-side

### Components (Only 3)

#### 1. Payment Monitor Service
- Node.js service
- ethers.js for ETH/USDC/USDT
- Public Bitcoin API (Blockchain.info or Blockchair)
- Polls every 30 seconds
- Confirmation thresholds:
  - BTC: 6 confirmations
  - ETH: 12 confirmations
  - USDC/USDT: 12 confirmations

#### 2. Payment Database (SQLite)
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,           -- UUID
  root INTEGER NOT NULL,         -- 100-999
  asset TEXT NOT NULL,           -- 'BTC', 'ETH', 'USDC', 'USDT'
  expected_usd DECIMAL NOT NULL, -- 29.00
  tx_hash TEXT,                  -- populated when detected
  confirmations INTEGER DEFAULT 0,
  status TEXT NOT NULL,          -- 'pending', 'confirmed', 'complete'
  created_at INTEGER NOT NULL,   -- Unix timestamp
  confirmed_at INTEGER,
  certificate_ipfs_hash TEXT
);

CREATE INDEX idx_status ON payments(status);
CREATE INDEX idx_root ON payments(root);
CREATE INDEX idx_tx_hash ON payments(tx_hash);
```

#### 3. Mint Gate (Frontend Check)
- `/api/payment/status?payment_id=xyz` → returns { status: 'confirmed' | 'pending' }
- `/mint/success?payment_id=xyz` polls every 5 seconds
- When confirmed → unlock key generation UI

### Matching Logic (No Memos Required)

**For BTC:**
- Check transactions to: `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`
- Amount matches $29 ± 2% (price oracle: CoinGecko)
- Within time window (payment created in last 24 hours)
- Confirmations >= 6

**For ETH/USDC/USDT:**
- Check transactions to: `0x71C7656EC7ab88b098defB751B7401B5f6d8976F`
- Amount matches $29 ± 2% (ETH) or exactly 29.00 (stablecoins ± 0.50)
- Within time window
- Confirmations >= 12

**Collision Resolution:**
- Rare (fixed price + time window)
- If multiple payments match same tx: oldest pending intent wins
- Others remain pending (manual review or refund)

### Security Guarantees

✅ **Server verifies blockchain truth** (frontend cannot fake)
✅ **No private keys on server** (keys generated client-side)
✅ **No reversible payments** (crypto only)
✅ **No custodial risk** (payments go directly to YOUR wallets)

### What This Is NOT

❌ No user accounts/emails required
❌ No memos/references required
❌ No webhooks from third parties
❌ No payment processors (Stripe/BTCPay/etc.)
❌ No hot wallets or custody

## Deployment

**Payment Monitor Service:**
- Runs as Node.js daemon
- Can run on same server as web app
- Or separate VPS for isolation
- Logs to file + console
- Restarts automatically on failure

**Database:**
- SQLite file (simple, sufficient for Genesis scale)
- Backed up regularly
- Can migrate to Postgres later if needed

**API Endpoints:**
- `POST /api/payment/create` - Create payment intent
- `GET /api/payment/status/:id` - Check payment status
- `POST /api/payment/confirm` - Internal: Mark confirmed (called by monitor)

## What to Add Later (If Needed)

- BTCPay Server integration (if BTC volume justifies)
- Deterministic sub-addresses per payment (if collision becomes issue)
- Webhook notifications (if needed)
- Admin dashboard for manual review

## Why This Works

- **Boring**: Standard blockchain polling, no clever tricks
- **Verifiable**: Every decision based on chain truth
- **Unbreakable**: No moving parts that can lie or fail silently
- **Sovereign**: You control everything, no dependencies on third parties

This is exactly what you want at the foundation.
