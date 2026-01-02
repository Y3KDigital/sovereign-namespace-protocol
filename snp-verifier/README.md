# SNP Verifier

**Stateless verification for Sovereign Namespace Protocol (SNP) v1.0**

## Purpose

This tool verifies namespace certificates **without blockchain access**.

Requires only:
- Genesis hash (32 bytes, public)
- Certificate JSON (from IPFS)
- This verifier binary

## Verification Algorithm

Implements 6-step verification from [STATELESS_VERIFIER.md](../specs/STATELESS_VERIFIER.md):

1. **Genesis Binding** - Certificate matches genesis hash
2. **Identity Derivation** - Namespace hash correctly derived
3. **Lineage Proof** - Merkle proof validates ancestry
4. **Rarity Calculation** - Score matches formula
5. **Signature** - Post-quantum signature valid (Dilithium5 or SPHINCS+)
6. **IPFS Hash** - Content hash matches certificate

## Installation

```bash
cargo build --release
```

Binary: `target/release/snp-verify`

## Usage

### Verify Certificate

```bash
snp-verify verify \
  --certificate certificate.json \
  --genesis 0xABCDEF... \
  --verbose
```

### Example Output

```
=== Verification Result ===

Genesis Binding            ✅ PASS
Identity Derivation        ✅ PASS
Lineage Proof              ✅ PASS
Rarity Calculation         ✅ PASS
Signature                  ✅ PASS
IPFS Content Hash          ✅ PASS

===========================

✅ VALID - Certificate passes all checks

Namespace: 1.x
Hash: 0x7f3a9b2c...
Rarity: Mythical (950.5)
Class: Immutable
```

## Cryptography

**Post-quantum conformant** (CRYPTO_PROFILE.md):
- Dilithium5 signatures (NIST FIPS 204)
- SHA3-256 hashing
- SPHINCS+ support (ultra-conservative)

**Forbidden** (will reject):
- Ed25519, ECDSA, secp256k1 (quantum-vulnerable)
- RSA, DSA
- MD5, SHA-1

## Performance

- **Target**: <20ms verification
- **Memory**: <20KB
- **Network**: None (after certificate fetch)

## Chain-Agnostic

Works even if:
- Original chain halts
- All validators disappear
- Decades pass
- No software maintenance

This is **true sovereignty**.

## Conformance

Implements:
- [STATELESS_VERIFIER.md](../specs/STATELESS_VERIFIER.md)
- [CRYPTO_PROFILE.md](../specs/CRYPTO_PROFILE.md)
- [NAMESPACE_OBJECT.md](../specs/NAMESPACE_OBJECT.md)

## License

MIT
