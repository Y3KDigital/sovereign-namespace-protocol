# snp-core

**Sovereign Namespace Protocol - Core Library**

Genesis-bound, post-quantum foundational library for the Sovereign Namespace Protocol.

## Purpose

`snp-core` is the **non-negotiable root library** for SNP. All namespace, identity, vault, and certificate operations are:

- **Genesis-bound** - Everything derives from a single genesis hash
- **Deterministic** - All IDs are cryptographically derived, never assigned
- **Post-quantum** - Uses Dilithium5 for signature generation and verification
- **Immutable** - Sovereignty classes enforce ownership semantics
- **Verifiable** - All artifacts can be verified offline without blockchain access

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       GenesisContext                         │
│                   (SHA3-256, 32 bytes)                       │
└────────────────┬─────────────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    Namespaces      Identities
         │               │
    ┌────┴────┐     ┌────┴────┐
    │         │     │         │
 Vaults  Sovereignty  Certificates
```

## Core Components

### 1. Genesis Context

The immutable root of all protocol authority.

```rust
use snp_core::prelude::*;

// From genesis ceremony output
let genesis = GenesisContext::from_hex(
    "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"
).unwrap();

// Validate (prevents accidental use of zero/default values)
genesis.validate().unwrap();
```

**Formula**: Provided by `snp-genesis-cli` ceremony output

### 2. Namespaces

Unique, deterministic identifiers for ownership domains.

```rust
// Derive a namespace
let namespace = Namespace::derive(
    &genesis,
    "my.domain",
    SovereigntyClass::Immutable
).unwrap();

println!("Namespace ID: {}", namespace.id_hex());
```

**Formula**: `SHA3-256("SNP::NAMESPACE" || genesis_hash || label || sovereignty)`

**Properties**:
- Deterministic derivation
- Genesis-bound (cannot exist outside genesis)
- Sovereignty class set at creation (immutable)
- Human-readable label (1-256 chars)

### 3. Sovereignty Classes

Protocol-level state machines that constrain operations.

```rust
pub enum SovereigntyClass {
    Immutable,      // Never changes, never transfers
    Transferable,   // One-way ownership transfer
    Delegable,      // M-of-N multisig authority
    Heritable,      // Succession rules
    Sealed,         // Cryptographically frozen, receive-only
}
```

**Guarantees**:
- Set at namespace creation
- Cannot be changed after creation
- Violations are unrepresentable in code

### 4. Identities

Subjects bound to namespaces with post-quantum keys.

```rust
// Generate Dilithium5 keypair
let (public_key, secret_key) = Dilithium5::keypair(b"my entropy seed").unwrap();

// Derive identity
let identity = Identity::derive(
    &namespace,
    "user@example.com",
    public_key
).unwrap();
```

**Formula**: `SHA3-256("SNP::IDENTITY" || namespace_id || subject_hash || public_key)`

**Properties**:
- Namespace-bound (authority inheritance)
- Post-quantum public key (Dilithium5)
- Subject privacy (hashed in derivation)
- Non-transferable

### 5. Vaults

Deterministic addresses for asset custody.

```rust
let asset_hash = [1u8; 32];   // Hash of asset metadata
let policy_hash = [2u8; 32];  // Hash of access control rules

let vault = VaultDescriptor::derive(
    &namespace,
    asset_hash,
    policy_hash,
    0  // derivation index
).unwrap();

println!("Vault address: {}", vault.id_hex());
```

**Formula**: `SHA3-256("SNP::VAULT" || namespace_id || asset_hash || policy_hash || index)`

**Properties**:
- Predictable addresses (pre-verifiable)
- Multiple vaults per namespace (indexed)
- Policy-enforced access
- No silent redeploys

### 6. Certificates

Signed attestations binding identity to namespace.

```rust
let claims_root = [0u8; 32];  // Hash of certificate claims
let issued_at = 1704067200;   // Unix timestamp
let expires_at = 0;           // 0 = never expires

let cert = Certificate::generate(
    &identity,
    &namespace,
    claims_root,
    issued_at,
    expires_at,
    &secret_key
).unwrap();

// Verify
assert!(cert.verify(&identity).unwrap());

// Check temporal validity
assert!(cert.is_valid_at(1704067200));
```

**Properties**:
- Dilithium5 signatures (post-quantum)
- Offline verifiable (no blockchain required)
- Temporal validity (optional expiration)
- IPFS-ready (content-addressable)

## Cryptography

### Dilithium5 (Post-quantum Signatures)

- **Key generation**: Deterministic from seed (SHA3-256 preprocessed)
- **Signature size**: 4,595 bytes
- **Public key size**: 2,592 bytes
- **Security level**: NIST Level 5 (strongest)

```rust
use snp_core::crypto::{Dilithium5, SignatureScheme};

// Generate keypair
let (pk, sk) = Dilithium5::keypair(b"entropy seed").unwrap();

// Sign
let message = b"data to sign";
let signature = Dilithium5::sign(&sk, message).unwrap();

// Verify
assert!(Dilithium5::verify(&pk, message, &signature));
```

### SHA3-256 (Hashing)

All hash operations use SHA3-256 with domain separation:

```rust
use snp_core::crypto::hash::{sha3_256_domain, DOMAIN_NAMESPACE};

let hash = sha3_256_domain(
    DOMAIN_NAMESPACE,
    &[b"data1", b"data2"]
);
```

**Domain tags**:
- `SNP::NAMESPACE` - Namespace derivation
- `SNP::IDENTITY` - Identity derivation
- `SNP::VAULT` - Vault derivation
- `SNP::CERTIFICATE` - Certificate signing

## Error Handling

```rust
use snp_core::errors::{Result, SnpError};

