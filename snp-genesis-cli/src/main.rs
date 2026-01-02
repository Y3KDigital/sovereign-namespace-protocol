use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use snp_genesis_cli::{GenesisCeremony, GenesisParameters, GenesisTranscript, EntropySources};
use std::fs;

#[derive(Parser)]
#[command(name = "snp-genesis")]
#[command(about = "Genesis ceremony tooling for Sovereign Namespace Protocol (SNP) v1.0", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Run genesis ceremony (mock mode for testing)
    RunMock {
        /// Ceremony date (ISO 8601 format)
        #[arg(short, long, default_value = "2026-01-15T00:00:00Z")]
        date: String,

        /// Output file for transcript
        #[arg(short, long, default_value = "genesis-transcript.json")]
        output: String,
    },

    /// Verify an existing genesis transcript
    Verify {
        /// Path to genesis transcript JSON
        #[arg(short, long)]
        transcript: String,
    },

    /// Show genesis ceremony phases (educational)
    Phases,

    /// Show version information
    Version,
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::RunMock { date, output } => {
            run_mock_ceremony(&date, &output)?;
        }
        Commands::Verify { transcript } => {
            verify_transcript(&transcript)?;
        }
        Commands::Phases => {
            show_phases();
        }
        Commands::Version => {
            println!("snp-genesis v1.0.0");
            println!("Sovereign Namespace Protocol Genesis Ceremony Tool");
            println!("Specification: SNP v1.0 (immutable)");
        }
    }

    Ok(())
}

fn run_mock_ceremony(ceremony_date: &str, output_file: &str) -> Result<()> {
    println!("🔮 Starting Mock Genesis Ceremony\n");
    println!("⚠️  WARNING: This is MOCK MODE for testing");
    println!("    Real ceremony requires live blockchain data\n");

    println!("📅 Ceremony Date: {}\n", ceremony_date);

    // Phase 1: Entropy Collection
    println!("=== Phase 1: Entropy Collection ===\n");

    println!("⛏️  Fetching Bitcoin block...");
    let bitcoin_block = GenesisCeremony::fetch_bitcoin_block(875000)?;
    println!("   Height: {}", bitcoin_block.height);
    println!("   Hash: {}\n", bitcoin_block.hash);

    println!("🔷 Fetching Ethereum block...");
    let ethereum_block = GenesisCeremony::fetch_ethereum_block(21000000)?;
    println!("   Height: {}", ethereum_block.height);
    println!("   Hash: {}\n", ethereum_block.hash);

    println!("🏛️  Fetching NIST beacon...");
    let nist_beacon = GenesisCeremony::fetch_nist_beacon(chrono::Utc::now().timestamp())?;
    println!("   Pulse: {}", nist_beacon.pulse_index);
    println!("   Output: {}\n", nist_beacon.output);

    println!("🌌 Fetching cosmic measurement...");
    let cosmic_source = GenesisCeremony::fetch_cosmic_measurement("genesis-001")?;
    println!("   Observatory: {}", cosmic_source.observatory);
    println!("   Value: {}\n", cosmic_source.value);

    println!("🤝 Performing MPC ceremony...");
    let participants = vec![
        "participant1".to_string(),
        "participant2".to_string(),
        "participant3".to_string(),
        "participant4".to_string(),
        "participant5".to_string(),
        "participant6".to_string(),
        "participant7".to_string(),
    ];
    let mpc_ceremony = GenesisCeremony::perform_mpc_ceremony(participants)?;
    println!("   Participants: {}", mpc_ceremony.participants.len());
    println!("   Final Output: {}\n", mpc_ceremony.final_output);

    // Phase 2: Genesis Hash Computation
    println!("=== Phase 2: Genesis Hash Computation ===\n");

    let entropy = EntropySources {
        bitcoin_block,
        ethereum_block,
        nist_beacon,
        cosmic_source,
        mpc_ceremony,
    };

    let parameters = GenesisParameters::default();
    println!("📋 Protocol Parameters:");
    println!("   Signature: {}", parameters.signature_scheme);
    println!("   Hash: {}", parameters.hash_function);
    println!("   Max Supply: {}\n", parameters.max_total_namespaces);

    println!("🧮 Computing genesis hash...");
    let genesis_hash = GenesisCeremony::compute_genesis_hash(&entropy, &parameters, ceremony_date)?;
    println!("   Genesis Hash: 0x{}\n", hex::encode(genesis_hash));

    // Phase 3: Generate Transcript
    println!("=== Phase 3: Generate Transcript ===\n");

    let transcript = GenesisTranscript {
        version: "1.0.0".to_string(),
        ceremony_date: ceremony_date.to_string(),
        entropy_sources: entropy,
        parameters,
        genesis_hash,
        key_destruction_proof: Some("mock_proof_0x123...".to_string()),
        ipfs_cid: None,
    };

    let transcript_json = serde_json::to_string_pretty(&transcript)?;
    fs::write(output_file, &transcript_json)
        .context("Failed to write transcript")?;

    println!("✅ Transcript saved: {}", output_file);
    println!("\n=== Genesis Ceremony Complete ===\n");
    println!("🔐 Genesis Hash: 0x{}", hex::encode(genesis_hash));
    println!("\n⚠️  Remember: In production, this ceremony:");
    println!("   - Uses REAL blockchain data");
    println!("   - Requires 7+ independent participants");
    println!("   - Destroys all admin keys provably");
    println!("   - Is IRREVERSIBLE and happens ONCE");

    Ok(())
}

