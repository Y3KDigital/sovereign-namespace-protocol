# 📱 iPhone Setup for kevan.tel.x Namespace

## Device: iPhone 11 Pro Max (Unykorn)
**IMEI:** 35285211282235  
**Current Carrier:** T-Mobile  
**Purpose:** Canonical kevan.x namespace owner device

---

## 🎯 SETUP STRATEGY

Since your Unykorn system (25 numbers) already works with Telnyx, we'll replicate that configuration for this iPhone.

### Two Approaches:

---

## ✅ OPTION 1: Telnyx Mobile App (Recommended - Fastest)

### Step 1: Reset iPhone
```
Settings → General → Reset → Erase All Content and Settings
```

### Step 2: Install Telnyx App
- Download "Telnyx" from App Store
- Sign in with Telnyx account (or create one)

### Step 3: I'll Create SIP Credentials
```powershell
# Run this on your PC - I'll generate credentials
# Will create: username, password, SIP server
```

### Step 4: Configure in Telnyx App
- Add SIP account
- Enter credentials from Step 3
- Enable push notifications for incoming calls

### Step 5: Assign Number
- Port your personal number (+1-321-278-8323) from T-Mobile to Telnyx
- OR use new Telnyx number
- Route to this SIP credential

### Step 6: Test
- Call the number from another phone
- iPhone rings via Telnyx app
- Answer - you're live!

---

## ✅ OPTION 2: Port Your T-Mobile Number Directly

### Step 1: Number Port Request
We submit port request to move +1-321-278-8323 from T-Mobile to Telnyx:
- Account number from T-Mobile
- PIN/Password
- Billing name/address

### Step 2: While Port Pending (3-5 days)
- Reset iPhone
- Install Telnyx app
- Test with temporary number

### Step 3: After Port Completes
- Your iPhone keeps same number (+1-321-278-8323)
- Now managed by Telnyx
- Routes through namespace authentication

---

## 📋 WHAT I NEED FROM YOU

**To proceed, tell me which approach:**

### If Option 1 (Telnyx App):
Reply: **"APP"**
- I'll create SIP credentials now
- You install app after reset
- Live in ~30 minutes

### If Option 2 (Port Number):
Reply: **"PORT"**
- I need T-Mobile account info
- Takes 3-5 business days
- Permanent solution

### If Using Different Number:
Reply: **"NEW"**
- I'll provision fresh Telnyx number
- Assign to iPhone
- Test immediately

---

## 🔧 TECHNICAL DETAILS (After Setup)

Once iPhone is configured:

### Phone Registry Entry
```json
{
  "+13212788323": {
    "namespace": "kevan.x",
    "device": "iPhone 11 Pro Max",
    "imei": "35285211282235",
    "certificate_fingerprint": "kevan.x.genesis.01",
    "auth_level": "owner"
  }
}
```

### Namespace Authentication Flow
1. Incoming call to your number
2. Webhook server checks phone registry
3. Finds: +13212788323 → kevan.x (authenticated)
4. Call connects to iPhone
5. Non-namespace calls rejected

### Making Calls
- Open Telnyx app
- Dial any number
- Outgoing calls show your kevan.tel.x number
- Spam risk significantly reduced

---

## ⚡ QUICK START (If You Want to Test Now)

**Before reset**, you can test with Telnyx app on current phone:

1. Install Telnyx app from App Store
2. I'll generate test SIP credentials
3. You add to app
4. I'll assign +1-321-485-8333 (our test number)
5. Test call flow
6. **Then** reset and do permanent setup

---

## 🚀 NEXT STEP

**Reply with ONE WORD:**

- **"APP"** - Use Telnyx app (fastest)
- **"PORT"** - Port your T-Mobile number (permanent)
- **"NEW"** - Get new Telnyx number
- **"TEST"** - Try it now before reset

I'll provide exact commands and credentials for whichever you choose.
