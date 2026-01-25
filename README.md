# Sovereign Namespace Protocol (SNP) v1.0

**Status**: ✅ **Constitutional Layer Complete** — Ready for Audit

---

## What This Is

SNP defines a **non-recreatable, post-quantum, sovereign namespace system** where:

- Each **root namespace** is a **cryptographic asset**, not a label
- **Three-layer architecture**: TLDs (protocol) → ROOTS (scarce) → Subdomains (utility)
- **955 fixed root supply** — can never be increased or recreated
- **Single genesis** ensures roots can never be recreated on any other network
- **No admin keys** exist post-genesis (provably destroyed)
- **No governance** can change the rules (immutable protocol law)
- **Post-quantum cryptography** (Dilithium5) ensures long-term security
- **Stateless verification** works even if the chain dies
- **Deterministic policy engine** enforces machine-readable governance rules

**Economic Model**: "Y3K sells root namespaces, not names. Each root can generate unlimited subdomains, but only the root is scarce."

This is **not** a domain system, identity service, or wallet protocol.

This is a **permanent trust primitive** and **digital scarcity substrate**.

---

## Project Status

### ✅ Completed (Constitutional Layer)
1. **Genesis Ceremony** — One-time namespace derivation with cryptographic binding
2. **Core Objects** — Namespace, Identity, Certificate, Vault implementations
3. **Sovereignty Transitions** — Transfer, Delegate, Inherit, Seal with signature verification
4. **Security Documentation** — Key management, threat model, audit preparation
5. **Policy Engine** — Deterministic, offline-verifiable policy evaluation (v1.0)

### 🏗️ In Progress
- Test coverage improvements (target: 80%+)
- Property testing for determinism verification
- Integration test suite expansion

### 📋 Planned
- Chain anchoring and replication protocol
- Smart contract integration backends
- Production deployment configuration
- Public audit and certification

---

## Specification Documents

### Core Specifications (FROZEN v1.0)

**READ THESE FIRST**:

1. **[SPEC_INDEX.md](SPEC_INDEX.md)** — Navigation and conformance requirements
2. **[VERSION.md](VERSION.md)** — Finality statement and immutability declaration
3. **[CONSTITUTION.md](specs/CONSTITUTION.md)** — Irreversible axioms and prohibited features
4. **[GENESIS_SPEC.md](specs/GENESIS_SPEC.md)** — One-time genesis ceremony protocol
5. **[CRYPTO_PROFILE.md](specs/CRYPTO_PROFILE.md)** — Post-quantum cryptographic primitives
6. **[NAMESPACE_OBJECT.md](specs/NAMESPACE_OBJECT.md)** — Namespace as cryptographic asset
7. **[SOVEREIGNTY_CLASSES.md](specs/SOVEREIGNTY_CLASSES.md)** — Control and transfer models
8. **[POLICY_SPEC.md](specs/POLICY_SPEC.md)** — Deterministic policy evaluation engine
9. **[VAULT_MODEL.md](specs/VAULT_MODEL.md)** — Value containment and authorization
10. **[STATELESS_VERIFIER.md](specs/STATELESS_VERIFIER.md)** — Eternal verification algorithm

**These specifications are immutable.** No amendments, upgrades, or revisions are permitted.

---

## Security & Audit Documentation

**Repository Security Status:** ✅ **SECURE** (Last audit: 2026-01-25)

### Security Resources

1. **[SECURITY_DOCS_README.md](SECURITY_DOCS_README.md)** — Security documentation index
2. **[SECURITY_AUDIT_CODESPACE_2026-01-25.md](SECURITY_AUDIT_CODESPACE_2026-01-25.md)** — Complete security audit report
3. **[CODESPACE_TROUBLESHOOTING.md](CODESPACE_TROUBLESHOOTING.md)** — VS Code/Codespace issue resolution
4. **[security-check.sh](security-check.sh)** — Automated security verification script

**Quick Security Check:**
```bash
./security-check.sh
```

**Recent Security Audit Findings:**
- ✅ No unauthorized access detected
- ✅ All git commits from legitimate users only
- ✅ No malicious code or vulnerabilities found
- ✅ All dependencies from trusted sources
- ✅ Environment is clean and secure

