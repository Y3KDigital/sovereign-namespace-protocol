use crate::errors::{Result, SnpError};
use serde::{Deserialize, Serialize};

/// Genesis context - the immutable root of all protocol authority
///
/// Everything in SNP is bound to exactly one genesis hash.
/// This is the SHA3-256 output from the genesis ceremony.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct GenesisContext {
    /// The 32-byte genesis hash from the ceremony
    #[serde(with = "hex_bytes")]
    pub genesis_hash: [u8; 32],
}

impl GenesisContext {
    /// Create a new genesis context from a 32-byte hash
    pub fn new(genesis_hash: [u8; 32]) -> Self {
        Self { genesis_hash }
    }

    /// Create from a hex string (with or without 0x prefix)
    pub fn from_hex(hex_str: &str) -> Result<Self> {
        let hex_str = hex_str.strip_prefix("0x").unwrap_or(hex_str);
        let bytes = hex::decode(hex_str).map_err(|_| SnpError::InvalidGenesis)?;

        if bytes.len() != 32 {
            return Err(SnpError::InvalidGenesis);
        }

        let mut hash = [0u8; 32];
        hash.copy_from_slice(&bytes);
        Ok(Self::new(hash))
    }

    /// Convert to hex string with 0x prefix
    pub fn to_hex(&self) -> String {
        format!("0x{}", hex::encode(self.genesis_hash))
    }

    /// Validate that this genesis context is well-formed
    /// (All non-zero check - prevents accidental use of default values)
    pub fn validate(&self) -> Result<()> {
        if self.genesis_hash.iter().all(|&b| b == 0) {
            return Err(SnpError::DeterminismViolation(
                "Genesis hash cannot be all zeros".to_string(),
            ));
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
    fn test_genesis_context_creation() {
        let hash = [42u8; 32];
        let ctx = GenesisContext::new(hash);
        assert_eq!(ctx.genesis_hash, hash);
    }

    #[test]
    fn test_genesis_from_hex() {
        let hex_str = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        let ctx = GenesisContext::from_hex(hex_str).unwrap();
        assert_eq!(ctx.to_hex(), hex_str);
    }

    #[test]
    fn test_genesis_validation() {
        let zero_ctx = GenesisContext::new([0u8; 32]);
        assert!(zero_ctx.validate().is_err());

        let valid_ctx = GenesisContext::new([42u8; 32]);
        assert!(valid_ctx.validate().is_ok());
    }
}
