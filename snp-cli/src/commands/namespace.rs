use crate::utils::{load_json, save_json};
use anyhow::{Context, Result};
use colored::Colorize;
use snp_core::prelude::*;

pub fn create(genesis_hex: &str, label: &str, sovereignty_str: &str, output: &str) -> Result<()> {
    // Parse genesis hash
    let genesis = GenesisContext::from_hex(genesis_hex).context("Invalid genesis hash")?;

    genesis.validate().context("Genesis validation failed")?;

    // Parse sovereignty class
    let sovereignty = parse_sovereignty(sovereignty_str)?;

    // Derive namespace
    println!("{}", "📋 Creating namespace...".cyan());
    let namespace =
        Namespace::derive(&genesis, label, sovereignty).context("Failed to derive namespace")?;

    // Verify
    namespace
        .verify()
        .context("Namespace verification failed")?;

    // Save to file
    save_json(output, &namespace).context("Failed to save namespace")?;

    // Display results
    println!("{}", "✅ Namespace created successfully!".green().bold());
    println!("  Label: {}", namespace.label);
    println!("  ID: {}", namespace.id_hex().bright_blue());
    println!("  Sovereignty: {:?}", namespace.sovereignty);
    println!(
        "  Genesis: {}",
        format!("0x{}", hex::encode(namespace.genesis_hash)).bright_black()
    );
    println!("  Saved to: {}", output.bright_yellow());

    Ok(())
}

pub fn verify(file: &str) -> Result<()> {
    println!("{}", "🔍 Verifying namespace...".cyan());

    // Load namespace
    let namespace: Namespace = load_json(file).context("Failed to load namespace")?;

    // Verify
    namespace
        .verify()
        .context("Namespace verification failed")?;

    // Display results
    println!("{}", "✅ Namespace verified successfully!".green().bold());
    println!("  Label: {}", namespace.label);
    println!("  ID: {}", namespace.id_hex().bright_blue());
    println!("  Sovereignty: {:?}", namespace.sovereignty);

    Ok(())
}

fn parse_sovereignty(s: &str) -> Result<SovereigntyClass> {
    match s.to_lowercase().as_str() {
        "immutable" => Ok(SovereigntyClass::Immutable),
        "transferable" => Ok(SovereigntyClass::Transferable),
        "delegable" => Ok(SovereigntyClass::Delegable),
        "heritable" => Ok(SovereigntyClass::Heritable),
        "sealed" => Ok(SovereigntyClass::Sealed),
        _ => anyhow::bail!("Invalid sovereignty class: {}. Must be one of: immutable, transferable, delegable, heritable, sealed", s),
    }
}
