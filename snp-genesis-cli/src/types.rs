use serde::{Deserialize, Serialize};

/// Genesis ceremony transcript (from GENESIS_SPEC.md)
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GenesisTranscript {
    pub version: String,
    pub ceremony_date: String,
    pub entropy_sources: EntropySources,
    pub parameters: GenesisParameters,
    #[serde(with = "hex_bytes")]
    pub genesis_hash: [u8; 32],
    pub key_destruction_proof: Option<String>,
    pub ipfs_cid: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EntropySources {
    pub bitcoin_block: BitcoinBlock,
    pub ethereum_block: EthereumBlock,
    pub nist_beacon: NistBeacon,
    pub cosmic_source: CosmicSource,
    pub mpc_ceremony: MpcCeremony,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BitcoinBlock {
    pub height: u64,
    pub hash: String,
    pub timestamp: i64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EthereumBlock {
    pub height: u64,
    pub hash: String,
    pub timestamp: i64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NistBeacon {
    pub pulse_index: String,
    pub output: String,
    pub timestamp: i64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CosmicSource {
    pub observatory: String,
    pub measurement_id: String,
    pub value: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MpcCeremony {
    pub participants: Vec<String>,
    pub commitments: Vec<String>,
    pub final_output: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GenesisParameters {
    pub signature_scheme: String,
    pub hash_function: String,
    pub merkle_hash: String,
    pub max_root_namespaces: u32,
    pub max_depth: u32,
    pub max_total_namespaces: u32,
    pub rarity_algorithm: String,
    pub tier_boundaries: Vec<u32>,
}

impl Default for GenesisParameters {
    fn default() -> Self {
        Self {
            signature_scheme: "CRYSTALS-Dilithium5".to_string(),
            hash_function: "SHA3-256".to_string(),
            merkle_hash: "BLAKE3".to_string(),
            max_root_namespaces: 10_000,
            max_depth: 10,
            max_total_namespaces: 1_000_000,
            rarity_algorithm: "v1".to_string(),
            tier_boundaries: vec![100, 250, 500, 750, 900],
        }
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
