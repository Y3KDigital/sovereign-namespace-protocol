use crate::errors::Result;

/// Abstract signature scheme interface
pub trait SignatureScheme {
    type PublicKey;
    type SecretKey;
    type Signature;

    /// Generate a keypair from a seed
    fn keypair(seed: &[u8]) -> Result<(Self::PublicKey, Self::SecretKey)>;

    /// Sign a message
    fn sign(sk: &Self::SecretKey, msg: &[u8]) -> Result<Self::Signature>;

    /// Verify a signature
    fn verify(pk: &Self::PublicKey, msg: &[u8], sig: &Self::Signature) -> bool;
}
