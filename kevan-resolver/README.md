# kevan.x Certificate Resolver

**Foundation of the sovereignty system.** Resolves any sovereign namespace to its certificate, endpoints, and public keys.

## What This Does

Resolves `kevan.x` → certificate + endpoints + verification

```bash
GET /resolve/kevan.x

Response:
{
  "namespace": "kevan.x",
  "certificate": {
    "id": "0x8fbf...",
    "label": "kevan.x",
    "sovereignty": "Immutable",
    "genesis_hash": "0x6787...",
    "depth": 0
  },
  "endpoints": {
    "identity": "https://auth.kevan.x",
    "finance": "https://pay.kevan.x",
    "tel": "sip:kevan-x@tel.kevan.x",
    "vault": "ipfs://kevan-vault/kevan.x",
    "registry": "https://registry.kevan.x"
  },
  "public_keys": {
    "identity": "0x8fbf...",
    "finance": "0x8fbf...",
    "signing": "0x8fbf..."
  },
  "verified": true
}
```

## Setup

```powershell
# Install Rust (if not already installed)
winget install Rustlang.Rustup

# Build the resolver
cd kevan-resolver
cargo build --release

# Set up environment
copy .env.example .env
# Edit .env to set CERT_DIR to your genesis directory

# Run the resolver
cargo run --release
```

## Usage

```powershell
# Start the server
cargo run --release

# Test resolution
curl http://127.0.0.1:3000/resolve/kevan.x
curl http://127.0.0.1:3000/resolve/kevan.finance.x
curl http://127.0.0.1:3000/resolve/law.l

# List all certificates
curl http://127.0.0.1:3000/certificates

# Health check
curl http://127.0.0.1:3000/health
```

## API Endpoints

### `GET /`
Service information and available endpoints

### `GET /resolve/{namespace}`
Resolve a namespace to its certificate and endpoints

**Path Parameters:**
- `namespace`: The namespace to resolve (e.g., `kevan.x`, `law.l`)

**Response:**
- `200 OK`: Namespace resolved successfully
- `404 Not Found`: Namespace does not exist

### `GET /certificates`
List all loaded certificates

### `GET /health`
Health check endpoint

## Architecture

```
kevan-resolver/
├── src/
│   ├── main.rs           # HTTP server (Axum)
│   ├── certificate.rs    # Certificate loading/storage
│   └── resolver.rs       # Namespace resolution logic
├── Cargo.toml            # Dependencies
└── .env                  # Configuration

Loads certificates from:
C:\Users\Kevan\genesis\CROWN_CERTIFICATES\      (11 Crown Letters)
C:\Users\Kevan\genesis\SOVEREIGN_SUBNAMESPACES\ (27 sub-namespaces)
```

## What This Enables

**Everything else builds on this:**

1. **Identity System** (`kevan.x`) - Resolve to auth endpoints
2. **Payment Hub** (`kevan.finance.x`) - Resolve to payment methods
3. **Phone System** (`kevan.tel.x`) - Resolve to SIP endpoint
4. **Storage** (`kevan.vault.x`) - Resolve to IPFS/Arweave
5. **Access Control** (`kevan.auth.x`) - Resolve to delegation manager

**Any app can:**
```javascript
// Resolve a namespace
const response = await fetch('https://resolve.kevan.x/kevan.finance.x');
const { certificate, endpoints, public_keys } = await response.json();

// Now you have:
// - Cryptographic proof of identity (certificate)
// - Where to send payments (endpoints.finance)
// - How to verify signatures (public_keys.signing)
```

## Next Steps

1. ✅ **Phase 1 Complete** - Certificate resolver operational
2. **Phase 2** - Build identity layer (auth.kevan.x)
3. **Phase 3** - Build payment hub (pay.kevan.x)
4. **Phase 4** - Integrate Telnyx (tel.kevan.x)
5. **Phase 5** - Build storage layer (kevan.vault.x)
6. **Phase 6** - Build access control (kevan.auth.x)

## Deployment

**Local Development:**
```powershell
cargo run --release
# Available at http://127.0.0.1:3000
```

**Production (Cloudflare Workers):**
```powershell
# Install wrangler
npm install -g wrangler

# Deploy
wrangler deploy
# Available at https://resolve.kevan.x
```

## Testing

```powershell
# Run tests
cargo test

# Test all namespaces
curl http://127.0.0.1:3000/certificates | jq '.namespaces[]' | while read ns; do
    echo "Testing: $ns"
    curl http://127.0.0.1:3000/resolve/$ns
done
```

## Status

✅ **Operational** - Resolves 38 namespaces (11 Crowns + 27 sub-namespaces)

**Verified:**
- Loads certificates from genesis directories
- Verifies genesis hash (0x6787...96fc)
- Returns certificates with endpoints
- CORS enabled for web integration
- Ready for integration with identity/payment layers
