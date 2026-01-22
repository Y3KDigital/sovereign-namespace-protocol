# WEBSITE DEPLOYMENT - CLOUDFLARE PAGES

**Target:** y3kmarkets.pages.dev  
**Status:** Ready for deployment with genesis data

---

## Environment Variables (Set in Cloudflare Dashboard)

Navigate to: Cloudflare Dashboard → Pages → y3kmarkets → Settings → Environment Variables

### Production Variables

```bash
NEXT_PUBLIC_GENESIS_HASH=0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc
NEXT_PUBLIC_GENESIS_IPFS_CID=bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e
NEXT_PUBLIC_TOTAL_ROOTS=955
NEXT_PUBLIC_CEREMONY_TIMESTAMP=2026-01-16T18:20:10-05:00
NEXT_PUBLIC_FF_START=2026-01-16T20:00:00-05:00
NEXT_PUBLIC_FF_ACTIVE=true
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs
```

---

## Deployment Command

```powershell
cd "c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web"

# Build with environment variables
npm run build
# or
npx next build

# Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=y3kmarkets --branch=main --commit-dirty=true
```

---

## Expected Deployment URL

```
https://y3kmarkets.pages.dev
```

OR custom domain if configured:
```
https://y3kmarkets.com
```

---

## What Will Display

### Homepage Banner
```
🟢 LIVE: Genesis Complete
955 immutable roots available
[View Genesis] [Mint Now]
```

### Genesis Section
- Genesis Hash: 0x6787f932...4096fc
- Total Roots: 955
- IPFS Verification: [Link to IPFS]
- Ceremony: 2026-01-16

### Mint Page
- Available roots: 900 (public tier)
- Friends & Family: Active badge
- Genesis Founder: Special designation

---

## Verification After Deployment

Test these URLs:

1. **Homepage:** https://y3kmarkets.pages.dev
2. **Genesis page:** https://y3kmarkets.pages.dev/genesis
3. **Mint flow:** https://y3kmarkets.pages.dev/mint
4. **F&F portal:** https://y3kmarkets.pages.dev/friends-family
5. **API health:** https://y3kmarkets.pages.dev/api/health

Expected results:
- Genesis hash visible
- IPFS CID displays correctly
- No "TO_BE_PUBLISHED" placeholders
- Mint button functional
- Stripe integration works

---

## Rollback Plan (if needed)

If deployment has issues:

```powershell
# Deploy previous version
cd y3k-markets-web
git log --oneline -n 5
# Find previous commit hash
npx wrangler pages deployment list --project-name=y3kmarkets
# Promote previous deployment
```

OR set environment variable:
```
NEXT_PUBLIC_GENESIS_LIVE=false
```

This will hide genesis data until ready.
