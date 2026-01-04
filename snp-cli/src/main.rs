use clap::{Parser, Subcommand};
use colored::Colorize;

mod commands;
mod utils;

use commands::{namespace, identity, certificate, vault, keygen, transition, policy};

#[derive(Parser)]
#[command(name = "snp")]
#[command(about = "Sovereign Namespace Protocol - Command Line Interface", long_about = None)]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Namespace operations (create, verify)
    #[command(subcommand)]
    Namespace(NamespaceCommands),
    
    /// Identity operations (create, verify)
    #[command(subcommand)]
    Identity(IdentityCommands),
    
    /// Certificate operations (issue, verify)
    #[command(subcommand)]
    Certificate(CertificateCommands),
    
    /// Vault operations (derive, verify)
    #[command(subcommand)]
    Vault(VaultCommands),
    
    /// Key generation and management
    #[command(subcommand)]
    Keygen(KeygenCommands),
    
    /// Sovereignty transitions (transfer, delegate, inherit, seal)
    #[command(subcommand)]
    Transition(TransitionCommands),
    
    /// Policy engine (create, evaluate, verify, bind)
    #[command(subcommand)]
    Policy(PolicyCommands),
}

#[derive(Subcommand)]
enum NamespaceCommands {
    /// Create a new namespace
    Create {
        /// Genesis hash (from snp-genesis ceremony)
        #[arg(short, long)]
        genesis: String,
        
        /// Namespace label (e.g., "acme.corp")
        #[arg(short, long)]
        label: String,
        
        /// Sovereignty class (immutable, transferable, delegable, heritable, sealed)
        #[arg(short, long)]
        sovereignty: String,
        
        /// Output file for namespace
        #[arg(short, long)]
        output: String,
    },
    
    /// Verify a namespace
    Verify {
        /// Namespace file to verify
        #[arg(short, long)]
        file: String,
    },
}

#[derive(Subcommand)]
enum IdentityCommands {
    /// Create a new identity
    Create {
        /// Namespace file
        #[arg(short, long)]
        namespace: String,
        
        /// Subject identifier (e.g., "user@example.com")
        #[arg(short, long)]
        subject: String,
        
        /// Public key file (Dilithium5)
        #[arg(short, long)]
        pubkey: String,
        
        /// Output file for identity
        #[arg(short, long)]
        output: String,
    },
    
    /// Verify an identity
    Verify {
        /// Identity file to verify
        #[arg(short, long)]
        file: String,
        
        /// Namespace file
        #[arg(short, long)]
        namespace: String,
    },
}

#[derive(Subcommand)]
enum CertificateCommands {
    /// Issue a new certificate
    Issue {
        /// Identity file
        #[arg(short, long)]
        identity: String,
        
        /// Namespace file
        #[arg(short, long)]
        namespace: String,
        
        /// Secret key file (Dilithium5)
        #[arg(short, long)]
        seckey: String,
        
        /// Claims root hash (hex)
        #[arg(short, long)]
        claims: String,
        
        /// Issuance timestamp (Unix epoch, 0 = now)
        #[arg(long, default_value = "0")]
        issued_at: u64,
        
        /// Expiration timestamp (Unix epoch, 0 = never)
        #[arg(long, default_value = "0")]
        expires_at: u64,
        
        /// Output file for certificate
        #[arg(short, long)]
        output: String,
    },
    
    /// Verify a certificate
    Verify {
        /// Certificate file to verify
        #[arg(short, long)]
        file: String,
        
        /// Identity file
        #[arg(short, long)]
        identity: String,
        
        /// Current timestamp for validity check (0 = now)
        #[arg(long, default_value = "0")]
        current_time: u64,
    },
}

#[derive(Subcommand)]
enum VaultCommands {
    /// Derive a vault address
    Derive {
        /// Namespace file
        #[arg(short, long)]
        namespace: String,
        
        /// Asset hash (hex)
        #[arg(short, long)]
        asset: String,
        
        /// Policy hash (hex)
        #[arg(short, long)]
        policy: String,
        
        /// Derivation index
        #[arg(short, long, default_value = "0")]
        index: u32,
        
        /// Output file for vault
        #[arg(short, long)]
        output: String,
    },
    
