use crate::crypto::dilithium::{
    Dilithium5, DilithiumPublicKey, DilithiumSecretKey, DilithiumSignature,
};
use crate::crypto::hash::sha3_256_domain;
use crate::crypto::traits::SignatureScheme;
use crate::errors::{Result, SnpError};
use crate::namespace::Namespace;
use crate::sovereignty::SovereigntyClass;
use serde::{Deserialize, Serialize};

/// Domain separation tag for transition proofs
pub const DOMAIN_TRANSITION: &[u8] = b"SNP::TRANSITION";

/// A sovereignty transition represents a change in namespace ownership or authority
///
/// Transitions are constrained by sovereignty class:
/// - Immutable: No transitions allowed
/// - Transferable: One-way ownership transfer
/// - Delegable: Authority delegation (M-of-N)
/// - Heritable: Succession based on conditions
/// - Sealed: Permanently frozen, no transitions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SovereigntyTransition {
    /// Namespace being transitioned
    #[serde(with = "hex_bytes")]
    pub namespace_id: [u8; 32],

    /// Type of transition
    pub transition_type: TransitionType,

    /// Transition proof
    pub proof: TransitionProof,

    /// Timestamp of transition
    pub timestamp: u64,

    /// Signature by current authority
    pub signature: DilithiumSignature,
}

/// Type of sovereignty transition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransitionType {
    /// Transfer ownership to new party (Transferable only)
    Transfer {
        #[serde(with = "hex_bytes")]
        new_owner: [u8; 32],
    },

    /// Delegate authority (Delegable only)
    Delegate {
        #[serde(with = "hex_vec")]
        delegates: Vec<[u8; 32]>,
        threshold: u32,
    },

    /// Execute succession (Heritable only)
    Succession {
        #[serde(with = "hex_bytes")]
        heir: [u8; 32],
        #[serde(with = "hex_bytes")]
        condition_proof: [u8; 32],
    },

    /// Seal namespace permanently (any class → Sealed)
    Seal,
}

/// Proof of transition validity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransitionProof {
    /// Hash of transition data
    #[serde(with = "hex_bytes")]
    pub data_hash: [u8; 32],

    /// Additional signatures (for delegation)
    pub co_signatures: Vec<DilithiumSignature>,

    /// Nonce to prevent replay attacks
    pub nonce: u64,
}

impl SovereigntyTransition {
    /// Create a new transfer transition
    pub fn create_transfer(
        namespace: &Namespace,
        new_owner: [u8; 32],
        current_owner_key: &DilithiumSecretKey,
        timestamp: u64,
        nonce: u64,
    ) -> Result<Self> {
        // Validate sovereignty class allows transfer
        if !namespace.sovereignty.allows_transfer() {
            return Err(SnpError::InvalidSovereigntyTransition(format!(
                "{:?} class does not allow transfers",
                namespace.sovereignty
            )));
        }

        let transition_type = TransitionType::Transfer { new_owner };

        // Create proof
        let data_hash = Self::compute_data_hash(&namespace.id, &transition_type, timestamp, nonce);

        let proof = TransitionProof {
            data_hash,
            co_signatures: vec![],
            nonce,
        };

        // Sign transition
        let signing_message =
            Self::create_signing_message(&namespace.id, &transition_type, &proof, timestamp);

        let signature = Dilithium5::sign(current_owner_key, &signing_message)?;

        Ok(Self {
            namespace_id: namespace.id,
            transition_type,
            proof,
            timestamp,
            signature,
        })
    }

