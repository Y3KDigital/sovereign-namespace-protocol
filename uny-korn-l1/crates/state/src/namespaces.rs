use anyhow::{anyhow, Result};
use blake3::Hasher;
use serde::{Deserialize, Serialize};

use crate::Address;

/// Namespaces grant authority only.
/// They never execute, mint, or hold value.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Namespace {
    /// e.g. "y3k"
    pub name: String,
    /// Governance/controller address
    pub controller: Address,
    /// Arbitrary metadata hash (IPFS/legal/doc bundle)
    pub metadata_hash: Option<String>,
}

#[derive(Debug, Default, Clone)]
pub struct NamespaceRegistry {
    namespaces: std::collections::BTreeMap<String, Namespace>,
}

impl NamespaceRegistry {
    /// Deterministic commitment hash over all namespaces.
    ///
    /// This is intended for consensus/state root construction, so it must never depend on
    /// wall-clock time, randomness, map iteration order, or JSON formatting.
    pub fn commitment_hash_hex(&self) -> String {
        const DOMAIN: &[u8] = b"uny-korn-state-namespaces-v1";

        let mut hasher = Hasher::new();
        hasher.update(DOMAIN);

        for (k, ns) in &self.namespaces {
            hasher.update(b"|");
            hasher.update(k.as_bytes());
            hasher.update(b"|");
            hasher.update(&ns.controller);
            hasher.update(b"|");
            if let Some(mh) = &ns.metadata_hash {
                hasher.update(mh.as_bytes());
            }
        }

        hex::encode(*hasher.finalize().as_bytes())
    }

    pub fn register_genesis_namespace(&mut self, ns: Namespace) -> Result<()> {
        let key = ns.name.trim().to_ascii_lowercase();
        if key.is_empty() {
            return Err(anyhow!("namespace name cannot be empty"));
        }
        if self.namespaces.contains_key(&key) {
            return Err(anyhow!("namespace already exists: {key}"));
        }
        self.namespaces.insert(key, ns);
        Ok(())
    }

    pub fn get(&self, name: &str) -> Option<&Namespace> {
        self.namespaces.get(&name.trim().to_ascii_lowercase())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn commitment_is_stable_and_order_independent() {
        let ns1 = Namespace {
            name: "Y3K".to_string(),
            controller: [1u8; 32],
            metadata_hash: Some("ipfs://abc".to_string()),
        };
        let ns2 = Namespace {
            name: "x".to_string(),
            controller: [2u8; 32],
            metadata_hash: None,
        };

        let mut a = NamespaceRegistry::default();
        a.register_genesis_namespace(ns1.clone()).unwrap();
        a.register_genesis_namespace(ns2.clone()).unwrap();

        let mut b = NamespaceRegistry::default();
        b.register_genesis_namespace(ns2).unwrap();
        b.register_genesis_namespace(ns1).unwrap();

        assert_eq!(a.commitment_hash_hex(), b.commitment_hash_hex());
    }
}
