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
    /// Optional NIL label (CityNIL / MascotNIL) attached at purchase time.
    pub nil_name: Option<String>,
    pub nil_role: Option<NilRole>,
    pub nil_pair_key: Option<String>,
    pub rarity_tier: String,
    pub status: PaymentStatus,
    pub created_at: DateTime<Utc>,
    pub settled_at: Option<DateTime<Utc>>,
    pub partner_id: Option<String>,
    pub affiliate_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum NilRole {
    City,
    Mascot,
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
    pub nil_name: Option<String>,
    pub nil_role: Option<NilRole>,
    pub nil_pair_key: Option<String>,
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
    /// Optional user-chosen namespace to reserve before payment settles.
    /// If omitted, the system will generate one at issuance time.
    pub namespace: Option<String>,
    /// Optional NIL label to attach to this mint, e.g. "GlendaleNIL" or "HurricaneNIL".
    pub nil_name: Option<String>,
    /// Required if `nil_name` is provided.
    pub nil_role: Option<NilRole>,
    /// Optional stable key to group CityNIL + MascotNIL as one market.
    /// If omitted (and `nil_name` present), the server will derive it.
    pub nil_pair_key: Option<String>,
    pub rarity_tier: String,
    pub partner_id: Option<String>,
    pub affiliate_id: Option<String>,
}

/// API response: Payment intent created
#[derive(Debug, Serialize)]
pub struct CreatePaymentResponse {
    /// Local order identifier (UUID) used by GET /api/orders/{order_id}.
    ///
    /// NOTE: This is NOT the Stripe payment intent id.
    pub order_id: String,
    pub payment_intent_id: String,
    pub client_secret: String,
    pub amount_cents: u64,
    pub currency: String,
    pub namespace_reserved: Option<String>,
    pub nil_name: Option<String>,
    pub nil_role: Option<NilRole>,
    pub nil_pair_key: Option<String>,
}

/// API response: Order details
#[derive(Debug, Serialize)]
pub struct OrderResponse {
    pub order_id: String,
    pub status: PaymentStatus,
    pub namespace: Option<String>,
    pub nil_name: Option<String>,
    pub nil_role: Option<NilRole>,
    pub nil_pair_key: Option<String>,
    pub certificate_ipfs_cid: Option<String>,
    pub download_url: Option<String>,
    pub amount_paid_cents: u64,
    pub created_at: DateTime<Utc>,
}

/// Signed "funding truth" receipt for an order.
///
/// Notes:
/// - This is a *receipt* and audit artifact, not a blockchain settlement.
/// - Signature covers `payload_json` bytes (canonical JSON derived from this struct).
#[derive(Debug, Serialize)]
pub struct FundingProofResponse {
    pub order_id: String,
    pub stripe_payment_intent_id: String,
    pub currency: String,
    pub amount_cents: u64,

    pub affiliate_earned_cents: u64,
    pub treasury_cents: u64,

    pub created_at: DateTime<Utc>,
    pub settled_at: Option<DateTime<Utc>>,

    pub partner_id: Option<String>,
    pub affiliate_id: Option<String>,

    /// base64 encoded Ed25519 public key (32 bytes)
    pub signing_public_key_b64: Option<String>,
    /// base64 encoded Ed25519 signature (64 bytes)
    pub signature_b64: Option<String>,

    /// Canonical JSON payload that was signed. Provided for easy verification.
    pub payload_json: Option<String>,
}

/// Non-secret diagnostics about Stripe configuration.
///
/// This is safe to expose publicly (no secret material).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StripeConfigDiagnostics {
    /// Whether an API key environment variable was present (even if rejected).
    pub api_key_present: bool,
    /// Whether the API key was accepted after validation/placeholder checks.
    pub api_key_accepted: bool,
    /// Which environment variable provided the API key (if any).
    pub api_key_source: Option<String>,
    /// Reason the API key was rejected (if present but not accepted).
    pub api_key_rejected_reason: Option<String>,

    /// Whether a webhook secret environment variable was present (even if rejected).
    pub webhook_secret_present: bool,
    /// Whether the webhook secret was accepted after validation/placeholder checks.
    pub webhook_secret_accepted: bool,
    /// Reason the webhook secret was rejected (if present but not accepted).
    pub webhook_secret_rejected_reason: Option<String>,

    /// Whether the server is configured to hard-fail if Stripe is not configured.
    pub require_stripe: bool,
}

// ============================================================================
// Agent provisioning + interface bindings (Y3K "AI identity" runtime)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentRecord {
    pub id: String,
    pub namespace: String,
    pub status: String,
    pub profile: String,
    pub ai_provider: Option<String>,
    pub ai_model: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterfaceBinding {
    pub id: String,
    pub namespace: String,
    pub binding_type: String,
    pub provider: String,
    pub address: String,
    pub status: String,
    pub metadata_json: Option<String>,
    pub created_at: DateTime<Utc>,
    pub released_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct BindPhoneRequest {
    /// E.164 phone number, e.g. "+14155551212"
    pub phone_number: String,
    /// Provider slug: "twilio" | "telnyx" | "internal"
    pub provider: Option<String>,
    /// Optional freeform metadata (SID, telnyx id, etc.)
    pub metadata_json: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct BindPhoneResponse {
    pub agent: AgentRecord,
    pub binding: InterfaceBinding,
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
