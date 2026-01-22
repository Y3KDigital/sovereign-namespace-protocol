# Y3K Build Automation Guide

## 🚀 Quick Commands

### Development

```bash
# Standard dev server
npm run dev

# Fresh dev server (clears cache first)
npm run dev:fresh
```

### Production Builds

```bash
# Standard build
npm run build

# Clean build (clears cache first)
npm run build:clean

# Sovereign build (verifies + cleans + builds)
npm run build:sovereign
```

### Deployment

```bash
# Full sovereign deployment (recommended)
npm run pages:deploy

# Manual PowerShell sovereign build
.\scripts\sovereign-build.ps1
```

## 🛡️ Sovereign Build Process

The `build:sovereign` and `pages:deploy` commands automatically:

1. **Verify** - Checks that MintClient.tsx contains:
   - No email input field
   - No Stripe/fiat payment references
   - Correct `[a-wyz0-9]` validation (blocks letter 'x')
   - Client-side Ed25519 key generation
   - Version stamp with date

2. **Clean** - Removes `.next` cache directory

3. **Build** - Runs Next.js production build

4. **Deploy** (pages:deploy only) - Pushes to Cloudflare Pages

## 🔍 Manual Verification

If you need to verify without building:

```bash
node scripts/verify-sovereign.js
```

## 🧹 Manual Cache Clear

If you need to clear cache without building:

```bash
node scripts/clean-cache.js
```

## ⚠️ Cache Issues?

If you see old UI after changes:

1. Stop the dev server (Ctrl+C)
2. Run: `npm run dev:fresh`
3. Hard refresh browser (Ctrl+F5)
4. Check version stamp at bottom of mint page

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build:sovereign` locally
- [ ] Verify all checks pass
- [ ] Test `/mint` page locally
- [ ] Confirm version stamp shows current date
- [ ] Hard refresh browser to verify no cache

## 🔒 Why This Matters

The Sovereign mint flow is critical infrastructure:
- No email collection (true privacy)
- No fiat payment rails (no Stripe/banks)
- Client-side key generation (zero-knowledge)
- Letter 'x' reserved for protocol notation

**Any deviation from these requirements breaks the trust model.**

The automation ensures these requirements are locked in and verified before every deployment.
