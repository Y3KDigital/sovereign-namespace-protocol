use clap::{Parser, Subcommand};
use kevan_events::EventStore;

mod companion;
use kevan_finance::{FinanceHub, PaymentIntent};
use kevan_mail::{MailHub, Message, MessageType};
use kevan_tel::TelHub;
use kevan_vault::VaultHub;
use std::path::PathBuf;
use serde::Serialize;
use serde::Deserialize;
use std::fs;

use kevan_policy::Delegation;
use kevan_contacts::Contact;
use kevan_calendar::{Event, TimePolicy};
use chrono::NaiveDateTime;

#[derive(Debug, Deserialize, Serialize)]
struct SystemConfig {
    identity: String,
    phone: String,
    storage: StorageConfig,
    #[serde(default)]
    delegates: Vec<Delegation>,
    #[serde(default)]
    contacts: Vec<Contact>,
    #[serde(default)]
    events: Vec<Event>,
}

#[derive(Debug, Deserialize, Serialize)]
struct StorageConfig {
    events_db: String,
    vault_root: String,
}

impl SystemConfig {
    fn load() -> Self {
        let config_path = "os-config.json";
        if let Ok(content) = fs::read_to_string(config_path) {
            serde_json::from_str(&content).unwrap_or_else(|e| {
                eprintln!("⚠️ Failed to parse config: {}. Using defaults.", e);
                Self::default()
            })
        } else {
            Self::default()
        }
    }

    fn default() -> Self {
        Self {
            identity: "kevan.x".to_string(),
            phone: "+1-321-278-8323".to_string(),
            storage: StorageConfig {
                events_db: "./kevan.events.db".to_string(),
                vault_root: "./kevan_vault_storage".to_string(),
            },
            delegates: vec![],
            contacts: vec![],
            events: vec![],
        }
    }

    fn save(&self) -> Result<(), std::io::Error> {
        let json = serde_json::to_string_pretty(self)?;
        fs::write("os-config.json", json)?;
        Ok(())
    }
}

#[derive(Parser)]
#[command(name = "kevan-os")]
#[command(about = "Sovereign Operating System for kevan.x")]
struct Cli {
    #[arg(long, global = true)]
    observer: bool,

    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Start the system daemon
    Run,
    // Removed old Email command
    // Commands::Email ...
    
    /// Secure File Storage
    Vault {
        #[command(subcommand)]
        action: VaultAction,
    },
    /// Communication Hub (Email, SMS, Signal)
    Mail {
        #[command(subcommand)]
        action: MailAction,
    },
    /// Telephony & Voice (Sovereign Phone)
    Tel {
        #[command(subcommand)]
        action: TelAction,
    },
    /// Finance & Sovereignty (Wallet, Ledger, Value)
    Finance {
        #[command(subcommand)]
        action: FinanceAction,
    },
    /// Show system status
    Status,
    /// Manage Contacts
    Contacts {
        #[command(subcommand)]
        action: ContactAction,
    },
    /// Manage Calendar & Time Authority
    Calendar {
        #[command(subcommand)]
        action: CalendarAction,
    },
    /// View Immutable Audit Logs
    Audit {
        #[command(subcommand)]
        action: AuditAction,
    },
}

#[derive(Subcommand)]
enum AuditAction {
    /// View recent events
    Tail {
        #[arg(short, long, default_value = "20")]
        limit: usize,
    },
}

#[derive(Subcommand)]
enum TelAction {
    /// Initiate Outbound Call
    Call {
        #[arg(short, long)]
        to: String,
        #[arg(long, default_value = "default")]
        from: String,
    },
    /// View Call Logs
    Logs {
        #[arg(short, long, default_value = "10")]
        limit: usize,
    },
    /// List Sovereign Numbers
    Numbers,
}

