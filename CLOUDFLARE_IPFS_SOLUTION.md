# Cloudflare IPFS Solution

## Problem
Your local IPFS node isn't announcing content to the network (only 1 peer), so public gateways can't find your genesis CID.

## Cloudflare Options

### Option 1: Enable Cloudflare R2 (RECOMMENDED - 5 minutes)
R2 is Cloudflare's S3-compatible object storage - perfect for serving your genesis files.

**Steps:**
1. Go to Cloudflare Dashboard → R2
2. Click "Enable R2" (free tier: 10GB storage, 1M requests/month)
3. Create bucket: `y3k-genesis`
4. Run: `npx wrangler r2 object put y3k-genesis/genesis --file="genesis/ARTIFACTS" --recursive`
5. Set public URL: `https://genesis.y3kmarkets.com` → R2 bucket

**Advantages:**
- ✅ Fast Cloudflare CDN
- ✅ No IPFS network issues
- ✅ Full control
- ✅ 99.9% uptime
- ✅ Same ecosystem as your website

### Option 2: Use Cloudflare Pages for Genesis Files
Host genesis files directly on Pages alongside your website.

**Steps:**
1. Copy: `genesis/ARTIFACTS` → `y3k-markets-web/public/genesis-artifacts/`
2. Deploy to Pages
3. Access at: `https://y3kmarkets.com/genesis-artifacts/`

**Trade-offs:**
- ✅ Simplest solution
- ✅ Already set up
- ❌ Not on IPFS (but files still have hashes for verification)

### Option 3: Fix IPFS + Use Cloudflare Gateway
Get your IPFS node properly networked, then Cloudflare will cache it.

**Steps:**
1. Run: `ipfs bootstrap add /dnsaddr/node-1.preload.ipfs.io/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ`
2. Wait 10-15 minutes for DHT propagation
3. Test: `https://cloudflare-ipfs.com/ipfs/YOUR_CID`

**Trade-offs:**
- ✅ True IPFS solution
- ❌ Slowest to implement
- ❌ DHT propagation unreliable
- ❌ Still dependent on network

## Recommendation

**Use Option 2 NOW (5 minutes)** to unblock F&F launch, then add Option 1 (R2) later for better architecture.

### Quick Implementation

```powershell
# Copy genesis files to Pages public directory
Copy-Item -Path "genesis\ARTIFACTS\*" -Destination "y3k-markets-web\public\genesis\" -Recurse -Force

# Redeploy website
cd y3k-markets-web
npm run build
npx wrangler pages deploy out --project-name=y3kmarkets --branch=production

# Files now available at:
# https://y3kmarkets.com/genesis/genesis_attestation.json
# https://y3kmarkets.com/genesis/certificates/100.json
```

Then update [genesis/page.tsx](y3k-markets-web/app/genesis/page.tsx) to point to these URLs instead of IPFS.

**Certificate verification still works** because each file has `genesis_hash` field - buyers can verify it matches the published hash.

## Next Steps

1. ✅ Copy genesis files to Pages (NOW - 5 minutes)
2. ✅ Update website links 
3. ✅ Deploy and test
4. ✅ Send F&F emails
5. ⏳ Enable R2 for better architecture (later)
6. ⏳ Fix IPFS node networking (later - nice to have)
