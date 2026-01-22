use kevan_events::{EventStore, EventType};
use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== Event Spine Query Demo ===\n");

    let db_path = Path::new("./kevan-events.db");
    
    if !db_path.exists() {
        println!("❌ Event database not found: {}", db_path.display());
        println!("   Run demo_with_events first to generate events.");
        return Ok(());
    }

    let store = EventStore::new(db_path)?;

    // Get total event count
    let total = store.count()?;
    println!("Total events: {}\n", total);

    if total == 0 {
        println!("No events recorded yet.");
        return Ok(());
    }

    // Get all events for kevan.x
    println!("--- All kevan.x Events ---");
    let events = store.find_by_actor("kevan.x", None, 10)?;
    for event in events {
        println!("  {} | {} | {}", 
            event.timestamp.format("%H:%M:%S"),
            event.event_type.as_str(),
            event.event_id[..16].to_string() + "..."
        );
    }
    println!();

    // Get challenge events
    println!("--- Auth Challenge Events ---");
    let challenges = store.find_by_type(EventType::AuthChallenge, 10)?;
    for event in challenges {
        println!("  Actor: {}", event.actor);
        println!("  Time: {}", event.timestamp.to_rfc3339());
        println!("  Payload: {}", serde_json::to_string_pretty(&event.payload)?);
        println!();
    }

    // Get login events (if any)
    println!("--- Auth Login Events ---");
    let logins = store.find_by_type(EventType::AuthLogin, 10)?;
    if logins.is_empty() {
        println!("  (none yet - signature verification pending)\n");
    } else {
        for event in logins {
            println!("  Actor: {}", event.actor);
            println!("  Time: {}", event.timestamp.to_rfc3339());
            println!("  Payload: {}", serde_json::to_string_pretty(&event.payload)?);
            println!();
        }
    }

    Ok(())
}
