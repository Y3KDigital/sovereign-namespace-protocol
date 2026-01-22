use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Telnyx phone number mapped to namespace
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelnyxNumber {
    /// Original format (e.g., "+1-888-611-5384")
    pub raw: String,
    /// Namespace this number maps to (e.g., "kevan.tel.x")
    pub namespace: String,
    /// Vanity pattern (e.g., "611-JEXT")
    pub vanity: Option<String>,
}

impl TelnyxNumber {
    pub fn new(raw: &str, namespace: &str) -> Self {
        Self {
            raw: raw.to_string(),
            namespace: namespace.to_string(),
            vanity: None,
        }
    }

    pub fn with_vanity(mut self, vanity: &str) -> Self {
        self.vanity = Some(vanity.to_string());
        self
    }

    /// Convert to E.164 format (remove dashes/spaces)
    pub fn e164(&self) -> String {
        self.raw.chars().filter(|c| c.is_numeric() || *c == '+').collect()
    }

    /// Get last 4 digits
    pub fn last4(&self) -> String {
        let digits: String = self.raw.chars().filter(|c| c.is_numeric()).collect();
        digits.chars().rev().take(4).collect::<String>().chars().rev().collect()
    }
}

/// Map of phone numbers to namespaces
pub struct NumberMap {
    numbers: HashMap<String, TelnyxNumber>,
}

impl NumberMap {
    pub fn new() -> Self {
        Self {
            numbers: HashMap::new(),
        }
    }

    /// Add a number mapping
    pub fn add(&mut self, number: TelnyxNumber) {
        self.numbers.insert(number.e164(), number);
    }

    /// Lookup namespace by phone number
    pub fn lookup(&self, phone: &str) -> Option<&TelnyxNumber> {
        // Try E.164 format first
        self.numbers.get(phone)
    }

    /// List all numbers
    pub fn list(&self) -> Vec<&TelnyxNumber> {
        self.numbers.values().collect()
    }

    /// Get all numbers for a namespace
    pub fn for_namespace(&self, namespace: &str) -> Vec<&TelnyxNumber> {
        self.numbers
            .values()
            .filter(|n| n.namespace == namespace)
            .collect()
    }

    /// Load default kevan.tel.x numbers (26 from Telnyx)
    pub fn load_kevan_numbers() -> Self {
        let mut map = Self::new();
        
        // Added for Interoperability Test
        let numbers = vec![
            ("+1-321-278-8323", "kevan.tel.x", None), // Kevan's primary number
            ("+1-555-555-5555", "konnor.tel.x", None),
            ("+1-770-230-0635", "kevan.tel.x", None),
            ("+1-888-611-5384", "kevan.tel.x", Some("611-JEXT")),
            ("+1-888-474-8738", "kevan.tel.x", Some("474-TREE")),
            ("+1-877-570-9775", "kevan.tel.x", None),
            ("+1-888-678-0645", "kevan.tel.x", None),
            ("+1-866-506-2265", "kevan.tel.x", None),
            ("+1-888-712-0268", "kevan.tel.x", None),
            ("+1-888-681-2729", "kevan.tel.x", None),
            ("+1-888-344-2825", "kevan.tel.x", None),
            ("+1-478-242-4246", "kevan.tel.x", None),
            ("+1-321-559-0559", "kevan.tel.x", None),
            ("+1-909-488-7663", "kevan.tel.x", None),
            ("+1-888-974-0529", "kevan.tel.x", None),
            ("+1-888-763-1529", "kevan.tel.x", None),
            ("+1-888-676-2825", "kevan.tel.x", Some("676-DUCK")),
            ("+1-888-653-2529", "kevan.tel.x", None),
            ("+1-888-649-0529", "kevan.tel.x", None),
            ("+1-888-643-0529", "kevan.tel.x", None),
            ("+1-888-505-2924", "kevan.tel.x", None),
            ("+1-855-771-2886", "kevan.tel.x", None),
            ("+1-844-725-2460", "kevan.tel.x", None),
            ("+1-833-445-2924", "kevan.tel.x", None),
            ("+1-539-476-7663", "kevan.tel.x", None),
            ("+1-888-855-0209", "kevan.tel.x", None),
            ("+1-844-756-1580", "kevan.tel.x", None),
            ("+1-321-485-8333", "kevan.tel.x", None),
        ];

        for (raw, ns, vanity) in numbers {
            let mut number = TelnyxNumber::new(raw, ns);
            if let Some(v) = vanity {
                number = number.with_vanity(v);
            }
            map.add(number);
        }

        map
    }
}

impl Default for NumberMap {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_number_e164() {
        let num = TelnyxNumber::new("+1-888-611-5384", "kevan.tel.x");
        assert_eq!(num.e164(), "+18886115384");
    }

    #[test]
    fn test_number_last4() {
        let num = TelnyxNumber::new("+1-888-611-5384", "kevan.tel.x");
        assert_eq!(num.last4(), "5384");
    }

    #[test]
    fn test_number_with_vanity() {
        let num = TelnyxNumber::new("+1-888-611-5384", "kevan.tel.x")
            .with_vanity("611-JEXT");
        assert_eq!(num.vanity, Some("611-JEXT".to_string()));
    }

    #[test]
    fn test_number_map_lookup() {
        let mut map = NumberMap::new();
        let num = TelnyxNumber::new("+1-888-611-5384", "kevan.tel.x");
        map.add(num);

        let found = map.lookup("+18886115384");
        assert!(found.is_some());
        assert_eq!(found.unwrap().namespace, "kevan.tel.x");
    }

    #[test]
    fn test_load_kevan_numbers() {
        let map = NumberMap::load_kevan_numbers();
        
        // Should have all 26 numbers
        let kevan_numbers = map.for_namespace("kevan.tel.x");
        assert_eq!(kevan_numbers.len(), 26);

        // Check specific number
        let found = map.lookup("+18886115384");
        assert!(found.is_some());
        assert_eq!(found.unwrap().vanity, Some("611-JEXT".to_string()));
    }

    #[test]
    fn test_for_namespace() {
        let map = NumberMap::load_kevan_numbers();
        let numbers = map.for_namespace("kevan.tel.x");
        assert_eq!(numbers.len(), 26);
    }
}
