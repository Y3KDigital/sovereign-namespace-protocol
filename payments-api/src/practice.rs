// Practice Mode - Educational Simulation Backend
// Module: practice.rs
// Purpose: Pure simulation for mandatory client education

use crate::database::Database;
use crate::errors::{PaymentError, PaymentResult};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sha3::{Digest, Sha3_256};
use sqlx::Row;
use uuid::Uuid;

// ============================================================================
// DATA STRUCTURES
// ============================================================================

/// Practice session record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PracticeSession {
    pub id: String,
    pub email: String,
    pub session_token: String,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub quiz_score: Option<i32>,
    pub quiz_attempts: i32,
    pub selected_tier: Option<String>,
    pub selected_identifier: Option<String>,
    pub mock_certificate_json: Option<String>,
    pub completion_token: Option<String>,
    pub verified_email: bool,
}

/// Mock certificate structure (simulation only)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockCertificate {
    pub version: String,
    pub namespace: String,
    pub tier: String,
    pub issued_at: DateTime<Utc>,
    pub ipfs_cid: String, // Always prefixed with "QmPRACTICE"
    pub certificate_hash: String,
    pub signature: String, // Literal: "MOCK_SIGNATURE_DATA_FOR_PRACTICE_MODE_ONLY_NOT_VALID"
    pub genesis_timestamp: String,
    pub protocol_version: String,
    pub is_simulation: bool, // Always true
}

/// Quiz question structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizQuestion {
    pub id: u8,
    pub question: String,
    pub options: Vec<String>,
    pub correct_answer: usize, // Index of correct option (0-2)
    pub explanation: String,
}

/// Quiz submission
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizSubmission {
    pub answers: Vec<usize>, // Selected option indices (0-2)
}

/// Quiz result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizResult {
    pub score: u8,
    pub total: u8,
    pub passed: bool, // true if score == total (100%)
    pub failed_questions: Vec<QuizQuestionResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizQuestionResult {
    pub question_id: u8,
    pub question: String,
    pub selected_answer: String,
    pub correct_answer: String,
    pub explanation: String,
}

/// Completion gate validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionRequest {
    pub typed_phrase: String,
    pub email_confirmation: String,
    pub acknowledgement_checked: bool,
}

// ============================================================================
// PRACTICE MODE MANAGER
// ============================================================================

pub struct PracticeManager {
    db: Database,
}

impl PracticeManager {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    // ------------------------------------------------------------------------
    // Entry Gate & Email Verification
    // ------------------------------------------------------------------------

    /// Start practice mode session (entry gate)
    pub async fn start_session(&self, email: &str) -> PaymentResult<(String, String)> {
        // Validate email format
        if !email.contains('@') || email.len() < 5 {
            return Err(PaymentError::InvalidInput(
                "Invalid email format".to_string(),
            ));
        }

        let session_id = Uuid::new_v4().to_string();
        let session_token = Uuid::new_v4().to_string();
        let verification_token = Uuid::new_v4().to_string();
        let expires_at = Utc::now() + Duration::hours(1);

        // Insert practice session
        sqlx::query(
            "INSERT INTO practice_sessions (id, email, session_token, verified_email)
             VALUES (?, ?, ?, FALSE)",
        )
        .bind(&session_id)
        .bind(email)
        .bind(&session_token)
        .execute(&self.db.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(format!("Failed to create session: {}", e)))?;

        // Insert verification token
        sqlx::query(
            "INSERT INTO practice_email_verifications (id, session_id, email, token, expires_at)
             VALUES (?, ?, ?, ?, ?)",
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&session_id)
        .bind(email)
        .bind(&verification_token)
        .bind(expires_at)
        .execute(&self.db.pool)
        .await
        .map_err(|e| {
            PaymentError::DatabaseError(format!("Failed to create verification: {}", e))
        })?;

        // Log analytics event
        self.log_analytics_event(&session_id, "entry", None, None)
            .await?;

        Ok((session_token, verification_token))
    }

