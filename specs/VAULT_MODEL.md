# Vault and Asset Containment Model

**Version**: 1.0.0  
**Status**: Locked at Genesis  
**Purpose**: Define how namespaces hold, generate, and protect value

---

## 1. Core Principle

> A namespace is not a wallet. It is a **sovereign vault** that can hold assets, generate value, and execute logic without being a hot wallet.

Wallets are for spending. Vaults are for **sovereignty**.

---

## 2. Vault Architecture

### Definition

Each namespace can deterministically derive **unlimited vault addresses**:

```rust
pub struct Vault {
    // Identity
    pub namespace_hash: [u8; 32],      // Parent namespace
    pub vault_address: String,         // Base58 address
    pub derivation_index: u32,         // 0, 1, 2, ...
    
    // Type
    pub vault_type: VaultType,
    
    // State
    pub created_at: i64,
    pub last_interaction: i64,
}

pub enum VaultType {
    // General-purpose value storage
    Treasury,
    
    // Specific asset types
    FungibleTokens,    // ERC-20, SPL tokens, etc.
    NonFungible,       // NFTs
    RealWorldAssets,   // RWA proofs
    
    // Specialized
    Escrow,            // Conditional release
    RevenueStream,     // Continuous income
    StakingVault,      // Locked for staking
    
    // Future-proof
    Custom(String),    // User-defined
}
```

---

## 3. Vault Derivation (Deterministic)

### Derivation Formula

```rust
pub fn derive_vault_address(
    namespace_hash: &[u8; 32],
    vault_type: VaultType,
    derivation_index: u32,
) -> String {
    use sha3::{Digest, Sha3_256};
    
    let mut hasher = Sha3_256::new();
    
    // Domain separation
    hasher.update(b"web3-rarity-vault-v1");
    
    // Namespace binding
    hasher.update(namespace_hash);
    
    // Vault type
    hasher.update(vault_type.to_bytes());
    
    // Derivation index (allows unlimited vaults)
    hasher.update(&derivation_index.to_le_bytes());
    
    let hash: [u8; 32] = hasher.finalize().into();
    
    // Encode as Base58 address
    let mut data = vec![0x02];  // Version: vault
    data.extend_from_slice(&hash[..20]);
    
    bs58::encode(data).into_string()
}
```

### Properties

- **Deterministic**: Same inputs → same address
- **Unlimited**: Can derive infinite vaults (index 0 to 2^32)
- **Isolated**: Cannot reverse-engineer namespace from vault
- **Type-separated**: Fungible vs. Non-fungible use different derivations

---

## 4. Value Storage Model

### Asset Slots

Each vault can hold multiple asset types:

```rust
pub struct VaultContents {
    // Native chain tokens (ETH, SOL, etc.)
    pub native_balance: u128,
    
    // Fungible tokens
    pub fungible_assets: Vec<FungibleAsset>,
    
    // Non-fungible tokens
    pub non_fungible_assets: Vec<NonFungibleAsset>,
    
    // Real-world assets (RWA)
    pub rwa_proofs: Vec<RwaProof>,
    
    // Arbitrary data
    pub data_storage: Vec<DataSlot>,
}

pub struct FungibleAsset {
    pub token_address: String,
    pub amount: u128,
    pub decimals: u8,
}

pub struct NonFungibleAsset {
    pub collection_address: String,
    pub token_id: String,
    pub metadata_uri: String,
}

pub struct RwaProof {
    pub asset_type: String,           // "real-estate", "bonds", etc.
    pub proof_cid: String,            // IPFS certificate
    pub valuation: u128,
    pub last_updated: i64,
}

pub struct DataSlot {
    pub key: String,
    pub value: Vec<u8>,
    pub content_type: String,
}
```

---

## 5. Authorization Model (Proof-Based)

### Control via Cryptographic Proofs

Vaults are **not controlled by keys directly**. They are controlled by **proving ownership of the parent namespace**.

