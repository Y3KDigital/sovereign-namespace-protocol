use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Event {
    pub id: String,
    pub title: String,
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
    pub participants: Vec<String>,
    pub policy: TimePolicy,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TimePolicy {
    Immutable,  // Cannot be moved (Flight, Court)
    Flexible,   // Can be moved by Delegates
    Fluid,      // Can be moved by anyone trusted
}

impl Event {
    pub fn new(title: &str, start: DateTime<Utc>, duration_mins: i64, policy: TimePolicy) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            title: title.to_string(),
            start,
            end: start + chrono::Duration::minutes(duration_mins),
            participants: vec![],
            policy,
        }
    }

    pub fn with_participant(mut self, namespace: &str) -> Self {
        self.participants.push(namespace.to_string());
        self
    }
}
