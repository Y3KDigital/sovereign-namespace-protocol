//! # kevan-events: Event Spine (Truth Layer)
//!
//! Immutable event log proving WHO did WHAT and WHEN.
//!
//! ## Core Invariant
//!
//! Every action must produce an event. Events are:
//! - Immutable (never updated or deleted)
//! - Cryptographically identified (SHA256 hash)
//! - Temporally ordered (timestamp + creation index)
//! - Actor-bound (tied to verified namespace)
//!
//! ## Architecture
//!
//! One table. One truth.
//!
//! ```sql
//! CREATE TABLE events (
//!     event_id TEXT PRIMARY KEY,
//!     actor TEXT NOT NULL,
//!     event_type TEXT NOT NULL,
//!     payload TEXT NOT NULL,
//!     timestamp TEXT NOT NULL,
//!     previous_hash TEXT,
//!     created_at INTEGER NOT NULL
//! );
//! ```
//!
//! ## Usage
//!
//! ```rust,no_run
//! use kevan_events::{EventStore, Event, EventType};
//! use std::path::Path;
//!
//! let store = EventStore::new(Path::new("events.db"))?;
//!
//! // Write event
//! let event = Event::new(
//!     "kevan.x",
//!     EventType::AuthLogin,
//!     serde_json::json!({"session_id": "abc123"})
//! );
//! store.write(&event)?;
//!
//! // Query events
//! let events = store.find_by_actor("kevan.x", None, 100)?;
//! # Ok::<(), Box<dyn std::error::Error>>(())
//! ```

mod event;
mod store;
mod hash;

pub use event::{Event, EventType};
pub use store::EventStore;
pub use hash::compute_event_id;

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    use std::path::Path;

    #[test]
    fn test_event_creation() {
        let event = Event::new(
            "kevan.x",
            EventType::AuthLogin,
            serde_json::json!({"session_id": "test123"})
        );

        assert_eq!(event.actor, "kevan.x");
        assert_eq!(event.event_type, EventType::AuthLogin);
        assert!(!event.event_id.is_empty());
        assert!(event.previous_hash.is_none());
    }

    #[test]
    fn test_event_store() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test_events.db");
        let store = EventStore::new(&db_path).unwrap();

        let event = Event::new(
            "kevan.x",
            EventType::AuthLogin,
            serde_json::json!({"session_id": "test123"})
        );

        store.write(&event).unwrap();

        let events = store.find_by_actor("kevan.x", None, 100).unwrap();
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].actor, "kevan.x");
    }

    #[test]
    fn test_event_immutability() {
        let event = Event::new(
            "kevan.x",
            EventType::AuthLogin,
            serde_json::json!({"test": "data"})
        );

        let event_id = event.event_id.clone();

        // Create identical event - should produce DIFFERENT ID due to timestamp
        std::thread::sleep(std::time::Duration::from_millis(1));
        let event2 = Event::new(
            "kevan.x",
            EventType::AuthLogin,
            serde_json::json!({"test": "data"})
        );

        assert_ne!(event_id, event2.event_id);
    }

    #[test]
    fn test_event_chaining() {
        let event1 = Event::new(
            "kevan.x",
            EventType::AuthLogin,
            serde_json::json!({"session": "1"})
        );

        let event2 = Event::new_with_previous(
            "kevan.x",
            EventType::AuthLogout,
            serde_json::json!({"session": "1"}),
            &event1.event_id
        );

        assert_eq!(event2.previous_hash.unwrap(), event1.event_id);
    }

    #[test]
    fn test_event_type_serialization() {
        let event = Event::new(
            "kevan.x",
            EventType::FinanceIntent,
            serde_json::json!({"amount": 100})
        );

        let json = serde_json::to_string(&event).unwrap();
        let deserialized: Event = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.event_type, EventType::FinanceIntent);
    }
}
