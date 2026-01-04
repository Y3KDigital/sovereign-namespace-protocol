use actix_web::{web, HttpRequest, HttpResponse};
use serde_json::{self, json};
use std::env;

use crate::types::{
    AffiliatePortalResponse,
    CreateAffiliateRequest,
    CreateAffiliateResponse,
    CreateLeadRequest,
    CreateLeadResponse,
    CreatePaymentRequest,
    OrderResponse,
    StripeWebhookEvent,
};
use crate::errors::{PaymentError, PaymentResult};
use crate::database::Database;
use crate::stripe_service::StripeService;
use crate::issuance::IssuanceService;
use crate::inventory::InventoryManager;

fn require_affiliate_admin(req: &HttpRequest) -> PaymentResult<()> {
    let expected = env::var("AFFILIATE_ADMIN_TOKEN").unwrap_or_default();
    let expected = expected.trim();
    if expected.is_empty() {
        // Fail closed: without an explicit admin token, admin endpoints are disabled.
        return Err(PaymentError::Unauthorized);
    }

    // Accept either Authorization: Bearer <token> or X-Admin-Token: <token>
    let header_auth = req
        .headers()
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .map(|v| v.trim().to_string());

    let header_admin = req
        .headers()
        .get("x-admin-token")
        .and_then(|v| v.to_str().ok())
        .map(|v| v.trim().to_string());

    let provided = header_admin.or_else(|| {
        header_auth.and_then(|v| {
            if v.to_ascii_lowercase().starts_with("bearer ") {
                Some(v[7..].trim().to_string())
            } else {
                None
            }
        })
    });

    match provided {
        Some(tok) if tok == expected => Ok(()),
        _ => Err(PaymentError::Unauthorized),
    }
}

/// GET /api/health - Health check endpoint
pub async fn health_check(
    stripe: web::Data<Option<StripeService>>,
) -> HttpResponse {
    HttpResponse::Ok().json(json!({
        "status": "healthy",
        "service": "payments-api",
        "version": "1.0.0",
        "stripe_configured": stripe.get_ref().is_some(),
        "endpoints": [
            "GET /api/health",
            "GET /api/inventory/status",
            "POST /api/payments/create-intent",
            "POST /api/payments/webhook",
            "POST /api/affiliates (admin)",
            "GET /api/affiliates/portal/{portal_token}",
            "POST /api/affiliates/leads",
            "GET /api/orders/{order_id}",
            "GET /api/downloads/{token}"
        ]
    }))
}

/// POST /api/payments/create-intent
/// Create Stripe PaymentIntent for namespace purchase
pub async fn create_payment_intent(
    req: web::Json<CreatePaymentRequest>,
    stripe: web::Data<Option<StripeService>>,
    db: web::Data<Database>,
    inventory: web::Data<InventoryManager>,
) -> PaymentResult<HttpResponse> {
    let stripe = stripe
        .get_ref()
        .as_ref()
        .ok_or(crate::errors::PaymentError::StripeNotConfigured)?;

    let response = stripe
        .create_payment_intent(req.into_inner(), &db, &inventory)
        .await?;
    Ok(HttpResponse::Ok().json(response))
}

