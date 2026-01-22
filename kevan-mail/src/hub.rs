use crate::message::Message;
use kevan_events::{Event, EventStore, EventType};
use serde_json::json;
use std::error::Error;

/// Communication hub - orchestrates messaging
pub struct MailHub {
    events: EventStore,
}

impl MailHub {
    pub fn new(events: EventStore) -> Self {
        Self { events }
    }

    /// Send a message
    pub fn send(&self, msg: &Message) -> Result<String, Box<dyn Error>> {
        // 1. Log event
        let event = Event::new(
            msg.from.clone(),
            EventType::MailSend,
            json!({
                "to": msg.to,
                "type": msg.msg_type,
                "id": msg.id,
                "subject": msg.subject,
                "body": msg.body
            }),
        );
        self.events.write(&event)?;

        println!("📧 [MailHub] Sent {:?} from {} to {}", msg.msg_type, msg.from, msg.to);
        
        Ok(msg.id.clone())
    }
    
    /// Receive a message
    pub fn receive(&self, msg: &Message) -> Result<String, Box<dyn Error>> {
        let event = Event::new(
            msg.from.clone(),
            EventType::MailReceive,
            json!({
                "to": msg.to,
                "subject": msg.subject,
                "type": msg.msg_type,
                "id": msg.id
            }),
        );
        self.events.write(&event)?;
        
        println!("📬 [MailHub] Received {:?} for {}", msg.msg_type, msg.to);
        Ok(msg.id.clone())
    }

    /// Get message history for actor
    pub fn get_inbox(&self, actor: &str, limit: usize) -> Result<Vec<Event>, Box<dyn Error>> {
        // Query mail.* events for this actor
        let mut history = Vec::new();
        
        // Get all event types related to mail
        let types = vec![
            EventType::MailSend,
            EventType::MailReceive,
        ];

        for event_type in types {
            let events = self.events.find_by_type(event_type, limit)?;
            for event in events {
                // For send: actor is sender
                // For receive: payload.to would be the actor (but find_by_type returns all, we filter here)
                // Actually events are indexed by actor usually.
                // If I sent it, actor = me.
                // If I received it, the event might be logged by the system with actor=sender, or strictly me.
                // For now, let's just show events where I am the actor (sent) or maybe we need to filter payload for received.
                
                // Simple version: just show all mail events for this actor
                if event.actor == actor {
                    history.push(event);
                }
                // TODO: Also include messages SENT TO me by others?
                // Requires scanning payload "to" field or having a secondary index. 
                // For this prototype, we'll stick to 'my actions' (Sent mail) or system events logged under my name.
            }
        }

        // Sort by timestamp (most recent first)
        history.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        history.truncate(limit);

        Ok(history)
    }
}
