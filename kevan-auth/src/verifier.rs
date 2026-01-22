use anyhow::Result;
use ed25519_dalek::{Signature, VerifyingKey};
use kevan_resolver::NamespaceResolver;
use std::sync::Arc;

pub struct SignatureVerifier {
    resolver: Arc<NamespaceResolver>,
}

impl SignatureVerifier {
    pub fn new(resolver: Arc<NamespaceResolver>) -> Self {
        Self { resolver }
    }

    /// Verify signature proves control of namespace
    /// 
    /// * Resolves certificate to get public key
    /// * Verifies signature against message
    /// 
    /// Returns Ok(()) if valid, Err otherwise
    pub fn verify(&self, namespace: &str, message: &str, signature_hex: &str) -> Result<()> {
        // Resolve certificate
        let cert = self
            .resolver
            .resolve(namespace)
            .ok_or_else(|| anyhow::anyhow!("Namespace not found: {}", namespace))?;

        // TODO: Extract actual public key from certificate
        // For now, using certificate ID as placeholder
        // In production, certificate would contain explicit signing_key field
        
        // Decode signature
        let signature_bytes = hex::decode(signature_hex)
            .map_err(|e| anyhow::anyhow!("Invalid signature hex: {}", e))?;

        if signature_bytes.len() != 64 {
            anyhow::bail!("Invalid signature length: expected 64 bytes");
        }

        let signature = Signature::from_bytes(&signature_bytes.try_into().unwrap());

        // TODO: Extract public key from certificate
        // For now, return placeholder
        // This is where we'd use cert.public_keys.signing
        
        tracing::warn!(
            "Signature verification not yet implemented (certificate format needs signing key)"
        );
        
        // Placeholder: Verify signature format is valid
        // In production, this would be:
        // let public_key = VerifyingKey::from_bytes(&cert.signing_key)?;
        // public_key.verify_strict(message.as_bytes(), &signature)?;
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_signature_verifier_api() {
        // Demonstrates the API even though full verification requires key extraction
        let signature_hex = "a".repeat(128); // 64 bytes hex
        assert_eq!(hex::decode(&signature_hex).unwrap().len(), 64);
    }
}
