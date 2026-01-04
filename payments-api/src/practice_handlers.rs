// Practice Mode API Handlers
// Purpose: RESTful endpoints for educational simulation (no real issuance)

use actix_web::{web, HttpResponse, Result};
use serde::{Deserialize, Serialize};

use crate::database::Database;
use crate::practice::{CompletionRequest, PracticeManager, QuizSubmission};

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct StartSessionRequest {
    pub email: String,
    pub acknowledgement: bool, // Must be true
}

#[derive(Debug, Serialize)]
pub struct StartSessionResponse {
    pub session_token: String,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyEmailRequest {
    pub token: String,
}

#[derive(Debug, Serialize)]
pub struct VerifyEmailResponse {
    pub session_token: String,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct StoreIdentifierRequest {
    pub session_token: String,
    pub tier: String,
    pub identifier: String,
}

#[derive(Debug, Serialize)]
pub struct StoreIdentifierResponse {
    pub available: bool,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct GenerateCertificateRequest {
    pub session_token: String,
}

#[derive(Debug, Deserialize)]
pub struct SubmitQuizRequest {
    pub session_token: String,
    pub answers: Vec<usize>, // Selected option indices (0-2)
}

#[derive(Debug, Deserialize)]
pub struct CompleteSessionRequest {
    pub session_token: String,
    pub typed_phrase: String,
    pub email_confirmation: String,
    pub acknowledgement_checked: bool,
}

#[derive(Debug, Serialize)]
pub struct CompleteSessionResponse {
    pub completion_token: String,
    pub completed_at: String,
    pub message: String,
}

// ============================================================================
// HANDLERS
// ============================================================================

/// POST /practice/start - Entry gate (email + acknowledgement)
pub async fn start_session(
    db: web::Data<Database>,
    req: web::Json<StartSessionRequest>,
) -> Result<HttpResponse> {
    // Validate acknowledgement checkbox
    if !req.acknowledgement {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Acknowledgement required: You must confirm this is a simulation"
        })));
    }

    let manager = PracticeManager::new(db.get_ref().clone());

    match manager.start_session(&req.email).await {
        Ok((session_token, verification_token)) => {
            // TODO: Send verification email with token
            tracing::info!(
                "Practice session started for email: {}, verification token: {}",
                req.email,
                verification_token
            );

            Ok(HttpResponse::Ok().json(StartSessionResponse {
                session_token,
                message: format!(
                    "Verification email sent to {}. Check your inbox.",
                    req.email
                ),
            }))
        }
        Err(e) => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Failed to start session: {}", e)
        }))),
    }
}

/// GET /practice/verify-email?token={token} - Email verification
pub async fn verify_email(
    db: web::Data<Database>,
    query: web::Query<VerifyEmailRequest>,
) -> Result<HttpResponse> {
    let manager = PracticeManager::new(db.get_ref().clone());

    match manager.verify_email(&query.token).await {
        Ok(session_token) => Ok(HttpResponse::Ok().json(VerifyEmailResponse {
            session_token,
            message: "Email verified successfully. You can now begin Practice Mode.".to_string(),
        })),
        Err(e) => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Email verification failed: {}", e)
        }))),
    }
}

/// GET /practice/session/{session_token} - Get session state
pub async fn get_session(
    db: web::Data<Database>,
    path: web::Path<String>,
) -> Result<HttpResponse> {
    let session_token = path.into_inner();
    let manager = PracticeManager::new(db.get_ref().clone());

    match manager.get_session(&session_token).await {
        Ok(session) => Ok(HttpResponse::Ok().json(session)),
        Err(e) => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": format!("Session not found: {}", e)
        }))),
    }
}

/// POST /practice/identifier - Store selected tier + identifier (Screen 3)
pub async fn store_identifier(
    db: web::Data<Database>,
    req: web::Json<StoreIdentifierRequest>,
) -> Result<HttpResponse> {
    let manager = PracticeManager::new(db.get_ref().clone());

    match manager
        .store_identifier(&req.session_token, &req.tier, &req.identifier)
        .await
    {
        Ok(available) => Ok(HttpResponse::Ok().json(StoreIdentifierResponse {
            available,
            message: format!("{}.x is available (SIMULATION)", req.identifier),
        })),
        Err(e) => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Failed to store identifier: {}", e)
        }))),
    }
}

