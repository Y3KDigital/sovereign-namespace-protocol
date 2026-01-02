use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use snp_verifier::{Certificate, NamespaceVerifier};
use std::fs;

#[derive(Parser)]
#[command(name = "snp-verify")]
#[command(about = "Stateless verification for Sovereign Namespace Protocol (SNP) v1.0", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Verify a namespace certificate
    Verify {
        /// Path to certificate JSON file
        #[arg(short, long)]
        certificate: String,

        /// Genesis hash (hex, with or without 0x prefix)
        #[arg(short, long)]
        genesis: String,

        /// Verbose output
        #[arg(short, long)]
        verbose: bool,
    },

    /// Show version information
    Version,
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Verify {
            certificate,
            genesis,
            verbose,
        } => {
            verify_certificate(&certificate, &genesis, verbose)?;
        }
        Commands::Version => {
            println!("snp-verify v1.0.0");
            println!("Sovereign Namespace Protocol Verifier");
            println!("Specification: SNP v1.0 (immutable)");
        }
    }

    Ok(())
}

fn verify_certificate(cert_path: &str, genesis_hex: &str, verbose: bool) -> Result<()> {
    // Load certificate
    if verbose {
        println!("Loading certificate: {}", cert_path);
    }

    let cert_json = fs::read_to_string(cert_path)
        .context("Failed to read certificate file")?;

    let certificate: Certificate = serde_json::from_str(&cert_json)
        .context("Failed to parse certificate JSON")?;

    if verbose {
        println!("Certificate loaded: {}", certificate.identity.namespace_id);
    }

    // Parse genesis hash
    let genesis_hex = genesis_hex.strip_prefix("0x").unwrap_or(genesis_hex);
    let genesis_bytes = hex::decode(genesis_hex)
        .context("Invalid genesis hash format")?;

    if genesis_bytes.len() != 32 {
        anyhow::bail!("Genesis hash must be exactly 32 bytes");
    }

    let mut genesis_hash = [0u8; 32];
    genesis_hash.copy_from_slice(&genesis_bytes);

    if verbose {
        println!("Genesis hash: 0x{}", hex::encode(genesis_hash));
        println!("\nVerifying...");
    }

    // Verify certificate
    let result = NamespaceVerifier::verify_complete(&certificate, &genesis_hash);

    // Display results
    println!("\n=== Verification Result ===\n");

    print_check("Genesis Binding", result.genesis_binding);
    print_check("Identity Derivation", result.identity);
    print_check("Lineage Proof", result.lineage);
    print_check("Rarity Calculation", result.rarity);
    print_check("Signature", result.signature);
    print_check("IPFS Content Hash", result.ipfs);

    println!("\n{}", "=".repeat(27));

    if result.is_valid() {
        println!("\n✅ VALID - Certificate passes all checks");
        println!("\nNamespace: {}", certificate.identity.namespace_id);
        println!("Hash: 0x{}", hex::encode(certificate.identity.namespace_hash));
        println!("Rarity: {} ({})", certificate.rarity.tier, certificate.rarity.score);
        println!("Class: {}", certificate.sovereignty.class);
        Ok(())
    } else {
        println!("\n❌ INVALID - Failed checks:");
        for check in result.failed_checks() {
            println!("  - {}", check);
        }
        anyhow::bail!("Certificate verification failed");
    }
}

fn print_check(name: &str, passed: bool) {
    let status = if passed { "✅ PASS" } else { "❌ FAIL" };
    println!("{:<25} {}", name, status);
}
