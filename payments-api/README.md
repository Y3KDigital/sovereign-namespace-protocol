# Genesis Payment Monitor v1

Sovereign payment monitoring for Y3K Genesis Roots.

## What This Does

Monitors YOUR wallet addresses for incoming payments:
- **BTC**: `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`
- **ETH/USDC/USDT**: `0x71C7656EC7ab88b098defB751B7401B5f6d8976F`

No custody. No intermediaries. Blockchain truth only.

## Architecture

**Direct wallet payments. Pattern 1 (Simplest).**

```
┌──────────────┐
│     User     │ 1. Choose root (777)
└──────┬───────┘
       │ 2. Create payment intent (UUID)
       ▼
┌──────────────────────┐
│   payments-api       │ 3. Store: root, asset, $29 USD
│   (Node.js)          │    Status: pending
└──────────────────────┘
       │ 4. Show wallet addresses
       ▼
┌──────────────┐
│     User     │ 5. Send BTC/ETH/USDC/USDT
└──────┬───────┘       to YOUR wallet (direct)
       │
       ▼
┌──────────────┐
│  Blockchain  │ 6. Transaction broadcast
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Payment Monitor     │ 7. Poll every 30s
│  (blockchain APIs)   │ 8. Match: amount + time
└──────┬───────────────┘ 9. Check confirmations
       │                  10. Status: confirmed
       ▼
┌──────────────┐
│  /mint/success│ 11. Generate Ed25519 keys
│  (client-side)│ 12. Create certificate
└──────┬───────┘ 13. Publish to IPFS
       │
       ▼
┌──────────────┐
│     User     │ 14. Download paper wallet
└──────────────┘
```

## Features

- ✅ Direct wallet payments (no custody)
- ✅ BTC monitoring via Blockchain.info API
- ✅ ETH/USDC/USDT monitoring via ethers.js
- ✅ Price oracle integration (CoinGecko)
- ✅ Confirmation tracking (6 BTC, 12 ETH)
- ✅ SQLite database
- ✅ Payment matching (amount ±2%, time window)
- ✅ Open source, self-hosted
- ❌ No Stripe, no custodians, no intermediaries

## Setup

### 1. Install Dependencies

```powershell
cd payments-api
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and verify wallet addresses:

```env
# Wallet Addresses (Payments go HERE - you control these)
WALLET_BTC=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
WALLET_ETH=0x71C7656EC7ab88b098defB751B7401B5f6d8976F

# RPC Endpoints (Use public APIs or your own nodes)
ETH_RPC_URL=https://eth.llamarpc.com

# Price Oracle API (for BTC/ETH to USD conversion)
PRICE_API=https://api.coingecko.com/api/v3/simple/price

# Confirmation Thresholds
BTC_CONFIRMATIONS=6
ETH_CONFIRMATIONS=12

# Payment Configuration
EXPECTED_USD=29.00
PRICE_TOLERANCE=0.02  # ±2% for BTC/ETH
POLL_INTERVAL=30      # seconds
PAYMENT_WINDOW_HOURS=24

# Database
DB_PATH=./genesis-payments.db

# Logging
LOG_LEVEL=info  # debug, info, warn, error
```

### 3. Initialize Database

```powershell
npm run init-db
```

Creates SQLite database with payment tracking table.

```powershell
cargo install sqlx-cli --no-default-features --features sqlite
sqlx migrate run
```

### 4. Start Server

```powershell
cargo run
```

Server runs on `http://127.0.0.1:8081`

### (Optional) Expose publicly via Cloudflare Tunnel

If your DNS is already routed to the `payments-api` tunnel, you can publish your local server at:

- `https://api.y3kmarkets.com`

This repo includes an example tunnel config (`payments-api/cloudflared.example.yml`) and a helper script (`payments-api/run-tunnel.ps1`) so you don't accidentally start the wrong tunnel from your user profile config.

Copy the example to `payments-api/cloudflared.yml` and update the `credentials-file` path for your machine.

1. Start the API (local): `run-payments-api.cmd`
2. Start the tunnel: `run-tunnel.ps1`

Then verify:

- `GET https://api.y3kmarkets.com/api/health`

### Verify the public API surface

For a quick auditor-friendly check (raw status, headers, and JSON shape), run:

```powershell
./verify-public-api.ps1 -BaseUrl https://api.y3kmarkets.com -Origin https://y3kmarkets.com
```

## API Endpoints

### Create Payment Intent

```http
POST /api/payments/create-intent
Content-Type: application/json

{
  "customer_email": "buyer@example.com",
  "namespace": "1.x",
  "rarity_tier": "rare",
  "partner_id": "partner_abc",
  "affiliate_id": "affiliate_xyz"
}
```

**Response:**
```json
{
  "payment_intent_id": "pi_...",
  "client_secret": "pi_..._secret_...",
  "amount_cents": 35000,
  "currency": "usd",
  "namespace_reserved": "1.x"
}

### Check Namespace Availability

```http
GET /api/namespaces/availability?namespace=1.x
```

**Response:**
```json
{
  "namespace": "1.x",
  "available": true
}
```
```

### Stripe Webhook

```http
POST /api/payments/webhook
Stripe-Signature: t=...,v1=...

{
  "type": "payment_intent.succeeded",
  "data": { ... }
}
```

**Response:**
```json
{
  "received": true
}
```

### Get Order

```http
GET /api/orders/{order_id}
```

**Response:**
```json
{
  "order_id": "uuid",
  "status": "delivered",
  "namespace": "abc123.rare.x",
  "certificate_ipfs_cid": "Qm...",
  "download_url": "/api/downloads/token",
  "amount_paid_cents": 35000,
  "created_at": "2026-01-03T..."
}
```

### Download Certificate

```http
GET /api/downloads/{token}
```

