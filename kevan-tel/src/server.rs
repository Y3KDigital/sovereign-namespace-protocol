/// Webhook server for Telnyx integration
///
/// Receives webhooks from Telnyx on incoming calls, authenticates caller,
/// and controls call flow (answer/reject/forward)

use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::auth::CallAuth;
use crate::hub::TelHub;
use crate::telnyx_api::{TelnyxClient, TelnyxWebhook};
use crate::webhook::IncomingCall;
use crate::AuthDecision;
use kevan_events::EventStore;

/// Server state shared across requests
///
/// Uses Arc<Mutex<>> for thread-safe shared mutable state
pub struct ServerState {
    pub tel_hub: Arc<Mutex<TelHub>>,
    pub call_auth: Arc<CallAuth>,
    pub telnyx_client: Arc<TelnyxClient>,
}

/// Create webhook server
///
/// # Example
/// ```no_run
/// use kevan_tel::{TelHub, CallAuth, TelnyxClient};
/// use kevan_tel::server::create_webhook_server;
/// use kevan_events::EventStore;
/// use kevan_resolver::CertificateStore;
/// use std::path::Path;
/// use std::sync::Arc;
///
/// #[tokio::main]
/// async fn main() -> Result<(), Box<dyn std::error::Error>> {
///     let events = EventStore::new(Path::new("./kevan-tel.db"))?;
///     let hub = TelHub::new(events, "KEY123".to_string());
///     let auth = CallAuth::new(CertificateStore::new());
///     let telnyx = TelnyxClient::new("KEY123".to_string());
///     
///     let app = create_webhook_server(hub, auth, telnyx);
///     
///     let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
///     println!("Webhook server listening on http://0.0.0.0:3000");
///     axum::serve(listener, app).await?;
///     
///     Ok(())
/// }
/// ```
pub fn create_webhook_server(
    tel_hub: TelHub,
    call_auth: CallAuth,
    telnyx_client: TelnyxClient,
) -> Router {
    let state = Arc::new(ServerState {
        tel_hub: Arc::new(Mutex::new(tel_hub)),
        call_auth: Arc::new(call_auth),
        telnyx_client: Arc::new(telnyx_client),
    });

    Router::new()
        .route("/webhooks/telnyx", post(handle_telnyx_webhook))
        .route("/health", axum::routing::get(health_check))
        .with_state(state)
}

/// Health check endpoint
async fn health_check() -> impl IntoResponse {
    Json(json!({
        "status": "ok",
        "service": "kevan.tel.x",
        "version": "0.1.0"
    }))
}

/// Handle Telnyx webhook
///
/// Flow:
/// 1. Parse webhook JSON
/// 2. Check if call.initiated event
/// 3. Create IncomingCall
/// 4. Authenticate caller via hub
/// 5. Answer or reject based on auth decision
async fn handle_telnyx_webhook(
    State(state): State<Arc<ServerState>>,
    Json(payload): Json<serde_json::Value>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // Log raw webhook for debugging
    println!("📞 Telnyx webhook received:");
    println!("{}", serde_json::to_string_pretty(&payload).unwrap());

    // Parse webhook
    let webhook = match serde_json::from_value::<TelnyxWebhook>(payload) {
        Ok(w) => w,
        Err(e) => {
            eprintln!("Failed to parse webhook: {}", e);
            return Err((
                StatusCode::BAD_REQUEST,
                format!("Invalid webhook format: {}", e),
            ));
        }
    };

    // Only handle call.initiated events
    if !webhook.is_call_initiated() {
        println!("ℹ️  Ignoring non-initiated event: {}", webhook.event_type());
        return Ok(Json(json!({
            "status": "ignored",
            "event_type": webhook.event_type()
        })));
    }

    // Create IncomingCall from webhook
    let call = IncomingCall::new(
        webhook.call_control_id(),
        webhook.from(),
        webhook.to(),
    );

    println!("📱 Processing call:");
    println!("   From: {}", call.from);
    println!("   To: {}", call.to);
    println!("   Call ID: {}", call.call_id);

    // Authenticate caller (acquire lock)
    let hub = state.tel_hub.lock().await;
    let decision = match hub.handle_incoming_call(&call, &state.call_auth).await {
        Ok(d) => d,
        Err(e) => {
            eprintln!("Error handling call: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error handling call: {}", e),
            ));
        }
    };
    drop(hub); // Release lock before async API calls

    // Control call based on auth decision
    match decision {
        AuthDecision::Authenticated { namespace } => {
            println!("✅ AUTHENTICATED: {} → Answering call", namespace);
            
            // Answer the call
            if let Err(e) = state.telnyx_client.answer_call(webhook.call_control_id()).await {
                eprintln!("Failed to answer call: {}", e);
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to answer call: {}", e),
                ));
            }

            Ok(Json(json!({
                "status": "accepted",
                "namespace": namespace,
                "action": "answered"
            })))
        }
        AuthDecision::Allowlisted => {
            println!("✅ ALLOWLISTED → Answering call");
            
            if let Err(e) = state.telnyx_client.answer_call(webhook.call_control_id()).await {
                eprintln!("Failed to answer call: {}", e);
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to answer call: {}", e),
                ));
            }

            Ok(Json(json!({
                "status": "accepted",
                "reason": "allowlisted",
                "action": "answered"
            })))
        }
        AuthDecision::Rejected => {
            println!("❌ REJECTED: No *.x certificate → Rejecting call");
            
            // Speak rejection message then hangup
            let rejection_msg = "This number only accepts calls from authenticated namespaces. Please visit kevan dot tel dot x for access.";
            
            if let Err(e) = state.telnyx_client.speak(webhook.call_control_id(), rejection_msg).await {
                eprintln!("Failed to speak rejection: {}", e);
            }

            // Wait for TTS to finish (3 seconds), then reject
            tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
            
            if let Err(e) = state.telnyx_client.reject_call(webhook.call_control_id(), "CALL_REJECTED").await {
                eprintln!("Failed to reject call: {}", e);
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to reject call: {}", e),
                ));
            }

            Ok(Json(json!({
                "status": "rejected",
                "reason": "no_namespace_certificate",
                "action": "rejected"
            })))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use kevan_events::EventStore;
    use kevan_resolver::CertificateStore;
    use std::path::Path;

    #[tokio::test]
    async fn test_server_creation() {
        let events = EventStore::new(Path::new(":memory:")).unwrap();
        let hub = TelHub::new(events, "KEY123".to_string());
        let auth = CallAuth::new(CertificateStore::new());
        let telnyx = TelnyxClient::new("KEY123".to_string());

        let app = create_webhook_server(hub, auth, telnyx);
        
        // Server should compile and create
        assert!(true);
    }

    #[tokio::test]
    async fn test_health_check() {
        let response = health_check().await.into_response();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
