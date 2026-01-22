use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    routing::get,
    Router,
};
use serde::Serialize;
use std::sync::Arc;
use tower_http::cors::CorsLayer;

mod certificate;
mod resolver;

use certificate::Certificate;
use resolver::NamespaceResolver;

#[derive(Clone)]
struct AppState {
    resolver: Arc<NamespaceResolver>,
}

#[derive(Serialize)]
struct ResolveResponse {
    namespace: String,
    certificate: Certificate,
    endpoints: EndpointMap,
    public_keys: PublicKeyMap,
    verified: bool,
}

#[derive(Serialize)]
struct EndpointMap {
    identity: String,
    finance: String,
    tel: String,
    vault: String,
    registry: String,
}

#[derive(Serialize)]
struct PublicKeyMap {
    identity: String,
    finance: String,
    signing: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    namespace: Option<String>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter("kevan_resolver=debug,tower_http=debug")
        .init();

    // Load certificates from genesis directory
    let cert_dir = std::env::var("CERT_DIR")
        .unwrap_or_else(|_| "C:\\Users\\Kevan\\genesis".to_string());
    
    tracing::info!("Loading certificates from: {}", cert_dir);
    
    let resolver = NamespaceResolver::new(&cert_dir)?;
    let state = AppState {
        resolver: Arc::new(resolver),
    };

    tracing::info!("Loaded {} certificates", state.resolver.certificate_count());

    // Build router
    let app = Router::new()
        .route("/", get(root))
        .route("/resolve/:namespace", get(resolve_namespace))
        .route("/health", get(health_check))
        .route("/certificates", get(list_certificates))
        .with_state(state)
        .layer(CorsLayer::permissive());

    // Start server
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("127.0.0.1:{}", port);
    tracing::info!("Starting kevan.x resolver on http://{}", addr);
    tracing::info!("Try: http://127.0.0.1:{}/resolve/kevan.x", port);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn root() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "service": "kevan.x Certificate Resolver",
        "version": "0.1.0",
        "status": "operational",
        "endpoints": {
            "resolve": "/resolve/{namespace}",
            "certificates": "/certificates",
            "health": "/health"
        },
        "description": "Resolves sovereign namespaces to certificates, endpoints, and public keys"
    }))
}

async fn health_check(State(state): State<AppState>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "healthy",
        "certificates_loaded": state.resolver.certificate_count(),
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn list_certificates(State(state): State<AppState>) -> Json<serde_json::Value> {
    let namespaces = state.resolver.list_namespaces();
    Json(serde_json::json!({
        "total": namespaces.len(),
        "namespaces": namespaces
    }))
}

async fn resolve_namespace(
    Path(namespace): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<ResolveResponse>, (StatusCode, Json<ErrorResponse>)> {
    tracing::info!("Resolving namespace: {}", namespace);

    // Resolve certificate
    let certificate = state.resolver.resolve(&namespace)
        .ok_or_else(|| {
            tracing::warn!("Namespace not found: {}", namespace);
            (
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    error: "Namespace not found".to_string(),
                    namespace: Some(namespace.clone()),
                }),
            )
        })?;

    // Verify certificate signature
    let verified = state.resolver.verify_certificate(&certificate);
    if !verified {
        tracing::error!("Certificate signature verification failed for: {}", namespace);
    }

    // Build endpoints based on namespace
    let endpoints = build_endpoints(&namespace);
    let public_keys = build_public_keys(&certificate);

    Ok(Json(ResolveResponse {
        namespace: namespace.clone(),
        certificate,
        endpoints,
        public_keys,
        verified,
    }))
}

fn build_endpoints(namespace: &str) -> EndpointMap {
    // For now, construct standard endpoints
    // Later: read from certificate or DNS records
    let base = namespace.replace(".", "-");
    
    EndpointMap {
        identity: format!("https://auth.{}", namespace),
        finance: format!("https://pay.{}", namespace),
        tel: format!("sip:{}@tel.{}", base, namespace),
        vault: format!("ipfs://kevan-vault/{}", namespace),
        registry: format!("https://registry.{}", namespace),
    }
}

fn build_public_keys(certificate: &Certificate) -> PublicKeyMap {
    // For now, use the same key for all purposes
    // Later: support key rotation and purpose-specific keys
    PublicKeyMap {
        identity: certificate.id.clone(),
        finance: certificate.id.clone(),
        signing: certificate.id.clone(),
    }
}
