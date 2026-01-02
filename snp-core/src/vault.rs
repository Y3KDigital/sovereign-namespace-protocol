use serde::{Deserialize, Serialize};
use crate::namespace::Namespace;
use crate::crypto::hash::{sha3_256_domain, DOMAIN_VAULT};
use crate::errors::Result;

/// Vault descriptor - a deterministically derived address for asset custody
/// 
/// Vaults are derived from:
/// - Namespace ID (authority binding)
/// - Asset fingerprint (what is stored)
/// - Policy hash (how it's controlled)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultDescriptor {
    /// The 32-byte vault ID (SHA3-256 derived)
    #[serde(with = "hex_bytes")]
    pub id: [u8; 32],
    
    /// Namespace this vault belongs to
    #[serde(with = "hex_bytes")]
    pub namespace_id: [u8; 32],
    
    /// Asset fingerprint (hash of asset metadata)
    #[serde(with = "hex_bytes")]
    pub asset_hash: [u8; 32],
    
    /// Policy hash (hash of access control rules)
    #[serde(with = "hex_bytes")]
    pub policy_hash: [u8; 32],
    
    /// Derivation index for multiple vaults
    pub derivation_index: u32,
}

impl VaultDescriptor {
    /// Derive a new vault from namespace, asset, and policy
    /// 
    /// Formula: SHA3-256("SNP::VAULT" || namespace_id || asset_hash || policy_hash || index)
    pub fn derive(
        namespace: &Namespace,
        asset_hash: [u8; 32],
        policy_hash: [u8; 32],
        derivation_index: u32,
    ) -> Result<Self> {
        let index_bytes = derivation_index.to_le_bytes();
        
        // Compute vault ID
        let id = sha3_256_domain(
            DOMAIN_VAULT,
            &[
                &namespace.id,
                &asset_hash,
                &policy_hash,
                &index_bytes,
            ],
        );
        
        Ok(Self {
            id,
            namespace_id: namespace.id,
            asset_hash,
            policy_hash,
            derivation_index,
        })
    }

    /// Get the vault ID as a hex string
    pub fn id_hex(&self) -> String {
        format!("0x{}", hex::encode(self.id))
    }

    /// Verify that this vault was derived correctly
    pub fn verify(&self, namespace: &Namespace) -> Result<()> {
        use crate::errors::SnpError;
        
        // Check namespace binding
        if self.namespace_id != namespace.id {
            return Err(SnpError::NamespaceMismatch {
                expected: format!("0x{}", hex::encode(namespace.id)),
                actual: format!("0x{}", hex::encode(self.namespace_id)),
            });
        }
        
        // Re-derive and compare
        let derived = Self::derive(
            namespace,
            self.asset_hash,
            self.policy_hash,
            self.derivation_index,
        )?;
        
        if derived.id != self.id {
            return Err(SnpError::NamespaceMismatch {
                expected: derived.id_hex(),
                actual: self.id_hex(),
            });
        }
        
        Ok(())
    }
}

/// Custom serde module for [u8; 32] with hex encoding
mod hex_bytes {
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(bytes: &[u8; 32], serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&format!("0x{}", hex::encode(bytes)))
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<[u8; 32], D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let s = s.strip_prefix("0x").unwrap_or(&s);
        let bytes = hex::decode(s).map_err(serde::de::Error::custom)?;
        
        if bytes.len() != 32 {
            return Err(serde::de::Error::custom("Expected 32 bytes"));
        }

        let mut array = [0u8; 32];
        array.copy_from_slice(&bytes);
        Ok(array)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::genesis::GenesisContext;
    use crate::sovereignty::SovereigntyClass;

    #[test]
    fn test_vault_derivation() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace = Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        
        let asset_hash = [1u8; 32];
        let policy_hash = [2u8; 32];
        
        let vault = VaultDescriptor::derive(&namespace, asset_hash, policy_hash, 0).unwrap();
        
        assert_eq!(vault.namespace_id, namespace.id);
        assert_eq!(vault.asset_hash, asset_hash);
        assert_eq!(vault.policy_hash, policy_hash);
        assert_eq!(vault.derivation_index, 0);
    }

    #[test]
    fn test_vault_determinism() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace = Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        
        let asset_hash = [1u8; 32];
        let policy_hash = [2u8; 32];
        
        let vault1 = VaultDescriptor::derive(&namespace, asset_hash, policy_hash, 0).unwrap();
        let vault2 = VaultDescriptor::derive(&namespace, asset_hash, policy_hash, 0).unwrap();
        
        assert_eq!(vault1.id, vault2.id); // Deterministic
    }

    #[test]
    fn test_vault_uniqueness() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace = Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        
        let asset_hash = [1u8; 32];
        let policy_hash = [2u8; 32];
        
        let vault1 = VaultDescriptor::derive(&namespace, asset_hash, policy_hash, 0).unwrap();
        let vault2 = VaultDescriptor::derive(&namespace, asset_hash, policy_hash, 1).unwrap();
        
        assert_ne!(vault1.id, vault2.id); // Different index = different ID
    }

    #[test]
    fn test_vault_verification() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace = Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        
        let vault = VaultDescriptor::derive(&namespace, [1u8; 32], [2u8; 32], 0).unwrap();
        
        assert!(vault.verify(&namespace).is_ok());
    }
}
