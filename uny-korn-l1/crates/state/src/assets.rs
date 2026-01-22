//! Asset registry: defines tradeable assets (UCRED, UUSD, GOLD, etc.)
//! 
//! Assets have no balances themselves—they are **denominations**.
//! Balances are tracked separately in the BalanceLedger module.

use anyhow::{anyhow, Result};
use blake3::Hasher;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Asset {
    /// Unique symbol (UCRED, UUSD, GOLD, FTH, MOG, etc.)
    pub symbol: String,
    /// Display decimals (18 = wei-style precision)
    pub decimals: u8,
    /// Optional policy URI (IPFS link to asset rules/legal docs)
    pub policy_uri: Option<String>,
}

#[derive(Debug, Default, Clone)]
pub struct AssetRegistry {
    assets: std::collections::BTreeMap<String, Asset>,
}

impl AssetRegistry {
    /// Register a new asset. Genesis only (or governance-gated in production).
    pub fn register_asset(&mut self, asset: Asset) -> Result<()> {
        let key = asset.symbol.trim().to_ascii_uppercase();
        if key.is_empty() {
            return Err(anyhow!("asset symbol cannot be empty"));
        }
        if self.assets.contains_key(&key) {
            return Err(anyhow!("asset already exists: {key}"));
        }
        self.assets.insert(key, asset);
        Ok(())
    }

    /// Retrieve asset metadata.
    pub fn get_asset(&self, symbol: &str) -> Option<&Asset> {
        self.assets.get(&symbol.trim().to_ascii_uppercase())
    }

    /// List all registered assets.
    pub fn list_assets(&self) -> Vec<Asset> {
        self.assets.values().cloned().collect()
    }

    /// Deterministic commitment hash over all assets.
    pub fn commitment_hash_hex(&self) -> String {
        const DOMAIN: &[u8] = b"uny-korn-state-assets-v1";

        let mut hasher = Hasher::new();
        hasher.update(DOMAIN);

        for (k, asset) in &self.assets {
            hasher.update(b"|");
            hasher.update(k.as_bytes());
            hasher.update(b"|");
            hasher.update(&[asset.decimals]);
            hasher.update(b"|");
            if let Some(uri) = &asset.policy_uri {
                hasher.update(uri.as_bytes());
            }
        }

        hex::encode(*hasher.finalize().as_bytes())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn register_and_retrieve_asset() {
        let mut registry = AssetRegistry::default();
        registry
            .register_asset(Asset {
                symbol: "UCRED".to_string(),
                decimals: 18,
                policy_uri: Some("ipfs://QmPolicy".to_string()),
            })
            .unwrap();

        let asset = registry.get_asset("ucred").unwrap();
        assert_eq!(asset.symbol, "UCRED");
        assert_eq!(asset.decimals, 18);
    }

    #[test]
    fn commitment_is_deterministic() {
        let mut a = AssetRegistry::default();
        a.register_asset(Asset {
            symbol: "UCRED".to_string(),
            decimals: 18,
            policy_uri: None,
        })
        .unwrap();
        a.register_asset(Asset {
            symbol: "UUSD".to_string(),
            decimals: 18,
            policy_uri: None,
        })
        .unwrap();

        let mut b = AssetRegistry::default();
        b.register_asset(Asset {
            symbol: "UUSD".to_string(),
            decimals: 18,
            policy_uri: None,
        })
        .unwrap();
        b.register_asset(Asset {
            symbol: "UCRED".to_string(),
            decimals: 18,
            policy_uri: None,
        })
        .unwrap();

        assert_eq!(a.commitment_hash_hex(), b.commitment_hash_hex());
    }
}
