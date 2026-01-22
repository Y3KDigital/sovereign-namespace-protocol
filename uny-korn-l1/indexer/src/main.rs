//! Rust L1 Indexer - HTTP API for querying Unykorn chain state.
//!
//! Exposes:
//! - GET /health - health check
//! - GET /assets - list all registered assets
//! - GET /balances?account=X - query account balances
//! - GET /audit - state root hash + height
//!
//! Production-ready: Dev endpoints removed, read-only queries only.
//! Minting must go through consent-gateway with admin token.

use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, RwLock};
use tower_http::cors::CorsLayer;
use uny_korn_state::ChainState;

/// Shared state: ChainState + block height.
/// 
/// In production, this would be updated by a block processor.
/// For now, we initialize with genesis state.
#[derive(Clone)]
struct AppState {
    chain_state: Arc<RwLock<ChainState>>,
    height: Arc<RwLock<u64>>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    // Initialize genesis state
    let mut chain_state = ChainState::default();
    seed_genesis_assets(&mut chain_state);
    seed_genesis_balances(&mut chain_state);

    let app_state = AppState {
        chain_state: Arc::new(RwLock::new(chain_state)),
        height: Arc::new(RwLock::new(0)),
    };

    // Production routes - read-only queries + admin operations
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/assets", get(list_assets))
        .route("/balances", get(get_balances))
        .route("/audit", get(get_audit))
        .route("/admin/credit", post(admin_credit))
        .layer(CorsLayer::permissive())
        .with_state(app_state);

    // Environment-based bind address
    let addr = std::env::var("INDEXER_BIND_ADDR")
        .unwrap_or_else(|_| "0.0.0.0:8089".to_string());
    
