use anyhow::{anyhow, Result};
use blake3::Hasher;
use serde::{Deserialize, Serialize};

const AUDIT_HASH_DOMAIN: &[u8] = b"uny-korn-audit-v1";

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct AuditMeta {
    /// Logical chain height. Should come from block header / consensus, not wall-clock time.
    #[serde(default)]
    pub height: u64,
    /// Optional logical tick/slot/round number.
    #[serde(default)]
    pub slot: u64,
}

/// One entry in the append-only audit log.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub seq: u64,
    pub prev_hash: String,
    pub hash: String,
    #[serde(default)]
    pub meta: AuditMeta,
    pub event_type: String,
    pub event_json: serde_json::Value,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct AuditLog {
    #[serde(default)]
    events: Vec<AuditEvent>,
}

impl AuditLog {
    pub fn last_hash(&self) -> String {
        self.events.last().map(|e| e.hash.clone()).unwrap_or_default()
    }

    pub fn append(&mut self, event_type: &str, event_json: serde_json::Value) -> Result<AuditEvent> {
        self.append_with_meta(AuditMeta::default(), event_type, event_json)
    }

    pub fn append_with_meta(
        &mut self,
        meta: AuditMeta,
        event_type: &str,
        event_json: serde_json::Value,
    ) -> Result<AuditEvent> {
        if event_type.trim().is_empty() {
            return Err(anyhow!("event_type cannot be empty"));
        }

        let seq = self.events.len() as u64 + 1;
        let prev_hash = self.last_hash();

        let event_json = canonicalize_json(&event_json);
        let meta_json = serde_json::to_value(&meta)?;
        let meta_json = canonicalize_json(&meta_json);

        let mut hasher = Hasher::new();
        hasher.update(AUDIT_HASH_DOMAIN);
        hasher.update(b"|");
        hasher.update(prev_hash.as_bytes());
        hasher.update(b"|");
        hasher.update(seq.to_string().as_bytes());
        hasher.update(b"|");
        hasher.update(serde_json::to_vec(&meta_json)?.as_slice());
        hasher.update(b"|");
        hasher.update(event_type.as_bytes());
        hasher.update(b"|");
        hasher.update(serde_json::to_vec(&event_json)?.as_slice());
        let hash = hex::encode(*hasher.finalize().as_bytes());

        let ev = AuditEvent {
            seq,
            prev_hash,
            hash,
            meta,
            event_type: event_type.to_string(),
            event_json,
        };

        self.events.push(ev.clone());
        Ok(ev)
    }

    pub fn iter(&self) -> impl Iterator<Item = &AuditEvent> {
        self.events.iter()
    }

    pub fn verify_chain(&self) -> Result<()> {
        let mut expected_prev = String::new();
        for ev in &self.events {
            if ev.prev_hash != expected_prev {
                return Err(anyhow!("broken hash chain at seq {}", ev.seq));
            }
            // recompute hash
            let event_json = canonicalize_json(&ev.event_json);
            let meta_json = serde_json::to_value(&ev.meta)?;
            let meta_json = canonicalize_json(&meta_json);
            let mut hasher = Hasher::new();
            hasher.update(AUDIT_HASH_DOMAIN);
            hasher.update(b"|");
            hasher.update(ev.prev_hash.as_bytes());
            hasher.update(b"|");
            hasher.update(ev.seq.to_string().as_bytes());
            hasher.update(b"|");
            hasher.update(serde_json::to_vec(&meta_json)?.as_slice());
            hasher.update(b"|");
            hasher.update(ev.event_type.as_bytes());
            hasher.update(b"|");
            hasher.update(serde_json::to_vec(&event_json)?.as_slice());
            let computed = hex::encode(*hasher.finalize().as_bytes());
            if computed != ev.hash {
                return Err(anyhow!("hash mismatch at seq {}", ev.seq));
            }
            expected_prev = ev.hash.clone();
        }
        Ok(())
    }
}

fn canonicalize_json(v: &serde_json::Value) -> serde_json::Value {
    match v {
        serde_json::Value::Null
        | serde_json::Value::Bool(_)
        | serde_json::Value::Number(_)
        | serde_json::Value::String(_) => v.clone(),
        serde_json::Value::Array(items) => {
            serde_json::Value::Array(items.iter().map(canonicalize_json).collect())
        }
        serde_json::Value::Object(map) => {
            let mut keys: Vec<&String> = map.keys().collect();
            keys.sort();

            let mut out = serde_json::Map::with_capacity(map.len());
            for k in keys {
                if let Some(val) = map.get(k) {
                    out.insert(k.clone(), canonicalize_json(val));
                }
            }
            serde_json::Value::Object(out)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn audit_chain_verifies_and_is_stable_across_key_order() {
        let mut a = AuditLog::default();
        let mut b = AuditLog::default();

        let meta = AuditMeta { height: 1, slot: 7 };

        a.append_with_meta(
            meta.clone(),
            "evt",
            serde_json::json!({"b": 1, "a": 2}),
        )
        .unwrap();
        b.append_with_meta(
            meta.clone(),
            "evt",
            serde_json::json!({"a": 2, "b": 1}),
        )
        .unwrap();

        assert_eq!(a.iter().next().unwrap().hash, b.iter().next().unwrap().hash);

        a.verify_chain().unwrap();
        b.verify_chain().unwrap();

        // Round-trip JSON should still verify.
        let bytes = serde_json::to_vec(&a).unwrap();
        let decoded: AuditLog = serde_json::from_slice(&bytes).unwrap();
        decoded.verify_chain().unwrap();
    }
}

