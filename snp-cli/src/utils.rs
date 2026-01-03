use anyhow::{Context, Result};
use std::fs;

/// Load a JSON file and deserialize it
pub fn load_json<T: serde::de::DeserializeOwned>(path: &str) -> Result<T> {
    let content =
        fs::read_to_string(path).with_context(|| format!("Failed to read file: {}", path))?;

    let data: T = serde_json::from_str(&content)
        .with_context(|| format!("Failed to parse JSON from: {}", path))?;

    Ok(data)
}

/// Save data as JSON to a file
pub fn save_json<T: serde::Serialize>(path: &str, data: &T) -> Result<()> {
    let json = serde_json::to_string_pretty(data).context("Failed to serialize to JSON")?;

    fs::write(path, json).with_context(|| format!("Failed to write file: {}", path))?;

    Ok(())
}

/// Parse a hex string (with or without 0x prefix) to a 32-byte array
pub fn parse_hex_32(hex_str: &str) -> Result<[u8; 32]> {
    let hex_str = hex_str.strip_prefix("0x").unwrap_or(hex_str);
    let bytes = hex::decode(hex_str).context("Invalid hex string")?;

    if bytes.len() != 32 {
        anyhow::bail!("Expected 32 bytes, got {}", bytes.len());
    }

    let mut array = [0u8; 32];
    array.copy_from_slice(&bytes);
    Ok(array)
}

/// Get current Unix timestamp
pub fn current_timestamp() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
