use serde::{Deserialize, Serialize};

/// Complete namespace certificate structure (from STATELESS_VERIFIER.md)
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Certificate {
    pub version: String,
    pub certificate_type: String,
    pub identity: Identity,
    pub lineage: Lineage,
    pub creation: Creation,
    pub sovereignty: Sovereignty,
    pub rarity: Rarity,
    pub signature: Signature,
    pub ipfs: Ipfs,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Identity {
    pub namespace_id: String,
    #[serde(with = "hex_bytes")]
    pub namespace_hash: [u8; 32],
    pub address: String,
    #[serde(with = "hex_bytes")]
    pub genesis_hash: [u8; 32],
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Lineage {
    pub parent: String,
    #[serde(with = "hex_bytes")]
    pub parent_hash: [u8; 32],
    pub depth: u32,
    pub merkle_proof: MerkleProof,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MerkleProof {
    pub path: Vec<MerkleNode>,
    #[serde(with = "hex_bytes")]
    pub root_hash: [u8; 32],
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MerkleNode {
    #[serde(with = "hex_bytes")]
    pub hash: [u8; 32],
    pub position: String, // "left" or "right"
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Creation {
    pub block_number: u64,
    pub timestamp: i64,
    #[serde(with = "hex_bytes")]
    pub entropy: [u8; 32],
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Sovereignty {
    pub class: String,
    pub owner_public_key: String,
    pub class_proof: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Rarity {
    pub score: f64,
    pub tier: String,
    pub components: RarityComponents,
    pub algorithm_version: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RarityComponents {
    pub position_rarity: f64,
    pub pattern_rarity: f64,
    pub hash_entropy: f64,
    pub temporal_rarity: f64,
    pub structural_rarity: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Signature {
    pub scheme: String,
    pub public_key: String,
    pub signature: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Ipfs {
    pub cid: String,
    pub pin_status: String,
    #[serde(with = "hex_bytes")]
    pub content_hash: [u8; 32],
}

/// Verification result structure
#[derive(Clone, Debug, Default)]
pub struct VerificationResult {
    pub genesis_binding: bool,
    pub identity: bool,
    pub lineage: bool,
    pub rarity: bool,
    pub signature: bool,
    pub ipfs: bool,
}

impl VerificationResult {
    pub fn is_valid(&self) -> bool {
        self.genesis_binding
            && self.identity
            && self.lineage
            && self.rarity
            && self.signature
            && self.ipfs
    }

    pub fn failed_checks(&self) -> Vec<&'static str> {
        let mut failed = Vec::new();
        if !self.genesis_binding {
            failed.push("genesis_binding");
        }
        if !self.identity {
            failed.push("identity");
        }
        if !self.lineage {
            failed.push("lineage");
        }
        if !self.rarity {
            failed.push("rarity");
        }
        if !self.signature {
            failed.push("signature");
        }
        if !self.ipfs {
            failed.push("ipfs");
        }
        failed
    }
}

/// Custom serde for [u8; 32] with hex encoding
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
