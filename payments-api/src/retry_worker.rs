use std::time::Duration;
use tokio::time::sleep;
use uuid::Uuid;

use crate::database::Database;
use crate::issuance::IssuanceService;
use crate::errors::{PaymentError, PaymentResult};

/// Retry worker for failed certificate issuances
pub struct RetryWorker {
    db: Database,
    issuance_service: IssuanceService,
    check_interval: Duration,
    max_retries: u32,
}

impl RetryWorker {
    pub fn new(db: Database, check_interval: Duration) -> Self {
        Self {
            db,
            issuance_service: IssuanceService::new(),
            check_interval,
            max_retries: 5,
        }
    }

    /// Start the retry worker loop
    pub async fn run(self) {
        tracing::info!(
            "Retry worker started: check_interval={:?}, max_retries={}",
            self.check_interval,
            self.max_retries
        );

        loop {
            if let Err(e) = self.process_failed_issuances().await {
                tracing::error!("Retry worker error: {}", e);
            }

            sleep(self.check_interval).await;
        }
    }

    /// Process all failed issuances eligible for retry
    async fn process_failed_issuances(&self) -> Result<(), PaymentError> {
        // Query failed issuances ready for retry
        let failed_issuances = self.db.get_failed_issuances_for_retry().await?;

        if failed_issuances.is_empty() {
            tracing::debug!("No failed issuances to retry");
            return Ok(());
        }

        tracing::info!("Processing {} failed issuances", failed_issuances.len());

        for issuance in failed_issuances {
            // Check retry limit
            if issuance.retry_count >= self.max_retries {
                tracing::warn!(
                    "Issuance {} exceeded max retries ({}), moving to dead-letter",
                    issuance.id,
                    self.max_retries
                );
                self.db.move_to_dead_letter(&issuance.id).await?;
                continue;
            }

            // Get payment intent for retry
            let payment_intent = match self
                .db
                .get_payment_intent_by_id(&issuance.payment_intent_id)
                .await?
            {
                Some(pi) => pi,
                None => {
                    tracing::error!(
                        "Payment intent not found for issuance {}: {}",
                        issuance.id,
                        issuance.payment_intent_id
                    );
                    continue;
                }
            };

            tracing::info!(
                "Retrying issuance: id={}, attempt={}/{}",
                issuance.id,
                issuance.retry_count + 1,
                self.max_retries
            );

            // Reset to pending state for retry
            if let Err(e) = self
                .db
                .reset_issuance_to_pending(&issuance.id)
                .await
            {
                tracing::error!("Failed to reset issuance {} to pending: {}", issuance.id, e);
                continue;
            }

            // Attempt reissue
            match self
                .issuance_service
                .issue_certificate(&payment_intent.stripe_payment_intent_id, &self.db)
                .await
            {
                Ok(record) => {
                    tracing::info!(
                        "Retry succeeded: issuance={}, ipfs_cid={}",
                        record.id,
                        record.certificate_ipfs_cid
                    );
                }
                Err(e) => {
                    tracing::error!("Retry failed: issuance={}, error={}", issuance.id, e);
                    // Error already persisted by state machine
                }
            }
        }

        Ok(())
    }

    /// Manually retry a specific issuance (for admin CLI)
    pub async fn retry_issuance(
        &self,
        payment_intent_id: &Uuid,
    ) -> Result<(), PaymentError> {
        tracing::info!("Manual retry requested: payment_intent={}", payment_intent_id);

        // Get payment intent
        let payment_intent = self
            .db
            .get_payment_intent_by_id(payment_intent_id)
            .await?
            .ok_or_else(|| {
                PaymentError::PaymentIntentNotFound(payment_intent_id.to_string())
            })?;

        // Find associated issuance
        let issuance = self
            .db
            .get_issuance_by_payment_intent(payment_intent_id)
            .await?
            .ok_or_else(|| {
                PaymentError::InternalError("No issuance found for payment intent".to_string())
            })?;

        // Reset to pending
        self.db.reset_issuance_to_pending(&issuance.id).await?;

        // Attempt reissue
        self.issuance_service
            .issue_certificate(&payment_intent.stripe_payment_intent_id, &self.db)
            .await?;

        tracing::info!("Manual retry succeeded: issuance={}", issuance.id);
        Ok(())
    }
}
