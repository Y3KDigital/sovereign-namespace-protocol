/// Telnyx API client for call control
///
/// Implements real-time call control:
/// - Answer calls
/// - Reject calls
/// - Hangup calls
/// - Forward calls
///
/// Uses Telnyx Call Control API v2:
/// https://developers.telnyx.com/docs/v2/call-control

use serde::{Deserialize, Serialize};

/// Telnyx API client
#[derive(Clone)]
pub struct TelnyxClient {
    api_key: String,
    base_url: String,
}

impl TelnyxClient {
    /// Create new Telnyx API client
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://api.telnyx.com/v2".to_string(),
        }
    }

    /// Answer an incoming call
    ///
    /// # Example
    /// ```no_run
    /// use kevan_tel::TelnyxClient;
    ///
    /// #[tokio::main]
    /// async fn main() -> Result<(), Box<dyn std::error::Error>> {
    ///     let client = TelnyxClient::new("KEY...".to_string());
    ///     client.answer_call("call_123").await?;
    ///     Ok(())
    /// }
    /// ```
    pub async fn answer_call(&self, call_control_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/calls/{}/actions/answer", self.base_url, call_control_id);
        
        let client = reqwest::Client::new();
        let response = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({}))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await?;
            return Err(format!("Telnyx API error {}: {}", status, body).into());
        }

        Ok(())
    }

    /// Reject an incoming call
    ///
    /// # Arguments
    /// * `call_control_id` - The call control ID from webhook
    /// * `cause` - Reject reason (CALL_REJECTED, USER_BUSY, etc)
    pub async fn reject_call(&self, call_control_id: &str, cause: &str) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/calls/{}/actions/reject", self.base_url, call_control_id);
        
        let client = reqwest::Client::new();
        let response = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "cause": cause
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await?;
            return Err(format!("Telnyx API error {}: {}", status, body).into());
        }

        Ok(())
    }

    /// Hangup an active call
    pub async fn hangup_call(&self, call_control_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/calls/{}/actions/hangup", self.base_url, call_control_id);
        
        let client = reqwest::Client::new();
        let response = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({}))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await?;
            return Err(format!("Telnyx API error {}: {}", status, body).into());
        }

        Ok(())
    }

    /// Bridge (forward) a call to another number
    ///
    /// # Arguments
    /// * `call_control_id` - The call control ID from webhook
    /// * `to` - Destination phone number (E.164 format)
    pub async fn bridge_call(&self, call_control_id: &str, to: &str) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/calls/{}/actions/bridge", self.base_url, call_control_id);
        
        let client = reqwest::Client::new();
        let response = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "to": to
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await?;
            return Err(format!("Telnyx API error {}: {}", status, body).into());
        }

        Ok(())
    }

    /// Dial a number (forward incoming call to destination)
    ///
    /// This is the correct method for kevan.x → SIM bridging.
    /// Uses the "dial" action to create a new outbound leg and bridge audio.
    ///
    /// # Arguments
    /// * `call_control_id` - The call control ID from webhook (incoming call)
    /// * `from` - Caller ID to present (usually the original called number)
    /// * `to` - Destination phone number (E.164 format, e.g., "+18722548473")
    /// * `timeout` - Ring timeout in seconds (default: 30)
    ///
    /// # Example
    /// ```no_run
    /// // Forward +1-321-485-8333 call to SIM +1-872-254-8473
    /// client.dial_number("call_ctrl_123", "+13214858333", "+18722548473", 30).await?;
    /// ```
    pub async fn dial_number(
        &self,
        call_control_id: &str,
        from: &str,
        to: &str,
        timeout: u32,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/calls/{}/actions/dial", self.base_url, call_control_id);
        
        let client = reqwest::Client::new();
        let response = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "from": from,
                "to": to,
                "timeout": timeout,
                "time_limit": 3600,
                "answering_machine_detection": "disabled"
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await?;
            return Err(format!("Telnyx API error {}: {}", status, body).into());
        }

        Ok(())
    }

    /// Speak text to caller (text-to-speech)
    ///
    /// Useful for rejection messages or IVR
    pub async fn speak(&self, call_control_id: &str, text: &str) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/calls/{}/actions/speak", self.base_url, call_control_id);
        
        let client = reqwest::Client::new();
        let response = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "payload": text,
                "voice": "female",
                "language": "en-US"
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await?;
            return Err(format!("Telnyx API error {}: {}", status, body).into());
        }

        Ok(())
    }
}

/// Telnyx webhook event types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TelnyxEventType {
    CallInitiated,
    CallAnswered,
    CallHangup,
    CallMachineDetectionEnded,
}

/// Telnyx webhook payload
///
/// Full webhook structure from Telnyx:
/// https://developers.telnyx.com/docs/v2/call-control/receiving-webhooks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelnyxWebhook {
    pub data: TelnyxWebhookData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelnyxWebhookData {
    pub event_type: String,
    pub id: String,
    pub occurred_at: String,
    pub payload: TelnyxCallPayload,
    pub record_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelnyxCallPayload {
    pub call_control_id: String,
    pub call_leg_id: String,
    pub call_session_id: String,
    pub client_state: Option<String>,
    pub connection_id: String,
    pub direction: String,
    pub from: String,
    pub to: String,
    pub state: String,
}

impl TelnyxWebhook {
    /// Parse webhook from JSON
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }

    /// Get call control ID for API calls
    pub fn call_control_id(&self) -> &str {
        &self.data.payload.call_control_id
    }

    /// Get caller phone number
    pub fn from(&self) -> &str {
        &self.data.payload.from
    }

    /// Get called phone number
    pub fn to(&self) -> &str {
        &self.data.payload.to
    }

    /// Get event type
    pub fn event_type(&self) -> &str {
        &self.data.event_type
    }

    /// Check if this is a new incoming call
    pub fn is_call_initiated(&self) -> bool {
        self.data.event_type == "call.initiated"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_telnyx_webhook() {
        let json = r#"{
            "data": {
                "event_type": "call.initiated",
                "id": "event_123",
                "occurred_at": "2026-01-17T12:00:00Z",
                "payload": {
                    "call_control_id": "call_ctrl_123",
                    "call_leg_id": "leg_123",
                    "call_session_id": "session_123",
                    "connection_id": "conn_123",
                    "direction": "incoming",
                    "from": "+15551234567",
                    "to": "+18886115384",
                    "state": "ringing"
                },
                "record_type": "event"
            }
        }"#;

        let webhook = TelnyxWebhook::from_json(json).unwrap();
        assert_eq!(webhook.call_control_id(), "call_ctrl_123");
        assert_eq!(webhook.from(), "+15551234567");
        assert_eq!(webhook.to(), "+18886115384");
        assert!(webhook.is_call_initiated());
    }

    #[test]
    fn test_telnyx_client_creation() {
        let client = TelnyxClient::new("KEY123".to_string());
        assert_eq!(client.api_key, "KEY123");
        assert_eq!(client.base_url, "https://api.telnyx.com/v2");
    }
}
