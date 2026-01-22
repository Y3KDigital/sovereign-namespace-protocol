use uuid::Uuid;
use chrono::{Utc, Duration};
use sha3::{Digest, Sha3_256};
use std::env;

use crate::types::{IssuanceRecord, NilRole, PaymentStatus};
use crate::errors::{PaymentError, PaymentResult};
use crate::database::Database;
use crate::genesis::GenesisManager;
use crate::signing;

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

        // Choose namespace
        // - Preferred: user-chosen namespace reserved at create-intent time
        // - Fallback: legacy random namespace generation
        let namespace = match payment_intent.namespace_reserved.as_deref() {
            Some(ns) if !ns.trim().is_empty() => ns.to_string(),
            _ => self.generate_namespace(&payment_intent.rarity_tier)?,
        };

        // =====================================================================
        // STEP 1: Create issuance in PENDING state
        // =====================================================================
        let issuance_id = db
            .create_issuance_pending(
                &payment_intent.id,
                &namespace,
                &payment_intent.customer_email,
                payment_intent.nil_name.as_deref(),
                payment_intent.nil_role.clone(),
                payment_intent.nil_pair_key.as_deref(),
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
        let certificate = match self.generate_certificate(
            &namespace,
            payment_intent.nil_name.as_deref(),
            payment_intent.nil_role.as_ref(),
            payment_intent.nil_pair_key.as_deref(),
        ) {
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

        // =====================================================================
        // STEP 4.5: Provision agent immediately (Y3K requirement)
        // =====================================================================
        // NOTE: This occurs after issuance is finalized. Do NOT return an error from here,
        // otherwise we'd end up with an issued certificate but a failing webhook handler.
        // Instead: attempt provisioning, log loudly if it fails, and allow follow-up repair.
        let ai_provider = env::var("AI_PROVIDER").ok();
        let ai_model = env::var("AI_MODEL").ok();

        // Ledger: internal audit trail (tamper-evident hash chain)
        if let Err(e) = db
            .append_namespace_ledger_event(
                Some(&namespace),
                "namespace_issued",
                &serde_json::json!({
                    "issuance_id": issuance_id.to_string(),
                    "payment_intent_id": payment_intent.id.to_string(),
                    "tier": payment_intent.rarity_tier,
                    "nil_name": payment_intent.nil_name,
                    "nil_role": payment_intent.nil_role,
                    "nil_pair_key": payment_intent.nil_pair_key,
                    "ipfs_cid": ipfs_cid,
                })
                .to_string(),
            )
            .await
        {
            tracing::error!("Ledger append failed (namespace_issued): namespace={}, err={}", namespace, e);
        }

        match db
            .ensure_agent_for_namespace(
                &namespace,
                "default",
                ai_provider.as_deref(),
                ai_model.as_deref(),
            )
            .await
        {
            Ok(agent) => {
                if let Err(e) = db
                    .append_namespace_ledger_event(
                        Some(&namespace),
                        "agent_provisioned",
                        &serde_json::json!({
                            "agent_id": agent.id,
                            "profile": agent.profile,
                            "ai_provider": agent.ai_provider,
                            "ai_model": agent.ai_model,
                        })
                        .to_string(),
                    )
                    .await
                {
                    tracing::error!("Ledger append failed (agent_provisioned): namespace={}, err={}", namespace, e);
                }
            }
            Err(e) => {
                tracing::error!("Agent provisioning failed: namespace={}, err={}", namespace, e);
                if let Err(e2) = db
                    .append_namespace_ledger_event(
                        Some(&namespace),
                        "agent_provision_failed",
                        &serde_json::json!({ "error": e.to_string() }).to_string(),
                    )
                    .await
                {
                    tracing::error!("Ledger append failed (agent_provision_failed): namespace={}, err={}", namespace, e2);
                }
            }
        }

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
    fn generate_certificate(
        &self,
        namespace: &str,
        nil_name: Option<&str>,
        nil_role: Option<&NilRole>,
        nil_pair_key: Option<&str>,
    ) -> PaymentResult<String> {
        #[derive(serde::Serialize)]
        struct Nil<'a> {
            name: Option<&'a str>,
            role: Option<&'a NilRole>,
            pair_key: Option<&'a str>,
        }

        #[derive(serde::Serialize)]
        struct UnsignedCertificate<'a> {
            version: &'static str,
            namespace: &'a str,
            nil: Nil<'a>,
            issued_at: String,
            protocol: &'static str,
        }

        #[derive(serde::Serialize)]
        struct SignedCertificate<'a> {
            version: &'static str,
            namespace: &'a str,
            nil: Nil<'a>,
            issued_at: String,
            protocol: &'static str,

            signature_alg: &'static str,
            signing_public_key_b64: Option<String>,
            signature_b64: String,
            signed_payload_json: String,
        }

        let issued_at = Utc::now().to_rfc3339();
        let unsigned = UnsignedCertificate {
            version: "1.0",
            namespace,
            nil: Nil {
                name: nil_name,
                role: nil_role,
                pair_key: nil_pair_key,
            },
            issued_at: issued_at.clone(),
            protocol: "SNP",
        };

        // Canonical payload: serde struct field order is stable.
        let payload_json = serde_json::to_string(&unsigned).map_err(|e| {
            PaymentError::CertificateGenerationFailed(format!("serialize failed: {e}"))
        })?;

        let require_sig = env::var("REQUIRE_CERT_SIGNATURE")
            .ok()
            .map(|v| matches!(v.to_ascii_lowercase().as_str(), "1" | "true" | "yes" | "on"))
            .unwrap_or(false);

        let signing_key = signing::load_ed25519_signing_key_from_env("Y3K_SIGNING_KEY_ED25519")?;

        let (signature_b64, public_key_b64) = match signing_key {
            Some(key) => (
                signing::ed25519_sign_b64(&key, payload_json.as_bytes()),
                Some(signing::ed25519_public_key_b64(&key)),
            ),
            None => {
                if require_sig {
                    return Err(PaymentError::SigningKeyNotConfigured(
                        "Y3K_SIGNING_KEY_ED25519 is not set".to_string(),
                    ));
                }
                // Dev fallback: still produces deterministic payload + hash, but not cryptographically verifiable.
                ("placeholder_signature".to_string(), None)
            }
        };

        Ok(serde_json::to_string(&SignedCertificate {
            version: unsigned.version,
            namespace: unsigned.namespace,
            nil: unsigned.nil,
            issued_at,
            protocol: unsigned.protocol,
            signature_alg: "ed25519",
            signing_public_key_b64: public_key_b64,
            signature_b64,
            signed_payload_json: payload_json,
        })
        .map_err(|e| PaymentError::CertificateGenerationFailed(format!("serialize failed: {e}")))?)
    }

    // Placeholder: Upload to IPFS (will integrate with ipfs-integration)
    async fn upload_to_ipfs(&self, _data: &str) -> PaymentResult<String> {
        // For MVP, return mock CID
        // In production, this will use ipfs-integration
        // Simulate network delay
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        
        let mock_cid = format!("Qm{}", Uuid::new_v4().to_string().replace("-", ""));
        Ok(mock_cid)
    }
}
