# EMERGENCY: IPFS PINATA UPLOAD

## CRITICAL ISSUE
- Public IPFS gateways timing out (504 errors)
- Local node has only 1 peer (insufficient)
- Buyers cannot verify genesis artifacts
- **This blocks F&F launch verification**

## IMMEDIATE ACTION: Pin to Pinata

### Step 1: Sign up for Pinata (if not already)
- Go to: https://pinata.cloud
- Free tier: 1GB storage (more than enough for 955 certificates)
- Get API key from account settings

### Step 2: Upload Genesis Directory

**Option A: Use Pinata Web Interface (Fastest)**
1. Log into Pinata
2. Click "Upload" → "Folder"
3. Select: `c:\Users\Kevan\web3 true web3 rarity\genesis\ARTIFACTS`
4. Wait for upload to complete
5. Copy the CID from Pinata dashboard

**Option B: Use Pinata API**
```powershell
# We can script this if you provide Pinata API key
```

### Step 3: Verify New Pin

The CID should be THE SAME:
```
bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e
```

If it's different, we have a problem.

### Step 4: Test Pinata Gateway

Once uploaded, test these URLs:
- https://gateway.pinata.cloud/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e/
- https://gateway.pinata.cloud/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e/genesis_attestation.json

These should load FAST and RELIABLY.

## Why This Fixes It

✅ Pinata has dedicated infrastructure
✅ Multiple redundant gateway servers
✅ Fast CDN-backed delivery
✅ 99.9% uptime SLA
✅ Professional pinning service used by major NFT projects

## What Happens Next

1. Pinata hosts the canonical copy
2. Your local node becomes backup only
3. Website links use Pinata gateway
4. Buyer verification guide updated with Pinata links
5. All verification works reliably

## Timeline

**URGENT:** Do this in next 30 minutes before F&F emails go out.

If buyers try to verify and get 504 errors, you'll have major support issues.

---

## Ready?

1. Go to Pinata.cloud
2. Sign up / log in
3. Upload the ARTIFACTS folder
4. Tell me the upload status

I'll verify the CID and update all links immediately.