fn example() -> Result<()> {
    let genesis = GenesisContext::from_hex("invalid")?;  // Returns Err(SnpError::InvalidGenesis)
    Ok(())
}
```

**Error types**:
- `InvalidGenesis` - Malformed genesis hash
- `InvalidSovereigntyTransition` - Illegal sovereignty change
- `InvalidSignature` - Signature verification failed
- `NamespaceMismatch` - Identity/vault not bound to namespace
- `DeterminismViolation` - Non-deterministic operation detected
- `InvalidLabel` - Label validation failed
- `CryptoError` - Cryptographic operation failed

## Testing

All 25 unit tests passed:

```bash
cargo test -p snp-core --release

running 25 tests
test certificate::tests::test_certificate_generation ... ok
test certificate::tests::test_certificate_verification ... ok
test certificate::tests::test_certificate_validity ... ok
test certificate::tests::test_certificate_never_expires ... ok
test crypto::dilithium::tests::test_keypair_generation ... ok
test crypto::dilithium::tests::test_sign_and_verify ... ok
test crypto::hash::tests::test_sha3_256 ... ok
test crypto::hash::tests::test_domain_separation ... ok
test genesis::tests::test_genesis_context_creation ... ok
test genesis::tests::test_genesis_from_hex ... ok
test genesis::tests::test_genesis_validation ... ok
test identity::tests::test_identity_derivation ... ok
test identity::tests::test_identity_determinism ... ok
test identity::tests::test_identity_verification ... ok
test namespace::tests::test_namespace_derivation ... ok
test namespace::tests::test_namespace_determinism ... ok
test namespace::tests::test_namespace_uniqueness ... ok
test namespace::tests::test_namespace_verification ... ok
test namespace::tests::test_label_validation ... ok
test sovereignty::tests::test_sovereignty_permissions ... ok
test sovereignty::tests::test_sovereignty_transitions ... ok
test vault::tests::test_vault_derivation ... ok
test vault::tests::test_vault_determinism ... ok
test vault::tests::test_vault_uniqueness ... ok
test vault::tests::test_vault_verification ... ok

test result: ok. 25 passed; 0 failed; 0 ignored
```

## Complete Example

```rust
use snp_core::prelude::*;

fn main() -> Result<()> {
    // 1. Load genesis from ceremony
    let genesis = GenesisContext::from_hex(
        "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"
    )?;
    genesis.validate()?;
    
    // 2. Derive namespace with sovereignty class
    let namespace = Namespace::derive(
        &genesis,
        "acme.corp",
        SovereigntyClass::Transferable
    )?;
    
    // 3. Generate Dilithium5 keypair
    let (public_key, secret_key) = Dilithium5::keypair(b"secure entropy")?;
    
    // 4. Derive identity
    let identity = Identity::derive(
        &namespace,
        "admin@acme.corp",
        public_key
    )?;
    
    // 5. Create vault for asset custody
    let asset_hash = [1u8; 32];
    let policy_hash = [2u8; 32];
    let vault = VaultDescriptor::derive(
        &namespace,
        asset_hash,
        policy_hash,
        0
    )?;
    
    // 6. Generate certificate
    let claims_root = [0u8; 32];
    let cert = Certificate::generate(
        &identity,
        &namespace,
        claims_root,
        1704067200,
        0,  // never expires
        &secret_key
    )?;
    
    // 7. Verify everything
    namespace.verify()?;
    identity.verify(&namespace)?;
    vault.verify(&namespace)?;
    assert!(cert.verify(&identity)?);
    
    println!("✅ All operations verified successfully!");
    println!("Namespace: {}", namespace.id_hex());
    println!("Identity: {}", identity.id_hex());
    println!("Vault: {}", vault.id_hex());
    
    Ok(())
}
```

## Specification Conformance

`snp-core` conforms to the following SNP v1.0 specifications:

- ✅ **NAMESPACE_OBJECT.md** - Namespace structure and derivation
- ✅ **SOVEREIGNTY_CLASSES.md** - Five sovereignty models
- ✅ **CRYPTO_PROFILE.md** - Dilithium5 + SHA3-256
- ✅ **VAULT_MODEL.md** - Deterministic vault derivation
- ✅ **GENESIS_SPEC.md** - Genesis binding (uses ceremony output)

## What snp-core Does NOT Do

- ❌ No networking
- ❌ No storage (no filesystem, no database)
- ❌ No blockchain I/O
- ❌ No registries
- ❌ No governance hooks
- ❌ No upgrade switches
- ❌ No admin keys

This is **mathematics + law**, not software services.

## Dependencies

```toml
[dependencies]
sha3 = "0.10"                    # SHA3-256 hashing
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
thiserror = "1.0"                # Error types
hex = "0.4"                      # Hex encoding
pqcrypto-dilithium = "0.5"       # Dilithium5 signatures
pqcrypto-traits = "0.3"          # Post-quantum traits
```

## Performance

- **Namespace derivation**: <1ms
- **Identity derivation**: <1ms
- **Vault derivation**: <1ms
- **Dilithium5 keygen**: ~5ms
- **Dilithium5 sign**: ~10ms
- **Dilithium5 verify**: ~5ms
- **Certificate generation**: ~10ms

## License

MIT

## Version

1.0.0

## Related Components

- [snp-verifier](../snp-verifier/) - Stateless certificate verification
- [snp-genesis-cli](../snp-genesis-cli/) - Genesis ceremony tooling
- Specifications: https://github.com/Y3KDigital/sovereign-namespace-protocol
