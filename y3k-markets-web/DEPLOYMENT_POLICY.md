# Deployment Policy - Y3K Markets

## Law: Deterministic Deployment Only

**If it's not in `out/mint/index.html`, it does not exist.**

This system uses deterministic deployment to ensure absolute verification and prevent cache-related regressions.

## Production Deployment - ONLY Allowed Method

```powershell
.\scripts\force-deploy.ps1
```

**DO NOT** use any of these for production:
- ❌ `npm run build`
- ❌ `npm run pages:deploy`
- ❌ `next build`
- ❌ Direct `wrangler pages deploy`

## Why This Matters

### The Cache Problem
Next.js static export reuses cached page artifacts even after standard clean operations. This causes:
- Users see old UI (Stripe, email fields, `.x` notation) after deployment
- Source code is correct but output is stale
- Standard build commands cannot be trusted

### The Solution
`force-deploy.ps1` enforces determinism through:

1. **Nuclear Clean**: Removes ALL cache (`.next`, `.wrangler`, `out`, `node_modules/.cache`)
2. **Source Verification**: Runs `verify-sovereign.js` to check 6 critical requirements
3. **Fresh Build**: Uses `npx next build --no-lint` (bypasses npm wrappers)
4. **Output Verification**: Checks actual `out/mint/index.html` for version stamp AND build hash
5. **Deployment**: Only proceeds if HTML verification passes
6. **Proof**: Displays build hash for deployment traceability

## Verification Levels

### Level 1: Source Code (verify-sovereign.js)
Checks that `MintClient.tsx` contains:
- ✅ No email input fields
- ✅ No Stripe/fiat payment references
- ✅ Letter 'x' validation (`[a-wyz0-9]`)
- ✅ Client-side Ed25519 key generation
- ✅ Version stamp (v2.1.1 Sovereign)
- ✅ Build hash (7-character git commit)

### Level 2: HTML Output (force-deploy.ps1 verification)
Checks that `out/mint/index.html` contains:
- ✅ Version: `v2.1.1 Sovereign`
- ✅ Build hash: `Hash: [a-f0-9]{7}`

If either verification fails, deployment is **BLOCKED**.

## Build Hash System

Every deployment has a unique, cryptographic identifier:

**Git Repository (Preferred)**:
```bash
git rev-parse --short HEAD  # e.g., 71fb75f
```

**Non-Git Fallback**:
```bash
# Timestamp-based hash (last 7 digits)
```

### Why Build Hashes?

**Scenario**: User reports "I'm still seeing Stripe"

**Without hash**:
- Agent: "Are you sure you refreshed?"
- User: "Yes, I did Ctrl+F5"
- Agent: "Let me check the deployment..."
- **Result**: 10 minutes of debugging, unclear if it's cache or deployment issue

**With hash**:
- Agent: "What build hash do you see in the footer?"
- User: "71fb75f"
- Agent: "That's the latest sovereign build. Please hard refresh (Ctrl+Shift+R)."
- **OR**: User: "I don't see a hash"
- Agent: "You're cached. That's v2.0 (old). Do a hard refresh."
- **Result**: 30 seconds, issue immediately identified

### Hash Display

Footer of `/mint` page:
```
v2.1.1 Sovereign
Build: Jan 22, 2026 • Hash: 71fb75f
```

Terminal output during deployment:
```
[SUCCESS] DEPLOYMENT COMPLETE

Deployed version: v2.1.1 Sovereign
Build hash: 71fb75f
Date: Jan 22, 2026
```

## When to Deploy

Deploy ONLY when:
- New features complete and tested locally
- Sovereign verification passes (`node scripts/verify-sovereign.js`)
- Git commit has meaningful message
- You're ready to update the build hash (users will see new hash immediately)

## Post-Deployment Verification

1. Visit `https://y3kmarkets.pages.dev/mint`
2. Check footer shows correct hash
3. Verify no cache headers allow old content
4. Test namespace input (letters except 'x', numbers allowed)
5. Verify no email fields visible
6. Verify payment options show crypto only (BTC, ETH, USDC, USDT)

## Emergency Rollback

If deployment breaks:

```powershell
# 1. Revert git commit
git revert HEAD
git push

# 2. Force redeploy
.\scripts\force-deploy.ps1

# 3. Verify new hash in footer
```

## Developer Workflow

### Daily Development
```powershell
# Use fresh dev server (clears cache each start)
npm run dev:fresh
```

### Pre-Deployment Check
```powershell
# Verify sovereign requirements
node scripts/verify-sovereign.js

# If pass, ready for force-deploy
.\scripts\force-deploy.ps1
```

### Build Hash Changes
Every git commit changes the hash:
```bash
git commit -m "Add subdomain dashboard"
# New hash generated: 8a3f92c (example)

.\scripts\force-deploy.ps1
# Deploys with hash: 8a3f92c
```

## Philosophy

> **"The rules are enforced, the UX matches the promise, the deployment is deterministic, the system resists regression. That's no longer a prototype. That's infrastructure."**

This policy ensures:
- **Determinism**: Same source = same output, every time
- **Traceability**: Every deployment has cryptographic identifier
- **Verification**: Users can prove which build they're seeing
- **Sovereignty**: No ambiguity, no hidden state, no trust required

## Related Documentation

- [BUILD_AUTOMATION.md](./BUILD_AUTOMATION.md) - Build script details
- [SECURITY.md](../SECURITY.md) - Security practices
- [KEY_SECURITY.md](../KEY_SECURITY.md) - Key management
