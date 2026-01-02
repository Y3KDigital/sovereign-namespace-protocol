# SNP Security Model

## 🔒 Cryptographic Key Management

### Local-Only Key Generation

**ALL cryptographic operations happen on YOUR machine. NO keys are ever sent to remote servers.**

### Key Generation Process

1. **User provides entropy seed** → You control the randomness source
2. **Local Dilithium5 keypair generation** → Quantum-resistant post-quantum cryptography
3. **Keys saved as JSON files** → Stored directly on your filesystem
4. **No network transmission** → Zero external dependencies for key operations

### Key Storage

```bash
# Keys are stored as local JSON files
test-pubkey.json   # Public key (2,592 bytes) - Safe to share
test-seckey.json   # Secret key (4,896 bytes) - MUST KEEP SECRET
```

**File Permissions**: After generating keys, secure your secret keys:

```powershell
# Windows: Restrict access to your user account only
icacls test-seckey.json /inheritance:r /grant:r "$env:USERNAME:F"

# Linux/Mac: Owner read/write only
chmod 600 test-seckey.json
```

### What Gets Generated Locally

✅ **Genesis Hash** (snp-genesis-cli):
- Ceremony entropy collected locally
- Genesis hash computed on your machine
- No external dependencies

✅ **Dilithium5 Keypairs** (snp keygen):
- Post-quantum signature keys
- Derived from YOUR seed
- Generated 100% offline

✅ **Namespaces** (snp namespace create):
- Deterministically derived from genesis + label
- Computed locally from inputs
- No registry required

✅ **Identities** (snp identity create):
- Bound to your namespace + public key
- Cryptographically derived locally
- Verifiable offline

✅ **Certificates** (snp certificate issue):
- Signed with YOUR secret key
- Generated on your machine
- Never transmitted

✅ **Vaults** (snp vault derive):
- Deterministically computed
- Custody addresses derived locally
- No blockchain required for derivation

✅ **Transitions** (snp transition):
- Sovereignty changes signed locally
- Proofs generated on your machine
- Complete offline operation

## 🛡️ Security Guarantees

### 1. Local Key Generation
- **Zero Trust**: No reliance on external key generation services
- **Deterministic**: Same seed → same keypair (backup your seed!)
- **Post-Quantum**: Dilithium5 resistant to quantum attacks
- **SHA3-256**: NIST-approved hashing for all derivations

### 2. Secret Key Protection

**Your secret keys are stored as JSON files. YOU are responsible for:**

⚠️ **File System Security**:
- Use encrypted filesystems (BitLocker, FileVault, LUKS)
- Set restrictive file permissions (owner-only read/write)
- Never commit secret keys to git repositories

⚠️ **Backup Strategy**:
- Store seeds/keys in encrypted password manager
- Use hardware security modules (HSMs) for production
- Consider cold storage for high-value keys
- Test recovery procedures

⚠️ **Operational Security**:
- Never share secret key files
- Never transmit keys over unencrypted channels
- Rotate keys if compromise is suspected
- Use different keys for test vs. production

### 3. Offline Verification

**All verification happens locally:**

```bash
# Verify certificates offline
snp certificate verify --file cert.json --identity identity.json

# Verify transitions offline
snp transition verify --file transition.json --pubkey owner-pubkey.json

# Verify namespaces offline
snp namespace verify --file namespace.json
```

No internet required. No phone-home. Pure cryptography.

### 4. Deterministic Operations

**Given the same inputs, you get the same outputs:**

```bash
# Same genesis + label → same namespace ID
snp namespace create --genesis 0x6787... --label "acme.corp" --sovereignty immutable

# Same namespace + subject + pubkey → same identity ID
snp identity create --namespace ns.json --subject "admin" --pubkey pk.json

# Reproducible = verifiable = auditable
```

## 🔐 Best Practices

### For Development/Testing

```bash
# Generate test keys (use a memorable seed)
snp keygen generate --seed "my-test-seed-2026" --pubkey test-pk.json --seckey test-sk.json

# NEVER use test seeds in production
# NEVER share test secret keys publicly
```

### For Production Use

```bash
# 1. Generate high-entropy seed (256+ bits)
# Use: Hardware RNG, dice rolls, or trusted random generator
openssl rand -hex 32  # Example: generates 256-bit hex seed

# 2. Generate keypair on air-gapped machine
snp keygen generate --seed "<your-256-bit-hex>" --pubkey prod-pk.json --seckey prod-sk.json

# 3. Secure the secret key immediately
icacls prod-sk.json /inheritance:r /grant:r "$env:USERNAME:F"  # Windows
chmod 600 prod-sk.json  # Linux/Mac

# 4. Backup seed to encrypted password manager
# DO NOT store seed in plain text

# 5. Verify keypair works
snp namespace create --genesis 0x... --label "test.verify" --sovereignty immutable --output test.json
# If this works, your keys are valid
```

