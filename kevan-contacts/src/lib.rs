use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Contact {
    pub namespace: String,       // "mom.x" - The Anchor
    pub relationship: Relation,  // The Context
    pub priority: Priority,      // The Access Level
    pub channels: Vec<Channel>,  // Resolved capabilities (derived from Identity)
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Relation {
    Family,
    Medical,
    Legal,
    Friend,
    Network,
    Service,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Priority {
    Emergency,  // Bypasses all filters. Wake on LAN.
    High,       // Notify immediately.
    Standard,   // Batch notify.
    Low,        // No notify. Pull only.
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Channel {
    SovereignMail,
    LegacyEmail(String),
    SovereignTel,
    LegacySms(String),
    Signal,
}

impl Contact {
    pub fn new(namespace: &str, relationship: Relation, priority: Priority) -> Self {
        Self {
            namespace: namespace.to_string(),
            relationship,
            priority,
            channels: vec![],
        }
    }
}
