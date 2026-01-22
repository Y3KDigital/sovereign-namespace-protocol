use chrono::{DateTime, Duration, Utc};
use rand::Rng;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::path::Path;

const CHALLENGE_EXPIRY_MINUTES: i64 = 5;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Challenge {
    pub nonce: String,
    pub namespace: String,
    pub issued_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl Challenge {
    /// Generate new challenge for namespace
    pub fn generate(namespace: &str) -> Self {
        let nonce = generate_nonce();
        let issued_at = Utc::now();
        let expires_at = issued_at + Duration::minutes(CHALLENGE_EXPIRY_MINUTES);

        Self {
            nonce,
            namespace: namespace.to_string(),
            issued_at,
            expires_at,
        }
    }

    /// Check if challenge has expired
    pub fn is_expired(&self) -> bool {
        Utc::now() > self.expires_at
    }

    /// Get message to sign
    /// 
    /// Format: "kevan.x challenges you to sign: abc123 at 2026-01-17T14:30:00Z"
    pub fn message(&self) -> String {
        format!(
            "{} challenges you to sign: {} at {}",
            self.namespace,
            self.nonce,
            self.issued_at.to_rfc3339()
        )
    }
}

pub struct ChallengeStore {
    db_path: String,
}

impl ChallengeStore {
    pub fn new(db_path: &Path) -> anyhow::Result<Self> {
        let db_path_str = db_path.to_string_lossy().to_string();
        let store = Self {
            db_path: db_path_str,
        };

        store.init_db()?;
        Ok(store)
    }

    fn init_db(&self) -> anyhow::Result<()> {
        let conn = Connection::open(&self.db_path)?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS challenges (
                nonce TEXT PRIMARY KEY,
                namespace TEXT NOT NULL,
                issued_at TEXT NOT NULL,
                expires_at TEXT NOT NULL
            )",
            [],
        )?;

        // Index for cleanup
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_challenges_expires 
             ON challenges(expires_at)",
            [],
        )?;

        Ok(())
    }

    pub fn store(&self, challenge: &Challenge) -> anyhow::Result<()> {
        let conn = Connection::open(&self.db_path)?;
        conn.execute(
            "INSERT INTO challenges (nonce, namespace, issued_at, expires_at)
             VALUES (?1, ?2, ?3, ?4)",
            params![
                challenge.nonce,
                challenge.namespace,
                challenge.issued_at.to_rfc3339(),
                challenge.expires_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn get(&self, nonce: &str) -> anyhow::Result<Option<Challenge>> {
        let conn = Connection::open(&self.db_path)?;
        let mut stmt = conn.prepare(
            "SELECT nonce, namespace, issued_at, expires_at 
             FROM challenges WHERE nonce = ?1",
        )?;

        let result = stmt.query_row(params![nonce], |row| {
            Ok(Challenge {
                nonce: row.get(0)?,
                namespace: row.get(1)?,
                issued_at: row.get::<_, String>(2)?.parse().unwrap(),
                expires_at: row.get::<_, String>(3)?.parse().unwrap(),
            })
        });

        match result {
            Ok(challenge) => Ok(Some(challenge)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.into()),
        }
    }

    pub fn delete(&self, nonce: &str) -> anyhow::Result<()> {
        let conn = Connection::open(&self.db_path)?;
        conn.execute("DELETE FROM challenges WHERE nonce = ?1", params![nonce])?;
        Ok(())
    }

    /// Clean up expired challenges
    pub fn cleanup_expired(&self) -> anyhow::Result<usize> {
        let conn = Connection::open(&self.db_path)?;
        let now = Utc::now().to_rfc3339();
        let deleted = conn.execute(
            "DELETE FROM challenges WHERE expires_at < ?1",
            params![now],
        )?;
        Ok(deleted)
    }
}

/// Generate cryptographically secure random nonce
fn generate_nonce() -> String {
    let mut rng = rand::thread_rng();
    let bytes: [u8; 32] = rng.gen();
    hex::encode(bytes)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_challenge_generation() {
        let challenge = Challenge::generate("kevan.x");
        assert_eq!(challenge.namespace, "kevan.x");
        assert!(!challenge.is_expired());
        assert_eq!(challenge.nonce.len(), 64); // 32 bytes hex
    }

    #[test]
    fn test_challenge_message() {
        let challenge = Challenge::generate("kevan.x");
        let msg = challenge.message();
        assert!(msg.contains("kevan.x"));
        assert!(msg.contains(&challenge.nonce));
    }

    #[test]
    fn test_challenge_store() -> anyhow::Result<()> {
        let dir = tempdir()?;
        let db_path = dir.path().join("test.db");
        let store = ChallengeStore::new(&db_path)?;

        let challenge = Challenge::generate("kevan.x");
        store.store(&challenge)?;

        let retrieved = store.get(&challenge.nonce)?;
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().namespace, "kevan.x");

        store.delete(&challenge.nonce)?;
        let deleted = store.get(&challenge.nonce)?;
        assert!(deleted.is_none());

        Ok(())
    }
}