```rust
pub struct VaultAction {
    // What action to perform
    pub action: Action,
    
    // Proof of namespace ownership
    pub namespace_proof: NamespaceProof,
    
    // Action-specific signature
    pub signature: Vec<u8>,
    
    // Anti-replay
    pub nonce: u64,
    pub timestamp: i64,
}

pub enum Action {
    Deposit {
        asset: Asset,
        amount: u128,
    },
    Withdraw {
        asset: Asset,
        amount: u128,
        recipient: String,
    },
    Transfer {
        to_vault: String,
        asset: Asset,
        amount: u128,
    },
    Delegate {
        operator: PublicKey,
        permissions: Vec<Permission>,
        expiry: i64,
    },
    Execute {
        contract: String,
        calldata: Vec<u8>,
    },
}

pub struct NamespaceProof {
    pub namespace_hash: [u8; 32],
    pub owner_public_key: PublicKey,
    pub certificate_cid: String,      // IPFS certificate
    pub lineage_proof: MerkleProof,   // Proves namespace validity
}
```

### Verification Flow

```rust
impl VaultAction {
    pub fn verify(&self, namespace: &Namespace, vault: &Vault) -> bool {
        // 1. Verify namespace proof is valid
        if !self.namespace_proof.verify() {
            return false;
        }
        
        // 2. Verify vault belongs to this namespace
        if vault.namespace_hash != self.namespace_proof.namespace_hash {
            return false;
        }
        
        // 3. Verify signature from namespace owner
        let message = self.action_message();
        if !self.namespace_proof.owner_public_key.verify_signature(
            &message,
            &self.signature,
        ) {
            return false;
        }
        
        // 4. Verify sovereignty class allows this action
        if !namespace.sovereignty_class.allows_action(&self.action) {
            return false;
        }
        
        // 5. Check nonce (anti-replay)
        if self.nonce <= vault.last_nonce {
            return false;
        }
        
        true
    }
}
```

---

## 6. Revenue Generation (Value Accumulation)

### Revenue Streams

Vaults can accumulate value from multiple sources:

```rust
pub struct RevenueStream {
    pub stream_id: String,
    pub source: RevenueSource,
    pub rate: RevenueRate,
    pub started_at: i64,
    pub total_accumulated: u128,
}

pub enum RevenueSource {
    // Protocol fees
    ProtocolFees {
        protocol: String,
        fee_type: String,
    },
    
    // Royalties
    Royalties {
        collection: String,
        percentage: f64,      // 0.0-1.0
    },
    
    // Subscriptions
    Subscription {
        subscriber_count: u64,
        price_per_period: u128,
        period: u64,          // Seconds
    },
    
    // Staking rewards
    StakingRewards {
        staked_amount: u128,
        apy: f64,
    },
    
    // Yield farming
    YieldFarming {
        pool: String,
        liquidity: u128,
    },
    
    // Custom (future-proof)
    Custom {
        source_type: String,
        metadata: Vec<u8>,
    },
}

pub enum RevenueRate {
    PerBlock(u128),           // X tokens per block
    PerDay(u128),             // X tokens per day
    PerTransaction(u128),     // X tokens per tx
    Percentage(f64),          // X% of source
}
```

### Auto-Compounding

Vaults can auto-compound revenue:

```rust
pub struct AutoCompoundRule {
    pub enabled: bool,
    pub compound_interval: u64,       // Seconds
    pub strategy: CompoundStrategy,
}

pub enum CompoundStrategy {
    Restake,                          // Restake rewards
    BuyBack { token: String },        // Buy specific token
    Distribute { recipients: Vec<String> },  // Split to addresses
    Hold,                             // Just accumulate
}
```

---

## 7. Escrow and Conditional Release

### Escrow Vault

```rust
pub struct EscrowVault {
    pub depositor: PublicKey,
    pub beneficiary: PublicKey,
    pub arbitrator: Option<PublicKey>,
    
    pub release_conditions: Vec<ReleaseCondition>,
    pub expiry: i64,
    
    pub contents: VaultContents,
}

pub enum ReleaseCondition {
    // Time-based
    TimeDelay { release_at: i64 },
    
    // Signature-based
    BeneficiarySignature,
    ArbitratorSignature,
    BothSignatures,
    
    // Oracle-based
    OracleConfirmation {
        oracle: String,
        condition: String,
    },
    
    // Composite
    And(Vec<ReleaseCondition>),
    Or(Vec<ReleaseCondition>),
}
```

