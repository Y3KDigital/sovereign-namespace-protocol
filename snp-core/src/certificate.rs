use crate::crypto::dilithium::{Dilithium5, DilithiumSecretKey, DilithiumSignature};
use crate::crypto::hash::{sha3_256_domain, DOMAIN_CERTIFICATE};
use crate::crypto::traits::SignatureScheme;
use crate::errors::Result;
use crate::identity::Identity;
use crate::namespace::Namespace;
use serde::{Deserialize, Serialize};

/// A certificate is a signed attestation binding identity to namespace
///
/// Certificates are verifiable artifacts that prove:
/// - Identity ownership
/// - Namespace authority
/// - Temporal validity
/// - Post-quantum signature
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Certificate {
    /// Subject identity ID
    #[serde(with = "hex_bytes")]
    pub subject: [u8; 32],

    /// Namespace ID
    #[serde(with = "hex_bytes")]
    pub namespace: [u8; 32],

    /// Claims root (hash of certificate claims)
    #[serde(with = "hex_bytes")]
    pub claims_root: [u8; 32],

    /// Issuance timestamp (Unix epoch seconds)
    pub issued_at: u64,

    /// Expiration timestamp (Unix epoch seconds, 0 = never expires)
    pub expires_at: u64,

    /// Dilithium5 signature over certificate contents
    pub signature: DilithiumSignature,
}

impl Certificate {
    /// Generate a new certificate for an identity
    pub fn generate(
        identity: &Identity,
        namespace: &Namespace,
        claims_root: [u8; 32],
        issued_at: u64,
        expires_at: u64,
        secret_key: &DilithiumSecretKey,
    ) -> Result<Self> {
        // Create unsigned certificate
        let cert = Self {
            subject: identity.id,
            namespace: namespace.id,
            claims_root,
            issued_at,
            expires_at,
            signature: DilithiumSignature::from_bytes(&vec![0u8; 4595]).unwrap(), // Placeholder
        };

        // Compute signing message
        let signing_message = cert.signing_message();

        // Sign with Dilithium5
        let signature = Dilithium5::sign(secret_key, &signing_message)?;

        Ok(Self { signature, ..cert })
    }

    /// Compute the message to be signed (deterministic)
    fn signing_message(&self) -> Vec<u8> {
        let mut msg = Vec::new();
        msg.extend_from_slice(DOMAIN_CERTIFICATE);
        msg.extend_from_slice(&self.subject);
        msg.extend_from_slice(&self.namespace);
        msg.extend_from_slice(&self.claims_root);
        msg.extend_from_slice(&self.issued_at.to_le_bytes());
        msg.extend_from_slice(&self.expires_at.to_le_bytes());
        msg
    }

    /// Verify the certificate signature
    pub fn verify(&self, identity: &Identity) -> Result<bool> {
        use crate::errors::SnpError;

        // Check identity binding
        if self.subject != identity.id {
            return Err(SnpError::NamespaceMismatch {
                expected: format!("0x{}", hex::encode(identity.id)),
                actual: format!("0x{}", hex::encode(self.subject)),
            });
        }

        // Compute signing message
        let signing_message = self.signing_message();

        // Verify signature
        let valid = Dilithium5::verify(&identity.public_key, &signing_message, &self.signature);

        Ok(valid)
    }

    /// Check if the certificate is currently valid (not expired)
    pub fn is_valid_at(&self, current_time: u64) -> bool {
        // Must be issued before current time
        if self.issued_at > current_time {
            return false;
        }

        // If expires_at is 0, never expires
        if self.expires_at == 0 {
            return true;
        }

        // Must not be expired
        current_time < self.expires_at
    }

    /// Compute the certificate hash (for IPFS storage)
    pub fn content_hash(&self) -> [u8; 32] {
        let json = serde_json::to_vec(self).unwrap();
        sha3_256_domain(DOMAIN_CERTIFICATE, &[&json])
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
    fn test_certificate_generation() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        let (pk, sk) = Dilithium5::keypair(b"test seed").unwrap();
        let identity = Identity::derive(&namespace, "user", pk).unwrap();

        let claims_root = [1u8; 32];
        let cert =
            Certificate::generate(&identity, &namespace, claims_root, 1000, 2000, &sk).unwrap();

        assert_eq!(cert.subject, identity.id);
        assert_eq!(cert.namespace, namespace.id);
        assert_eq!(cert.claims_root, claims_root);
    }

    #[test]
    fn test_certificate_verification() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        let (pk, sk) = Dilithium5::keypair(b"test seed").unwrap();
        let identity = Identity::derive(&namespace, "user", pk).unwrap();

        let cert =
            Certificate::generate(&identity, &namespace, [1u8; 32], 1000, 2000, &sk).unwrap();

        assert!(cert.verify(&identity).unwrap());
    }

    #[test]
    fn test_certificate_validity() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        let (pk, sk) = Dilithium5::keypair(b"test seed").unwrap();
        let identity = Identity::derive(&namespace, "user", pk).unwrap();

        let cert =
            Certificate::generate(&identity, &namespace, [1u8; 32], 1000, 2000, &sk).unwrap();

        assert!(!cert.is_valid_at(500)); // Before issuance
        assert!(cert.is_valid_at(1500)); // Within validity period
        assert!(!cert.is_valid_at(2500)); // After expiration
    }

    #[test]
    fn test_certificate_never_expires() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        let (pk, sk) = Dilithium5::keypair(b"test seed").unwrap();
        let identity = Identity::derive(&namespace, "user", pk).unwrap();

        let cert = Certificate::generate(&identity, &namespace, [1u8; 32], 1000, 0, &sk).unwrap();

        assert!(cert.is_valid_at(1000));
        assert!(cert.is_valid_at(u64::MAX)); // Never expires
    }
}
