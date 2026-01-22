use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TevDecision {
    pub decision_id: String,
    pub allowed: bool,
    pub policy_hash: String,
    pub reason: String,
}

fn normalize_policy_hash(s: &str) -> Result<String> {
    let s = s.trim();
    if !s.starts_with("0x") {
        return Err(anyhow!("policy_hash must start with 0x"));
    }
    let hex = &s[2..];
    if hex.len() != 64 {
        return Err(anyhow!("policy_hash must be 32 bytes (64 hex chars)"));
    }
    // Validate hex.
    let _bytes = hex::decode(hex).map_err(|e| anyhow!("invalid policy_hash hex: {e}"))?;
    Ok(format!("0x{}", hex.to_ascii_lowercase()))
}

/// Fail-closed: without explicit, valid TEV consensus, execution must not proceed.
pub fn require_consensus(ctx: &crate::consensus::TevContext) -> Result<TevDecision> {
    if let Some(d) = ctx.latest_decision.clone() {
        if d.allowed {
            return Ok(d);
        }
        return Err(anyhow!("TEV denied: {}", d.reason));
    }
    Err(anyhow!("TEV denied: no decision present"))
}

/// Fail-closed, and additionally require that the TEV decision is pinned to the expected
/// policy hash (genesis/governance).
pub fn require_consensus_for_policy(
    ctx: &crate::consensus::TevContext,
    expected_policy_hash: &str,
) -> Result<TevDecision> {
    let expected = normalize_policy_hash(expected_policy_hash)?;
    let d = require_consensus(ctx)?;
    let actual = normalize_policy_hash(&d.policy_hash)?;
    if actual != expected {
        return Err(anyhow!(
            "TEV denied: policy hash mismatch (expected {expected}, got {actual})"
        ));
    }
    Ok(TevDecision {
        policy_hash: actual,
        ..d
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::consensus::TevContext;

    #[test]
    fn policy_hash_pinning_rejects_mismatch_and_bad_hex() {
        let allowed = TevDecision {
            decision_id: "d1".to_string(),
            allowed: true,
            policy_hash: "0x0000000000000000000000000000000000000000000000000000000000000001".to_string(),
            reason: "ok".to_string(),
        };

        let ctx = TevContext {
            latest_decision: Some(allowed),
        };

        assert!(require_consensus_for_policy(
            &ctx,
            "0x0000000000000000000000000000000000000000000000000000000000000002"
        )
        .is_err());

        assert!(require_consensus_for_policy(&ctx, "not-hex").is_err());
    }
}
