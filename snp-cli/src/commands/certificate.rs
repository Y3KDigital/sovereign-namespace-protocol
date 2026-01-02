use anyhow::{Result, Context};
use colored::Colorize;
use snp_core::prelude::*;
use crate::utils::{save_json, load_json, parse_hex_32, current_timestamp};

pub fn issue(
    identity_file: &str,
    namespace_file: &str,
    seckey_file: &str,
    claims_hex: &str,
    issued_at: u64,
    expires_at: u64,
    output: &str,
) -> Result<()> {
    // Load identity
    let identity: Identity = load_json(identity_file)
        .context("Failed to load identity")?;
    
    // Load namespace
    let namespace: Namespace = load_json(namespace_file)
        .context("Failed to load namespace")?;
    
    // Load secret key
    let seckey: DilithiumSecretKey = load_json(seckey_file)
        .context("Failed to load secret key")?;
    
    // Parse claims root
    let claims_root = parse_hex_32(claims_hex)
        .context("Invalid claims root hash")?;
    
    // Use current time if issued_at is 0
    let issued_at = if issued_at == 0 {
        current_timestamp()
    } else {
        issued_at
    };
    
    // Generate certificate
    println!("{}", "📜 Issuing certificate...".cyan());
    let cert = Certificate::generate(
        &identity,
        &namespace,
        claims_root,
        issued_at,
        expires_at,
        &seckey,
    ).context("Failed to generate certificate")?;
    
    // Verify
    cert.verify(&identity)
        .context("Certificate verification failed")?
        .then_some(())
        .context("Certificate signature invalid")?;
    
    // Save to file
    save_json(output, &cert)
        .context("Failed to save certificate")?;
    
    // Display results
    println!("{}", "✅ Certificate issued successfully!".green().bold());
    println!("  Subject: {}", format!("0x{}", hex::encode(cert.subject)).bright_blue());
    println!("  Namespace: {}", format!("0x{}", hex::encode(cert.namespace)).bright_black());
    println!("  Issued at: {}", issued_at);
    println!("  Expires at: {}", if expires_at == 0 { "Never".to_string() } else { expires_at.to_string() });
    println!("  Content hash: {}", format!("0x{}", hex::encode(cert.content_hash())).bright_cyan());
    println!("  Saved to: {}", output.bright_yellow());
    
    Ok(())
}

pub fn verify(file: &str, identity_file: &str, current_time: u64) -> Result<()> {
    println!("{}", "🔍 Verifying certificate...".cyan());
    
    // Load certificate
    let cert: Certificate = load_json(file)
        .context("Failed to load certificate")?;
    
    // Load identity
    let identity: Identity = load_json(identity_file)
        .context("Failed to load identity")?;
    
    // Verify signature
    let sig_valid = cert.verify(&identity)
        .context("Certificate verification failed")?;
    
    if !sig_valid {
        anyhow::bail!("Certificate signature is invalid");
    }
    
    // Check temporal validity
    let current_time = if current_time == 0 {
        current_timestamp()
    } else {
        current_time
    };
    
    let time_valid = cert.is_valid_at(current_time);
    
    // Display results
    println!("{}", "Certificate Status:".bold());
    println!("  Signature: {}", if sig_valid { "✅ VALID".green() } else { "❌ INVALID".red() });
    println!("  Temporal validity: {}", if time_valid { "✅ VALID".green() } else { "❌ EXPIRED".red() });
    println!("  Subject: {}", format!("0x{}", hex::encode(cert.subject)).bright_blue());
    println!("  Issued at: {}", cert.issued_at);
    println!("  Expires at: {}", if cert.expires_at == 0 { "Never".to_string() } else { cert.expires_at.to_string() });
    println!("  Current time: {}", current_time);
    
    if sig_valid && time_valid {
        println!("\n{}", "✅ Certificate is VALID".green().bold());
        Ok(())
    } else {
        anyhow::bail!("Certificate is invalid")
    }
}
