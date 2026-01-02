# Namespace Object Model Specification

**Version**: 1.0.0  
**Status**: Immutable  
**Locked**: Genesis

---

## 1. Fundamental Principle

> A namespace is not a string. It is a **cryptographic identity object** with immutable properties derived from genesis.

---

## 2. Core Namespace Object

### Definition

```rust
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Namespace {
    // Identity (immutable)
    pub id: String,                    // Human-readable (e.g., "1.x")
    pub hash: [u8; 32],               // TRUE identity (SHA3-256)
    pub address: String,              // Base58-encoded address
    
    // Lineage (immutable)
    pub parent: String,               // Parent namespace or "/"
    pub parent_hash: [u8; 32],        // Parent's identity hash
    pub depth: u32,                   // Distance from root
    pub lineage_proof: MerkleProof,   // Proof of ancestry
    
    // Genesis binding (immutable)
    pub genesis_hash: [u8; 32],       // Genesis ceremony hash
    pub creation_block: u64,          // Block number of creation
    pub creation_timestamp: i64,      // Unix timestamp
    pub entropy: [u8; 32],            // Creation entropy
    
    // Sovereignty (mutable only by owner)
    pub owner: PublicKey,             // Current controller
    pub sovereignty_class: SovereigntyClass,  // Transfer rules
    
    // Rarity (immutable, calculated at creation)
    pub rarity_score: f64,            // 0-1000
    pub rarity_tier: RarityTier,      // Common to Mythical
    pub rarity_proof: RarityProof,    // Deterministic calculation
    
    // State
    pub is_minted: bool,              // NFT minted flag
    pub transfer_count: u32,          // Number of transfers
    pub last_transfer: Option<i64>,   // Last transfer timestamp
    
    // Certificate
    pub certificate_cid: String,      // IPFS CID of certificate
}
```

---

## 3. Identity Derivation

### Namespace Hash Formula

```rust
pub fn derive_namespace_hash(
    genesis_hash: &[u8; 32],
    parent_hash: &[u8; 32],
    id: &str,
    creation_block: u64,
    entropy: &[u8; 32],
) -> [u8; 32] {
    use sha3::{Digest, Sha3_256};
    
    let mut hasher = Sha3_256::new();
    
    // Domain separation
    hasher.update(b"web3-rarity-namespace-v1");
    
    // Genesis binding (ensures uniqueness to this genesis)
    hasher.update(genesis_hash);
    
    // Parent binding (ensures lineage integrity)
    hasher.update(parent_hash);
    
    // Identifier (human-readable component)
    hasher.update(id.as_bytes());
    
    // Temporal uniqueness
    hasher.update(&creation_block.to_le_bytes());
    
    // Entropic uniqueness (prevents pre-computation)
    hasher.update(entropy);
    
    hasher.finalize().into()
}
```

### Properties

- **Deterministic**: Same inputs always produce same hash
- **Unique**: Collision probability < 2^-256
- **Genesis-bound**: Different genesis → different hash
- **Lineage-bound**: Different parent → different hash
- **Non-reproducible**: Entropy + timestamp prevent recreation

### Address Encoding

```rust
pub fn derive_address(namespace_hash: &[u8; 32]) -> String {
    // Version byte (0x01 = namespace v1)
    let mut data = vec![0x01];
    
    // Take first 20 bytes of hash
    data.extend_from_slice(&namespace_hash[..20]);
    
    // Base58 encode (Bitcoin-style)
    bs58::encode(data).into_string()
}
```

Example address: `1NS7kPxQy3vZ8mN2...` (Base58)

---

## 4. Sovereignty Classes

```rust
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum SovereigntyClass {
    /// Cannot be transferred, authority is permanent
    Immutable,
    
    /// Can be transferred once (single-use)
    TransferableOnce,
    
    /// Can be transferred unlimited times
    Transferable,
    
    /// Multiple keys can control (multi-sig)
    Delegable {
        controllers: Vec<PublicKey>,
        threshold: u8,  // M-of-N signatures required
    },
    
    /// Pre-committed inheritance rules
    Heritable {
        heirs: Vec<PublicKey>,
        unlock_conditions: UnlockConditions,
    },
    
    /// Can receive value but never transfer out
    Sealed {
        creation_timestamp: i64,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum UnlockConditions {
    TimeDelay { unlock_at: i64 },
    DeadManSwitch { last_proof_required_by: i64 },
    WitnessQuorum { required_witnesses: u8 },
    Composite(Vec<UnlockConditions>),  // AND/OR logic
}
```

### Class Assignment Rules

1. Class is set **at creation**
2. Class **cannot be changed** later
3. Attempting to violate class rules **fails cryptographically**

---

## 5. Rarity Proof

