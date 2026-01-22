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
mod voice;
mod rate_limit;
mod signing;
mod friends_family;

use actix_cors::Cors;
use actix_web::{http::header, middleware, web, App, HttpServer};
use dotenv::dotenv;
use std::env;
use std::collections::HashSet;

use database::Database;
use stripe_service::StripeService;
use issuance::IssuanceService;
use inventory::InventoryManager;
use rate_limit::RateLimiter;
use types::StripeConfigDiagnostics;

#[derive(Debug, Clone, Copy)]
enum SecretKind {
    StripeApiKey,
    StripeWebhookSecret,
}

#[derive(Debug, Clone)]
struct SecretAnalysis {
    present: bool,
    accepted: bool,
    rejected_reason: Option<&'static str>,
    normalized: Option<String>,
}

fn analyze_optional_secret(value: Option<String>, kind: SecretKind) -> SecretAnalysis {
    let Some(v) = value else {
        return SecretAnalysis {
            present: false,
            accepted: false,
            rejected_reason: None,
            normalized: None,
        };
    };

    let trimmed = v.trim();
    if trimmed.is_empty() {
        return SecretAnalysis {
            present: true,
            accepted: false,
            rejected_reason: Some("empty"),
            normalized: None,
        };
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
        return SecretAnalysis {
            present: true,
            accepted: false,
            rejected_reason: Some("placeholder"),
            normalized: None,
        };
    }

    // Basic format sanity checks (conservative) for the most common Stripe secrets.
    // NOTE: We do not attempt a network validation here.
    match kind {
        SecretKind::StripeApiKey => {
            if lower.starts_with("sk_test_") || lower.starts_with("sk_live_") {
                // Real Stripe keys are long; short ones are almost always placeholders.
                if trimmed.len() < 32 {
                    return SecretAnalysis {
                        present: true,
                        accepted: false,
                        rejected_reason: Some("too_short"),
                        normalized: None,
                    };
                }
            }
        }
        SecretKind::StripeWebhookSecret => {
            if lower.starts_with("whsec_") {
                if trimmed.len() < 24 {
                    return SecretAnalysis {
                        present: true,
                        accepted: false,
                        rejected_reason: Some("too_short"),
                        normalized: None,
                    };
                }
            }
        }
    }

    SecretAnalysis {
        present: true,
        accepted: true,
        rejected_reason: None,
        normalized: Some(trimmed.to_string()),
    }
}

fn parse_allowed_origins() -> Vec<String> {
    // Comma-separated list, e.g.:
    //   CORS_ALLOWED_ORIGINS=https://y3kmarkets.com,https://x.y3kmarkets.com,http://localhost:3000
    // If unset, we allow the canonical public sites + localhost.
    let raw = env::var("CORS_ALLOWED_ORIGINS")
        .ok()
        .or_else(|| env::var("CORS_ALLOW_ORIGINS").ok())
        .unwrap_or_else(|| {
            "https://y3kmarkets.com,https://x.y3kmarkets.com,https://y3kmarkets.pages.dev,http://localhost:3000"
                .to_string()
        });

    raw.split(',')
        .map(|s| s.trim().trim_end_matches('/'))
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .collect()
}

fn parse_bool_env(name: &str) -> bool {
    env::var(name)
        .ok()
        .map(|v| matches!(v.to_ascii_lowercase().as_str(), "1" | "true" | "yes" | "on"))
        .unwrap_or(false)
}

fn parse_u32_env(name: &str, default: u32) -> u32 {
    env::var(name)
        .ok()
        .and_then(|v| v.trim().parse::<u32>().ok())
        .unwrap_or(default)
}