fn verify_transcript(transcript_path: &str) -> Result<()> {
    println!("🔍 Verifying Genesis Transcript\n");

    let transcript_json = fs::read_to_string(transcript_path)
        .context("Failed to read transcript file")?;

    let transcript: GenesisTranscript = serde_json::from_str(&transcript_json)
        .context("Failed to parse transcript JSON")?;

    println!("📅 Ceremony Date: {}", transcript.ceremony_date);
    println!("🔐 Genesis Hash: 0x{}\n", hex::encode(transcript.genesis_hash));

    println!("🧮 Recomputing genesis hash...");
    let is_valid = GenesisCeremony::verify_transcript(&transcript)?;

    if is_valid {
        println!("✅ VALID - Genesis hash verified\n");
        println!("Entropy sources:");
        println!("  ⛏️  Bitcoin block: {}", transcript.entropy_sources.bitcoin_block.height);
        println!("  🔷 Ethereum block: {}", transcript.entropy_sources.ethereum_block.height);
        println!("  🏛️  NIST beacon: {}", transcript.entropy_sources.nist_beacon.pulse_index);
        println!("  🌌 Cosmic source: {}", transcript.entropy_sources.cosmic_source.observatory);
        println!("  🤝 MPC participants: {}", transcript.entropy_sources.mpc_ceremony.participants.len());
        Ok(())
    } else {
        anyhow::bail!("❌ INVALID - Genesis hash mismatch");
    }
}

fn show_phases() {
    println!("=== Genesis Ceremony Phases (from GENESIS_SPEC.md) ===\n");
    
    println!("Phase 1: Commitment (T-72 hours)");
    println!("  - Announce ceremony date publicly");
    println!("  - Specify future blockchain block heights");
    println!("  - Recruit 7+ ceremony participants\n");

    println!("Phase 2: Entropy Collection (T-0)");
    println!("  - Bitcoin block mined → extract hash");
    println!("  - Ethereum block finalized → extract hash");
    println!("  - NIST beacon publishes → capture output");
    println!("  - Cosmic observation → capture measurement");
    println!("  - MPC ceremony executes → collect entropy\n");

    println!("Phase 3: Genesis Hash Computation (T+1 hour)");
    println!("  - Aggregate all entropy sources");
    println!("  - Commit protocol parameters");
    println!("  - Compute SHA3-256 genesis hash");
    println!("  - **PUBLISH GENESIS HASH** (point of no return)\n");

    println!("Phase 4: Key Destruction (T+2 hours)");
    println!("  - Destroy all temporary admin keys");
    println!("  - Publish destruction proofs on-chain");
    println!("  - Publish ceremony transcript to IPFS");
    println!("  - Mine genesis block\n");

    println!("Phase 5: Verification (T+24 hours)");
    println!("  - Public verifies all inputs");
    println!("  - Public recomputes genesis hash independently");
    println!("  - If verified → **GENESIS IS FINAL**\n");

    println!("⚠️  After genesis:");
    println!("  - No admin keys exist");
    println!("  - No governance possible");
    println!("  - Protocol is autonomous forever");
    println!("  - Genesis hash CANNOT be changed");
}
