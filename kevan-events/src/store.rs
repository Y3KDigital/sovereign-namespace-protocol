use rusqlite::{Connection, params};
use std::path::Path;
use std::rc::Rc;
use std::cell::RefCell;
use crate::event::{Event, EventType};

/// SQLite-backed event store (immutable append-only log)
#[derive(Clone)]
pub struct EventStore {
    conn: Rc<RefCell<Connection>>,
}

impl EventStore {
    /// Create or open event store at the given path
    pub fn new(db_path: &Path) -> rusqlite::Result<Self> {
        let conn = Connection::open(db_path)?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS events (
                event_id TEXT PRIMARY KEY,
                actor TEXT NOT NULL,
                event_type TEXT NOT NULL,
                payload TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                previous_hash TEXT,
                created_at INTEGER NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor)",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type)",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(created_at)",
            [],
        )?;

        Ok(Self { 
            conn: Rc::new(RefCell::new(conn))
        })
    }

    /// Write event (immutable - never updates)
    pub fn write(&self, event: &Event) -> rusqlite::Result<()> {
        let conn = self.conn.borrow();
        conn.execute(
            "INSERT INTO events (event_id, actor, event_type, payload, timestamp, previous_hash, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                event.event_id,
                event.actor,
                event.event_type.as_str(),
                event.payload.to_string(),
                event.timestamp.to_rfc3339(),
                event.previous_hash,
                event.created_at,
            ],
        )?;
        Ok(())
    }

    /// Find events by actor (namespace)
    pub fn find_by_actor(
        &self,
        actor: &str,
        event_type: Option<EventType>,
        limit: usize,
    ) -> rusqlite::Result<Vec<Event>> {
        let query = match event_type {
            Some(_) => {
                "SELECT event_id, actor, event_type, payload, timestamp, previous_hash, created_at
                 FROM events
                 WHERE actor = ?1 AND event_type = ?2
                 ORDER BY created_at DESC
                 LIMIT ?3"
            }
            None => {
                "SELECT event_id, actor, event_type, payload, timestamp, previous_hash, created_at
                 FROM events
                 WHERE actor = ?1
                 ORDER BY created_at DESC
                 LIMIT ?2"
            }
        };

        let conn = self.conn.borrow();
        let mut stmt = conn.prepare(query)?;
        
        let events = match event_type {
            Some(et) => stmt.query_map(params![actor, et.as_str(), limit as i64], Self::row_to_event)?,
            None => stmt.query_map(params![actor, limit as i64], Self::row_to_event)?,
        };

        events.collect()
    }

    /// Find events by type
    pub fn find_by_type(
        &self,
        event_type: EventType,
        limit: usize,
    ) -> rusqlite::Result<Vec<Event>> {
        let conn = self.conn.borrow();
        let mut stmt = conn.prepare(
            "SELECT event_id, actor, event_type, payload, timestamp, previous_hash, created_at
             FROM events
             WHERE event_type = ?1
             ORDER BY created_at DESC
             LIMIT ?2"
        )?;

        let events = stmt.query_map(params![event_type.as_str(), limit as i64], Self::row_to_event)?;
        events.collect()
    }

    /// Get recent global events
    pub fn get_recent(&self, limit: usize) -> rusqlite::Result<Vec<Event>> {
        let conn = self.conn.borrow();
        let mut stmt = conn.prepare(
            "SELECT event_id, actor, event_type, payload, timestamp, previous_hash, created_at
             FROM events
             ORDER BY created_at DESC
             LIMIT ?1"
        )?;

        let events = stmt.query_map(params![limit as i64], Self::row_to_event)?;
        events.collect()
    }

    /// Get event by ID
    pub fn get(&self, event_id: &str) -> rusqlite::Result<Option<Event>> {
        let conn = self.conn.borrow();
        let mut stmt = conn.prepare(
            "SELECT event_id, actor, event_type, payload, timestamp, previous_hash, created_at
             FROM events
             WHERE event_id = ?1"
        )?;

        let mut events = stmt.query_map(params![event_id], Self::row_to_event)?;
        
        match events.next() {
            Some(result) => result.map(Some),
            None => Ok(None),
        }
    }

    /// Count total events
    pub fn count(&self) -> rusqlite::Result<i64> {
        let conn = self.conn.borrow();
        conn.query_row("SELECT COUNT(*) FROM events", [], |row| row.get(0))
    }

    /// Count events by actor
    pub fn count_by_actor(&self, actor: &str) -> rusqlite::Result<i64> {
        let conn = self.conn.borrow();
        conn.query_row(
            "SELECT COUNT(*) FROM events WHERE actor = ?1",
            params![actor],
            |row| row.get(0)
        )
    }

    fn row_to_event(row: &rusqlite::Row) -> rusqlite::Result<Event> {
        let event_type_str: String = row.get(2)?;
        let event_type = Self::parse_event_type(&event_type_str);
        
        let payload_str: String = row.get(3)?;
        let payload: serde_json::Value = serde_json::from_str(&payload_str)
            .unwrap_or(serde_json::Value::Null);

        let timestamp_str: String = row.get(4)?;
        let timestamp = chrono::DateTime::parse_from_rfc3339(&timestamp_str)
            .map(|dt| dt.with_timezone(&chrono::Utc))
            .unwrap_or_else(|_| chrono::Utc::now());

        Ok(Event {
            event_id: row.get(0)?,
            actor: row.get(1)?,
            event_type,
            payload,
            timestamp,
            previous_hash: row.get(5)?,
            created_at: row.get(6)?,
        })
    }

    fn parse_event_type(s: &str) -> EventType {
        EventType::from_str(s).unwrap_or(EventType::AuthLogin)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_write_and_read() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let store = EventStore::new(&db_path).unwrap();

        let event = Event::new(
            "kevan.x",
            EventType::AuthLogin,
            serde_json::json!({"session_id": "abc123"})
        );

        store.write(&event).unwrap();

        let retrieved = store.get(&event.event_id).unwrap().unwrap();
        assert_eq!(retrieved.actor, "kevan.x");
        assert_eq!(retrieved.event_type, EventType::AuthLogin);
    }

    #[test]
    fn test_find_by_actor() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let store = EventStore::new(&db_path).unwrap();

        // Write multiple events
        for i in 0..5 {
            let event = Event::new(
                "kevan.x",
                EventType::AuthLogin,
                serde_json::json!({"session": i})
            );
            store.write(&event).unwrap();
        }

        let events = store.find_by_actor("kevan.x", None, 10).unwrap();
        assert_eq!(events.len(), 5);
    }

    #[test]
    fn test_count() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let store = EventStore::new(&db_path).unwrap();

        assert_eq!(store.count().unwrap(), 0);

        let event = Event::new("kevan.x", EventType::AuthLogin, serde_json::json!({}));
        store.write(&event).unwrap();

        assert_eq!(store.count().unwrap(), 1);
        assert_eq!(store.count_by_actor("kevan.x").unwrap(), 1);
    }
}
