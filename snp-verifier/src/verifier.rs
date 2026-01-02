use crate::types::{Certificate, VerificationResult};
use sha3::{Digest, Sha3_256};

/// Stateless namespace verifier (implements STATELESS_VERIFIER.md)
pub struct NamespaceVerifier;

impl NamespaceVerifier {
    /// Verify a namespace certificate completely
    /// 
    /// Requires only:
    /// - certificate: The namespace certificate
    /// - genesis_hash: The genesis ceremony hash (32 bytes, public)
    /// 
    /// Returns VerificationResult with 6 verification checks:
    /// 1. Genesis binding
    /// 2. Identity derivation
    /// 3. Lineage proof
    /// 4. Rarity calculation
    /// 5. Signature
    /// 6. IPFS content hash
    pub fn verify_complete(
        certificate: &Certificate,
        genesis_hash: &[u8; 32],
    ) -> VerificationResult {
        let mut result = VerificationResult {
            genesis_binding: Self::verify_genesis_binding(certificate, genesis_hash),
            identity: Self::verify_identity(certificate),
            lineage: Self::verify_lineage(certificate),
            ..Default::default()
        };

        // Step 4: Verify rarity calculation
        result.rarity = Self::verify_rarity(certificate);

        // Step 5: Verify signature
        result.signature = Self::verify_signature(certificate);

        // Step 6: Verify IPFS content hash
        result.ipfs = Self::verify_ipfs(certificate);

        result
    }

    /// Step 1: Verify genesis binding (MUST match provided genesis_hash)
    fn verify_genesis_binding(cert: &Certificate, genesis_hash: &[u8; 32]) -> bool {
        cert.identity.genesis_hash == *genesis_hash
    }

    /// Step 2: Verify namespace hash derivation (from NAMESPACE_OBJECT.md)
    fn verify_identity(cert: &Certificate) -> bool {
        let mut hasher = Sha3_256::new();

        // Domain separation (from spec)
        hasher.update(b"web3-rarity-namespace-v1");

        // Genesis binding (ensures uniqueness to this genesis)
        hasher.update(cert.identity.genesis_hash);

        // Parent binding (ensures lineage)
        hasher.update(cert.lineage.parent_hash);

        // ID binding
        hasher.update(cert.identity.namespace_id.as_bytes());

        // Block binding (temporal uniqueness)
        hasher.update(cert.creation.block_number.to_le_bytes());

        // Entropy (prevents prediction)
        hasher.update(cert.creation.entropy);

        let computed_hash: [u8; 32] = hasher.finalize().into();

        // Must match certificate hash
        computed_hash == cert.identity.namespace_hash
    }

    /// Step 3: Verify Merkle lineage proof
    fn verify_lineage(cert: &Certificate) -> bool {
        let mut current = cert.identity.namespace_hash;

        // Walk up the Merkle tree
        for node in &cert.lineage.merkle_proof.path {
            current = match node.position.as_str() {
                "left" => Self::hash_pair(&node.hash, &current),
                "right" => Self::hash_pair(&current, &node.hash),
                _ => return false,
            };
        }

        // Root must match genesis commitment
        current == cert.lineage.merkle_proof.root_hash
    }

    /// Step 4: Verify rarity calculation (from NAMESPACE_OBJECT.md)
    fn verify_rarity(cert: &Certificate) -> bool {
        let components = &cert.rarity.components;

        // Recompute rarity score (formula from spec)
        let computed_score = components.position_rarity * 200.0
            + components.pattern_rarity * 300.0
            + components.hash_entropy * 100.0
            + components.temporal_rarity * 150.0
            + components.structural_rarity * 250.0;

        // Allow 0.1 point tolerance for floating-point
        (computed_score - cert.rarity.score).abs() < 0.1
    }

    /// Step 5: Verify certificate signature (post-quantum)
    fn verify_signature(cert: &Certificate) -> bool {
        // Create signing message
        let message = Self::create_signing_message(cert);

        // Verify using post-quantum signature
        match cert.signature.scheme.as_str() {
            "Dilithium5" => Self::verify_dilithium5(
                &cert.signature.public_key,
                &message,
                &cert.signature.signature,
            ),
            "SphincsPlus" => Self::verify_sphincs_plus(
                &cert.signature.public_key,
                &message,
                &cert.signature.signature,
            ),
            _ => false,
        }
    }

    /// Step 6: Verify IPFS content hash
    fn verify_ipfs(cert: &Certificate) -> bool {
        // Hash certificate content
        let cert_bytes = match serde_json::to_vec(cert) {
            Ok(bytes) => bytes,
            Err(_) => return false,
        };

        let mut hasher = Sha3_256::new();
        hasher.update(&cert_bytes);
        let computed_hash: [u8; 32] = hasher.finalize().into();

        // Must match stored content hash
        computed_hash == cert.ipfs.content_hash
    }

    // Helper: Hash pair for Merkle tree
    fn hash_pair(left: &[u8; 32], right: &[u8; 32]) -> [u8; 32] {
        let mut hasher = Sha3_256::new();
        hasher.update(left);
        hasher.update(right);
        hasher.finalize().into()
    }

    // Helper: Create signing message
    fn create_signing_message(cert: &Certificate) -> Vec<u8> {
        let mut message = Vec::new();
        message.extend_from_slice(&cert.identity.namespace_hash);
        message.extend_from_slice(&cert.lineage.parent_hash);
        message.extend_from_slice(&cert.creation.block_number.to_le_bytes());
        message.extend_from_slice(&cert.creation.timestamp.to_le_bytes());
        message.extend_from_slice(cert.sovereignty.owner_public_key.as_bytes());
        message
    }

