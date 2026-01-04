# 🔐 SNP Key Security - Your Complete Guide

## ✅ CONFIRMED: All Keys Generated & Stored on YOUR Machine

### Where Everything Happens

```
┌──────────────────────────────────────────┐
│         YOUR COMPUTER (LOCAL)            │
│  ┌────────────────────────────────────┐  │
│  │  1. You provide entropy seed       │  │
│  │     (e.g., "my-secure-seed-2026")  │  │
│  │                                    │  │
│  │  2. SHA3-256 hashes your seed      │  │
│  │     (uniform distribution)         │  │
│  │                                    │  │
│  │  3. Dilithium5 keypair generated   │  │
│  │     (post-quantum cryptography)    │  │
│  │                                    │  │
│  │  4. Keys saved to JSON files       │  │
│  │     - test-pubkey.json (2592 bytes)│  │
│  │     - test-seckey.json (4896 bytes)│  │
│  │                                    │  │
│  │  5. YOU set file permissions       │  │
│  │     (owner-only read/write)        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  NO NETWORK ❌                           │
│  NO CLOUD ❌                             │
│  NO REMOTE SERVERS ❌                    │
└──────────────────────────────────────────┘
```

## 🗂️ Your Files on Disk

After running `snp keygen generate`:

```
📁 Your Workspace
├── 📄 test-pubkey.json        ← Safe to share (public key)
│                                2,592 bytes
│                                Used for verification only
│
└── 🔒 test-seckey.json        ← MUST KEEP SECRET!
                                 4,896 bytes
                                 Used for signing operations
                                 Sets file permissions to owner-only
```

### File Contents Example

**test-pubkey.json** (safe to share):
```json
{
  "bytes": "0x1234567890abcdef..." // Public Dilithium5 key (2592 bytes hex)
}
```

**test-seckey.json** (🔒 KEEP SECRET):
```json
{
  "bytes": "0xfedcba0987654321..." // Secret Dilithium5 key (4896 bytes hex)
}
```

## 🔒 Setting Secure Permissions

### Windows (PowerShell):
```powershell
# Make file readable/writable only by you
icacls test-seckey.json /inheritance:r /grant:r "$env:USERNAME:F"

# Verify permissions
icacls test-seckey.json
# Should show only your user account
```

### Linux/Mac (Bash):
```bash
# Set owner-only read/write (600)
chmod 600 test-seckey.json

# Verify permissions
ls -la test-seckey.json
# Should show: -rw------- (owner only)
```

## 🛡️ Complete Workflow (All Local)

### 1. Generate Keys
```powershell
# YOUR MACHINE ONLY
snp keygen generate --seed "your-high-entropy-seed" --pubkey pk.json --seckey sk.json
```

### 2. Create Namespace
```powershell
# Deterministic derivation (local computation)
snp namespace create `
  --genesis "0x6787..." `
  --label "acme.corp" `
  --sovereignty immutable `
  --output namespace.json
```

### 3. Create Identity
```powershell
# Binds your public key to namespace
snp identity create `
  --namespace namespace.json `
  --subject "admin@acme.corp" `
  --pubkey pk.json `
  --output identity.json
```

### 4. Issue Certificate
```powershell
# Signs with YOUR secret key (local operation)
snp certificate issue `
  --identity identity.json `
  --namespace namespace.json `
  --seckey sk.json `
  --claims "0x00...01" `
  --output cert.json
```

### 5. Verify Everything OFFLINE
```powershell
# Disconnect from internet, then:
snp certificate verify --file cert.json --identity identity.json
snp namespace verify --file namespace.json
snp identity verify --file identity.json --namespace namespace.json

