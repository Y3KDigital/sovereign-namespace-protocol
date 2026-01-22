//! # kevan.tel.x - Sovereign Phone System
//!
//! Replace phone numbers with namespace authentication.
//!
//! ## Architecture
//!
//! ```text
//! kevan.tel.x maps to 26 Telnyx numbers:
//!   • +1-888-611-5384
//!   • +1-888-474-8738 (vanity patterns)
//!   • +1-888-678-0645
//!   • ... (24 more)
//!
//! Incoming call flow:
//!   1. Webhook from Telnyx → tel.call_inbound event
//!   2. Lookup caller: do they have *.x certificate?
//!   3. If authenticated → connect (tel.call_authenticated)
//!   4. If not → voicemail/reject (tel.call_rejected)
//!
//! Result: ZERO spam calls
//! ```
//!
//! ## Before kevan.tel.x
//!
//! ```text
//! ☐ Personal phone: +1-770-230-0635
//! ☐ Business line: different number
//! ☐ Spam calls: 10-20 per day
//! ☐ Unknown callers: answer and hope
//! ☐ No caller authentication
//! ```
//!
//! ## After kevan.tel.x
//!
//! ```text
//! ✓ kevan.tel.x → 26 numbers (vanity patterns)
//! ✓ Only *.x namespaces can call
//! ✓ Zero spam (unauthenticated = auto-reject)
//! ✓ Full call audit trail (events)
//! ✓ Policy-gated forwarding
//! ```

pub mod numbers;
pub mod webhook;
pub mod auth;
pub mod hub;
pub mod telnyx_api;

pub use numbers::{TelnyxNumber, NumberMap};
pub use webhook::{IncomingCall, CallEvent};
pub use auth::{CallAuth, AuthDecision};
pub use hub::TelHub;
pub use telnyx_api::TelnyxClient;

#[cfg(test)]
mod tests {
    use super::*;
    use kevan_events::EventStore;
    use tempfile::TempDir;
    use std::path::Path;

    #[test]
    fn test_tel_hub_creation() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test-events.db");
        let events = EventStore::new(&db_path).unwrap();
        let api_key = "KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7";
        let _hub = TelHub::new(events, api_key.to_string());
    }

    #[test]
    fn test_number_parsing() {
        let number = TelnyxNumber::new("+1-888-611-5384", "kevan.tel.x");
        assert_eq!(number.e164(), "+18886115384");
        assert_eq!(number.namespace, "kevan.tel.x");
    }
}