fn build_cors() -> Cors {
    let allowed_origins = parse_allowed_origins();
    let allow_set: HashSet<String> = allowed_origins
        .into_iter()
        .map(|s| s.to_ascii_lowercase())
        .collect();

    // For y3kmarkets.com subdomains, allow any HTTPS origin ending in `.y3kmarkets.com`.
    // This supports canonical + future subdomains while remaining strict.
    Cors::default()
        .allowed_origin_fn(move |origin, _req_head| {
            let Ok(o) = origin.to_str() else {
                return false;
            };
            let o = o.trim().trim_end_matches('/');
            if o.is_empty() {
                return false;
            }
            let lower = o.to_ascii_lowercase();

            if allow_set.contains(&lower) {
                return true;
            }

            lower.starts_with("https://") && lower.ends_with(".y3kmarkets.com")
        })
        .allowed_methods(vec!["GET", "POST", "OPTIONS"])
        .allowed_headers(vec![
            header::ACCEPT,
            header::AUTHORIZATION,
            header::CONTENT_TYPE,
            header::HeaderName::from_static("stripe-signature"),
            header::HeaderName::from_static("x-admin-token"),
        ])
        // Downloads expose Content-Disposition so browsers can show filenames.
        .expose_headers(vec![header::CONTENT_DISPOSITION])
        .max_age(3600)
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
    // Support common Stripe secret key aliases.
    // - STRIPE_API_KEY (preferred)
    // - STRIPE_SECRET_KEY (common in many deployments)
    // - STRIPE_SECRET (fallback)
    let (stripe_api_key_raw, stripe_api_key_source) = if let Ok(v) = env::var("STRIPE_API_KEY") {
        (Some(v), Some("STRIPE_API_KEY".to_string()))
    } else if let Ok(v) = env::var("STRIPE_SECRET_KEY") {
        (Some(v), Some("STRIPE_SECRET_KEY".to_string()))
    } else if let Ok(v) = env::var("STRIPE_SECRET") {
        (Some(v), Some("STRIPE_SECRET".to_string()))
    } else {
        (None, None)
    };

    let api_key_analysis = analyze_optional_secret(stripe_api_key_raw, SecretKind::StripeApiKey);
    let webhook_analysis = analyze_optional_secret(
        env::var("STRIPE_WEBHOOK_SECRET").ok(),
        SecretKind::StripeWebhookSecret,
    );
    let require_stripe = parse_bool_env("REQUIRE_STRIPE");

    if api_key_analysis.present && !api_key_analysis.accepted {
        tracing::warn!(
            stripe_api_key_source = stripe_api_key_source.as_deref().unwrap_or("(unknown)"),
            stripe_api_key_rejected_reason = api_key_analysis.rejected_reason.unwrap_or("unknown"),
            "Stripe API key was provided but rejected by guardrails (likely placeholder)"
        );
    }
    if webhook_analysis.present && !webhook_analysis.accepted {
        tracing::warn!(
            stripe_webhook_secret_rejected_reason = webhook_analysis.rejected_reason.unwrap_or("unknown"),
            "Stripe webhook secret was provided but rejected by guardrails (likely placeholder)"
        );
    }

    let stripe_api_key = api_key_analysis.normalized.clone();
    let stripe_webhook_secret = webhook_analysis.normalized.clone();

    let stripe_diag = StripeConfigDiagnostics {
        api_key_present: api_key_analysis.present,
        api_key_accepted: api_key_analysis.accepted,
        api_key_source: stripe_api_key_source,
        api_key_rejected_reason: api_key_analysis.rejected_reason.map(|s| s.to_string()),
        webhook_secret_present: webhook_analysis.present,
        webhook_secret_accepted: webhook_analysis.accepted,
        webhook_secret_rejected_reason: webhook_analysis.rejected_reason.map(|s| s.to_string()),
        require_stripe,
    };

    // Basic abuse protection for public endpoints.
    let create_intent_per_minute = parse_u32_env("RATE_LIMIT_CREATE_INTENT_PER_MINUTE", 30);
    let create_intent_limiter = RateLimiter::per_minute(create_intent_per_minute);

    // sqlx SQLite URL format:
    // - relative file: sqlite:payments.db
    // - absolute file: sqlite:///C:/path/to/payments.db
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:payments.db".to_string());
    let bind_address = env::var("BIND_ADDRESS")
        .unwrap_or_else(|_| "127.0.0.1:8081".to_string());

    // Signing key (optional by default).
    // Format: base64 of 32-byte Ed25519 seed.
    let signing_key = match signing::load_ed25519_signing_key_from_env("Y3K_SIGNING_KEY_ED25519") {
        Ok(k) => k,
        Err(e) => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Invalid Y3K_SIGNING_KEY_ED25519: {e}"),
            ))
        }
    };
    let require_signing = parse_bool_env("REQUIRE_SIGNING_KEY");
    if require_signing && signing_key.is_none() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Signing key is required (REQUIRE_SIGNING_KEY=true) but Y3K_SIGNING_KEY_ED25519 is not set",
        ));
    }

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
        let cors = build_cors();
        App::new()
            .app_data(web::Data::new(db.clone()))
            .app_data(web::Data::new(stripe.clone()))
            .app_data(web::Data::new(stripe_diag.clone()))
            .app_data(web::Data::new(issuance.clone()))
            .app_data(web::Data::new(inventory.clone()))
            .app_data(web::Data::new(create_intent_limiter.clone()))
            .app_data(web::Data::new(signing_key.clone()))
            // Safe defaults for an API surface.
            .wrap(
                middleware::DefaultHeaders::new()
                    .add(("Cache-Control", "no-store"))
                    .add(("X-Content-Type-Options", "nosniff"))
                    .add(("Referrer-Policy", "no-referrer"))
                    .add(("X-Frame-Options", "DENY")),
            )
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .wrap(middleware::Compress::default())
            .service(
                web::scope("/api")
                    .route("/health", web::get().to(handlers::health_check))
                    .route("/payments/create-intent", web::post().to(handlers::create_payment_intent))
                    .route("/payments/webhook", web::post().to(handlers::stripe_webhook))
                    .route("/agents/{namespace}", web::get().to(handlers::get_agent))
                    .route(
                        "/agents/{namespace}/bind-phone",
                        web::post().to(handlers::bind_agent_phone),
                    )
                    .route("/voice/twilio", web::post().to(voice::twilio_voice_webhook))
                    .route("/affiliates", web::post().to(handlers::create_affiliate_admin))
                    .route(
                        "/affiliates/portal/{portal_token}",
                        web::get().to(handlers::affiliate_portal),
                    )
                    .route("/affiliates/leads", web::post().to(handlers::create_affiliate_lead))
                    .route("/orders/{order_id}", web::get().to(handlers::get_order))
                    .route(
                        "/orders/{order_id}/funding-proof",
                        web::get().to(handlers::get_funding_proof),
                    )
                    .route("/downloads/{token}", web::get().to(handlers::download_certificate))
                    .route("/inventory/status", web::get().to(handlers::get_inventory_status))
                    .route("/namespaces", web::get().to(handlers::list_namespaces))
                    .route(
                        "/namespaces/availability",
                        web::get().to(handlers::namespace_availability),
                    )
                    .route(
                        "/friends-family/validate",
                        web::post().to(friends_family::validate_code),
                    )
                    .configure(practice_handlers::configure_practice_routes)
            )
    })
    .bind(&bind_address)?
    .run()
    .await
}
