# kevan-policy: Policy Engine (Authorization Layer)

**Defines what actions are allowed and under what conditions.**

## Purpose

Policy solves the fundamental question: **is this action allowed?**

- Identity proves WHO (certificates)
- Events prove WHAT + WHEN (actions)
- **Policy proves ALLOWED** (authorization)
- Execution proves DONE (rails)

Without policy, you cannot answer:
- Can I send $1000?
- Does this require approval?
- Was delegation revoked?
- Is the approval still valid?

## Architecture

**Policy CONSUMES events and GATES execution.**

```text
Action Request → Policy Check → [Approved?] → Execute → Write Event
                      ↓
                 Query Events
                 (approval?)
```

Policy answers:
1. **Is action allowed?** (check policy rules)
2. **Does it require approval?** (check thresholds)
3. **Is there approval?** (query events for policy.approve)
4. **Is approval valid?** (check timestamp, not expired)

## Policy Rules

```rust
pub enum PolicyRule {
    AlwaysAllow,                    // No restrictions
    AlwaysDeny,                     // Never allowed
    AmountThreshold {               // Auto-approve below, require above
        auto_approve_below: f64,
        require_approval_at: f64,
        approval_expires_minutes: u32,
    },
    RequireApproval {               // Always require approval
        approval_expires_minutes: u32,
    },
    RequireDelegation {             // Must be delegated
        from_namespace: String,
    },
}
```

## Usage

### Basic Policy Check

```rust
use kevan_policy::{PolicyEngine, PolicyDecision};
use kevan_events::EventStore;
use std::path::Path;

let events = EventStore::new(Path::new("events.db"))?;
let engine = PolicyEngine::new(events);

// Check small payment
let decision = engine.check_finance_send("kevan.x", 50.0)?;
assert!(matches!(decision, PolicyDecision::AutoApproved));

// Check large payment
let decision = engine.check_finance_send("kevan.x", 500.0)?;
assert!(matches!(decision, PolicyDecision::RequiresApproval));
```

### Approval Flow

```rust
// Step 1: Check policy
let decision = engine.check_finance_send("kevan.x", 500.0)?;

if decision == PolicyDecision::RequiresApproval {
    // Step 2: Prompt user
    println!("Approve payment of $500?");
    let user_approved = prompt_user();
    
    if user_approved {
        // Step 3: Write approval event
        engine.approve_action(
            "kevan.x",
            "finance.send",
            "payment123",
            json!({"amount": 500.0})
        )?;
    } else {
        // Write denial event
        engine.deny_action(
            "kevan.x",
            "finance.send",
            "payment123",
            "User declined"
        )?;
        return Err("Payment denied");
    }
}

// Step 4: Check with approval
let decision = engine.check_finance_send_with_approval(
    "kevan.x",
    500.0,
    "payment123"
)?;

if decision.is_allowed() {
    // Execute payment
    xrpl.send(500.0, destination)?;
    
    // Write execution event
    events.write(&Event::new(
        "kevan.x",
        EventType::FinanceExecute,
        json!({"txid": xrpl_txid})
    ))?;
}
```

## Default Policies

### Finance Send

```rust
Policy::finance_send_default()
// Auto-approve: < $100
// Require approval: >= $100
// Approval expires: 5 minutes
```

### Vault Delete

```rust
Policy::vault_delete_default()
// Always require approval
// Approval expires: 5 minutes
```

### Tel Forward

```rust
Policy::tel_forward_default()
// Require delegation from kevan.tel.x
```

## Policy Decisions

```rust
pub enum PolicyDecision {
    AutoApproved,        // Execute immediately
    Approved,            // Approved via event
    RequiresApproval,    // Prompt user
    Denied(String),      // Reject with reason
}

// Check if allowed
if decision.is_allowed() {
    execute();
}

// Check if user action needed
if decision.requires_user_action() {
    prompt_user();
}
```

## Integration Example

```rust
// Complete payment flow with policy
async fn send_payment(
    actor: &str,
    amount: f64,
    destination: &str,
) -> Result<String> {
    let payment_id = generate_payment_id();
    
    // Step 1: Check policy
    let decision = policy.check_finance_send(actor, amount)?;
    
    // Step 2: Handle approval if needed
    if decision.requires_user_action() {
        prompt_approval(actor, amount, &payment_id).await?;
    }
    
    // Step 3: Verify approval
    let decision = policy.check_finance_send_with_approval(
        actor,
        amount,
        &payment_id
    )?;
    
    if !decision.is_allowed() {
        return Err("Payment not approved");
    }
    
    // Step 4: Execute
    let txid = xrpl.send(amount, destination)?;
    
    // Step 5: Record execution
    events.write(&Event::new(
        actor,
        EventType::FinanceExecute,
        json!({
            "payment_id": payment_id,
            "txid": txid,
            "amount": amount,
            "destination": destination
        })
    ))?;
    
    Ok(txid)
}
```

## Why This Matters

**Before policy:**
- Actions happen without authorization
- No approval mechanism
- No audit trail of decisions
- No way to enforce limits

**After policy:**
- Every action gated by policy
- Approval flow for sensitive actions
- Temporal proof (approval at specific time)
- Enforcement of thresholds/limits

## Event-Policy Integration

Policy CONSUMES events:

```rust
// Query approval events
let approvals = events.find_by_actor(
    "kevan.x",
    Some(EventType::PolicyApprove),
    100
)?;

// Check if approval exists and is recent
for event in approvals {
    if event.timestamp > cutoff && 
       event.payload["action"] == action &&
       event.payload["resource_id"] == resource_id {
        return Ok(true); // Approved
    }
}
```

Policy WRITES events:

```rust
// Write approval
events.write(&Event::new(
    actor,
    EventType::PolicyApprove,
    json!({
        "action": "finance.send",
        "payment_id": "123",
        "amount": 500.0
    })
))?;

// Write denial
events.write(&Event::new(
    actor,
    EventType::PolicyDeny,
    json!({
        "action": "vault.delete",
        "file_id": "xyz",
        "reason": "User declined"
    })
))?;
```

## Testing

```bash
cargo test --all
```

## Dependencies

- `kevan-events` - Event spine (query approvals)
- `serde` 1.0 - Serialization
- `chrono` 0.4 - Timestamps

## License

Same as parent project.
