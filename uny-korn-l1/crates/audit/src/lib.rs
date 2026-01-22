//! Audit log: native, append-only.
//!
//! Invariant:
//! - Audit logs are append-only.
//! - Failure to log = hard failure (caller should treat as fatal).

pub mod event_log;
pub mod proofs;
pub mod retention;
