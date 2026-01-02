# Security Verification Guide for SNP

## Overview

This document provides step-by-step procedures for verifying the security properties of the Sovereign Namespace Protocol (SNP) implementation. These verification steps help ensure that the implementation conforms to the security specifications and that your deployment is secure.

## Verification Checklist

### 1. Cryptographic Verification

#### Verify Post-Quantum Cryptography

**Requirement:** SNP MUST use Dilithium5 for signatures (per [specs/CRYPTO_PROFILE.md](specs/CRYPTO_PROFILE.md))

**Verification steps:**
```bash
# Check dependency versions
cd snp-core
grep "pqcrypto-dilithium" Cargo.toml

# Expected: pqcrypto-dilithium = "0.5" or later
```

**Code inspection:**
```bash
# Verify Dilithium5 is used (not Dilithium2 or Dilithium3)
grep -r "dilithium5" snp-core/src/
grep -r "Dilithium5" snp-core/src/
```

#### Verify Hash Functions

**Requirement:** SNP MUST use SHA3-256 for hashing (per [specs/CRYPTO_PROFILE.md](specs/CRYPTO_PROFILE.md))

**Verification steps:**
```bash
# Check for SHA3-256 usage
grep -r "sha3" snp-core/Cargo.toml
grep -r "Sha3_256" snp-core/src/

# Verify no weak hash functions are used
grep -r "md5\|sha1\|sha256" snp-core/src/ | grep -v "sha3"
# Should return no results (or only comments/documentation)
```

#### Verify No Quantum-Vulnerable Crypto

**Requirement:** SNP MUST NOT use ECDSA, secp256k1, or RSA (per [specs/CRYPTO_PROFILE.md](specs/CRYPTO_PROFILE.md))

**Verification steps:**
```bash
# Check for prohibited cryptographic primitives
grep -r "secp256k1\|ecdsa\|ed25519\|rsa" snp-core/Cargo.toml
# Should return no results

grep -r "ECDSA\|Secp256k1\|Ed25519\|RSA" snp-core/src/
# Should return no results (except in comments about what NOT to use)
```

### 2. Genesis Binding Verification

**Requirement:** All namespace IDs MUST be bound to genesis hash (per [specs/NAMESPACE_OBJECT.md](specs/NAMESPACE_OBJECT.md))

**Verification steps:**
```bash
# Review namespace derivation code
cat snp-core/src/namespace.rs | grep -A 10 "derive"

# Check that genesis_hash is included in namespace ID calculation
grep -r "genesis_hash" snp-core/src/namespace.rs
```

**Test verification:**
```bash
# Create two namespaces with same label but different genesis
# They MUST have different namespace IDs

# Test 1: Genesis A
snp namespace create --genesis 0xAAAA...AAAA --label "test.ns" --sovereignty immutable --output test-a.json

# Test 2: Genesis B  
snp namespace create --genesis 0xBBBB...BBBB --label "test.ns" --sovereignty immutable --output test-b.json

# Compare namespace IDs
jq '.namespace_id' test-a.json
jq '.namespace_id' test-b.json
# IDs MUST be different
```

### 3. Sovereignty Class Verification

**Requirement:** Sovereignty classes MUST be enforced (per [specs/SOVEREIGNTY_CLASSES.md](specs/SOVEREIGNTY_CLASSES.md))

**Verification steps:**
```bash
# Check sovereignty implementation
cat snp-core/src/sovereignty.rs

# Verify all 5 sovereignty classes are defined
grep "Immutable\|Transferable\|Delegable\|Heritable\|Sealed" snp-core/src/sovereignty.rs
```

**Test verification for Immutable class:**
```bash
# Create an immutable namespace
snp namespace create --genesis 0x6787... --label "immutable.test" --sovereignty immutable --output immutable.json

# Attempt to transfer (should fail)
snp transition transfer --namespace immutable.json --new-owner new-pk.json --seckey sk.json
# Expected: Error indicating immutable namespaces cannot be transferred
```

### 4. Stateless Verification

**Requirement:** Verification MUST work without blockchain access (per [specs/STATELESS_VERIFIER.md](specs/STATELESS_VERIFIER.md))

**Verification steps:**
```bash
# Create a certificate
snp certificate issue --identity id.json --namespace ns.json --claims claims.json --seckey sk.json --output cert.json

# Disconnect from internet
# (Physically disconnect network or use airplane mode)

# Verify certificate offline
snp certificate verify --file cert.json --identity id.json
# Should succeed without network access

# This proves: No blockchain queries, no remote API calls
```

### 5. Local Key Generation Verification

**Requirement:** All key generation MUST happen locally (per [SECURITY.md](SECURITY.md))

**Verification steps:**
```bash
# Network traffic monitoring test
# Start network packet capture (requires root/admin)
sudo tcpdump -i any -w keygen-traffic.pcap &
TCPDUMP_PID=$!

# Generate keys
snp keygen generate --seed "verification-test" --pubkey test-pk.json --seckey test-sk.json

# Stop packet capture
sudo kill $TCPDUMP_PID

# Analyze captured traffic
sudo tcpdump -r keygen-traffic.pcap
# Should show NO network traffic related to key generation
```

