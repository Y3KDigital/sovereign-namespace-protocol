use clap::{Parser, Subcommand};
use sqlx::SqlitePool;
use uuid::Uuid;
use payments_api::genesis::GenesisManager;
use chrono::Utc;

#[derive(Parser)]
#[command(name = "admin")]
#[command(about = "Payment API Administration CLI", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Manually retry a failed issuance
    RetryIssuance {
        /// Payment intent ID (UUID)
        payment_intent_id: String,
    },
    /// List all failed issuances
    ListFailed,
    /// List dead-letter issuances (exceeded max retries)
    ListDeadLetter,
    /// List disputed issuances (refunds after 24h)
    ListDisputed,
    /// Inspect specific issuance details
    InspectIssuance {
        /// Issuance ID (UUID)
        issuance_id: String,
    },
    /// Freeze inventory tier (pre-Genesis)
    FreezeInventory {
        /// Tier name (mythic, legendary, epic, rare, uncommon, common)
        tier: String,
    },
    /// Show Genesis readiness status
    GenesisStatus,
    /// Finalize Genesis ceremony (freeze all tiers + create snapshot)
    FinalizeGenesis,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();

    // Connect to database
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite://payments.db".to_string());
    let pool = SqlitePool::connect(&database_url).await?;
    let db = payments_api::database::Database::from_pool(pool);

    match cli.command {
        Commands::RetryIssuance { payment_intent_id } => {
            let id = Uuid::parse_str(&payment_intent_id)?;
            let retry_worker = payments_api::retry_worker::RetryWorker::new(
                db,
                std::time::Duration::from_secs(60),
            );
            retry_worker.retry_issuance(&id).await?;
            println!("✅ Retry completed successfully");
        }
        Commands::ListFailed => {
            let failed = db.get_failed_issuances_for_retry().await?;
            if failed.is_empty() {
                println!("No failed issuances");
            } else {
                println!("Failed Issuances ({}):", failed.len());
                for issuance in failed {
                    println!(
                        "  - ID: {}, Retry: {}/5, Last Error: {}",
                        issuance.id,
                        issuance.retry_count,
                        issuance.last_error.as_deref().unwrap_or("N/A")
                    );
                }
            }
        }
        Commands::ListDeadLetter => {
            let dead_letter = db.get_dead_letter_issuances().await?;
            if dead_letter.is_empty() {
                println!("No dead-letter issuances");
            } else {
                println!("Dead-Letter Issuances ({}):", dead_letter.len());
                for issuance in dead_letter {
                    println!(
                        "  - ID: {}, Retries: {}, Last Error: {}",
                        issuance.id,
                        issuance.retry_count,
                        issuance.last_error.as_deref().unwrap_or("N/A")
                    );
                }
            }
        }
        Commands::ListDisputed => {
            let disputed = db.get_disputed_issuances().await?;
            if disputed.is_empty() {
                println!("No disputed issuances");
            } else {
                println!("Disputed Issuances ({}):", disputed.len());
                for issuance in disputed {
                    println!(
                        "  - ID: {}, Namespace: {}, Error: {}",
                        issuance.id,
                        issuance.namespace,
                        issuance.last_error.as_deref().unwrap_or("N/A")
                    );
                }
            }
        }
        Commands::InspectIssuance { issuance_id } => {
            let id = Uuid::parse_str(&issuance_id)?;
            let issuance = db
                .get_issuance_by_id(&id)
                .await?
                .ok_or_else(|| anyhow::anyhow!("Issuance not found"))?;
            println!("Issuance Details:");
            println!("  ID: {}", issuance.id);
            println!("  Payment Intent: {}", issuance.payment_intent_id);
            println!("  Namespace: {}", issuance.namespace);
            println!("  Customer: {}", issuance.customer_email);
            println!("  IPFS CID: {}", issuance.certificate_ipfs_cid);
            println!("  Hash: {}", issuance.certificate_hash_sha3);
            println!("  Issued At: {}", issuance.issued_at);
        }
        Commands::FreezeInventory { tier } => {
            db.freeze_inventory_tier(&tier).await?;
            println!("✅ Inventory tier {} frozen", tier);
        }
        Commands::GenesisStatus => {
            let status = db.get_genesis_status().await?;
            println!("Genesis Status:");
            println!("  Completed: {}", status.completed);
            if let Some(cid) = status.genesis_cid {
                println!("  Genesis CID: {}", cid);
            }
            if let Some(ts) = status.genesis_timestamp {
                println!("  Genesis Timestamp: {}", ts);
            }
            
            // Check inventory
            let inventory = db.get_inventory_status().await?;
            println!("\nInventory Status:");
            for tier in inventory {
                let frozen = if tier.frozen_at.is_some() { " [FROZEN]" } else { "" };
                println!(
                    "  {}: {}/{} reserved{}",
                    tier.tier, tier.reserved_count, tier.total_supply, frozen
                );
            }
        }
        Commands::FinalizeGenesis => {
            println!("🚀 Initiating Genesis Ceremony...");
            println!();
            
            let genesis_mgr = GenesisManager::new(db.clone());
            
            // Check if Genesis time has been reached
            if !GenesisManager::is_genesis_time() {
                println!("❌ Genesis ceremony not yet scheduled");
                println!("   Scheduled for: {}", payments_api::genesis::GENESIS_TIMESTAMP);
                println!("   Current time:  {}", chrono::Utc::now().to_rfc3339());
                return Ok(());
            }
            
            // Check if already finalized
            if genesis_mgr.is_genesis_finalized().await? {
                println!("⚠️  Genesis has already been finalized");
                let status = db.get_genesis_status().await?;
                if let Some(cid) = status.genesis_cid {
                    println!("   Genesis CID: {}", cid);
                }
                if let Some(ts) = status.genesis_timestamp {
                    println!("   Timestamp:   {}", ts);
                }
                return Ok(());
            }
            
            // Perform Genesis finalization
            match genesis_mgr.finalize_genesis().await {
                Ok(snapshot) => {
                    println!("✅ Genesis Ceremony Finalized Successfully!");
                    println!();
                    println!("📊 Genesis Snapshot Summary:");
                    println!("   Total Issued:   {}", snapshot.total_certificates_issued);
                    println!("   Total Voided:   {}", snapshot.total_certificates_voided);
                    println!("   Total Disputed: {}", snapshot.total_certificates_disputed);
                    println!();
                    println!("🎯 Tier Summary:");
                    for (tier, data) in &snapshot.tier_summary {
                        println!("   {}: {}/{} issued", tier, data.issued_count, data.total_supply);
                    }
                    println!();
                    
                    // Show final Genesis status
                    let status = db.get_genesis_status().await?;
                    if let Some(cid) = status.genesis_cid {
                        println!("🔗 Genesis CID: {}", cid);
                    }
                    if let Some(ts) = status.genesis_timestamp {
                        println!("⏰ Finalized At: {}", ts);
                    }
                }
                Err(e) => {
                    println!("❌ Genesis finalization failed: {}", e);
                    return Err(e.into());
                }
            }
        }
    }

    Ok(())
}
