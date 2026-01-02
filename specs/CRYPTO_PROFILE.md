# Cryptographic Profile Specification

**Version**: 1.0.0  
**Status**: Locked at Genesis  
**Modification**: Prohibited

---

## 1. Purpose

This document specifies the **permanent cryptographic primitives** used by the Web3 Rarity Namespace System. These choices are **post-quantum secure** and **cannot be changed** after genesis.

---

## 2. Core Principle

> The system must remain secure even if:
> - Quantum computers break current cryptography
> - Decades pass
> - The original chain halts
> - Future attack vectors emerge

**Zero reliance on ECDSA, secp256k1, RSA, or any quantum-vulnerable primitives.**

---

## 3. Signature Scheme

### Primary: CRYSTALS-Dilithium

**Variant**: Dilithium5 (highest security level)

**Properties**:
- Post-quantum secure (lattice-based)
- NIST standardized (FIPS 204)
- Security level: ≥256-bit quantum resistance
- Public key: 2,592 bytes
- Signature: 4,595 bytes
- Signing speed: Fast (~microseconds)

**Usage**:
- Namespace ownership signatures
- Transfer authorization
- Delegation proofs
- Certificate signing

**Why Dilithium**:
- Most mature post-quantum signature scheme
- Best balance of security, speed, and size
- Already standardized by NIST
- Production-ready implementations exist

### Alternative (Optional): SPHINCS+

**Variant**: SPHINCS+-SHA2-256f

**Properties**:
- Hash-based (extremely conservative)
- Stateless (no key state to manage)
- Security: Depends only on SHA-256 (battle-tested)
- Public key: 64 bytes
- Signature: ~49KB (large)

**Usage**:
- Ultra-high-security namespaces (Class 1: Immutable)
- Long-term archival proofs
- Genesis ceremony signing

**Why SPHINCS+ as alternative**:
- Most conservative choice (hash-based)
- Will outlive lattice-based schemes if breakthroughs occur
- No algebraic structure to attack

---

## 4. Hash Functions

### Primary: SHA3-256 (Keccak)

**Properties**:
- NIST standardized (FIPS 202)
- Quantum-resistant (hash functions are generally safe)
- 256-bit output
- Sponge construction (different from SHA-2)

**Usage**:
- Genesis hash derivation
- Namespace identity derivation
- Certificate content addressing
- Merkle tree roots

**Why SHA3**:
- Different security margin than SHA-2 (diversification)
- Standardized and battle-tested
- Quantum-resistant
- Sponge construction is well-studied

### Secondary: BLAKE3

**Properties**:
- Extremely fast
- Parallel-friendly
- 256-bit output (default)
- Merkle tree mode native

**Usage**:
- Merkle tree construction
- Content addressing (IPFS)
- Fast verification paths
- Rarity calculations (deterministic)

**Why BLAKE3**:
- Speed advantage for bulk operations
- Native Merkle tree support
- Modern, clean design
- Used by IPFS ecosystem

---

## 5. Address Derivation

### Namespace Address Formula

```
NamespaceAddress = Base58(
    0x01 ||  // Version byte (namespace v1)
    SHA3-256(
        genesis_hash ||
        parent_hash ||
        namespace_id ||
        creation_block ||
        entropy
    )[0..20]  // Take first 20 bytes
)
```

**Properties**:
- Deterministic (same inputs → same address)
- Collision-resistant (SHA3-256)
- Human-readable (Base58 encoding)
- Version-tagged (future-proof)

### Vault Address Derivation

```
VaultAddress = Base58(
    0x02 ||  // Version byte (vault v1)
    SHA3-256(
        namespace_hash ||
        "vault" ||
        derivation_index
    )[0..20]
)
```

**Properties**:
- Each namespace can derive unlimited vault addresses
- Deterministic (recoverable from namespace hash)
- Isolated (cannot reverse-engineer namespace from vault)

---

## 6. Merkle Tree Construction

### Scheme: Binary Merkle Tree

**Hash**: BLAKE3

**Construction**:
```
LeafHash = BLAKE3("leaf" || data)
NodeHash = BLAKE3("node" || left_hash || right_hash)
```

**Domain Separation**: Different prefixes for leaves vs. nodes prevents second-preimage attacks

**Usage**:
- Namespace lineage proofs
- Batch verification
- Certificate ancestry paths
- Genesis tree commitment

---

## 7. Key Derivation

### KDF: BLAKE3-KDF

**Formula**:
```
DerivedKey = BLAKE3_Derive_Key(
    context: "namespace-key",
    key_material: master_seed
)
```

**Properties**:
- Deterministic
- One-way (cannot reverse-engineer seed)
- Domain-separated (different contexts produce different keys)

**Usage**:
- Deterministic key generation
- Child key derivation
- Secret sharing schemes

---

## 8. Commitment Scheme

### Pedersen Commitments (Optional for Privacy)

**Usage**: If privacy features are needed in future

**Formula**:
```
Commitment = g^value * h^randomness
```

