use crate::crypto::dilithium::DilithiumPublicKey;
use crate::crypto::hash::{sha3_256_domain, DOMAIN_IDENTITY};
use crate::errors::{Result, SnpError};
use crate::namespace::Namespace;
use serde::{Deserialize, Serialize};

/// An identity is a subject bound to a namespace with a post-quantum public key
///
/// Identities are derived deterministically from:
/// - Namespace ID (authority binding)
/// - Subject hash (unique identifier)
/// - Public key (cryptographic anchor)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Identity {
    /// The 32-byte identity ID (SHA3-256 derived)
    #[serde(with = "hex_bytes")]
    pub id: [u8; 32],

    /// Namespace this identity belongs to
    #[serde(with = "hex_bytes")]
    pub namespace_id: [u8; 32],

    /// Subject identifier (e.g., user ID, device ID)
    pub subject: String,

    /// Post-quantum public key (Dilithium5)
    pub public_key: DilithiumPublicKey,
}

impl Identity {
    /// Derive a new identity from a namespace, subject, and public key
    ///
    /// Formula: SHA3-256("SNP::IDENTITY" || namespace_id || subject_hash || public_key)
    pub fn derive(
        namespace: &Namespace,
        subject: &str,
        public_key: DilithiumPublicKey,
    ) -> Result<Self> {
        // Validate subject
        Self::validate_subject(subject)?;

        // Hash the subject for privacy
        let subject_hash = sha3_256_domain(b"SNP::SUBJECT", &[subject.as_bytes()]);

        // Compute identity ID
        let id = sha3_256_domain(
            DOMAIN_IDENTITY,
            &[&namespace.id, &subject_hash, public_key.as_bytes()],
        );

        Ok(Self {
            id,
            namespace_id: namespace.id,
            subject: subject.to_string(),
            public_key,
        })
    }

    /// Validate a subject identifier
    fn validate_subject(subject: &str) -> Result<()> {
        if subject.is_empty() {
            return Err(SnpError::InvalidLabel(
                "Subject cannot be empty".to_string(),
            ));
        }

        if subject.len() > 256 {
            return Err(SnpError::InvalidLabel(
                "Subject too long (max 256 chars)".to_string(),
            ));
        }

        Ok(())
    }

    /// Get the identity ID as a hex string
    pub fn id_hex(&self) -> String {
        format!("0x{}", hex::encode(self.id))
    }

    /// Verify that this identity was derived correctly
    pub fn verify(&self, namespace: &Namespace) -> Result<()> {
        // Check namespace binding
        if self.namespace_id != namespace.id {
            return Err(SnpError::NamespaceMismatch {
                expected: format!("0x{}", hex::encode(namespace.id)),
                actual: format!("0x{}", hex::encode(self.namespace_id)),
            });
        }

        // Re-derive and compare
        let derived = Self::derive(namespace, &self.subject, self.public_key.clone())?;

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
    use crate::crypto::dilithium::Dilithium5;
    use crate::crypto::traits::SignatureScheme;
    use crate::genesis::GenesisContext;
    use crate::sovereignty::SovereigntyClass;

    #[test]
    fn test_identity_derivation() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        let (pk, _sk) = Dilithium5::keypair(b"test seed").unwrap();

        let identity = Identity::derive(&namespace, "user@example.com", pk).unwrap();

        assert_eq!(identity.namespace_id, namespace.id);
        assert_eq!(identity.subject, "user@example.com");
    }

    #[test]
    fn test_identity_determinism() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        let (pk, _sk) = Dilithium5::keypair(b"test seed").unwrap();

        let id1 = Identity::derive(&namespace, "user", pk.clone()).unwrap();
        let id2 = Identity::derive(&namespace, "user", pk).unwrap();

        assert_eq!(id1.id, id2.id); // Deterministic
    }

    #[test]
    fn test_identity_verification() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        let (pk, _sk) = Dilithium5::keypair(b"test seed").unwrap();

        let identity = Identity::derive(&namespace, "user", pk).unwrap();

        assert!(identity.verify(&namespace).is_ok());
    }
}
