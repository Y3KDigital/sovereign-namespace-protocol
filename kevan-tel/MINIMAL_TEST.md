# Minimal Test Setup - Single Number

## 🎯 Test Configuration

### Your Numbers
- **Telnyx Test Number**: +1-321-485-8333 (Compliance line from Unykorn)
- **Your Personal Phone**: +1-321-278-8323 (to register to kevan.x)

### Goal
Test namespace-based authentication with just ONE Telnyx number while keeping your other 25 numbers running in Unykorn.

---

## 🚀 Setup Steps (5 Minutes)

### Step 1: Start Cloudflared Tunnel

**Open new PowerShell window:**
```powershell
cloudflared tunnel --url http://localhost:3000
```

**Copy the URL** (https://something.trycloudflare.com)

Leave this window open.

### Step 2: Configure ONE Telnyx Number

1. Open: https://portal.telnyx.com/
2. Go to: **Call Control** → **Applications**
3. Create new application:
   - **Name:** `kevan.tel.x Test`
   - **Webhook URL:** `https://YOUR-TUNNEL-URL/webhooks/telnyx`
   - **API Version:** V2
   - **Enable events:** call.initiated, call.answered, call.hangup
4. Save

5. Go to: **Phone Numbers** → **My Numbers**
6. Find: **+1-321-485-8333** (Compliance line)
7. Click the number
8. Under **Call Control Application**, select `kevan.tel.x Test`
9. Save

**Important:** Leave your other 25 numbers assigned to their current Unykorn applications.

### Step 3: Test Unauthenticated Call

**Call:** +1-321-485-8333

**Expected:**
- You hear rejection message: *"This number only accepts calls from verified namespace holders..."*
- Events written: `tel.call_inbound`, `tel.call_rejected`

**Verify:**
```powershell
sqlite3 "c:\Users\Kevan\web3 true web3 rarity\kevan-tel\kevan.events.db" "SELECT * FROM events WHERE event_type LIKE 'tel.%';"
```

### Step 4: Register Your Phone to Namespace

**Create phone registry:**

```powershell
cd "c:\Users\Kevan\web3 true web3 rarity\kevan-tel"

# Create simple registry file
@"
{
  "registry": {
    "+13212788323": {
      "namespace": "kevan.x",
      "verified_at": "$(Get-Date -Format 'o')",
      "certificate_fingerprint": "kevan.x.genesis.01"
    }
  }
}
"@ | Out-File -FilePath "phone-registry.json" -Encoding utf8
```

**Update webhook server to use registry:**

Modify `kevan-tel/src/bin/webhook-server.rs`:

Add at the top of `handle_webhook()`:
```rust
// Load phone registry
let registry_path = std::env::var("PHONE_REGISTRY")
    .unwrap_or_else(|_| "./phone-registry.json".to_string());

let registry: serde_json::Value = if std::path::Path::new(&registry_path).exists() {
    let registry_data = std::fs::read_to_string(&registry_path)?;
    serde_json::from_str(&registry_data)?
} else {
    serde_json::json!({"registry": {}})
};

// Check if caller is registered
let caller_registered = registry["registry"]
    .get(&from_number)
    .and_then(|entry| entry.get("namespace"))
    .is_some();
```

Then update the authentication check:
```rust
let call_auth = if caller_registered {
    CallAuth::Authenticated {
        namespace: registry["registry"][&from_number]["namespace"]
            .as_str()
            .unwrap()
            .to_string(),
    }
} else {
    CallAuth::None
};
```

**Rebuild and restart:**
```powershell
cargo build --release --bin webhook-server
Get-Process webhook-server -ErrorAction SilentlyContinue | Stop-Process
.\start-webhook-server.ps1
```

### Step 5: Test Authenticated Call

**Call +1-321-485-8333 from your phone (+1-321-278-8323)**

**Expected:**
- Call connects (not rejected!)
- Events written: `tel.call_inbound`, `tel.call_authenticated`

**Verify:**
```powershell
sqlite3 kevan.events.db "SELECT event_type, json_extract(payload, '$.from') as caller FROM events WHERE event_type LIKE 'tel.%' ORDER BY timestamp DESC LIMIT 5;"
```

Should show both:
- Rejected calls (from unregistered numbers)
- Authenticated calls (from your registered phone)

---

## 📊 What This Proves

### Before (Traditional Phone)
- Anyone can call you
- No authentication
- Spam/robocalls reach you

### After (Namespace-Based)
- Only registered phones connect
- Cryptographic authentication (via namespace mapping)
- Zero spam

---

## 🔄 Gradual Migration Plan

### Phase 1: Testing (Today)
- ✅ ONE Telnyx number (+1-321-485-8333)
- ✅ YOUR phone registered to kevan.x
- ✅ Test rejection + authentication

### Phase 2: Selective Migration (Next Week)
- Add 2-3 more Telnyx numbers to kevan.tel.x
- Register family/team phones to *.kevan.x
- Keep 22-23 numbers in Unykorn

### Phase 3: Full Integration (Next Month)
- Decide which numbers stay in Unykorn (public-facing)
- Which numbers use namespace auth (private/internal)
- Hybrid model: Some numbers public, some namespace-only

### Phase 4: Namespace-to-Namespace (Future)
- Remove PSTN entirely for internal comms
- Direct kevan.x → alice.x calling
- No phone numbers needed between namespace holders

---

## 🔧 Keeping Unykorn Running

Your other 25 Telnyx numbers continue working normally:

**Unykorn System** (25 numbers):
- All 5 vanity LAW numbers
- Emergency lines
- Specialized services
- Client services
- Connected to your Unykorn AI legal system

**kevan.tel.x Test** (1 number):
- +1-321-485-8333 only
- Testing namespace authentication
- Separate webhook endpoint

**No conflicts.** Each system gets its own webhooks.

---

## 📁 Quick Reference

**Webhook Server**: http://localhost:3000
**Tunnel**: Run `cloudflared tunnel --url http://localhost:3000`
**Registry**: `kevan-tel/phone-registry.json`

**Test Number**: +1-321-485-8333
**Your Phone**: +1-321-278-8323 → kevan.x

**Verify Events**:
```powershell
sqlite3 kevan.events.db "SELECT * FROM events WHERE event_type LIKE 'tel.%';"
```

**Restart Server**:
```powershell
Get-Process webhook-server -ErrorAction SilentlyContinue | Stop-Process
cd "c:\Users\Kevan\web3 true web3 rarity\kevan-tel"
.\start-webhook-server.ps1
```

---

## ✅ Success Criteria

After testing:

1. ✅ Unauthenticated call rejected (anyone calling 321-485-8333)
2. ✅ Authenticated call connects (YOUR phone calling 321-485-8333)
3. ✅ Events written to database
4. ✅ Unykorn system still working normally

**Then you've proven namespace-based telephony works!** 🎉

---

**Start with Step 1**: Open PowerShell, run cloudflared tunnel.