### Secret Key Lifecycle

```
┌─────────────────┐
│  Generate Seed  │ ← YOU control this (high entropy)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Keypair│ ← Happens on YOUR machine
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to Disk   │ ← YOUR filesystem (encrypt it!)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Set Perms     │ ← Owner-only read/write
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backup Seed    │ ← Encrypted password manager
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Use for Sign  │ ← Sign certs, transitions, etc.
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Rotate/Destroy  │ ← When no longer needed
└─────────────────┘
```

## 🚨 Security Warnings

### ⚠️ Never Do This

❌ Store secret keys in git repositories  
❌ Share secret keys via email/Slack/Discord  
❌ Use weak seeds (like "password123")  
❌ Reuse production keys for testing  
❌ Generate keys on shared/compromised systems  
❌ Leave secret key files world-readable  
❌ Transmit keys over unencrypted connections  
❌ Use cloud storage for unencrypted keys  

### ✅ Always Do This

✅ Generate keys on YOUR machine (never remote services)  
✅ Use high-entropy seeds (256+ bits)  
✅ Set restrictive file permissions (600 or owner-only)  
✅ Encrypt your filesystem (BitLocker/FileVault/LUKS)  
✅ Backup seeds in encrypted password manager  
✅ Test key recovery procedures  
✅ Rotate keys if compromise suspected  
✅ Use different keys for test vs. production  
✅ Verify all operations work offline  

## 📋 Security Checklist

Before deploying to production:

- [ ] Generated keys on air-gapped or trusted machine
- [ ] Used high-entropy seed (256+ bits)
- [ ] Secret keys have owner-only permissions (600)
- [ ] Filesystem is encrypted
- [ ] Seed backed up to encrypted password manager
- [ ] Recovery procedure tested successfully
- [ ] Test keys destroyed (not reused for production)
- [ ] Secret key files added to .gitignore
- [ ] No secrets in commit history
- [ ] Key rotation plan documented
- [ ] Incident response plan prepared
- [ ] Team trained on key handling procedures

## 🔍 Auditing Your Security

### Check File Permissions

```powershell
# Windows
icacls test-seckey.json
# Should show only your user account with Full control

# Linux/Mac
ls -la test-seckey.json
# Should show: -rw------- (owner read/write only)
```

### Verify Local-Only Operations

```bash
# Disconnect from internet, then run:
snp keygen generate --seed "offline-test" --pubkey pk.json --seckey sk.json
snp namespace create --genesis 0x6787... --label "offline.test" --sovereignty immutable --output ns.json
snp identity create --namespace ns.json --subject "test" --pubkey pk.json --output id.json

# All should work WITHOUT network access
# This proves: NO remote key generation, NO phone-home
```

### Verify No Secrets in Git

```bash
git log --all -p -S "SECRET" -S "PRIVATE" -S "KEY"
# Should return no matches for your actual secret keys
```

## 📚 References

- **Dilithium5**: [NIST PQC Standard (FIPS 204)](https://csrc.nist.gov/publications/detail/fips/204/final)
- **SHA3-256**: [FIPS 202](https://csrc.nist.gov/publications/detail/fips/202/final)
- **File Permissions**: [OWASP Key Storage](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- **SNP Specifications**: [GitHub Repository](https://github.com/Y3KDigital/sovereign-namespace-protocol)

## 🆘 Incident Response

### If You Suspect Key Compromise

1. **Immediately stop using the compromised key**
2. **Generate new keypair with fresh seed**
3. **If using Transferable/Delegable namespaces:**
   - Use `snp transition transfer` to move to new key
   - Use `snp transition delegate` to revoke old authority
4. **If using Immutable/Sealed namespaces:**
   - Key compromise = namespace compromise
   - Create new namespace with new key
   - Migrate assets to new namespace
5. **Audit all signed artifacts:**
   - Certificates issued with compromised key
   - Transitions signed with compromised key
   - Revoke/reissue as needed
6. **Document the incident:**
   - When compromise discovered
   - What was compromised
   - Actions taken
   - Lessons learned

### Contact

For security vulnerabilities in SNP itself, contact:  
**security@y3kdigital.com** (PGP key on keybase)

---

**Remember: SNP is sovereign-by-design. YOU control the keys. YOU are responsible for security.**

**With great sovereignty comes great responsibility.** 🔐
