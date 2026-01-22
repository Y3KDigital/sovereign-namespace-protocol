use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Certificate {
    pub id: String,
    pub label: String,
    pub sovereignty: String,
    pub genesis_hash: String,
    pub depth: u32,
}

pub struct CertificateStore {
    certificates: HashMap<String, Certificate>,
}

impl CertificateStore {
    pub fn new() -> Self {
        Self {
            certificates: HashMap::new(),
        }
    }

    pub fn load_from_directory(dir: &str) -> anyhow::Result<Self> {
        let mut store = Self::new();

        // Load from CROWN_CERTIFICATES
        let crown_dir = Path::new(dir).join("CROWN_CERTIFICATES");
        if crown_dir.exists() {
            tracing::info!("Loading Crown certificates from: {}", crown_dir.display());
            store.load_certificates_from_path(&crown_dir)?;
        }

        // Load from SOVEREIGN_SUBNAMESPACES
        let sub_dir = Path::new(dir).join("SOVEREIGN_SUBNAMESPACES");
        if sub_dir.exists() {
            tracing::info!("Loading sub-namespace certificates from: {}", sub_dir.display());
            store.load_certificates_from_path(&sub_dir)?;
        }

        Ok(store)
    }

    fn load_certificates_from_path(&mut self, path: &Path) -> anyhow::Result<()> {
        if !path.exists() {
            tracing::warn!("Certificate directory does not exist: {}", path.display());
            return Ok(());
        }

        let entries = fs::read_dir(path)?;
        let mut loaded = 0;

        for entry in entries {
            let entry = entry?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                match self.load_certificate(&path) {
                    Ok(()) => loaded += 1,
                    Err(e) => tracing::warn!("Failed to load certificate from {}: {}", path.display(), e),
                }
            }
        }

        tracing::info!("Loaded {} certificates from {}", loaded, path.display());
        Ok(())
    }

    fn load_certificate(&mut self, path: &Path) -> anyhow::Result<()> {
        let contents = fs::read_to_string(path)?;
        let cert: Certificate = serde_json::from_str(&contents)?;
        
        // Use label as the key for lookup
        let key = cert.label.clone();
        tracing::debug!("Loaded certificate: {} (id: {})", key, cert.id);
        
        self.certificates.insert(key, cert);
        Ok(())
    }

    pub fn get(&self, namespace: &str) -> Option<&Certificate> {
        self.certificates.get(namespace)
    }

    pub fn list_all(&self) -> Vec<String> {
        let mut keys: Vec<String> = self.certificates.keys().cloned().collect();
        keys.sort();
        keys
    }

    pub fn count(&self) -> usize {
        self.certificates.len()
    }

    pub fn verify_genesis_hash(&self, cert: &Certificate, expected_hash: &str) -> bool {
        cert.genesis_hash == expected_hash
    }
}

impl Default for CertificateStore {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_certificate_deserialization() {
        let json = r#"{
            "id": "0x8fbf06705756916eeb1c84a807a71b87c2dce3d9142b1cf142cd6a9c0fbcc206",
            "label": "kevan.x",
            "sovereignty": "Immutable",
            "genesis_hash": "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc",
            "depth": 0
        }"#;

        let cert: Certificate = serde_json::from_str(json).unwrap();
        assert_eq!(cert.label, "kevan.x");
        assert_eq!(cert.sovereignty, "Immutable");
        assert_eq!(cert.depth, 0);
    }
}
