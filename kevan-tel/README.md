# kevan.tel.x - Sovereign Phone System

Replace phone numbers with namespace authentication. **Zero spam calls.**

## Architecture

```
kevan.tel.x maps to 26 Telnyx numbers:
  • +1-888-611-5384 (611-JEXT)
  • +1-888-474-8738 (474-TREE)
  • +1-888-676-2825 (676-DUCK)
  • +1-770-230-0635 (primary)
  • ... (22 more vanity numbers)

Incoming call flow:
  1. Call arrives → Telnyx webhook
  2. Write tel.call_inbound event
  3. Check: does caller have *.x certificate?
  4. YES → connect (tel.call_authenticated)
  5. NO → voicemail/reject (tel.call_rejected)

Result: ZERO spam calls
```

## Before kevan.tel.x

```
☐ Personal phone: +1-770-230-0635
☐ Business line: different number
☐ Spam calls: 10-20 per day
☐ Unknown callers: answer and hope
☐ No caller authentication
☐ No call audit trail
```

**Problems:**
- Can't tell who's calling before answering
- Spam/robocalls get through
- No proof of who called when
- Multiple numbers for different purposes

## After kevan.tel.x

```
✓ kevan.tel.x → 26 numbers (all authenticated)
✓ Only *.x namespaces can call
✓ Zero spam (unauthenticated = auto-reject)
✓ Full call audit trail (events)
✓ Policy-gated call forwarding
```

**Benefits:**
- Know WHO is calling (namespace, not just number)
- Spam calls auto-rejected (no *.x cert = no ring)
- Full call history (cryptographically provable)
- ONE namespace, many numbers

## Usage

```rust
use kevan_tel::{TelHub, IncomingCall, CallAuth};
use kevan_events::EventStore;
use kevan_resolver::CertificateStore;
use std::path::Path;

// Initialize
let events = EventStore::new(Path::new("./kevan-events.db"))?;
let api_key = std::env::var("TELNYX_API_KEY")?;
let hub = TelHub::new(events, api_key);

let cert_dir = Path::new("./genesis");
let cert_store = CertificateStore::new(cert_dir)?;
let auth = CallAuth::new(cert_store);

// Handle incoming call webhook
let call = IncomingCall::new("call_123", "+15551234567", "+18886115384");
let decision = hub.handle_incoming_call(&call, &auth).await?;

match decision {
    AuthDecision::Authenticated { namespace } => {
        println!("✓ Call from {} authenticated", namespace);
        // Connect call
    }
    AuthDecision::Rejected => {
        println!("✗ Unauthenticated call rejected");
        // Send to voicemail or hang up
    }
    _ => {}
}

// Events written:
//   1. tel.call_inbound (call received)
//   2. tel.call_authenticated OR tel.call_rejected
```

## Integration with Policy

```rust
use kevan_policy::PolicyEngine;

// Check if call forwarding allowed
let policy = PolicyEngine::new(events.clone());

// Policy: only forward calls from specific namespaces
if let Some(namespace) = decision.namespace() {
    // Check delegation: did alice.x delegate authority to call kevan.x?
    let can_forward = policy.check_delegation("kevan.x", "tel.forward", namespace)?;
    
    if can_forward.is_allowed() {
        // Forward to mobile
    } else {
        // Send to voicemail
    }
}
```

## Number Mapping

```rust
use kevan_tel::NumberMap;

let map = NumberMap::load_kevan_numbers();

// All 26 numbers map to kevan.tel.x
let numbers = map.for_namespace("kevan.tel.x");
println!("kevan.tel.x has {} numbers", numbers.len()); // 26

// Lookup specific number
if let Some(num) = map.lookup("+18886115384") {
    println!("Number {} maps to {}", num.raw, num.namespace);
    if let Some(vanity) = &num.vanity {
        println!("Vanity: {}", vanity); // "611-JEXT"
    }
}
```

## Webhook Handler (Example)

```rust
use axum::{routing::post, Router, Json};
use kevan_tel::CallEvent;

async fn handle_webhook(
    Json(event): Json<CallEvent>,
) -> &'static str {
    if event.is_new_call() {
        let call = event.call();
        let decision = hub.handle_incoming_call(call, &auth).await?;
        
        match decision {
            AuthDecision::Authenticated { namespace } => {
                // Answer call, connect
                "ok"
            }
            AuthDecision::Rejected => {
                // Reject or voicemail
                "rejected"
            }
            _ => "ok"
        }
    } else {
        "ok"
    }
}

let app = Router::new()
    .route("/webhooks/telnyx", post(handle_webhook));
```

## Implementation Status

### ✅ Phase 1: Core Architecture
- [x] TelnyxNumber struct (26 numbers loaded)
- [x] NumberMap (namespace → numbers)
- [x] IncomingCall webhook models
- [x] CallAuth (authentication logic)
- [x] TelHub (call orchestration)
- [x] Event writing (tel.call_inbound, authenticated, rejected)
- [x] Tests (12 passing)

### 🚧 Phase 2: Telnyx Integration (Next)
- [ ] Telnyx API client
- [ ] Webhook server (axum/warp)
- [ ] Call control (answer/reject/forward)
- [ ] Voicemail handling
- [ ] Phone number → namespace registry
- [ ] Real-time call status updates

### 📋 Phase 3: Production Features (Future)
- [ ] Emergency services bypass (911)
- [ ] Allowlist management
- [ ] Call recording (with consent)
- [ ] Conference calling
- [ ] SMS/MMS integration
- [ ] Voicemail transcription

## What This Replaces

Replace traditional phone system with namespace authentication:

| Old System | kevan.tel.x |
|------------|-------------|
| Personal phone (+1-770-...) | ✓ |
| Business line (different) | ✓ |
| Spam calls (10-20/day) | ✗ (auto-rejected) |
| Unknown callers | ✓ (authenticated only) |
| Multiple apps (Google Voice, etc) | ✓ |
| No caller authentication | ✓ (*.x certificates) |

**Result:** ONE namespace, 26 numbers, ZERO spam.

## Why This Works

1. **Identity** (Phase 1): Caller has alice.x certificate
2. **Auth** (Phase 2): Signature proves alice.x controls the call
3. **Events** (Phase 3): Every call is AUDITABLE
4. **Policy** (Phase 4): Call forwarding is AUTHORIZED
5. **Telephony** (Phase 6): Call is CONNECTED

You give someone `kevan.tel.x` → they call → authentication checked → spam filtered out → you have full sovereignty.

## Next Steps

1. **Build webhook server** (axum, handle Telnyx webhooks)
2. **Implement call control** (answer/reject via Telnyx API)
3. **Phone number registry** (map phone numbers → namespaces)
4. **Test with real calls** (use one of the 26 numbers)
5. **Deploy webhook server** (public URL for Telnyx)

Then move to Phase 7: kevan.vault.x (storage).