    // Helper: Verify Dilithium5 signature
    fn verify_dilithium5(public_key_hex: &str, message: &[u8], signature_hex: &str) -> bool {
        use pqcrypto_dilithium::dilithium5;
        use pqcrypto_traits::sign::{PublicKey as PQPublicKey, DetachedSignature as PQDetachedSignature};

        // Decode hex strings
        let pk_bytes = match hex::decode(public_key_hex.strip_prefix("0x").unwrap_or(public_key_hex)) {
            Ok(bytes) => bytes,
            Err(_) => return false,
        };

        let sig_bytes = match hex::decode(signature_hex.strip_prefix("0x").unwrap_or(signature_hex)) {
            Ok(bytes) => bytes,
            Err(_) => return false,
        };

        // Validate sizes
        if pk_bytes.len() != dilithium5::public_key_bytes() {
            return false;
        }
        if sig_bytes.len() != dilithium5::signature_bytes() {
            return false;
        }

        // Create key and signature from bytes using trait methods
        let public_key = match dilithium5::PublicKey::from_bytes(&pk_bytes) {
            Ok(pk) => pk,
            Err(_) => return false,
        };
        
        let signature = match dilithium5::DetachedSignature::from_bytes(&sig_bytes) {
            Ok(sig) => sig,
            Err(_) => return false,
        };

        // Verify signature
        dilithium5::verify_detached_signature(&signature, message, &public_key).is_ok()
    }

    // Helper: Verify SPHINCS+ signature
    fn verify_sphincs_plus(public_key_hex: &str, message: &[u8], signature_hex: &str) -> bool {
        use pqcrypto_sphincsplus::sphincssha2256fsimple;
        use pqcrypto_traits::sign::{PublicKey as PQPublicKey, DetachedSignature as PQDetachedSignature};

        // Decode hex strings
        let pk_bytes = match hex::decode(public_key_hex.strip_prefix("0x").unwrap_or(public_key_hex)) {
            Ok(bytes) => bytes,
            Err(_) => return false,
        };

        let sig_bytes = match hex::decode(signature_hex.strip_prefix("0x").unwrap_or(signature_hex)) {
            Ok(bytes) => bytes,
            Err(_) => return false,
        };

        // Validate sizes
        if pk_bytes.len() != sphincssha2256fsimple::public_key_bytes() {
            return false;
        }
        if sig_bytes.len() != sphincssha2256fsimple::signature_bytes() {
            return false;
        }

        // Create key and signature from bytes using trait methods
        let public_key = match sphincssha2256fsimple::PublicKey::from_bytes(&pk_bytes) {
            Ok(pk) => pk,
            Err(_) => return false,
        };
        
        let signature = match sphincssha2256fsimple::DetachedSignature::from_bytes(&sig_bytes) {
            Ok(sig) => sig,
            Err(_) => return false,
        };

        // Verify signature
        sphincssha2256fsimple::verify_detached_signature(&signature, message, &public_key).is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_pair() {
        let left = [1u8; 32];
        let right = [2u8; 32];
        let result = NamespaceVerifier::hash_pair(&left, &right);
        assert_eq!(result.len(), 32);
    }

    #[test]
    fn test_genesis_binding() {
        let genesis_hash = [42u8; 32];
        let mut cert = create_test_certificate();
        cert.identity.genesis_hash = genesis_hash;

        assert!(NamespaceVerifier::verify_genesis_binding(&cert, &genesis_hash));
        
        let wrong_hash = [0u8; 32];
        assert!(!NamespaceVerifier::verify_genesis_binding(&cert, &wrong_hash));
    }

    fn create_test_certificate() -> Certificate {
        use crate::types::*;

        Certificate {
            version: "1.0.0".to_string(),
            certificate_type: "namespace".to_string(),
            identity: Identity {
                namespace_id: "1.x".to_string(),
                namespace_hash: [0u8; 32],
                address: "test".to_string(),
                genesis_hash: [0u8; 32],
            },
            lineage: Lineage {
                parent: "/".to_string(),
                parent_hash: [0u8; 32],
                depth: 0,
                merkle_proof: MerkleProof {
                    path: vec![],
                    root_hash: [0u8; 32],
                },
            },
            creation: Creation {
                block_number: 1,
                timestamp: 1737072000,
                entropy: [0u8; 32],
            },
            sovereignty: Sovereignty {
                class: "Immutable".to_string(),
                owner_public_key: "0x00".to_string(),
                class_proof: "0x00".to_string(),
            },
            rarity: Rarity {
                score: 0.0,
                tier: "Common".to_string(),
                components: RarityComponents {
                    position_rarity: 0.0,
                    pattern_rarity: 0.0,
                    hash_entropy: 0.0,
                    temporal_rarity: 0.0,
                    structural_rarity: 0.0,
                },
                algorithm_version: "v1".to_string(),
            },
            signature: Signature {
                scheme: "Dilithium5".to_string(),
                public_key: "0x00".to_string(),
                signature: "0x00".to_string(),
            },
            ipfs: Ipfs {
                cid: "Qm...".to_string(),
                pin_status: "pinned".to_string(),
                content_hash: [0u8; 32],
            },
        }
    }
}
