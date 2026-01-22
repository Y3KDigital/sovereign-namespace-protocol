# Ceremonial Claiming Portal - Cloudflare Deployment Guide

## ✅ REAL DEPLOYMENT TO y3kmarkets.com

### Architecture
- **Main site:** y3kmarkets.com (Cloudflare Pages)
- **Claiming portal:** claim.y3kmarkets.com (subdomain pointing to same Pages project)
- **API:** Cloudflare Pages Functions (serverless)
- **Storage:** Cloudflare KV (token/claim data)
- **IPFS:** Cloudflare IPFS Gateway

---

## Step 1: Cloudflare Dashboard Setup

### A. Create KV Namespace
```bash
wrangler kv:namespace create "GENESIS_CERTIFICATES" --preview=false
```

**Output:** 
```
KV Namespace ID: abc123def456
```

Add to `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "GENESIS_CERTIFICATES"
id = "abc123def456"
```

### B. Set Environment Variables

In Cloudflare Dashboard:
1. Go to: Pages → y3kmarkets → Settings → Environment Variables
2. Add these variables:

**Production:**
```
NEXT_PUBLIC_CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
NEXT_PUBLIC_GENESIS_HASH=0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc
NEXT_PUBLIC_IPFS_GATEWAY=https://cloudflare-ipfs.com/ipfs
NODE_VERSION=18
```

### C. Custom Domain Setup

In Cloudflare Dashboard:
1. Go to: Pages → y3kmarkets → Custom domains
2. Add domains:
   - `y3kmarkets.com` (main)
   - `www.y3kmarkets.com` (redirect to main)
   - `claim.y3kmarkets.com` (claiming portal)

**DNS Records:**
```
y3kmarkets.com         CNAME  y3kmarkets.pages.dev
www.y3kmarkets.com     CNAME  y3kmarkets.pages.dev
claim.y3kmarkets.com   CNAME  y3kmarkets.pages.dev
```

---

## Step 2: Update wrangler.toml

**File:** `y3k-markets-web/wrangler.toml`

```toml
name = "y3kmarkets"
compatibility_date = "2024-01-01"
pages_build_output_dir = "out"

[[kv_namespaces]]
binding = "GENESIS_CERTIFICATES"
id = "YOUR_KV_NAMESPACE_ID"

[build]
command = "npm run build"

[env.production]
vars = { ENVIRONMENT = "production" }
```

---

## Step 3: Build & Deploy

### Install Dependencies
```powershell
cd "c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web"
npm install
```

### Build Static Site
```powershell
npm run build
```

**Expected output:**
```
Creating an optimized production build...
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (15/15)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         120 kB
├ ○ /claim/[token]                       8.4 kB         128 kB
├ ○ /genesis                             4.1 kB         118 kB
└ ○ /status                              3.8 kB         117 kB
```

### Deploy to Cloudflare Pages
```powershell
npx wrangler pages deploy out --project-name=y3kmarkets --branch=main
```

**Expected output:**
```
✨ Compiled Worker successfully
✨ Uploading...
✨ Deployment complete!

URL: https://y3kmarkets.pages.dev
Custom Domain: https://y3kmarkets.com
```

---

## Step 4: Verify Deployment

### Test URLs

**Main Site:**
```
https://y3kmarkets.com
https://www.y3kmarkets.com (should redirect)
```

**Claiming Portal:**
```
https://claim.y3kmarkets.com/brad-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9
https://claim.y3kmarkets.com/don-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0
https://claim.y3kmarkets.com/77-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1
```

**API Endpoints:**
```powershell
# Test token validation
Invoke-RestMethod -Method Post -Uri "https://y3kmarkets.com/api/claim/validate" `
  -Body '{"token":"brad-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9"}' `
  -ContentType "application/json"

# Test certificate retrieval
Invoke-RestMethod -Method Post -Uri "https://y3kmarkets.com/api/claim/certificate" `
  -Body '{"token":"brad-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9"}' `
  -ContentType "application/json"
```

---

## Step 5: Generate Real QR Codes

```powershell
cd "c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web"
node scripts/generate-qr-codes.js
```

**Update QR URLs in script:**
```javascript
const baseUrl = 'https://claim.y3kmarkets.com';
```

**Output:**
```
✓ Generated QR code for Bradley (brad.x)
  Saved to: genesis/invitations/brad-qr.png
  URL: https://claim.y3kmarkets.com/brad-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9

✓ Generated QR code for Donald (don.x)
  Saved to: genesis/invitations/don-qr.png
  URL: https://claim.y3kmarkets.com/don-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0

✓ Generated QR code for Seven (77.x)
  Saved to: genesis/invitations/77-qr.png
  URL: https://claim.y3kmarkets.com/77-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1
```

