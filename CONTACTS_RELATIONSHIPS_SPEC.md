# Contacts & Relationships Spec - Sequence 3

## Vision
This sequence implements **Resolution**, not "Address Books".
In the Sovereign OS, you do not "add a contact" with a phone number. You **resolve an identity** (`doctor.x`) and assign it a **Role** in your life.

## Philosophy
> "Contacts are resolved identities, not stored strings."
> "No address books. No phone lists. No data entry."

## Data Structure

### The Sovereign Contact
```rust
struct Contact {
    namespace: String,       // "mom.x" - The Anchor
    relationship: Relation,  // The Context
    priority: Priority,      // The Access Level
    channels: Vec<Channel>,  // Resolved capabilities (derived from Identity)
}

enum Relation {
    Family,
    Medical,
    Legal,
    Friend,
    Network,
    Service,
}

enum Priority {
    Emergency,  // Bypasses all filters. Wake on LAN.
    High,       // Notify immediately.
    Standard,   // Batch notify.
    Low,        // No notify. Pull only.
}
```

## Implementation Plan

### 1. `kevan-contacts` Module
- A new crate or module to manage the `contacts.json` or `contacts.db`.
- **Constraint:** Must not store PII (Phone numbers, emails) raw. It should resolve them from the `kevan-resolver` if possible, or store them as *overrides* only if necessary. Since the goal is "Namespace-native", `mom.x` should resolve to her public key & routing info via the protocol, not a local cache of numbers.

### 2. Resolution Logic
- When `kevan-mail` sends to `mom.x`:
  1. Check `kevan-contacts` for `mom.x`.
  2. Is she `Blocked`?
  3. Resolve destination via `kevan-resolver`.

### 3. Usage in `kevan-os`
- CLI: `kevan-os contact add mom.x --relation family --priority emergency`
- Config: Stored in `os-config.json` initially for visibility.

## Success Criteria
- [ ] `Contact` struct defined.
- [ ] `kevan-os` can list resolved contacts.
- [ ] `Priority::Emergency` allows bypassing Do-Not-Disturb (future logic).
