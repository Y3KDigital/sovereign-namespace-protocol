//! # kevan.finance.x - Universal Payment Hub
//!
//! Replace ALL payment accounts with ONE address.
//!
//! ## Architecture
//!
//! ```text
//! kevan.finance.x resolves to:
//!   • Crypto: BTC/ETH/SOL/USDC wallets
//!   • Stripe: payment processing
//!   • ACH: direct bank routing
//!   • PayPal: legacy compatibility
//!
//! Smart routing:
//!   • <$100      → crypto (instant, low fee)
//!   • $100-10K   → Stripe (2.9% + 30¢)
//!   • >$10K      → ACH (secure, direct)
//! ```
//!
//! ## Integration with Policy + Events
//!
//! ```rust,no_run
//! use kevan_finance::{FinanceHub, PaymentIntent, PaymentRoute};
//! use kevan_policy::PolicyEngine;
//! use kevan_events::EventStore;
//! use std::path::Path;
//!
//! # fn main() -> Result<(), Box<dyn std::error::Error>> {
//! let events = EventStore::new(Path::new("./kevan-events.db"))?;
//! let policy = PolicyEngine::new(events.clone());
//! let finance = FinanceHub::new(events);
//!
//! // Step 1: Create payment intent
//! let intent = PaymentIntent::new("kevan.x", "alice.x", 500.0, "USD");
//!
//! // Step 2: Check policy (auto-approve <$100, require ≥$100)
//! let decision = policy.check_finance_send("kevan.x", 500.0)?;
//! if decision.requires_user_action() {
//!     // User approves in UI
//!     policy.approve_action("kevan.x", "finance.send", &intent.id, 
//!         serde_json::json!({"amount": 500.0, "to": "alice.x"}))?;
//! }
//!
//! // Step 3: Route payment (smart routing based on amount)
//! let result = finance.send(&intent)?;
//!
//! // Events written:
//! //   1. finance.intent (payment created)
//! //   2. policy.approve (if required)
//! //   3. finance.execute (payment sent)
//! //   4. finance.complete (payment confirmed)
//! # Ok(())
//! # }
//! ```

pub mod payment;
pub mod route;
pub mod hub;

pub use payment::{PaymentIntent, PaymentResult, PaymentStatus};
pub use route::{PaymentRoute, RouteDecision};
pub use hub::FinanceHub;

#[cfg(test)]
mod tests {
    use super::*;
    use kevan_events::EventStore;
    use tempfile::TempDir;

    #[test]
    fn test_finance_hub_creation() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test-events.db");
        let events = EventStore::new(&db_path).unwrap();
        let _hub = FinanceHub::new(events);
    }

    #[test]
    fn test_smart_routing_small_payment() {
        let route = PaymentRoute::choose_route(50.0);
        assert_eq!(route, PaymentRoute::Crypto);
    }

    #[test]
    fn test_smart_routing_medium_payment() {
        let route = PaymentRoute::choose_route(500.0);
        assert_eq!(route, PaymentRoute::Stripe);
    }

    #[test]
    fn test_smart_routing_large_payment() {
        let route = PaymentRoute::choose_route(15000.0);
        assert_eq!(route, PaymentRoute::ACH);
    }
}
