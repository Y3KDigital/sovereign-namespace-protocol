use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Incoming call from Telnyx webhook
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncomingCall {
    /// Call ID from Telnyx
    pub call_id: String,
    /// Caller's phone number (E.164 format)
    pub from: String,
    /// Called number (one of our 26 numbers)
    pub to: String,
    /// Call direction ("inbound" or "outbound")
    pub direction: String,
    /// Call state ("initiated", "ringing", "answered", "hangup")
    pub state: String,
    /// Timestamp
    pub timestamp: DateTime<Utc>,
}

impl IncomingCall {
    pub fn new(call_id: &str, from: &str, to: &str) -> Self {
        Self {
            call_id: call_id.to_string(),
            from: from.to_string(),
            to: to.to_string(),
            direction: "inbound".to_string(),
            state: "initiated".to_string(),
            timestamp: Utc::now(),
        }
    }

    pub fn is_inbound(&self) -> bool {
        self.direction == "inbound"
    }

    pub fn is_answered(&self) -> bool {
        self.state == "answered"
    }
}

/// Call event types from Telnyx
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "event_type")]
pub enum CallEvent {
    CallInitiated { call: IncomingCall },
    CallRinging { call: IncomingCall },
    CallAnswered { call: IncomingCall },
    CallHangup { call: IncomingCall, reason: String },
}

impl CallEvent {
    pub fn call(&self) -> &IncomingCall {
        match self {
            CallEvent::CallInitiated { call } => call,
            CallEvent::CallRinging { call } => call,
            CallEvent::CallAnswered { call } => call,
            CallEvent::CallHangup { call, .. } => call,
        }
    }

    pub fn is_new_call(&self) -> bool {
        matches!(self, CallEvent::CallInitiated { .. })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_incoming_call_creation() {
        let call = IncomingCall::new("call_123", "+15551234567", "+18886115384");
        assert_eq!(call.call_id, "call_123");
        assert_eq!(call.from, "+15551234567");
        assert_eq!(call.to, "+18886115384");
        assert!(call.is_inbound());
    }

    #[test]
    fn test_call_event_is_new() {
        let call = IncomingCall::new("call_123", "+15551234567", "+18886115384");
        let event = CallEvent::CallInitiated { call: call.clone() };
        assert!(event.is_new_call());

        let event2 = CallEvent::CallAnswered { call };
        assert!(!event2.is_new_call());
    }

    #[test]
    fn test_call_event_serialization() {
        let call = IncomingCall::new("call_123", "+15551234567", "+18886115384");
        let event = CallEvent::CallInitiated { call };
        
        let json = serde_json::to_string(&event).unwrap();
        let deserialized: CallEvent = serde_json::from_str(&json).unwrap();
        
        assert!(deserialized.is_new_call());
    }
}
