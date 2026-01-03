use crate::utils::{load_json, save_json};
use anyhow::{Context, Result};
use colored::Colorize;
use snp_core::prelude::*;

pub fn create(namespace_file: &str, subject: &str, pubkey_file: &str, output: &str) -> Result<()> {
    // Load namespace
    let namespace: Namespace = load_json(namespace_file).context("Failed to load namespace")?;

    // Load public key
    let pubkey: DilithiumPublicKey = load_json(pubkey_file).context("Failed to load public key")?;

    // Derive identity
    println!("{}", "👤 Creating identity...".cyan());
    let identity =
        Identity::derive(&namespace, subject, pubkey).context("Failed to derive identity")?;

    // Verify
    identity
        .verify(&namespace)
        .context("Identity verification failed")?;

    // Save to file
    save_json(output, &identity).context("Failed to save identity")?;

    // Display results
    println!("{}", "✅ Identity created successfully!".green().bold());
    println!("  Subject: {}", identity.subject);
    println!("  ID: {}", identity.id_hex().bright_blue());
    println!(
        "  Namespace: {}",
        format!("0x{}", hex::encode(identity.namespace_id)).bright_black()
    );
    println!("  Saved to: {}", output.bright_yellow());

    Ok(())
}

pub fn verify(file: &str, namespace_file: &str) -> Result<()> {
    println!("{}", "🔍 Verifying identity...".cyan());

    // Load identity
    let identity: Identity = load_json(file).context("Failed to load identity")?;

    // Load namespace
    let namespace: Namespace = load_json(namespace_file).context("Failed to load namespace")?;

    // Verify
    identity
        .verify(&namespace)
        .context("Identity verification failed")?;

    // Display results
    println!("{}", "✅ Identity verified successfully!".green().bold());
    println!("  Subject: {}", identity.subject);
    println!("  ID: {}", identity.id_hex().bright_blue());
    println!(
        "  Namespace: {}",
        format!("0x{}", hex::encode(identity.namespace_id)).bright_black()
    );

    Ok(())
}
