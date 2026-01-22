# kevan.finance.x - Universal Payment Hub

Replace ALL payment accounts with ONE address.

## Architecture

```
kevan.finance.x resolves to:
  • Crypto: BTC/ETH/SOL/USDC wallets
  • Stripe: payment processing  
  • ACH: direct bank routing
  • PayPal: legacy compatibility

Smart routing:
  • <$100      → crypto (instant, low fee)
  • $100-10K   → Stripe (2.9% + 30¢)
  • >$10K      → ACH (secure, direct)
```

## Before kevan.finance.x

```
☐ Venmo: @kevan-mehta
☐ PayPal: kevan@email.com
☐ Zelle: phone number
☐ Wire transfer: bank routing + account
☐ BTC wallet: bc1q...
☐ ETH wallet: 0x...
☐ SOL wallet: 9j8k...
☐ USDC wallet: multiple chains
```

**8 different addresses/accounts/apps.**

## After kevan.finance.x

```
✓ kevan.finance.x
```

**ONE address. Smart routing handles everything.**

## Integration with Policy + Events

Every payment flows through the complete stack:

```rust
use kevan_finance::{FinanceHub, PaymentIntent};
use kevan_policy::PolicyEngine;
use kevan_events::EventStore;

// Initialize stack
let events = EventStore::new("./kevan-events.db")?;
let policy = PolicyEngine::new(events.clone());
let finance = FinanceHub::new(events);

// Create payment intent
let intent = PaymentIntent::new("kevan.x", "alice.x", 500.0, "USD")
    .with_memo("Coffee payment");

// Check policy (auto <$100, require ≥$100)
let decision = policy.check_finance_send("kevan.x", 500.0)?;

if decision.requires_user_action() {
    // User approves in UI
    policy.approve_action(
        "kevan.x", 
        "finance.send", 
        &intent.id,
        serde_json::json!({"amount": 500.0, "to": "alice.x"})
    )?;
}

// Execute payment (smart routing)
let result = finance.send(&intent)?;

// Events written automatically:
// 1. finance.intent (payment created)
// 2. policy.approve (if required)
// 3. finance.execute (payment sent via stripe)
// 4. finance.complete (payment confirmed)
```

## Smart Routing Logic

```rust
use kevan_finance::PaymentRoute;

// Small payment → crypto (instant, ~$0.001 fee)
let route = PaymentRoute::choose_route(50.0);
assert_eq!(route, PaymentRoute::Crypto);

// Medium payment → Stripe (2.9% + $0.30)
let route = PaymentRoute::choose_route(500.0);
assert_eq!(route, PaymentRoute::Stripe);

// Large payment → ACH ($0.50 flat fee)
let route = PaymentRoute::choose_route(15000.0);
assert_eq!(route, PaymentRoute::ACH);
```

## Fee Comparison

| Amount | Route | Fee | Total Cost |
|--------|-------|-----|------------|
| $50 | Crypto | $0.001 | $50.00 |
| $500 | Stripe | $14.80 | $514.80 |
| $15,000 | ACH | $0.50 | $15,000.50 |

## Payment History

```rust
// Get payment history
let history = finance.get_history("kevan.x", 10)?;

for event in history {
    println!("{} | {} | {}", 
        event.timestamp.format("%Y-%m-%d %H:%M:%S"),
        event.event_type,
        event.event_id
    );
}

// Output:
// 2026-01-17 08:30:15 | finance.complete | 0xabc...
// 2026-01-17 08:30:14 | finance.execute | 0xdef...
// 2026-01-17 08:30:13 | finance.intent | 0x123...
```

## Implementation Status

### ✅ Phase 1: Core Architecture
- [x] PaymentIntent struct (ID generation, memo support)
- [x] Smart routing logic (<$100 crypto, $100-10K Stripe, >10K ACH)
- [x] Fee estimation per route
- [x] Event writing (finance.intent, execute, complete)
- [x] Payment history query
- [x] Policy integration API
- [x] Tests (14 passing)

### 🚧 Phase 2: Provider Integration (Next)
- [ ] XRPL integration (crypto payments)
- [ ] Solana/USDC integration
- [ ] Stripe API integration
- [ ] ACH/bank integration
- [ ] PayPal API integration
- [ ] Real-time transaction monitoring
- [ ] Webhook handlers for confirmations

### 📋 Phase 3: Production Features (Future)
- [ ] Multi-currency support
- [ ] Exchange rate handling
- [ ] Refund processing
- [ ] Dispute resolution
- [ ] Compliance (KYC/AML)
- [ ] Tax reporting integration

## What This Replaces

Replace 8 apps/accounts with ONE address:

| Old System | kevan.finance.x |
|------------|-----------------|
| Venmo app | ✓ |
| PayPal account | ✓ |
| Zelle (bank) | ✓ |
| Wire instructions | ✓ |
| BTC wallet | ✓ |
| ETH wallet | ✓ |
| SOL wallet | ✓ |
| USDC (multi-chain) | ✓ |

**Result:** ONE address, smart routing, full audit trail, policy enforcement.

## Why This Works

1. **Identity** (Phase 1): kevan.x certificate proves WHO
2. **Auth** (Phase 2): Signature proves CONTROL
3. **Events** (Phase 3): Every payment is AUDITABLE
4. **Policy** (Phase 4): Every payment is AUTHORIZED
5. **Finance** (Phase 5): Every payment is EXECUTABLE

You give someone `kevan.finance.x` → they send money → smart routing handles everything → events record everything → you have full sovereignty.

## Next Steps

1. **Integrate with real payment providers** (XRPL, Stripe, ACH)
2. **Build UI for approval flow** (when policy requires approval)
3. **Add transaction monitoring** (webhooks, confirmations)
4. **Test with real money** (start small, validate flow)
5. **Document living proof** (replace your Venmo/PayPal/etc)

Then move to Phase 6: kevan.tel.x (phone integration).
