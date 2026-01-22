# Y3K Root Namespace Lock - Quick Start

**Objective:** Lock 82 root namespaces before any public activity
**Policy:** ROOTS ONLY — No subdomains until locks complete
**Status:** Ready to execute

---

## ⚡ Fast Track (3 Commands)

```powershell
# 1. Upload to IPFS (generates immutable attestation)
.\scripts\upload-to-ipfs.ps1

# 2. Mint all roots (dry run first)
.\scripts\mint-reserved-namespaces.ps1 -DryRun

# 3. Execute minting
.\scripts\mint-reserved-namespaces.ps1
```

**That's it. 82 roots locked.**

---

## 📦 What Gets Locked

| Tier | Description | Count | Examples |
|------|-------------|-------|----------|
| 0 | Crown roots (single-char) | 36 | a, b, c... 0, 1, 2... |
| 1 | Short primitives (2-char) | 18 | ai, id, io, tx, zk... |
| 2 | Economic roots | 17 | law, bank, ai, number... |
| 3 | Protocol roots | 11 | y3k, root, protocol... |
| **TOTAL** | **All roots** | **82** | **LOCKED** |

---

## 🔒 Lock Policy

- ✅ **Roots never sold**
- ✅ **Roots never auctioned**
- ✅ **Roots never publicly listed**
- ✅ **Transfer: PROHIBITED**
- ✅ **Disclosure: Intent-based only**
- ✅ **Subdomains: After root lock complete**

**Public statement:**
> "All Y3K root namespaces are sovereign-locked and privately held by the protocol. Access is granted only through intent-based delegation; roots are never sold."

---

## 📋 Files Created

1. **[ROOT_LOCK_MANIFEST.json](genesis/ROOT_LOCK_MANIFEST.json)** - Machine-readable root list
2. **[PROTOCOL_RESERVED_NAMESPACES.md](PROTOCOL_RESERVED_NAMESPACES.md)** - Full specification
3. **[upload-to-ipfs.ps1](scripts/upload-to-ipfs.ps1)** - IPFS attestation script
4. **[mint-reserved-namespaces.ps1](scripts/mint-reserved-namespaces.ps1)** - Minting automation

---

## 🚀 What Happens Next

### After Minting (Week 2)

**Option A: Routing Proof** (recommended first)
- Wire `law` → +1-800-LAW-Y3K → AI agent → settlement
- Demonstrates live usage
- Creates legitimacy

**Option B: Delegation Framework**
- Contract templates
- Revocation terms
- Pricing logic

**Option C: Governance Hardening**
- Multisig configuration
- Emergency controls
- Upgrade paths

**Option D: Public Disclosure Page**
- Minimal statement
- "Reserved / Not for Sale"
- Prestige through restraint

---

## ✅ Success Criteria

**Locks complete when:**
- 82 roots minted to protocol custody
- IPFS attestation published
- Governance multisig confirmed
- Zero naming conflicts
- Zero public listing

---

## 🎯 Why This Works

This is **exactly** how:
- PKI certificate authorities
- Telecom number registries
- Financial naming systems
- DNS root operators

...maintain sovereignty.

**ENS/Handshake waited. You're not waiting.**

---

## 📞 Emergency Contacts

**If issues during minting:**
1. Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
2. Review [PROTOCOL_RESERVED_NAMESPACES.md](PROTOCOL_RESERVED_NAMESPACES.md)
3. Verify genesis hash matches
4. Contact protocol team

---

**Ready? Run the 3 commands above.**

**Roots first. Everything else later.**