**Code inspection:**
```bash
# Verify key generation code has no network calls
grep -r "http\|tcp\|udp\|socket\|request" snp-core/src/crypto/
# Should return no results (or only test code)
```

### 6. File Permissions Verification

**Requirement:** Secret keys MUST be protected with owner-only permissions

**Verification on Linux/Mac:**
```bash
# Generate test keys
snp keygen generate --seed "test" --pubkey test-pk.json --seckey test-sk.json

# Check permissions
ls -la test-sk.json

# Expected: -rw------- (600) owner read/write only
# If not, fix with: chmod 600 test-sk.json
```

**Verification on Windows:**
```powershell
# Generate test keys
snp keygen generate --seed "test" --pubkey test-pk.json --seckey test-sk.json

# Check permissions
icacls test-sk.json

# Expected: Only your user account should have access
# If not, fix with: icacls test-sk.json /inheritance:r /grant:r "$env:USERNAME:F"
```

### 7. No Admin Keys Verification

**Requirement:** No admin keys or privileged accounts MUST exist (per [specs/CONSTITUTION.md](specs/CONSTITUTION.md))

**Code inspection:**
```bash
# Search for admin/privileged functionality
grep -ri "admin\|superuser\|privileged\|owner\|authority" snp-core/src/ | grep -v "namespace_owner"

# Should find only namespace_owner (which is user-controlled)
# Should NOT find any system-level admin keys
```

### 8. Deterministic Operations Verification

**Requirement:** Same inputs MUST produce same outputs

**Test verification:**
```bash
# Generate same namespace twice
snp namespace create --genesis 0x6787... --label "test.ns" --sovereignty immutable --output test1.json
snp namespace create --genesis 0x6787... --label "test.ns" --sovereignty immutable --output test2.json

# Compare outputs
diff test1.json test2.json
# Should show no differences (files are identical)
```

### 9. No Governance Verification

**Requirement:** No governance mechanisms MUST exist (per [specs/CONSTITUTION.md](specs/CONSTITUTION.md))

**Code inspection:**
```bash
# Search for governance-related code
grep -ri "governance\|voting\|proposal\|dao" snp-core/src/

# Should return no results (or only in comments about what's prohibited)
```

### 10. Build Reproducibility Verification

**Verification steps:**
```bash
# Clean build
cargo clean
cargo build --release

# Record hash of binary
sha256sum target/release/snp > hash1.txt

# Clean and rebuild
cargo clean
cargo build --release

# Record hash again
sha256sum target/release/snp > hash2.txt

# Compare
diff hash1.txt hash2.txt
# Note: Full reproducibility requires same compiler version, date, etc.
# See https://reproducible-builds.org/ for details
```

## Security Audit Checklist

Before production deployment:

- [ ] Dilithium5 signatures verified
- [ ] SHA3-256 hashing verified
- [ ] No quantum-vulnerable crypto found
- [ ] Genesis binding verified
- [ ] Sovereignty classes enforced
- [ ] Stateless verification works offline
- [ ] Local key generation verified (no network calls)
- [ ] Secret key file permissions correct (600)
- [ ] No admin keys or privileged accounts exist
- [ ] Deterministic operations verified
- [ ] No governance mechanisms found
- [ ] All tests pass (`cargo test --all`)
- [ ] No compiler warnings (`cargo clippy`)
- [ ] Dependencies audited (`cargo audit`)
- [ ] Documentation reviewed
- [ ] Security policies documented

## Automated Security Scanning

### Run Cargo Audit

```bash
# Install cargo-audit
cargo install cargo-audit

# Scan for known vulnerabilities
cargo audit

# Should report no known vulnerabilities in dependencies
```

### Run Clippy Linter

```bash
# Run Clippy with strict settings
cargo clippy --all-targets --all-features -- -D warnings

# Should produce no warnings or errors
```

### Run All Tests

```bash
# Run full test suite
cargo test --all

# All tests should pass
```

## Security Scripts

Use the provided security audit scripts:

**On Linux/Mac:**
```bash
./audit-security.sh
```

**On Windows:**
```powershell
.\audit-security.ps1
```

These scripts automate many of the verification steps above.

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@y3kdigital.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
4. Allow reasonable time for response (90 days)

## References

- [specs/CONSTITUTION.md](specs/CONSTITUTION.md) - Core axioms and prohibitions
- [specs/CRYPTO_PROFILE.md](specs/CRYPTO_PROFILE.md) - Cryptographic requirements
- [specs/SECURITY.md](SECURITY.md) - Security model details
- [KEY_SECURITY.md](KEY_SECURITY.md) - Key management best practices

---

**Security is not a feature, it's a requirement. Verify regularly!** 🛡️