/// POST /api/payments/webhook
/// Handle Stripe webhook events (CHECKPOINT 2: Idempotency enforced)
pub async fn stripe_webhook(
    req: HttpRequest,
    body: web::Bytes,
    stripe: web::Data<Option<StripeService>>,
    db: web::Data<Database>,
    issuance: web::Data<IssuanceService>,
) -> PaymentResult<HttpResponse> {
    let stripe = stripe
        .get_ref()
        .as_ref()
        .ok_or(crate::errors::PaymentError::StripeNotConfigured)?;

    // STEP 1: Verify Stripe signature (fail fast)
    let signature = req
        .headers()
        .get("stripe-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| {
            crate::errors::PaymentError::InvalidWebhookSignature
        })?;

    let payload = std::str::from_utf8(&body)
        .map_err(|_| crate::errors::PaymentError::InvalidWebhookSignature)?;
    stripe.verify_webhook_signature(payload, signature)?;

    // Parse event
    let event: StripeWebhookEvent = serde_json::from_str(payload)
        .map_err(|e| crate::errors::PaymentError::InternalError(e.to_string()))?;

    let event_id = &event.id;
    let event_type = &event.r#type;

    tracing::info!("Received webhook event: {} ({})", event_type, event_id);

    // Extract payment_intent_id if present
    let payment_intent_id = event.data["object"]["id"].as_str();

    // STEP 2: Event-level idempotency check (MUST be first DB operation)
    let is_new_event = db
        .record_stripe_event(
            event_id,
            event_type,
            payment_intent_id,
            "processing",  // Will update to success/failed later
        )
        .await?;

    // STEP 3: Early return if duplicate (already processed)
    if !is_new_event {
        tracing::info!("Duplicate event {}, returning 200 OK without processing", event_id);
        return Ok(HttpResponse::Ok().json(serde_json::json!({ "received": true })));
    }

    // STEP 4: Gate by event type (only process allowed events)
    match event_type.as_str() {
        "payment_intent.succeeded" => {
            let payment_intent_id = payment_intent_id
                .ok_or_else(|| {
                    crate::errors::PaymentError::InternalError(
                        "Missing payment_intent.id".to_string(),
                    )
                })?;

            // STEP 5: Acquire intent-level lock (prevents concurrent issuance)
            let lock_token = uuid::Uuid::new_v4().to_string();
            let lock_acquired = db
                .acquire_issuance_lock(payment_intent_id, &lock_token)
                .await?;

            if !lock_acquired {
                tracing::warn!(
                    "Issuance lock already held for {}, skipping duplicate processing",
                    payment_intent_id
                );
                return Ok(HttpResponse::Ok().json(serde_json::json!({ "received": true })));
            }

            // STEP 6: Update payment status
            stripe
                .handle_payment_succeeded(payment_intent_id, &db)
                .await?;

            // STEP 6.5: Record affiliate earnings (best-effort; never blocks issuance)
            if let Err(e) = db
                .record_affiliate_earning_for_stripe_payment_intent(payment_intent_id)
                .await
            {
                tracing::warn!(
                    "Failed to record affiliate earning for {}: {}",
                    payment_intent_id,
                    e
                );
            }

            // STEP 7: Issue certificate (SYNCHRONOUS STATE MACHINE - CHECKPOINT 3)
            let issuance_service = issuance.into_inner();
            let db_ref = db.into_inner();

            match issuance_service
                .issue_certificate(payment_intent_id, &db_ref)
                .await
            {
                Ok(issuance_record) => {
                    tracing::info!(
                        "Certificate issued successfully: namespace={}, ipfs_cid={}",
                        issuance_record.namespace,
                        issuance_record.certificate_ipfs_cid
                    );
                }
                Err(e) => {
                    tracing::error!(
                        "Certificate issuance failed for {}: {}",
                        payment_intent_id,
                        e
                    );
                    // Error already persisted to database by state machine
                    // Client gets 200 OK (webhook idempotency), retry will happen later
                }
            }
        }
        "payment_intent.payment_failed" | "payment_intent.canceled" => {
            let payment_intent_id = payment_intent_id
                .ok_or_else(|| {
                    crate::errors::PaymentError::InternalError(
                        "Missing payment_intent.id".to_string(),
                    )
                })?;

            stripe
                .handle_payment_failed(payment_intent_id, &db)
                .await?;
        }
        "charge.refunded" => {
            // Extract charge and payment_intent from event data
            let charge = event
                .data
                .get("object")
                .and_then(|obj| obj.as_object())
                .ok_or_else(|| {
                    crate::errors::PaymentError::InternalError(
                        "Missing charge object in refund event".to_string(),
                    )
                })?;

            let charge_id = charge
                .get("id")
                .and_then(|id| id.as_str())
                .ok_or_else(|| {
                    crate::errors::PaymentError::InternalError(
                        "Missing charge.id".to_string(),
                    )
                })?;

            let pi_id = charge
                .get("payment_intent")
                .and_then(|pi| pi.as_str())
                .ok_or_else(|| {
                    crate::errors::PaymentError::InternalError(
                        "Missing charge.payment_intent".to_string(),
                    )
                })?;

            let refund_amount = charge
                .get("amount_refunded")
                .and_then(|amt| amt.as_u64())
                .unwrap_or(0);

            // Process refund
            let refund_service = crate::refund_service::RefundService::new();
            let inventory_mgr = crate::inventory::InventoryManager::new(db.pool.clone());

            match refund_service
                .handle_refund(charge_id, pi_id, refund_amount, &db, &inventory_mgr)
                .await
            {
                Ok(decision) => {
                    tracing::info!("Refund processed: {:?}", decision);
                }
                Err(e) => {
                    tracing::error!("Refund processing failed: {}", e);
                    // Return 200 OK even on error (webhook idempotency)
                }
            }
        }
        "charge.dispute.created" => {
            let charge = event
                .data
                .get("object")
                .and_then(|obj| obj.as_object())
                .ok_or_else(|| {
                    crate::errors::PaymentError::InternalError(
                        "Missing charge object in dispute event".to_string(),
                    )
                })?;

            let charge_id = charge
                .get("id")
                .and_then(|id| id.as_str())
                .ok_or_else(|| {
                    crate::errors::PaymentError::InternalError(
                        "Missing charge.id".to_string(),
                    )
                })?;

            let pi_id = charge
                .get("payment_intent")
                .and_then(|pi| pi.as_str())
                .ok_or_else(|| {
                    crate::errors::PaymentError::InternalError(
                        "Missing charge.payment_intent".to_string(),
                    )
                })?;

            let dispute_reason = charge
                .get("dispute")
                .and_then(|d| d.get("reason"))
                .and_then(|r| r.as_str())
                .unwrap_or("unknown");

            let refund_service = crate::refund_service::RefundService::new();

            match refund_service
                .handle_dispute_created(charge_id, pi_id, dispute_reason, &db)
                .await
            {
                Ok(_) => {
                    tracing::info!("Dispute marked: charge={}", charge_id);
                }
                Err(e) => {
                    tracing::error!("Dispute processing failed: {}", e);
                }
            }
        }
        _ => {
            // All other events: record as ignored
            tracing::debug!("Ignoring unhandled webhook event: {}", event_type);
            // Event already recorded as "processing", acceptable for ignored events
        }
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({ "received": true })))
}

