// Blockchain Registry API Service
// Rust HTTP service that exposes uny-korn-l1 NamespaceRegistry

use actix_web::{web, App, HttpResponse, HttpServer, Result};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

// Import from your uny-korn-l1 crate
use uny_korn_state::namespaces::{Namespace, NamespaceRegistry};
use uny_korn_state::ChainState;

#[derive(Debug, Deserialize)]
struct RegisterRequest {
    name: String,
    controller: String, // Hex-encoded Ed25519 public key
    metadata_hash: Option<String>, // IPFS CID
}

#[derive(Debug, Serialize)]
struct RegisterResponse {
    success: bool,
    namespace: String,
    commitment_hash: String,
    error: Option<String>,
}

#[derive(Debug, Serialize)]
struct QueryResponse {
    exists: bool,
    namespace: Option<NamespaceData>,
}

#[derive(Debug, Serialize)]
struct NamespaceData {
    name: String,
    controller: String,
    metadata_hash: Option<String>,
}

#[derive(Debug, Serialize)]
struct ListResponse {
    namespaces: Vec<String>,
    total: usize,
}

/// Global blockchain state (in production, this would be consensus-backed)
struct AppState {
    chain_state: Arc<Mutex<ChainState>>,
}

/// Register a new namespace (enforces uniqueness)
async fn register_namespace(
    state: web::Data<AppState>,
    req: web::Json<RegisterRequest>,
) -> Result<HttpResponse> {
    let mut chain_state = state.chain_state.lock().unwrap();
    
    // Decode controller address from hex
    let controller_bytes = match hex::decode(&req.controller) {
        Ok(bytes) => {
            if bytes.len() != 32 {
                return Ok(HttpResponse::BadRequest().json(RegisterResponse {
                    success: false,
                    namespace: req.name.clone(),
                    commitment_hash: String::new(),
                    error: Some("Controller must be 32 bytes (Ed25519 public key)".to_string()),
                }));
            }
            let mut arr = [0u8; 32];
            arr.copy_from_slice(&bytes);
            arr
        }
        Err(_) => {
            return Ok(HttpResponse::BadRequest().json(RegisterResponse {
                success: false,
                namespace: req.name.clone(),
                commitment_hash: String::new(),
                error: Some("Invalid hex encoding for controller".to_string()),
            }));
        }
    };

    // Create namespace
    let namespace = Namespace {
        name: req.name.clone(),
        controller: controller_bytes,
        metadata_hash: req.metadata_hash.clone(),
    };

    // Register (this enforces uniqueness!)
    match chain_state.namespaces.register_genesis_namespace(namespace) {
        Ok(_) => {
            let commitment = chain_state.state_root_hex();
            
            Ok(HttpResponse::Ok().json(RegisterResponse {
                success: true,
                namespace: req.name.clone(),
                commitment_hash: commitment,
                error: None,
            }))
        }
        Err(e) => {
            // Duplicate namespace or other error
            Ok(HttpResponse::Conflict().json(RegisterResponse {
                success: false,
                namespace: req.name.clone(),
                commitment_hash: String::new(),
                error: Some(e.to_string()),
            }))
        }
    }
}

/// Check if namespace exists
async fn check_namespace(
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> Result<HttpResponse> {
    let chain_state = state.chain_state.lock().unwrap();
    let namespace_name = path.into_inner();

    match chain_state.namespaces.get(&namespace_name) {
        Some(ns) => Ok(HttpResponse::Ok().json(QueryResponse {
            exists: true,
            namespace: Some(NamespaceData {
                name: ns.name.clone(),
                controller: hex::encode(ns.controller),
                metadata_hash: ns.metadata_hash.clone(),
            }),
        })),
        None => Ok(HttpResponse::Ok().json(QueryResponse {
            exists: false,
            namespace: None,
        })),
    }
}

/// List all registered namespaces
async fn list_namespaces(state: web::Data<AppState>) -> Result<HttpResponse> {
    let chain_state = state.chain_state.lock().unwrap();
    
    // In production, you'd expose a proper iterator on NamespaceRegistry
    // For now, return empty list (registry doesn't expose internal BTreeMap)
    
    Ok(HttpResponse::Ok().json(ListResponse {
        namespaces: vec![], // TODO: Add public getter to NamespaceRegistry
        total: 0,
    }))
}

/// Health check
async fn health() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "blockchain-registry-api",
        "version": "1.0.0"
    })))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let chain_state = Arc::new(Mutex::new(ChainState::default()));

    log::info!("Starting Blockchain Registry API on http://127.0.0.1:3333");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(AppState {
                chain_state: chain_state.clone(),
            }))
            .route("/health", web::get().to(health))
            .route("/api/blockchain/register", web::post().to(register_namespace))
            .route("/api/blockchain/check/{namespace}", web::get().to(check_namespace))
            .route("/api/blockchain/list", web::get().to(list_namespaces))
    })
    .bind(("127.0.0.1", 3333))?
    .run()
    .await
}
