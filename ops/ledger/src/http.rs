use std::sync::Arc;
use axum::{routing::{get, post}, Router, Json, extract::Query};
use serde::{Serialize, Deserialize};
use crate::balances::Ledger;

#[derive(Clone)]
pub struct AppState {
    pub ledger: Arc<Ledger>,
}

#[derive(Serialize)]
struct AssetRow { symbol: String, decimals: i64, policy_uri: Option<String> }

#[derive(Deserialize)]
struct PostIn {
    account: String,
    asset: String,
    side: String,        // "CR"|"DR"
    amount_wei: String,  // as string to avoid js precision issues
    memo: Option<String>
}

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/assets", get(assets))
        .route("/balances", get(balances))
        .route("/audit", get(audit))
        // DEV ONLY: issuance/testing
        .route("/internal/posting", post(internal_posting))
        .with_state(state)
}

async fn assets(axum::extract::State(state): axum::extract::State<AppState>) -> Json<Vec<AssetRow>> {
    let rows = state.ledger.list_assets().unwrap_or_default();
    Json(rows.into_iter().map(|(s,d,p)| AssetRow{symbol:s,decimals:d,policy_uri:p}).collect())
}

#[derive(Deserialize)]
struct BalancesQuery { account: String }

#[derive(Serialize)]
struct BalanceJson { asset: String, account: String, balance_wei: String }

async fn balances(
    axum::extract::State(state): axum::extract::State<AppState>,
    Query(q): Query<BalancesQuery>
) -> Json<Vec<BalanceJson>> {
    let rows = state.ledger.balances_for_account(&q.account).unwrap_or_default();
    Json(rows.into_iter().map(|b| BalanceJson{
        asset: b.asset,
        account: b.account,
        balance_wei: b.balance_wei.to_string()
    }).collect())
}

#[derive(Serialize)]
struct AuditOut { scope: String, hash_hex: String }

async fn audit(axum::extract::State(state): axum::extract::State<AppState>) -> Json<AuditOut> {
    let h = state.ledger.audit_hash_system().unwrap_or_else(|_| "00".repeat(32));
    Json(AuditOut{ scope: "system".into(), hash_hex: h })
}

async fn internal_posting(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::Json(p): axum::Json<PostIn>
) -> Json<serde_json::Value> {
    let amt: i128 = p.amount_wei.parse().unwrap_or(0);
    let id = state.ledger.post(&p.asset, &p.account, &p.side, amt, p.memo.as_deref());
    match id {
        Ok(pid) => Json(serde_json::json!({"ok":true,"id":pid})),
        Err(e)  => Json(serde_json::json!({"ok":false,"error":e.to_string()}))
    }
}
