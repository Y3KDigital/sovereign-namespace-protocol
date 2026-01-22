use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::Path;
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultFile {
    pub id: String,         // Unique ID (UUID or Hash)
    pub name: String,       // Original filename
    pub path: String,       // Stored path (relative to vault root)
    pub size: u64,
    pub mime_type: String,
    pub hash: String,       // SHA256 of content
    pub created_at: DateTime<Utc>,
    pub tags: Vec<String>,
}

impl VaultFile {
    pub fn new(name: &str, content: &[u8], vault_root: &Path) -> std::io::Result<Self> {
        let hash =  hex::encode(Sha256::digest(content));
        let id = uuid::Uuid::new_v4().to_string(); // We need uuid crate in Cargo.toml
        
        // Simple storage strategy: vault_root/first_2_chars_of_hash/filename
        let sub_dir = &hash[0..2];
        let target_dir = vault_root.join(sub_dir);
        fs::create_dir_all(&target_dir)?;
        
        // Ensure unique filename on disk
        let stored_filename = format!("{}-{}", id, name);
        let target_path = target_dir.join(&stored_filename);
        
        fs::write(&target_path, content)?;

        Ok(Self {
            id,
            name: name.to_string(),
            path: target_path.to_string_lossy().to_string(),
            size: content.len() as u64,
            mime_type: "application/octet-stream".to_string(), // Detection logic later
            hash,
            created_at: Utc::now(),
            tags: Vec::new(),
        })
    }
}
