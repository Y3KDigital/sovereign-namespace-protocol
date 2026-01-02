use anyhow::{Result, Context};
use colored::Colorize;
use snp_core::prelude::*;
use crate::utils::save_json;

pub fn generate(seed: &str, pubkey_file: &str, seckey_file: &str) -> Result<()> {
    println!("{}", "🔑 Generating Dilithium5 keypair...".cyan());
    
    // Generate keypair from seed
    let (pubkey, seckey) = Dilithium5::keypair(seed.as_bytes())
        .context("Failed to generate keypair")?;
    
    // Save keys
    save_json(pubkey_file, &pubkey)
        .context("Failed to save public key")?;
    
    save_json(seckey_file, &seckey)
        .context("Failed to save secret key")?;
    
    // Display results
    println!("{}", "✅ Keypair generated successfully!".green().bold());
    println!("  Public key size: {} bytes", pubkey.as_bytes().len());
    println!("  Secret key size: {} bytes", seckey.as_bytes().len());
    println!("  Public key saved to: {}", pubkey_file.bright_yellow());
    println!("  Secret key saved to: {}", seckey_file.bright_red());
    println!("\n{}", "⚠️  WARNING: Keep your secret key secure!".red().bold());
    
    Ok(())
}
