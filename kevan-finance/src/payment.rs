use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Payment intent (before execution)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentIntent {
    pub id: String,
    pub from: String,
    pub to: String,
    pub amount: f64,
    pub currency: String,
    pub memo: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl PaymentIntent {
    pub fn new(from: &str, to: &str, amount: f64, currency: &str) -> Self {
        let id = Self::generate_id(from, to, amount);
        Self {
            id,
            from: from.to_string(),
            to: to.to_string(),
            amount,
            currency: currency.to_string(),
            memo: None,
            created_at: Utc::now(),
        }
    }

    pub fn with_memo(mut self, memo: &str) -> Self {
        self.memo = Some(memo.to_string());
        self
    }

    fn generate_id(from: &str, to: &str, amount: f64) -> String {
        use sha2::{Digest, Sha256};
        let timestamp = Utc::now().timestamp_nanos_opt().unwrap_or(0);
        let data = format!("{}||{}||{}||{}", from, to, amount, timestamp);
        let hash = Sha256::digest(data.as_bytes());
        format!("pay_{}", hex::encode(&hash[..16]))
    }
}

/// Payment execution result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentResult {
    pub payment_id: String,
    pub status: PaymentStatus,
    pub txid: Option<String>,
    pub route: String,
    pub executed_at: DateTime<Utc>,
    pub error: Option<String>,
}

/// Payment status
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum PaymentStatus {
    Pending,
    Executed,
    Confirmed,
    Failed,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_payment_intent_creation() {
        let intent = PaymentIntent::new("kevan.x", "alice.x", 100.0, "USD");
        assert_eq!(intent.from, "kevan.x");
        assert_eq!(intent.to, "alice.x");
        assert_eq!(intent.amount, 100.0);
        assert_eq!(intent.currency, "USD");
        assert!(intent.id.starts_with("pay_"));
    }

    #[test]
    fn test_payment_intent_with_memo() {
        let intent = PaymentIntent::new("kevan.x", "alice.x", 100.0, "USD")
            .with_memo("Coffee payment");
        assert_eq!(intent.memo, Some("Coffee payment".to_string()));
    }

    #[test]
    fn test_payment_id_uniqueness() {
        let intent1 = PaymentIntent::new("kevan.x", "alice.x", 100.0, "USD");
        let intent2 = PaymentIntent::new("kevan.x", "alice.x", 100.0, "USD");
        // IDs should be different (timestamp-based)
        assert_ne!(intent1.id, intent2.id);
    }

    #[test]
    fn test_payment_result_serialization() {
        let result = PaymentResult {
            payment_id: "pay_123".to_string(),
            status: PaymentStatus::Confirmed,
            txid: Some("0xabc...".to_string()),
            route: "crypto".to_string(),
            executed_at: Utc::now(),
            error: None,
        };
        let json = serde_json::to_string(&result).unwrap();
        let deserialized: PaymentResult = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.payment_id, "pay_123");
        assert_eq!(deserialized.status, PaymentStatus::Confirmed);
    }
}
