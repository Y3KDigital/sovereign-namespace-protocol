use thiserror::Error;

/// Core errors for the Sovereign Namespace Protocol
#[derive(Debug, Error)]
pub enum SnpError {
    #[error("Invalid genesis hash provided")]
    InvalidGenesis,

    #[error("Invalid sovereignty class transition: {0}")]
    InvalidSovereigntyTransition(String),

    #[error("Invalid signature")]
    InvalidSignature,

    #[error("Namespace mismatch: expected {expected}, got {actual}")]
    NamespaceMismatch { expected: String, actual: String },

    #[error("Determinism violation: {0}")]
    DeterminismViolation(String),

    #[error("Invalid label: {0}")]
    InvalidLabel(String),

    #[error("Invalid public key format")]
    InvalidPublicKey,

    #[error("Invalid secret key format")]
    InvalidSecretKey,

    #[error("Cryptographic operation failed: {0}")]
    CryptoError(String),

    #[error("Serialization error: {0}")]
    SerializationError(String),
}

pub type Result<T> = std::result::Result<T, SnpError>;
