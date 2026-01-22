use kevan_policy::{PolicyEngine, PolicyDecision};
use kevan_events::{EventStore, Event, EventType};
use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== Policy Engine Demo ===\n");

    let events_db = Path::new("./kevan-events.db");
    let events = EventStore::new(events_db)?;
    let policy = PolicyEngine::new(events);

    println!("--- Finance Send Policy ---");
    println!("Rule: Auto-approve < $100, Require approval >= $100\n");

    // Test 1: Small payment (auto-approve)
    println!("Test 1: Send $50");
    let decision = policy.check_finance_send("kevan.x", 50.0)?;
    println!("  Decision: {:?}", decision);
    assert!(decision.is_allowed());
    println!("  ✓ Auto-approved (below threshold)\n");

    // Test 2: Large payment (requires approval)
    println!("Test 2: Send $500");
    let decision = policy.check_finance_send("kevan.x", 500.0)?;
    println!("  Decision: {:?}", decision);
    assert!(decision.requires_user_action());
    println!("  ⏸ Requires approval (above threshold)\n");

    // Test 3: Simulate approval
    println!("Test 3: User approves $500 payment");
    policy.approve_action(
        "kevan.x",
        "finance.send",
        "payment123",
        serde_json::json!({"amount": 500.0, "destination": "rDestination123"})
    )?;
    println!("  ✓ Approval event written\n");

    // Test 4: Check with approval
    println!("Test 4: Check payment with approval");
    let decision = policy.check_finance_send_with_approval(
        "kevan.x",
        500.0,
        "payment123"
    )?;
    println!("  Decision: {:?}", decision);
    assert!(decision.is_allowed());
    println!("  ✓ Approved (found recent approval event)\n");

    // Test 5: Vault delete (always requires approval)
    println!("Test 5: Delete file (no approval)");
    let decision = policy.check_vault_delete("kevan.x", "file456")?;
    println!("  Decision: {:?}", decision);
    assert!(decision.requires_user_action());
    println!("  ⏸ Requires approval (vault.delete always requires approval)\n");

    // Test 6: Approve and delete
    println!("Test 6: User approves file deletion");
    policy.approve_action(
        "kevan.x",
        "vault.delete",
        "file456",
        serde_json::json!({"file_name": "sensitive.pdf"})
    )?;
    let decision = policy.check_vault_delete("kevan.x", "file456")?;
    println!("  Decision: {:?}", decision);
    assert!(decision.is_allowed());
    println!("  ✓ Approved (found recent approval event)\n");

    println!("=== Policy Benefits ===\n");
    println!("Before Policy:");
    println!("  ✗ Actions happen without authorization");
    println!("  ✗ No approval mechanism");
    println!("  ✗ No enforcement of limits");
    println!("  ✗ No audit trail of decisions\n");

    println!("After Policy:");
    println!("  ✓ Every action gated by policy");
    println!("  ✓ Auto-approve for safe actions");
    println!("  ✓ Require approval for sensitive actions");
    println!("  ✓ Time-bounded approvals (expire after 5 min)");
    println!("  ✓ Cryptographic proof (policy.approve events)");
    println!("  ✓ Temporal proof (approval timestamp)\n");

    println!("=== Ready for Execution Rails ===\n");
    println!("Phase 1: Identity (WHO) ✓");
    println!("Phase 2: Auth (CONTROL) ✓");
    println!("Phase 3: Events (WHAT + WHEN) ✓");
    println!("Phase 4: Policy (ALLOWED) ✓");
    println!("Phase 5: Rails (DONE) → Next\n");

    println!("Now safe to build:");
    println!("  → kevan.finance.x (payments with policy)");
    println!("  → kevan.tel.x (calls with policy)");
    println!("  → kevan.vault.x (storage with policy)\n");

    Ok(())
}