#[derive(Subcommand)]
enum MailAction {
    /// Send a message
    Send {
        #[arg(short, long)]
        to: String,
        #[arg(short, long)]
        msg: String,
        #[arg(short, long)]
        subject: Option<String>,
        #[arg(long, default_value = "email")]
        via: String, // email, sms, signal
    },
    /// Check Inbox / Sent items
    Inbox {
        #[arg(short, long, default_value = "10")]
        limit: usize,
    },
    /// Broadcast to all contacts
    Broadcast {
        #[arg(short, long)]
        msg: String,
        #[arg(short, long)]
        subject: Option<String>,
    }
}

#[derive(Subcommand)]
enum FinanceAction {
    /// Send payment (Smart Routed)
    Pay {
        #[arg(short, long)]
        to: String,
        #[arg(short, long)]
        amount: f64,
        #[arg(short, long, default_value = "USD")]
        currency: String,
        #[arg(short, long)]
        memo: Option<String>,
    },
    /// View Transaction History (Ledger)
    History {
        #[arg(short, long, default_value = "10")]
        limit: usize,
    },
    /// View Sovereign Wallet Balances
    Wallet,
}

#[derive(Subcommand)]
enum CalendarAction {
    Add {
        title: String,
        /// Format: YYYY-MM-DD HH:MM
        start: String,
        /// Format: YYYY-MM-DD HH:MM
        end: String,
        #[arg(long, default_value = "flexible")]
        policy: String,
    },
    List,
}

#[derive(Subcommand)]
enum ContactAction {
    Add {
        namespace: String,
        #[arg(long, default_value = "network")]
        relation: String,
        #[arg(long, default_value = "standard")]
        priority: String,
    },
    List,
}

#[derive(Subcommand)]
enum VaultAction {
    Store {
        path: String,
    },
    List,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();
    let mut config = SystemConfig::load();
    let db_path = PathBuf::from(&config.storage.events_db);
    
    // Initialize Event Store first
    let events = EventStore::new(&db_path)?;
    println!("✅ Event Store Loaded");

    // Initialize Hubs
    let tel = TelHub::new(events.clone(), "dummy-key".to_string());
    let finance = FinanceHub::new(events.clone());
    let mail = MailHub::new(events.clone());
    let vault = VaultHub::new(events.clone(), &config.storage.vault_root);

    let cmd = cli.command.unwrap_or(Commands::Status);

    if cli.observer {
        println!("\n👁️  OBSERVER MODE ACTIVE (Read-Only) 👁️");
        match &cmd {
            Commands::Status => {},
            Commands::Tel { action: TelAction::Logs { .. } } => {},
            Commands::Tel { action: TelAction::Numbers } => {},
            Commands::Mail { action: MailAction::Inbox { .. } } => {},
            Commands::Finance { action: FinanceAction::History { .. } } => {},
            Commands::Finance { action: FinanceAction::Wallet } => {},
            Commands::Vault { action: VaultAction::List } => {},
            Commands::Contacts { action: ContactAction::List } => {},
            Commands::Calendar { action: CalendarAction::List } => {},
            Commands::Audit { .. } => {},
            _ => {
                eprintln!("\n❌ PERMISSION DENIED: Observer Mode is Read-Only.");
                eprintln!("   Allowed commands: Status, Logs, Numbers, Inbox, History, Wallet, Lists.");
                std::process::exit(1);
            }
        }
    }