    /// Verify email with token (1-hour expiration)
    pub async fn verify_email(&self, token: &str) -> PaymentResult<String> {
        let row = sqlx::query(
            "SELECT session_id, email, expires_at, verified
             FROM practice_email_verifications
             WHERE token = ?",
        )
        .bind(token)
        .fetch_optional(&self.db.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(format!("Failed to fetch verification: {}", e)))?
        .ok_or_else(|| PaymentError::InvalidInput("Invalid verification token".to_string()))?;

        let session_id: String = row.try_get("session_id").map_err(|e| {
            PaymentError::DatabaseError(format!("Failed to parse session_id: {}", e))
        })?;
        let verified: bool = row.try_get("verified").unwrap_or(false);
        let expires_at: DateTime<Utc> = row.try_get("expires_at").map_err(|e| {
            PaymentError::DatabaseError(format!("Failed to parse expires_at: {}", e))
        })?;

        // Check if already verified
        if verified {
            return Err(PaymentError::InvalidInput(
                "Email already verified".to_string(),
            ));
        }

        // Check expiration
        if Utc::now() > expires_at {
            return Err(PaymentError::InvalidInput(
                "Verification token expired".to_string(),
            ));
        }

        // Mark as verified
        sqlx::query(
            "UPDATE practice_email_verifications
             SET verified = TRUE, verified_at = CURRENT_TIMESTAMP
             WHERE token = ?",
        )
        .bind(token)
        .execute(&self.db.pool)
        .await
        .map_err(|e| {
            PaymentError::DatabaseError(format!("Failed to update verification: {}", e))
        })?;

        // Update session
        sqlx::query(
            "UPDATE practice_sessions
             SET verified_email = TRUE
             WHERE id = ?",
        )
        .bind(&session_id)
        .execute(&self.db.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(format!("Failed to update session: {}", e)))?;

        // Log analytics event
        self.log_analytics_event(&session_id, "email_verified", None, None)
            .await?;

        // Return session token for frontend redirect
        let session_token: String = sqlx::query_scalar(
            "SELECT session_token FROM practice_sessions WHERE id = ?",
        )
        .bind(&session_id)
        .fetch_one(&self.db.pool)
        .await
        .map_err(|e| {
            PaymentError::DatabaseError(format!("Failed to fetch session token: {}", e))
        })?;

        Ok(session_token)
    }

    // ------------------------------------------------------------------------
    // Session Management
    // ------------------------------------------------------------------------

    /// Get session by token
    pub async fn get_session(&self, session_token: &str) -> PaymentResult<PracticeSession> {
        let row = sqlx::query(
            "SELECT id, email, session_token, started_at, completed_at, quiz_score,
                    quiz_attempts, selected_tier, selected_identifier, mock_certificate_json,
                    completion_token, verified_email
             FROM practice_sessions
             WHERE session_token = ?",
        )
        .bind(session_token)
        .fetch_optional(&self.db.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(format!("Failed to fetch session: {}", e)))?
        .ok_or_else(|| PaymentError::InvalidInput("Invalid session token".to_string()))?;

        Ok(PracticeSession {
            id: row.try_get("id").map_err(|e| {
                PaymentError::DatabaseError(format!("Failed to parse id: {}", e))
            })?,
            email: row.try_get("email").map_err(|e| {
                PaymentError::DatabaseError(format!("Failed to parse email: {}", e))
            })?,
            session_token: row.try_get("session_token").map_err(|e| {
                PaymentError::DatabaseError(format!("Failed to parse session_token: {}", e))
            })?,
            started_at: row.try_get("started_at").map_err(|e| {
                PaymentError::DatabaseError(format!("Failed to parse started_at: {}", e))
            })?,
            completed_at: row.try_get("completed_at").ok(),
            quiz_score: row.try_get("quiz_score").ok(),
            quiz_attempts: row.try_get("quiz_attempts").unwrap_or(0),
            selected_tier: row.try_get("selected_tier").ok(),
            selected_identifier: row.try_get("selected_identifier").ok(),
            mock_certificate_json: row.try_get("mock_certificate_json").ok(),
            completion_token: row.try_get("completion_token").ok(),
            verified_email: row.try_get("verified_email").unwrap_or(false),
        })
    }

