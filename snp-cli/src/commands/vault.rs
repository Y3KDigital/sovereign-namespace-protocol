use anyhow::{Result, Context};
use colored::Colorize;
use snp_core::prelude::*;
use crate::utils::{save_json, load_json, parse_hex_32};

pub fn derive(
    namespace_file: &str,
    asset_hex: &str,
    policy_hex: &str,
    index: u32,
    output: &str,
) -> Result<()> {
    // Load namespace
    let namespace: Namespace = load_json(namespace_file)
        .context("Failed to load namespace")?;
    
    // Parse hashes
    let asset_hash = parse_hex_32(asset_hex)
        .context("Invalid asset hash")?;
    let policy_hash = parse_hex_32(policy_hex)
        .context("Invalid policy hash")?;
    
    // Derive vault
    println!("{}", "🏦 Deriving vault...".cyan());
    let vault = VaultDescriptor::derive(&namespace, asset_hash, policy_hash, index)
        .context("Failed to derive vault")?;
    
    // Verify
    vault.verify(&namespace)
        .context("Vault verification failed")?;
    
    // Save to file
    save_json(output, &vault)
        .context("Failed to save vault")?;
    
    // Display results
    println!("{}", "✅ Vault derived successfully!".green().bold());
    println!("  Vault ID: {}", vault.id_hex().bright_blue());
    println!("  Namespace: {}", format!("0x{}", hex::encode(vault.namespace_id)).bright_black());
    println!("  Asset hash: {}", format!("0x{}", hex::encode(vault.asset_hash)).bright_black());
    println!("  Policy hash: {}", format!("0x{}", hex::encode(vault.policy_hash)).bright_black());
    println!("  Index: {}", index);
    println!("  Saved to: {}", output.bright_yellow());
    
    Ok(())
}

pub fn verify(file: &str, namespace_file: &str) -> Result<()> {
    println!("{}", "🔍 Verifying vault...".cyan());
    
    // Load vault
    let vault: VaultDescriptor = load_json(file)
        .context("Failed to load vault")?;
    
    // Load namespace
    let namespace: Namespace = load_json(namespace_file)
        .context("Failed to load namespace")?;
    
    // Verify
    vault.verify(&namespace)
        .context("Vault verification failed")?;
    
    // Display results
    println!("{}", "✅ Vault verified successfully!".green().bold());
    println!("  Vault ID: {}", vault.id_hex().bright_blue());
    println!("  Namespace: {}", format!("0x{}", hex::encode(vault.namespace_id)).bright_black());
    println!("  Index: {}", vault.derivation_index);
    
    Ok(())
}
