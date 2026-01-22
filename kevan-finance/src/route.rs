use serde::{Deserialize, Serialize};

/// Payment routes available
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum PaymentRoute {
    /// Crypto (BTC/ETH/SOL/USDC) - instant, low fee
    Crypto,
    /// Stripe - credit card processing
    Stripe,
    /// ACH - direct bank transfer
    ACH,
    /// PayPal - legacy compatibility
    PayPal,
}

impl PaymentRoute {
    /// Smart routing based on amount
    ///
    /// - <$100: crypto (instant, low fee)
    /// - $100-$10K: Stripe (2.9% + 30¢)
    /// - >$10K: ACH (secure, direct)
    pub fn choose_route(amount: f64) -> Self {
        if amount < 100.0 {
            PaymentRoute::Crypto
        } else if amount < 10000.0 {
            PaymentRoute::Stripe
        } else {
            PaymentRoute::ACH
        }
    }

    /// Get route name for logging
    pub fn as_str(&self) -> &'static str {
        match self {
            PaymentRoute::Crypto => "crypto",
            PaymentRoute::Stripe => "stripe",
            PaymentRoute::ACH => "ach",
            PaymentRoute::PayPal => "paypal",
        }
    }

    /// Estimate fee for this route
    pub fn estimate_fee(&self, amount: f64) -> f64 {
        match self {
            PaymentRoute::Crypto => {
                // USDC on Solana: ~$0.00025 per tx
                0.001
            }
            PaymentRoute::Stripe => {
                // 2.9% + $0.30
                (amount * 0.029) + 0.30
            }
            PaymentRoute::ACH => {
                // Fixed fee (varies by bank)
                0.50
            }
            PaymentRoute::PayPal => {
                // 2.99% + $0.49
                (amount * 0.0299) + 0.49
            }
        }
    }
}

/// Route decision with reasoning
#[derive(Debug, Clone)]
pub struct RouteDecision {
    pub route: PaymentRoute,
    pub reason: String,
    pub estimated_fee: f64,
}

impl RouteDecision {
    pub fn new(amount: f64) -> Self {
        let route = PaymentRoute::choose_route(amount);
        let estimated_fee = route.estimate_fee(amount);
        let reason = match route {
            PaymentRoute::Crypto => format!("Amount ${} < $100, using crypto (instant, low fee)", amount),
            PaymentRoute::Stripe => format!("Amount ${} in $100-$10K range, using Stripe", amount),
            PaymentRoute::ACH => format!("Amount ${} > $10K, using ACH (secure, direct)", amount),
            PaymentRoute::PayPal => "Manual override to PayPal".to_string(),
        };
        Self {
            route,
            reason,
            estimated_fee,
        }
    }

    pub fn with_override(route: PaymentRoute, amount: f64) -> Self {
        let estimated_fee = route.estimate_fee(amount);
        let reason = format!("Manual override to {}", route.as_str());
        Self {
            route,
            reason,
            estimated_fee,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_route_selection_small() {
        let route = PaymentRoute::choose_route(50.0);
        assert_eq!(route, PaymentRoute::Crypto);
    }

    #[test]
    fn test_route_selection_medium() {
        let route = PaymentRoute::choose_route(500.0);
        assert_eq!(route, PaymentRoute::Stripe);
    }

    #[test]
    fn test_route_selection_large() {
        let route = PaymentRoute::choose_route(15000.0);
        assert_eq!(route, PaymentRoute::ACH);
    }

    #[test]
    fn test_route_selection_boundary_100() {
        let route = PaymentRoute::choose_route(100.0);
        assert_eq!(route, PaymentRoute::Stripe);
    }

    #[test]
    fn test_route_selection_boundary_10k() {
        let route = PaymentRoute::choose_route(10000.0);
        assert_eq!(route, PaymentRoute::ACH);
    }

    #[test]
    fn test_fee_estimation_crypto() {
        let route = PaymentRoute::Crypto;
        let fee = route.estimate_fee(50.0);
        assert!(fee < 0.01); // Should be very cheap
    }

    #[test]
    fn test_fee_estimation_stripe() {
        let route = PaymentRoute::Stripe;
        let fee = route.estimate_fee(100.0);
        assert!(fee > 3.0 && fee < 4.0); // 2.9% + 0.30 = ~$3.20
    }

    #[test]
    fn test_route_decision_creation() {
        let decision = RouteDecision::new(75.0);
        assert_eq!(decision.route, PaymentRoute::Crypto);
        assert!(decision.reason.contains("crypto"));
        assert!(decision.estimated_fee < 0.01);
    }

    #[test]
    fn test_route_decision_override() {
        let decision = RouteDecision::with_override(PaymentRoute::PayPal, 50.0);
        assert_eq!(decision.route, PaymentRoute::PayPal);
        assert!(decision.reason.contains("override"));
    }
}
