//! Telnyx Webhook Server (Synchronous tiny_http)
//!
//! Architecture:
//! - Uses tiny_http (synchronous, single-threaded)
//! - No async/await, no Send/Sync requirements
//! - EventStore's Rc<RefCell<>> works perfectly
//! - Guarantees event ordering

use kevan_events::EventStore;
use kevan_resolver::CertificateStore;
use kevan_tel::telnyx_api::TelnyxWebhook;
use kevan_tel::{CallAuth, IncomingCall, TelHub, TelnyxClient};
use serde_json::json;
use std::env;
use std::path::PathBuf;
use tiny_http::{Response, Server, StatusCode};

fn main() {
    println!("🚀 Telnyx Webhook Server (Synchronous)");
    println!("=======================================\n");

    // Load configuration
    let db_path = env::var("EVENT_DB_PATH").unwrap_or_else(|_| "./kevan.events.db".to_string());
    let api_key = env::var("TELNYX_API_KEY")
        .expect("TELNYX_API_KEY environment variable required");

    // Initialize certificate store
    let cert_path_str = env::var("CERT_PATH").unwrap_or_else(|_| "../kevan-resolver/certs.json".to_string());
    let cert_store = CertificateStore::load_from_directory(&cert_path_str).expect("Failed to load certificates");

    // Initialize CallAuth
    let call_auth = CallAuth::new(cert_store);

    // Initialize Telnyx client
    let telnyx_client = TelnyxClient::new(api_key.clone());

    println!("✅ Configuration loaded");
    println!("   Database: {}", db_path);
    println!("   API Key: {}...{}", &api_key[..10], &api_key[api_key.len()-4..]);
    println!();

    // Create HTTP server
    let port = env::var("PORT").unwrap_or_else(|_| "8081".to_string());
    let bind_addr = format!("0.0.0.0:{}", port);
    let server = Server::http(&bind_addr).expect(&format!("Failed to bind to {}", bind_addr));
    println!("🌐 Server running on http://{}", bind_addr);
    println!("   Webhook: POST /webhooks/telnyx");
    println!("   Health: GET /health");
    println!("   Ready for calls to 26 Telnyx numbers!");
    println!();

    // Handle requests (single-threaded loop)
    for request in server.incoming_requests() {
        let method = request.method().to_string();
        let url = request.url().to_string();

        println!("\n→ {} {}", method, url);

        // Health check
        if method == "GET" && url == "/health" {
            let response = Response::from_string(json!({"status": "ok"}).to_string())
                .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap());
            if let Err(e) = request.respond(response) {
                eprintln!("❌ Failed to send response: {}", e);
            }
            continue;
        }

        // Telnyx webhook
        if method == "POST" && url == "/webhooks/telnyx" {
            handle_webhook(request, &db_path, &api_key, &call_auth, &telnyx_client);
            continue;
        }

        // 404
        let response = Response::from_string(json!({"error": "not found"}).to_string())
            .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap())
            .with_status_code(StatusCode(404));
        if let Err(e) = request.respond(response) {
            eprintln!("❌ Failed to send response: {}", e);
        }
    }
}