```rust
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RarityProof {
    // Calculation inputs (immutable)
    pub position_rarity: f64,      // 0-1, based on namespace number
    pub pattern_rarity: f64,       // 0-1, structural properties
    pub hash_entropy: f64,         // 0-1, hash distribution
    pub temporal_rarity: f64,      // 0-1, creation time
    pub lineage_depth: u32,        // Distance from root
    pub structural_rarity: f64,    // 0-1, tree position
    
    // Weighted score (immutable)
    pub final_score: f64,          // 0-1000
    
    // Tier (immutable)
    pub tier: RarityTier,
    
    // Verification data
    pub calculation_timestamp: i64,
    pub algorithm_version: String, // "v1" (locked)
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum RarityTier {
    Common = 1,        // 0-100
    Uncommon = 2,      // 101-250
    Rare = 3,          // 251-500
    Epic = 4,          // 501-750
    Legendary = 5,     // 751-900
    Mythical = 6,      // 901-1000
}

impl RarityTier {
    pub fn value_multiplier(&self) -> f64 {
        match self {
            RarityTier::Common => 1.0,
            RarityTier::Uncommon => 2.5,
            RarityTier::Rare => 5.0,
            RarityTier::Epic => 10.0,
            RarityTier::Legendary => 25.0,
            RarityTier::Mythical => 100.0,
        }
    }
}
```

### Rarity Calculation (Immutable Algorithm)

```rust
pub fn calculate_rarity(
    id: &str,
    namespace_hash: &[u8; 32],
    creation_block: u64,
    depth: u32,
    total_namespaces: u64,
) -> RarityProof {
    // Position rarity (20% weight)
    let position_rarity = calculate_position_rarity(id);
    
    // Pattern rarity (30% weight)
    let pattern_rarity = calculate_pattern_rarity(id);
    
    // Hash entropy (10% weight)
    let hash_entropy = calculate_hash_entropy(namespace_hash);
    
    // Temporal rarity (15% weight)
    let temporal_rarity = calculate_temporal_rarity(creation_block);
    
    // Lineage depth (25% weight)
    let structural_rarity = calculate_structural_rarity(depth);
    
    // Weighted sum
    let final_score = 
        position_rarity * 200.0 +      // 0-200 points
        pattern_rarity * 300.0 +       // 0-300 points
        hash_entropy * 100.0 +         // 0-100 points
        temporal_rarity * 150.0 +      // 0-150 points
        structural_rarity * 250.0;     // 0-250 points
    // Total: 0-1000 points
    
    let tier = RarityTier::from_score(final_score);
    
    RarityProof {
        position_rarity,
        pattern_rarity,
        hash_entropy,
        temporal_rarity,
        lineage_depth: depth,
        structural_rarity,
        final_score,
        tier,
        calculation_timestamp: current_timestamp(),
        algorithm_version: "v1".to_string(),
    }
}
```

**Critical**: This algorithm is **locked at genesis** and cannot change.

---

## 6. Lineage Proof

```rust
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MerkleProof {
    // Path from this namespace to root
    pub path: Vec<MerkleNode>,
    
    // Root hash (should match genesis commitment)
    pub root_hash: [u8; 32],
    
    // Verification metadata
    pub depth: u32,
    pub leaf_index: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MerkleNode {
    pub hash: [u8; 32],
    pub position: NodePosition,  // Left or Right
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum NodePosition {
    Left,
    Right,
}
```

### Lineage Verification

```rust
pub fn verify_lineage(
    namespace_hash: &[u8; 32],
    proof: &MerkleProof,
    genesis_hash: &[u8; 32],
) -> bool {
    let mut current = *namespace_hash;
    
    for node in &proof.path {
        current = match node.position {
            NodePosition::Left => {
                hash_pair(&node.hash, &current)
            }
            NodePosition::Right => {
                hash_pair(&current, &node.hash)
            }
        };
    }
    
    // Root must match genesis commitment
    current == *genesis_hash
}

fn hash_pair(left: &[u8; 32], right: &[u8; 32]) -> [u8; 32] {
    use blake3::Hasher;
    
    let mut hasher = Hasher::new();
    hasher.update(b"node");  // Domain separation
    hasher.update(left);
    hasher.update(right);
    
    let mut output = [0u8; 32];
    hasher.finalize_xof().fill(&mut output);
    output
}
```

---

## 7. Public Key Model

