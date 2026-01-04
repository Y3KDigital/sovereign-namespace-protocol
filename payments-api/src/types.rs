use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Namespace tier pricing and rarity thresholds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RarityTier {
    Mythic,      // 0.1% - $5,000-10,000
    Legendary,   // 0.5% - $2,000-5,000
    Epic,        // 2%   - $500-2,000
    Rare,        // 7%   - $200-500
    Uncommon,    // 20%  - $50-200
    Common,      // 70%  - $20-50
}

impl RarityTier {
    /// Base price in cents (USD)
    pub fn base_price_cents(&self) -> u64 {
        match self {
            RarityTier::Mythic => 750_000,     // $7,500
            RarityTier::Legendary => 350_000,  // $3,500
            RarityTier::Epic => 125_000,       // $1,250
            RarityTier::Rare => 35_000,        // $350
            RarityTier::Uncommon => 12_500,    // $125
            RarityTier::Common => 3_500,       // $35
        }
    }

    /// Parse from rarity score (0-1000)
    pub fn from_score(score: u32) -> Self {
        match score {
            900..=1000 => RarityTier::Mythic,
            800..=899 => RarityTier::Legendary,
            600..=799 => RarityTier::Epic,
            400..=599 => RarityTier::Rare,
            200..=399 => RarityTier::Uncommon,
            0..=199 => RarityTier::Common,
            _ => RarityTier::Common,
        }
    }

    pub fn as_str(&self) -> &str {
        match self {
            RarityTier::Mythic => "mythic",
            RarityTier::Legendary => "legendary",
            RarityTier::Epic => "epic",
            RarityTier::Rare => "rare",
            RarityTier::Uncommon => "uncommon",
            RarityTier::Common => "common",
        }
    }
}

/// Payment intent record (pre-settlement)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentIntent {
    pub id: Uuid,
    pub stripe_payment_intent_id: String,
    pub amount_cents: u64,
    pub currency: String,
    pub customer_email: String,
    pub namespace_reserved: Option<String>,
    pub rarity_tier: String,
    pub status: PaymentStatus,
    pub created_at: DateTime<Utc>,
    pub settled_at: Option<DateTime<Utc>>,
    pub partner_id: Option<String>,
    pub affiliate_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum PaymentStatus {
    Created,          // Stripe PaymentIntent created
    Reserved,         // Namespace reserved
    Processing,       // Payment processing
    Succeeded,        // Payment successful, certificate issuing
    Delivered,        // Certificate delivered to customer
    Failed,           // Payment failed
    Canceled,         // Payment canceled
    Refunded,         // Payment refunded
}

/// Certificate issuance record (post-settlement)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssuanceRecord {
    pub id: Uuid,
    pub payment_intent_id: Uuid,
    pub namespace: String,
    pub tier: String,
    pub certificate_ipfs_cid: String,
    pub certificate_hash_sha3: String,
    pub customer_email: String,
    pub issued_at: DateTime<Utc>,
    pub download_token: String,
    pub download_expires_at: DateTime<Utc>,
    pub retry_count: u32,
    pub last_error: Option<String>,
}

/// Order record (complete transaction view)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub id: Uuid,
    pub payment_intent: PaymentIntent,
    pub issuance: Option<IssuanceRecord>,
    pub partner_commission_cents: Option<u64>,
    pub affiliate_commission_cents: Option<u64>,
}

/// Stripe webhook event
#[derive(Debug, Deserialize)]
pub struct StripeWebhookEvent {
    pub id: String,
    pub r#type: String,
    pub data: serde_json::Value,
    pub created: i64,
}

/// API request: Create payment intent
#[derive(Debug, Deserialize)]
pub struct CreatePaymentRequest {
    pub customer_email: String,
    pub rarity_tier: String,
    pub partner_id: Option<String>,
    pub affiliate_id: Option<String>,
}

/// API response: Payment intent created
#[derive(Debug, Serialize)]
pub struct CreatePaymentResponse {
    pub payment_intent_id: String,
    pub client_secret: String,
    pub amount_cents: u64,
    pub currency: String,
    pub namespace_reserved: Option<String>,
}

/// API response: Order details
#[derive(Debug, Serialize)]
pub struct OrderResponse {
    pub order_id: String,
    pub status: PaymentStatus,
    pub namespace: Option<String>,
    pub certificate_ipfs_cid: Option<String>,
    pub download_url: Option<String>,
    pub amount_paid_cents: u64,
    pub created_at: DateTime<Utc>,
}

/// Genesis status (CHECKPOINT 4)
#[derive(Debug, Clone, Serialize)]
pub struct GenesisStatus {
    pub completed: bool,
    pub genesis_cid: Option<String>,
    pub genesis_timestamp: Option<DateTime<Utc>>,
}

/// Inventory tier status (CHECKPOINT 4)
#[derive(Debug, Clone, Serialize)]
pub struct InventoryTierStatus {
    pub tier: String,
    pub total_supply: u32,
    pub reserved_count: u32,
    pub frozen_at: Option<DateTime<Utc>>,
}

// ============================================================================
// Affiliate / broker program (CRM-lite + commission ledger)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Affiliate {
    pub id: String,
    pub display_name: String,
    pub email: String,
    pub portal_token: String,
    pub referral_code: String,
    pub commission_bps: u32,
    pub bonus_cents: u64,
    pub active: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAffiliateRequest {
    pub display_name: String,
    pub email: String,
    pub commission_bps: Option<u32>,
    pub bonus_cents: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct CreateAffiliateResponse {
    pub affiliate: Affiliate,
    pub portal_url: String,
    pub referral_url: String,
}

#[derive(Debug, Serialize)]
pub struct AffiliatePortalStats {
    pub leads_count: u64,
    pub conversions_count: u64,
    pub gross_revenue_cents: u64,
    pub earned_cents: u64,
    pub paid_cents: u64,
    pub voided_cents: u64,
}

#[derive(Debug, Serialize)]
pub struct AffiliatePortalResponse {
    pub affiliate: Affiliate,
    pub referral_url: String,
    pub stats: AffiliatePortalStats,
}

#[derive(Debug, Deserialize)]
pub struct CreateLeadRequest {
    pub referral_code: String,
    pub lead_email: String,
    pub lead_name: Option<String>,
    pub note: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CreateLeadResponse {
    pub id: String,
    pub affiliate_id: String,
    pub referral_code: String,
    pub lead_email: String,
    pub lead_name: Option<String>,
    pub note: Option<String>,
    pub created_at: DateTime<Utc>,
}
