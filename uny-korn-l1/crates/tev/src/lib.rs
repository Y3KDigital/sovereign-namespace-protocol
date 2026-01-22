//! TEV (Transaction / Economic Verification)
//!
//! Invariant:
//! - No TEV decision → no capital execution.

pub mod attestations;
pub mod consensus;
pub mod decision;
pub mod oracle_registry;
pub mod risk_engine;
