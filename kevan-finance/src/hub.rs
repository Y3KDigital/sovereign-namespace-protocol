use crate::payment::{PaymentIntent, PaymentResult, PaymentStatus};
use crate::route::{PaymentRoute, RouteDecision};
use chrono::Utc;
use kevan_events::{Event, EventStore, EventType};
use serde_json::json;
use std::error::Error;

/// Universal payment hub
///
/// Orchestrates payments across multiple routes:
/// - Crypto (XRPL, Solana)
/// - Stripe (credit cards)
/// - ACH (direct bank transfer)
/// - PayPal (legacy)
///
/// Integrates with policy engine and event spine.
pub struct FinanceHub {
    events: EventStore,
}

impl FinanceHub {
    pub fn new(events: EventStore) -> Self {
        Self { events }
    }

    /// Send payment with smart routing
    ///
    /// Process:
    /// 1. Write finance.intent event
    /// 2. Choose route based on amount
    /// 3. Execute payment (stub for now)
    /// 4. Write finance.execute event
    /// 5. Write finance.complete or finance.fail event
    pub fn send(&self, intent: &PaymentIntent) -> Result<PaymentResult, Box<dyn Error>> {
        // Step 1: Write intent event
        self.write_intent_event(intent)?;

        // Step 2: Choose route
        let decision = RouteDecision::new(intent.amount);

        // Step 3: Execute payment (stub - will integrate with actual providers)
        let txid = self.execute_payment(intent, &decision)?;

        // Step 4: Write execute event
        self.write_execute_event(intent, &decision, &txid)?;

        // Step 5: Create result
        let result = PaymentResult {
            payment_id: intent.id.clone(),
            status: PaymentStatus::Executed,
            txid: Some(txid.clone()),
            route: decision.route.as_str().to_string(),
            executed_at: Utc::now(),
            error: None,
        };

        // Step 6: Write complete event
        self.write_complete_event(&result)?;

        Ok(result)
    }

    /// Get payment history for actor
    pub fn get_history(&self, actor: &str, limit: usize) -> Result<Vec<Event>, Box<dyn Error>> {
        // Query finance.* events for this actor
        let mut history = Vec::new();
        
        // Get all event types related to finance
        let types = vec![
            EventType::FinanceIntent,
            EventType::FinanceExecute,
            EventType::FinanceComplete,
            EventType::FinanceFail,
        ];

        for event_type in types {
            let events = self.events.find_by_type(event_type, limit)?;
            for event in events {
                if event.actor == actor {
                    history.push(event);
                }
            }
        }

        // Sort by timestamp (most recent first)
        history.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        history.truncate(limit);

        Ok(history)
    }

    // --- Event writers ---

    fn write_intent_event(&self, intent: &PaymentIntent) -> Result<(), Box<dyn Error>> {
        let event = Event::new(
            &intent.from,
            EventType::FinanceIntent,
            json!({
                "payment_id": intent.id,
                "to": intent.to,
                "amount": intent.amount,
                "currency": intent.currency,
                "memo": intent.memo,
            }),
        );
        self.events.write(&event)?;
        Ok(())
    }

    fn write_execute_event(
        &self,
        intent: &PaymentIntent,
        decision: &RouteDecision,
        txid: &str,
    ) -> Result<(), Box<dyn Error>> {
        let event = Event::new(
            &intent.from,
            EventType::FinanceExecute,
            json!({
                "payment_id": intent.id,
                "route": decision.route.as_str(),
                "txid": txid,
                "fee": decision.estimated_fee,
            }),
        );
        self.events.write(&event)?;
        Ok(())
    }

    fn write_complete_event(&self, result: &PaymentResult) -> Result<(), Box<dyn Error>> {
        let event_type = match result.status {
            PaymentStatus::Confirmed | PaymentStatus::Executed => EventType::FinanceComplete,
            PaymentStatus::Failed => EventType::FinanceFail,
            PaymentStatus::Pending => return Ok(()), // Don't write event yet
        };

        let event = Event::new(
            "kevan.x", // TODO: get from result
            event_type,
            json!({
                "payment_id": result.payment_id,
                "txid": result.txid,
                "status": format!("{:?}", result.status),
            }),
        );
        self.events.write(&event)?;
        Ok(())
    }

    // --- Payment execution (stubs for now) ---

