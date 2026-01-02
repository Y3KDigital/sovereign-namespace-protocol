use anyhow::{Context, Result};
use colored::*;
use snp_core::prelude::*;
use crate::utils::{load_json, save_json, parse_hex_32, current_timestamp};

/// Transfer namespace ownership (Transferable only)
pub fn transfer(
    namespace_file: &str,
    new_owner: &str,
    seckey_file: &str,
    output: &str,
    nonce: u64,
) -> Result<()> {
    println!("{}", "🔄 Creating transfer transition...".cyan());
    
    // Load namespace
    let namespace: Namespace = load_json(namespace_file)
        .with_context(|| format!("Failed to load namespace from {}", namespace_file))?;
    
    // Load secret key
    let seckey: DilithiumSecretKey = load_json(seckey_file)
        .with_context(|| format!("Failed to load secret key from {}", seckey_file))?;
    
    // Parse new owner
    let new_owner_hash = parse_hex_32(new_owner)
        .with_context(|| "Failed to parse new owner hash")?;
    
    // Create transfer transition
    let timestamp = current_timestamp();
    let transition = SovereigntyTransition::create_transfer(
        &namespace,
        new_owner_hash,
        &seckey,
        timestamp,
        nonce,
    )?;
    
    // Save transition
    save_json(output, &transition)?;
    
    println!("{}", "✅ Transfer transition created successfully!".green());
    println!("  {} 0x{}", "Namespace:".bold(), hex::encode(&namespace.id[..8]));
    println!("  {} 0x{}", "New Owner:".bold(), hex::encode(&new_owner_hash[..8]));
    println!("  {} {}", "Timestamp:".bold(), timestamp);
    println!("  {} {}", "Nonce:".bold(), nonce);
    println!("  {} {}", "Saved to:".bold(), output);
    
    Ok(())
}

/// Delegate namespace authority (Delegable only)
pub fn delegate(
    namespace_file: &str,
    delegates: Vec<String>,
    threshold: u32,
    seckey_file: &str,
    output: &str,
    nonce: u64,
) -> Result<()> {
    println!("{}", "👥 Creating delegation transition...".cyan());
    
    // Load namespace
    let namespace: Namespace = load_json(namespace_file)
        .with_context(|| format!("Failed to load namespace from {}", namespace_file))?;
    
    // Load secret key
    let seckey: DilithiumSecretKey = load_json(seckey_file)
        .with_context(|| format!("Failed to load secret key from {}", seckey_file))?;
    
    // Parse delegate hashes
    let delegate_hashes: Result<Vec<[u8; 32]>> = delegates
        .iter()
        .map(|d| parse_hex_32(d).with_context(|| format!("Failed to parse delegate: {}", d)))
        .collect();
    let delegate_hashes = delegate_hashes?;
    
    // Create delegation transition
    let timestamp = current_timestamp();
    let transition = SovereigntyTransition::create_delegation(
        &namespace,
        delegate_hashes.clone(),
        threshold,
        &seckey,
        timestamp,
        nonce,
    )?;
    
    // Save transition
    save_json(output, &transition)?;
    
    println!("{}", "✅ Delegation transition created successfully!".green());
    println!("  {} 0x{}", "Namespace:".bold(), hex::encode(&namespace.id[..8]));
    println!("  {} {}", "Delegates:".bold(), delegate_hashes.len());
    println!("  {} {} of {}", "Threshold:".bold(), threshold, delegate_hashes.len());
    println!("  {} {}", "Timestamp:".bold(), timestamp);
    println!("  {} {}", "Nonce:".bold(), nonce);
    println!("  {} {}", "Saved to:".bold(), output);
    
    Ok(())
}

