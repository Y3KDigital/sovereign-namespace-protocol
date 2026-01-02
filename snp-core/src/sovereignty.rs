use serde::{Deserialize, Serialize};
use crate::errors::{Result, SnpError};

/// Sovereignty class defines the ownership and transfer semantics of a namespace
/// 
/// These are protocol-level state machines that constrain allowed operations.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SovereigntyClass {
    /// Immutable - Never changes, never transfers, frozen forever
    Immutable,
    
    /// Transferable - Ownership can be transferred to another party
    Transferable,
    
    /// Delegable - Authority can be delegated (M-of-N multisig)
    Delegable,
    
    /// Heritable - Succession rules can be defined
    Heritable,
    
    /// Sealed - Cryptographically frozen, receive-only vault
    Sealed,
}

impl SovereigntyClass {
    /// Check if this sovereignty class allows transfers
    pub fn allows_transfer(&self) -> bool {
        matches!(self, Self::Transferable | Self::Delegable | Self::Heritable)
    }

    /// Check if this sovereignty class allows delegation
    pub fn allows_delegation(&self) -> bool {
        matches!(self, Self::Delegable)
    }

    /// Check if this sovereignty class allows inheritance setup
    pub fn allows_inheritance(&self) -> bool {
        matches!(self, Self::Heritable)
    }

    /// Check if this sovereignty class is completely frozen
    pub fn is_frozen(&self) -> bool {
        matches!(self, Self::Immutable | Self::Sealed)
    }

    /// Validate a transition from one sovereignty class to another
    /// 
    /// In general, sovereignty classes are set at creation and cannot be changed.
    /// This function exists to enforce that invariant.
    pub fn validate_transition(&self, new_class: Self) -> Result<()> {
        if self == &new_class {
            return Ok(()); // No change is always valid
        }

        // Sovereignty classes cannot be changed after creation
        Err(SnpError::InvalidSovereigntyTransition(
            format!("Cannot transition from {:?} to {:?}", self, new_class)
        ))
    }

    /// Get the string representation for hashing
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Immutable => "IMMUTABLE",
            Self::Transferable => "TRANSFERABLE",
            Self::Delegable => "DELEGABLE",
            Self::Heritable => "HERITABLE",
            Self::Sealed => "SEALED",
        }
    }
}

impl std::fmt::Display for SovereigntyClass {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sovereignty_permissions() {
        assert!(!SovereigntyClass::Immutable.allows_transfer());
        assert!(SovereigntyClass::Transferable.allows_transfer());
        assert!(SovereigntyClass::Delegable.allows_delegation());
        assert!(!SovereigntyClass::Transferable.allows_delegation());
        assert!(SovereigntyClass::Heritable.allows_inheritance());
        assert!(SovereigntyClass::Immutable.is_frozen());
        assert!(SovereigntyClass::Sealed.is_frozen());
    }

    #[test]
    fn test_sovereignty_transitions() {
        let class = SovereigntyClass::Immutable;
        
        // Same class is always valid
        assert!(class.validate_transition(SovereigntyClass::Immutable).is_ok());
        
        // Any other transition is invalid
        assert!(class.validate_transition(SovereigntyClass::Transferable).is_err());
        assert!(class.validate_transition(SovereigntyClass::Delegable).is_err());
    }
}
