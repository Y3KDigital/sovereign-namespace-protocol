mod balances;
mod http;

use std::sync::Arc;
use axum::{Router};
use tower_http::cors::{Any, CorsLayer};
use balances::Ledger;
use std::fs;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let db = std::env::var("LEDGER_DB").unwrap_or_else(|_| "data/ledger.db".into());
    let schema = fs::read_to_string("src/schema.sql")?;
    fs::create_dir_all("data").ok();

    let ledger = Ledger::open(&db)?;
    ledger.init(&schema)?;

    // seed canonical assets
    ledger.upsert_asset("UUSD", 18, Some("ipfs://por-uusd"))?;
    ledger.upsert_asset("UCRED", 18, Some("ipfs://policy-ucred"))?;
    ledger.upsert_asset("GOLD", 18, Some("ipfs://policy-gold"))?;

    let app_state = http::AppState { ledger: Arc::new(ledger) };
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app: Router = http::router(app_state).layer(cors);

    let addr = "0.0.0.0:8088".parse().unwrap();
    println!("ledger api on http://{addr}");
    axum::Server::bind(&addr).serve(app.into_make_service()).await?;
    Ok(())
}
