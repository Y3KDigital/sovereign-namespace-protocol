use kevan_events::{EventStore, EventType};
use crate::{Policy, PolicyRule, PolicyDecision};
use chrono::{Utc, Duration};

/// Policy engine evaluates actions against policies
pub struct PolicyEngine {
    events: EventStore,
}

impl PolicyEngine {
    pub fn new(events: EventStore) -> Self {
        Self { events }
    }

    /// Check if finance.send is allowed
    pub fn check_finance_send(
        &self,
        _actor: &str,
        amount: f64,
    ) -> Result<PolicyDecision, Box<dyn std::error::Error>> {
        let policy = Policy::finance_send_default();
        
        match &policy.rule {
            PolicyRule::AmountThreshold { threshold, .. } => {
                if amount < threshold.auto_approve_below {
                    Ok(PolicyDecision::AutoApproved)
                } else {
                    Ok(PolicyDecision::RequiresApproval)
                }
            }
            _ => Ok(PolicyDecision::Denied("Invalid policy rule".to_string())),
        }
    }

    /// Check finance.send with approval event lookup
    pub fn check_finance_send_with_approval(
        &self,
        actor: &str,
        amount: f64,
        payment_id: &str,
    ) -> Result<PolicyDecision, Box<dyn std::error::Error>> {
        let policy = Policy::finance_send_default();
        
        match &policy.rule {
            PolicyRule::AmountThreshold { threshold, approval_expires_minutes } => {
                // Small amounts auto-approve
                if amount < threshold.auto_approve_below {
                    return Ok(PolicyDecision::AutoApproved);
                }

                // Large amounts require approval - check events
                let approval = self.find_recent_approval(
                    actor,
                    "finance.send",
                    payment_id,
                    *approval_expires_minutes,
                )?;

                if approval {
                    Ok(PolicyDecision::Approved)
                } else {
                    Ok(PolicyDecision::RequiresApproval)
                }
            }
            _ => Ok(PolicyDecision::Denied("Invalid policy rule".to_string())),
        }
    }

    /// Check if vault.delete is allowed
    pub fn check_vault_delete(
        &self,
        actor: &str,
        file_id: &str,
    ) -> Result<PolicyDecision, Box<dyn std::error::Error>> {
        let policy = Policy::vault_delete_default();
        
        match &policy.rule {
            PolicyRule::RequireApproval { approval_expires_minutes } => {
                let approval = self.find_recent_approval(
                    actor,
                    "vault.delete",
                    file_id,
                    *approval_expires_minutes,
                )?;

                if approval {
                    Ok(PolicyDecision::Approved)
                } else {
                    Ok(PolicyDecision::RequiresApproval)
                }
            }
            _ => Ok(PolicyDecision::Denied("Invalid policy rule".to_string())),
        }
    }

    /// Find recent approval event for action
    fn find_recent_approval(
        &self,
        actor: &str,
        action: &str,
        resource_id: &str,
        expires_minutes: u32,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        let approvals = self.events.find_by_actor(
            actor,
            Some(EventType::PolicyApprove),
            100,
        )?;

        let cutoff = Utc::now() - Duration::minutes(expires_minutes as i64);

        for event in approvals {
            // Check if approval is recent
            if event.timestamp < cutoff {
                continue;
            }

            // Check if approval matches action
            if let Some(event_action) = event.payload.get("action").and_then(|v| v.as_str()) {
                if event_action != action {
                    continue;
                }
            } else {
                continue;
            }

            // Check if approval matches resource
            let matches_resource = if let Some(event_resource) = event.payload.get("payment_id")
                .or_else(|| event.payload.get("file_id"))
                .and_then(|v| v.as_str())
            {
                event_resource == resource_id
            } else {
                false
            };

            if matches_resource {
                return Ok(true);
            }
        }

        Ok(false)
    }

    /// Write approval event (for user approval flow)
    pub fn approve_action(
        &self,
        actor: &str,
        action: &str,
        resource_id: &str,
        metadata: serde_json::Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let event = kevan_events::Event::new(
            actor,
            EventType::PolicyApprove,
            serde_json::json!({
                "action": action,
                "payment_id": resource_id,
                "metadata": metadata,
            })
        );

        self.events.write(&event)?;
        Ok(())
    }

    /// Write denial event
    pub fn deny_action(
        &self,
        actor: &str,
        action: &str,
        resource_id: &str,
        reason: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let event = kevan_events::Event::new(
            actor,
            EventType::PolicyDeny,
            serde_json::json!({
                "action": action,
                "resource_id": resource_id,
                "reason": reason,
            })
        );

        self.events.write(&event)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    use std::path::Path;

    #[test]
    fn test_auto_approve_small_payment() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let events = EventStore::new(&db_path).unwrap();
        let engine = PolicyEngine::new(events);

        let decision = engine.check_finance_send("kevan.x", 50.0).unwrap();
        assert_eq!(decision, PolicyDecision::AutoApproved);
    }

    #[test]
    fn test_require_approval_large_payment() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let events = EventStore::new(&db_path).unwrap();
        let engine = PolicyEngine::new(events);

        let decision = engine.check_finance_send("kevan.x", 500.0).unwrap();
        assert_eq!(decision, PolicyDecision::RequiresApproval);
    }

    #[test]
    fn test_approved_with_recent_event() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let events = EventStore::new(&db_path).unwrap();
        let engine = PolicyEngine::new(events);

        // Write approval
        engine.approve_action(
            "kevan.x",
            "finance.send",
            "payment123",
            serde_json::json!({"amount": 500.0})
        ).unwrap();

        let decision = engine.check_finance_send_with_approval(
            "kevan.x",
            500.0,
            "payment123"
        ).unwrap();

        assert_eq!(decision, PolicyDecision::Approved);
    }
}
