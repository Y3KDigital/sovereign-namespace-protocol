use thiserror::Error;

fn expose_error_details() -> bool {
    std::env::var("EXPOSE_ERROR_DETAILS")
        .ok()
        .map(|v| matches!(v.to_ascii_lowercase().as_str(), "1" | "true" | "yes" | "on"))
        .unwrap_or(false)
}

#[derive(Error, Debug)]
pub enum PaymentError {
    #[error("Stripe API error: {0}")]
    StripeError(String),

    #[error("Stripe is not configured on this server")]
    StripeNotConfigured,

    #[error("Invalid webhook signature")]
    InvalidWebhookSignature,

    #[error("Payment intent not found: {0}")]
    PaymentIntentNotFound(String),

    #[error("Namespace inventory exhausted for tier: {0}")]
    InventoryExhausted(String),

    #[error("Invalid rarity tier: {0}")]
    InvalidRarityTier(String),

    #[error("Certificate generation failed: {0}")]
    CertificateGenerationFailed(String),

    #[error("IPFS upload failed: {0}")]
    IpfsUploadFailed(String),

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Duplicate payment intent: {0}")]
    DuplicatePaymentIntent(String),

    #[error("Order already fulfilled: {0}")]
    OrderAlreadyFulfilled(String),

    #[error("Invalid download token")]
    InvalidDownloadToken,

    #[error("Download token expired")]
    DownloadTokenExpired,

    #[error("Issuance not found: {0}")]
    IssuanceNotFound(String),

    #[error("Genesis not ready: {0}")]
    GenesisNotReady(String),

    #[error("Genesis already finalized: {0}")]
    GenesisAlreadyFinalized(String),

    #[error("Genesis not finalized: {0}")]
    GenesisNotFinalized(String),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Too many requests")]
    TooManyRequests,

    #[error("Signing key not configured: {0}")]
    SigningKeyNotConfigured(String),

    #[error("Affiliate not found")]
    AffiliateNotFound,

    #[error("Affiliate is inactive")]
    AffiliateInactive,

    #[error("Lead already exists")]
    LeadAlreadyExists,

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Internal error: {0}")]
    InternalError(String),
}

impl actix_web::ResponseError for PaymentError {
    fn error_response(&self) -> actix_web::HttpResponse {
        use actix_web::http::StatusCode;

        match self {
            PaymentError::StripeError(_) => {
                let message = if expose_error_details() {
                    self.to_string()
                } else {
                    "Stripe upstream error".to_string()
                };
                actix_web::HttpResponse::build(StatusCode::BAD_GATEWAY).json(serde_json::json!({
                    "error": "stripe_error",
                    "message": message
                }))
            }
            PaymentError::StripeNotConfigured => {
                actix_web::HttpResponse::build(StatusCode::SERVICE_UNAVAILABLE).json(serde_json::json!({
                    "error": "stripe_not_configured",
                    "message": self.to_string()
                }))
            }
            PaymentError::InvalidWebhookSignature => {
                actix_web::HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "invalid_signature",
                    "message": self.to_string()
                }))
            }
            PaymentError::Unauthorized => {
                actix_web::HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "unauthorized",
                    "message": self.to_string()
                }))
            }
            PaymentError::TooManyRequests => {
                actix_web::HttpResponse::TooManyRequests().json(serde_json::json!({
                    "error": "rate_limited",
                    "message": self.to_string()
                }))
            }
            PaymentError::SigningKeyNotConfigured(_) => {
                actix_web::HttpResponse::ServiceUnavailable().json(serde_json::json!({
                    "error": "signing_key_not_configured",
                    "message": self.to_string()
                }))
            }
            PaymentError::AffiliateNotFound => {
                actix_web::HttpResponse::NotFound().json(serde_json::json!({
                    "error": "affiliate_not_found",
                    "message": self.to_string()
                }))
            }
            PaymentError::AffiliateInactive => {
                actix_web::HttpResponse::build(StatusCode::FORBIDDEN).json(serde_json::json!({
                    "error": "affiliate_inactive",
                    "message": self.to_string()
                }))
            }
            PaymentError::LeadAlreadyExists => {
                actix_web::HttpResponse::Conflict().json(serde_json::json!({
                    "error": "lead_already_exists",
                    "message": self.to_string()
                }))
            }
            PaymentError::PaymentIntentNotFound(_) => {
                actix_web::HttpResponse::NotFound().json(serde_json::json!({
                    "error": "not_found",
                    "message": self.to_string()
                }))
            }
            PaymentError::NotFound(_) => {
                actix_web::HttpResponse::NotFound().json(serde_json::json!({
                    "error": "not_found",
                    "message": self.to_string()
                }))
            }
            PaymentError::InventoryExhausted(_) => {
                actix_web::HttpResponse::Conflict().json(serde_json::json!({
                    "error": "inventory_exhausted",
                    "message": self.to_string()
                }))
            }
            PaymentError::InvalidRarityTier(_) => {
                actix_web::HttpResponse::BadRequest().json(serde_json::json!({
                    "error": "invalid_tier",
                    "message": self.to_string()
                }))
            }
            PaymentError::DuplicatePaymentIntent(_) => {
                actix_web::HttpResponse::Conflict().json(serde_json::json!({
                    "error": "duplicate",
                    "message": self.to_string()
                }))
            }
            PaymentError::DatabaseError(_) => {
                let message = if expose_error_details() {
                    self.to_string()
                } else {
                    "Database error".to_string()
                };
                actix_web::HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "database_error",
                    "message": message
                }))
            }
            PaymentError::InvalidInput(_) => {
                actix_web::HttpResponse::BadRequest().json(serde_json::json!({
                    "error": "invalid_input",
                    "message": self.to_string()
                }))
            }
            PaymentError::ValidationError(_) => {
                actix_web::HttpResponse::BadRequest().json(serde_json::json!({
                    "error": "validation_error",
                    "message": self.to_string()
                }))
            }
            PaymentError::InvalidDownloadToken => {
                actix_web::HttpResponse::NotFound().json(serde_json::json!({
                    "error": "invalid_download_token",
                    "message": self.to_string()
                }))
            }
            PaymentError::DownloadTokenExpired => {
                actix_web::HttpResponse::build(StatusCode::GONE).json(serde_json::json!({
                    "error": "download_token_expired",
                    "message": self.to_string()
                }))
            }
            _ => {
                actix_web::HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "internal_error",
                    "message": "An internal error occurred"
                }))
            }
        }
    }
}

pub type PaymentResult<T> = Result<T, PaymentError>;
