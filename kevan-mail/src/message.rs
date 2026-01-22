use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    Email,
    Signal,
    SMS,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub from: String, // namespace or address
    pub to: String,   // namespace or address
    pub subject: Option<String>,
    pub body: String,
    pub msg_type: MessageType,
    pub created_at: DateTime<Utc>,
}

impl Message {
    pub fn new(from: &str, to: &str, body: &str, msg_type: MessageType) -> Self {
        Self {
            id:  uuid::Uuid::new_v4().to_string(), // Requires uuid crate or simple generation
            from: from.to_string(),
            to: to.to_string(),
            subject: None,
            body: body.to_string(),
            msg_type,
            created_at: Utc::now(),
        }
    }

    pub fn with_subject(mut self, subject: &str) -> Self {
        self.subject = Some(subject.to_string());
        self
    }
}
