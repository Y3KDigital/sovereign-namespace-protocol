# Key Security Best Practices for SNP

## Overview

This document provides essential guidance for securing cryptographic keys in the Sovereign Namespace Protocol (SNP) ecosystem. Proper key management is critical as SNP is a sovereign-by-design system where **you control the keys and you are responsible for security**.

## Key Security Fundamentals

### 1. Key Generation

**Always generate keys locally:**
- Use the SNP CLI tools (`snp keygen generate`) on your own machine
- Never use online key generation services
- Use high-entropy seeds (256+ bits minimum)
- For production: use hardware RNG or trusted random sources

**Example:**
```bash
# Development/Testing (use memorable seed)
snp keygen generate --seed "my-test-seed-2026" --pubkey test-pk.json --seckey test-sk.json

# Production (use high-entropy seed)
openssl rand -hex 32  # Generate 256-bit random seed
snp keygen generate --seed "<your-256-bit-hex>" --pubkey prod-pk.json --seckey prod-sk.json
```

### 2. Key Storage

**Protect secret keys immediately after generation:**

**On Windows:**
```powershell
# Restrict access to your user account only
icacls prod-sk.json /inheritance:r /grant:r "$env:USERNAME:F"
```

**On Linux/Mac:**
```bash
# Owner read/write only (600 permissions)
chmod 600 prod-sk.json
```

**Additional protection:**
- Store keys on encrypted filesystems (BitLocker, FileVault, LUKS)
- Consider hardware security modules (HSMs) for high-value keys
- Never store keys in cloud storage without encryption
- Add secret key patterns to `.gitignore`

### 3. Key Backup

**Backup strategy:**
- Store seed phrases in encrypted password managers (e.g., 1Password, Bitwarden)
- Use multiple encrypted backups in different physical locations
- For critical keys, use Shamir's Secret Sharing (split among trusted parties)
- Test recovery procedures regularly

**DO NOT:**
- Store seeds/keys in plain text files
- Email or message keys
- Screenshot keys
- Store in browser bookmarks or notes apps

### 4. Operational Security

**Key usage guidelines:**
- Use different keys for testing vs. production
- Rotate keys if compromise is suspected
- Never reuse compromised keys
- Audit key access regularly
- Minimize key exposure (use offline signing when possible)

**For air-gapped operations:**
1. Generate keys on air-gapped machine
2. Export public keys only
3. Create transactions on online machine
4. Sign transactions on air-gapped machine
5. Broadcast signatures from online machine

### 5. Key Lifecycle

```
Generate → Secure → Use → Backup → Monitor → Rotate/Destroy
```

**When to rotate keys:**
- Suspected compromise
- Employee departure (for organizational keys)
- Regular security schedule (e.g., annually)
- After security incidents

**When to destroy keys:**
- Confirmed compromise (after transitioning namespace to new key)
- End of lifecycle
- Deprecation of test keys

## Security Checklist

Before deploying to production:

- [ ] Generated keys on trusted/air-gapped machine
- [ ] Used high-entropy seed (256+ bits)
- [ ] Set restrictive file permissions (600/owner-only)
- [ ] Filesystem is encrypted
- [ ] Seed backed up to encrypted password manager
- [ ] Multiple backups in different locations
- [ ] Recovery procedure tested successfully
- [ ] Test keys destroyed (not reused for production)
- [ ] Secret key files added to `.gitignore`
- [ ] No secrets in git commit history
- [ ] Key rotation plan documented
- [ ] Team trained on key handling procedures

## Incident Response

### If Key Compromise is Suspected:

1. **Immediate actions:**
   - Stop using the compromised key immediately
   - Generate new keypair with fresh seed
   - Document incident (when, what, how)

2. **For Transferable/Delegable namespaces:**
   - Use `snp transition transfer` to move to new key
   - Use `snp transition delegate` to revoke old authority

3. **For Immutable/Sealed namespaces:**
   - Key compromise = namespace compromise
   - Create new namespace with new key
   - Migrate assets/references to new namespace

4. **Audit all artifacts:**
   - List all certificates issued with compromised key
   - List all transitions signed with compromised key
   - Revoke/reissue as necessary

5. **Post-incident:**
   - Determine root cause
   - Update procedures to prevent recurrence
   - Document lessons learned

## Common Pitfalls to Avoid

❌ **Never do this:**
- Store secret keys in git repositories
- Share secret keys via email/Slack/Discord/messaging apps
- Use weak seeds (like "password123", "test", or dictionary words)
- Reuse production keys for testing
- Generate keys on shared/compromised systems
- Leave secret key files world-readable
- Transmit keys over unencrypted connections
- Use cloud storage for unencrypted keys
- Trust online key generation services

✅ **Always do this:**
- Generate keys on YOUR machine (never remote services)
- Use high-entropy seeds (256+ bits)
- Set restrictive file permissions (600)
- Encrypt your filesystem
- Backup seeds in encrypted password manager
- Test key recovery procedures
- Rotate keys if compromise suspected
- Use different keys for test vs. production
- Verify all operations work offline

## Verification

### Verify Local-Only Operations

Disconnect from internet and run:
```bash
snp keygen generate --seed "offline-test" --pubkey pk.json --seckey sk.json
```

If this works without network access, it confirms:
- No remote key generation
- No phone-home
- Complete offline operation

### Verify File Permissions

**Windows:**
```powershell
icacls test-seckey.json
# Should show only your user account with Full control
```

**Linux/Mac:**
```bash
ls -la test-seckey.json
# Should show: -rw------- (owner read/write only)
```

### Verify No Secrets in Git

```bash
git log --all -p -S "SECRET" -S "PRIVATE" -S "KEY"
# Should return no matches for your actual secret keys
```

## Additional Resources

- [SECURITY.md](SECURITY.md) - Full SNP security model
- [specs/CRYPTO_PROFILE.md](specs/CRYPTO_PROFILE.md) - Cryptographic specifications
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [NIST Special Publication 800-57](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)

## Contact

For security vulnerabilities in SNP itself:
- Email: security@y3kdigital.com

---

**Remember: With great sovereignty comes great responsibility. Protect your keys!** 🔐
