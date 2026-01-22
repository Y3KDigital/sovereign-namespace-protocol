# REPLIT DEPLOYMENT GUIDE - Y3K MARKETS

**Purpose**: Deploy the namespace issuance system to Replit for live access  
**Status**: Ready to deploy  
**Target**: Public URL for Trump/Brad/Don namespace claims

---

## STEP 1: CREATE REPLIT PROJECT

1. Go to https://replit.com
2. Click **+ Create Repl**
3. Select **Template**: Node.js
4. Name it: `y3k-markets-hub`
5. Click **Create Repl**

---

## STEP 2: UPLOAD PROJECT FILES

### Files to Upload (from `y3k-markets-web` folder)

**Copy these folders:**
```
app/
components/
lib/
public/
functions/
```

**Copy these files:**
```
package.json
package-lock.json
next.config.mjs
tailwind.config.ts
tsconfig.json
postcss.config.mjs
.gitignore
```

**Method 1 (Drag & Drop):**
- Zip the above folders/files locally
- Drag into Replit file explorer

**Method 2 (Git Import):**
- Click **Import from GitHub**
- Connect your `Y3KDigital/sovereign-namespace-protocol` repo
- Select `y3k-markets-web` as root

---

## STEP 3: CONFIGURE ENVIRONMENT SECRETS

In Replit, click **🔒 Secrets** (left sidebar) and add:

### Required Secret
```
TELNYX_API_KEY
```
**Value**: `[INSERT YOUR NEW ROTATED KEY HERE]`

⚠️ **CRITICAL**: Use your NEW key, not the compromised one.

---

## STEP 4: UPDATE PACKAGE.JSON

Replit needs a specific start command. Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  }
}
```

---

## STEP 5: CREATE `.replit` CONFIG

Create a file called `.replit` in the root:

```toml
run = "npm run build && npm start"
hidden = [".next", "node_modules"]

[nix]
channel = "stable-22_11"

[deployment]
run = ["npm", "run", "start"]
deploymentTarget = "cloudrun"
```

---

## STEP 6: INSTALL DEPENDENCIES

In Replit Shell, run:

```bash
npm install
```

Wait for all packages to install.

---

## STEP 7: BUILD THE PROJECT

```bash
npm run build
```

This compiles Next.js for production.

---

## STEP 8: START THE SERVER

Click the **Run** button at the top of Replit.

You should see:
```
✓ Ready in X ms
- Local: http://0.0.0.0:3000
```

---

## STEP 9: GET YOUR PUBLIC URL

Replit will automatically generate a URL like:
```
https://y3k-markets-hub.yourname.repl.co
```

Copy this URL.

---

## STEP 10: UPDATE CLAIM LINKS

Your claim links will now be:

### Trump Namespaces (Auction Reserve)
- `https://y3k-markets-hub.yourname.repl.co/claim?token=trump`
- `https://y3k-markets-hub.yourname.repl.co/claim?token=don`

### Partner Don (77.x)
- `https://y3k-markets-hub.yourname.repl.co/claim?token=don77`

### Brad Parscale
- `https://y3k-markets-hub.yourname.repl.co/claim?token=brad`
- `https://y3k-markets-hub.yourname.repl.co/claim?token=brad45`

### Rogue Reserve
- `https://y3k-markets-hub.yourname.repl.co/claim?token=rogue`

---

## STEP 11: TEST NAMESPACE VERIFICATION

Open each URL in your browser and verify:

1. ✅ Namespace displays correctly
2. ✅ Certificates listed properly
3. ✅ Key generation works
4. ✅ No errors in browser console

---

## STEP 12: ACCESS TRANSMISSION HUB

Your Hub (where you send invites) will be at:
```
https://y3k-markets-hub.yourname.repl.co
```

Login with passkey: `77`

---

## STEP 13: UPDATE API TRANSMIT ROUTE

The SMS API needs to generate correct links. Update this line in:

**File**: `app/api/admin/transmit/route.ts`  
**Line 26-27**:

```typescript
// Change from:
const claimLink = `https://y3k.market/claim?token=${token}`;

// To:
const claimLink = `https://y3k-markets-hub.yourname.repl.co/claim?token=${token}`;
```

**File**: `functions/api/admin/transmit.ts`  
**Line 25**:

```typescript
// Change from:
const claimLink = `https://y3kmarkets.com/claim?token=${token}`;

// To:
const claimLink = `https://y3k-markets-hub.yourname.repl.co/claim?token=${token}`;
```

---

## STEP 14: REBUILD & RESTART

After updating the claim links:

```bash
npm run build
```

Then click **Run** again.

---

## STEP 15: SEND TEST TRANSMISSION

1. Open your Replit URL
2. Login with passkey `77`
3. Enter test data:
   - **Target**: `Test User`
   - **Phone**: `+1XXXXXXXXXX` (your own number for testing)
   - **Tier**: `Sovereign Operator`
4. Click **FIRE TRANSMISSION**
5. Check your phone for SMS
6. Click the link in the SMS
7. Verify the claim page loads

---

## TROUBLESHOOTING

### Error: "Module not found"
```bash
npm install
npm run build
```

### Error: "TELNYX_API_KEY not found"
- Check Secrets tab in Replit
- Make sure key name is exact: `TELNYX_API_KEY`
- No spaces, no quotes

### Error: "Port 3000 already in use"
- Click **Stop** button
- Wait 5 seconds
- Click **Run** again

### Claim page shows 404
- Make sure `app/claim/page.tsx` exists
- Rebuild: `npm run build`

---

## PRODUCTION CHECKLIST

Before sending to VIPs:

- [ ] All claim URLs tested and working
- [ ] SMS transmission tested to your own phone
- [ ] Hub login working (passkey: `77`)
- [ ] TELNYX_API_KEY secret set correctly
- [ ] No console errors in browser
- [ ] Mobile view tested (responsive UI)
- [ ] Truth layer privacy confirmed (no real names exposed)

---

## ALTERNATIVE: QUICK DEPLOY BUTTON

If manual upload is too slow, I can create a GitHub repo with a **Deploy to Replit** button that does all this in one click.

Let me know if you want that instead.

---

## NEXT STEPS

Once deployed on Replit:

1. Test all 6 namespace claim URLs
2. Test SMS transmission to your phone
3. Verify returned namespace data
4. Review keys generated
5. Confirm ready for live issuance

**Then**: Provide phone numbers for Don, Brad, and we hold Trump namespaces for auction.
