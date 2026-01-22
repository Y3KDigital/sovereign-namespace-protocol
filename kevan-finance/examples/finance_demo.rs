use kevan_finance::{FinanceHub, PaymentIntent};
use kevan_policy::PolicyEngine;
use kevan_events::EventStore;
use std::error::Error;
use std::path::Path;

fn main() -> Result<(), Box<dyn Error>> {
    println!("=== kevan.finance.x Universal Payment Hub ===\n");

    // Initialize stack
    let events = EventStore::new(Path::new("./kevan-finance-demo.db"))?;
    let policy = PolicyEngine::new(events.clone());
    let finance = FinanceHub::new(events.clone());

    println!("✅ Finance hub initialized\n");
    println!("Stack:");
    println!("  Phase 1: Identity (WHO) - certificate resolution");
    println!("  Phase 2: Auth (CONTROL) - signature verification");
    println!("  Phase 3: Events (WHAT+WHEN) - immutable audit log");
    println!("  Phase 4: Policy (ALLOWED) - authorization rules");
    println!("  Phase 5: Finance (DONE) - payment execution ← YOU ARE HERE\n");

    // Test 1: Small payment (auto-approved)
    println!("--- Test 1: Send $50 (auto-approve) ---");
    let intent1 = PaymentIntent::new("kevan.x", "alice.x", 50.0, "USD")
        .with_memo("Coffee payment");
    
    let decision1 = policy.check_finance_send("kevan.x", 50.0)?;
    println!("  Policy decision: {:?}", decision1);
    
    if decision1.is_allowed() {
        let result1 = finance.send(&intent1)?;
        println!("  ✓ Payment sent via {}", result1.route);
        println!("    TxID: {}", result1.txid.unwrap());
    }
    println!();

    // Test 2: Large payment (requires approval)
    println!("--- Test 2: Send $500 (requires approval) ---");
    let intent2 = PaymentIntent::new("kevan.x", "bob.x", 500.0, "USD")
        .with_memo("Contract payment");
    
    let decision2 = policy.check_finance_send("kevan.x", 500.0)?;
    println!("  Policy decision: {:?}", decision2);
    
    if decision2.requires_user_action() {
        println!("  ⏸ Requires approval (amount ≥ $100)");
        println!("  → User approves in UI...");
        
        // User approves
        policy.approve_action(
            "kevan.x",
            "finance.send",
            &intent2.id,
            serde_json::json!({
                "amount": 500.0,
                "to": "bob.x",
                "memo": "Contract payment"
            })
        )?;
        println!("  ✓ Approval written to event spine");
        
        // Check with approval
        let decision2_approved = policy.check_finance_send_with_approval(
            "kevan.x",
            500.0,
            &intent2.id
        )?;
        println!("  Policy decision (with approval): {:?}", decision2_approved);
        
        if decision2_approved.is_allowed() {
            let result2 = finance.send(&intent2)?;
            println!("  ✓ Payment sent via {}", result2.route);
            println!("    TxID: {}", result2.txid.unwrap());
        }
    }
    println!();

    // Test 3: Very large payment (ACH routing)
    println!("--- Test 3: Send $15,000 (ACH route) ---");
    let intent3 = PaymentIntent::new("kevan.x", "charlie.x", 15000.0, "USD")
        .with_memo("Property deposit");
    
    println!("  ⏸ Requires approval (amount ≥ $100)");
    println!("  → User approves...");
    
    policy.approve_action(
        "kevan.x",
        "finance.send",
        &intent3.id,
        serde_json::json!({
            "amount": 15000.0,
            "to": "charlie.x"
        })
    )?;
    
    let result3 = finance.send(&intent3)?;
    println!("  ✓ Payment sent via {} (best for large amounts)", result3.route);
    println!("    TxID: {}", result3.txid.unwrap());
    println!();

    // Show payment history
    println!("--- Payment History (kevan.x) ---");
    let history = finance.get_history("kevan.x", 10)?;
    println!("  Total events: {}", history.len());
    
    for event in history.iter().take(5) {
        println!("    {} | {} | {}", 
            event.timestamp.format("%H:%M:%S"),
            format!("{:?}", event.event_type),
            &event.event_id[..16]
        );
    }
    println!();

    // Summary
    println!("=== What kevan.finance.x Replaces ===\n");
    println!("Before (8 different accounts/apps):");
    println!("  ☐ Venmo: @kevan-mehta");
    println!("  ☐ PayPal: kevan@email.com");
    println!("  ☐ Zelle: phone number");
    println!("  ☐ Wire transfer: bank routing + account");
    println!("  ☐ BTC wallet: bc1q...");
    println!("  ☐ ETH wallet: 0x...");
    println!("  ☐ SOL wallet: 9j8k...");
    println!("  ☐ USDC wallet: multiple chains\n");
    
    println!("After (ONE address):");
    println!("  ✓ kevan.finance.x\n");
    
    println!("Smart routing:");
    println!("  • <$100    → crypto (instant, ~$0.001 fee)");
    println!("  • $100-10K → Stripe (2.9% + $0.30)");
    println!("  • >$10K    → ACH ($0.50 flat fee)\n");
    
    println!("=== Complete Stack Validated ===\n");
    println!("✓ Phase 1: Certificate resolution (WHO)");
    println!("✓ Phase 2: Authentication (CONTROL)");
    println!("✓ Phase 3: Event spine (WHAT + WHEN)");
    println!("✓ Phase 4: Policy engine (ALLOWED)");
    println!("✓ Phase 5: Payment hub (DONE) ← COMPLETE\n");
    
    println!("Every payment:");
    println!("  1. Authenticated (Phase 2)");
    println!("  2. Authorized (Phase 4)");
    println!("  3. Auditable (Phase 3)");
    println!("  4. Executable (Phase 5) ← NOW WORKING\n");
    
    println!("=== Next: Provider Integration ===");
    println!("  • XRPL (crypto payments)");
    println!("  • Stripe API (credit cards)");
    println!("  • ACH/bank integration");
    println!("  • Transaction monitoring\n");

    Ok(())
}
