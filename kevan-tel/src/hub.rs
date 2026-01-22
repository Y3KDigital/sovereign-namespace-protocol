use crate::{IncomingCall, NumberMap, CallAuth, AuthDecision};
use kevan_events::{Event, EventStore, EventType};
use serde_json::json;
use std::error::Error;

/// Telephony hub - orchestrates incoming calls
pub struct TelHub {
    events: EventStore,
    numbers: NumberMap,
    #[allow(dead_code)]
    api_key: String,
}

impl TelHub {
    pub fn new(events: EventStore, api_key: String) -> Self {
        Self {
            events,
            numbers: NumberMap::load_kevan_numbers(),
            api_key,
        }
    }

    /// Handle incoming call webhook from Telnyx
    ///
    /// Flow:
    /// 1. Write tel.call_inbound event
    /// 2. Check authentication (does caller have *.x cert?)
    /// 3. If authenticated → connect (write tel.call_authenticated)
    /// 4. If not → reject/voicemail (write tel.call_rejected)
    pub async fn handle_incoming_call(
        &self,
        call: &IncomingCall,
        auth: &CallAuth,
    ) -> Result<AuthDecision, Box<dyn Error>> {
        // Step 1: Write inbound event
        self.write_inbound_event(call)?;

        // Step 2: Check authentication
        let decision = self.authenticate_caller(call, auth);

        // Step 3: Write auth decision event
        match &decision {
            AuthDecision::Authenticated { namespace } => {
                self.write_authenticated_event(call, namespace)?;
            }
            AuthDecision::Allowlisted => {
                self.write_authenticated_event(call, "allowlisted")?;
            }
            AuthDecision::Rejected => {
                self.write_rejected_event(call)?;
            }
        }

        Ok(decision)
    }

    /// Authenticate caller - check if they have valid *.x certificate
    fn authenticate_caller(&self, call: &IncomingCall, auth: &CallAuth) -> AuthDecision {
        // Check allowlist first
        if auth.is_allowlisted(&call.from) {
            return AuthDecision::Allowlisted;
        }

        // Check if caller has registered namespace
        if let Some(namespace) = auth.is_authenticated(&call.from) {
            return AuthDecision::Authenticated { namespace };
        }

        // Default: reject
        AuthDecision::Rejected
    }

    /// Make outbound call (future)
    pub async fn make_call(
        &self,
        from_namespace: &str,
        to_phone: &str,
    ) -> Result<String, Box<dyn Error>> {
        // Implement Telnyx API call stub
        // Log the event so it shows in 'tel logs'
        let event = Event::new(
            from_namespace,
            EventType::TelCallOutbound,
            json!({
                "to": to_phone,
                "from": from_namespace,
                "sid": "call_stub"
            }),
        );
        self.events.write(&event)?;

        Ok("call_stub".to_string())
    }

    /// Get call history for namespace
    pub fn get_history(&self, namespace: &str, limit: usize) -> Result<Vec<Event>, Box<dyn Error>> {
        let events = self.events.find_by_actor(namespace, None, limit)?;
        Ok(events.into_iter().filter(|e| {
            matches!(
                e.event_type,
                EventType::TelCallInbound
                    | EventType::TelCallAuthenticated
                    | EventType::TelCallRejected
                    | EventType::TelCallOutbound
            )
        }).collect())
    }

    /// List all managed numbers
    pub fn list_numbers(&self) -> Vec<crate::TelnyxNumber> {
        self.numbers.list().into_iter().cloned().collect()
    }

    // --- Event writers ---

    fn write_inbound_event(&self, call: &IncomingCall) -> Result<(), Box<dyn Error>> {
        // Lookup which namespace owns the called number
        let namespace = self
            .numbers
            .lookup(&call.to)
            .map(|n| n.namespace.as_str())
            .unwrap_or("unknown");

        let event = Event::new(
            namespace,
            EventType::TelCallInbound,
            json!({
                "call_id": call.call_id,
                "from": call.from,
                "to": call.to,
                "timestamp": call.timestamp,
            }),
        );
        self.events.write(&event)?;
        Ok(())
    }

    fn write_authenticated_event(
        &self,
        call: &IncomingCall,
        caller_namespace: &str,
    ) -> Result<(), Box<dyn Error>> {
        let namespace = self
            .numbers
            .lookup(&call.to)
            .map(|n| n.namespace.as_str())
            .unwrap_or("unknown");

        let event = Event::new(
            namespace,
            EventType::TelCallAuthenticated,
            json!({
                "call_id": call.call_id,
                "from": call.from,
                "caller_namespace": caller_namespace,
                "authenticated": true,
            }),
        );
        self.events.write(&event)?;
        Ok(())
    }

    fn write_rejected_event(&self, call: &IncomingCall) -> Result<(), Box<dyn Error>> {
        let namespace = self
            .numbers
            .lookup(&call.to)
            .map(|n| n.namespace.as_str())
            .unwrap_or("unknown");

        let event = Event::new(
            namespace,
            EventType::TelCallRejected,
            json!({
                "call_id": call.call_id,
                "from": call.from,
                "reason": "not_authenticated",
            }),
        );
        self.events.write(&event)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use std::path::Path;

    fn create_test_hub() -> TelHub {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test-events.db");
        let events = EventStore::new(&db_path).unwrap();
        let api_key = "KEY019BCAD8B1D924108FDC5B7BCBC6A2C7_6Kt9Qq9Tgc436GcruXb3T7";
        TelHub::new(events, api_key.to_string())
    }

    #[tokio::test]
    async fn test_handle_rejected_call() {
        let hub = create_test_hub();
        let call = IncomingCall::new("call_123", "+15551234567", "+18886115384");
        
        // Create auth with empty cert store (no one authenticated)
        let store = kevan_resolver::CertificateStore::new();
        let auth = CallAuth::new(store);

        let decision = hub.handle_incoming_call(&call, &auth).await.unwrap();
        assert_eq!(decision, AuthDecision::Rejected);
    }

    #[test]
    fn test_number_map_loaded() {
        let hub = create_test_hub();
        let kevan_numbers = hub.numbers.for_namespace("kevan.tel.x");
        assert_eq!(kevan_numbers.len(), 26);
    }

    #[test]
    fn test_get_history() {
        let hub = create_test_hub();
        let history = hub.get_history("kevan.tel.x", 10).unwrap();
        // Should be empty initially
        assert_eq!(history.len(), 0);
    }
}
