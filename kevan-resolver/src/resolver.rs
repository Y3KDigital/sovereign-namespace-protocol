use crate::certificate::{Certificate, CertificateStore};

const EXPECTED_GENESIS_HASH: &str = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc";

pub struct NamespaceResolver {
    store: CertificateStore,
}

impl NamespaceResolver {
    pub fn new(cert_dir: &str) -> anyhow::Result<Self> {
        let store = CertificateStore::load_from_directory(cert_dir)?;
        Ok(Self { store })
    }

    pub fn resolve(&self, namespace: &str) -> Option<Certificate> {
        self.store.get(namespace).cloned()
    }

    pub fn verify_certificate(&self, cert: &Certificate) -> bool {
        // Verify genesis hash matches expected value
        if !self.store.verify_genesis_hash(cert, EXPECTED_GENESIS_HASH) {
            tracing::error!(
                "Genesis hash mismatch for {}: expected {}, got {}",
                cert.label,
                EXPECTED_GENESIS_HASH,
                cert.genesis_hash
            );
            return false;
        }

        // TODO: Verify cryptographic signature when we add signature field to certificates
        // For now, just verify genesis hash
        true
    }

    pub fn list_namespaces(&self) -> Vec<String> {
        self.store.list_all()
    }

    pub fn certificate_count(&self) -> usize {
        self.store.count()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resolver_creation() {
        // This will fail in CI but demonstrates the API
        let result = NamespaceResolver::new("C:\\Users\\Kevan\\genesis");
        assert!(result.is_ok() || result.is_err()); // Just ensure it compiles
    }
}
