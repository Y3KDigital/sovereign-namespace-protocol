use crate::crypto::hash::{sha3_256_domain, DOMAIN_NAMESPACE};
use crate::errors::{Result, SnpError};
use crate::genesis::GenesisContext;
use crate::sovereignty::SovereigntyClass;
use serde::{Deserialize, Serialize};

/// A namespace is a unique, deterministic identifier derived from:
/// - Genesis hash (protocol binding)
/// - Label (human-readable name)
/// - Sovereignty class (semantic constraints)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Namespace {
    /// The 32-byte namespace ID (SHA3-256 derived)
    #[serde(with = "hex_bytes")]
    pub id: [u8; 32],

    /// Human-readable label
    pub label: String,

    /// Sovereignty class (set at creation, immutable)
    pub sovereignty: SovereigntyClass,

    /// Genesis context binding
    #[serde(with = "hex_bytes")]
    pub genesis_hash: [u8; 32],
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
        })
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
            return Err(SnpError::InvalidLabel(
                "Label too long (max 256 chars)".to_string(),
            ));
        }

        // Must not contain control characters
        if label.chars().any(|c| c.is_control()) {
            return Err(SnpError::InvalidLabel(
                "Label contains control characters".to_string(),
            ));
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_namespace_derivation() {
        let genesis = GenesisContext::new([42u8; 32]);
        let ns =
            Namespace::derive(&genesis, "test.namespace", SovereigntyClass::Immutable).unwrap();

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
        assert!(
            Namespace::derive(&genesis, "valid.namespace", SovereigntyClass::Immutable).is_ok()
        );
    }

    #[test]
    fn test_namespace_verification() {
        let genesis = GenesisContext::new([42u8; 32]);
        let ns = Namespace::derive(&genesis, "test", SovereigntyClass::Immutable).unwrap();

        assert!(ns.verify().is_ok());
    }
}
