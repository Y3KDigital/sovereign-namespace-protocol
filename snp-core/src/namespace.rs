use serde::{Deserialize, Serialize};
use crate::genesis::GenesisContext;
use crate::sovereignty::{SovereigntyClass, TransferPolicy};
use crate::crypto::hash::{sha3_256_domain, DOMAIN_NAMESPACE};
use crate::errors::{Result, SnpError};

/// Type alias for namespace identifiers
pub type NamespaceId = [u8; 32];

/// A namespace is a unique, deterministic identifier derived from:
/// - Genesis hash (protocol binding)
/// - Label (human-readable name)
/// - Sovereignty class (semantic constraints)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Namespace {
    /// The 32-byte namespace ID (SHA3-256 derived)
    #[serde(with = "hex_bytes")]
    pub id: [u8; 32],
    
    /// Human-readable label (e.g., "law.y3k" or "intake.law.y3k")
    pub label: String,
    
    /// Sovereignty class (set at creation, immutable)
    pub sovereignty: SovereigntyClass,
    
    /// Genesis context binding
    #[serde(with = "hex_bytes")]
    pub genesis_hash: [u8; 32],
    
    /// Parent namespace ID (if this is a subdomain)
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(with = "option_hex_bytes")]
    pub parent_id: Option<[u8; 32]>,
    
    /// Subdomain depth (0 = root, 1 = first level, etc.)
    #[serde(default)]
    pub depth: u8,
}

/// Subdomain delegation record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubdomainDelegation {
    /// The subdomain namespace
    pub subdomain: Namespace,
    
    /// The parent namespace that delegated it
    #[serde(with = "hex_bytes")]
    pub parent_id: [u8; 32],
    
    /// Delegatee (owner address or identity)
    pub delegatee: String,
    
    /// Delegation terms (lease, partnership, sale, etc.)
    pub terms: DelegationTerms,
    
    /// Timestamp of delegation
    pub delegated_at: u64,
    
    /// Optional expiration timestamp
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<u64>,
}

/// Delegation terms for a subdomain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DelegationTerms {
    /// Commercial lease with annual fee
    Lease {
        annual_fee: u64,
        currency: String, // "USD", "Y3K", etc.
    },
    
    /// Partnership delegation (no fee, strategic)
    Partnership {
        description: String,
    },
    
    /// One-time sale
    Sale {
        purchase_price: u64,
        currency: String,
    },
    
    /// Protocol grant (free allocation)
    ProtocolGrant {
        reason: String,
    },
}

impl Namespace {
    /// Derive a new namespace from genesis context, label, and sovereignty class
    /// 
    /// Formula: SHA3-256("SNP::NAMESPACE" || genesis_hash || label || sovereignty)
    pub fn derive(
        ctx: &GenesisContext,
        label: &str,
        sovereignty: SovereigntyClass,
    ) -> Result<Self> {
        // Validate genesis context
        ctx.validate()?;
        
        // Validate label
        Self::validate_label(label)?;
        
        // Compute namespace ID
        let id = sha3_256_domain(
            DOMAIN_NAMESPACE,
            &[
                &ctx.genesis_hash,
                label.as_bytes(),
                sovereignty.as_str().as_bytes(),
            ],
        );
        
        Ok(Self {
            id,
            label: label.to_string(),
            sovereignty,
            genesis_hash: ctx.genesis_hash,
            parent_id: None,
            depth: 0,
        })
    }
    
    /// Derive a subdomain from a parent namespace
    /// 
    /// Formula: SHA3-256("SNP::NAMESPACE" || genesis_hash || full_label || sovereignty || parent_id)
    pub fn derive_subdomain(
        parent: &Self,
        subdomain_label: &str,
        sovereignty: SovereigntyClass,
    ) -> Result<Self> {
        // Check if parent allows subdomain delegation
        let transfer_policy = parent.sovereignty.default_transfer_policy();
        if !transfer_policy.allows_subdomain_delegation() {
            return Err(SnpError::InvalidLabel(
                "Parent namespace does not allow subdomain delegation".to_string()
            ));
        }
        
        // Check maximum depth
        if let Some(max_depth) = transfer_policy.max_subdomain_depth() {
            if parent.depth >= max_depth {
                return Err(SnpError::InvalidLabel(
                    format!("Maximum subdomain depth of {} exceeded", max_depth)
                ));
            }
        }
        
        // Validate subdomain label
        Self::validate_label(subdomain_label)?;
        
        // Construct full label: subdomain.parent
        let full_label = format!("{}.{}", subdomain_label, parent.label);
        
        // Compute subdomain ID (includes parent_id for uniqueness)
        let ctx = GenesisContext::new(parent.genesis_hash);
        let id = sha3_256_domain(
            DOMAIN_NAMESPACE,
            &[
                &ctx.genesis_hash,
                full_label.as_bytes(),
                sovereignty.as_str().as_bytes(),
                &parent.id,
            ],
        );
        
        Ok(Self {
            id,
            label: full_label,
            sovereignty,
            genesis_hash: parent.genesis_hash,
            parent_id: Some(parent.id),
            depth: parent.depth + 1,
        })
    }
    
