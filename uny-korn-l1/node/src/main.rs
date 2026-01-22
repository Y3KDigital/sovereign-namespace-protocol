use anyhow::Result;

fn main() {
    if let Err(e) = run() {
        eprintln!("node error: {e}");
        std::process::exit(2);
    }
}

fn run() -> Result<()> {
    let policy_hash = std::env::var("UNYKORN_POLICY_HASH")
        .unwrap_or_else(|_| "0x0000000000000000000000000000000000000000000000000000000000000000".to_string());

    let mut rt = uny_korn_runtime::Runtime::new(uny_korn_runtime::RuntimeConfig {
        node_id: "node-1".to_string(),
        chain_id: "uny-korn".to_string(),
        policy_hash,
    });

    rt.init_genesis_y3k()?;
    rt.tick_once()?;

    // For now, dump audit to stdout (useful for piping into verifier).
    let audit_json = serde_json::to_string_pretty(&rt.audit)?;
    println!("{audit_json}");

    Ok(())
}
