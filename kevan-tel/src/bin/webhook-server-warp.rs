//! Telnyx Webhook Server (Warp + LocalSet)
//!
//! Architecture:
//! - Uses warp web framework with tokio LocalSet
//! - Single-threaded execution (no Send/Sync required)
//! - EventStore's Rc<RefCell<>> works correctly
//! - Guarantees event ordering

use kevan_events::EventStore;
use kevan_resolver::resolver::CertResolver;
use kevan_tel::telnyx_api::TelnyxWebhook;
use kevan_tel::{CallAuth, IncomingCall, TelHub, TelnyxClient};
use serde_json::json;
use std::env;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::task::LocalSet;
use warp::Filter;

/// Configuration (immutable, shareable)
#[derive(Clone)]
struct Config {
    db_path: PathBuf,
    api_key: String,
    call_auth: Arc<CallAuth>,
    telnyx_client: Arc<TelnyxClient>,
}

#[tokio::main(flavor = "current_thread")]
async fn main() {
    println!("🚀 Telnyx Webhook Server (Warp + LocalSet)");
    println!("==========================================\n");

    // Load configuration
    let db_path = env::var("EVENT_DB_PATH").unwrap_or_else(|_| "./kevan.events.db".to_string());
    let api_key = env::var("TELNYX_API_KEY")
        .expect("TELNYX_API_KEY environment variable required");

    // Initialize certificate resolver
    let cert_path = PathBuf::from(
        env::var("CERT_PATH").unwrap_or_else(|_| "../kevan-resolver/certs.json".to_string()),
    );
    let resolver = CertResolver::new(cert_path).expect("Failed to load certificates");

    // Initialize CallAuth
    let call_auth = CallAuth::new(resolver);

    // Initialize Telnyx client
    let telnyx_client = TelnyxClient::new(api_key.clone());

    // Create shared config
    let config = Config {
        db_path: PathBuf::from(db_path),
        api_key,
        call_auth: Arc::new(call_auth),
        telnyx_client: Arc::new(telnyx_client),
    };

    println!("✅ Configuration loaded");
    println!("   Database: {:?}", config.db_path);
    println!("   API Key: {}...{}", &config.api_key[..10], &config.api_key[config.api_key.len()-4..]);
    println!();

    // Create warp routes
    let webhook_route = warp::path!("webhooks" / "telnyx")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_config(config.clone()))
        .and_then(handle_webhook);

    let health_route = warp::path("health")
        .and(warp::get())
        .map(|| warp::reply::json(&json!({"status": "ok"})));

    let routes = webhook_route.or(health_route);

    println!("🌐 Starting server on 0.0.0.0:8080");
    println!("   Webhook: POST /webhooks/telnyx");
    println!("   Health: GET /health");
    println!();

    // Run server with LocalSet (single-threaded)
    let local = LocalSet::new();
    local
        .run_until(async move {
            warp::serve(routes).run(([0, 0, 0, 0], 8080)).await;
        })
        .await;
}

/// Warp filter to inject config
fn with_config(
    config: Config,
) -> impl Filter<Extract = (Config,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || config.clone())
}

/// Handle Telnyx webhook
///
/// Architecture: Per-request EventStore connection
/// - Single-threaded execution via LocalSet
/// - No Send/Sync required
/// - EventStore's Rc<RefCell<>> works correctly
async fn handle_webhook(
    payload: serde_json::Value,
    config: Config,
) -> Result<impl warp::Reply, warp::Rejection> {
    println!("\n📞 Telnyx webhook received");

    // Parse webhook
    let webhook = match serde_json::from_value::<TelnyxWebhook>(payload) {
        Ok(w) => w,
        Err(e) => {
            eprintln!("❌ Failed to parse webhook: {}", e);
            return Ok(warp::reply::with_status(
                warp::reply::json(&json!({"error": "Invalid webhook"})),
                warp::http::StatusCode::BAD_REQUEST,
            ));
        }
    };

    // Only handle call.initiated
    if !webhook.is_call_initiated() {
        println!("ℹ️  Ignoring event: {}", webhook.event_type());
        return Ok(warp::reply::with_status(
            warp::reply::json(&json!({
                "status": "ignored",
                "event_type": webhook.event_type()
            })),
            warp::http::StatusCode::OK,
        ));
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

    // Create EventStore for this request (Rc<RefCell<>> OK here - single-threaded)
    let events = match EventStore::new(&config.db_path) {
        Ok(e) => e,
        Err(e) => {
            eprintln!("❌ Failed to open database: {}", e);
            return Ok(warp::reply::with_status(
                warp::reply::json(&json!({"error": "Database error"})),
                warp::http::StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    // Create TelHub for this request
    let hub = TelHub::new(events, config.api_key.clone());

    // Authenticate caller
    let decision = match hub.handle_incoming_call(&call, &config.call_auth).await {
        Ok(d) => d,
        Err(e) => {
            eprintln!("❌ Failed to handle call: {}", e);
            return Ok(warp::reply::with_status(
                warp::reply::json(&json!({"error": "Processing error"})),
                warp::http::StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    // Take action based on authentication
    match decision {
        kevan_tel::AuthDecision::Authenticated { ref namespace } => {
            println!("✅ Authenticated: {}", namespace);
            println!("   Action: Answering call");

            // Answer call
            if let Err(e) = config.telnyx_client.answer_call(&call.call_id).await {
                eprintln!("❌ Failed to answer call: {}", e);
            }
        }
        kevan_tel::AuthDecision::Allowlisted => {
            println!("✅ Allowlisted");
            println!("   Action: Answering call");

            // Answer call
            if let Err(e) = config.telnyx_client.answer_call(&call.call_id).await {
                eprintln!("❌ Failed to answer call: {}", e);
            }
        }
        kevan_tel::AuthDecision::Rejected => {
            println!("❌ Rejected (no namespace)");
            println!("   Action: Rejecting call");

            // Speak rejection message and hang up
            let message = "This number only accepts calls from verified namespace holders. Visit kevan dot x to register.";
            if let Err(e) = config.telnyx_client.speak(&call.call_id, message).await {
                eprintln!("❌ Failed to speak: {}", e);
            }

            // Reject call
            if let Err(e) = config
                .telnyx_client
                .reject_call(&call.call_id, "busy")
                .await
            {
                eprintln!("❌ Failed to reject call: {}", e);
            }
        }
    }

    // Return success response
    let response = json!({
        "status": "received",
        "decision": format!("{:?}", decision),
        "timestamp": chrono::Utc::now().to_rfc3339()
    });

    Ok(warp::reply::with_status(
        warp::reply::json(&response),
        warp::http::StatusCode::OK,
    ))
}