    // ------------------------------------------------------------------------
    // Identifier Selection (Screen 3)
    // ------------------------------------------------------------------------

    /// Store selected tier + identifier (fake availability, always returns true)
    pub async fn store_identifier(
        &self,
        session_token: &str,
        tier: &str,
        identifier: &str,
    ) -> PaymentResult<bool> {
        // Validate format (alphanumeric, 1-32 chars)
        if identifier.is_empty() || identifier.len() > 32 {
            return Err(PaymentError::InvalidInput(
                "Identifier must be 1-32 characters".to_string(),
            ));
        }
        if !identifier
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '-')
        {
            return Err(PaymentError::InvalidInput(
                "Identifier must be alphanumeric (no spaces or special characters)".to_string(),
            ));
        }

        let valid_tiers = ["Mythic", "Legendary", "Epic", "Rare", "Uncommon", "Common"];
        if !valid_tiers.contains(&tier) {
            return Err(PaymentError::InvalidInput("Invalid tier".to_string()));
        }

        let session = self.get_session(session_token).await?;

        sqlx::query(
            "UPDATE practice_sessions
             SET selected_tier = ?, selected_identifier = ?
             WHERE id = ?",
        )
        .bind(tier)
        .bind(identifier)
        .bind(&session.id)
        .execute(&self.db.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(format!("Failed to update session: {}", e)))?;

