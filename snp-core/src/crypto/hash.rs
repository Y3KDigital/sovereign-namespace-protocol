use sha3::{Digest, Sha3_256};

/// Domain separation tags for different hash operations
pub const DOMAIN_NAMESPACE: &[u8] = b"SNP::NAMESPACE";
pub const DOMAIN_IDENTITY: &[u8] = b"SNP::IDENTITY";
pub const DOMAIN_VAULT: &[u8] = b"SNP::VAULT";
pub const DOMAIN_CERTIFICATE: &[u8] = b"SNP::CERTIFICATE";

/// Compute SHA3-256 hash with domain separation
pub fn sha3_256_domain(domain: &[u8], data: &[&[u8]]) -> [u8; 32] {
    let mut hasher = Sha3_256::new();
    hasher.update(domain);
    for chunk in data {
        hasher.update(chunk);
    }
    hasher.finalize().into()
}

/// Compute SHA3-256 hash of concatenated data
pub fn sha3_256(data: &[&[u8]]) -> [u8; 32] {
    let mut hasher = Sha3_256::new();
    for chunk in data {
        hasher.update(chunk);
    }
    hasher.finalize().into()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sha3_256() {
        let data = b"test data";
        let hash1 = sha3_256(&[data]);
        let hash2 = sha3_256(&[data]);
        assert_eq!(hash1, hash2); // Deterministic
    }

    #[test]
    fn test_domain_separation() {
        let data = b"same data";
        let hash1 = sha3_256_domain(DOMAIN_NAMESPACE, &[data]);
        let hash2 = sha3_256_domain(DOMAIN_IDENTITY, &[data]);
        assert_ne!(hash1, hash2); // Different domains produce different hashes
    }
}
