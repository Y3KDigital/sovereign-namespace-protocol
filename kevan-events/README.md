# kevan-events: Event Spine (Truth Layer)

**Immutable event log proving WHO did WHAT and WHEN.**

## Purpose

Events solve the fundamental question of distributed systems: **what happened?**

- Identity proves WHO (certificates)
- Events prove WHAT and WHEN (actions + ordering)
- Policy proves ALLOWED (authorization)
- Execution proves DONE (rails)

Without events, you cannot answer:
- Who approved this payment?
- When was delegation revoked?
- What happened at 3:42 PM?
- Was this before or after the policy change?

## Architecture

**One table. One truth.**

```sql
CREATE TABLE events (
    event_id TEXT PRIMARY KEY,        -- SHA256(actor||type||payload||timestamp)
    actor TEXT NOT NULL,               -- kevan.x
    event_type TEXT NOT NULL,          -- auth.login, finance.intent, etc.
    payload TEXT NOT NULL,             -- JSON details
    timestamp TEXT NOT NULL,           -- ISO 8601
    previous_hash TEXT,                -- Optional chaining
    created_at INTEGER NOT NULL        -- Unix timestamp for indexing
);
```

Events are:
- **Immutable** (never updated or deleted)
- **Cryptographically identified** (SHA256 hash)
- **Temporally ordered** (timestamp + index)
- **Actor-bound** (tied to verified namespace)

## Event Types

```rust
pub enum EventType {
    // Phase 2: Authentication
    AuthChallenge,       // Challenge generated
    AuthLogin,           // Session created
    AuthLogout,          // Session destroyed
    AuthSessionExpired,  // Session expired
    
    // Phase 4: Policy
    PolicyApprove,       // User approved action
    PolicyDeny,          // User denied action
    PolicyDelegate,      // Delegation issued
    PolicyRevoke,        // Delegation revoked
    
    // Phase 5: Finance
    FinanceIntent,       // Payment requested
    FinanceApprove,      // Payment approved
    FinanceExecute,      // Payment sent
    FinanceReceive,      // Payment received
    
    // Phase 5: Telephony
    TelCallInbound,      // Incoming call
    TelCallAuthenticated,// Authenticated call
    TelCallRejected,     // Rejected call
    
    // Phase 5: Storage
    VaultWrite,          // File stored
    VaultRead,           // File accessed
    VaultArchive,        // Archived to Arweave
}
```

## Usage

### Basic Event Writing

```rust
use kevan_events::{EventStore, Event, EventType};
use std::path::Path;

let store = EventStore::new(Path::new("events.db"))?;

// Create event
let event = Event::new(
    "kevan.x",
    EventType::AuthLogin,
    serde_json::json!({
        "session_id": "abc123",
        "ip": "192.168.1.1"
    })
);

// Write (immutable)
store.write(&event)?;
```

### Query Events

```rust
// All events for actor
let events = store.find_by_actor("kevan.x", None, 100)?;

// Specific event type
let logins = store.find_by_actor(
    "kevan.x",
    Some(EventType::AuthLogin),
    100
)?;

// By type across all actors
let all_payments = store.find_by_type(EventType::FinanceExecute, 100)?;

// Get specific event
let event = store.get(&event_id)?.unwrap();
```

### Event Chaining (Optional)

```rust
let event1 = Event::new("kevan.x", EventType::AuthLogin, json!({}));
store.write(&event1)?;

let event2 = Event::new_with_previous(
    "kevan.x",
    EventType::AuthLogout,
    json!({}),
    &event1.event_id
);
store.write(&event2)?;
```

## Integration with Auth

Events plug into existing systems without modification:

```rust
// kevan-auth integration
impl AuthSystem {
    pub fn verify_and_login(&self, ...) -> Result<Session> {
        // Existing verification...
        let session = self.sessions.create(namespace)?;
        
        // NEW: Write event
        let event = Event::new(
            namespace,
            EventType::AuthLogin,
            json!({"session_id": session.session_id})
        );
        self.events.write(&event)?;
        
        Ok(session)
    }
}
```

## Why This Matters

When you build `kevan.finance.x`:

```rust
// Payment requires proof of approval
let approval = events.find_by_actor(
    "kevan.x",
    Some(EventType::PolicyApprove),
    100
)?;

let approved = approval.iter().find(|e| {
    e.payload["payment_id"] == payment_id
});

if approved.is_none() {
    return Err("Payment not approved");
}

// Execute payment
xrpl.send(amount, destination)?;

// Record execution
events.write(&Event::new(
    "kevan.x",
    EventType::FinanceExecute,
    json!({"txid": xrpl_txid})
))?;
```

**You now have cryptographic proof:**
- WHO approved (kevan.x signed challenge)
- WHEN they approved (event timestamp)
- WHAT was executed (XRPL txid)

## Event Verification

```rust
// Verify event integrity
assert!(event.verify());

// Events are deterministic
let recomputed_id = compute_event_id(
    &event.actor,
    event.event_type.as_str(),
    &event.payload.to_string(),
    &event.timestamp.to_rfc3339()
);
assert_eq!(recomputed_id, event.event_id);
```

## Database Schema

```sql
CREATE TABLE events (
    event_id TEXT PRIMARY KEY,
    actor TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    previous_hash TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX idx_events_actor ON events(actor);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_timestamp ON events(created_at);
```

**No updates. No deletes. Only appends.**

## Testing

```bash
cargo test --all
```

## Dependencies

- `rusqlite` 0.29 - SQLite storage
- `serde` 1.0 - Serialization
- `chrono` 0.4 - Timestamps
- `sha2` 0.10 - Event ID generation
- `hex` 0.4 - Hash encoding

## License

Same as parent project.
