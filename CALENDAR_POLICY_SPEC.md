# Calendar as Policy Spec - Sequence 4

## Vision
In the Sovereign OS, the Calendar is not just a list of places to be. It is the **Authority over Time**.
It defines **Availability**, not just Activity. It enforces boundaries.

## Philosophy
> "Calendar is not dates—it is authority over time."
> "If it's not in the Sovereign Calendar, it's not a commitment."

## Data Structure

### The Sovereign Event
```rust
struct Event {
    id: String,              // UUID
    title: String,
    start: u64,              // Timestamp
    end: u64,                // Timestamp
    participants: Vec<String>, // ["mom.x", "brad.x"]
    policy: TimePolicy,      // Rigid vs Flexible
}

enum TimePolicy {
    Immutable,  // Cannot be moved (Flight, Court)
    Flexible,   // Can be moved by Family
    Fluid,      // Can be moved by anyone trusted
}
```

### Availability Windows (The Policy Layer)
Instead of "Open", we define "Role-Based Access".
- **Family Window:** `mom.x` can book here.
- **Deep Work:** Auto-reject invites.
- **Public:** Rate-limited booking.

## Implementation Plan

### 1. `kevan-calendar` Module
- Structs for `Event`, `TimeWindow`.
- Functions to check "Is this time slot free for `mom.x`?"

### 2. Integration
- `kevan-os calendar add --title "Dinner" --with mom.x`
- `kevan-os calendar view`

## Success Criteria
- [ ] `kevan-calendar` crate created.
- [ ] Defined `Event` and `TimePolicy`.
- [ ] CLI can add an event.
- [ ] CLI can list events.
