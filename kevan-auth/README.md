# kevan.x Authentication System

**Replace ALL logins with cryptographic signatures.** No passwords. No accounts. Pure sovereignty.

## What This Does

Proves you control `kevan.x` through challenge/response:

1. **Request challenge** → server generates random nonce
2. **Sign challenge** → prove control with private key
3. **Verify signature** → server issues session
4. **Use session** → access protected resources

This replaces:
- GitHub login
- Google login
- Email/password
- SMS 2FA
- Authenticator apps
- Password managers

## Architecture

```
kevan-auth/
├── src/
│   ├── lib.rs         # Core AuthSystem
│   ├── challenge.rs   # Challenge generation/storage
│   ├── session.rs     # Session management
│   ├── verifier.rs    # Signature verification
│   └── main.rs        # Demo CLI
├── Cargo.toml
└── kevan-auth.db      # SQLite (challenges + sessions)
```

## Data Model (Minimal)

### `challenges` table
```sql
nonce TEXT PRIMARY KEY
namespace TEXT NOT NULL
issued_at TEXT NOT NULL
expires_at TEXT NOT NULL  -- 5 minutes
```

### `sessions` table
```sql
session_id TEXT PRIMARY KEY
namespace TEXT NOT NULL
issued_at TEXT NOT NULL
expires_at TEXT NOT NULL  -- 24 hours
```

**No users table. No passwords table. No MFA table.**

Identity truth comes from certificates, not database.

## API

### Library Usage

```rust
use kevan_auth::AuthSystem;

// Initialize
let auth = AuthSystem::new("C:\\Users\\Kevan\\genesis", Path::new("auth.db"))?;

// Step 1: Generate challenge
let challenge = auth.create_challenge("kevan.x")?;
// Returns: { nonce: "abc123...", message: "kevan.x challenges you to sign: abc123..." }

// Step 2: Client signs challenge.message() with private key
// (happens client-side)

// Step 3: Verify and login
let session = auth.verify_and_login("kevan.x", &challenge.nonce, &signature)?;
// Returns: { session_id: "xyz789...", namespace: "kevan.x", expires_at: ... }

// Step 4: Verify session
let session = auth.verify_session(&session_id)?;
// Use session.namespace for authorization

// Logout
auth.logout(&session_id)?;
```

## Usage

```powershell
# Build
cd kevan-auth
cargo build --release

# Run demo
$env:CERT_DIR="C:\Users\Kevan\genesis"
cargo run --release

# Run tests
cargo test
```

## Login Flow (What You'll Actually See)

### User clicks: "Login with kevan.x"

1. **Website**: `POST /auth/challenge { "namespace": "kevan.x" }`
2. **Server**: Returns `{ "nonce": "abc123...", "message": "kevan.x challenges..." }`
3. **Browser Extension**: Signs message with kevan.x private key
4. **Browser**: `POST /auth/verify { "namespace": "kevan.x", "signature": "def456..." }`
5. **Server**: Verifies signature, returns `{ "session_id": "xyz789..." }`
6. **Browser**: Stores session, user logged in

**Zero passwords. Zero account creation. Zero recovery flows.**

## Status

✅ **Core components implemented:**
- Challenge generation (5-minute expiry)
- Session management (24-hour expiry)
- SQLite storage
- Signature verification API
- Tests passing

⚠️ **Pending:**
- Extract signing keys from certificates (certificate format needs explicit `signing_key` field)
- HTTP API layer (optional - library works offline)
- Browser extension for signing

## Next Steps

1. **Add signing key to certificate format**
   - Update snp-cli to include `signing_key` in generated certificates
   - Re-generate certificates with full key material

2. **Complete signature verification**
   - Extract public key from certificate
   - Verify Ed25519 signature against challenge message

3. **Build browser extension**
   - Store private keys securely
   - Sign challenges on request
   - No key export required

4. **HTTP API (optional)**
   - POST /auth/challenge
   - POST /auth/verify
   - GET /auth/session (verify)
   - DELETE /auth/session (logout)

## Why This Works

**Traditional login:**
```
Username/password → database lookup → create session
Problem: Database is source of truth (can be hacked)
```

**kevan.x login:**
```
Signature → certificate verification → create session
Truth: Cryptographic proof (can't be faked)
```

**Key insight:**  
Your identity is a mathematical fact (certificate), not a database entry.

If you lose your keys, sovereignty is lost — **as it should be**.

## Testing

```powershell
# Test challenge generation
cargo test test_challenge

# Test session management  
cargo test test_session

# Test full flow
cargo test

# Run with tracing
RUST_LOG=kevan_auth=debug cargo run
```

## Integration

```rust
// In your web service:
use kevan_auth::AuthSystem;

let auth = AuthSystem::new(cert_dir, db_path)?;

// POST /auth/challenge
let challenge = auth.create_challenge(request.namespace)?;
respond_json(challenge)

// POST /auth/verify  
let session = auth.verify_and_login(
    request.namespace,
    request.nonce,
    request.signature
)?;
respond_json(session)

// Protected endpoint
let session = auth.verify_session(bearer_token)?;
// Use session.namespace for authorization
```

## Production Deployment

**Library first, daemon never:**
- Link kevan-auth into your service
- No separate auth server needed
- No network dependency for verification
- Offline-capable by default

**When you do expose HTTP:**
- Read-only challenge generation
- POST-only verification
- No session storage in-memory (SQLite only)
- Stateless (can run multiple instances)

## This Unlocks Everything

Once Phase 2 exists:
- Payments can require signatures (kevan.finance.x)
- File access can be gated (kevan.vault.x)
- Delegations become cryptographic (kevan.auth.x)
- Phone auth works (kevan.tel.x)
- AI actions require proof

**Identity is the foundation. Everything else builds on this.**