/// GET /api/orders/:order_id
/// Get order details
pub async fn get_order(
    order_id: web::Path<String>,
    db: web::Data<Database>,
) -> PaymentResult<HttpResponse> {
    let order_uuid = uuid::Uuid::parse_str(&order_id)
        .map_err(|_| crate::errors::PaymentError::PaymentIntentNotFound(order_id.to_string()))?;

    let order = db
        .get_order(&order_uuid)
        .await?
        .ok_or_else(|| crate::errors::PaymentError::PaymentIntentNotFound(order_id.to_string()))?;

    let response = OrderResponse {
        order_id: order.id.to_string(),
        status: order.payment_intent.status.clone(),
        namespace: order.issuance.as_ref().map(|i| i.namespace.clone()),
        certificate_ipfs_cid: order.issuance.as_ref().map(|i| i.certificate_ipfs_cid.clone()),
        download_url: order.issuance.as_ref().map(|i| {
            format!("/api/downloads/{}", i.download_token)
        }),
        amount_paid_cents: order.payment_intent.amount_cents,
        created_at: order.payment_intent.created_at,
    };

    Ok(HttpResponse::Ok().json(response))
}

/// GET /api/downloads/:token
/// Download certificate by token
pub async fn download_certificate(
    token: web::Path<String>,
    db: web::Data<Database>,
) -> PaymentResult<HttpResponse> {
    use chrono::Utc;
    use crate::errors::PaymentError;

    let issuance = db
        .get_issuance_by_token(&token)
        .await?
        .ok_or_else(|| PaymentError::InvalidDownloadToken)?;

    // Check expiration
    if issuance.download_expires_at < Utc::now() {
        return Err(PaymentError::DownloadTokenExpired);
    }

    // Return certificate JSON (in production, would fetch from IPFS)
    let certificate_data = serde_json::json!({
        "namespace": issuance.namespace,
        "ipfs_cid": issuance.certificate_ipfs_cid,
        "sha3_hash": issuance.certificate_hash_sha3,
        "issued_at": issuance.issued_at,
        "customer_email": issuance.customer_email,
    });

    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .insert_header(("Content-Disposition", format!("attachment; filename=\"{}.cert.json\"", issuance.namespace)))
        .json(certificate_data))
}

/// GET /api/inventory/status
/// Get current inventory status for all tiers
pub async fn get_inventory_status(
    inventory: web::Data<InventoryManager>,
) -> PaymentResult<HttpResponse> {
    let status = inventory.get_inventory_status().await?;
    
    let response: Vec<_> = status
        .into_iter()
        .map(|tier| {
            serde_json::json!({
                "tier": tier.tier,
                "genesis_supply": tier.genesis_supply,
                "presell_cap": tier.presell_cap,
                "presold_count": tier.presold_count,
                "remaining": tier.presell_cap - tier.presold_count,
                "availability": if tier.presold_count < tier.presell_cap {
                    "available"
                } else {
                    "sold_out"
                }
            })
        })
        .collect();

    Ok(HttpResponse::Ok().json(response))
}

/// GET /api/namespaces
/// List all issued namespaces for Explore page (read-only registry view)
pub async fn list_namespaces(
    db: web::Data<Database>,
    query: web::Query<ListNamespacesQuery>,
) -> PaymentResult<HttpResponse> {
    let tier_filter = query.tier.as_deref();
    let limit = query.limit.unwrap_or(100).min(1000); // Max 1000
    let offset = query.offset.unwrap_or(0);

    let namespaces = db.list_issued_namespaces(tier_filter, limit, offset).await?;

    let response: Vec<_> = namespaces
        .into_iter()
        .map(|ns| {
            serde_json::json!({
                "namespace": ns.namespace,
                "tier": ns.tier,
                "ipfs_cid": ns.certificate_ipfs_cid,
                "issued_at": ns.issued_at,
            })
        })
        .collect();

    Ok(HttpResponse::Ok().json(response))
}

