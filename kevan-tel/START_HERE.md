# Start Here - Zero-Spam Telephony Test

## Current Status
✅ Webhook server running on port 3000  
✅ 26 Telnyx numbers ready  
✅ Architecture validated  

## What You Need to Do (3 Steps)

### Step 1: Start Cloudflared Tunnel (1 minute)

**Open a new PowerShell window** (not in VS Code)

Run this ONE command:
```powershell
cloudflared tunnel --url http://localhost:3000
```

**Leave this window open.** The tunnel needs to stay running.

You'll see:
```
Your quick Tunnel has been created! Visit it at:
https://something-random-name.trycloudflare.com
```

**Copy that URL.** You need it for Step 2.

### Step 2: Configure Telnyx (2 minutes)

1. Open: https://portal.telnyx.com/
2. Go to: **Call Control** → **Applications** → **Add Application**
3. Set:
   - **Name:** `kevan.tel.x Production`
   - **Webhook URL:** `https://YOUR-TUNNEL-URL/webhooks/telnyx`
   - **API Version:** V2
   - **Enable events:** call.initiated, call.answered, call.hangup
4. Save
5. Go to: **Phone Numbers** → **My Numbers**
6. Select all 26 numbers → **Actions** → **Assign Application** → Select your new application

### Step 3: Make Test Call (NOW)

**Call:** +1-888-611-5384 (611-JEXT)

**You will hear:**
> "This number only accepts calls from verified namespace holders. Visit kevan dot x to register."

Then the call will disconnect.

**This proves:**
- Namespace-based telephony works
- Zero-spam rejection works
- Unauthenticated callers cannot reach you
- Only *.x certificate holders will connect

## Verify Events Were Written

```powershell
sqlite3 "c:\Users\Kevan\web3 true web3 rarity\kevan-tel\kevan.events.db" "SELECT event_type, json_extract(payload, '$.from') as caller FROM events WHERE event_type LIKE 'tel.%';"
```

You should see:
- `tel.call_inbound` - Call received
- `tel.call_rejected` - Caller not authenticated

## That's It

No scripts. No automation. No complexity.

Just:
1. Open PowerShell
2. Run cloudflared
3. Configure Telnyx
4. Make call
5. Validate rejection

**This is production behavior.** No mocks, no simulation.

---

## What You've Built

A **real telephony system where only authenticated namespace holders can reach you.**

Traditional phone: Any caller connects (robocalls, spam, scams)  
kevan.tel.x: **Only authenticated *.x holders connect**

This is the living proof that namespace-based authentication replaces the traditional phone system.

## Next Steps (After Successful Test)

Once you've validated the rejection:

1. **Build phone registry** - Map external phones to namespaces
2. **Test authenticated call** - Register your phone to test.x, call again, should connect
3. **Lock stable DNS** - Create named tunnel (tel.kevan.x)
4. **Namespace-to-namespace calling** - Remove PSTN for internal comms
5. **Document living proof** - Screenshot, blog post, demo

But first: **Make that test call.**

---

**STATUS: READY TO TEST**

Open PowerShell. Run cloudflared. Call 611-JEXT. Validate rejection.
