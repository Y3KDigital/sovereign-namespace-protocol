use stripe::{
    Client, CreatePaymentIntent, Currency, PaymentIntent as StripePaymentIntent,
};
use uuid::Uuid;
use chrono::Utc;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use hex;

use crate::types::{
    CreatePaymentRequest, CreatePaymentResponse, NilRole, PaymentIntent, PaymentStatus, RarityTier,
};
use crate::errors::{PaymentError, PaymentResult};
use crate::database::Database;
use crate::inventory::InventoryManager;

type HmacSha256 = Hmac<Sha256>;

fn normalize_namespace(input: &str) -> PaymentResult<String> {
    let ns = input.trim().to_ascii_lowercase();
    if ns.is_empty() {
        return Err(PaymentError::ValidationError("namespace is required".to_string()));
    }
    if ns.len() > 96 {
        return Err(PaymentError::ValidationError(
            "namespace is too long".to_string(),
        ));
    }
    if !ns.ends_with(".x") {
        return Err(PaymentError::ValidationError(
            "namespace must end with '.x'".to_string(),
        ));
    }
    if ns.starts_with('.') || ns.starts_with('-') || ns.ends_with('.') || ns.ends_with('-') {
        return Err(PaymentError::ValidationError(
            "namespace cannot start or end with '.' or '-'".to_string(),
        ));
    }
    if ns.contains("..") {
        return Err(PaymentError::ValidationError(
            "namespace cannot contain consecutive dots".to_string(),
        ));
    }
    if !ns
        .chars()
        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '.' || c == '-')
    {
        return Err(PaymentError::ValidationError(
            "namespace may only contain a-z, 0-9, '.', and '-'".to_string(),
        ));
    }
    Ok(ns)
}

fn normalize_nil_name(input: &str) -> PaymentResult<String> {
    let s = input.trim();
    if s.is_empty() {
        return Err(PaymentError::ValidationError("nil_name is required".to_string()));
    }
    // Locked pattern: must end with NIL exactly, case-sensitive.
    if !s.ends_with("NIL") {
        return Err(PaymentError::ValidationError(
            "nil_name must end with 'NIL'".to_string(),
        ));
    }
    if s.len() < 4 || s.len() > 64 {
        return Err(PaymentError::ValidationError(
            "nil_name length must be 4..64".to_string(),
        ));
    }
    if !s.chars().all(|c| c.is_ascii_alphabetic()) {
        return Err(PaymentError::ValidationError(
            "nil_name may only contain ASCII letters A-Z and a-z".to_string(),
        ));
    }
    let first = s.chars().next().unwrap_or(' ');
    if !first.is_ascii_uppercase() {
        return Err(PaymentError::ValidationError(
            "nil_name must start with an uppercase letter".to_string(),
        ));
    }
    Ok(s.to_string())
}

fn normalize_nil_pair_key(input: &str) -> PaymentResult<String> {
    let s = input.trim().to_ascii_lowercase();
    if s.is_empty() {
        return Err(PaymentError::ValidationError(
            "nil_pair_key cannot be empty".to_string(),
        ));
    }
    if s.len() > 64 {
        return Err(PaymentError::ValidationError(
            "nil_pair_key is too long".to_string(),
        ));
    }
    if !s.chars().all(|c| c.is_ascii_lowercase()) {
        return Err(PaymentError::ValidationError(
            "nil_pair_key may only contain a-z".to_string(),
        ));
    }
    Ok(s)
}

fn derive_nil_pair_key_from_name(nil_name: &str) -> PaymentResult<String> {
    // nil_name is validated to be ASCII letters and ends with NIL.
    let base = nil_name
        .strip_suffix("NIL")
        .ok_or_else(|| PaymentError::ValidationError("nil_name must end with 'NIL'".to_string()))?;
    normalize_nil_pair_key(base)
}

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

        // Optional NIL label wiring (CityNIL / MascotNIL)
        let (nil_name, nil_role, nil_pair_key) = match request.nil_name.as_deref() {
            Some(raw_name) => {
                let name = normalize_nil_name(raw_name)?;
                let role = request.nil_role.clone().ok_or_else(|| {
                    PaymentError::ValidationError("nil_role is required when nil_name is set".to_string())
                })?;

                let pair_key = match request.nil_pair_key.as_deref() {
                    Some(k) => normalize_nil_pair_key(k)?,
                    None => derive_nil_pair_key_from_name(&name)?,
                };

                (Some(name), Some(role), Some(pair_key))
            }
            None => {
                // If nil_name isn't set, reject stray nil fields (avoids partial/ambiguous records).
                if request.nil_role.is_some() || request.nil_pair_key.is_some() {
                    return Err(PaymentError::ValidationError(
                        "nil_role/nil_pair_key require nil_name".to_string(),
                    ));
                }
                (None, None, None)
            }
        };

        // Optional namespace reservation (user-chosen namespace must be checked BEFORE payment)
        let namespace_reserved = match request.namespace.as_deref() {
            Some(raw) => {
                let ns = normalize_namespace(raw)?;
                let taken = db.is_namespace_taken_or_reserved(&ns).await?;
                if taken {
                    return Err(PaymentError::ValidationError(
                        "namespace is not available".to_string(),
                    ));
                }
                Some(ns)
            }
            None => None,
        };

        // Create Stripe PaymentIntent
        let mut params = CreatePaymentIntent::new(amount_cents as i64, Currency::USD);
        params.receipt_email = Some(&request.customer_email);
        params.metadata = Some(
            vec![
                ("rarity_tier".to_string(), tier.as_str().to_string()),
                (
                    "namespace_reserved".to_string(),
                    namespace_reserved.clone().unwrap_or_default(),
                ),
                ("nil_name".to_string(), nil_name.clone().unwrap_or_default()),
                (
                    "nil_role".to_string(),
                    match nil_role {
                        Some(NilRole::City) => "city".to_string(),
                        Some(NilRole::Mascot) => "mascot".to_string(),
                        None => "".to_string(),
                    },
                ),
                ("nil_pair_key".to_string(), nil_pair_key.clone().unwrap_or_default()),
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
            namespace_reserved: namespace_reserved.clone(),
            nil_name: nil_name.clone(),
            nil_role: nil_role.clone(),
            nil_pair_key: nil_pair_key.clone(),
            rarity_tier: tier.as_str().to_string(),
            status: if namespace_reserved.is_some() {
                PaymentStatus::Reserved
            } else {
                PaymentStatus::Created
            },
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
            order_id: payment_intent.id.to_string(),
            payment_intent_id: stripe_intent.id.to_string(),
            client_secret: stripe_intent
                .client_secret
                .ok_or_else(|| PaymentError::StripeError("Missing client_secret".to_string()))?,
            amount_cents,
            currency: "usd".to_string(),
            namespace_reserved,
            nil_name,
            nil_role,
            nil_pair_key,
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
