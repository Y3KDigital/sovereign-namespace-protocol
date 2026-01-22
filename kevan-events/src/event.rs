use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::hash::compute_event_id;

/// Event types representing all possible actions in the system.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EventType {
    // Phase 2: Authentication
    AuthChallenge,       // Challenge generated
    AuthLogin,           // Session created (signature verified)
    AuthLogout,          // Session destroyed
    AuthSessionExpired,  // Session expired naturally

    // Phase 4: Policy (future)
    PolicyApprove,       // User approved action
    PolicyDeny,          // User denied action
    PolicyDelegate,      // Delegation issued
    PolicyRevoke,        // Delegation revoked

    // Phase 5: Finance (future)
    FinanceIntent,       // Payment requested
    FinanceApprove,      // Payment approved
    FinanceExecute,      // Payment sent
    FinanceComplete,     // Payment confirmed
    FinanceFail,         // Payment failed
    FinanceReceive,      // Payment received

    // Phase 5: Telephony (future)
    TelCallInbound,      // Incoming call
    TelCallOutbound,     // Outgoing call
    TelCallAuthenticated,// Call authenticated via namespace
    TelCallRejected,     // Call rejected (no auth)

    // Phase 5: Storage (future)
    VaultWrite,          // File stored
    VaultRead,           // File retrieved
    VaultDelete,         // File deleted
    VaultArchive,        // File archived to Arweave

    // Phase 6: Mail (Communication)
    MailSend,            // Message sent
    MailReceive,         // Message received
}

impl EventType {
    pub fn as_str(&self) -> &'static str {
        match self {
            EventType::AuthChallenge => "auth.challenge",
            EventType::AuthLogin => "auth.login",
            EventType::AuthLogout => "auth.logout",
            EventType::AuthSessionExpired => "auth.session_expired",
            EventType::PolicyApprove => "policy.approve",
            EventType::PolicyDeny => "policy.deny",
            EventType::PolicyDelegate => "policy.delegate",
            EventType::PolicyRevoke => "policy.revoke",
            EventType::FinanceIntent => "finance.intent",
            EventType::FinanceApprove => "finance.approve",
            EventType::FinanceExecute => "finance.execute",
            EventType::FinanceComplete => "finance.complete",
            EventType::FinanceFail => "finance.fail",
            EventType::FinanceReceive => "finance.receive",
            EventType::TelCallInbound => "tel.call_inbound",
            EventType::TelCallOutbound => "tel.call_outbound",
            EventType::TelCallAuthenticated => "tel.call_authenticated",
            EventType::TelCallRejected => "tel.call_rejected",
            EventType::VaultWrite => "vault.write",
            EventType::VaultRead => "vault.read",
            EventType::VaultDelete => "vault.delete",
            EventType::VaultArchive => "vault.archive",
            EventType::MailSend => "mail.send",
            EventType::MailReceive => "mail.receive",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "auth.challenge" => Some(EventType::AuthChallenge),
            "auth.login" => Some(EventType::AuthLogin),
            "auth.logout" => Some(EventType::AuthLogout),
            "auth.session_expired" => Some(EventType::AuthSessionExpired),
            "policy.approve" => Some(EventType::PolicyApprove),
            "policy.deny" => Some(EventType::PolicyDeny),
            "policy.delegate" => Some(EventType::PolicyDelegate),
            "policy.revoke" => Some(EventType::PolicyRevoke),
            "finance.intent" => Some(EventType::FinanceIntent),
            "finance.approve" => Some(EventType::FinanceApprove),
            "finance.execute" => Some(EventType::FinanceExecute),
            "finance.complete" => Some(EventType::FinanceComplete),
            "finance.fail" => Some(EventType::FinanceFail),
            "finance.receive" => Some(EventType::FinanceReceive),
            "tel.call_inbound" => Some(EventType::TelCallInbound),
            "tel.call_outbound" => Some(EventType::TelCallOutbound),
            "tel.call_authenticated" => Some(EventType::TelCallAuthenticated),
            "tel.call_rejected" => Some(EventType::TelCallRejected),
            "vault.write" => Some(EventType::VaultWrite),
            "vault.read" => Some(EventType::VaultRead),
            "vault.delete" => Some(EventType::VaultDelete),
            "vault.archive" => Some(EventType::VaultArchive),
            "mail.send" => Some(EventType::MailSend),
            "mail.receive" => Some(EventType::MailReceive),
            _ => None,
        }
    }
}

/// Immutable event representing a single action in the system.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    /// SHA256 hash of (actor || type || payload || timestamp)
    pub event_id: String,

    /// Namespace that performed the action (e.g., "kevan.x")
    pub actor: String,

    /// Type of event
    pub event_type: EventType,

    /// JSON payload with event-specific data
    pub payload: serde_json::Value,

    /// When the event occurred (ISO 8601)
    pub timestamp: DateTime<Utc>,

    /// Optional link to previous event (for chaining)
    pub previous_hash: Option<String>,

    /// Unix timestamp for efficient indexing
    #[serde(skip)]
    pub created_at: i64,
}

impl Event {
    /// Create a new event (generates ID automatically)
    pub fn new(
        actor: impl Into<String>,
        event_type: EventType,
        payload: serde_json::Value,
    ) -> Self {
        let timestamp = Utc::now();
        let actor = actor.into();
        let created_at = timestamp.timestamp();

        let event_id = compute_event_id(
            &actor,
            event_type.as_str(),
            &payload.to_string(),
            &timestamp.to_rfc3339(),
        );

        Self {
            event_id,
            actor,
            event_type,
            payload,
            timestamp,
            previous_hash: None,
            created_at,
        }
    }

    /// Create a new event with link to previous event (for chaining)
    pub fn new_with_previous(
        actor: impl Into<String>,
        event_type: EventType,
        payload: serde_json::Value,
        previous_hash: &str,
    ) -> Self {
        let mut event = Self::new(actor, event_type, payload);
        event.previous_hash = Some(previous_hash.to_string());
        event
    }

    /// Verify event integrity (recompute hash)
    pub fn verify(&self) -> bool {
        let computed = compute_event_id(
            &self.actor,
            self.event_type.as_str(),
            &self.payload.to_string(),
            &self.timestamp.to_rfc3339(),
        );
        computed == self.event_id
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_type_string_conversion() {
        assert_eq!(EventType::AuthLogin.as_str(), "auth.login");
        assert_eq!(EventType::FinanceIntent.as_str(), "finance.intent");
        assert_eq!(EventType::VaultWrite.as_str(), "vault.write");
    }

    #[test]
    fn test_event_verification() {
        let event = Event::new(
            "kevan.x",
            EventType::AuthLogin,
            serde_json::json!({"session_id": "test"})
        );

        assert!(event.verify());
    }

    #[test]
    fn test_event_id_deterministic_for_same_inputs() {
        let timestamp = Utc::now();
        let actor = "kevan.x";
        let payload = serde_json::json!({"test": "data"});

        let id1 = compute_event_id(
            actor,
            EventType::AuthLogin.as_str(),
            &payload.to_string(),
            &timestamp.to_rfc3339(),
        );

        let id2 = compute_event_id(
            actor,
            EventType::AuthLogin.as_str(),
            &payload.to_string(),
            &timestamp.to_rfc3339(),
        );

        assert_eq!(id1, id2);
    }
}
