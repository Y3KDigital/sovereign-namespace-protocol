# Live Test Plan - Option A Architecture

## 🎯 Goal
Test the complete bridge: +1-321-485-8333 (Programmable Voice) → +1-872-254-8473 (Wireless SIM) → Native iPhone ringing

## 📋 Pre-Test Checklist

### ✅ Infrastructure Status
- [ ] Webhook server running on port 3000 (`http://localhost:3000`)
- [ ] Cloudflare tunnel active (exposing localhost:3000)
- [ ] Telnyx webhook configured to point to tunnel URL
- [ ] Connection `xxxiii-voice` routes to webhook server

### ✅ Configuration Verification
```powershell
# 1. Check webhook server health
Invoke-RestMethod -Uri "http://localhost:3000/health"

# 2. Verify SIM configuration
$h = @{Authorization = "Bearer KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7"}
$sim = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/sim_cards/116016e3-61f6-4ed0-996a-3f6b4bdc7f0f" -Headers $h

Write-Host "SIM Status:" -ForegroundColor Cyan
Write-Host "  ICCID: $($sim.data.iccid)"
Write-Host "  Status: $($sim.data.status)"
Write-Host "  Phone: $($sim.data.phone_number)"
Write-Host "  MSISDN: +1-872-254-8473"

# 3. Verify number routing
$num = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/phone_numbers/+13214858333" -Headers $h

Write-Host "`nNumber Routing:" -ForegroundColor Cyan
Write-Host "  Number: $($num.data.phone_number)"
Write-Host "  Connection: $($num.data.connection_name)"
Write-Host "  Should be: xxxiii-voice"
```

### ✅ iPhone Status
- [ ] eSIM enabled in Settings → Cellular
- [ ] Telnyx line turned ON
- [ ] Set as Default Voice Line
- [ ] Phone not in Do Not Disturb mode
- [ ] Ringer volume UP

## 🧪 Test Execution

### Test 1: Basic Call Flow (No Auth)

**Setup:**
- Webhook currently answers/rejects based on namespace auth
- For first test, temporarily disable auth requirement

**Expected Behavior:**
1. External phone calls +1-321-485-8333
2. Telnyx routes to xxxiii-voice webhook
3. Webhook receives `call.initiated` event
4. Webhook calls Telnyx API: `dial` action to +1-872-254-8473
5. Telnyx dials SIM number
6. iPhone rings via native Phone app
7. Answer call → two-way audio works

**Success Criteria:**
- ✅ iPhone rings within 5 seconds
- ✅ Native Phone app (NOT Telnyx app)
- ✅ Can answer and hear caller
- ✅ Caller can hear you
- ✅ No dropped connection

**Logs to Monitor:**
```bash
# Webhook server output should show:
📞 Telnyx webhook received
📱 Call:
   From: +1XXXXXXXXXX
   To: +13214858333
   ID: call_ctrl_XXXXXX
✅ Authenticated/Allowlisted
   Action: Dialing SIM (+18722548473)
✅ Dial command sent to Telnyx
```

### Test 2: With Namespace Authentication

**Setup:**
- Re-enable namespace auth
- Call from authenticated namespace number

**Expected Behavior:**
1. Webhook receives call
2. Checks namespace authentication
3. If authenticated → dials SIM
4. If rejected → speaks rejection message and hangs up

**Success Criteria:**
- ✅ Authenticated callers ring iPhone
- ✅ Unauthenticated callers hear rejection message
- ✅ Logs show correct auth decision

## 🔍 Debugging Checklist

### If iPhone Doesn't Ring

**Check 1: Webhook Received?**
```powershell
# Look for webhook logs in server terminal
# Should see: "📞 Telnyx webhook received"
```

**Check 2: SIM Number Correct?**
```powershell
# Verify we're dialing the right number
# Log should show: "Dialing SIM (+18722548473)"
```

**Check 3: Telnyx API Error?**
```bash
# Check for error messages:
❌ Failed to dial: [error message]
```

**Check 4: iPhone Ready?**
```
Settings → Cellular → Telnyx
- Line should be ON
- "No Service" means carrier issue
- Toggle OFF then ON to reset
```

**Check 5: Cloudflare Tunnel?**
```powershell
# Test external access
Invoke-RestMethod -Uri "https://[your-tunnel-url]/health"
```

### If Call Connects But No Audio

**Issue:** One-way or no audio

**Possible Causes:**
- NAT/firewall blocking RTP
- Codec mismatch
- iPhone audio settings

**Solutions:**
- Restart iPhone
- Check Settings → Cellular → Cellular Data (must be ON)
- Try from different caller

### If Webhook Never Fires

**Issue:** No logs in webhook server

**Check:**
1. Telnyx webhook URL configuration
2. Connection ID for +1-321-485-8333
3. Cloudflare tunnel status
4. Firewall blocking port 3000

## 📊 Success Metrics

### Minimum Viable Success
- [ ] iPhone rings when +1-321-485-8333 is called
- [ ] Can answer call in native Phone app
- [ ] Two-way audio works

### Full Success
- [ ] Namespace auth works correctly
- [ ] Rejection message plays for unauthenticated
- [ ] Call quality is good (no drops, clear audio)
- [ ] Logs show complete flow

### Production Ready
- [ ] Failover if SIM unreachable
- [ ] Voicemail after X rings
- [ ] Call recording option
- [ ] Multiple target numbers (sequential/simultaneous)

## 🚀 Current Implementation Status

### ✅ Completed
- TelnyxClient with API methods
- Webhook server with call handling
- Namespace authentication logic
- SIM provisioning and activation

### 🔄 Needs Update
- Change `answer_call` → `dial_number` in webhook handler
- Add proper dial action (not bridge)
- Update logs to show dial target

### ⏳ Not Started
- Failover logic
- Voicemail integration
- Call recording
- Multi-target dial

## 📝 Next Steps After Successful Test

1. **Document Working Config**
   - Exact Telnyx settings
   - Webhook URL
   - Connection details
   - SIM configuration

2. **Harden Production**
   - Add retry logic
   - Implement failover
   - Set up monitoring
   - Configure alerts

3. **Enhance Features**
   - Add namespace-based routing rules
   - Implement voicemail
   - Add call recording
   - Build admin dashboard

4. **Security**
   - Rotate exposed API key
   - Add webhook signature verification
   - Implement rate limiting
   - Set up intrusion detection

## 🔐 Security Notes

**⚠️ CRITICAL:** API key exposed in this session
```
KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7
```

**After testing completes:**
1. Telnyx Portal → API Keys
2. Revoke this key
3. Create new key with minimal scope
4. Update webhook server config
5. Restart server with new key

## 📞 Test Contact Info

**Test Numbers:**
- Public number: +1-321-485-8333 (Programmable Voice)
- SIM number: +1-872-254-8473 (Wireless - private)
- iPhone ICCID: 89311210000005749297

**DO NOT share SIM number publicly** - this is the direct cellular line
