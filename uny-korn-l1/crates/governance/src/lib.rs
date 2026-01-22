//! Constitutional governance.
//!
//! Invariants:
//! - Governance can halt.
//! - Governance cannot mint.
//! - Governance cannot bypass TEV.

pub mod authority;
pub mod emergency_halt;
pub mod escalation;
pub mod policy_hash;
