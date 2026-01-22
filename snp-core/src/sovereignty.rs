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
    
    /// ProtocolReserved - Constitutional namespace, non-transferable except via governance
    ProtocolReserved,
    
    /// ProtocolControlled - Strategic asset, restricted transfer with governance approval
    ProtocolControlled,
}

/// Transfer policy for a namespace, derived from sovereignty class and additional rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransferPolicy {
    /// Non-transferable (Tier 0 constitutional namespaces)
    NonTransferable {
        /// Requires governance vote to override
        governance_override: bool,
        /// Can delegate subdomains
        subdomain_delegation: bool,
        /// Cannot be revoked (permanent)
        revocation: bool,
    },
    
    /// Restricted transfer (Tier 1 strategic assets)
    Restricted {
        /// Requires governance approval
        governance_approval: bool,
        /// Minimum holding period in seconds (365 days = 31536000)
        minimum_hold_period: u64,
        /// Can delegate subdomains
        subdomain_delegation: bool,
        /// Protocol revenue share percentage (0-100)
        revenue_share_percentage: u8,
        /// Protocol can revoke if terms violated
        revocation_allowed: bool,
    },
    
    /// Market transfer (Tier 2+ market names)
    Market {
        /// Freely transferable
        freely_transferable: bool,
        /// Maximum subdomain depth allowed
        subdomain_depth: u8,
        /// Protocol fee percentage on transfers (0-100)
        protocol_fee_percentage: u8,
        /// Royalty percentage on resales (0-100)
        royalty_percentage: u8,
    },
}

impl SovereigntyClass {
    /// Check if this sovereignty class allows transfers
    pub fn allows_transfer(&self) -> bool {
        matches!(self, Self::Transferable | Self::Delegable | Self::Heritable)
    }

    /// Check if this sovereignty class allows delegation
    pub fn allows_delegation(&self) -> bool {
        matches!(self, Self::Delegable | Self::ProtocolReserved | Self::ProtocolControlled)
    }

    /// Check if this sovereignty class allows inheritance setup
    pub fn allows_inheritance(&self) -> bool {
        matches!(self, Self::Heritable)
    }

    /// Check if this sovereignty class is completely frozen
    pub fn is_frozen(&self) -> bool {
        matches!(self, Self::Immutable | Self::Sealed)
    }
    
    /// Check if this sovereignty class is protocol-controlled
    pub fn is_protocol_controlled(&self) -> bool {
        matches!(self, Self::ProtocolReserved | Self::ProtocolControlled)
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
            Self::ProtocolReserved => "PROTOCOL_RESERVED",
            Self::ProtocolControlled => "PROTOCOL_CONTROLLED",
        }
    }
    
    /// Get the default transfer policy for this sovereignty class
    pub fn default_transfer_policy(&self) -> TransferPolicy {
        match self {
            Self::ProtocolReserved => TransferPolicy::NonTransferable {
                governance_override: true,
                subdomain_delegation: true,
                revocation: false,
            },
            Self::ProtocolControlled => TransferPolicy::Restricted {
                governance_approval: true,
                minimum_hold_period: 31536000, // 365 days in seconds
                subdomain_delegation: true,
                revenue_share_percentage: 20,
                revocation_allowed: true,
            },
            Self::Transferable | Self::Delegable | Self::Heritable => TransferPolicy::Market {
                freely_transferable: true,
                subdomain_depth: 3,
                protocol_fee_percentage: 2, // 2.5% rounded down for u8
                royalty_percentage: 5,
            },
            _ => TransferPolicy::NonTransferable {
                governance_override: false,
                subdomain_delegation: false,
                revocation: false,
            },
        }
    }
}

impl std::fmt::Display for SovereigntyClass {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

impl TransferPolicy {
    /// Check if a transfer is allowed under this policy
    pub fn allows_transfer(&self, governance_approved: bool, hold_period_elapsed: bool) -> bool {
        match self {
            Self::NonTransferable { governance_override, .. } => {
                *governance_override && governance_approved
            },
            Self::Restricted { governance_approval: _, .. } => {
                // governance_approval field is informational; actual check happens via parameter
                governance_approved && hold_period_elapsed
            },
            Self::Market { freely_transferable, .. } => {
                *freely_transferable
            },
        }
    }
    
    /// Check if subdomain delegation is allowed
    pub fn allows_subdomain_delegation(&self) -> bool {
        match self {
            Self::NonTransferable { subdomain_delegation, .. } => *subdomain_delegation,
            Self::Restricted { subdomain_delegation, .. } => *subdomain_delegation,
            Self::Market { .. } => true, // Always allowed for market names
        }
    }
    
    /// Get the maximum subdomain depth allowed (None = unlimited)
    pub fn max_subdomain_depth(&self) -> Option<u8> {
        match self {
            Self::NonTransferable { .. } => None, // Unlimited for protocol
            Self::Restricted { .. } => None, // Unlimited for strategic
            Self::Market { subdomain_depth, .. } => Some(*subdomain_depth),
        }
    }
    
    /// Calculate protocol fee for a transfer (in basis points, 100 = 1%)
    pub fn calculate_protocol_fee(&self, transfer_amount: u64) -> u64 {
        match self {
            Self::NonTransferable { .. } => 0, // No fee for governance transfers
            Self::Restricted { .. } => 0, // No fee for restricted transfers
            Self::Market { protocol_fee_percentage, .. } => {
                (transfer_amount * (*protocol_fee_percentage as u64)) / 100
            },
        }
    }
    
    /// Calculate royalty for a resale (in basis points)
    pub fn calculate_royalty(&self, sale_amount: u64) -> u64 {
        match self {
            Self::NonTransferable { .. } => 0,
            Self::Restricted { revenue_share_percentage, .. } => {
                (sale_amount * (*revenue_share_percentage as u64)) / 100
            },
            Self::Market { royalty_percentage, .. } => {
                (sale_amount * (*royalty_percentage as u64)) / 100
            },
        }
    }
    
    /// Check if revocation is allowed
    pub fn allows_revocation(&self) -> bool {
        match self {
            Self::NonTransferable { revocation, .. } => *revocation,
            Self::Restricted { revocation_allowed, .. } => *revocation_allowed,
            Self::Market { .. } => false,
        }
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