    /// Verify a vault
    Verify {
        /// Vault file to verify
        #[arg(short, long)]
        file: String,
        
        /// Namespace file
        #[arg(short, long)]
        namespace: String,
    },
}

#[derive(Subcommand)]
enum KeygenCommands {
    /// Generate a Dilithium5 keypair
    Generate {
        /// Entropy seed (will be hashed with SHA3-256)
        #[arg(short, long)]
        seed: String,
        
        /// Output file for public key
        #[arg(short, long)]
        pubkey: String,
        
        /// Output file for secret key
        #[arg(short, long)]
        seckey: String,
    },
}

#[derive(Subcommand)]
enum TransitionCommands {
    /// Transfer ownership (Transferable only)
    Transfer {
        /// Namespace file
        #[arg(short, long)]
        namespace: String,
        
        /// New owner hash (hex)
        #[arg(short = 'o', long)]
        new_owner: String,
        
        /// Secret key file (current owner)
        #[arg(short, long)]
        seckey: String,
        
        /// Output file for transition proof
        #[arg(short = 'O', long)]
        output: String,
        
        /// Nonce for replay protection
        #[arg(long, default_value = "1")]
        nonce: u64,
    },
    
    /// Delegate authority (Delegable only)
    Delegate {
        /// Namespace file
        #[arg(short, long)]
        namespace: String,
        
        /// Delegate hashes (hex, comma-separated)
        #[arg(short, long, value_delimiter = ',')]
        delegates: Vec<String>,
        
        /// Threshold (M-of-N)
        #[arg(short, long)]
        threshold: u32,
        
        /// Secret key file (current owner)
        #[arg(short, long)]
        seckey: String,
        
        /// Output file for transition proof
        #[arg(short = 'O', long)]
        output: String,
        
        /// Nonce for replay protection
        #[arg(long, default_value = "1")]
        nonce: u64,
    },
    
    /// Execute succession (Heritable only)
    Inherit {
        /// Namespace file
        #[arg(short, long)]
        namespace: String,
        
        /// Heir hash (hex)
        #[arg(long)]
        heir: String,
        
        /// Condition proof hash (hex)
        #[arg(short, long)]
        condition: String,
        
        /// Secret key file (executor)
        #[arg(short, long)]
        seckey: String,
        
        /// Output file for transition proof
        #[arg(short = 'O', long)]
        output: String,
        
        /// Nonce for replay protection
        #[arg(long, default_value = "1")]
        nonce: u64,
    },
    
    /// Seal namespace permanently
    Seal {
        /// Namespace file
        #[arg(short, long)]
        namespace: String,
        
        /// Secret key file (owner)
        #[arg(short, long)]
        seckey: String,
        
        /// Output file for transition proof
        #[arg(short = 'O', long)]
        output: String,
        
        /// Nonce for replay protection
        #[arg(long, default_value = "1")]
        nonce: u64,
        
        /// Confirm irreversible action
        #[arg(long)]
        confirm: bool,
    },
    
    /// Verify a transition
    Verify {
        /// Transition file to verify
        #[arg(short, long)]
        file: String,
        
        /// Public key file (authority)
        #[arg(short, long)]
        pubkey: String,
    },
}

#[derive(Subcommand)]
enum PolicyCommands {
    /// Create a new policy
    Create {
        /// Policy name
        #[arg(short, long)]
        name: String,
        
        /// Policy version
        #[arg(short, long, default_value = "1")]
        version: u32,
        
        /// Rules file (JSON)
        #[arg(short, long)]
        rules: String,
        
        /// Secret key file (policy creator)
        #[arg(short, long)]
        seckey: String,
        
        /// Output file for policy
        #[arg(short, long)]
        output: String,
    },
    
    /// Evaluate policy against context
    Evaluate {
        /// Policy file
        #[arg(short, long)]
        policy: String,
        
        /// Evaluation context file (JSON)
        #[arg(short, long)]
        context: String,
    },
    