/// POST /practice/generate-certificate - Generate mock certificate (Screen 4)
pub async fn generate_mock_certificate(
    db: web::Data<Database>,
    req: web::Json<GenerateCertificateRequest>,
) -> Result<HttpResponse> {
    let manager = PracticeManager::new(db.get_ref().clone());

    match manager.generate_mock_certificate(&req.session_token).await {
        Ok(certificate) => Ok(HttpResponse::Ok().json(certificate)),
        Err(e) => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Failed to generate certificate: {}", e)
        }))),
    }
}

/// GET /practice/quiz/questions - Get quiz questions (Screen 7)
pub async fn get_quiz_questions(db: web::Data<Database>) -> Result<HttpResponse> {
    let manager = PracticeManager::new(db.get_ref().clone());
    let questions = manager.get_quiz_questions();
    Ok(HttpResponse::Ok().json(questions))
}

/// POST /practice/quiz/submit - Submit and grade quiz (Screen 7)
pub async fn submit_quiz(
    db: web::Data<Database>,
    req: web::Json<SubmitQuizRequest>,
) -> Result<HttpResponse> {
    let manager = PracticeManager::new(db.get_ref().clone());

    let submission = QuizSubmission {
        answers: req.answers.clone(),
    };

    match manager.submit_quiz(&req.session_token, submission).await {
        Ok(result) => Ok(HttpResponse::Ok().json(result)),
        Err(e) => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Failed to submit quiz: {}", e)
        }))),
    }
}

/// POST /practice/complete - Complete practice mode (Screen 8)
pub async fn complete_session(
    db: web::Data<Database>,
    req: web::Json<CompleteSessionRequest>,
) -> Result<HttpResponse> {
    let manager = PracticeManager::new(db.get_ref().clone());

    let completion_request = CompletionRequest {
        typed_phrase: req.typed_phrase.clone(),
        email_confirmation: req.email_confirmation.clone(),
        acknowledgement_checked: req.acknowledgement_checked,
    };

    match manager
        .complete_session(&req.session_token, completion_request)
        .await
    {
        Ok(completion_token) => {
            // Get session for completed_at timestamp
            match manager.get_session(&req.session_token).await {
                Ok(session) => {
                    let completed_at = session
                        .completed_at
                        .map(|dt| dt.to_rfc3339())
                        .unwrap_or_else(|| "Unknown".to_string());

                    // TODO: Send completion email

                    Ok(HttpResponse::Ok().json(CompleteSessionResponse {
                        completion_token,
                        completed_at,
                        message: "Practice Mode completed successfully. Check your email for confirmation.".to_string(),
                    }))
                }
                Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to retrieve completion details"
                }))),
            }
        }
        Err(e) => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Failed to complete session: {}", e)
        }))),
    }
}

/// GET /practice/completion/{completion_token} - Get completion details (Screen 9)
pub async fn get_completion(
    db: web::Data<Database>,
    path: web::Path<String>,
) -> Result<HttpResponse> {
    let completion_token = path.into_inner();
    let manager = PracticeManager::new(db.get_ref().clone());

    match manager.get_completion(&completion_token).await {
        Ok(session) => Ok(HttpResponse::Ok().json(session)),
        Err(e) => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": format!("Completion not found: {}", e)
        }))),
    }
}

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

pub fn configure_practice_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/practice")
            .route("/start", web::post().to(start_session))
            .route("/verify-email", web::get().to(verify_email))
            .route("/session/{session_token}", web::get().to(get_session))
            .route("/identifier", web::post().to(store_identifier))
            .route(
                "/generate-certificate",
                web::post().to(generate_mock_certificate),
            )
            .route("/quiz/questions", web::get().to(get_quiz_questions))
            .route("/quiz/submit", web::post().to(submit_quiz))
            .route("/complete", web::post().to(complete_session))
            .route(
                "/completion/{completion_token}",
                web::get().to(get_completion),
            ),
    );
}