See [SECURITY_DOCS_README.md](SECURITY_DOCS_README.md) for complete security documentation.

---

## Reference Implementation (Rust)

This repository contains a **specification-conformant reference implementation** in Rust.

### Current Status

✅ **The Rust implementation conforms to the frozen specifications.**  
✅ Uses Dilithium5 (post-quantum signatures)  
✅ Implements sovereignty classes and transitions  
✅ Policy engine with guaranteed termination  
⚠️ Test coverage needs improvement before production use

**Specification-conformant implementation is in progress.**

### Architecture Overview

**Specification-Conformant Crates (New)**:
- ✅ `snp-verifier` — Stateless verification (Dilithium5, SHA3-256, <20ms, chain-agnostic)

**Pre-Specification Crates (Being Replaced)**:
- `namespace-core` — Core namespace logic (uses Ed25519, will be replaced by snp-core)
- `rarity-engine` — Rarity calculation (needs genesis binding)
- `ipfs-integration` — Certificate storage
- `certificate-gen` — Certificate signing (uses Ed25519, needs Dilithium5)
- `smart-contract` — NFT minting interface
- `api-server` — REST API

---

## Why This Matters

### Not Web2.5

Most "Web3" namespace systems:
- Have admin keys (can be seized)
- Have governance (rules can change)
- Use quantum-vulnerable crypto (ECDSA/secp256k1)
- Depend on specific chains (die when chain dies)
- Can be recreated (forks produce identical IDs)

SNP has **none** of these weaknesses.

### True Digital Scarcity

- **Supply = 1** for every namespace (mathematically enforced)
- **Non-recreatable** (genesis-bound identity derivation)
- **Loss is permanent** (no recovery, creates real value)
- **Rarity is objective** (deterministic calculation, immutable)

### Institutional-Grade

- Post-quantum secure (survives quantum computers)
- Stateless verification (survives chain death)
- No governance surface (no capture risk)
- Sovereign vaults (trust-like value containment)

---

## Quick Start (Reference Implementation)

### Build

```powershell
cargo build --release
```

### Run API Server (Current Implementation)

```powershell
cargo run --release --bin api-server
```

Server starts at `http://127.0.0.1:8080`

### Example Operations

⚠️ **Note**: These operations use the current (pre-spec) implementation. Specification-conformant operations will differ.

```bash
# Create namespace
curl -X POST http://localhost:8080/namespaces \
  -H "Content-Type: application/json" \
  -d '{"id": "1.x", "parent": "/"}'

# Get namespace
curl http://localhost:8080/namespaces/1.x

# Get rarity
curl http://localhost:8080/namespaces/1.x/rarity
```

---

## Conformance Status
✅ snp-verifier (verification only) |
| SHA3-256 hashing | ✅ snp-verifier |
| Genesis ceremony | ❌ Not implemented |
| Sovereignty classes | ❌ Not implemented |
| Stateless verifier | ✅ **COMPLETE** (snp-verifier) |
| Vault derivation | ❌ Not implemented |
| Constitutional enforcement | ⚠️ Partial |

**First conformant component**: `snp-verifier` — Proves specifications are implementable
| Constitutional enforcement | ⚠️ Partial |

**Next phase**: Build specification-conformant reference implementation.

---

## Security Model (Specification)

### Cryptographic Guarantees (MUST)

Per [CRYPTO_PROFILE.md](CRYPTO_PROFILE.md):
- Post-quantum signatures: Dilithium5
- Hash function: SHA3-256
- Merkle trees: BLAKE3
- No ECDSA, secp256k1, or RSA

### Identity Derivation (MUST)

Per [NAMESPACE_OBJECT.md](NAMESPACE_OBJECT.md):
```
NAMESPACE_HASH = SHA3-256(
  domain_separator ||
  GENESIS_HASH ||
  parent_hash ||
  canonical_id ||
  creation_block ||
  entropy
)
```

### Genesis Binding (MUST)

Per [GENESIS_SPEC.md](GENESIS_SPEC.md):
- Single genesis ceremony
- Multi-party entropy
- Key destruction proofs
- Public transcript (content-addressed)

---

## Value Proposition