# All work WITHOUT network! ✅
```

## 🔍 Security Verification

### Run Automated Security Audit

**Windows:**
```powershell
.\audit-security.ps1
```

**Linux/Mac:**
```bash
chmod +x audit-security.sh
./audit-security.sh
```

### What the Audit Checks:

✅ Secret key file permissions (owner-only)  
✅ .gitignore protects secrets  
✅ No secrets leaked in git history  
✅ Offline operation capability verified  
✅ Filesystem encryption status  
✅ No test artifacts left behind  
✅ Dependency security audit ready  

## 📋 Security Checklist

Before you start using SNP:

- [ ] Read [SECURITY.md](SECURITY.md) completely
- [ ] Generated keys on YOUR trusted machine
- [ ] Used high-entropy seed (256+ bits recommended)
- [ ] Set secret key file permissions to owner-only
- [ ] Verified filesystem encryption is enabled (BitLocker/FileVault/LUKS)
- [ ] Backed up seed to encrypted password manager
- [ ] Tested key recovery procedure
- [ ] Ran security audit script successfully
- [ ] Confirmed all operations work offline (no network)
- [ ] Added `*seckey*.json` to .gitignore
- [ ] Never committed secrets to git

## 🚨 What NOT to Do

❌ **Never** share your secret key files  
❌ **Never** commit secret keys to git/GitHub  
❌ **Never** send keys via email/Slack/Discord  
❌ **Never** use weak seeds like "password123"  
❌ **Never** generate keys on untrusted machines  
❌ **Never** leave secret files world-readable  
❌ **Never** store unencrypted keys in cloud storage  
❌ **Never** reuse production keys for testing  

## ✅ What TO Do

✅ **Always** generate keys on YOUR machine (local-only)  
✅ **Always** use high-entropy seeds (256+ bits)  
✅ **Always** set restrictive file permissions (600 / owner-only)  
✅ **Always** encrypt your filesystem (BitLocker/FileVault/LUKS)  
✅ **Always** backup seeds in encrypted password manager  
✅ **Always** test recovery procedures  
✅ **Always** use different keys for test vs. production  
✅ **Always** verify operations work offline  
✅ **Always** run security audit regularly  

## 🗝️ Your Keys, Your Control

```
                    YOU are the authority
                           │
                           ▼
             ┌─────────────────────────┐
             │   YOUR SECRET KEY       │
             │   (on YOUR machine)     │
             └─────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
    Sign Certs      Transfer Ownership    Seal NS
    │               │                     │
    ▼               ▼                     ▼
All operations    All operations      All operations
LOCAL ONLY        LOCAL ONLY          LOCAL ONLY
```

## 📚 Key Files Reference

| File | Size | Purpose | Security Level |
|------|------|---------|----------------|
| `*-pubkey.json` | 2,592 bytes | Public key for verification | 🟢 Safe to share |
| `*-seckey.json` | 4,896 bytes | Secret key for signing | 🔴 KEEP SECRET |
| `namespace.json` | ~300 bytes | Namespace definition | 🟢 Safe to share |
| `identity.json` | ~400 bytes | Identity binding | 🟢 Safe to share |
| `certificate.json` | ~600 bytes | Signed certificate | 🟢 Safe to share |
| `transition.json` | ~500 bytes | Sovereignty transition | 🟢 Safe to share |

**Only secret keys need protection!** Everything else is publicly verifiable.

## 🔐 Backup Strategy

### What to Backup:

1. **Your entropy seed** (most important!)
   - Store in encrypted password manager
   - Never store in plain text
   - This can regenerate your keys

2. **Your secret key files** (optional)
   - Keep encrypted backups
   - Store in secure offline storage
   - Consider hardware security modules (HSMs)

3. **Your namespace definitions**
   - These are deterministic (can be recreated)
   - But backup for convenience

### Where to Backup:

✅ Encrypted password manager (1Password, Bitwarden, etc.)  
✅ Hardware security module (YubiKey, Ledger, etc.)  
✅ Encrypted USB drive (offline, physically secured)  
✅ Paper wallet (generated offline, stored in safe)  

❌ Cloud storage (unless heavily encrypted)  
❌ Email drafts  
❌ Note-taking apps  
❌ Chat applications  

## 🆘 Incident Response

### If You Suspect Key Compromise:

1. ⏸️ **STOP** using the compromised key immediately
2. 🔑 Generate NEW keypair with fresh seed
3. 🔄 For Transferable/Delegable namespaces:
   - Use `snp transition transfer` to move to new key
   - Use `snp transition delegate` to revoke old authority
4. 🆕 For Immutable/Sealed namespaces:
   - Create new namespace with new key
   - Migrate assets to new namespace
5. 📋 Audit all signed artifacts (certificates, transitions)
6. 📝 Document incident and lessons learned

## 📞 Support

For security questions: Read [SECURITY.md](SECURITY.md)  
For security vulnerabilities: security@y3kdigital.com  
For general questions: Open GitHub issue  

---

## 🎯 Summary

✅ **All keys generated on YOUR machine** (no remote services)  
✅ **All keys stored on YOUR filesystem** (you control access)  
✅ **All operations work OFFLINE** (no network required)  
✅ **Post-quantum cryptography** (Dilithium5 - NIST approved)  
✅ **Deterministic & verifiable** (same inputs = same outputs)  
✅ **Zero trust architecture** (you don't trust us, you verify)  

**YOU have complete sovereignty over your cryptographic keys.**  
**No third parties. No cloud. No external dependencies.**  
**This is true digital sovereignty.** 🔐

---

Generated: 2026-01-02  
Protocol: SNP v1.0  
Repository: github.com/Y3KDigital/sovereign-namespace-protocol
