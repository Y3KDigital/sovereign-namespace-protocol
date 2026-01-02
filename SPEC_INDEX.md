# SNP v1.0 Specification Index

**Sovereign Namespace Protocol — Complete Specification**

---

## Core Documents (Canonical Order)

### 1. [CONSTITUTION.md](CONSTITUTION.md)
**Purpose**: Immutable axioms and prohibited features

**Defines**:
- 10 irreversible axioms (single genesis, no admin, no recreation, no mutation)
- Namespace identity model (hash as truth)
- Rarity invariants
- Ownership sovereignty rules
- Prohibited features (no governance, no registrars, no Web2 bridges)

**Status**: FINAL

---

### 2. [GENESIS_SPEC.md](GENESIS_SPEC.md)
**Purpose**: One-time genesis ceremony protocol

**Defines**:
- Multi-party entropy collection
- Genesis hash derivation formula
- Key destruction protocol
- Public transcript format
- Fork resistance guarantees

**Status**: FINAL

---

### 3. [CRYPTO_PROFILE.md](CRYPTO_PROFILE.md)
**Purpose**: Post-quantum cryptographic primitives

**Defines**:
- Dilithium5 signatures (post-quantum)
- SHA3-256 + BLAKE3 hashing
- Deterministic address derivation
- Forbidden primitives (ECDSA, secp256k1, RSA)
- Domain separation requirements

**Status**: FINAL

---

### 4. [NAMESPACE_OBJECT.md](NAMESPACE_OBJECT.md)
**Purpose**: Namespace as cryptographic asset

**Defines**:
- Complete namespace structure
- Identity derivation formula (genesis-bound)
- Rarity proof model (6 components)
- Lineage verification (Merkle proofs)
- Transfer protocol
- Vault derivation

**Status**: FINAL

---

### 5. [SOVEREIGNTY_CLASSES.md](SOVEREIGNTY_CLASSES.md)
**Purpose**: Control and transfer models

**Defines**:
- Class 1: Immutable (non-transferable)
- Class 2: Transferable (once or unlimited)
- Class 3: Delegable (multi-sig)
- Class 4: Heritable (succession planning)
- Class 5: Sealed (permanent vaults)

**Status**: FINAL

---

### 6. [VAULT_MODEL.md](VAULT_MODEL.md)
**Purpose**: Value containment and authorization

**Defines**:
- Deterministic vault derivation
- Proof-based authorization (not key-based)
- Revenue stream models
- Escrow and conditional release
- Multi-chain support design

**Status**: FINAL

---

### 7. [STATELESS_VERIFIER.md](STATELESS_VERIFIER.md)
**Purpose**: Eternal verification algorithm

**Defines**:
- Complete verification algorithm (6 steps)
- Minimal verification requirements
- Chain-agnostic design
- Portable proof packages
- Performance specifications (<20ms)

**Status**: FINAL

---

## Meta-Documents

### [VERSION.md](VERSION.md)
Version declaration, finality statement, enforcement model

---

## Reading Order

**For Understanding**:
1. CONSTITUTION.md (understand the axioms)
2. CRYPTO_PROFILE.md (understand the security model)
3. NAMESPACE_OBJECT.md (understand the asset)
4. SOVEREIGNTY_CLASSES.md (understand control models)
5. GENESIS_SPEC.md (understand origin)
6. VAULT_MODEL.md (understand value containment)
7. STATELESS_VERIFIER.md (understand verification)

**For Implementation**:
1. CRYPTO_PROFILE.md (choose libraries)
2. GENESIS_SPEC.md (build genesis ceremony)
3. NAMESPACE_OBJECT.md (implement core types)
4. STATELESS_VERIFIER.md (implement verifier)
5. SOVEREIGNTY_CLASSES.md (implement control logic)
6. VAULT_MODEL.md (implement vault derivation)
7. CONSTITUTION.md (final compliance check)

---

## Conformance

An implementation is **SNP v1.0 conformant** if and only if:

1. ✅ All 10 axioms from CONSTITUTION.md are enforced
2. ✅ No prohibited features exist
3. ✅ Cryptographic profile matches CRYPTO_PROFILE.md exactly
4. ✅ Namespace derivation matches NAMESPACE_OBJECT.md
5. ✅ Genesis ceremony follows GENESIS_SPEC.md
6. ✅ Verification algorithm matches STATELESS_VERIFIER.md

**Partial conformance is not conformance.**

---

## Modification Policy

**None.**

These specifications cannot be amended, updated, or revised.

Any deviation creates a different system, not SNP v1.0.

---

## Contact

There is no contact.

The specification is the authority.

---

**SNP v1.0 — Immutable by Design**
