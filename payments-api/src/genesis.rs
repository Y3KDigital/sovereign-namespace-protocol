use crate::database::Database;
use crate::errors::{PaymentError, PaymentResult};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha3::{Digest, Sha3_256};
use std::collections::HashMap;

/// Genesis timestamp: 2026-01-15 00:00:00 UTC
pub const GENESIS_TIMESTAMP: &str = "2026-01-15T00:00:00Z";

/// Genesis ceremony manager
pub struct GenesisManager {
    db: Database,
}

impl GenesisManager {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    /// Check if Genesis timestamp has been reached
    pub fn is_genesis_time() -> bool {
        let genesis_dt = DateTime::parse_from_rfc3339(GENESIS_TIMESTAMP)
            .expect("Invalid GENESIS_TIMESTAMP constant")
            .with_timezone(&Utc);
        
        Utc::now() >= genesis_dt
    }

    /// Check if Genesis has already been finalized
    pub async fn is_genesis_finalized(&self) -> PaymentResult<bool> {
        let status = self.db.get_genesis_status().await?;
        Ok(status.completed)
    }

    /// Finalize Genesis ceremony
    /// 
    /// Steps:
    /// 1. Verify Genesis timestamp has been reached
    /// 2. Freeze all inventory tiers
    /// 3. Create Genesis state snapshot
    /// 4. Upload snapshot to IPFS
    /// 5. Mark Genesis as completed in database
    /// 6. Return Genesis CID
    pub async fn finalize_genesis(&self) -> PaymentResult<GenesisSnapshot> {
        // 1. Verify Genesis timestamp
        if !Self::is_genesis_time() {
            return Err(PaymentError::GenesisNotReady(format!(
                "Genesis ceremony scheduled for {}",
                GENESIS_TIMESTAMP
            )));
        }

        // 2. Check if already finalized
        if self.is_genesis_finalized().await? {
            return Err(PaymentError::GenesisAlreadyFinalized(
                "Genesis has already been completed".into()
            ));
        }

        // 3. Freeze all inventory tiers
        tracing::info!("Freezing all inventory tiers...");
        self.freeze_all_tiers().await?;

        // 4. Create Genesis state snapshot
        tracing::info!("Creating Genesis state snapshot...");
        let snapshot = self.create_snapshot().await?;

        // 5. Calculate snapshot hash
        let snapshot_json = serde_json::to_string_pretty(&snapshot)
            .map_err(|e| PaymentError::InternalError(format!("JSON serialization failed: {}", e)))?;
        let snapshot_hash = self.calculate_hash(&snapshot_json);

        // 6. Upload to IPFS (placeholder - will be implemented with real IPFS client)
        tracing::info!("Uploading Genesis snapshot to IPFS...");
        let ipfs_cid = self.upload_to_ipfs(&snapshot_json).await?;

        // 7. Mark Genesis as completed
        tracing::info!("Marking Genesis as completed (CID: {})...", ipfs_cid);
        self.db.mark_genesis_completed(&ipfs_cid, &snapshot_hash).await?;

        tracing::info!("✅ Genesis ceremony finalized successfully");
        tracing::info!("   Genesis CID: {}", ipfs_cid);
        tracing::info!("   Genesis Hash: {}", snapshot_hash);
        tracing::info!("   Timestamp: {}", Utc::now());

        Ok(snapshot)
    }

    /// Freeze all inventory tiers
    async fn freeze_all_tiers(&self) -> PaymentResult<()> {
        let tiers = vec!["mythic", "legendary", "epic", "rare", "uncommon", "common"];
        
        for tier in tiers {
            self.db.freeze_inventory_tier(tier).await?;
            tracing::info!("  ✓ Tier '{}' frozen", tier);
        }

        Ok(())
    }

