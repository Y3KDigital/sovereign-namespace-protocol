use stripe::{
    Client, CreatePaymentIntent, Currency, PaymentIntent as StripePaymentIntent,
    PaymentIntentStatus,
};
use uuid::Uuid;
use chrono::Utc;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use hex;

use crate::types::{
    CreatePaymentRequest, CreatePaymentResponse, PaymentIntent, PaymentStatus, RarityTier,
};
use crate::errors::{PaymentError, PaymentResult};
use crate::database::Database;
use crate::inventory::InventoryManager;

type HmacSha256 = Hmac<Sha256>;

#[derive(Clone)]
pub struct StripeService {
    client: Client,
    webhook_secret: String,
}

impl StripeService {
    pub fn new(api_key: String, webhook_secret: String) -> Self {
        let client = Client::new(api_key);
        Self {
            client,
            webhook_secret,
        }
    }

    /// Create Stripe PaymentIntent and reserve namespace
    pub async fn create_payment_intent(
        &self,
        request: CreatePaymentRequest,
        db: &Database,
        inventory: &InventoryManager,
    ) -> PaymentResult<CreatePaymentResponse> {
        // Parse rarity tier
        let tier = match request.rarity_tier.to_lowercase().as_str() {
            "mythic" => RarityTier::Mythic,
            "legendary" => RarityTier::Legendary,
            "epic" => RarityTier::Epic,
            "rare" => RarityTier::Rare,
            "uncommon" => RarityTier::Uncommon,
            "common" => RarityTier::Common,
            _ => {
                return Err(PaymentError::InvalidRarityTier(
                    request.rarity_tier.clone(),
                ))
            }
        };

        let amount_cents = tier.base_price_cents();

        // Check inventory availability before creating payment intent
        let available = if let Some(ref partner_id) = request.partner_id {
            inventory.check_partner_availability(partner_id, tier.as_str()).await?
        } else {
            inventory.check_availability(tier.as_str()).await?
        };

        if !available {
            return Err(PaymentError::InventoryExhausted(tier.as_str().to_string()));
        }

        // Create Stripe PaymentIntent
        let mut params = CreatePaymentIntent::new(amount_cents as i64, Currency::USD);
        params.receipt_email = Some(&request.customer_email);
        params.metadata = Some(
            vec![
                ("rarity_tier".to_string(), tier.as_str().to_string()),
                ("partner_id".to_string(), request.partner_id.clone().unwrap_or_default()),
                ("affiliate_id".to_string(), request.affiliate_id.clone().unwrap_or_default()),
            ]
            .into_iter()
            .collect(),
        );

        let stripe_intent = StripePaymentIntent::create(&self.client, params)
            .await
            .map_err(|e| PaymentError::StripeError(e.to_string()))?;

        // Create local payment intent record
        let payment_intent = PaymentIntent {
            id: Uuid::new_v4(),
            stripe_payment_intent_id: stripe_intent.id.to_string(),
            amount_cents,
            currency: "usd".to_string(),
            customer_email: request.customer_email.clone(),
            namespace_reserved: None, // Reserved after payment confirmed
            rarity_tier: tier.as_str().to_string(),
            status: PaymentStatus::Created,
            created_at: Utc::now(),
            settled_at: None,
            partner_id: request.partner_id.clone(),
            affiliate_id: request.affiliate_id.clone(),
        };

        db.create_payment_intent(&payment_intent).await?;

        // Reserve inventory (atomic transaction)
        inventory.reserve_inventory(
            &payment_intent.id,
            tier.as_str(),
            request.partner_id.as_deref(),
        ).await?;

        Ok(CreatePaymentResponse {
            payment_intent_id: stripe_intent.id.to_string(),
            client_secret: stripe_intent
                .client_secret
                .ok_or_else(|| PaymentError::StripeError("Missing client_secret".to_string()))?,
            amount_cents,
            currency: "usd".to_string(),
            namespace_reserved: None,
        })
    }

    /// Verify Stripe webhook signature
    pub fn verify_webhook_signature(
        &self,
        payload: &str,
        signature: &str,
    ) -> PaymentResult<()> {
        // Extract timestamp and signature from header
        let parts: Vec<&str> = signature.split(',').collect();
        let mut timestamp = "";
        let mut v1_signature = "";

        for part in parts {
            if let Some(value) = part.strip_prefix("t=") {
                timestamp = value;
            } else if let Some(value) = part.strip_prefix("v1=") {
                v1_signature = value;
            }
        }

        if timestamp.is_empty() || v1_signature.is_empty() {
            return Err(PaymentError::InvalidWebhookSignature);
        }

        // Construct signed payload
        let signed_payload = format!("{}.{}", timestamp, payload);

        // Compute expected signature
        let mut mac = HmacSha256::new_from_slice(self.webhook_secret.as_bytes())
            .map_err(|_| PaymentError::InvalidWebhookSignature)?;
        mac.update(signed_payload.as_bytes());
        let expected_signature = hex::encode(mac.finalize().into_bytes());

        // Compare signatures
        if expected_signature != v1_signature {
            return Err(PaymentError::InvalidWebhookSignature);
        }

        Ok(())
    }

    /// Handle payment succeeded event
    pub async fn handle_payment_succeeded(
        &self,
        stripe_payment_intent_id: &str,
        db: &Database,
    ) -> PaymentResult<()> {
        // Update payment status
        db.update_payment_status(stripe_payment_intent_id, PaymentStatus::Succeeded)
            .await?;

        tracing::info!(
            "Payment succeeded: {}",
            stripe_payment_intent_id
        );

        Ok(())
    }

    /// Handle payment failed event
    pub async fn handle_payment_failed(
        &self,
        stripe_payment_intent_id: &str,
        db: &Database,
    ) -> PaymentResult<()> {
        db.update_payment_status(stripe_payment_intent_id, PaymentStatus::Failed)
            .await?;

        tracing::warn!(
            "Payment failed: {}",
            stripe_payment_intent_id
        );

        Ok(())
    }
}