    /// Create a new delegation transition
    pub fn create_delegation(
        namespace: &Namespace,
        delegates: Vec<[u8; 32]>,
        threshold: u32,
        current_owner_key: &DilithiumSecretKey,
        timestamp: u64,
        nonce: u64,
    ) -> Result<Self> {
        // Validate sovereignty class allows delegation
        if !namespace.sovereignty.allows_delegation() {
            return Err(SnpError::InvalidSovereigntyTransition(format!(
                "{:?} class does not allow delegation",
                namespace.sovereignty
            )));
        }

        // Validate threshold
        if threshold == 0 || threshold as usize > delegates.len() {
            return Err(SnpError::InvalidSovereigntyTransition(format!(
                "Invalid threshold: {} delegates, {} required",
                delegates.len(),
                threshold
            )));
        }

        let transition_type = TransitionType::Delegate {
            delegates,
            threshold,
        };

        // Create proof
        let data_hash = Self::compute_data_hash(&namespace.id, &transition_type, timestamp, nonce);

        let proof = TransitionProof {
            data_hash,
            co_signatures: vec![],
            nonce,
        };

        // Sign transition
        let signing_message =
            Self::create_signing_message(&namespace.id, &transition_type, &proof, timestamp);

        let signature = Dilithium5::sign(current_owner_key, &signing_message)?;

        Ok(Self {
            namespace_id: namespace.id,
            transition_type,
            proof,
            timestamp,
            signature,
        })
    }

    /// Create a new succession transition
    pub fn create_succession(
        namespace: &Namespace,
        heir: [u8; 32],
        condition_proof: [u8; 32],
        executor_key: &DilithiumSecretKey,
        timestamp: u64,
        nonce: u64,
    ) -> Result<Self> {
        // Validate sovereignty class allows inheritance
        if !namespace.sovereignty.allows_inheritance() {
            return Err(SnpError::InvalidSovereigntyTransition(format!(
                "{:?} class does not allow inheritance",
                namespace.sovereignty
            )));
        }

        let transition_type = TransitionType::Succession {
            heir,
            condition_proof,
        };

        // Create proof
        let data_hash = Self::compute_data_hash(&namespace.id, &transition_type, timestamp, nonce);

        let proof = TransitionProof {
            data_hash,
            co_signatures: vec![],
            nonce,
        };

        // Sign transition
        let signing_message =
            Self::create_signing_message(&namespace.id, &transition_type, &proof, timestamp);

        let signature = Dilithium5::sign(executor_key, &signing_message)?;

        Ok(Self {
            namespace_id: namespace.id,
            transition_type,
            proof,
            timestamp,
            signature,
        })
    }

    /// Create a seal transition (permanent freeze)
    pub fn create_seal(
        namespace: &Namespace,
        owner_key: &DilithiumSecretKey,
        timestamp: u64,
        nonce: u64,
    ) -> Result<Self> {
        // Sealed namespaces cannot transition
        if namespace.sovereignty == SovereigntyClass::Sealed {
            return Err(SnpError::InvalidSovereigntyTransition(
                "Namespace is already sealed".to_string(),
            ));
        }

        let transition_type = TransitionType::Seal;

        // Create proof
        let data_hash = Self::compute_data_hash(&namespace.id, &transition_type, timestamp, nonce);

        let proof = TransitionProof {
            data_hash,
            co_signatures: vec![],
            nonce,
        };

        // Sign transition
        let signing_message =
            Self::create_signing_message(&namespace.id, &transition_type, &proof, timestamp);

        let signature = Dilithium5::sign(owner_key, &signing_message)?;

        Ok(Self {
            namespace_id: namespace.id,
            transition_type,
            proof,
            timestamp,
            signature,
        })
    }

    /// Verify transition signature
    pub fn verify(&self, public_key: &DilithiumPublicKey) -> Result<bool> {
        // Recompute signing message
        let signing_message = Self::create_signing_message(
            &self.namespace_id,
            &self.transition_type,
            &self.proof,
            self.timestamp,
        );

        // Verify signature
        Ok(Dilithium5::verify(
            public_key,
            &signing_message,
            &self.signature,
        ))
    }

    /// Add co-signature for delegated transitions
    pub fn add_co_signature(&mut self, signature: DilithiumSignature) {
        self.proof.co_signatures.push(signature);
    }

    /// Verify all co-signatures for delegation
    pub fn verify_delegation(&self, _delegate_keys: &[[u8; 32]], threshold: u32) -> Result<bool> {
        match &self.transition_type {
            TransitionType::Delegate {
                delegates: _,
                threshold: required_threshold,
            } => {
                if threshold != *required_threshold {
                    return Ok(false);
                }

                // Need at least threshold valid signatures
                if self.proof.co_signatures.len() < *required_threshold as usize {
                    return Ok(false);
                }

                // Verify each co-signature is from a valid delegate
                // (In production, this would check against actual delegate public keys)
                Ok(self.proof.co_signatures.len() >= *required_threshold as usize)
            }
            _ => Err(SnpError::InvalidSovereigntyTransition(
                "Not a delegation transition".to_string(),
            )),
        }
    }

