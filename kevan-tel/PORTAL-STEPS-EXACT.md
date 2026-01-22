# 🎯 EXACT PORTAL STEPS - Follow This Screen by Screen

You're currently looking at the Number Settings for +1-321-485-8333. I can see it's routed to **xxxiii-voice** (SIP Connection). Here's how to fix it:

## Step 1: Enable Your eSIM First (Required)

### Why: The eSIM won't show in the connection dropdown until it's enabled.

1. **Leave this page** (you'll come back)
2. In the left sidebar, click **"SIM Cards"**
3. You'll see a list of SIM cards
4. Find ICCID: **89311210000005749297** (filter/search for "893112")
5. Click on that SIM card row
6. You'll see the SIM details page
7. Look for these controls:
   - **Status**: Currently shows "Blocked" or "Disabled"
   - Click the **"Enable"** or **"Unblock"** button
   - Toggle **"Voice Enabled"** to ON
   - Toggle **"Data Enabled"** to ON
8. Click **"Save"** or **"Update"**
9. **Wait 2-3 minutes** for the system to sync

## Step 2: Return to Number Settings

1. In left sidebar, click **"Phone Numbers"**
2. Click on **+1-321-485-8333** (the same number you had open)
3. You're back at the Number Settings page

## Step 3: Change the Connection (This is what you need to do!)

### On the page you showed me, scroll to the "Routing" section:

You'll see:
```
Routing
A connection or an application allows you to make calls on phone number.

[xxxiii-voice ▼]  <--- This dropdown needs to change!

+ New SIP Connection
```

### What to do:

1. **Click on the dropdown** that currently shows "xxxiii-voice"
2. The dropdown will open showing available connections
3. **Look for your eSIM** - it might show as:
   - "Telnyx SIM"
   - "89311210000005749297" (the ICCID)
   - Or something like "Wireless Connection"
4. **Select the eSIM** from the dropdown
5. **Scroll to the bottom** of the page
6. Click **"Save Changes"** or **"Update"**

## Step 4: Verify on iPhone

1. On your iPhone: **Settings → Cellular**
2. Tap on **"Telnyx"** (your eSIM)
3. Should now show: **+1 (321) 485-8333**
4. Toggle it **ON** if it's off
5. Turn **"This Line"** ON

## Step 5: Test It!

**Call +1-321-485-8333 from another phone**
- Your iPhone should ring natively! 🔔
- No apps needed
- Works like regular cellular

---

## ⚠️ If eSIM Doesn't Appear in Dropdown

This means the SIM isn't fully enabled yet:

1. Go back to **SIM Cards** page
2. Verify the SIM shows:
   - Status: **Enabled** (not blocked)
   - Voice: **Enabled** ✅
   - Data: **Enabled** ✅
3. **Wait 5 more minutes** (systems need to sync)
4. **Refresh** the Phone Numbers page
5. Try the dropdown again

---

## 🎥 VISUAL GUIDE

**What you're changing:**

BEFORE:
```
Routing: [xxxiii-voice ▼]  <-- SIP Connection (webhooks)
```

AFTER:
```
Routing: [Telnyx SIM ▼]  <-- Your eSIM (native calling)
```

---

## 💡 What This Does

**xxxiii-voice (Current)**:
- Routes to webhook server
- Requires tunnel/ngrok
- Can do authentication
- But requires apps/setup

**eSIM (What you need)**:
- Routes directly to your iPhone
- Native cellular calling
- No apps needed
- Just works like regular phone

---

## 🆘 Quick Check

Run this after changing:
```powershell
cd "c:\Users\Kevan\web3 true web3 rarity\kevan-tel"
.\verify-complete-setup.ps1
```

This will tell you if everything is configured correctly.

---

**Next**: After you enable the SIM and change the dropdown, your iPhone will be a working phone with +1-321-485-8333 as the number. That's it!
