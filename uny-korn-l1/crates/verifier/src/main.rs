use anyhow::{anyhow, Result};
use std::path::PathBuf;

use uny_korn_audit::event_log::AuditLog;

fn main() {
    if let Err(e) = run() {
        eprintln!("❌ BROKEN: {e}");
        std::process::exit(2);
    }
    println!("✅ CONSISTENT");
}

fn run() -> Result<()> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 || args.iter().any(|a| a == "--help" || a == "-h") {
        print_help();
        return Ok(());
    }

    let path = PathBuf::from(&args[1]);
    let bytes = std::fs::read(&path)
        .map_err(|e| anyhow!("failed to read {}: {e}", path.display()))?;

    let log: AuditLog = serde_json::from_slice(&bytes)
        .map_err(|e| anyhow!("invalid audit log JSON: {e}"))?;

    log.verify_chain()?;
    Ok(())
}

fn print_help() {
    eprintln!("pst-verifier (mechanical acceptance)\n");
    eprintln!("USAGE:");
    eprintln!("  pst-verifier <audit_log.json>\n");
    eprintln!("OUTPUT:");
    eprintln!("  ✅ CONSISTENT\n  ❌ BROKEN: <reason>");
}
