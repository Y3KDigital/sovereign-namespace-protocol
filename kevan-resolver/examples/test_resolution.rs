use kevan_resolver::{NamespaceResolver};

fn main() -> anyhow::Result<()> {
    // Load certificates
    let cert_dir = std::env::var("CERT_DIR")
        .unwrap_or_else(|_| "C:\\Users\\Kevan\\genesis".to_string());
    
    println!("Loading certificates from: {}", cert_dir);
    
    let resolver = NamespaceResolver::new(&cert_dir)?;
    
    println!("\n✅ Loaded {} certificates\n", resolver.certificate_count());
    
    // List all namespaces
    println!("Available namespaces:");
    for ns in resolver.list_namespaces() {
        println!("  - {}", ns);
    }
    
    // Test resolution
    println!("\n--- Testing Resolution ---\n");
    
    let test_namespaces = vec!["kevan.x", "kevan.finance.x", "law.l", "bank.b", "x"];
    
    for ns in test_namespaces {
        match resolver.resolve(ns) {
            Some(cert) => {
                println!("✓ Resolved: {}", ns);
                println!("  ID: {}", cert.id);
                println!("  Sovereignty: {}", cert.sovereignty);
                println!("  Genesis: {}...", &cert.genesis_hash[..18]);
                
                let verified = resolver.verify_certificate(&cert);
                println!("  Verified: {}\n", if verified { "✓" } else { "✗" });
            }
            None => {
                println!("✗ Not found: {}\n", ns);
            }
        }
    }
    
    Ok(())
}
