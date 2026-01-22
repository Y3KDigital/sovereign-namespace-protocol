use kevan_auth::AuthSystem;

fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter("kevan_auth=debug")
        .init();

    let cert_dir = std::env::var("CERT_DIR")
        .unwrap_or_else(|_| "C:\\Users\\Kevan\\genesis".to_string());

    let db_path = std::env::var("AUTH_DB")
        .unwrap_or_else(|_| ".\\kevan-auth.db".to_string());

    println!("=== kevan.x Authentication System ===\n");
    println!("Certificate Directory: {}", cert_dir);
    println!("Database: {}\n", db_path);

    // Create auth system
    let auth = AuthSystem::new(&cert_dir, std::path::Path::new(&db_path))?;

    println!("✅ Authentication system initialized");
    println!("\n--- Challenge/Response Flow ---\n");

    // Example: Generate challenge
    println!("Step 1: Generate challenge for kevan.x");
    let challenge = auth.create_challenge("kevan.x")?;
    println!("  Nonce: {}", &challenge.nonce[..16]);
    println!("  Message to sign: {}", challenge.message());
    println!("  Expires: {}\n", challenge.expires_at.format("%H:%M:%S"));

    println!("Step 1b: Generate challenge for konnor.x (Interop Test)");
    let challenge_konnor = auth.create_challenge("konnor.x")?;
    println!("  Nonce: {}", &challenge_konnor.nonce[..16]);
    println!("  Message to sign: {}", challenge_konnor.message());
    println!("  Expires: {}\n", challenge_konnor.expires_at.format("%H:%M:%S"));

    // In real usage, client would sign challenge.message() here
    println!("Step 2: Client signs challenge (not implemented in demo)");
    println!("  sign({}, kevan.x.signing_key)\n", &challenge.nonce[..16]);

    println!("Step 3: Verify signature and issue session");
    println!("  [Signature verification pending key extraction from certificates]\n");

    // Demonstrate session management
    println!("--- Session Management (if signature verified) ---\n");
    
    // Note: In production, this would only happen after successful signature verification
    // For demo, we show the session creation API
    println!("Session would be created with:");
    println!("  - session_id: 64-char hex");
    println!("  - namespace: kevan.x");
    println!("  - expires_at: 24 hours from now");
    println!("  - Authorization: Bearer <session_id>\n");

    println!("=== System Ready ===\n");
    println!("This replaces:");
    println!("  ✗ Email/password logins");
    println!("  ✗ OAuth providers (GitHub, Google, etc.)");
    println!("  ✗ SMS 2FA");
    println!("  ✗ Authenticator apps");
    println!("  ✗ Password managers\n");

    println!("With:");
    println!("  ✓ Cryptographic proof of namespace control");
    println!("  ✓ Zero passwords");
    println!("  ✓ Zero accounts");
    println!("  ✓ Pure sovereignty\n");

    Ok(())
}