    /// Create Genesis state snapshot
    async fn create_snapshot(&self) -> PaymentResult<GenesisSnapshot> {
        // Get inventory status
        let inventory = self.db.get_inventory_status().await?;

        // Get all issued certificates
        let issued_certificates = self.db.get_all_issued_certificates().await?;

        // Get system metrics
        let total_issued = issued_certificates.len();
        let total_voided = self.db.count_voided_certificates().await?;
        let total_disputed = self.db.count_disputed_certificates().await?;

        // Build tier summary
        let mut tier_summary = HashMap::new();
        for tier_status in &inventory {
            tier_summary.insert(
                tier_status.tier.clone(),
                TierSnapshot {
                    total_supply: tier_status.total_supply as i32,
                    reserved_count: tier_status.reserved_count as i32,
                    issued_count: issued_certificates
                        .iter()
                        .filter(|c| c.tier == tier_status.tier)
                        .count(),
                    frozen_at: tier_status.frozen_at.unwrap_or_else(Utc::now),
                },
            );
        }

        Ok(GenesisSnapshot {
            version: "1.0.0".to_string(),
            genesis_timestamp: Utc::now(),
            ceremony_timestamp: GENESIS_TIMESTAMP.to_string(),
            tier_summary,
            total_certificates_issued: total_issued,
            total_certificates_voided: total_voided,
            total_certificates_disputed: total_disputed,
            issued_certificates: issued_certificates
                .into_iter()
                .map(|c| CertificateRecord {
                    issuance_id: c.id.to_string(),
                    payment_intent_id: c.payment_intent_id.to_string(),
                    namespace: c.namespace,
                    tier: c.tier,
                    customer_email: c.customer_email,
                    certificate_ipfs_cid: c.certificate_ipfs_cid,
                    certificate_hash_sha3: c.certificate_hash_sha3,
                    issued_at: c.issued_at,
                })
                .collect(),
        })
    }

    /// Calculate SHA3-256 hash of snapshot
    fn calculate_hash(&self, data: &str) -> String {
        let mut hasher = Sha3_256::new();
        hasher.update(data.as_bytes());
        let result = hasher.finalize();
        format!("{:x}", result)
    }

    /// Upload snapshot to IPFS (placeholder implementation)
    async fn upload_to_ipfs(&self, data: &str) -> PaymentResult<String> {
        // TODO: Implement real IPFS upload using ipfs-integration crate
        // For now, return a mock CID based on content hash
        let hash = self.calculate_hash(data);
        let mock_cid = format!("Qm{}", &hash[0..44]); // CIDv0 format
        
        tracing::warn!("MOCK IPFS: Using placeholder CID (implement real IPFS upload)");
        
        Ok(mock_cid)
    }

    /// Validate that Genesis has been finalized before allowing operations
    pub async fn require_genesis_finalized(&self) -> PaymentResult<()> {
        if !self.is_genesis_finalized().await? {
            return Err(PaymentError::GenesisNotFinalized(
                "Genesis ceremony must be completed before this operation".into()
            ));
        }
        Ok(())
    }

    /// Validate that Genesis has NOT been finalized (for pre-Genesis operations)
    pub async fn require_genesis_not_finalized(&self) -> PaymentResult<()> {
        if self.is_genesis_finalized().await? {
            return Err(PaymentError::GenesisAlreadyFinalized(
                "This operation can only be performed before Genesis ceremony".into()
            ));
        }
        Ok(())
    }
}

/// Genesis state snapshot (uploaded to IPFS)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenesisSnapshot {
    /// Snapshot format version
    pub version: String,
    
    /// Actual Genesis finalization timestamp
    pub genesis_timestamp: DateTime<Utc>,
    
    /// Scheduled ceremony timestamp
    pub ceremony_timestamp: String,
    
    /// Per-tier inventory summary
    pub tier_summary: HashMap<String, TierSnapshot>,
    
    /// Total certificates issued before Genesis
    pub total_certificates_issued: usize,
    
    /// Total certificates voided before Genesis
    pub total_certificates_voided: usize,
    
    /// Total certificates disputed before Genesis
    pub total_certificates_disputed: usize,
    
    /// All issued certificates (permanent record)
    pub issued_certificates: Vec<CertificateRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TierSnapshot {
    pub total_supply: i32,
    pub reserved_count: i32,
    pub issued_count: usize,
    pub frozen_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CertificateRecord {
    pub issuance_id: String,
    pub payment_intent_id: String,
    pub namespace: String,
    pub tier: String,
    pub customer_email: String,
    pub certificate_ipfs_cid: String,
    pub certificate_hash_sha3: String,
    pub issued_at: DateTime<Utc>,
}
