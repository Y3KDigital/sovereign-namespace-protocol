mod types;
mod errors;
mod database;
mod stripe_service;
mod issuance;
mod inventory;
mod handlers;
mod retry_worker;
mod refund_service;
mod genesis;
mod practice;
mod practice_handlers;

use actix_web::{web, App, HttpServer, middleware};
use dotenv::dotenv;
use std::env;

use database::Database;
use stripe_service::StripeService;
use issuance::IssuanceService;
use inventory::InventoryManager;

fn normalize_optional_secret(value: Option<String>) -> Option<String> {
    let v = value?;
    let trimmed = v.trim();
    if trimmed.is_empty() {
        return None;
    }

    // Guardrails: treat common placeholder values as "not configured".
    // This prevents accidental attempts to call Stripe with example/placeholder keys,
    // which otherwise look non-empty and cause confusing 5xx errors at runtime.
    let lower = trimmed.to_ascii_lowercase();
    let looks_like_placeholder = lower.contains("...")
        || lower.contains("<")
        || lower.contains(">")
        || lower.contains("changeme")
        || lower.contains("placeholder")
        || lower.contains("your_")
        || lower.contains("****************");
    if looks_like_placeholder {
        return None;
    }

    // Basic format sanity checks (conservative) for the most common Stripe secrets.
    // NOTE: We do not attempt a network validation here.
    if lower.starts_with("sk_test_") || lower.starts_with("sk_live_") {
        // Real Stripe keys are long; short ones are almost always placeholders.
        if trimmed.len() < 32 {
            return None;
        }
    }
    if lower.starts_with("whsec_") {
        if trimmed.len() < 24 {
            return None;
        }
    }

    Some(trimmed.to_string())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables
    dotenv().ok();

    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into()),
        )
        .init();

    // Load configuration
    // NOTE: Stripe is optional by default so the API can boot for local/dev and serve
    // read-only/practice endpoints without secrets.
    // Set REQUIRE_STRIPE=true to hard-fail at startup if Stripe is not configured.
    let stripe_api_key = normalize_optional_secret(env::var("STRIPE_API_KEY").ok());
    let stripe_webhook_secret = normalize_optional_secret(env::var("STRIPE_WEBHOOK_SECRET").ok());
    let require_stripe = env::var("REQUIRE_STRIPE")
        .ok()
        .map(|v| matches!(v.to_ascii_lowercase().as_str(), "1" | "true" | "yes" | "on"))
        .unwrap_or(false);

    // sqlx SQLite URL format:
    // - relative file: sqlite:payments.db
    // - absolute file: sqlite:///C:/path/to/payments.db
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:payments.db".to_string());
    let bind_address = env::var("BIND_ADDRESS")
        .unwrap_or_else(|_| "127.0.0.1:8081".to_string());

    tracing::info!("Initializing payments API...");

    // Initialize services
    let db = match Database::new(&database_url).await {
        Ok(db) => db,
        Err(e) => {
            tracing::error!(
                "Failed to initialize database (DATABASE_URL={}): {}",
                database_url,
                e
            );
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to initialize database: {e}"),
            ));
        }
    };
    let stripe: Option<StripeService> = match (stripe_api_key, stripe_webhook_secret) {
        (Some(api_key), Some(webhook_secret)) => {
            tracing::info!("Stripe configured: payments endpoints enabled");
            Some(StripeService::new(api_key, webhook_secret))
        }
        (None, None) => {
            tracing::warn!(
                "Stripe not configured (STRIPE_API_KEY/STRIPE_WEBHOOK_SECRET missing): payments endpoints disabled"
            );
            None
        }
        _ => {
            tracing::warn!(
                "Stripe partially configured (missing STRIPE_API_KEY or STRIPE_WEBHOOK_SECRET): payments endpoints disabled"
            );
            None
        }
    };

    if require_stripe && stripe.is_none() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Stripe is required (REQUIRE_STRIPE=true) but STRIPE_API_KEY/STRIPE_WEBHOOK_SECRET are not set",
        ));
    }
    let issuance = IssuanceService::new();
    let inventory = InventoryManager::new(db.pool.clone());

    tracing::info!("Starting server on {}", bind_address);

    // Start HTTP server
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(db.clone()))
            .app_data(web::Data::new(stripe.clone()))
            .app_data(web::Data::new(issuance.clone()))
            .app_data(web::Data::new(inventory.clone()))
            .wrap(middleware::Logger::default())
            .wrap(middleware::Compress::default())
            .service(
                web::scope("/api")
                    .route("/health", web::get().to(handlers::health_check))
                    .route("/payments/create-intent", web::post().to(handlers::create_payment_intent))
                    .route("/payments/webhook", web::post().to(handlers::stripe_webhook))
                    .route("/affiliates", web::post().to(handlers::create_affiliate_admin))
                    .route(
                        "/affiliates/portal/{portal_token}",
                        web::get().to(handlers::affiliate_portal),
                    )
                    .route("/affiliates/leads", web::post().to(handlers::create_affiliate_lead))
                    .route("/orders/{order_id}", web::get().to(handlers::get_order))
                    .route("/downloads/{token}", web::get().to(handlers::download_certificate))
                    .route("/inventory/status", web::get().to(handlers::get_inventory_status))
                    .route("/namespaces", web::get().to(handlers::list_namespaces))
                    .configure(practice_handlers::configure_practice_routes)
            )
    })
    .bind(&bind_address)?
    .run()
    .await
}
