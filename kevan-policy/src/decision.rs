use serde::{Deserialize, Serialize};

/// Policy decision result
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum PolicyDecision {
    /// Action automatically approved (e.g., amount below threshold)
    AutoApproved,
    
    /// Action approved based on approval event
    Approved,
    
    /// Action requires approval (prompt user)
    RequiresApproval,
    
    /// Action denied (with reason)
    Denied(String),
}

impl PolicyDecision {
    pub fn is_allowed(&self) -> bool {
        matches!(self, PolicyDecision::AutoApproved | PolicyDecision::Approved)
    }

    pub fn requires_user_action(&self) -> bool {
        matches!(self, PolicyDecision::RequiresApproval)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_decision_is_allowed() {
        assert!(PolicyDecision::AutoApproved.is_allowed());
        assert!(PolicyDecision::Approved.is_allowed());
        assert!(!PolicyDecision::RequiresApproval.is_allowed());
        assert!(!PolicyDecision::Denied("test".to_string()).is_allowed());
    }

    #[test]
    fn test_decision_serialization() {
        let decision = PolicyDecision::AutoApproved;
        let json = serde_json::to_string(&decision).unwrap();
        let deserialized: PolicyDecision = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized, PolicyDecision::AutoApproved);
    }
}