/// Handle Telnyx webhook (synchronous)
fn handle_webhook(
    mut request: tiny_http::Request,
    db_path: &str,
    api_key: &str,
    call_auth: &CallAuth,
    telnyx_client: &TelnyxClient,
) {
    println!("� NEW BINARY HIT — DIAL VERSION ACTIVE 🔥");
    println!("�📞 Telnyx webhook received");

    // Read body
    let mut body = String::new();
    if let Err(e) = request.as_reader().read_to_string(&mut body) {
        eprintln!("❌ Failed to read body: {}", e);
        let response = Response::from_string(json!({"error": "invalid body"}).to_string())
            .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap())
            .with_status_code(StatusCode(400));
        let _ = request.respond(response);
        return;
    }

    // Parse JSON
    let payload: serde_json::Value = match serde_json::from_str(&body) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("❌ Failed to parse JSON: {}", e);
            let response = Response::from_string(json!({"error": "invalid json"}).to_string())
                .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap())
                .with_status_code(StatusCode(400));
            let _ = request.respond(response);
            return;
        }
    };

    // Parse webhook
    let webhook = match serde_json::from_value::<TelnyxWebhook>(payload) {
        Ok(w) => w,
        Err(e) => {
            eprintln!("❌ Failed to parse webhook: {}", e);
            let response = Response::from_string(json!({"error": "invalid webhook"}).to_string())
                .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap())
                .with_status_code(StatusCode(400));
            let _ = request.respond(response);
            return;
        }
    };

    // Only handle call.initiated
    if !webhook.is_call_initiated() {
        println!("ℹ️  Ignoring event: {}", webhook.event_type());
        let response = Response::from_string(
            json!({
                "status": "ignored",
                "event_type": webhook.event_type()
            })
            .to_string(),
        )
        .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap());
        let _ = request.respond(response);
        return;
    }

    // Create IncomingCall
    let call = IncomingCall::new(
        webhook.call_control_id(),
        webhook.from(),
        webhook.to(),
    );

    println!("📱 Call:");
    println!("   From: {}", call.from);
    println!("   To: {}", call.to);
    println!("   ID: {}", call.call_id);

    // Create EventStore (Rc<RefCell<>> works fine - single-threaded!)
    let events = match EventStore::new(&PathBuf::from(db_path)) {
        Ok(e) => e,
        Err(e) => {
            eprintln!("❌ Failed to open database: {}", e);
            let response = Response::from_string(json!({"error": "database error"}).to_string())
                .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap())
                .with_status_code(StatusCode(500));
            let _ = request.respond(response);
            return;
        }
    };

    // Create TelHub
    let hub = TelHub::new(events, api_key.to_string());

    // Create tokio runtime for Telnyx API calls (async)
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .expect("Failed to create tokio runtime");

    // Handle call (blocks until complete)
    let decision = runtime.block_on(async {
        hub.handle_incoming_call(&call, call_auth).await
    });

    let decision = match decision {
        Ok(d) => d,
        Err(e) => {
            eprintln!("❌ Failed to handle call: {}", e);
            let response = Response::from_string(json!({"error": "processing error"}).to_string())
                .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap())
                .with_status_code(StatusCode(500));
            let _ = request.respond(response);
            return;
        }
    };

    // Take action based on authentication
    runtime.block_on(async {
        match decision {
            kevan_tel::AuthDecision::Authenticated { ref namespace } => {
                println!("✅ Authenticated: {}", namespace);
                println!("   Action: Dialing SIM (+18722548473)");

                // Dial the Wireless SIM number (bridge to iPhone)
                if let Err(e) = telnyx_client.dial_number(&call.call_id, &call.to, "+18722548473", 30).await {
                    eprintln!("❌ Failed to dial SIM: {}", e);
                } else {
                    println!("✅ Dial command sent to Telnyx");
                }
            }
            kevan_tel::AuthDecision::Allowlisted => {
                println!("✅ Allowlisted");
                println!("   Action: Dialing SIM (+18722548473)");

                // Dial the Wireless SIM number (bridge to iPhone)
                if let Err(e) = telnyx_client.dial_number(&call.call_id, &call.to, "+18722548473", 30).await {
                    eprintln!("❌ Failed to dial SIM: {}", e);
                } else {
                    println!("✅ Dial command sent to Telnyx");
                }
            }
            kevan_tel::AuthDecision::Rejected => {
                println!("❌ Rejected (no namespace)");
                println!("   Action: Rejecting call");

                // Speak rejection message
                let message = "This number only accepts calls from verified namespace holders. Visit kevan dot x to register.";
                if let Err(e) = telnyx_client.speak(&call.call_id, message).await {
                    eprintln!("❌ Failed to speak: {}", e);
                }

                // Reject call
                if let Err(e) = telnyx_client.reject_call(&call.call_id, "busy").await {
                    eprintln!("❌ Failed to reject call: {}", e);
                }
            }
        }
    });

    // Return success response
    let response_body = json!({
        "status": "received",
        "decision": format!("{:?}", decision),
        "timestamp": chrono::Utc::now().to_rfc3339()
    })
    .to_string();

    let response = Response::from_string(response_body)
        .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap());

    if let Err(e) = request.respond(response) {
        eprintln!("❌ Failed to send response: {}", e);
    }
}