```rust
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum PublicKey {
    Dilithium5(Vec<u8>),           // 2,592 bytes
    SphincsPlus(Vec<u8>),          // 64 bytes
}

impl PublicKey {
    pub fn verify_signature(
        &self,
        message: &[u8],
        signature: &[u8],
    ) -> bool {
        match self {
            PublicKey::Dilithium5(pk) => {
                // Use pqcrypto-dilithium to verify
                verify_dilithium(pk, message, signature)
            }
            PublicKey::SphincsPlus(pk) => {
                // Use pqcrypto-sphincsplus to verify
                verify_sphincs(pk, message, signature)
            }
        }
    }
    
    pub fn to_address(&self) -> String {
        let hash = sha3_256(&self.to_bytes());
        derive_address(&hash)
    }
}
```

---

## 8. Namespace Creation Rules

### Validation

```rust
pub fn validate_namespace_creation(
    id: &str,
    parent: &Namespace,
    genesis_hash: &[u8; 32],
) -> Result<(), ValidationError> {
    // 1. Format validation
    if !is_valid_format(id) {
        return Err(ValidationError::InvalidFormat);
    }
    
    // 2. Parent must exist and be valid
    if !parent.is_valid() {
        return Err(ValidationError::InvalidParent);
    }
    
    // 3. Genesis must match
    if parent.genesis_hash != *genesis_hash {
        return Err(ValidationError::GenesisMismatch);
    }
    
    // 4. Depth limits
    if parent.depth >= MAX_DEPTH {
        return Err(ValidationError::MaxDepthExceeded);
    }
    
    // 5. Supply limits
    if total_namespaces() >= MAX_SUPPLY {
        return Err(ValidationError::SupplyExhausted);
    }
    
    Ok(())
}

pub fn is_valid_format(id: &str) -> bool {
    // Must be N.x where N is positive integer
    let parts: Vec<&str> = id.split('.').collect();
    
    if parts.len() != 2 || parts[1] != "x" {
        return false;
    }
    
    parts[0].parse::<u64>().is_ok()
}
```

---

## 9. Transfer Model

```rust
pub struct Transfer {
    pub namespace_hash: [u8; 32],
    pub from: PublicKey,
    pub to: PublicKey,
    pub timestamp: i64,
    pub signature: Vec<u8>,
    pub nonce: u64,
}

impl Transfer {
    pub fn verify(&self, namespace: &Namespace) -> bool {
        // 1. Check sovereignty class allows transfer
        if !namespace.sovereignty_class.allows_transfer() {
            return false;
        }
        
        // 2. Verify sender is current owner
        if namespace.owner != self.from {
            return false;
        }
        
        // 3. Verify signature
        let message = self.to_signed_message();
        if !self.from.verify_signature(&message, &self.signature) {
            return false;
        }
        
        // 4. Check nonce (prevent replay)
        if self.nonce != namespace.transfer_count + 1 {
            return false;
        }
        
        true
    }
    
    fn to_signed_message(&self) -> Vec<u8> {
        let mut message = Vec::new();
        message.extend_from_slice(&self.namespace_hash);
        message.extend_from_slice(&self.to.to_bytes());
        message.extend_from_slice(&self.timestamp.to_le_bytes());
        message.extend_from_slice(&self.nonce.to_le_bytes());
        message
    }
}
```

---

## 10. Vault Derivation

```rust
pub struct Vault {
    pub namespace_hash: [u8; 32],
    pub vault_address: String,
    pub derivation_index: u32,
}

impl Namespace {
    pub fn derive_vault(&self, index: u32) -> Vault {
        let hash = derive_vault_hash(&self.hash, index);
        let address = derive_vault_address(&hash);
        
        Vault {
            namespace_hash: self.hash,
            vault_address: address,
            derivation_index: index,
        }
    }
}

fn derive_vault_hash(
    namespace_hash: &[u8; 32],
    index: u32,
) -> [u8; 32] {
    use sha3::{Digest, Sha3_256};
    
    let mut hasher = Sha3_256::new();
    hasher.update(b"web3-rarity-vault-v1");
    hasher.update(namespace_hash);
    hasher.update(&index.to_le_bytes());
    
    hasher.finalize().into()
}

fn derive_vault_address(vault_hash: &[u8; 32]) -> String {
    let mut data = vec![0x02];  // Version byte (vault)
    data.extend_from_slice(&vault_hash[..20]);
    bs58::encode(data).into_string()
}
```

---

## Summary

The namespace object model defines:

- **Identity**: Hash-based, genesis-bound, non-recreatable
- **Sovereignty**: Class-based transfer rules
- **Rarity**: Immutable, mathematically proven
- **Lineage**: Merkle-proof verifiable
- **Keys**: Post-quantum secure
- **Vaults**: Deterministic value containers

All properties are either:
- **Immutable forever** (identity, rarity, lineage)
- **Mutable only by cryptographic proof** (ownership)

No admin can change these rules.

---

**Status**: Locked at Genesis  
**Modification**: Prohibited  
**Enforcement**: Cryptographic Proof