/// Execute succession (Heritable only)
pub fn inherit(
    namespace_file: &str,
    heir: &str,
    condition_proof: &str,
    seckey_file: &str,
    output: &str,
    nonce: u64,
) -> Result<()> {
    println!("{}", "👑 Creating succession transition...".cyan());
    
    // Load namespace
    let namespace: Namespace = load_json(namespace_file)
        .with_context(|| format!("Failed to load namespace from {}", namespace_file))?;
    
    // Load secret key
    let seckey: DilithiumSecretKey = load_json(seckey_file)
        .with_context(|| format!("Failed to load secret key from {}", seckey_file))?;
    
    // Parse heir and condition proof
    let heir_hash = parse_hex_32(heir)
        .with_context(|| "Failed to parse heir hash")?;
    let condition_hash = parse_hex_32(condition_proof)
        .with_context(|| "Failed to parse condition proof hash")?;
    
    // Create succession transition
    let timestamp = current_timestamp();
    let transition = SovereigntyTransition::create_succession(
        &namespace,
        heir_hash,
        condition_hash,
        &seckey,
        timestamp,
        nonce,
    )?;
    
    // Save transition
    save_json(output, &transition)?;
    
    println!("{}", "✅ Succession transition created successfully!".green());
    println!("  {} 0x{}", "Namespace:".bold(), hex::encode(&namespace.id[..8]));
    println!("  {} 0x{}", "Heir:".bold(), hex::encode(&heir_hash[..8]));
    println!("  {} 0x{}", "Condition:".bold(), hex::encode(&condition_hash[..8]));
    println!("  {} {}", "Timestamp:".bold(), timestamp);
    println!("  {} {}", "Nonce:".bold(), nonce);
    println!("  {} {}", "Saved to:".bold(), output);
    
    Ok(())
}

/// Seal namespace permanently
pub fn seal(
    namespace_file: &str,
    seckey_file: &str,
    output: &str,
    nonce: u64,
    confirm: bool,
) -> Result<()> {
    if !confirm {
        eprintln!("{}", "❌ ERROR: Sealing is irreversible. Use --confirm to proceed.".red());
        std::process::exit(1);
    }
    
    println!("{}", "🔒 Creating seal transition...".cyan());
    println!("{}", "⚠️  WARNING: This action is IRREVERSIBLE!".yellow().bold());
    
    // Load namespace
    let namespace: Namespace = load_json(namespace_file)
        .with_context(|| format!("Failed to load namespace from {}", namespace_file))?;
    
    // Load secret key
    let seckey: DilithiumSecretKey = load_json(seckey_file)
        .with_context(|| format!("Failed to load secret key from {}", seckey_file))?;
    
    // Create seal transition
    let timestamp = current_timestamp();
    let transition = SovereigntyTransition::create_seal(
        &namespace,
        &seckey,
        timestamp,
        nonce,
    )?;
    
    // Save transition
    save_json(output, &transition)?;
    
    println!("{}", "✅ Seal transition created successfully!".green());
    println!("  {} 0x{}", "Namespace:".bold(), hex::encode(&namespace.id[..8]));
    println!("  {} SEALED (irreversible)", "Status:".bold().red());
    println!("  {} {}", "Timestamp:".bold(), timestamp);
    println!("  {} {}", "Nonce:".bold(), nonce);
    println!("  {} {}", "Saved to:".bold(), output);
    
    Ok(())
}

/// Verify a sovereignty transition
pub fn verify(
    transition_file: &str,
    pubkey_file: &str,
) -> Result<()> {
    println!("{}", "🔍 Verifying transition...".cyan());
    
    // Load transition
    let transition: SovereigntyTransition = load_json(transition_file)
        .with_context(|| format!("Failed to load transition from {}", transition_file))?;
    
    // Load public key
    let pubkey: DilithiumPublicKey = load_json(pubkey_file)
        .with_context(|| format!("Failed to load public key from {}", pubkey_file))?;
    
    // Verify transition
    let is_valid = transition.verify(&pubkey)?;
    
    if is_valid {
        println!("{}", "✅ Transition is VALID".green().bold());
        println!("  {} 0x{}", "Namespace:".bold(), hex::encode(&transition.namespace_id[..8]));
        println!("  {} {:?}", "Type:".bold(), transition.transition_type);
        println!("  {} {}", "Timestamp:".bold(), transition.timestamp);
        println!("  {} {}", "Nonce:".bold(), transition.proof.nonce);
    } else {
        println!("{}", "❌ Transition is INVALID".red().bold());
        std::process::exit(1);
    }
    
    Ok(())
}