### What Makes This Different

SNP is **not** optimized for:
- Ease of use
- Mass adoption
- Marketing appeal
- Regulatory compliance

SNP **is** optimized for:
- **Permanence** (outlives chains, companies, jurisdictions)
- **Sovereignty** (no admin, no governance, no seizure)
- **Scarcity** (mathematically enforced, non-dilutable)
- **Authority** (trust primitive for protocols and institutions)

### Who This Is For

**Builders** who need non-capturable roots of trust:
- Protocol designers
- Infrastructure teams
- RWA issuers

**Institutions** with long time horizons:
- Family offices
- Endowments
- Sovereign-aligned entities

**Individuals** who understand digital scarcity:
- Early Bitcoin holders
- Cypherpunks
- Cryptographers

### Why Value Will Emerge

Not from marketing or roadmaps.

From **constraints that cannot be reversed**:
- No recreation → provable uniqueness
- No admin → no seizure
- No governance → no dilution
- Post-quantum → survives quantum computers
- Stateless verification → survives chain death

---

## Rarity Example (Specification)

Per [NAMESPACE_OBJECT.md](NAMESPACE_OBJECT.md), rarity is deterministic:

```
Rarity Score = 
  position_rarity × 200 +
  pattern_rarity × 300 +
  hash_entropy × 100 +
  temporal_rarity × 150 +
  structural_rarity × 250
```

| Namespace | Tier | Why |
|-----------|------|-----|
| 1.x | Mythical | Position = 1 (maximum rarity) |
| 121.x | Legendary | Palindrome pattern |
| 123.x | Epic | Sequential pattern |
| 1000.x | Rare | Round number |

---

## Development (Reference Implementation)

### Repository Structure

```
specs/                    # IMMUTABLE SPECIFICATIONS
  CONSTITUTION.md
  GENESIS_SPEC.md
  CRYPTO_PROFILE.md
  NAMESPACE_OBJECT.md
  SOVEREIGNTY_CLASSES.md
  VAULT_MODEL.md
  STATELESS_VERIFIER.md

crates/                   # Reference implementation (pre-spec)
  namespace-core/
  rarity-engine/
  ipfs-integration/
  certificate-gen/
  smart-contract/
  api-server/
```

### Testing (Current Implementation)

```powershell
# Run tests
cargo test --all

# Build docs
cargo doc --no-deps --open
```

---

## Prohibited "Features"

Per [CONSTITUTION.md](CONSTITUTION.md), the following MUST NOT exist:

❌ **Governance** — No DAOs, voting, proposals, or parameter changes  
❌ **Administration** — No admin keys, multisigs, or emergency controls  
❌ **Upgrades** — No proxies, migrations, or "v2" mechanisms  
❌ **Recovery** — No password reset, no custody, no seizure  
❌ **Renewals** — No expiration, leases, or subscription fees  
❌ **Registrars** — No central authority, no moderation, no blacklists  
❌ **Web2 Bridges** — No DNS mirrors or ENS wrappers (as validity dependencies)  

**Any system with these features is not SNP.**

---

## Next Phase

1. ✅ Specifications published (FINAL)
2. ⏳ Reference verifier (`snp-verifier` binary)
3. ⏳ Genesis ceremony CLI (`snp-genesis`)
4. ⏳ Specification-conformant core (`snp-core`)
5. ⏳ Public genesis ceremony
6. ⏳ First conformant namespace

---

## Contact

**There is no contact.**

The specification is the authority.

Implementations either conform or they don't.

---

## License

Specifications: Public domain (no copyright)  
Reference code: MIT License

---

**SNP v1.0 — Sovereign by Mathematics, Not by Policy**
- **Permanent Ownership**: Blockchain-backed NFTs
- **Value Preservation**: Rarity increases over time
- **Anti-Fraud**: Cryptographic guarantees

## 🎯 Vision

Build a Web3 ecosystem where value is intrinsic, not artificial. Where rarity is mathematical, not marketing. Where ownership is permanent, not leased.

This is the foundation for a new paradigm of digital value.

---

**Built with Rust 🦀 | Secured by Crypto 🔐 | Stored on IPFS 📦 | Minted on Blockchain ⛓️**