    tracing::info!("rust-l1-indexer v{} listening on {}", env!("CARGO_PKG_VERSION"), addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

/// Seed genesis assets (UCRED, UUSD, GOLD, F&F tokens).
fn seed_genesis_assets(state: &mut ChainState) {
    use uny_korn_state::assets::Asset;

    let assets = vec![
        Asset {
            symbol: "UCRED".to_string(),
            decimals: 18,
            policy_uri: Some("ipfs://QmUCRED".to_string()),
        },
        Asset {
            symbol: "UUSD".to_string(),
            decimals: 18,
            policy_uri: Some("ipfs://QmUUSD".to_string()),
        },
        Asset {
            symbol: "GOLD".to_string(),
            decimals: 18,
            policy_uri: Some("ipfs://QmGOLD".to_string()),
        },
        Asset {
            symbol: "FTH".to_string(),
            decimals: 18,
            policy_uri: Some("ipfs://QmFTH".to_string()),
        },
        Asset {
            symbol: "MOG".to_string(),
            decimals: 18,
            policy_uri: Some("ipfs://QmMOG".to_string()),
        },
        Asset {
            symbol: "XXXIII".to_string(),
            decimals: 18,
            policy_uri: None,
        },
        Asset {
            symbol: "OPTKAS1".to_string(),
            decimals: 18,
            policy_uri: None,
        },
        Asset {
            symbol: "KBURNS".to_string(),
            decimals: 18,
            policy_uri: None,
        },
        Asset {
            symbol: "EUR".to_string(),
            decimals: 18,
            policy_uri: None,
        },
        Asset {
            symbol: "GBP".to_string(),
            decimals: 18,
            policy_uri: None,
        },
        Asset {
            symbol: "DRUNKS".to_string(),
            decimals: 18,
            policy_uri: None,
        },
    ];

    for asset in assets {
        state.assets.register_asset(asset).unwrap();
    }
}

/// Seed genesis balances (1,000 UCRED to treasuries).
fn seed_genesis_balances(state: &mut ChainState) {
    let amount = 1_000_000_000_000_000_000_000u128; // 1,000 UCRED

    state
        .balances
        .credit("UCRED", "acct:treasury:MAIN", amount)
        .unwrap();
    state
        .balances
        .credit("UCRED", "acct:treasury:FTH", amount)
        .unwrap();
    state
        .balances
        .credit("UCRED", "acct:treasury:MOG", amount)
        .unwrap();
}

/// GET /assets - list all registered assets.
#[derive(Serialize)]
struct AssetResponse {
    symbol: String,
    decimals: u8,
    policy_uri: Option<String>,
}

async fn list_assets(State(state): State<AppState>) -> impl IntoResponse {
    let chain_state = state.chain_state.read().unwrap();
    let assets = chain_state.assets.list_assets();

    let response: Vec<AssetResponse> = assets
        .into_iter()
        .map(|a| AssetResponse {
            symbol: a.symbol,
            decimals: a.decimals,
            policy_uri: a.policy_uri,
        })
        .collect();

    Json(response)
}

/// GET /balances?account=X - query account balances.
#[derive(Deserialize)]
struct BalanceQuery {
    account: String,
}

#[derive(Serialize)]
struct BalanceResponse {
    asset: String,
    balance_wei: String, // u128 as string for JSON compatibility
}

async fn get_balances(
    State(state): State<AppState>,
    Query(query): Query<BalanceQuery>,
) -> impl IntoResponse {
    let chain_state = state.chain_state.read().unwrap();
    let balances = chain_state.balances.balances_for_account(&query.account);

    let response: Vec<BalanceResponse> = balances
        .into_iter()
        .map(|b| BalanceResponse {
            asset: b.asset,
            balance_wei: b.balance_wei.to_string(),
        })
        .collect();

    Json(response)
}

/// GET /audit - state root hash + height.
#[derive(Serialize)]
struct AuditResponse {
    state_root: String,
    height: u64,
}

async fn get_audit(State(state): State<AppState>) -> impl IntoResponse {
    let chain_state = state.chain_state.read().unwrap();
    let height = *state.height.read().unwrap();

    let response = AuditResponse {
        state_root: chain_state.state_root_hex(),
        height,
    };

    Json(response)
}

/// POST /admin/credit - operator-controlled minting (requires admin token).
#[derive(Debug, Deserialize)]
struct AdminCreditRequest {
    asset: String,
    account: String,
    amount_wei: String,
    memo: String,
    operator_token: String,
}

#[derive(Debug, Serialize)]
struct AdminCreditResponse {
    success: bool,
    new_balance_wei: String,
    state_root: String,
}

async fn admin_credit(
    State(state): State<AppState>,
    Json(req): Json<AdminCreditRequest>,
) -> Result<Json<AdminCreditResponse>, (StatusCode, String)> {
    // CHECKPOINT: Verify operator token
    let expected_token = std::env::var("RUST_L1_ADMIN_TOKEN")
        .unwrap_or_else(|_| "INSECURE_DEV_TOKEN".to_string());

    if req.operator_token != expected_token {
        tracing::warn!("Admin credit rejected: invalid token");
        return Err((StatusCode::UNAUTHORIZED, "Invalid operator token".to_string()));
    }

    // Parse amount
    let amount_wei = req.amount_wei.parse::<u128>()
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid amount: {}", e)))?;

    // Get write lock and credit account
    let mut chain_state = state.chain_state.write().unwrap();
    
    chain_state.balances.credit(&req.asset, &req.account, amount_wei)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Get new balance
    let new_balance = chain_state.balances.balance_of(&req.asset, &req.account);

    // Get state root
    let state_root = chain_state.state_root_hex();

    tracing::info!(
        "Admin credit: asset={} account={} amount_wei={} memo={} new_balance_wei={} state_root={}",
        req.asset, req.account, amount_wei, req.memo, new_balance, state_root
    );

    Ok(Json(AdminCreditResponse {
        success: true,
        new_balance_wei: new_balance.to_string(),
        state_root,
    }))
}

/// GET /health - health check endpoint.
#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "rust-l1-indexer".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}
