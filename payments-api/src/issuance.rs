use uuid::Uuid;
use chrono::{Utc, Duration};
use sha3::{Digest, Sha3_256};

use crate::types::{IssuanceRecord, PaymentStatus};
use crate::errors::{PaymentError, PaymentResult};
use crate::database::Database;
use crate::genesis::GenesisManager;

#[derive(Clone)]
pub struct IssuanceService {
    // Will integrate with namespace-core and certificate-gen
}

impl IssuanceService {
    pub fn new() -> Self {
        Self {}
    }

    /// Issue certificate with proper state machine (CHECKPOINT 3)
    /// 
    /// State flow: PENDING → PROCESSING → ISSUED/FAILED
    /// 
    /// Transaction boundaries:
    /// 1. Create PENDING row (atomic)
    /// 2. Transition to PROCESSING (atomic)
    /// 3. Do external work WITHOUT holding DB lock (IPFS, cert generation)
    /// 4. Finalize to ISSUED or FAILED (atomic)
    pub async fn issue_certificate(
        &self,
        stripe_payment_intent_id: &str,
        db: &Database,
    ) -> PaymentResult<IssuanceRecord> {
        tracing::info!(
            "Starting certificate issuance: payment_intent={}",
            stripe_payment_intent_id
        );

        // CHECKPOINT 6: Validate Genesis has been finalized before issuing certificates
        let genesis_mgr = GenesisManager::new(db.clone());
        if !genesis_mgr.is_genesis_finalized().await? {
            return Err(PaymentError::GenesisNotFinalized(
                "Certificates cannot be issued until Genesis ceremony is complete".into()
            ));
        }

        // Get payment intent
        let payment_intent = db
            .get_payment_intent_by_stripe_id(stripe_payment_intent_id)
            .await?
            .ok_or_else(|| {
                PaymentError::PaymentIntentNotFound(stripe_payment_intent_id.to_string())
            })?;

        // Check if already issued
        if let Some(existing_order) = db.get_order(&payment_intent.id).await? {
            if existing_order.issuance.is_some() {
                return Err(PaymentError::OrderAlreadyFulfilled(
                    payment_intent.id.to_string(),
                ));
            }
        }

        // Generate namespace
        let namespace = self.generate_namespace(&payment_intent.rarity_tier)?;

        // =====================================================================
        // STEP 1: Create issuance in PENDING state
        // =====================================================================
        let issuance_id = db
            .create_issuance_pending(
                &payment_intent.id,
                &namespace,
                &payment_intent.customer_email,
            )
            .await?;

        tracing::info!("Created issuance: id={}, state=PENDING", issuance_id);

        // =====================================================================
        // STEP 2: Transition to PROCESSING
        // =====================================================================
        let transitioned = db
            .transition_issuance_state(&issuance_id, "pending", "processing")
            .await?;

        if !transitioned {
            return Err(PaymentError::InternalError(
                "Cannot transition to processing: state conflict".to_string(),
            ));
        }

        tracing::info!("Transitioned: issuance={}, state=PROCESSING", issuance_id);

        // =====================================================================
        // STEP 3: External work (NO DB LOCK HELD)
        // =====================================================================
        // Generate certificate
        let certificate = match self.generate_certificate(&namespace) {
            Ok(cert) => cert,
            Err(e) => {
                tracing::error!("Certificate generation failed: {}", e);
                db.mark_issuance_failed(&issuance_id, &e.to_string(), "processing")
                    .await?;
                return Err(e);
            }
        };

        // Upload to IPFS
        let ipfs_cid = match self.upload_to_ipfs(&certificate).await {
            Ok(cid) => cid,
            Err(e) => {
                tracing::error!("IPFS upload failed: {}", e);
                db.mark_issuance_failed(&issuance_id, &e.to_string(), "processing")
                    .await?;
                return Err(e);
            }
        };

        // Hash certificate
        let mut hasher = Sha3_256::new();
        hasher.update(certificate.as_bytes());
        let certificate_hash = format!("{:x}", hasher.finalize());

        // Generate download token
        let download_token = Uuid::new_v4().to_string();
        let download_expires_at = Utc::now() + Duration::days(30);

        tracing::info!(
            "External work complete: issuance={}, ipfs_cid={}",
            issuance_id, ipfs_cid
        );

        // =====================================================================
        // STEP 4: Finalize to ISSUED state
        // =====================================================================
        db.finalize_issuance(
            &issuance_id,
            &ipfs_cid,
            &certificate_hash,
            &download_token,
            download_expires_at,
        )
        .await?;

        tracing::info!(
            "Issuance finalized: id={}, state=ISSUED, ipfs_cid={}",
            issuance_id, ipfs_cid
        );

        // Update payment status to delivered
        db.update_payment_status(stripe_payment_intent_id, PaymentStatus::Delivered)
            .await?;

        // Fetch final record
        let record = db
            .get_issuance_by_id(&issuance_id)
            .await?
            .ok_or_else(|| {
                PaymentError::InternalError("Issuance disappeared after finalization".to_string())
            })?;

        // TODO: Send email with certificate

        Ok(record)
    }

    // =========================================================================
    // EXTERNAL WORK (NO DB OPERATIONS)
    // =========================================================================

    // Placeholder: Generate namespace (will integrate with namespace-core)
    fn generate_namespace(&self, rarity_tier: &str) -> PaymentResult<String> {
        // For MVP, generate pseudo-random namespace
        // In production, this will use namespace-core with entropy
        let id = Uuid::new_v4().to_string();
        Ok(format!("{}.{}.x", &id[..8], rarity_tier))
    }

    // Placeholder: Generate certificate (will integrate with certificate-gen)
    fn generate_certificate(&self, namespace: &str) -> PaymentResult<String> {
        // For MVP, return simple JSON
        // In production, this will use certificate-gen with Ed25519 signature
        Ok(serde_json::json!({
            "version": "1.0",
            "namespace": namespace,
            "issued_at": Utc::now().to_rfc3339(),
            "protocol": "SNP",
            "signature": "placeholder_signature"
        })
        .to_string())
    }

    // Placeholder: Upload to IPFS (will integrate with ipfs-integration)
    async fn upload_to_ipfs(&self, data: &str) -> PaymentResult<String> {
        // For MVP, return mock CID
        // In production, this will use ipfs-integration
        // Simulate network delay
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        
        let mock_cid = format!("Qm{}", Uuid::new_v4().to_string().replace("-", ""));
        Ok(mock_cid)
    }
}
