use blake3::Hasher;

/// Policy hash is the immutable fingerprint of constitutional rules.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PolicyHash(pub [u8; 32]);

impl PolicyHash {
    pub fn from_bytes(b: [u8; 32]) -> Self {
        Self(b)
    }

    pub fn compute(policy_blob: &[u8]) -> Self {
        let mut h = Hasher::new();
        h.update(policy_blob);
        Self(*h.finalize().as_bytes())
    }

    pub fn to_hex(&self) -> String {
        format!("0x{}", hex::encode(self.0))
    }
}
