use sqlx::{SqlitePool, Row};
use uuid::Uuid;
use chrono::Utc;
use crate::errors::{PaymentError, PaymentResult};

#[derive(Debug, Clone)]
pub struct InventoryTier {
    pub tier: String,
    pub genesis_supply: i64,
    pub presell_cap: i64,
    pub presold_count: i64,
}

#[derive(Debug, Clone)]
pub enum ReservationStatus {
    Reserved,
    Released,
    Fulfilled,
}

impl ReservationStatus {
    pub fn as_str(&self) -> &str {
        match self {
            ReservationStatus::Reserved => "reserved",
            ReservationStatus::Released => "released",
            ReservationStatus::Fulfilled => "fulfilled",
        }
    }
}

#[derive(Clone)]
pub struct InventoryManager {
    pool: SqlitePool,
}

impl InventoryManager {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    /// Check if tier has available inventory
    pub async fn check_availability(&self, tier: &str) -> PaymentResult<bool> {
        let row = sqlx::query(
            "SELECT presell_cap, presold_count FROM inventory_tiers WHERE tier = ?"
        )
        .bind(tier)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => {
                let presell_cap: i64 = r.get("presell_cap");
                let presold_count: i64 = r.get("presold_count");
                Ok(presold_count < presell_cap)
            }
            None => Err(PaymentError::InvalidRarityTier(tier.to_string())),
        }
    }

    /// Check partner-specific inventory (if partner_id provided)
    pub async fn check_partner_availability(
        &self,
        partner_id: &str,
        tier: &str,
    ) -> PaymentResult<bool> {
        let row = sqlx::query(
            "SELECT allocation, sold FROM partner_inventory WHERE partner_id = ? AND tier = ?"
        )
        .bind(partner_id)
        .bind(tier)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some(r) => {
                let allocation: i64 = r.get("allocation");
                let sold: i64 = r.get("sold");
                Ok(sold < allocation)
            }
            None => {
                // Partner has no specific allocation, check global inventory
                self.check_availability(tier).await
            }
        }
    }

    /// Reserve inventory for payment intent (atomic transaction)
    pub async fn reserve_inventory(
        &self,
        payment_intent_id: &Uuid,
        tier: &str,
        partner_id: Option<&str>,
    ) -> PaymentResult<()> {
        // Begin transaction
        let mut tx = self.pool.begin()
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        // Check global availability
        let available = sqlx::query(
            "SELECT presell_cap, presold_count FROM inventory_tiers WHERE tier = ?"
        )
        .bind(tier)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?
        .ok_or_else(|| PaymentError::InvalidRarityTier(tier.to_string()))?;

        let presell_cap: i64 = available.get("presell_cap");
        let presold_count: i64 = available.get("presold_count");

        if presold_count >= presell_cap {
            return Err(PaymentError::InventoryExhausted(tier.to_string()));
        }

        // Check partner-specific availability (if applicable)
        if let Some(pid) = partner_id {
            let partner_row = sqlx::query(
                "SELECT allocation, sold FROM partner_inventory WHERE partner_id = ? AND tier = ?"
            )
            .bind(pid)
            .bind(tier)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

            if let Some(partner) = partner_row {
                let allocation: i64 = partner.get("allocation");
                let sold: i64 = partner.get("sold");
                if sold >= allocation {
                    return Err(PaymentError::InventoryExhausted(format!(
                        "Partner {} has no remaining {} inventory",
                        pid, tier
                    )));
                }
            }
        }

        // Create reservation
        let reservation_id = Uuid::new_v4().to_string();
        let payment_intent_id_str = payment_intent_id.to_string();
        let now = Utc::now();
        let status = ReservationStatus::Reserved.as_str();

        sqlx::query(
            "INSERT INTO inventory_reservations (id, payment_intent_id, tier, reserved_at, status) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(&reservation_id)
        .bind(&payment_intent_id_str)
        .bind(tier)
        .bind(now)
        .bind(status)
        .execute(&mut *tx)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        // Increment presold_count
        sqlx::query(
            "UPDATE inventory_tiers SET presold_count = presold_count + 1 WHERE tier = ?"
        )
        .bind(tier)
        .execute(&mut *tx)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        // Increment partner sold count (if applicable)
        if let Some(pid) = partner_id {
            // Check if partner inventory record exists
            let exists = sqlx::query(
                "SELECT id FROM partner_inventory WHERE partner_id = ? AND tier = ?"
            )
            .bind(pid)
            .bind(tier)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

            if exists.is_some() {
                sqlx::query(
                    "UPDATE partner_inventory SET sold = sold + 1 WHERE partner_id = ? AND tier = ?"
                )
                .bind(pid)
                .bind(tier)
                .execute(&mut *tx)
                .await
                .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
            }
        }

        // Commit transaction
        tx.commit()
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        tracing::info!(
            "Reserved {} inventory for payment intent {}",
            tier,
            payment_intent_id
        );

        Ok(())
    }

    /// Release reservation (payment failed or expired)
    pub async fn release_reservation(&self, payment_intent_id: &Uuid) -> PaymentResult<()> {
        let mut tx = self.pool.begin()
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        // Get reservation details
        let payment_intent_id_str = payment_intent_id.to_string();
        let reservation = sqlx::query(
            "SELECT tier, status FROM inventory_reservations WHERE payment_intent_id = ?"
        )
        .bind(&payment_intent_id_str)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        if let Some(res) = reservation {
            let status: String = res.get("status");
            if status == "reserved" {
                let tier: String = res.get("tier");
                
                // Update reservation status
                let now = Utc::now();
                let released_status = ReservationStatus::Released.as_str();
                
                sqlx::query(
                    "UPDATE inventory_reservations SET status = ?, released_at = ? WHERE payment_intent_id = ?"
                )
                .bind(released_status)
                .bind(now)
                .bind(&payment_intent_id_str)
                .execute(&mut *tx)
                .await
                .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

                // Decrement presold_count
                sqlx::query(
                    "UPDATE inventory_tiers SET presold_count = presold_count - 1 WHERE tier = ?"
                )
                .bind(&tier)
                .execute(&mut *tx)
                .await
                .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

                tracing::info!(
                    "Released {} inventory for payment intent {}",
                    tier,
                    payment_intent_id
                );
            }
        }

        tx.commit()
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Mark reservation as fulfilled (post-genesis)
    pub async fn fulfill_reservation(&self, payment_intent_id: &Uuid) -> PaymentResult<()> {
        let payment_intent_id_str = payment_intent_id.to_string();
        let fulfilled_status = ReservationStatus::Fulfilled.as_str();

        sqlx::query(
            "UPDATE inventory_reservations SET status = ? WHERE payment_intent_id = ?"
        )
        .bind(fulfilled_status)
        .bind(&payment_intent_id_str)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Get current inventory status for all tiers
    pub async fn get_inventory_status(&self) -> PaymentResult<Vec<InventoryTier>> {
        let rows = sqlx::query(
            r#"
            SELECT tier, genesis_supply, presell_cap, presold_count 
            FROM inventory_tiers 
            ORDER BY 
                CASE tier
                    WHEN 'mythic' THEN 1
                    WHEN 'legendary' THEN 2
                    WHEN 'epic' THEN 3
                    WHEN 'rare' THEN 4
                    WHEN 'uncommon' THEN 5
                    WHEN 'common' THEN 6
                END
            "#
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(rows
            .into_iter()
            .map(|r| InventoryTier {
                tier: r.get("tier"),
                genesis_supply: r.get("genesis_supply"),
                presell_cap: r.get("presell_cap"),
                presold_count: r.get("presold_count"),
            })
            .collect())
    }

    /// Get remaining inventory for a tier
    pub async fn get_remaining(&self, tier: &str) -> PaymentResult<i64> {
        let row = sqlx::query(
            "SELECT presell_cap, presold_count FROM inventory_tiers WHERE tier = ?"
        )
        .bind(tier)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?
        .ok_or_else(|| PaymentError::InvalidRarityTier(tier.to_string()))?;

        let presell_cap: i64 = row.get("presell_cap");
        let presold_count: i64 = row.get("presold_count");

        Ok(presell_cap - presold_count)
    }
}
