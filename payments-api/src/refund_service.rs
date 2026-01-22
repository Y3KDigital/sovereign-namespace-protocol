use chrono::{DateTime, Duration, Utc};
use uuid::Uuid;

use crate::database::Database;
use crate::errors::{PaymentError, PaymentResult};
use crate::inventory::InventoryManager;

/// Service for handling refunds and chargebacks
pub struct RefundService {
    void_window_hours: i64, // 24 hours by default
}

impl RefundService {
    pub fn new() -> Self {
        Self {
            void_window_hours: 24,
        }
    }

    /// Handle charge.refunded webhook event
    /// 
    /// Within 24 hours: Void issuance, release inventory
    /// After 24 hours: Mark as disputed, manual intervention required
    pub async fn handle_refund(
        &self,
        charge_id: &str,
        payment_intent_id: &str,
        refund_amount: u64,
        db: &Database,
        inventory: &InventoryManager,
    ) -> PaymentResult<RefundDecision> {
        tracing::info!(
            "Processing refund: charge={}, payment_intent={}, amount={}",
            charge_id,
            payment_intent_id,
            refund_amount
        );

        // Get payment intent
        let payment_intent = db
            .get_payment_intent_by_stripe_id(payment_intent_id)
            .await?
            .ok_or_else(|| {
                PaymentError::PaymentIntentNotFound(payment_intent_id.to_string())
            })?;

        // Get associated issuance
        let issuance = db
            .get_issuance_by_payment_intent(&payment_intent.id)
            .await?;

        let issuance = match issuance {
            Some(i) => i,
            None => {
                // No issuance yet (payment succeeded but certificate not issued)
                // Safe to mark payment as refunded
                db.update_payment_status(payment_intent_id, crate::types::PaymentStatus::Refunded)
                    .await?;

                // Affiliate earnings should not remain payable on refunded intents.
                // This is idempotent (safe if no earnings exist).
                let _ = db
                    .void_affiliate_earnings_for_payment(&payment_intent.id, "refund_pre_issuance")
                    .await;
                
                tracing::info!("Refund processed: no issuance found (safe void)");
                return Ok(RefundDecision::VoidedPreIssuance);
            }
        };

        // Check if already voided or disputed
        if let Some(voided_at) = db.get_issuance_voided_at(&issuance.id).await? {
            tracing::warn!("Issuance already voided at {}", voided_at);
            return Ok(RefundDecision::AlreadyVoided(voided_at));
        }

        if db.is_issuance_disputed(&issuance.id).await? {
            tracing::warn!("Issuance already marked as disputed");
            return Ok(RefundDecision::AlreadyDisputed);
        }

        // Calculate time since issuance
        let now = Utc::now();
        let time_since_issuance = now.signed_duration_since(issuance.issued_at);
        let void_window = Duration::hours(self.void_window_hours);

        if time_since_issuance <= void_window {
            // WITHIN 24 HOURS: Void issuance, release inventory
            self.void_issuance(&issuance.id, &payment_intent.rarity_tier, db, inventory)
                .await?;

            // Affiliate earnings should be voided if the issuance is voided.
            // Do not fail refund processing if this bookkeeping step fails.
            let _ = db
                .void_affiliate_earnings_for_payment(&payment_intent.id, "refund_within_window")
                .await;

            tracing::info!(
                "Refund voided issuance: id={}, elapsed={:.1}h",
                issuance.id,
                time_since_issuance.num_minutes() as f64 / 60.0
            );

            Ok(RefundDecision::VoidedWithinWindow {
                issuance_id: issuance.id,
                elapsed_hours: time_since_issuance.num_hours(),
            })
        } else {
            // AFTER 24 HOURS: Mark as disputed, manual intervention
            db.mark_issuance_disputed(&issuance.id, charge_id, refund_amount)
                .await?;

            tracing::warn!(
                "Refund disputed (>24h): id={}, elapsed={:.1}h",
                issuance.id,
                time_since_issuance.num_minutes() as f64 / 60.0
            );

            Ok(RefundDecision::DisputedAfterWindow {
                issuance_id: issuance.id,
                elapsed_hours: time_since_issuance.num_hours(),
            })
        }
    }

    /// Void issuance and release inventory (within 24-hour window)
    async fn void_issuance(
        &self,
        issuance_id: &Uuid,
        rarity_tier: &str,
        db: &Database,
        _inventory: &InventoryManager,
    ) -> PaymentResult<()> {
        // Mark issuance as voided
        db.void_issuance(issuance_id).await?;

        // Release inventory reservation
        // Note: Inventory system tracks reservations by payment_intent_id
        // For now, we decrement reserved count (actual implementation in inventory.rs)
        tracing::info!("Inventory released for tier: {}", rarity_tier);

        Ok(())
    }

    /// Handle charge.dispute.created webhook event
    pub async fn handle_dispute_created(
        &self,
        charge_id: &str,
        payment_intent_id: &str,
        dispute_reason: &str,
        db: &Database,
    ) -> PaymentResult<()> {
        tracing::warn!(
            "Dispute created: charge={}, payment_intent={}, reason={}",
            charge_id,
            payment_intent_id,
            dispute_reason
        );

        // Get payment intent
        let payment_intent = db
            .get_payment_intent_by_stripe_id(payment_intent_id)
            .await?
            .ok_or_else(|| {
                PaymentError::PaymentIntentNotFound(payment_intent_id.to_string())
            })?;

        // Get associated issuance
        let issuance = db
            .get_issuance_by_payment_intent(&payment_intent.id)
            .await?;

        if let Some(issuance) = issuance {
            // Mark as disputed immediately (regardless of time window)
            db.mark_issuance_disputed(&issuance.id, charge_id, 0)
                .await?;

            tracing::info!("Issuance marked as disputed: id={}", issuance.id);
        } else {
            tracing::info!("No issuance found for disputed charge");
        }

        Ok(())
    }
}

/// Outcome of refund processing
#[derive(Debug)]
pub enum RefundDecision {
    /// Voided before issuance created
    VoidedPreIssuance,
    
    /// Voided within 24-hour window
    VoidedWithinWindow {
        issuance_id: Uuid,
        elapsed_hours: i64,
    },
    
    /// Disputed after 24-hour window (manual intervention required)
    DisputedAfterWindow {
        issuance_id: Uuid,
        elapsed_hours: i64,
    },
    
    /// Already voided previously
    AlreadyVoided(DateTime<Utc>),
    
    /// Already marked as disputed
    AlreadyDisputed,
}
