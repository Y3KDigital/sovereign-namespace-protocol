//! Sovereign state primitives.
//!
//! Namespaces grant authority only.
//! They never execute, mint, or hold value.

pub mod accounts;
pub mod assets;
pub mod balances;
pub mod namespaces;
pub mod storage;

pub type Address = [u8; 32];

#[derive(Debug, Clone)]
pub struct ChainState {
    pub namespaces: namespaces::NamespaceRegistry,
    pub assets: assets::AssetRegistry,
    pub balances: balances::BalanceLedger,
}

impl Default for ChainState {
    fn default() -> Self {
        Self {
            namespaces: namespaces::NamespaceRegistry::default(),
            assets: assets::AssetRegistry::default(),
            balances: balances::BalanceLedger::default(),
        }
    }
}

impl ChainState {
    /// Deterministic commitment for consensus/state verification.
    /// 
    /// Combines commitments from all state modules (namespaces, assets, balances).
    pub fn state_root_hex(&self) -> String {
        use blake3::Hasher;

        const DOMAIN: &[u8] = b"uny-korn-state-root-v1";

        let mut hasher = Hasher::new();
        hasher.update(DOMAIN);
        hasher.update(b"|namespaces:");
        hasher.update(self.namespaces.commitment_hash_hex().as_bytes());
        hasher.update(b"|assets:");
        hasher.update(self.assets.commitment_hash_hex().as_bytes());
        hasher.update(b"|balances:");
        hasher.update(self.balances.commitment_hash_hex().as_bytes());

        hex::encode(*hasher.finalize().as_bytes())
    }
}
