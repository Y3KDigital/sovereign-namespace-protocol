//! # kevan-policy: Policy Engine (Authorization Layer)
//!
//! Defines what actions are allowed and under what conditions.
//!
//! ## Core Invariant
//!
//! Every action must pass policy check BEFORE execution.
//!
//! Policy answers:
//! - Is this action allowed at all?
//! - Does it require approval?
//! - Is there a recent approval event?
//! - Is the approval still valid (not expired)?
//! - Is this action delegatable?
//!
//! ## Architecture
//!
//! Policy CONSUMES events (what happened) and GATES execution (what is allowed).
//!
//! ```text
//! Action Request → Policy Check → [Approved?] → Execute → Write Event
//!                       ↓
//!                  Query Events
//!                  (approval?)
//! ```
//!
//! ## Usage
//!
//! ```rust,no_run
//! use kevan_policy::{PolicyEngine, Policy, PolicyDecision};
//! use kevan_events::EventStore;
//! use std::path::Path;
//!
//! let events = EventStore::new(Path::new("events.db"))?;
//! let engine = PolicyEngine::new(events);
//!
//! // Check if action is allowed
//! let decision = engine.check_finance_send(
//!     "kevan.x",
//!     100.0, // amount
//! )?;
//!
//! match decision {
//!     PolicyDecision::AutoApproved => {
//!         // Execute immediately
//!     }
//!     PolicyDecision::Approved => {
//!         // Execute (approval found)
//!     }
//!     PolicyDecision::RequiresApproval => {
//!         // Prompt user, wait for approval event
//!     }
//!     PolicyDecision::Denied(reason) => {
//!         // Reject
//!     }
//! }
//! # Ok::<(), Box<dyn std::error::Error>>(())
//! ```

mod policy;
mod engine;
mod decision;
mod delegation;

pub use policy::{Policy, PolicyRule, AmountThreshold};
pub use engine::PolicyEngine;
pub use decision::PolicyDecision;
pub use delegation::{Delegation, Role, Permission, Constraints};

#[cfg(test)]
mod tests {
    use super::*;
    use kevan_events::{EventStore, Event, EventType};
    use tempfile::tempdir;

    #[test]
    fn test_policy_engine_creation() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let events = EventStore::new(&db_path).unwrap();
        let engine = PolicyEngine::new(events);
        
        assert!(true); // Engine created successfully
    }

    #[test]
    fn test_auto_approve_small_amount() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let events = EventStore::new(&db_path).unwrap();
        let engine = PolicyEngine::new(events);

        let decision = engine.check_finance_send("kevan.x", 50.0).unwrap();
        assert!(matches!(decision, PolicyDecision::AutoApproved));
    }

    #[test]
    fn test_require_approval_large_amount() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let events = EventStore::new(&db_path).unwrap();
        let engine = PolicyEngine::new(events);

        let decision = engine.check_finance_send("kevan.x", 500.0).unwrap();
        assert!(matches!(decision, PolicyDecision::RequiresApproval));
    }

    #[test]
    fn test_approved_if_recent_approval_event() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let events = EventStore::new(&db_path).unwrap();

        // Write approval event
        let approval = Event::new(
            "kevan.x",
            EventType::PolicyApprove,
            serde_json::json!({
                "action": "finance.send",
                "amount": 500.0,
                "payment_id": "test123"
            })
        );
        events.write(&approval).unwrap();

        let engine = PolicyEngine::new(events);
        let decision = engine.check_finance_send_with_approval(
            "kevan.x",
            500.0,
            "test123"
        ).unwrap();

        assert!(matches!(decision, PolicyDecision::Approved));
    }
}