    /// Check if this namespace is a subdomain
    pub fn is_subdomain(&self) -> bool {
        self.parent_id.is_some()
    }
    
    /// Get the transfer policy for this namespace
    pub fn transfer_policy(&self) -> TransferPolicy {
        self.sovereignty.default_transfer_policy()
    }
    
    /// Parse a namespace label to extract components
    /// E.g., "intake.law.y3k" -> ["intake", "law", "y3k"]
    pub fn parse_label_components(&self) -> Vec<&str> {
        self.label.split('.').collect()
    }
    
    /// Get the root label (rightmost component)
    /// E.g., "intake.law.y3k" -> "y3k"
    pub fn root_label(&self) -> Option<&str> {
        self.parse_label_components().last().copied()
    }
    
    /// Get the immediate subdomain label (leftmost component)
    /// E.g., "intake.law.y3k" -> "intake"
    pub fn subdomain_label(&self) -> Option<&str> {
        self.parse_label_components().first().copied()
    }

    /// Validate a label according to protocol rules
    fn validate_label(label: &str) -> Result<()> {
        // Must not be empty
        if label.is_empty() {
            return Err(SnpError::InvalidLabel("Label cannot be empty".to_string()));
        }
        
        // Must be valid UTF-8 (already guaranteed by &str)
        // Must be reasonable length (1-256 characters)
        if label.len() > 256 {
            return Err(SnpError::InvalidLabel("Label too long (max 256 chars)".to_string()));
        }
        
        // Must not contain control characters
        if label.chars().any(|c| c.is_control()) {
            return Err(SnpError::InvalidLabel("Label contains control characters".to_string()));
        }
        
        Ok(())
    }

    /// Get the namespace ID as a hex string
    pub fn id_hex(&self) -> String {
        format!("0x{}", hex::encode(self.id))
    }

    /// Verify that this namespace was derived correctly
    pub fn verify(&self) -> Result<()> {
        // Re-derive and compare
        let ctx = GenesisContext::new(self.genesis_hash);
        let derived = Self::derive(&ctx, &self.label, self.sovereignty)?;
        
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

/// Custom serde module for Option<[u8; 32]> with hex encoding
mod option_hex_bytes {
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(bytes: &Option<[u8; 32]>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match bytes {
            Some(b) => serializer.serialize_str(&format!("0x{}", hex::encode(b))),
            None => serializer.serialize_none(),
        }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<[u8; 32]>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let opt: Option<String> = Option::deserialize(deserializer)?;
        match opt {
            Some(s) => {
                let s = s.strip_prefix("0x").unwrap_or(&s);
                let bytes = hex::decode(s).map_err(serde::de::Error::custom)?;
                
                if bytes.len() != 32 {
                    return Err(serde::de::Error::custom("Expected 32 bytes"));
                }

                let mut array = [0u8; 32];
                array.copy_from_slice(&bytes);
                Ok(Some(array))
            },
            None => Ok(None),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_namespace_derivation() {
        let genesis = GenesisContext::new([42u8; 32]);
        let ns = Namespace::derive(&genesis, "test.namespace", SovereigntyClass::Immutable).unwrap();
        
        assert_eq!(ns.label, "test.namespace");
        assert_eq!(ns.sovereignty, SovereigntyClass::Immutable);
        assert_eq!(ns.genesis_hash, genesis.genesis_hash);
    }

    #[test]
    fn test_namespace_determinism() {
        let genesis = GenesisContext::new([42u8; 32]);
        let ns1 = Namespace::derive(&genesis, "test", SovereigntyClass::Immutable).unwrap();
        let ns2 = Namespace::derive(&genesis, "test", SovereigntyClass::Immutable).unwrap();
        
        assert_eq!(ns1.id, ns2.id); // Deterministic
    }

    #[test]
    fn test_namespace_uniqueness() {
        let genesis = GenesisContext::new([42u8; 32]);
        let ns1 = Namespace::derive(&genesis, "test", SovereigntyClass::Immutable).unwrap();
        let ns2 = Namespace::derive(&genesis, "test", SovereigntyClass::Transferable).unwrap();
        
        assert_ne!(ns1.id, ns2.id); // Different sovereignty = different ID
    }

    #[test]
    fn test_label_validation() {
        let genesis = GenesisContext::new([42u8; 32]);
        
        // Empty label
        assert!(Namespace::derive(&genesis, "", SovereigntyClass::Immutable).is_err());
        
        // Too long
        let long_label = "a".repeat(257);
        assert!(Namespace::derive(&genesis, &long_label, SovereigntyClass::Immutable).is_err());
        
        // Valid label
        assert!(Namespace::derive(&genesis, "valid.namespace", SovereigntyClass::Immutable).is_ok());
    }

    #[test]
    fn test_namespace_verification() {
        let genesis = GenesisContext::new([42u8; 32]);
        let ns = Namespace::derive(&genesis, "test", SovereigntyClass::Immutable).unwrap();
        
        assert!(ns.verify().is_ok());
    }
}
