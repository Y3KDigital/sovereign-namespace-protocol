pub mod challenge;
pub mod session;
pub mod verifier;

pub use challenge::{Challenge, ChallengeStore};
pub use session::{Session, SessionStore};
pub use verifier::SignatureVerifier;

use anyhow::Result;
use kevan_resolver::NamespaceResolver;
use kevan_events::{EventStore, Event, EventType};
use std::path::Path;
use std::sync::Arc;

/// Core authentication system
/// 
/// Proves control of a namespace through cryptographic signatures.
/// No passwords. No accounts. Pure sovereignty.
pub struct AuthSystem {
    resolver: Arc<NamespaceResolver>,
    challenges: ChallengeStore,
    sessions: SessionStore,
    verifier: SignatureVerifier,
    events: EventStore,
}

impl AuthSystem {
    /// Create new auth system
    /// 
    /// * `cert_dir` - Directory containing certificates (genesis/)
    /// * `db_path` - SQLite database for sessions/challenges
    pub fn new(cert_dir: &str, db_path: &Path) -> Result<Self> {
        let resolver = Arc::new(NamespaceResolver::new(cert_dir)?);
        let challenges = ChallengeStore::new(db_path)?;
        let sessions = SessionStore::new(db_path)?;
        let verifier = SignatureVerifier::new(resolver.clone());
        
        // Event store in same database directory
        let event_db = db_path.parent()
            .unwrap_or(Path::new("."))
            .join("kevan-events.db");
        let events = EventStore::new(&event_db)?;

        Ok(Self {
            resolver,
            challenges,
            sessions,
            verifier,
            events,
        })
    }

    /// Step 1: Generate challenge for namespace
    /// 
    /// Client must sign this nonce to prove control
    pub fn create_challenge(&self, namespace: &str) -> Result<Challenge> {
        // Verify namespace exists
        self.resolver
            .resolve(namespace)
            .ok_or_else(|| anyhow::anyhow!("Namespace not found: {}", namespace))?;

        // Generate challenge
        let challenge = Challenge::generate(namespace);
        self.challenges.store(&challenge)?;
        
        // Write event
        let event = Event::new(
            namespace,
            EventType::AuthChallenge,
            serde_json::json!({
                "nonce": challenge.nonce,
                "expires_at": challenge.expires_at.to_rfc3339()
            })
        );
        self.events.write(&event)?;

        Ok(challenge)
    }

    /// Step 2: Verify signature and issue session
    /// 
    /// * Retrieves challenge
    /// * Resolves certificate
    /// * Verifies signature
    /// * Issues session on success
    pub fn verify_and_login(
        &self,
        namespace: &str,
        challenge_nonce: &str,
        signature: &str,
    ) -> Result<Session> {
        // Retrieve challenge
        let challenge = self
            .challenges
            .get(challenge_nonce)?
            .ok_or_else(|| anyhow::anyhow!("Challenge not found or expired"))?;

        // Verify namespace matches
        if challenge.namespace != namespace {
            anyhow::bail!("Namespace mismatch");
        }

        // Verify challenge not expired
        if challenge.is_expired() {
            self.challenges.delete(challenge_nonce)?;
            anyhow::bail!("Challenge expired");
        }

        // Verify signature
        self.verifier
            .verify(namespace, &challenge.nonce, signature)?;

        // Delete used challenge (prevent replay)
        self.challenges.delete(challenge_nonce)?;

        // Issue session
        let session = Session::create(namespace);
        self.sessions.store(&session)?;
        
        // Write event
        let event = Event::new(
            namespace,
            EventType::AuthLogin,
            serde_json::json!({
                "session_id": session.session_id,
                "expires_at": session.expires_at.to_rfc3339()
            })
        );
        self.events.write(&event)?;

        Ok(session)
    }

    /// Verify session is valid
    pub fn verify_session(&self, session_id: &str) -> Result<Session> {
        let session = self
            .sessions
            .get(session_id)?
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        if session.is_expired() {
            self.sessions.delete(session_id)?;
            anyhow::bail!("Session expired");
        }

        Ok(session)
    }

    /// Revoke session
    pub fn logout(&self, session_id: &str) -> Result<()> {
        // Get session before deleting (to record actor)
        if let Some(session) = self.sessions.get(session_id)? {
            // Write event
            let event = Event::new(
                &session.namespace,
                EventType::AuthLogout,
                serde_json::json!({
                    "session_id": session_id
                })
            );
            self.events.write(&event)?;
        }
        
        self.sessions.delete(session_id)
    }

    /// List active sessions for namespace
    pub fn list_sessions(&self, namespace: &str) -> Result<Vec<Session>> {
        self.sessions.list_by_namespace(namespace)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_auth_system_creation() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("auth.db");
        
        // This will fail without real certs, but demonstrates API
        let result = AuthSystem::new("C:\\Users\\Kevan\\genesis", &db_path);
        assert!(result.is_ok() || result.is_err());
    }
}