**Properties**:
- Hiding (cannot determine value)
- Binding (cannot change value later)
- Homomorphic (can add commitments)

**Note**: Only used if privacy is required. Default is full transparency.

---

## 9. Proof Construction

### Zero-Knowledge Proofs (Optional)

**Scheme**: STARKs (if needed for scaling)

**Properties**:
- Quantum-resistant (hash-based)
- Succinct (small proofs)
- Transparent (no trusted setup)

**Usage**:
- Batch namespace verification
- Lineage proofs
- Rarity proofs (without revealing all data)

**Note**: Only used for verification optimization, not core security.

---

## 10. Entropy Requirements

### Randomness Source

**Source**: ChaCha20-PRNG seeded from system entropy

**Minimum Entropy**: 256 bits per namespace creation

**Collection**:
```rust
use rand_core::{RngCore, OsRng};

let mut entropy = [0u8; 32];
OsRng.fill_bytes(&mut entropy);
```

**Properties**:
- Cryptographically secure
- Unpredictable
- Platform-independent
- Non-blocking

---

## 11. Cryptographic Constants

### Security Levels

```rust
pub const SECURITY_BITS: usize = 256;  // Post-quantum security target
pub const HASH_OUTPUT_BYTES: usize = 32;  // SHA3-256 output
pub const SIGNATURE_SCHEME: &str = "Dilithium5";
pub const HASH_FUNCTION: &str = "SHA3-256";
pub const MERKLE_HASH: &str = "BLAKE3";
```

### Genesis Parameters

```rust
pub const PROTOCOL_VERSION: &[u8] = b"web3-rarity-v1";
pub const DOMAIN_SEPARATOR: &[u8] = b"web3-rarity-namespace";
```

---

## 12. Implementation Requirements

### Rust Crates (Required)

```toml
[dependencies]
# Post-quantum signatures
pqcrypto-dilithium = "0.5"  # Dilithium5
pqcrypto-sphincsplus = "0.5"  # SPHINCS+ (optional)

# Hash functions
sha3 = "0.10"  # SHA3-256 (Keccak)
blake3 = "1.8"  # BLAKE3

# Randomness
rand_core = "0.6"
rand = "0.8"

# Encoding
bs58 = "0.5"  # Base58 encoding
```

### Testing Requirements

Every cryptographic operation must have:
- Unit tests with known test vectors
- Property-based tests (QuickCheck)
- Constant-time guarantees (where applicable)
- Side-channel resistance verification

---

## 13. Forbidden Primitives

The following are **explicitly prohibited**:

❌ **Quantum-Vulnerable Signatures**:
- ECDSA (secp256k1, P-256, etc.)
- RSA
- DSA
- EdDSA (Ed25519, Ed448) - quantum-vulnerable

❌ **Deprecated Hashes**:
- MD5
- SHA-1
- RIPEMD-160 (alone, without SHA-256)

❌ **Insecure Randomness**:
- `std::rand` (not cryptographic)
- Timestamp-based seeds
- Deterministic without proper seed

❌ **Trusted Setup Schemes** (for ZK):
- SNARKs with trusted setup
- Any scheme requiring ceremony trust

---

## 14. Upgrade Path

### No Upgrades

There is **no upgrade mechanism**. The cryptographic profile is **fixed at genesis**.

### If Cryptography Breaks

If a primitive is broken:
1. The system continues to function
2. Historical proofs remain valid (timestamped before break)
3. New namespaces cannot be created (by design)
4. Existing namespaces retain value (non-recreation guarantee)

### Migration (Extreme Circumstances Only)

If absolutely necessary (e.g., SHA3-256 completely broken):
- Requires **new genesis** (new system)
- Old namespaces **do not migrate** (they remain on old system)
- This is **not an upgrade**, it is a **new system**

---

## 15. Verification

Anyone can verify the cryptographic profile:

```rust
pub fn verify_crypto_profile() -> bool {
    // 1. Check signature scheme is Dilithium5
    assert_eq!(SIGNATURE_SCHEME, "Dilithium5");
    
    // 2. Check hash functions
    assert_eq!(HASH_FUNCTION, "SHA3-256");
    assert_eq!(MERKLE_HASH, "BLAKE3");
    
    // 3. Check security level
    assert!(SECURITY_BITS >= 256);
    
    // 4. Verify no forbidden primitives
    assert!(!uses_ecdsa());
    assert!(!uses_rsa());
    assert!(!uses_md5_or_sha1());
    
    true
}
```

---

## Summary

The cryptographic profile is:

- **Post-quantum secure** (Dilithium, SHA3, BLAKE3)
- **Conservative** (NIST-standardized, battle-tested)
- **Future-proof** (no quantum-vulnerable primitives)
- **Immutable** (locked at genesis)
- **Verifiable** (public specification)

This ensures namespaces remain secure for decades, even in a post-quantum world.

---

**Status**: Locked  
**Modification**: Prohibited  
**Enforcement**: Genesis Hash
