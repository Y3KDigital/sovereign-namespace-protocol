# Quick Start: Telnyx Configuration & Test Call

## ⚡ Your Live Webhook URL
```
https://jeff-effective-charm-face.trycloudflare.com/webhooks/telnyx
```

## 🚀 Quick Steps (5 Minutes)

### 1. Configure Telnyx (2 minutes)

**Open:** https://portal.telnyx.com/

**Steps:**
1. Click **Call Control** → **Applications**
2. Click **Add Application** (blue button top-right)
3. Fill in:
   - **Name:** `kevan.tel.x Production`
   - **Webhook URL:** `https://jeff-effective-charm-face.trycloudflare.com/webhooks/telnyx`
   - **Webhook API Version:** V2
   - **Enable events:** ✅ call.initiated, ✅ call.answered, ✅ call.hangup
4. Click **Save**
5. Go to **Phone Numbers** → **My Numbers**
6. Select ALL 26 numbers (checkboxes)
7. Click **Actions** → **Assign Application**
8. Choose `kevan.tel.x Production`
9. Click **Apply**

### 2. Start Monitoring (30 seconds)

**In PowerShell (kevan-tel directory):**
```powershell
cd "c:\Users\Kevan\web3 true web3 rarity\kevan-tel"
.\monitor-webhooks.ps1
```

This will show:
- ✅ Server status
- 📞 Recent call events
- 📊 Call statistics
- 📋 Live webhook logs

### 3. Make Test Call (NOW!)

**Call:** +1-888-611-5384 (611-JEXT)

**Expected:**
1. Call connects to Telnyx
2. Webhook received by your server
3. Server checks: Does caller have *.x? → NO
4. You hear: *"This number only accepts calls from verified namespace holders. Visit kevan dot x to register."*
5. Call rejected (busy signal)
6. Monitor shows:
   - `tel.call_inbound` event
   - `tel.call_rejected` event
   - Rejection logged

### 4. Verify Success

**In monitor window, you should see:**
```
📞 Recent Call Events:
───────────────────────────────────────────────────────────
  [2026-01-17 03:05:18] tel.call_inbound from +15551234567
  [2026-01-17 03:05:19] tel.call_rejected from +15551234567 → Rejected

📈 Call Statistics:
───────────────────────────────────────────────────────────
  📞 tel.call_inbound: 1
  🚫 tel.call_rejected: 1
```

## 📞 Test Numbers

| Number | Vanity | Best For |
|--------|--------|----------|
| +1-888-611-5384 | 611-JEXT | Primary test |
| +1-770-230-0635 | | Geographic |
| +1-888-474-8738 | 474-TREE | Easy to remember |
| +1-888-676-2825 | 676-DUCK | Fun |

## 🎯 What This Proves

✅ **Namespace-based telephony works**
- Traditional: Any caller reaches you (spam/robocalls/scams)
- kevan.tel.x: Only authenticated *.x holders connect

✅ **Zero-spam architecture operational**
- Unauthenticated callers rejected automatically
- TTS rejection message plays
- Events written to immutable log

✅ **Cryptographic authentication replaces caller ID**
- Certificate signature required
- No spoofing possible
- Trust model: Namespace not phone number

## 🔧 Troubleshooting

### "No webhook received"
```powershell
# Check server is running
Invoke-RestMethod -Uri "http://localhost:3000/health"

# Check tunnel URL is correct in Telnyx
# Should be: https://jeff-effective-charm-face.trycloudflare.com/webhooks/telnyx
```

### "Call doesn't connect"
- Verify numbers assigned to application in Telnyx portal
- Check application has webhook URL configured
- Ensure webhook events are enabled

### "Can't hear rejection message"
- Check webhook logs for errors
- Verify Telnyx API key is correct (in start-webhook-server.ps1)
- Check events written to database

## 📊 Manual Event Queries

**View all telephony events:**
```powershell
sqlite3 kevan.events.db "SELECT datetime(timestamp, 'unixepoch') as time, event_type, json_extract(payload, '$.from') as caller FROM events WHERE event_type LIKE 'tel.%' ORDER BY timestamp DESC;"
```

**Count events by type:**
```powershell
sqlite3 kevan.events.db "SELECT event_type, COUNT(*) FROM events WHERE event_type LIKE 'tel.%' GROUP BY event_type;"
```

**Last rejected call:**
```powershell
sqlite3 kevan.events.db "SELECT payload FROM events WHERE event_type = 'tel.call_rejected' ORDER BY timestamp DESC LIMIT 1;" | jq .
```

## 🎉 Success Criteria

After test call, you should have:
- ✅ Heard rejection message on phone
- ✅ Seen `tel.call_inbound` event in database
- ✅ Seen `tel.call_rejected` event in database
- ✅ Monitor showing real-time webhook processing
- ✅ Living proof that zero-spam works

## 📝 Next Steps

After successful test:
1. **Screenshot monitor** showing rejection
2. **Build phone registry** (map external phones to namespaces)
3. **Test authenticated call** (register phone to namespace)
4. **Document living proof** (before/after spam comparison)

## 🆘 Need Help?

**Logs:**
- Webhook server: `kevan-tel\webhook-server.log`
- Cloudflared: Running terminal window

**Status checks:**
```powershell
# Server health
curl http://localhost:3000/health

# Tunnel health (should return server health)
curl https://jeff-effective-charm-face.trycloudflare.com/health
```

**Restart everything:**
```powershell
# Stop webhook server
Get-Process webhook-server -ErrorAction SilentlyContinue | Stop-Process

# Restart server
.\start-webhook-server.ps1

# Restart tunnel (in new terminal)
cd ..\payments-api
cloudflared tunnel --url http://localhost:3000
```

---

**STATUS: READY FOR TEST CALL** 📞

Call +1-888-611-5384 NOW to validate zero-spam architecture!