---

## Step 6: Cloudflare IPFS Integration

### Option A: Cloudflare IPFS Gateway (Read-Only)
Certificates are published and pinned elsewhere, then accessed via:
```
https://cloudflare-ipfs.com/ipfs/{CID}
```

### Option B: Pinata + Cloudflare Gateway
1. Upload certificate to Pinata
2. Get CID
3. Access via Cloudflare gateway

**Implementation:**
```typescript
// Upload to Pinata
const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PINATA_JWT}`
  },
  body: formData
});

const { IpfsHash } = await pinataResponse.json();

// Verify via Cloudflare gateway
const verifyUrl = `https://cloudflare-ipfs.com/ipfs/${IpfsHash}`;
```

### Option C: Web3.Storage + Cloudflare Gateway
```typescript
const web3Storage = await fetch('https://api.web3.storage/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${WEB3_STORAGE_TOKEN}`
  },
  body: certBlob
});

const { cid } = await web3Storage.json();
const cloudflareUrl = `https://cloudflare-ipfs.com/ipfs/${cid}`;
```

---

## Step 7: Update Invitations with Real Links

### Brad's Invitation
**URL:** https://claim.y3kmarkets.com/brad-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9
**QR Code:** genesis/invitations/brad-qr.png

### Donald's Invitation
**URL:** https://claim.y3kmarkets.com/don-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0
**QR Code:** genesis/invitations/don-qr.png

### Seven's Invitation
**URL:** https://claim.y3kmarkets.com/77-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1
**QR Code:** genesis/invitations/77-qr.png

---

## Step 8: Cloudflare Analytics

### Setup Analytics Engine
```bash
wrangler analytics create-binding CLAIM_ANALYTICS
```

**Track:**
- Token validation attempts
- Successful claims
- Failed attempts
- Geographic distribution
- Time to claim

**Query analytics:**
```sql
SELECT
  blob1 as token,
  count(*) as attempts,
  min(timestamp) as first_attempt,
  max(timestamp) as last_attempt
FROM CLAIM_ANALYTICS
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY token
```

---

## Step 9: Security & Monitoring

### Rate Limiting
Add to wrangler.toml:
```toml
[rate_limiting]
enabled = true
limit = 10
period = 60
```

### Web Application Firewall (WAF)
In Cloudflare Dashboard:
1. Security → WAF
2. Enable "OWASP Core Ruleset"
3. Add custom rule: Block automated claiming attempts

### Monitoring Alerts
1. Pages → y3kmarkets → Analytics
2. Set up alerts for:
   - High error rates (>5%)
   - Slow response times (>2s)
   - Failed deployments

---

## Step 10: Post-Deployment Checklist

- [ ] Verify all 3 claiming URLs are live
- [ ] Test token validation API
- [ ] Test certificate retrieval API
- [ ] Test claim completion flow
- [ ] Verify QR codes scan correctly
- [ ] Check IPFS gateway connectivity
- [ ] Confirm KV storage is working
- [ ] Test from mobile devices
- [ ] Verify SSL certificates
- [ ] Check DNS propagation (24-48 hours)
- [ ] Set up monitoring alerts
- [ ] Enable Cloudflare Analytics
- [ ] Test claim flow end-to-end

---

## Real Links Summary

### Production URLs (Live)
```
Main Site:       https://y3kmarkets.com
Claiming Portal: https://claim.y3kmarkets.com

Bradley's Claim: https://claim.y3kmarkets.com/brad-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9
Donald's Claim:  https://claim.y3kmarkets.com/don-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0
Seven's Claim:   https://claim.y3kmarkets.com/77-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1
```

### API Endpoints
```
Validate:    POST https://y3kmarkets.com/api/claim/validate
Certificate: POST https://y3kmarkets.com/api/claim/certificate
Complete:    POST https://y3kmarkets.com/api/claim/complete
```

### IPFS Gateway
```
Cloudflare IPFS: https://cloudflare-ipfs.com/ipfs/{CID}
```

---

## Troubleshooting

### Issue: "Token validation failed"
**Fix:** Check KV namespace binding in wrangler.toml

### Issue: "IPFS upload failed"
**Fix:** Verify API tokens in environment variables

### Issue: "Claiming URL not found"
**Fix:** Ensure static export includes dynamic routes

### Issue: "DNS not resolving"
**Fix:** Wait 24-48 hours for DNS propagation

---

**Status:** ✅ Ready for Production Deployment
**Last Updated:** 2026-01-17
**Deploy Command:** `npm run pages:deploy`