### Use Cases

- **Trades**: Atomic swap escrow
- **Services**: Payment on delivery
- **Disputes**: Arbitrator release
- **Insurance**: Claims processing

---

## 8. Delegation and Operators

### Temporary Delegation

Namespace owners can delegate vault access **without transferring ownership**:

```rust
pub struct Delegation {
    pub operator: PublicKey,
    pub permissions: Vec<Permission>,
    pub expiry: i64,
    pub revocable: bool,
}

pub enum Permission {
    ViewBalance,
    Deposit,
    WithdrawLimited { max_amount: u128 },
    Transfer,
    Execute { allowed_contracts: Vec<String> },
    Manage,  // Full control except transfer namespace
}
```

### Use Cases

- **Trading bots**: Limited withdrawal permissions
- **Custodians**: View-only access
- **DApps**: Execute permissions for specific contracts
- **Family members**: Limited spending access

---

## 9. Smart Contract Execution

### Vault as Execution Context

Vaults can **execute smart contracts** on behalf of the namespace:

```rust
pub struct ContractCall {
    pub vault_address: String,
    pub target_contract: String,
    pub function_signature: String,
    pub calldata: Vec<u8>,
    pub value: u128,             // Native tokens to send
    pub gas_limit: u64,
}

impl Vault {
    pub fn execute_contract(
        &self,
        call: ContractCall,
        proof: NamespaceProof,
    ) -> Result<ExecutionResult, Error> {
        // 1. Verify namespace ownership
        proof.verify()?;
        
        // 2. Check permissions
        if !self.allows_execution(&call.target_contract) {
            return Err(Error::Unauthorized);
        }
        
        // 3. Execute call
        let result = execute_on_chain(call)?;
        
        Ok(result)
    }
}
```

### Use Cases

- **DeFi**: Interact with lending, DEXs, yield farms
- **NFTs**: Mint, trade, list on marketplaces
- **Governance**: Vote in DAOs
- **Staking**: Stake/unstake from validators

---

## 10. Multi-Chain Support (Future)

### Cross-Chain Vaults

Namespaces can have vaults on **multiple chains**:

```rust
pub struct CrossChainVault {
    pub namespace_hash: [u8; 32],
    pub chain: Chain,
    pub address: String,
    pub bridge_proofs: Vec<BridgeProof>,
}

pub enum Chain {
    Ethereum,
    Polygon,
    Arbitrum,
    Optimism,
    Solana,
    Custom(String),
}

pub struct BridgeProof {
    pub from_chain: Chain,
    pub to_chain: Chain,
    pub amount: u128,
    pub timestamp: i64,
    pub tx_hash: String,
}
```

### Properties

- **Same namespace** controls vaults on all chains
- **Unified identity** (namespace hash is chain-agnostic)
- **Independent balances** per chain
- **Bridge proofs** for cross-chain transfers

---

## 11. Asset-Agnostic Design

### Why Asset-Agnostic?

The vault model **does not depend on**:
- Specific token standards (ERC-20, ERC-721, SPL)
- Specific chains (Ethereum, Solana, etc.)
- Specific asset types (fungible, non-fungible, RWA)

This makes it **future-proof** for assets that don't exist yet.

### Adapter Pattern

```rust
pub trait AssetAdapter {
    fn deposit(&self, vault: &Vault, asset: Asset, amount: u128) -> Result<(), Error>;
    fn withdraw(&self, vault: &Vault, asset: Asset, amount: u128) -> Result<(), Error>;
    fn balance(&self, vault: &Vault, asset: Asset) -> u128;
}

// Implementations for different chains
pub struct EthereumAdapter;
pub struct SolanaAdapter;
pub struct PolkadotAdapter;
// ... etc.
```

---

## 12. Security Model

### Isolation

- Each vault is **cryptographically isolated**
- Compromise of one vault **does not affect** others
- Vaults cannot be derived backwards to namespace

