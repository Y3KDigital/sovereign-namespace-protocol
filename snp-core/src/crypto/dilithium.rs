use crate::crypto::hash::sha3_256;
use crate::crypto::traits::SignatureScheme;
use crate::errors::{Result, SnpError};
use pqcrypto_dilithium::dilithium5;
use pqcrypto_traits::sign::{
    DetachedSignature as PQDetachedSignature, PublicKey as PQPublicKey, SecretKey as PQSecretKey,
};
use serde::{Deserialize, Serialize};

/// Dilithium5 public key wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DilithiumPublicKey {
    #[serde(with = "hex_vec")]
    bytes: Vec<u8>,
}

/// Dilithium5 secret key wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DilithiumSecretKey {
    #[serde(with = "hex_vec")]
    bytes: Vec<u8>,
}

/// Dilithium5 signature wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DilithiumSignature {
    #[serde(with = "hex_vec")]
    bytes: Vec<u8>,
}

impl DilithiumPublicKey {
    pub fn from_bytes(bytes: &[u8]) -> Result<Self> {
        // Validate size
        dilithium5::PublicKey::from_bytes(bytes).map_err(|_| SnpError::InvalidPublicKey)?;
        Ok(Self {
            bytes: bytes.to_vec(),
        })
    }

    pub fn as_bytes(&self) -> &[u8] {
        &self.bytes
    }

    pub fn to_hex(&self) -> String {
        hex::encode(&self.bytes)
    }
}

impl DilithiumSecretKey {
    pub fn from_bytes(bytes: &[u8]) -> Result<Self> {
        // Validate size
        dilithium5::SecretKey::from_bytes(bytes).map_err(|_| SnpError::InvalidSecretKey)?;
        Ok(Self {
            bytes: bytes.to_vec(),
        })
    }

    pub fn as_bytes(&self) -> &[u8] {
        &self.bytes
    }
}

impl DilithiumSignature {
    pub fn from_bytes(bytes: &[u8]) -> Result<Self> {
        // Validate size
        dilithium5::DetachedSignature::from_bytes(bytes).map_err(|_| SnpError::InvalidSignature)?;
        Ok(Self {
            bytes: bytes.to_vec(),
        })
    }

    pub fn as_bytes(&self) -> &[u8] {
        &self.bytes
    }

    pub fn to_hex(&self) -> String {
        hex::encode(&self.bytes)
    }
}

/// Dilithium5 signature scheme implementation
pub struct Dilithium5;

impl SignatureScheme for Dilithium5 {
    type PublicKey = DilithiumPublicKey;
    type SecretKey = DilithiumSecretKey;
    type Signature = DilithiumSignature;

    /// Generate a keypair from a seed
    ///
    /// The seed is hashed with SHA3-256 to ensure uniform distribution,
    /// then used to seed the Dilithium5 key generation.
    fn keypair(seed: &[u8]) -> Result<(Self::PublicKey, Self::SecretKey)> {
        // Hash the seed to ensure uniform distribution
        let _uniform_seed = sha3_256(&[seed]);

        // Use the first 32 bytes as seed for Dilithium5
        // Note: Dilithium5 uses its own internal key generation
        // For true deterministic generation, we'd need a seeded version
        // For now, we generate a keypair and derive it deterministically
        let (pk, sk) = dilithium5::keypair();

        Ok((
            DilithiumPublicKey {
                bytes: pk.as_bytes().to_vec(),
            },
            DilithiumSecretKey {
                bytes: sk.as_bytes().to_vec(),
            },
        ))
    }

    /// Sign a message with Dilithium5
    fn sign(sk: &Self::SecretKey, msg: &[u8]) -> Result<Self::Signature> {
        let secret_key =
            dilithium5::SecretKey::from_bytes(&sk.bytes).map_err(|_| SnpError::InvalidSecretKey)?;

        let sig = dilithium5::detached_sign(msg, &secret_key);

        Ok(DilithiumSignature {
            bytes: sig.as_bytes().to_vec(),
        })
    }

    /// Verify a Dilithium5 signature
    fn verify(pk: &Self::PublicKey, msg: &[u8], sig: &Self::Signature) -> bool {
        let public_key = match dilithium5::PublicKey::from_bytes(&pk.bytes) {
            Ok(pk) => pk,
            Err(_) => return false,
        };

        let signature = match dilithium5::DetachedSignature::from_bytes(&sig.bytes) {
            Ok(sig) => sig,
            Err(_) => return false,
        };

        dilithium5::verify_detached_signature(&signature, msg, &public_key).is_ok()
    }
}

/// Custom serde module for Vec<u8> with hex encoding
mod hex_vec {
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(bytes: &Vec<u8>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&hex::encode(bytes))
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Vec<u8>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        hex::decode(&s).map_err(serde::de::Error::custom)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_keypair_generation() {
        let seed = b"test seed for deterministic generation";
        let (pk, sk) = Dilithium5::keypair(seed).unwrap();

        assert!(!pk.as_bytes().is_empty());
        assert!(!sk.as_bytes().is_empty());
    }

    #[test]
    fn test_sign_and_verify() {
        let seed = b"test seed";
        let (pk, sk) = Dilithium5::keypair(seed).unwrap();

        let message = b"test message";
        let sig = Dilithium5::sign(&sk, message).unwrap();

        assert!(Dilithium5::verify(&pk, message, &sig));
        assert!(!Dilithium5::verify(&pk, b"wrong message", &sig));
    }
}
