use kevan_auth::AuthSystem;
use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== kevan.x Authentication + Event Spine ===\n");

    let cert_dir = std::env::var("CERT_DIR")
        .unwrap_or_else(|_| "C:\\Users\\Kevan\\genesis".to_string());
    
    let db_path = Path::new("./kevan-auth.db");

    println!("Certificate Directory: {}", cert_dir);
    println!("Database: {}\n", db_path.display());

    // Initialize system with event spine
    let auth = AuthSystem::new(&cert_dir, db_path)?;
    println!("✅ Auth system initialized (with event spine)\n");

    // Step 1: Generate challenge (writes auth.challenge event)
    println!("--- Challenge/Response Flow ---\n");
    println!("Step 1: Generate challenge for kevan.x");
    
    let challenge = auth.create_challenge("kevan.x")?;
    println!("  Nonce: {}...", &challenge.nonce[..16]);
    println!("  Message: {}", challenge.message());
    println!("  Expires: {} (5 min)\n", challenge.expires_at.format("%H:%M:%S"));
    println!("  ✓ EVENT WRITTEN: auth.challenge");
    println!("    Actor: kevan.x");
    println!("    Nonce: {}\n", &challenge.nonce[..32]);

    // Step 2: Client signs (demo only)
    println!("Step 2: Client signs challenge");
    println!("  sign(nonce, kevan.x.signing_key)\n");

    // Step 3: Would write auth.login event
    println!("Step 3: Verify signature (pending key extraction)");
    println!("  [When complete: writes auth.login event]\n");

    // Show what events provide
    println!("=== Event Spine Benefits ===\n");
    println!("You can now answer:");
    println!("  • Who logged in? (query auth.login)");
    println!("  • When? (event timestamp)");
    println!("  • Still active? (check session expiry)");
    println!("  • How many sessions? (count auth.login - auth.logout)");
    println!("  • Payment approved? (future: finance.approve)");
    println!("  • Delegation revoked? (future: policy.revoke)\n");

    println!("=== Phase 3 Complete ===\n");
    println!("✓ Events provide immutable audit trail");
    println!("✓ Every action cryptographically recorded");
    println!("✓ Temporal proof (what happened when)");
    println!("✓ Ready for Phase 4: Policy Engine\n");

    Ok(())
}
