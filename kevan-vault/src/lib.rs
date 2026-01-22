//! # kevan.vault.x - Sovereign Data Store
//!
//! Secure, event-logged file storage.
//! "Hold my life in it."

pub mod hub;
pub mod file;

pub use hub::VaultHub;
pub use file::VaultFile;
