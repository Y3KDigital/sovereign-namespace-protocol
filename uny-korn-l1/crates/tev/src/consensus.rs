use serde::{Deserialize, Serialize};

use crate::decision::TevDecision;

/// Minimal context provided to TEV checks.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TevContext {
    /// Latest TEV decision, if any.
    pub latest_decision: Option<TevDecision>,
}
