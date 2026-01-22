# Family & Delegation Layer - Sequence 2

## Vision
This layer introduces **Trust** and **Continuity** to the Sovereign OS. It transforms `brad.x` from a single-player tool into a multi-generational asset. It does not add "users" or "admin panels". It adds **Delegates** with scoped, verifiable authority.

## Philosophy
> "Family ≠ Users. Family = trusted delegates with scoped authority."
> "This is estate planning, not user management."

## Core Concepts

### 1. The Delegate
A delegate is a namespace (e.g., `wife.x`) or a public key that has been granted specific capabilities by the Root ( `brad.x`).
- Delegates **never** hold the Root Key.
- Delegates operate via their *own* keys/namespaces.
- Authority is valid only when checked against the Root's policy.

### 2. Scoped Capabilities (The "Can" List)
Capabilities are granular and explicit.
- `approve_payments`: Sign off on pending transactions.
- `view_vault`: Read-only access to encrypted files (requires key sharing setup).
- `emergency_override`: Trigger the "Emergency Mode" (Sequence 5).

### 3. Constraints (The "Limits")
Authority is boundless unless constrained.
- `limit_usd_daily`: Max flow without Root approval.
- `expires_at`: Authority automatically revoked at block/time.

## Data Structure (Draft)

```rust
struct Delegation {
    delegate: String,       // "wife.x"
    role: Role,            // Family, Emergency, Observer
    permissions: Vec<Permission>,
    constraints: Constraints,
    signature: String,     // Signed by kevan.x Root Key
}

enum Permission {
    ApprovePayments,
    ViewVault,
    ViewStatus,
    EmergencyTrigger
}

struct Constraints {
    daily_spend_limit: Option<f64>,
    network_access: bool,
}
```

## Implementation Plan

### Phase 1: The Policy Engine Upgrade
- Modify `kevan-policy` (or create `kevan-delegation`) to support `Delegation` structs.
- Store delegations in `os-config.json` initially (for simplicity/visibility), then strictly in `kevan.events.db` as immutable records.

### Phase 2: The Approval Flow
- When `kevan.os` receives a request (e.g., "Pay 1000 USD"), it checks:
  1. Is this `kevan.x`? (Yes -> Execute)
  2. Is this a Delegate? (Yes -> Check Limits -> Execute or Queue)

### Phase 3: Emergency Logic (Stub)
- Define the "Break Glass" event that Delegates can trigger.

## Success Criteria
- [ ] defined `Delegation` struct in code.
- [ ] Configured `wife.x` (mock) in `os-config.json`.
- [ ] Tested: `wife.x` can check status.
- [ ] Tested: `wife.x` cannot delete vault.
