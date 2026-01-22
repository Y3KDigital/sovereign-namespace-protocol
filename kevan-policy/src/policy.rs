use serde::{Deserialize, Serialize};

/// Policy rule defining authorization logic
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Policy {
    /// Action this policy applies to (e.g., "finance.send")
    pub action: String,
    
    /// Rule defining when action is allowed
    pub rule: PolicyRule,
}

/// Authorization rule
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum PolicyRule {
    /// Always allow (no restrictions)
    AlwaysAllow,
    
    /// Always deny
    AlwaysDeny,
    
    /// Auto-approve below threshold, require approval above
    AmountThreshold {
        threshold: AmountThreshold,
        approval_expires_minutes: u32,
    },
    
    /// Require approval for all instances
    RequireApproval {
        approval_expires_minutes: u32,
    },
    
    /// Allow if delegated to this namespace
    RequireDelegation {
        from_namespace: String,
    },
}

/// Amount-based threshold
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AmountThreshold {
    /// Auto-approve below this amount
    pub auto_approve_below: f64,
    
    /// Require approval at or above this amount
    pub require_approval_at: f64,
}

impl Policy {
    /// Create finance.send policy (auto-approve <$100, require approval >=100)
    pub fn finance_send_default() -> Self {
        Self {
            action: "finance.send".to_string(),
            rule: PolicyRule::AmountThreshold {
                threshold: AmountThreshold {
                    auto_approve_below: 100.0,
                    require_approval_at: 100.0,
                },
                approval_expires_minutes: 5,
            },
        }
    }

    /// Create vault.delete policy (always require approval)
    pub fn vault_delete_default() -> Self {
        Self {
            action: "vault.delete".to_string(),
            rule: PolicyRule::RequireApproval {
                approval_expires_minutes: 5,
            },
        }
    }

    /// Create tel.forward policy (allow if delegated)
    pub fn tel_forward_default() -> Self {
        Self {
            action: "tel.forward".to_string(),
            rule: PolicyRule::RequireDelegation {
                from_namespace: "kevan.tel.x".to_string(),
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_finance_send_policy_creation() {
        let policy = Policy::finance_send_default();
        assert_eq!(policy.action, "finance.send");
        
        match policy.rule {
            PolicyRule::AmountThreshold { threshold, .. } => {
                assert_eq!(threshold.auto_approve_below, 100.0);
            }
            _ => panic!("Expected AmountThreshold rule"),
        }
    }

    #[test]
    fn test_policy_serialization() {
        let policy = Policy::finance_send_default();
        let json = serde_json::to_string(&policy).unwrap();
        let deserialized: Policy = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.action, "finance.send");
    }
}
