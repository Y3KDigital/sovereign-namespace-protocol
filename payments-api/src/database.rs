use sqlx::{Row, SqlitePool};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use std::str::FromStr;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::types::{GenesisStatus, InventoryTierStatus};
use crate::types::{PaymentIntent, PaymentStatus, IssuanceRecord, Order};
use crate::types::{Affiliate, AffiliatePortalStats};
use crate::errors::{PaymentError, PaymentResult};

#[derive(Clone)]
pub struct Database {
    pub pool: SqlitePool,  // Make pool public for InventoryManager
}

impl Database {
    pub async fn new(database_url: &str) -> PaymentResult<Self> {
        // IMPORTANT: sqlx does not necessarily create SQLite files implicitly.
        // We explicitly enable create_if_missing so first-run local/dev works.
        let options = SqliteConnectOptions::from_str(database_url)
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?
            .create_if_missing(true);

        let pool = SqlitePoolOptions::new()
            .connect_with(options)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        // Run migrations
        sqlx::migrate!("./migrations")
            .run(&pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(Self { pool })
    }

    /// Create Database from existing pool (for CLI tools)
    pub fn from_pool(pool: SqlitePool) -> Self {
        Self { pool }
    }

    // =====================================================================
    // Affiliate / broker program
    // =====================================================================

    pub async fn create_affiliate(
        &self,
        display_name: &str,
        email: &str,
        commission_bps: u32,
        bonus_cents: u64,
    ) -> PaymentResult<Affiliate> {
        let id = Uuid::new_v4().to_string();
        let portal_token = format!("pt_{}", Uuid::new_v4().simple());

        // Short shareable code.
        let raw = Uuid::new_v4().simple().to_string();
        let referral_code = format!("r{}", &raw[..10]);

        sqlx::query(
            r#"
            INSERT INTO affiliates (
                id, display_name, email, portal_token, referral_code,
                commission_bps, bonus_cents, active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&id)
        .bind(display_name)
        .bind(email)
        .bind(&portal_token)
        .bind(&referral_code)
        .bind(commission_bps as i64)
        .bind(bonus_cents as i64)
        .bind(true)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let row = sqlx::query("SELECT * FROM affiliates WHERE id = ?")
            .bind(&id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        self.row_to_affiliate(row)
    }

    pub async fn get_affiliate_by_portal_token(
        &self,
        portal_token: &str,
    ) -> PaymentResult<Option<Affiliate>> {
        let row = sqlx::query("SELECT * FROM affiliates WHERE portal_token = ?")
            .bind(portal_token)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(self.row_to_affiliate(r)?)),
            None => Ok(None),
        }
    }

    pub async fn get_affiliate_by_referral_code(
        &self,
        referral_code: &str,
    ) -> PaymentResult<Option<Affiliate>> {
        let row = sqlx::query("SELECT * FROM affiliates WHERE referral_code = ?")
            .bind(referral_code)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(self.row_to_affiliate(r)?)),
            None => Ok(None),
        }
    }

    pub async fn record_affiliate_lead(
        &self,
        affiliate_id: &str,
        referral_code: &str,
        lead_email: &str,
        lead_name: Option<&str>,
        note: Option<&str>,
    ) -> PaymentResult<(String, DateTime<Utc>)> {
        let id = Uuid::new_v4().to_string();

        let res = sqlx::query(
            r#"
            INSERT INTO affiliate_leads (
                id, affiliate_id, referral_code,
                lead_email, lead_name, note
            ) VALUES (?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&id)
        .bind(affiliate_id)
        .bind(referral_code)
        .bind(lead_email)
        .bind(lead_name)
        .bind(note)
        .execute(&self.pool)
        .await;

        match res {
            Ok(_) => {
                let created_at: DateTime<Utc> = sqlx::query_scalar(
                    "SELECT created_at FROM affiliate_leads WHERE id = ?",
                )
                .bind(&id)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

                Ok((id, created_at))
            }
            Err(e) => {
                let msg = e.to_string();
                if msg.contains("UNIQUE constraint failed") {
                    return Err(PaymentError::LeadAlreadyExists);
                }
                Err(PaymentError::DatabaseError(msg))
            }
        }
    }

    pub async fn get_affiliate_portal_stats(
        &self,
        affiliate: &Affiliate,
    ) -> PaymentResult<AffiliatePortalStats> {
        let leads_count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM affiliate_leads WHERE affiliate_id = ?",
        )
        .bind(&affiliate.id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        // Conversions are attributed by either affiliate_id (internal id) or referral_code.
        let conversions_count: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*)
            FROM payment_intents
            WHERE (affiliate_id = ? OR affiliate_id = ? OR affiliate_referral_code = ?)
              AND (status LIKE '%succeeded%' OR status LIKE '%delivered%')
            "#,
        )
        .bind(&affiliate.id)
        .bind(&affiliate.referral_code)
        .bind(&affiliate.referral_code)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let gross_revenue_cents: i64 = sqlx::query_scalar(
            r#"
            SELECT COALESCE(SUM(amount_cents), 0)
            FROM payment_intents
            WHERE (affiliate_id = ? OR affiliate_id = ? OR affiliate_referral_code = ?)
              AND (status LIKE '%succeeded%' OR status LIKE '%delivered%')
            "#,
        )
        .bind(&affiliate.id)
        .bind(&affiliate.referral_code)
        .bind(&affiliate.referral_code)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let earned_cents: i64 = sqlx::query_scalar(
            "SELECT COALESCE(SUM(amount_cents), 0) FROM affiliate_earnings WHERE affiliate_id = ? AND status IN ('earned','paid')",
        )
        .bind(&affiliate.id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let paid_cents: i64 = sqlx::query_scalar(
            "SELECT COALESCE(SUM(amount_cents), 0) FROM affiliate_earnings WHERE affiliate_id = ? AND status = 'paid'",
        )
        .bind(&affiliate.id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let voided_cents: i64 = sqlx::query_scalar(
            "SELECT COALESCE(SUM(amount_cents), 0) FROM affiliate_earnings WHERE affiliate_id = ? AND status = 'voided'",
        )
        .bind(&affiliate.id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(AffiliatePortalStats {
            leads_count: leads_count.max(0) as u64,
            conversions_count: conversions_count.max(0) as u64,
            gross_revenue_cents: gross_revenue_cents.max(0) as u64,
            earned_cents: earned_cents.max(0) as u64,
            paid_cents: paid_cents.max(0) as u64,
            voided_cents: voided_cents.max(0) as u64,
        })
    }

    pub async fn record_affiliate_earning_for_payment(
        &self,
        payment_intent_uuid: &Uuid,
    ) -> PaymentResult<()> {
        let pi = self
            .get_payment_intent_by_id(payment_intent_uuid)
            .await?
            .ok_or_else(|| PaymentError::PaymentIntentNotFound(payment_intent_uuid.to_string()))?;

        let affiliate_key = match (&pi.affiliate_id, &pi.partner_id) {
            (Some(a), _) if !a.trim().is_empty() => Some(a.trim().to_string()),
            _ => None,
        };

        let affiliate_referral_code = sqlx::query_scalar::<_, Option<String>>(
            "SELECT affiliate_referral_code FROM payment_intents WHERE id = ?",
        )
        .bind(payment_intent_uuid.to_string())
        .fetch_one(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let mut affiliate: Option<Affiliate> = None;

        if let Some(key) = affiliate_key.clone() {
            // Try as internal affiliate id first, then as referral code.
            affiliate = self.get_affiliate_by_id_or_referral(&key).await?;
        }
        if affiliate.is_none() {
            if let Some(code) = affiliate_referral_code.clone() {
                affiliate = self.get_affiliate_by_referral_code(code.trim()).await?;
            }
        }

        let affiliate = match affiliate {
            Some(a) => a,
            None => return Ok(()),
        };

        if !affiliate.active {
            return Err(PaymentError::AffiliateInactive);
        }

        let base = (pi.amount_cents as u128)
            .saturating_mul(affiliate.commission_bps as u128)
            / 10_000u128;
        let total = base.saturating_add(affiliate.bonus_cents as u128);
        let amount_cents = u64::try_from(total).unwrap_or(0);

        let earning_id = Uuid::new_v4().to_string();
        let res = sqlx::query(
            r#"
            INSERT INTO affiliate_earnings (
                id, affiliate_id, payment_intent_id, amount_cents, currency, status
            ) VALUES (?, ?, ?, ?, ?, 'earned')
            "#,
        )
        .bind(&earning_id)
        .bind(&affiliate.id)
        .bind(payment_intent_uuid.to_string())
        .bind(amount_cents as i64)
        .bind(&pi.currency)
        .execute(&self.pool)
        .await;

        match res {
            Ok(_) => Ok(()),
            Err(e) => {
                let msg = e.to_string();
                // Idempotency: if the earning already exists, treat as success.
                if msg.contains("UNIQUE constraint failed") {
                    return Ok(());
                }
                Err(PaymentError::DatabaseError(msg))
            }
        }
    }

    pub async fn record_affiliate_earning_for_stripe_payment_intent(
        &self,
        stripe_payment_intent_id: &str,
    ) -> PaymentResult<()> {
        let pi = self
            .get_payment_intent_by_stripe_id(stripe_payment_intent_id)
            .await?
            .ok_or_else(|| {
                PaymentError::PaymentIntentNotFound(stripe_payment_intent_id.to_string())
            })?;

        self.record_affiliate_earning_for_payment(&pi.id).await
    }

    pub async fn void_affiliate_earnings_for_payment(
        &self,
        payment_intent_uuid: &Uuid,
        reason: &str,
    ) -> PaymentResult<()> {
        sqlx::query(
            r#"
            UPDATE affiliate_earnings
            SET status = 'voided', voided_at = CURRENT_TIMESTAMP, void_reason = ?
            WHERE payment_intent_id = ? AND status != 'voided'
            "#,
        )
        .bind(reason)
        .bind(payment_intent_uuid.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn void_affiliate_earnings_for_stripe_payment_intent(
        &self,
        stripe_payment_intent_id: &str,
        reason: &str,
    ) -> PaymentResult<()> {
        let pi = self
            .get_payment_intent_by_stripe_id(stripe_payment_intent_id)
            .await?
            .ok_or_else(|| {
                PaymentError::PaymentIntentNotFound(stripe_payment_intent_id.to_string())
            })?;

        self.void_affiliate_earnings_for_payment(&pi.id, reason).await
    }

    /// Create new payment intent record
    pub async fn create_payment_intent(
        &self,
        payment_intent: &PaymentIntent,
    ) -> PaymentResult<()> {
        sqlx::query(
            r#"
            INSERT INTO payment_intents (
                id, stripe_payment_intent_id, amount_cents, currency,
                customer_email, namespace_reserved, rarity_tier, status,
                created_at, partner_id, affiliate_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(payment_intent.id.to_string())
        .bind(&payment_intent.stripe_payment_intent_id)
        .bind(payment_intent.amount_cents as i64)
        .bind(&payment_intent.currency)
        .bind(&payment_intent.customer_email)
        .bind(&payment_intent.namespace_reserved)
        .bind(&payment_intent.rarity_tier)
        .bind(serde_json::to_string(&payment_intent.status).unwrap())
        .bind(payment_intent.created_at)
        .bind(&payment_intent.partner_id)
        .bind(&payment_intent.affiliate_id)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Get payment intent by Stripe ID
    pub async fn get_payment_intent_by_stripe_id(
        &self,
        stripe_id: &str,
    ) -> PaymentResult<Option<PaymentIntent>> {
        let row = sqlx::query(
            r#"
            SELECT * FROM payment_intents WHERE stripe_payment_intent_id = ?
            "#,
        )
        .bind(stripe_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(self.row_to_payment_intent(r)?)),
            None => Ok(None),
        }
    }

    /// Get payment intent by UUID
    pub async fn get_payment_intent_by_id(
        &self,
        id: &Uuid,
    ) -> PaymentResult<Option<PaymentIntent>> {
        let row = sqlx::query(
            r#"
            SELECT * FROM payment_intents WHERE id = ?
            "#,
        )
        .bind(id.to_string())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(self.row_to_payment_intent(r)?)),
            None => Ok(None),
        }
    }

    /// Update payment intent status
    pub async fn update_payment_status(
        &self,
        stripe_id: &str,
        status: PaymentStatus,
    ) -> PaymentResult<()> {
        let now = if status == PaymentStatus::Succeeded {
            Some(Utc::now())
        } else {
            None
        };

        sqlx::query(
            r#"
            UPDATE payment_intents
            SET status = ?, settled_at = ?
            WHERE stripe_payment_intent_id = ?
            "#,
        )
        .bind(serde_json::to_string(&status).unwrap())
        .bind(now)
        .bind(stripe_id)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Create issuance record
    pub async fn create_issuance(
        &self,
        issuance: &IssuanceRecord,
    ) -> PaymentResult<()> {
        sqlx::query(
            r#"
            INSERT INTO issuances (
                id, payment_intent_id, namespace, certificate_ipfs_cid,
                certificate_hash_sha3, customer_email, issued_at,
                download_token, download_expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(issuance.id.to_string())
        .bind(issuance.payment_intent_id.to_string())
        .bind(&issuance.namespace)
        .bind(&issuance.certificate_ipfs_cid)
        .bind(&issuance.certificate_hash_sha3)
        .bind(&issuance.customer_email)
        .bind(issuance.issued_at)
        .bind(&issuance.download_token)
        .bind(issuance.download_expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Get issuance by download token
    pub async fn get_issuance_by_token(
        &self,
        token: &str,
    ) -> PaymentResult<Option<IssuanceRecord>> {
        let row = sqlx::query(
            r#"
            SELECT * FROM issuances WHERE download_token = ?
            "#,
        )
        .bind(token)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(self.row_to_issuance(r)?)),
            None => Ok(None),
        }
    }

    /// Get order by payment intent ID
    pub async fn get_order(
        &self,
        payment_intent_id: &Uuid,
    ) -> PaymentResult<Option<Order>> {
        let payment_row = sqlx::query(
            r#"
            SELECT * FROM payment_intents WHERE id = ?
            "#,
        )
        .bind(payment_intent_id.to_string())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        if payment_row.is_none() {
            return Ok(None);
        }

        let payment_intent = self.row_to_payment_intent(payment_row.unwrap())?;

        let issuance_row = sqlx::query(
            r#"
            SELECT * FROM issuances WHERE payment_intent_id = ?
            "#,
        )
        .bind(payment_intent_id.to_string())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let issuance = match issuance_row {
            Some(r) => Some(self.row_to_issuance(r)?),
            None => None,
        };

        Ok(Some(Order {
            id: *payment_intent_id,
            payment_intent,
            issuance,
            partner_commission_cents: None, // TODO: Calculate from partner_id
            affiliate_commission_cents: None, // TODO: Calculate from affiliate_id
        }))
    }

    // Helper: Convert row to PaymentIntent
    fn row_to_payment_intent(&self, row: sqlx::sqlite::SqliteRow) -> PaymentResult<PaymentIntent> {
        Ok(PaymentIntent {
            id: Uuid::parse_str(&row.get::<String, _>("id"))
                .map_err(|e| PaymentError::DatabaseError(e.to_string()))?,
            stripe_payment_intent_id: row.get("stripe_payment_intent_id"),
            amount_cents: row.get::<i64, _>("amount_cents") as u64,
            currency: row.get("currency"),
            customer_email: row.get("customer_email"),
            namespace_reserved: row.get("namespace_reserved"),
            rarity_tier: row.get("rarity_tier"),
            status: serde_json::from_str(&row.get::<String, _>("status"))
                .map_err(|e| PaymentError::DatabaseError(e.to_string()))?,
            created_at: row.get("created_at"),
            settled_at: row.get("settled_at"),
            partner_id: row.get("partner_id"),
            affiliate_id: row.get("affiliate_id"),
        })
    }

    fn row_to_affiliate(&self, row: sqlx::sqlite::SqliteRow) -> PaymentResult<Affiliate> {
        Ok(Affiliate {
            id: row.get::<String, _>("id"),
            display_name: row.get::<String, _>("display_name"),
            email: row.get::<String, _>("email"),
            portal_token: row.get::<String, _>("portal_token"),
            referral_code: row.get::<String, _>("referral_code"),
            commission_bps: row.get::<i64, _>("commission_bps") as u32,
            bonus_cents: row.get::<i64, _>("bonus_cents") as u64,
            active: row.get::<i64, _>("active") != 0,
            created_at: row.get::<DateTime<Utc>, _>("created_at"),
        })
    }

    async fn get_affiliate_by_id_or_referral(&self, key: &str) -> PaymentResult<Option<Affiliate>> {
        // Try id
        let row = sqlx::query("SELECT * FROM affiliates WHERE id = ?")
            .bind(key)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        if let Some(r) = row {
            return Ok(Some(self.row_to_affiliate(r)?));
        }
        self.get_affiliate_by_referral_code(key).await
    }

    // Helper: Convert row to IssuanceRecord
    fn row_to_issuance(&self, row: sqlx::sqlite::SqliteRow) -> PaymentResult<IssuanceRecord> {
        Ok(IssuanceRecord {
            id: Uuid::parse_str(&row.get::<String, _>("id"))
                .map_err(|e| PaymentError::DatabaseError(e.to_string()))?,
            payment_intent_id: Uuid::parse_str(&row.get::<String, _>("payment_intent_id"))
                .map_err(|e| PaymentError::DatabaseError(e.to_string()))?,
            namespace: row.get("namespace"),
            tier: row.try_get("tier").unwrap_or_else(|_| "unknown".to_string()),
            certificate_ipfs_cid: row.get("certificate_ipfs_cid"),
            certificate_hash_sha3: row.get("certificate_hash_sha3"),
            customer_email: row.get("customer_email"),
            issued_at: row.get("issued_at"),
            download_token: row.get("download_token"),
            download_expires_at: row.get("download_expires_at"),
            retry_count: row.get::<i64, _>("retry_count") as u32,
            last_error: row.get("last_error"),
        })
    }

    // ========================================================================
    // IDEMPOTENCY LAYER (CHECKPOINT 2)
    // ========================================================================

    /// Record processed Stripe event (idempotency guard)
    /// Returns Ok(true) if event was newly inserted (continue processing)
    /// Returns Ok(false) if event already exists (skip processing)
    pub async fn record_stripe_event(
        &self,
        event_id: &str,
        event_type: &str,
        payment_intent_id: Option<&str>,
        outcome: &str,
    ) -> PaymentResult<bool> {
        let result = sqlx::query(
            r#"
            INSERT INTO processed_stripe_events (
                stripe_event_id, event_type, payment_intent_id, 
                processed_at, outcome
            ) VALUES (?, ?, ?, ?, ?)
            "#,
        )
        .bind(event_id)
        .bind(event_type)
        .bind(payment_intent_id)
        .bind(Utc::now())
        .bind(outcome)
        .execute(&self.pool)
        .await;

        match result {
            Ok(_) => Ok(true),  // Newly inserted, continue processing
            Err(sqlx::Error::Database(e)) if e.is_unique_violation() => {
                tracing::info!("Duplicate webhook event ignored: {}", event_id);
                Ok(false)  // Already processed, skip
            }
            Err(e) => Err(PaymentError::DatabaseError(e.to_string())),
        }
    }

    /// Acquire issuance lock (intent-level protection)
    /// Returns Ok(true) if lock acquired (continue issuance)
    /// Returns Ok(false) if lock already held (skip issuance)
    pub async fn acquire_issuance_lock(
        &self,
        stripe_payment_intent_id: &str,
        lock_token: &str,
    ) -> PaymentResult<bool> {
        let result = sqlx::query(
            r#"
            UPDATE payment_intents
            SET issuance_lock_token = ?, processing_started_at = ?
            WHERE stripe_payment_intent_id = ?
              AND issuance_lock_token IS NULL
            "#,
        )
        .bind(lock_token)
        .bind(Utc::now())
        .bind(stripe_payment_intent_id)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            tracing::warn!(
                "Issuance lock already held for payment_intent: {}",
                stripe_payment_intent_id
            );
            Ok(false)  // Lock already held, skip issuance
        } else {
            Ok(true)  // Lock acquired, proceed with issuance
        }
    }

    /// Begin immediate transaction (SQLite-specific locking)
    pub async fn begin_immediate_transaction(&self) -> PaymentResult<sqlx::Transaction<'_, sqlx::Sqlite>> {
        // Set busy timeout
        sqlx::query("PRAGMA busy_timeout = 10000")  // 10 seconds
            .execute(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        
        let tx = self.pool.begin().await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        
        Ok(tx)
    }

    // ========================================================================
    // STATE MACHINE (CHECKPOINT 3)
    // ========================================================================

    /// Create issuance in PENDING state (first step of state machine)
    pub async fn create_issuance_pending(
        &self,
        payment_intent_id: &Uuid,
        namespace: &str,
        customer_email: &str,
    ) -> PaymentResult<Uuid> {
        let issuance_id = Uuid::new_v4();
        
        sqlx::query(
            r#"
            INSERT INTO issuances (
                id, payment_intent_id, namespace, 
                certificate_ipfs_cid, certificate_hash_sha3,
                customer_email, issued_at, download_token, 
                download_expires_at, state, retry_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)
            "#,
        )
        .bind(issuance_id.to_string())
        .bind(payment_intent_id.to_string())
        .bind(namespace)
        .bind("")  // Placeholder, will be filled when issued
        .bind("")  // Placeholder
        .bind(customer_email)
        .bind(Utc::now())
        .bind("")  // Placeholder
        .bind(Utc::now())  // Placeholder
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(issuance_id)
    }

    /// Transition issuance state (atomic, enforces valid transitions)
    pub async fn transition_issuance_state(
        &self,
        issuance_id: &Uuid,
        from_state: &str,
        to_state: &str,
    ) -> PaymentResult<bool> {
        let result = sqlx::query(
            r#"
            UPDATE issuances
            SET state = ?
            WHERE id = ? AND state = ?
            "#,
        )
        .bind(to_state)
        .bind(issuance_id.to_string())
        .bind(from_state)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            tracing::warn!(
                "State transition failed: issuance={}, expected={}, target={}",
                issuance_id, from_state, to_state
            );
            Ok(false)  // State transition rejected
        } else {
            tracing::info!(
                "State transition: issuance={}, {} → {}",
                issuance_id, from_state, to_state
            );
            Ok(true)  // Transition succeeded
        }
    }

    /// Finalize issuance (PROCESSING → ISSUED)
    pub async fn finalize_issuance(
        &self,
        issuance_id: &Uuid,
        ipfs_cid: &str,
        certificate_hash: &str,
        download_token: &str,
        download_expires_at: DateTime<Utc>,
    ) -> PaymentResult<()> {
        let result = sqlx::query(
            r#"
            UPDATE issuances
            SET state = 'issued',
                certificate_ipfs_cid = ?,
                certificate_hash_sha3 = ?,
                download_token = ?,
                download_expires_at = ?,
                issued_at = ?
            WHERE id = ? AND state = 'processing'
            "#,
        )
        .bind(ipfs_cid)
        .bind(certificate_hash)
        .bind(download_token)
        .bind(download_expires_at)
        .bind(Utc::now())
        .bind(issuance_id.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(PaymentError::InternalError(
                "Cannot finalize issuance: not in processing state".to_string(),
            ));
        }

        Ok(())
    }

    /// Mark issuance as failed (with retry eligibility)
    pub async fn mark_issuance_failed(
        &self,
        issuance_id: &Uuid,
        error_message: &str,
        from_state: &str,
    ) -> PaymentResult<()> {
        let result = sqlx::query(
            r#"
            UPDATE issuances
            SET state = 'failed',
                last_error = ?,
                retry_count = retry_count + 1,
                next_retry_at = datetime('now', '+' || (retry_count + 1) * 5 || ' minutes')
            WHERE id = ? AND state = ?
            "#,
        )
        .bind(error_message)
        .bind(issuance_id.to_string())
        .bind(from_state)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            tracing::warn!(
                "Cannot mark failed: issuance={}, expected_state={}",
                issuance_id, from_state
            );
        }

        Ok(())
    }

    /// Get issuance by ID
    pub async fn get_issuance_by_id(
        &self,
        issuance_id: &Uuid,
    ) -> PaymentResult<Option<IssuanceRecord>> {
        let row = sqlx::query(
            r#"
            SELECT * FROM issuances WHERE id = ?
            "#,
        )
        .bind(issuance_id.to_string())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(self.row_to_issuance(r)?)),
            None => Ok(None),
        }
    }

    /// Get issuance by payment intent ID
    pub async fn get_issuance_by_payment_intent(
        &self,
        payment_intent_id: &Uuid,
    ) -> PaymentResult<Option<IssuanceRecord>> {
        let row = sqlx::query(
            r#"
            SELECT * FROM issuances WHERE payment_intent_id = ?
            "#,
        )
        .bind(payment_intent_id.to_string())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(self.row_to_issuance(r)?)),
            None => Ok(None),
        }
    }

    // ========================================================================
    // RETRY QUEUE (CHECKPOINT 4)
    // ========================================================================

    /// Get failed issuances eligible for retry
    pub async fn get_failed_issuances_for_retry(
        &self,
    ) -> PaymentResult<Vec<IssuanceRecord>> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM issuances
            WHERE state = 'failed'
              AND retry_count < 5
              AND (next_retry_at IS NULL OR next_retry_at <= datetime('now'))
            ORDER BY next_retry_at ASC
            LIMIT 50
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let mut issuances = Vec::new();
        for row in rows {
            issuances.push(self.row_to_issuance(row)?);
        }

        Ok(issuances)
    }

    /// Get dead-letter issuances (exceeded max retries)
    pub async fn get_dead_letter_issuances(&self) -> PaymentResult<Vec<IssuanceRecord>> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM issuances
            WHERE state = 'failed'
              AND retry_count >= 5
            ORDER BY issued_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let mut issuances = Vec::new();
        for row in rows {
            issuances.push(self.row_to_issuance(row)?);
        }

        Ok(issuances)
    }

    /// Reset issuance to pending state for retry
    pub async fn reset_issuance_to_pending(&self, issuance_id: &Uuid) -> PaymentResult<()> {
        let result = sqlx::query(
            r#"
            UPDATE issuances
            SET state = 'pending',
                next_retry_at = NULL
            WHERE id = ? AND state = 'failed'
            "#,
        )
        .bind(issuance_id.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(PaymentError::InternalError(
                "Cannot reset issuance: not in failed state".to_string(),
            ));
        }

        Ok(())
    }

    /// Move issuance to dead-letter (exceeded max retries)
    pub async fn move_to_dead_letter(&self, issuance_id: &Uuid) -> PaymentResult<()> {
        // Update issuance with dead-letter marker
        sqlx::query(
            r#"
            UPDATE issuances
            SET last_error = 'DEAD-LETTER: Exceeded max retries (5)'
            WHERE id = ? AND state = 'failed' AND retry_count >= 5
            "#,
        )
        .bind(issuance_id.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        tracing::warn!("Moved issuance {} to dead-letter queue", issuance_id);
        Ok(())
    }

    // ========================================================================
    // GENESIS & INVENTORY (CHECKPOINT 4)
    // ========================================================================

    /// Freeze inventory tier (post-Genesis protection)
    pub async fn freeze_inventory_tier(&self, tier: &str) -> PaymentResult<()> {
        sqlx::query(
            r#"
            UPDATE inventory_tiers
            SET frozen_at = datetime('now')
            WHERE tier = ?
            "#,
        )
        .bind(tier)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        tracing::info!("Inventory tier '{}' frozen", tier);
        Ok(())
    }

    /// Get Genesis status
    pub async fn get_genesis_status(&self) -> PaymentResult<GenesisStatus> {
        let row = sqlx::query(
            r#"
            SELECT genesis_completed, genesis_cid, genesis_timestamp
            FROM system_state
            LIMIT 1
            "#,
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => Ok(GenesisStatus {
                completed: r.get::<bool, _>("genesis_completed"),
                genesis_cid: r.get::<Option<String>, _>("genesis_cid"),
                genesis_timestamp: r
                    .get::<Option<String>, _>("genesis_timestamp")
                    .and_then(|s| chrono::DateTime::parse_from_rfc3339(&s).ok())
                    .map(|dt| dt.with_timezone(&Utc)),
            }),
            None => Ok(GenesisStatus {
                completed: false,
                genesis_cid: None,
                genesis_timestamp: None,
            }),
        }
    }

    /// Get inventory status (all tiers)
    pub async fn get_inventory_status(&self) -> PaymentResult<Vec<InventoryTierStatus>> {
        let rows = sqlx::query(
            r#"
            SELECT 
                t.tier,
                t.total_supply,
                t.frozen_at,
                COUNT(r.id) as reserved_count
            FROM inventory_tiers t
            LEFT JOIN inventory_reservations r ON t.tier = r.tier AND r.status = 'reserved'
            GROUP BY t.tier
            ORDER BY t.total_supply ASC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let mut tiers = Vec::new();
        for row in rows {
            tiers.push(InventoryTierStatus {
                tier: row.get("tier"),
                total_supply: row.get::<i64, _>("total_supply") as u32,
                reserved_count: row.get::<i64, _>("reserved_count") as u32,
                frozen_at: row
                    .get::<Option<String>, _>("frozen_at")
                    .and_then(|s| chrono::DateTime::parse_from_rfc3339(&s).ok())
                    .map(|dt| dt.with_timezone(&Utc)),
            });
        }

        Ok(tiers)
    }

    // ========================================================================
    // REFUND & DISPUTE HANDLING (CHECKPOINT 5)
    // ========================================================================

    /// Void issuance (within 24-hour window)
    pub async fn void_issuance(&self, issuance_id: &Uuid) -> PaymentResult<()> {
        let result = sqlx::query(
            r#"
            UPDATE issuances
            SET state = 'voided',
                voided_at = datetime('now')
            WHERE id = ? AND state = 'issued' AND voided_at IS NULL
            "#,
        )
        .bind(issuance_id.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(PaymentError::InternalError(
                "Cannot void issuance: not in issued state or already voided".to_string(),
            ));
        }

        tracing::info!("Issuance voided: id={}", issuance_id);
        Ok(())
    }

    /// Mark issuance as disputed (after 24-hour window)
    pub async fn mark_issuance_disputed(
        &self,
        issuance_id: &Uuid,
        charge_id: &str,
        refund_amount: u64,
    ) -> PaymentResult<()> {
        sqlx::query(
            r#"
            UPDATE issuances
            SET disputed = TRUE,
                last_error = ?
            WHERE id = ?
            "#,
        )
        .bind(format!(
            "DISPUTED: Refund after 24h window (charge={}, amount={})",
            charge_id, refund_amount
        ))
        .bind(issuance_id.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        tracing::warn!("Issuance marked as disputed: id={}", issuance_id);
        Ok(())
    }

    /// Get issuance voided_at timestamp
    pub async fn get_issuance_voided_at(
        &self,
        issuance_id: &Uuid,
    ) -> PaymentResult<Option<DateTime<Utc>>> {
        let row = sqlx::query(
            r#"
            SELECT voided_at FROM issuances WHERE id = ?
            "#,
        )
        .bind(issuance_id.to_string())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => Ok(r.get("voided_at")),
            None => Ok(None),
        }
    }

    /// Check if issuance is disputed
    pub async fn is_issuance_disputed(&self, issuance_id: &Uuid) -> PaymentResult<bool> {
        let row = sqlx::query(
            r#"
            SELECT disputed FROM issuances WHERE id = ?
            "#,
        )
        .bind(issuance_id.to_string())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => Ok(r.get::<bool, _>("disputed")),
            None => Ok(false),
        }
    }

    /// Get disputed issuances (for admin review)
    pub async fn get_disputed_issuances(&self) -> PaymentResult<Vec<IssuanceRecord>> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM issuances
            WHERE disputed = TRUE
            ORDER BY issued_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let mut issuances = Vec::new();
        for row in rows {
            issuances.push(self.row_to_issuance(row)?);
        }

        Ok(issuances)
    }

    // =========== GENESIS OPERATIONS (CHECKPOINT 6) ===========

    /// Mark Genesis ceremony as completed
    pub async fn mark_genesis_completed(
        &self,
        genesis_cid: &str,
        genesis_hash: &str,
    ) -> PaymentResult<()> {
        sqlx::query(
            r#"
            UPDATE system_state
            SET genesis_completed = TRUE,
                genesis_cid = ?,
                genesis_timestamp = CURRENT_TIMESTAMP,
                genesis_hash = ?
            WHERE id = 1
            "#,
        )
        .bind(genesis_cid)
        .bind(genesis_hash)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Get all issued certificates (for Genesis snapshot)
    pub async fn get_all_issued_certificates(&self) -> PaymentResult<Vec<IssuanceRecord>> {
        let rows = sqlx::query(
            r#"
            SELECT * FROM issuances
            WHERE state = 'issued'
            ORDER BY issued_at ASC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let mut issuances = Vec::new();
        for row in rows {
            issuances.push(self.row_to_issuance(row)?);
        }

        Ok(issuances)
    }

    /// Count voided certificates
    pub async fn count_voided_certificates(&self) -> PaymentResult<usize> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM issuances WHERE state = 'voided'")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(row.get::<i64, _>("count") as usize)
    }

    /// Count disputed certificates
    pub async fn count_disputed_certificates(&self) -> PaymentResult<usize> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM issuances WHERE state = 'voided' AND disputed = TRUE")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(row.get::<i64, _>("count") as usize)
    }

    /// List issued namespaces for Explore page
    pub async fn list_issued_namespaces(
        &self,
        tier_filter: Option<&str>,
        limit: i64,
        offset: i64,
    ) -> PaymentResult<Vec<NamespaceListing>> {
        let query = if let Some(tier) = tier_filter {
            sqlx::query(
                r#"
                SELECT 
                    i.namespace,
                    p.rarity_tier as tier,
                    p.amount_cents,
                    i.certificate_ipfs_cid,
                    i.issued_at
                FROM issuances i
                INNER JOIN payment_intents p ON i.payment_intent_id = p.id
                WHERE i.state = 'issued' AND p.rarity_tier = ?
                ORDER BY i.issued_at DESC
                LIMIT ? OFFSET ?
                "#,
            )
            .bind(tier)
            .bind(limit)
            .bind(offset)
        } else {
            sqlx::query(
                r#"
                SELECT 
                    i.namespace,
                    p.rarity_tier as tier,
                    p.amount_cents,
                    i.certificate_ipfs_cid,
                    i.issued_at
                FROM issuances i
                INNER JOIN payment_intents p ON i.payment_intent_id = p.id
                WHERE i.state = 'issued'
                ORDER BY i.issued_at DESC
                LIMIT ? OFFSET ?
                "#,
            )
            .bind(limit)
            .bind(offset)
        };

        let rows = query
            .fetch_all(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        let mut listings = Vec::new();
        for row in rows {
            let namespace: String = row.get("namespace");
            let tier: String = row.get("tier");
            let rarity_score = calculate_rarity_score(&namespace, &tier);
            
            listings.push(NamespaceListing {
                namespace,
                tier,
                rarity_score,
                amount_cents: row.get::<i64, _>("amount_cents"),
                certificate_ipfs_cid: row.get("certificate_ipfs_cid"),
                issued_at: row.get("issued_at"),
            });
        }

        Ok(listings)
    }
}

#[derive(Debug, serde::Serialize)]
pub struct NamespaceListing {
    pub namespace: String,
    pub tier: String,
    pub rarity_score: i32,
    pub amount_cents: i64,
    pub certificate_ipfs_cid: String,
    pub issued_at: DateTime<Utc>,
}

/// Calculate rarity score based on namespace and tier
fn calculate_rarity_score(namespace: &str, tier: &str) -> i32 {
    let tier_base = match tier {
        "mythic" => 9000,
        "legendary" => 8000,
        "epic" => 7000,
        "rare" => 6000,
        "uncommon" => 5000,
        "common" => 4000,
        _ => 3000,
    };

    // Add bonus for short namespaces
    let length_bonus = match namespace.len() {
        1..=2 => 1000,
        3..=4 => 500,
        5..=6 => 200,
        _ => 0,
    };

    // Add bonus for numeric patterns
    let numeric_bonus = if namespace.chars().all(|c| c.is_numeric()) {
        300
    } else {
        0
    };

    tier_base + length_bonus + numeric_bonus
}