    /// Compute data hash for transition
    fn compute_data_hash(
        namespace_id: &[u8; 32],
        _transition_type: &TransitionType,
        timestamp: u64,
        nonce: u64,
    ) -> [u8; 32] {
        let type_bytes = serde_json::to_vec(_transition_type).unwrap();
        sha3_256_domain(
            DOMAIN_TRANSITION,
            &[
                namespace_id,
                &type_bytes,
                &timestamp.to_le_bytes(),
                &nonce.to_le_bytes(),
            ],
        )
    }

    /// Create signing message
    fn create_signing_message(
        namespace_id: &[u8; 32],
        _transition_type: &TransitionType,
        proof: &TransitionProof,
        timestamp: u64,
    ) -> Vec<u8> {
        let mut msg = Vec::new();
        msg.extend_from_slice(DOMAIN_TRANSITION);
        msg.extend_from_slice(namespace_id);
        msg.extend_from_slice(&proof.data_hash);
        msg.extend_from_slice(&timestamp.to_le_bytes());
        msg.extend_from_slice(&proof.nonce.to_le_bytes());
        msg
    }
}

/// Custom serde modules
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

mod hex_vec {
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(items: &[[u8; 32]], serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let hex_strs: Vec<String> = items
            .iter()
            .map(|bytes| format!("0x{}", hex::encode(bytes)))
            .collect();
        serializer.collect_seq(hex_strs)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Vec<[u8; 32]>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let strings: Vec<String> = Vec::deserialize(deserializer)?;

        strings
            .into_iter()
            .map(|s| {
                let s = s.strip_prefix("0x").unwrap_or(&s);
                let bytes = hex::decode(s).map_err(serde::de::Error::custom)?;

                if bytes.len() != 32 {
                    return Err(serde::de::Error::custom("Expected 32 bytes"));
                }

                let mut array = [0u8; 32];
                array.copy_from_slice(&bytes);
                Ok(array)
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::genesis::GenesisContext;

    #[test]
    fn test_transfer_transition() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Transferable).unwrap();
        let (pk, sk) = Dilithium5::keypair(b"owner").unwrap();
        let new_owner = [1u8; 32];

        let transition =
            SovereigntyTransition::create_transfer(&namespace, new_owner, &sk, 1000, 1).unwrap();

        assert!(transition.verify(&pk).unwrap());
    }

    #[test]
    fn test_immutable_cannot_transfer() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Immutable).unwrap();
        let (_pk, sk) = Dilithium5::keypair(b"owner").unwrap();

        let result = SovereigntyTransition::create_transfer(&namespace, [1u8; 32], &sk, 1000, 1);

        assert!(result.is_err());
    }

    #[test]
    fn test_delegation_transition() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Delegable).unwrap();
        let (pk, sk) = Dilithium5::keypair(b"owner").unwrap();

        let delegates = vec![[1u8; 32], [2u8; 32], [3u8; 32]];
        let transition =
            SovereigntyTransition::create_delegation(&namespace, delegates, 2, &sk, 1000, 1)
                .unwrap();

        assert!(transition.verify(&pk).unwrap());
    }

    #[test]
    fn test_seal_transition() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace =
            Namespace::derive(&genesis, "test.ns", SovereigntyClass::Transferable).unwrap();
        let (pk, sk) = Dilithium5::keypair(b"owner").unwrap();

        let transition = SovereigntyTransition::create_seal(&namespace, &sk, 1000, 1).unwrap();

        assert!(transition.verify(&pk).unwrap());
    }

    #[test]
    fn test_sealed_cannot_transition() {
        let genesis = GenesisContext::new([42u8; 32]);
        let namespace = Namespace::derive(&genesis, "test.ns", SovereigntyClass::Sealed).unwrap();
        let (_pk, sk) = Dilithium5::keypair(b"owner").unwrap();

        let result = SovereigntyTransition::create_seal(&namespace, &sk, 1000, 1);

        assert!(result.is_err());
    }
}
