use anyhow::Result;

use uny_korn_audit::event_log::AuditLog;
use uny_korn_tev::decision;
use uny_korn_tev::consensus::TevContext;

/// Irreversible rule:
///
/// NO TEV CONSENSUS → NO EXECUTION
pub fn require_tev_and_execute<F>(tev_ctx: &TevContext, audit: &mut AuditLog, exec: F) -> Result<()>
where
    F: FnOnce(&mut AuditLog) -> Result<()>,
{
    // NOTE: This is the execution "choke point".
    // Any new capital-impacting operation must go through here.
    let tev = decision::require_consensus(tev_ctx)?;

    // Audit must succeed; callers should treat audit failures as fatal.
    audit.append(
        "tev_decision",
        serde_json::json!({
            "decision_id": tev.decision_id,
            "allowed": tev.allowed,
            "policy_hash": tev.policy_hash,
            "reason": tev.reason,
        }),
    )?;

    exec(audit)
}

/// Variant that pins the TEV decision to the expected policy hash.
pub fn require_tev_and_execute_for_policy<F>(
    tev_ctx: &TevContext,
    expected_policy_hash: &str,
    audit: &mut AuditLog,
    exec: F,
) -> Result<()>
where
    F: FnOnce(&mut AuditLog) -> Result<()>,
{
    let tev = decision::require_consensus_for_policy(tev_ctx, expected_policy_hash)?;

    audit.append(
        "tev_decision",
        serde_json::json!({
            "decision_id": tev.decision_id,
            "allowed": tev.allowed,
            "policy_hash": tev.policy_hash,
            "reason": tev.reason,
        }),
    )?;

    exec(audit)
}