#[derive(serde::Deserialize)]
pub struct ListNamespacesQuery {
    pub tier: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// POST /api/affiliates (admin)
/// Create an affiliate/broker and return a portal login link + referral URL.
pub async fn create_affiliate_admin(
    http_req: HttpRequest,
    req: web::Json<CreateAffiliateRequest>,
    db: web::Data<Database>,
) -> PaymentResult<HttpResponse> {
    require_affiliate_admin(&http_req)?;

    let req = req.into_inner();
    if req.display_name.trim().is_empty() {
        return Err(PaymentError::ValidationError("display_name is required".to_string()));
    }
    if req.email.trim().is_empty() {
        return Err(PaymentError::ValidationError("email is required".to_string()));
    }

    let commission_bps = req.commission_bps.unwrap_or(1_000); // 10% default
    let bonus_cents = req.bonus_cents.unwrap_or(0);

    let affiliate = db
        .create_affiliate(
            req.display_name.trim(),
            req.email.trim(),
            commission_bps,
            bonus_cents,
        )
        .await?;

    let portal_base = env::var("AFFILIATE_PORTAL_BASE_URL")
        .unwrap_or_else(|_| "https://y3kmarkets.com/partner".to_string());
    let referral_base = env::var("AFFILIATE_REFERRAL_BASE_URL")
        .unwrap_or_else(|_| "https://y3kmarkets.com/invite".to_string());

    let portal_url = format!(
        "{}/?t={}",
        portal_base.trim_end_matches('/'),
        affiliate.portal_token
    );
    let referral_url = format!(
        "{}/?r={}",
        referral_base.trim_end_matches('/'),
        affiliate.referral_code
    );

    Ok(HttpResponse::Ok().json(CreateAffiliateResponse {
        affiliate,
        portal_url,
        referral_url,
    }))
}

/// GET /api/affiliates/portal/{portal_token}
/// Token-authenticated affiliate portal read model.
pub async fn affiliate_portal(
    path: web::Path<String>,
    db: web::Data<Database>,
) -> PaymentResult<HttpResponse> {
    let portal_token = path.into_inner();

    let affiliate = db
        .get_affiliate_by_portal_token(&portal_token)
        .await?
        .ok_or(PaymentError::AffiliateNotFound)?;

    if !affiliate.active {
        return Err(PaymentError::AffiliateInactive);
    }

    let stats = db.get_affiliate_portal_stats(&affiliate).await?;

    let referral_base = env::var("AFFILIATE_REFERRAL_BASE_URL")
        .unwrap_or_else(|_| "https://y3kmarkets.com/invite".to_string());
    let referral_url = format!(
        "{}/?r={}",
        referral_base.trim_end_matches('/'),
        affiliate.referral_code
    );

    Ok(HttpResponse::Ok().json(AffiliatePortalResponse {
        affiliate,
        referral_url,
        stats,
    }))
}

/// POST /api/affiliates/leads
/// Capture a lead for a referral code (CRM-lite).
pub async fn create_affiliate_lead(
    req: web::Json<CreateLeadRequest>,
    db: web::Data<Database>,
) -> PaymentResult<HttpResponse> {
    let req = req.into_inner();

    let referral_code = req.referral_code.trim();
    if referral_code.is_empty() {
        return Err(PaymentError::ValidationError(
            "referral_code is required".to_string(),
        ));
    }
    if req.lead_email.trim().is_empty() {
        return Err(PaymentError::ValidationError(
            "lead_email is required".to_string(),
        ));
    }

    let affiliate = db
        .get_affiliate_by_referral_code(referral_code)
        .await?
        .ok_or(PaymentError::AffiliateNotFound)?;

    if !affiliate.active {
        return Err(PaymentError::AffiliateInactive);
    }

    let (id, created_at) = db
        .record_affiliate_lead(
            &affiliate.id,
            referral_code,
            req.lead_email.trim(),
            req.lead_name.as_deref(),
            req.note.as_deref(),
        )
        .await?;

    Ok(HttpResponse::Ok().json(CreateLeadResponse {
        id,
        affiliate_id: affiliate.id,
        referral_code: affiliate.referral_code,
        lead_email: req.lead_email,
        lead_name: req.lead_name,
        note: req.note,
        created_at,
    }))
}
