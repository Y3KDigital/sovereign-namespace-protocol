use anyhow::{anyhow, Result};

use uny_korn_audit::event_log::AuditLog;
use uny_korn_tev::consensus::TevContext;

use crate::capital_gate;

pub fn mint(
    tev_ctx: &TevContext,
    expected_policy_hash: &str,
    audit: &mut AuditLog,
    amount: u64,
) -> Result<()> {
    if amount == 0 {
        return Err(anyhow!("amount must be > 0"));
    }

    capital_gate::require_tev_and_execute_for_policy(tev_ctx, expected_policy_hash, audit, |audit| {
        audit.append("mint", serde_json::json!({"amount": amount}))?;
        Ok(())
    })
}
