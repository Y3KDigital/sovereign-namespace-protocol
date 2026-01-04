//! # snp-core
//! 
//! Sovereign Namespace Protocol - Core Library
//! 
//! This is the foundational library for the Sovereign Namespace Protocol.
//! All namespace, identity, vault, and certificate operations are genesis-bound
//! and use post-quantum cryptography (Dilithium5).
//! 
//! ## Features
//! 
//! - **Genesis-bound**: Everything derives from a single genesis hash
//! - **Deterministic**: All IDs are cryptographically derived, not assigned
//! - **Post-quantum**: Uses Dilithium5 for signatures
//! - **Immutable**: Sovereignty classes enforce ownership semantics
//! - **Verifiable**: All artifacts can be verified offline
//! 
//! ## Usage
//! 
//! ```rust
//! use snp_core::prelude::*;
//! 
//! // Create a genesis context from the ceremony output
//! let genesis = GenesisContext::from_hex("0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc").unwrap();
//! 
//! // Derive a namespace
//! let namespace = Namespace::derive(&genesis, "my.namespace", SovereigntyClass::Immutable).unwrap();
//! 
//! // Generate a key pair
//! let (pk, sk) = Dilithium5::keypair(b"my seed").unwrap();
//! 
//! // Derive an identity
//! let identity = Identity::derive(&namespace, "user@example.com", pk).unwrap();
//! 
//! // Generate a certificate
//! let claims_root = [0u8; 32]; // Hash of claims
//! let cert = Certificate::generate(&identity, &namespace, claims_root, 1000, 0, &sk).unwrap();
//! 
//! // Verify the certificate
//! assert!(cert.verify(&identity).unwrap());
//! ```

pub mod errors;
pub mod genesis;
pub mod crypto;
pub mod sovereignty;
pub mod transitions;
pub mod namespace;
pub mod identity;
pub mod vault;
pub mod certificate;

/// Prelude - commonly used types and traits
pub mod prelude {
    pub use crate::errors::{Result, SnpError};
    pub use crate::genesis::GenesisContext;
    pub use crate::crypto::{
        Dilithium5,
        DilithiumPublicKey,
        DilithiumSecretKey,
        DilithiumSignature,
        SignatureScheme,
    };
    pub use crate::sovereignty::SovereigntyClass;
    pub use crate::transitions::{SovereigntyTransition, TransitionType, TransitionProof};
    pub use crate::namespace::{Namespace, NamespaceId};
    pub use crate::identity::{Identity, IdentityId};
    pub use crate::vault::{VaultDescriptor, VaultId};
    pub use crate::certificate::Certificate;
}
