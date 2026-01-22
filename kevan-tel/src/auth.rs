use kevan_resolver::CertificateStore;

/// Call authentication - check if caller has valid *.x certificate
pub struct CallAuth {
    cert_store: CertificateStore,
}

impl CallAuth {
    pub fn new(cert_store: CertificateStore) -> Self {
        Self { cert_store }
    }

    /// Check if phone number belongs to a verified namespace
    ///
    /// For now, this is a placeholder. Full implementation would:
    /// 1. Query namespace registry for phone number mappings
    /// 2. Check if caller's phone number is registered to a *.x namespace
    /// 3. Verify certificate is valid
    ///
    /// Example: alice.x registers +15551234567 → verify certificate
    pub fn is_authenticated(&self, phone_number: &str) -> Option<String> {
        // Interoperability Test: Hardcoded lookup for kevan.x
        if phone_number == "+13212788323" {
            // Verify we have kevan.x certificate
            if self.has_certificate("kevan.x") {
                 return Some("kevan.x".to_string());
            }
        }

        // TODO: Implement phone number → namespace lookup
        // For now, return None (unauthenticated)
        let _ = phone_number;
        None
    }

    /// Check if namespace is in our certificate store
    pub fn has_certificate(&self, namespace: &str) -> bool {
        self.cert_store.get(namespace).is_some()
    }

    /// Allowlist check - bypass authentication for specific numbers
    ///
    /// Use for emergency services, important contacts, etc.
    pub fn is_allowlisted(&self, _phone_number: &str) -> bool {
        // TODO: Load allowlist from config/database
        false
    }
}

/// Authentication decision
#[derive(Debug, Clone, PartialEq)]
pub enum AuthDecision {
    /// Caller has valid *.x certificate
    Authenticated { namespace: String },
    /// Caller on allowlist (bypass)
    Allowlisted,
    /// Caller not authenticated (reject)
    Rejected,
}

impl AuthDecision {
    pub fn is_allowed(&self) -> bool {
        matches!(self, AuthDecision::Authenticated { .. } | AuthDecision::Allowlisted)
    }

    pub fn namespace(&self) -> Option<&str> {
        match self {
            AuthDecision::Authenticated { namespace } => Some(namespace),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn test_auth_decision_is_allowed() {
        let auth = AuthDecision::Authenticated {
            namespace: "alice.x".to_string(),
        };
        assert!(auth.is_allowed());
        assert_eq!(auth.namespace(), Some("alice.x"));

        let reject = AuthDecision::Rejected;
        assert!(!reject.is_allowed());
        assert_eq!(reject.namespace(), None);
    }

    #[test]
    fn test_call_auth_with_cert_store() {
        // Create empty cert store for testing
        let store = CertificateStore::new();
        let _auth = CallAuth::new(store);
    }
}
