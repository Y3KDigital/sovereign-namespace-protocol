use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use crate::database::Database;
use crate::errors::PaymentError;
use sqlx::Row;

#[derive(Deserialize)]
pub struct ValidateCodeRequest {
    pub code: String,
}

#[derive(Serialize)]
pub struct ValidateCodeResponse {
    pub valid: bool,
    pub tier: Option<String>,
    pub status: Option<String>,
    pub message: String,
}

pub async fn validate_code(
    db: web::Data<Database>,
    req: web::Json<ValidateCodeRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let code = req.code.trim().to_uppercase();

    // Query friends_family_codes table directly
    // Assuming table 'friends_family_codes' exists (created by python script)
    let result = sqlx::query("SELECT tier, status FROM friends_family_codes WHERE code = ?")
        .bind(&code)
        .fetch_optional(&db.pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error checking FF code: {:?}", e);
            // Return internal server error effectively but mapped to Actix error
            actix_web::error::ErrorInternalServerError("Database error")
        })?;

    if let Some(row) = result {
        let tier: String = row.try_get("tier").unwrap_or_default();
        let status: String = row.try_get("status").unwrap_or_default();

        if status == "active" {
             Ok(HttpResponse::Ok().json(ValidateCodeResponse {
                valid: true,
                tier: Some(tier),
                status: Some(status),
                message: "Code valid".to_string(),
            }))
        } else {
             Ok(HttpResponse::Ok().json(ValidateCodeResponse {
                valid: false,
                tier: Some(tier),
                status: Some(status.clone()),
                message: format!("Code is {}", status),
            }))
        }
    } else {
        Ok(HttpResponse::Ok().json(ValidateCodeResponse {
            valid: false,
            tier: None,
            status: None,
            message: "Code not found".to_string(),
        }))
    }
}
