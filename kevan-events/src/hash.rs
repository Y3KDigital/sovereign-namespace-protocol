use sha2::{Sha256, Digest};

/// Compute deterministic event ID from event components
pub fn compute_event_id(
    actor: &str,
    event_type: &str,
    payload: &str,
    timestamp: &str,
) -> String {
    let mut hasher = Sha256::new();
    hasher.update(actor.as_bytes());
    hasher.update(b"||");
    hasher.update(event_type.as_bytes());
    hasher.update(b"||");
    hasher.update(payload.as_bytes());
    hasher.update(b"||");
    hasher.update(timestamp.as_bytes());
    
    let result = hasher.finalize();
    hex::encode(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deterministic_hash() {
        let id1 = compute_event_id("kevan.x", "auth.login", "{}", "2026-01-17T00:00:00Z");
        let id2 = compute_event_id("kevan.x", "auth.login", "{}", "2026-01-17T00:00:00Z");
        assert_eq!(id1, id2);
    }

    #[test]
    fn test_different_inputs_produce_different_hashes() {
        let id1 = compute_event_id("kevan.x", "auth.login", "{}", "2026-01-17T00:00:00Z");
        let id2 = compute_event_id("kevan.x", "auth.logout", "{}", "2026-01-17T00:00:00Z");
        assert_ne!(id1, id2);
    }

    #[test]
    fn test_hash_length() {
        let id = compute_event_id("kevan.x", "auth.login", "{}", "2026-01-17T00:00:00Z");
        assert_eq!(id.len(), 64); // SHA256 = 32 bytes = 64 hex chars
    }
}