    match cmd {
        Commands::Status => {
            println!("\n👑 kevan.os System Status");
            println!("========================");
            println!("Identity: {}", config.identity);
            println!("Phone:    {} (Primary Cell)", config.phone);
            println!("Status:   ONLINE");
            if !config.delegates.is_empty() {
                println!("Delegates: {} active", config.delegates.len());
            } else {
                println!("Delegates: None (Single Player Mode)");
            }
            if !config.contacts.is_empty() {
                println!("Contacts:  {} resolved", config.contacts.len());
            } else {
                println!("Contacts:  None (Isolation Mode)");
            }
            if !config.events.is_empty() {
                println!("Calendar:  {} events scheduled", config.events.len());
            } else {
                println!("Calendar:  Clear (Time Sovereignty: High)");
            }
            println!("\nModules:");
            println!("  [x] Finance (Universal Payment Hub)");
            println!("  [x] Tel     (Sovereign Phone System)");
            println!("  [x] Mail    (Communication Hub)");
            println!("  [x] Vault   (Sovereign Data Store)");
        }
        Commands::Run => {
            println!("🚀 Starting kevan.os Daemon for {}...", config.identity);
            println!("📱 Companion Server Starting...");
            
            // Start Companion Server
            companion::start_server(config.identity.clone(), 3000).await?;
        }
        Commands::Mail { action } => {
            match action {
                MailAction::Send { to, msg, subject, via } => {
                     let mtype = match via.to_lowercase().as_str() {
                         "sms" => MessageType::SMS,
                         "signal" => MessageType::Signal,
                         _ => MessageType::Email,
                     };
                     
                     let mut message = Message::new(&config.identity, &to, &msg, mtype);
                     if let Some(sub) = subject {
                         message = message.with_subject(&sub);
                     }
                     
                     let id = mail.send(&message)?;
                     println!("✅ Message sent via {}. ID: {}", via, id);
                }
                MailAction::Inbox { limit } => {
                    println!("📬 Sovereign Message Log");
                    println!("-----------------------");
                    match mail.get_inbox(&config.identity, limit) {
                         Ok(events) => {
                             if events.is_empty() { println!("(No messages)"); }
                             for event in events {
                                 println!("{} | {:?} | {:?}", event.timestamp, event.event_type, event.payload);
                             }
                         }
                         Err(e) => eprintln!("❌ Error: {}", e),
                    }
                }
                MailAction::Broadcast { msg, subject } => {
                    println!("📢 Broadcasting to {} contacts...", config.contacts.len());
                    for contact in &config.contacts {
                        let mut message = Message::new(&config.identity, &contact.namespace, &msg, MessageType::Email);
                        if let Some(ref sub) = subject {
                            message = message.with_subject(sub);
                        }
                        match mail.send(&message) {
                            Ok(_) => println!("  -> Sent to {}", contact.namespace),
                            Err(e) => eprintln!("  -> Failed {}: {}", contact.namespace, e),
                        }
                        // Sleep slightly to avoid rate limits in real world
                        // std::thread::sleep(std::time::Duration::from_millis(100));
                    }
                    println!("✅ Broadcast complete.");
                }
            }
        }
        Commands::Tel { action } => {
            match action {
                TelAction::Call { to, from } => {
                    println!("📞 Initiating Secure Voice Circuit...");
                    println!("   To:   {}", to);
                    println!("   From: {}", from);
                    // Async call in synchronous context requires handling
                    // Use block_on or just .await if main is async (it is)
                    match tel.make_call(&from, &to).await {
                        Ok(sid) => {
                             println!("✅ Call Dispatched. SID: {}", sid);
                             println!("   (Simulated - Telnyx API inactive in demo mode)");
                        },
                        Err(e) => eprintln!("❌ Call Failed: {}", e),
                    }
                }
                TelAction::Logs { limit } => {
                    println!("☎️  Call Audit Trail");
                    println!("-------------------");
                    match tel.get_history(&config.identity, limit) {
                        Ok(events) => {
                            if events.is_empty() { println!("(No calls recorded)"); }
                            for event in events {
                                println!("{} | {:?} | {:?}", event.timestamp, event.event_type, event.payload);
                            }
                        }
                        Err(e) => eprintln!("❌ Error: {}", e),
                    }
                }
                TelAction::Numbers => {
                    println!("📱 Sovereign Numbers (Verified)");
                    println!("-----------------------------");
                    for num in tel.list_numbers() {
                        let ns = if num.namespace == config.identity {
                            format!("{} (YOU)", num.namespace)
                        } else {
                            num.namespace.clone()
                        };
                        println!("{:<18} | {:<20}", num.raw, ns);
                    }
                }
            }
        }
        Commands::Finance { action } => {
            match action {
                FinanceAction::Pay { to, amount, currency, memo } => {
                    let mut intent = PaymentIntent::new(&config.identity, &to, amount, &currency);
                    if let Some(m) = memo {
                        intent = intent.with_memo(&m);
                    }
                    
                    println!("💸 Processing payment of {} {} to {}...", amount, currency, to);
                    let result = finance.send(&intent)?;
                    println!("✅ Payment Executed!");
                    println!("   ID: {}", result.payment_id);
                    println!("   Status: {:?}", result.status);
                }
                FinanceAction::History { limit } => {
                    println!("📜 Sovereign Ledger History ({})", config.identity);
                    println!("----------------------------------------");
                    match finance.get_history(&config.identity, limit) {
                        Ok(events) => {
                            if events.is_empty() {
                                println!("(No transactions found)");
                            }
                            for event in events {
                                println!("{} | {:?} | {:?}", event.timestamp, event.event_type, event.payload);
                            }
                        }
                        Err(e) => eprintln!("❌ Failed to fetch history: {}", e),
                    }
                }
                FinanceAction::Wallet => {
                    println!("💰 Sovereign Wallet Summary");
                    println!("-------------------------");
                    
                    // XRPL Sovereign Vault (rE85...Dqm)
                    println!("XRPL (Sovereign):  rE85...Dqm");
                    println!("  ├─ Balance:      2.22 XRP        ($4.60)");
                    println!("  └─ Reserves:     3.20 XRP        (Locked)");
                    
                    println!("\n🏛️  Issued Sovereignty (Assets Issued)");
                    println!("  ├─ GOLD:         20.0M Circulating (5 Holders)");
                    println!("  ├─ EUR:          50.0M Circulating (4 Holders)");
                    println!("  └─ USDT:         185.0M Circulating (7 Holders)");

                    println!("\n-------------------------");
                    println!("Liquid Total:      ~$4.60 (Excluding Issued Value)");

                    // Digital Assets (Namespace Valuation)
                    let ns_dir = PathBuf::from("../genesis/SOVEREIGN_SUBNAMESPACES");
                    let mut owned_count = 0;
                    if let Ok(entries) = fs::read_dir(ns_dir) {
                        for entry in entries.flatten() {
                            if let Ok(name) = entry.file_name().into_string() {
                                if name.starts_with(&config.identity) {
                                    owned_count += 1;
                                }
                            }
                        }
                    }
                    
                    if owned_count > 0 {
                        let est_val = owned_count * 350; // Assume ~$350/namespace avg
                        println!("Digital Assets:    {} Namespaces    (~${})", owned_count, est_val);
                        println!("-------------------------");
                        println!("Net Worth (Est):   ${:.2}", 4.60 + est_val as f64);
                    }
                }
            }
        }
        Commands::Vault { action } => {
            match action {
                VaultAction::Store { path } => {
                    let path = PathBuf::from(path);
                    if !path.exists() {
                        eprintln!("File not found: {:?}", path);
                        return Ok(());
                    }
                    let content = std::fs::read(&path)?;
                    let name = path.file_name().unwrap().to_string_lossy();
                    let id = vault.store(&name, &content)?;
                    println!("✅ File stored in vault. ID: {}", id);
                }
                VaultAction::List => {
                    vault.list()?;
                }
            }
        }
        Commands::Contacts { action } => {
            match action {
                ContactAction::Add { namespace, relation, priority } => {
                    let rel = match relation.to_lowercase().as_str() {
                        "family" => kevan_contacts::Relation::Family,
                        "medical" => kevan_contacts::Relation::Medical,
                        "legal" => kevan_contacts::Relation::Legal,
                        "friend" => kevan_contacts::Relation::Friend,
                        "service" => kevan_contacts::Relation::Service,
                        _ => kevan_contacts::Relation::Network,
                    };
                    
                    let prio = match priority.to_lowercase().as_str() {
                        "emergency" => kevan_contacts::Priority::Emergency,
                        "high" => kevan_contacts::Priority::High,
                        "low" => kevan_contacts::Priority::Low,
                        _ => kevan_contacts::Priority::Standard,
                    };

                    // Simple duplicate check
                    if config.contacts.iter().any(|c| c.namespace == namespace) {
                        println!("⚠️ Contact {} already exists.", namespace);
                    } else {
                        let contact = Contact::new(&namespace, rel, prio);
                        config.contacts.push(contact);
                        config.save()?;
                        println!("✅ Contact added: {} (Resolution pending)", namespace);
                    }
                }
                ContactAction::List => {
                    println!("👥 Sovereign Contacts");
                    println!("--------------------");
                    if config.contacts.is_empty() {
                         println!("(None)");
                    }
                    for contact in prompt_sort(&config.contacts) {
                        println!("{:<15} | {:<10?} | {:<10?}", contact.namespace, contact.relationship, contact.priority);
                    }
                }
            }
        }
        Commands::Calendar { action } => {
            match action {
                CalendarAction::Add { title, start, end, policy } => {
                    let pol = match policy.to_lowercase().as_str() {
                        "immutable" => TimePolicy::Immutable,
                        "fluid" => TimePolicy::Fluid,
                        _ => TimePolicy::Flexible,
                    };

                    // Simple parsing: expects "YYYY-MM-DD HH:MM"
                    let start_dt = NaiveDateTime::parse_from_str(&format!("{}:00", start), "%Y-%m-%d %H:%M:%S")
                        .or_else(|_| NaiveDateTime::parse_from_str(&start, "%Y-%m-%d %H:%M:%S"))
                        .map(|dt| dt.and_utc());
                    
                    let end_dt = NaiveDateTime::parse_from_str(&format!("{}:00", end), "%Y-%m-%d %H:%M:%S")
                        .or_else(|_| NaiveDateTime::parse_from_str(&end, "%Y-%m-%d %H:%M:%S"))
                        .map(|dt| dt.and_utc());

                    if let (Ok(s), Ok(e)) = (start_dt, end_dt) {
                        let duration = (e - s).num_minutes();
                        if duration <= 0 {
                            eprintln!("❌ Invalid duration. End time must be after start time.");
                        } else {
                            let event = Event::new(&title, s, duration, pol);
                            config.events.push(event);
                            config.save()?;
                            println!("✅ Event '{}' scheduled.", title);
                        }
                    } else {
                        eprintln!("❌ Invalid date format. Use YYYY-MM-DD HH:MM");
                    }
                }
                CalendarAction::List => {
                     println!("📅 Sovereign Schedule");
                     println!("---------------------");
                     if config.events.is_empty() {
                         println!("(No events scheduled)");
                     }
                     // Sort by start time
                     config.events.sort_by_key(|e| e.start);
                     
                     for event in &config.events {
                         println!("{} | {} - {} | {:?} | P: {:?}", 
                            event.start.format("%Y-%m-%d %H:%M"),
                            event.start.format("%H:%M"),
                            event.end.format("%H:%M"),
                            event.title,
                            event.policy
                         );
                     }
                }
            }
        }
        Commands::Audit { action } => {
             match action {
                 AuditAction::Tail { limit } => {
                     println!("📜 Global Sovereign Audit Log");
                     println!("-----------------------------");
                     match events.get_recent(limit) {
                         Ok(evs) => {
                             if evs.is_empty() { println!("(No events)"); }
                             for e in evs {
                                 println!("{} | {:<15} | {:?} | {:?}", 
                                    e.timestamp.format("%Y-%m-%d %H:%M:%S"),
                                    e.actor, 
                                    e.event_type,
                                    e.payload
                                 );
                             }
                         }
                         Err(e) => eprintln!("❌ Error reading logs: {}", e),
                     }
                 }
             }
        }
    }

    Ok(())
}

fn prompt_sort(contacts: &[Contact]) -> Vec<&Contact> {
    let v: Vec<&Contact> = contacts.iter().collect();
    // Sort by priority logic (Emergency first)? For now just stable order.
    v
}
