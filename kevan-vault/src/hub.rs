use crate::file::VaultFile;
use kevan_events::{Event, EventStore, EventType};
use serde_json::json;
use std::error::Error;
use std::path::PathBuf;

/// Vault hub - orchestrates storage
pub struct VaultHub {
    events: EventStore,
    root: PathBuf,
}

impl VaultHub {
    pub fn new(events: EventStore, root_path: &str) -> Self {
        std::fs::create_dir_all(root_path).expect("Failed to create vault root");
        Self {
            events,
            root: PathBuf::from(root_path),
        }
    }

    /// Store a file in the vault
    pub fn store(&self, filename: &str, content: &[u8]) -> Result<String, Box<dyn Error>> {
        // 1. Write file to disk
        let file = VaultFile::new(filename, content, &self.root)?;

        // 2. Log event
        let event = Event::new(
            "kevan.x", // Owner
            EventType::VaultWrite,
            json!({
                "file_id": file.id,
                "name": file.name,
                "size": file.size,
                "hash": file.hash,
                "path": file.path
            }),
        );
        self.events.write(&event)?;

        println!("💾 [VaultHub] Stored '{}' ({})", file.name, file.size);
        Ok(file.id)
    }

    /// List files (reconstruct state from events - simplified for now)
    /// In a real system, we'd maintain a 'projection' table in SQLite.
    pub fn list(&self) -> Result<(), Box<dyn Error>> {
        // For now, just finding recent writes
        let events = self.events.find_by_actor("kevan.x", Some(EventType::VaultWrite), 10)?;
        
        println!("\n🗄️  Vault Contents (Recent):");
        for event in events {
            if let Some(name) = event.payload.get("name").and_then(|v| v.as_str()) {
                let size = event.payload.get("size").and_then(|v| v.as_u64()).unwrap_or(0);
                 println!("   - {} ({} bytes) [{}]", name, size, event.timestamp);
            }
        }
        Ok(())
    }
}