        // Always return true (fake availability check)
        Ok(true)
    }

    // ------------------------------------------------------------------------
    // Mock Certificate Generation (Screen 4)
    // ------------------------------------------------------------------------

    /// Generate mock certificate (simulation only, watermarked)
    pub async fn generate_mock_certificate(
        &self,
        session_token: &str,
    ) -> PaymentResult<MockCertificate> {
        let session = self.get_session(session_token).await?;

        let namespace = session.selected_identifier.ok_or_else(|| {
            PaymentError::InvalidInput("No identifier selected".to_string())
        })?;
        let tier = session
            .selected_tier
            .ok_or_else(|| PaymentError::InvalidInput("No tier selected".to_string()))?;

        // Generate mock data
        let mock_ipfs_cid = format!("QmPRACTICE{}", Uuid::new_v4().to_string().replace('-', ""));
        let mock_hash = format!("0x{:x}", Sha3_256::digest(Uuid::new_v4().as_bytes()));

        let certificate = MockCertificate {
            version: "1.0".to_string(),
            namespace: format!("{}.x", namespace),
            tier: tier.clone(),
            issued_at: Utc::now(),
            ipfs_cid: mock_ipfs_cid,
            certificate_hash: mock_hash,
            signature: "MOCK_SIGNATURE_DATA_FOR_PRACTICE_MODE_ONLY_NOT_VALID".to_string(),
            genesis_timestamp: "2026-01-15T00:00:00Z".to_string(),
            protocol_version: "1.0".to_string(),
            is_simulation: true,
        };

        let cert_json = serde_json::to_string(&certificate).map_err(|e| {
            PaymentError::InternalError(format!("Failed to serialize certificate: {}", e))
        })?;

        // Store in session
        sqlx::query(
            "UPDATE practice_sessions
             SET mock_certificate_json = ?
             WHERE id = ?",
        )
        .bind(&cert_json)
        .bind(&session.id)
        .execute(&self.db.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(format!("Failed to update session: {}", e)))?;

        Ok(certificate)
    }

    // ------------------------------------------------------------------------
    // Quiz Logic (Screen 7)
    // ------------------------------------------------------------------------

    /// Get quiz questions (7 total, will be randomized on frontend)
    pub fn get_quiz_questions(&self) -> Vec<QuizQuestion> {
        vec![
            QuizQuestion {
                id: 1,
                question: "Can you change your namespace after it has been issued?".to_string(),
                options: vec![
                    "Yes, within 24 hours".to_string(),
                    "Yes, by contacting customer support".to_string(),
                    "No, it is cryptographically immutable".to_string(),
                ],
                correct_answer: 2,
                explanation: "Namespace issuance is permanent. Once your certificate is signed with Dilithium5 and uploaded to IPFS, it cannot be altered. The hash of your certificate is mathematically unique and collision-impossible. Not even Y3K Markets can change an issued namespace.".to_string(),
            },
            QuizQuestion {
                id: 2,
                question: "What happens if you lose access to your Y3K Markets account?".to_string(),
                options: vec![
                    "Your namespace is permanently lost".to_string(),
                    "You need to re-issue your namespace".to_string(),
                    "Your certificate remains valid and verifiable on IPFS".to_string(),
                ],
                correct_answer: 2,
                explanation: "Your certificate is stored on IPFS (permanent, decentralized storage). Your account is only for dashboard access. Anyone with the IPFS CID can verify your certificate. If you lose account access, contact support with proof of payment for account recovery, but your certificate is never lost.".to_string(),
            },
            QuizQuestion {
                id: 3,
                question: "Can someone else issue \"1.x\" if you already issued it?".to_string(),
                options: vec![
                    "Yes, if they pay more".to_string(),
                    "Yes, after the Genesis ceremony".to_string(),
                    "No, cryptographic hash collision is mathematically impossible".to_string(),
                ],
                correct_answer: 2,
                explanation: "Each namespace is cryptographically unique. The hash of your certificate includes your namespace, making it impossible for anyone else to issue the same namespace. This is enforced by SHA3-256 cryptographic hashing, not by database rules or platform policies.".to_string(),
            },
            QuizQuestion {
                id: 4,
                question: "How many Mythic-tier namespaces will EVER exist?".to_string(),
                options: vec![
                    "Unlimited (depends on demand)".to_string(),
                    "Exactly 3 (Genesis-locked supply)".to_string(),
                    "100 (expandable after Genesis)".to_string(),
                ],
                correct_answer: 1,
                explanation: "Mythic tier has a fixed supply of 3 namespaces. This supply is frozen at Genesis (2026-01-15 00:00:00 UTC). After Genesis, the supply is provably frozen via the Genesis snapshot uploaded to IPFS. No expansion is possible.".to_string(),
            },
            QuizQuestion {
                id: 5,
                question: "What is the Genesis ceremony?".to_string(),
                options: vec![
                    "A marketing event to promote the protocol".to_string(),
                    "One-time finalization that freezes all inventory on 2026-01-15".to_string(),
                    "The date when namespace issuance begins".to_string(),
                ],
                correct_answer: 1,
                explanation: "The Genesis ceremony is an automated, irreversible protocol event that occurs at exactly 2026-01-15 00:00:00 UTC. At Genesis, all tier supplies are frozen, a permanent snapshot is created and uploaded to IPFS, and the system transitions to post-Genesis state. This is not a marketing event—it is a cryptographic finalization.".to_string(),
            },
            QuizQuestion {
                id: 6,
                question: "Is a Sovereign Namespace a DNS domain?".to_string(),
                options: vec![
                    "Yes, it resolves to websites like .com domains".to_string(),
                    "No, it is a cryptographic certificate, not a domain".to_string(),
                    "Yes, but it uses blockchain instead of DNS servers".to_string(),
                ],
                correct_answer: 1,
                explanation: "A Sovereign Namespace is NOT a DNS domain. It does not resolve to websites. It is a Dilithium5-signed certificate stored on IPFS. It is not ENS, not Unstoppable Domains, not Handshake. It is a unique cryptographic artifact designed for identity and provenance, not DNS resolution.".to_string(),
            },
            QuizQuestion {
                id: 7,
                question: "What is the refund window for namespace issuances?".to_string(),
                options: vec![
                    "30 days (standard return policy)".to_string(),
                    "24 hours (payment void window only, certificate remains permanent)".to_string(),
                    "No refunds (all sales final)".to_string(),
                ],
                correct_answer: 1,
                explanation: "Payments have a 24-hour void window (automatic refund for payment failures). After 24 hours, payments enter dispute resolution (manual review required). HOWEVER: Certificates are ALWAYS permanent. Even if you receive a full refund, your namespace remains issued and cannot be reissued. The refund policy applies to payment, not to certificate permanence.".to_string(),
            },
        ]
    }

    /// Submit and grade quiz (must score 7/7 = 100%)
    pub async fn submit_quiz(
        &self,
        session_token: &str,
        submission: QuizSubmission,
    ) -> PaymentResult<QuizResult> {
        let session = self.get_session(session_token).await?;
        let questions = self.get_quiz_questions();

        if submission.answers.len() != questions.len() {
            return Err(PaymentError::InvalidInput(format!(
                "Expected {} answers, got {}",
                questions.len(),
                submission.answers.len()
            )));
        }

        let mut score = 0u8;
        let mut failed_questions = Vec::new();

        for (i, answer_idx) in submission.answers.iter().enumerate() {
            let question = &questions[i];
            if *answer_idx == question.correct_answer {
                score += 1;
            } else {
                failed_questions.push(QuizQuestionResult {
                    question_id: question.id,
                    question: question.question.clone(),
                    selected_answer: question
                        .options
                        .get(*answer_idx)
                        .cloned()
                        .unwrap_or_else(|| "Invalid selection".to_string()),
                    correct_answer: question.options[question.correct_answer].clone(),
                    explanation: question.explanation.clone(),
                });
            }
        }

        let total = questions.len() as u8;
        let passed = score == total;

        // Update session
        let new_attempts = session.quiz_attempts + 1;
        sqlx::query(
            "UPDATE practice_sessions
             SET quiz_score = ?, quiz_attempts = ?
             WHERE id = ?",
        )
        .bind(score as i32)
        .bind(new_attempts)
        .bind(&session.id)
        .execute(&self.db.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(format!("Failed to update quiz: {}", e)))?;

        // Log quiz attempt
        let failed_ids: String = failed_questions
            .iter()
            .map(|q| q.question_id.to_string())
            .collect::<Vec<_>>()
            .join(",");

        sqlx::query(
            "INSERT INTO practice_quiz_attempts (id, session_id, attempt_number, score, total_questions, failed_question_ids)
             VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&session.id)
        .bind(new_attempts)
        .bind(score as i32)
        .bind(total as i32)
        .bind(if failed_ids.is_empty() { None } else { Some(failed_ids) })
        .execute(&self.db.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(format!("Failed to log quiz attempt: {}", e)))?;

        // Log analytics
        let event_type = if passed { "quiz_passed" } else { "quiz_failed" };
        self.log_analytics_event(&session.id, event_type, None, Some(&format!("{{\"score\":{},\"total\":{}}}", score, total)))
            .await?;

        Ok(QuizResult {
            score,
            total,
            passed,
            failed_questions,
        })
    }

    // ------------------------------------------------------------------------
    // Completion Gate (Screen 8)
    // ------------------------------------------------------------------------

    /// Complete practice mode (requires phrase + email match)
    pub async fn complete_session(
        &self,
        session_token: &str,
        request: CompletionRequest,
    ) -> PaymentResult<String> {
        let session = self.get_session(session_token).await?;

        // Validate email is verified
        if !session.verified_email {
            return Err(PaymentError::InvalidInput(
                "Email not verified".to_string(),
            ));
        }

        // Validate quiz passed (7/7)
        if session.quiz_score != Some(7) {
            return Err(PaymentError::InvalidInput(
                "Quiz not passed (must score 7/7)".to_string(),
            ));
        }

        // Validate already completed
        if session.completed_at.is_some() {
            return Err(PaymentError::InvalidInput(
                "Session already completed".to_string(),
            ));
        }

        // Validate typed phrase (exact match, case-insensitive)
        let expected_phrase = "I understand this is permanent and cannot be reversed.";
        if request.typed_phrase.trim().to_lowercase() != expected_phrase.to_lowercase() {
            return Err(PaymentError::InvalidInput(
                "Typed phrase does not match exactly".to_string(),
            ));
        }

        // Validate email match
        if request.email_confirmation.trim().to_lowercase() != session.email.to_lowercase() {
            return Err(PaymentError::InvalidInput(
                "Email confirmation does not match".to_string(),
            ));
        }

        // Validate acknowledgement checkbox
        if !request.acknowledgement_checked {
            return Err(PaymentError::InvalidInput(
                "Acknowledgement checkbox must be checked".to_string(),
            ));
        }

        // Generate completion token
        let completion_token = Uuid::new_v4().to_string();

        // Mark as completed
        sqlx::query(
            "UPDATE practice_sessions
             SET completed_at = CURRENT_TIMESTAMP, completion_token = ?
             WHERE id = ?",
        )
        .bind(&completion_token)
        .bind(&session.id)
        .execute(&self.db.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(format!("Failed to complete session: {}", e)))?;

        // Log analytics
        self.log_analytics_event(&session.id, "completed", None, None)
            .await?;

        Ok(completion_token)
    }

    /// Get completion details by token
    pub async fn get_completion(
        &self,
        completion_token: &str,
    ) -> PaymentResult<PracticeSession> {
        let row = sqlx::query(
            "SELECT id, email, session_token, started_at, completed_at, quiz_score,
                    quiz_attempts, selected_tier, selected_identifier, mock_certificate_json,
                    completion_token, verified_email
             FROM practice_sessions
             WHERE completion_token = ?",
        )
        .bind(completion_token)
        .fetch_optional(&self.db.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(format!("Failed to fetch completion: {}", e)))?
        .ok_or_else(|| PaymentError::InvalidInput("Invalid completion token".to_string()))?;

        Ok(PracticeSession {
            id: row.try_get("id").map_err(|e| {
                PaymentError::DatabaseError(format!("Failed to parse id: {}", e))
            })?,
            email: row.try_get("email").map_err(|e| {
                PaymentError::DatabaseError(format!("Failed to parse email: {}", e))
            })?,
            session_token: row.try_get("session_token").map_err(|e| {
                PaymentError::DatabaseError(format!("Failed to parse session_token: {}", e))
            })?,
            started_at: row.try_get("started_at").map_err(|e| {
                PaymentError::DatabaseError(format!("Failed to parse started_at: {}", e))
            })?,
            completed_at: row.try_get("completed_at").ok(),
            quiz_score: row.try_get("quiz_score").ok(),
            quiz_attempts: row.try_get("quiz_attempts").unwrap_or(0),
            selected_tier: row.try_get("selected_tier").ok(),
            selected_identifier: row.try_get("selected_identifier").ok(),
            mock_certificate_json: row.try_get("mock_certificate_json").ok(),
            completion_token: row.try_get("completion_token").ok(),
            verified_email: row.try_get("verified_email").unwrap_or(false),
        })
    }

    // ------------------------------------------------------------------------
    // Analytics
    // ------------------------------------------------------------------------

    async fn log_analytics_event(
        &self,
        session_id: &str,
        event_type: &str,
        screen_number: Option<i32>,
        metadata: Option<&str>,
    ) -> PaymentResult<()> {
        sqlx::query(
            "INSERT INTO practice_analytics (id, event_type, session_id, screen_number, metadata)
             VALUES (?, ?, ?, ?, ?)",
        )
        .bind(Uuid::new_v4().to_string())
        .bind(event_type)
        .bind(session_id)
        .bind(screen_number)
        .bind(metadata)
        .execute(&self.db.pool)
        .await
        .map_err(|e| {
            PaymentError::DatabaseError(format!("Failed to log analytics: {}", e))
        })?;

        Ok(())
    }
}
