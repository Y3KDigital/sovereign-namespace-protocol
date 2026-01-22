use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Delegation {
    pub delegate: String,       // e.g., "wife.x"
    pub role: Role,
    pub permissions: Vec<Permission>,
    pub constraints: Constraints,
    // In V2 this will hold cryptographic proofs
    // pub signature: String, 
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Role {
    Family,
    Emergency,
    Observer,
    // For automated services
    Bot,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Permission {
    ApprovePayments,
    ViewVault,
    ViewStatus,
    EmergencyTrigger,
    // Specific Modules
    FinanceRead,
    FinanceWrite,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Constraints {
    pub daily_spend_limit: Option<f64>, // USD
    pub expires_at: Option<u64>,        // Timestamp
}

impl Default for Constraints {
    fn default() -> Self {
        Self {
            daily_spend_limit: Some(0.0), // Safe default
            expires_at: None,
        }
    }
}