### Permissions

- Vaults enforce **least-privilege** access
- Delegations are **time-limited**
- Actions require **cryptographic proofs**

### Loss Prevention

- Namespace loss = vault loss (by design)
- No recovery mechanisms (sovereignty has consequences)
- Encourages **proper key management**

---

## 13. Vault Lifecycle

### Creation

```rust
pub fn create_vault(
    namespace: &Namespace,
    vault_type: VaultType,
    config: VaultConfig,
) -> Result<Vault, Error> {
    let index = namespace.next_vault_index();
    let address = derive_vault_address(
        &namespace.hash,
        vault_type,
        index,
    );
    
    Ok(Vault {
        namespace_hash: namespace.hash,
        vault_address: address,
        derivation_index: index,
        vault_type,
        created_at: current_timestamp(),
        last_interaction: current_timestamp(),
    })
}
```

### Sealing (Optional)

Vaults can be **sealed** (made permanent):

```rust
pub fn seal_vault(vault: &mut Vault) {
    vault.sealed = true;
    vault.sealed_at = current_timestamp();
    // After sealing:
    // - Can receive funds
    // - Cannot withdraw funds
    // - Cannot be unsealed (permanent)
}
```

---

## 14. Example Use Cases

### Use Case 1: Protocol Treasury

```rust
// Immutable namespace as protocol root
let protocol_namespace = create_namespace(
    "1.x",
    SovereigntyClass::Immutable,
    protocol_key,
);

// Treasury vault for protocol fees
let treasury = protocol_namespace.derive_vault(
    VaultType::Treasury,
    0,  // Index 0
);

// Auto-compound protocol fees
treasury.set_revenue_stream(RevenueStream {
    source: RevenueSource::ProtocolFees {
        protocol: "web3-rarity",
        fee_type: "mint_fees",
    },
    rate: RevenueRate::PerTransaction(1000),  // 0.001 token per mint
    ...
});
```

### Use Case 2: Personal Estate

```rust
// Heritable namespace with succession plan
let personal_namespace = create_namespace(
    "42.x",
    SovereigntyClass::Heritable {
        heirs: vec![
            Heir { heir_key: child1_key, share: 0.5 },
            Heir { heir_key: child2_key, share: 0.5 },
        ],
        unlock_conditions: vec![
            UnlockCondition::DeadManSwitch {
                last_proof_required_by: 365 * 24 * 3600,  // 1 year
                check_interval: 30 * 24 * 3600,            // 30 days
            },
        ],
    },
    owner_key,
);

// Multiple vaults for different asset types
let stocks_vault = personal_namespace.derive_vault(VaultType::RealWorldAssets, 0);
let crypto_vault = personal_namespace.derive_vault(VaultType::Treasury, 1);
let nft_vault = personal_namespace.derive_vault(VaultType::NonFungible, 2);
```

### Use Case 3: DAO Treasury

```rust
// Delegable namespace (multi-sig)
let dao_namespace = create_namespace(
    "dao.x",
    SovereigntyClass::Delegable {
        controllers: vec![member1, member2, member3, member4, member5],
        threshold: 3,  // 3-of-5
    },
    dao_key,
);

// Treasury with auto-compounding
let dao_treasury = dao_namespace.derive_vault(VaultType::Treasury, 0);
dao_treasury.set_auto_compound(AutoCompoundRule {
    enabled: true,
    compound_interval: 7 * 24 * 3600,  // Weekly
    strategy: CompoundStrategy::Restake,
});
```

---

## Summary

The vault model provides:

- **Sovereignty**: Vaults are controlled by namespace proofs, not keys
- **Flexibility**: Unlimited vaults per namespace, any asset type
- **Security**: Proof-based authorization, isolated vaults
- **Future-proof**: Asset-agnostic, multi-chain support
- **Value generation**: Revenue streams, auto-compounding
- **Advanced features**: Escrow, delegation, smart contract execution

Vaults are **permanent value containers**, not spending wallets.

---

**Status**: Locked at Genesis  
**Modification**: Prohibited  
**Vault Derivation**: Deterministic and Immutable