    /// Verify policy signature
    Verify {
        /// Policy file
        #[arg(short, long)]
        policy: String,
        
        /// Creator's public key file
        #[arg(long)]
        pubkey: String,
    },
    
    /// Bind policy to namespace
    Bind {
        /// Policy file
        #[arg(short, long)]
        policy: String,
        
        /// Namespace file
        #[arg(short, long)]
        namespace: String,
        
        /// Secret key file (binder authority)
        #[arg(short, long)]
        seckey: String,
        
        /// Output file for binding
        #[arg(short, long)]
        output: String,
    },
    
    /// List policies
    List {
        /// Optional namespace file
        #[arg(short, long)]
        namespace: Option<String>,
    },
}

fn main() {
    let cli = Cli::parse();
    
    let result = match cli.command {
        Commands::Namespace(cmd) => match cmd {
            NamespaceCommands::Create { genesis, label, sovereignty, output } => {
                namespace::create(&genesis, &label, &sovereignty, &output)
            }
            NamespaceCommands::Verify { file } => {
                namespace::verify(&file)
            }
        },
        Commands::Identity(cmd) => match cmd {
            IdentityCommands::Create { namespace, subject, pubkey, output } => {
                identity::create(&namespace, &subject, &pubkey, &output)
            }
            IdentityCommands::Verify { file, namespace } => {
                identity::verify(&file, &namespace)
            }
        },
        Commands::Certificate(cmd) => match cmd {
            CertificateCommands::Issue { identity, namespace, seckey, claims, issued_at, expires_at, output } => {
                certificate::issue(&identity, &namespace, &seckey, &claims, issued_at, expires_at, &output)
            }
            CertificateCommands::Verify { file, identity, current_time } => {
                certificate::verify(&file, &identity, current_time)
            }
        },
        Commands::Vault(cmd) => match cmd {
            VaultCommands::Derive { namespace, asset, policy, index, output } => {
                vault::derive(&namespace, &asset, &policy, index, &output)
            }
            VaultCommands::Verify { file, namespace } => {
                vault::verify(&file, &namespace)
            }
        },
        Commands::Keygen(cmd) => match cmd {
            KeygenCommands::Generate { seed, pubkey, seckey } => {
                keygen::generate(&seed, &pubkey, &seckey)
            }
        },
        Commands::Transition(cmd) => match cmd {
            TransitionCommands::Transfer { namespace, new_owner, seckey, output, nonce } => {
                transition::transfer(&namespace, &new_owner, &seckey, &output, nonce)
            }
            TransitionCommands::Delegate { namespace, delegates, threshold, seckey, output, nonce } => {
                transition::delegate(&namespace, delegates, threshold, &seckey, &output, nonce)
            }
            TransitionCommands::Inherit { namespace, heir, condition, seckey, output, nonce } => {
                transition::inherit(&namespace, &heir, &condition, &seckey, &output, nonce)
            }
            TransitionCommands::Seal { namespace, seckey, output, nonce, confirm } => {
                transition::seal(&namespace, &seckey, &output, nonce, confirm)
            }
            TransitionCommands::Verify { file, pubkey } => {
                transition::verify(&file, &pubkey)
            }
        },
        Commands::Policy(cmd) => match cmd {
            PolicyCommands::Create { name, version, rules, seckey, output } => {
                policy::create(&name, version, &rules, &seckey, &output)
            }
            PolicyCommands::Evaluate { policy: policy_file, context } => {
                policy::evaluate(&policy_file, &context)
            }
            PolicyCommands::Verify { policy: policy_file, pubkey } => {
                policy::verify(&policy_file, &pubkey)
            }
            PolicyCommands::Bind { policy: policy_file, namespace, seckey, output } => {
                policy::bind(&policy_file, &namespace, &seckey, &output)
            }
            PolicyCommands::List { namespace } => {
                policy::list(namespace.as_deref())
            }
        },
    };
    
    if let Err(e) = result {
        eprintln!("{} {}", "Error:".red().bold(), e);
        std::process::exit(1);
    }
}