**Response:**
```json
{
  "namespace": "abc123.rare.x",
  "ipfs_cid": "Qm...",
  "sha3_hash": "...",
  "issued_at": "2026-01-03T...",
  "customer_email": "buyer@example.com"
}

## Affiliate / Broker Onboarding

This service includes a lightweight affiliate/broker program:

- **Portal login link** (sendable): `https://y3kmarkets.com/partner/?t=<portal_token>`
- **Referral link** (lead capture): `https://y3kmarkets.com/invite/?r=<referral_code>`

### Create an affiliate (admin)

`POST /api/affiliates`

- Requires `AFFILIATE_ADMIN_TOKEN` to be set on the server.
- Auth header can be either:
  - `Authorization: Bearer <token>`
  - `X-Admin-Token: <token>`

Request body:

```json
{
  "display_name": "Broker Name",
  "email": "broker@example.com",
  "commission_bps": 1000,
  "bonus_cents": 0
}
```

Response includes `portal_url` + `referral_url`:

```json
{
  "affiliate": { "id": "...", "portal_token": "...", "referral_code": "..." },
  "portal_url": "https://y3kmarkets.com/partner/?t=...",
  "referral_url": "https://y3kmarkets.com/invite/?r=..."
}
```

### Portal read model

`GET /api/affiliates/portal/{portal_token}` returns the affiliate profile + stats (leads, conversions, earned/paid/voided).

### Lead capture

`POST /api/affiliates/leads` records a lead for a given `referral_code`.

### Bulk-create affiliates (PowerShell)

For quickly onboarding ~15 brokers, use `create-affiliates.ps1` with a CSV:

- `create-affiliates.ps1` (calls `POST /api/affiliates` and writes `affiliates.created.csv`)
- `affiliates.sample.csv` (template)

The script expects `AFFILIATE_ADMIN_TOKEN` in your environment, or pass `-AdminToken` explicitly.
```

## Pricing (Base Prices)

| Rarity Tier | Base Price |
|-------------|------------|
| Mythic      | $7,500     |
| Legendary   | $3,500     |
| Epic        | $1,250     |
| Rare        | $350       |
| Uncommon    | $125       |
| Common      | $35        |

Partners can add 20-40% markup.

## Database Schema

### `payment_intents`
- `id` (UUID, primary key)
- `stripe_payment_intent_id` (unique)
- `amount_cents` (integer)
- `currency` (text)
- `customer_email` (text)
- `namespace_reserved` (text, nullable)
- `rarity_tier` (text)
- `status` (enum: created, succeeded, delivered, etc.)
- `created_at` (timestamp)
- `settled_at` (timestamp, nullable)
- `partner_id` (text, nullable)
- `affiliate_id` (text, nullable)

### `issuances`
- `id` (UUID, primary key)
- `payment_intent_id` (foreign key)
- `namespace` (text, unique)
- `certificate_ipfs_cid` (text)
- `certificate_hash_sha3` (text)
- `customer_email` (text)
- `issued_at` (timestamp)
- `download_token` (text, unique)
- `download_expires_at` (timestamp)

## Testing

### Stripe Test Mode

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Webhook Testing (Local)

```powershell
# Install Stripe CLI
scoop install stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:8081/api/payments/webhook

# Trigger test webhook
stripe trigger payment_intent.succeeded
```

## Integration Points

### 1. namespace-core (TODO)
Replace placeholder namespace generation:
```rust
use namespace_core::NamespaceGenerator;

let namespace = NamespaceGenerator::generate_with_rarity(
    rarity_tier,
    entropy_seed
)?;
```

### 2. certificate-gen (TODO)
Replace placeholder certificate generation:
```rust
use certificate_gen::CertificateBuilder;

let certificate = CertificateBuilder::new()
    .namespace(namespace)
    .sign_with_authority_key(authority_key)?
    .build()?;
```

### 3. ipfs-integration (TODO)
Replace placeholder IPFS upload:
```rust
use ipfs_integration::IpfsClient;

let cid = IpfsClient::upload(&certificate_json).await?;
```

## Security

### Webhook Verification
- ✅ HMAC-SHA256 signature validation
- ✅ Timestamp checking (replay attack prevention)
- ✅ Idempotency (duplicate event handling)

### Download Tokens
- ✅ UUID v4 (cryptographically random)
- ✅ 30-day expiration
- ✅ One-time use (can be extended)

### Database
- ✅ SQLite for local dev
- 🔄 PostgreSQL for production (recommended)
- ✅ Foreign key constraints
- ✅ Unique constraints on critical fields

## Deployment

### Production Checklist
- [ ] Replace SQLite with PostgreSQL
- [ ] Set up Stripe production keys
- [ ] Configure webhook endpoint URL
- [ ] Enable HTTPS (Cloudflare proxy)
- [ ] Set up monitoring (error logging)
- [ ] Configure backup strategy
- [ ] Test certificate delivery email
- [ ] Load test (concurrent payments)

### Environment Variables (Production)
```env
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
DATABASE_URL=postgresql://user:pass@host/db
BIND_ADDRESS=0.0.0.0:8081
RUST_LOG=warn
```

## Next Steps

1. **Complete Stripe integration testing**
   - Test payment flow end-to-end
   - Verify webhook handling
   - Test idempotency

2. **Integrate namespace-core**
   - Connect to namespace generator
   - Use real entropy sources
   - Validate rarity tiers

3. **Integrate certificate-gen**
   - Sign certificates with authority key
   - Validate signature verification

4. **Integrate ipfs-integration**
   - Upload certificates to IPFS
   - Return real CIDs

5. **Add email notifications**
   - Send certificate delivery email
   - Include download link
   - Add PDF receipt

## License

Part of Y3K Sovereign Namespace Protocol.
