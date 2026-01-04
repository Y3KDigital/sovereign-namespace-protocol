# Payments API

Rust-based payment processing service for Y3K namespace purchases.

## Architecture

**Stripe as convenience layer, not authority.**

```
┌──────────────┐
│   Customer   │
└──────┬───────┘
       │ 1. Create payment
       ▼
┌──────────────────────┐
│  payments-api (Rust) │
└──────┬───────────────┘
       │ 2. Create PaymentIntent
       ▼
┌──────────────┐
│    Stripe    │
└──────┬───────┘
       │ 3. Webhook: payment_intent.succeeded
       ▼
┌──────────────────────┐
│  payments-api        │
│  ├─ Verify webhook   │
│  ├─ Issue namespace  │
│  ├─ Generate cert    │
│  └─ Upload to IPFS   │
└──────┬───────────────┘
       │ 4. Deliver certificate
       ▼
┌──────────────┐
│   Customer   │
└──────────────┘
```

## Features

- ✅ Stripe PaymentIntent creation
- ✅ Webhook signature verification
- ✅ Idempotent certificate issuance
- ✅ SQLite database (local dev)
- ✅ Secure download tokens (30-day expiry)
- ✅ Partner/affiliate tracking
- 🔄 Integration with namespace-core (placeholder)
- 🔄 Integration with certificate-gen (placeholder)
- 🔄 Integration with ipfs-integration (placeholder)

## Setup

### 1. Install Dependencies

```powershell
cd payments-api
cargo build
```

### 2. Create `.env` File

```env
STRIPE_API_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
DATABASE_URL=sqlite://payments.db
BIND_ADDRESS=127.0.0.1:8081
RUST_LOG=info
```

### 3. Run Migrations

```powershell
cargo install sqlx-cli --no-default-features --features sqlite
sqlx migrate run
```

### 4. Start Server

```powershell
cargo run
```

Server runs on `http://127.0.0.1:8081`

## API Endpoints

### Create Payment Intent

```http
POST /api/payments/create-intent
Content-Type: application/json

{
  "customer_email": "buyer@example.com",
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
  "namespace_reserved": null
}
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