    fn execute_payment(
        &self,
        intent: &PaymentIntent,
        decision: &RouteDecision,
    ) -> Result<String, Box<dyn Error>> {
        match decision.route {
            PaymentRoute::Crypto => self.execute_crypto_payment(intent),
            PaymentRoute::Stripe => self.execute_stripe_payment(intent),
            PaymentRoute::ACH => self.execute_ach_payment(intent),
            PaymentRoute::PayPal => self.execute_paypal_payment(intent),
        }
    }

    fn execute_crypto_payment(&self, _intent: &PaymentIntent) -> Result<String, Box<dyn Error>> {
        // TODO: Integrate with XRPL/Solana
        // For now, return stub txid
        Ok(format!("0x{:x}", rand::random::<u64>()))
    }

    fn execute_stripe_payment(&self, intent: &PaymentIntent) -> Result<String, Box<dyn Error>> {
        // TODO: Integrate with Stripe API
        // For now, return stub payment intent ID
        Ok(format!("pi_{}", &intent.id[4..]))
    }

    fn execute_ach_payment(&self, intent: &PaymentIntent) -> Result<String, Box<dyn Error>> {
        // TODO: Integrate with bank ACH
        // For now, return stub ACH trace number
        Ok(format!("ach_{}", &intent.id[4..]))
    }

    fn execute_paypal_payment(&self, intent: &PaymentIntent) -> Result<String, Box<dyn Error>> {
        // TODO: Integrate with PayPal API
        // For now, return stub transaction ID
        Ok(format!("pp_{}", &intent.id[4..]))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_hub() -> FinanceHub {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test-events.db");
        let events = EventStore::new(&db_path).unwrap();
        FinanceHub::new(events)
    }

    #[test]
    fn test_send_small_payment() {
        let hub = create_test_hub();
        let intent = PaymentIntent::new("kevan.x", "alice.x", 50.0, "USD");
        let result = hub.send(&intent).unwrap();
        
        assert_eq!(result.status, PaymentStatus::Executed);
        assert_eq!(result.route, "crypto");
        assert!(result.txid.is_some());
    }

    #[test]
    fn test_send_medium_payment() {
        let hub = create_test_hub();
        let intent = PaymentIntent::new("kevan.x", "bob.x", 500.0, "USD");
        let result = hub.send(&intent).unwrap();
        
        assert_eq!(result.status, PaymentStatus::Executed);
        assert_eq!(result.route, "stripe");
        assert!(result.txid.is_some());
    }

    #[test]
    fn test_send_large_payment() {
        let hub = create_test_hub();
        let intent = PaymentIntent::new("kevan.x", "charlie.x", 15000.0, "USD");
        let result = hub.send(&intent).unwrap();
        
        assert_eq!(result.status, PaymentStatus::Executed);
        assert_eq!(result.route, "ach");
        assert!(result.txid.is_some());
    }

    #[test]
    fn test_events_written() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test-events.db");
        let events = EventStore::new(&db_path).unwrap();
        let hub = FinanceHub::new(events.clone());

        let intent = PaymentIntent::new("kevan.x", "alice.x", 50.0, "USD");
        hub.send(&intent).unwrap();

        // Verify events were written
        let finance_events = events.find_by_type(EventType::FinanceIntent, 10).unwrap();
        assert_eq!(finance_events.len(), 1);
        
        let execute_events = hub.events.find_by_type(EventType::FinanceExecute, 10).unwrap();
        assert_eq!(execute_events.len(), 1);
        
        let complete_events = hub.events.find_by_type(EventType::FinanceComplete, 10).unwrap();
        assert_eq!(complete_events.len(), 1);
    }

    #[test]
    fn test_get_history() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test-events.db");
        let events = EventStore::new(&db_path).unwrap();
        let hub = FinanceHub::new(events.clone());

        // Send multiple payments
        let intent1 = PaymentIntent::new("kevan.x", "alice.x", 50.0, "USD");
        let intent2 = PaymentIntent::new("kevan.x", "bob.x", 500.0, "USD");
        hub.send(&intent1).unwrap();
        hub.send(&intent2).unwrap();

        // Get history
        let history = hub.get_history("kevan.x", 10).unwrap();
        assert!(history.len() >= 2); // At least 2 intents
    }
}
