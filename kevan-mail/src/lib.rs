//! # kevan.mail.x - Sovereign Communication
//!
//! Email and messaging integrated with the namespace system.

pub mod hub;
pub mod message;

pub use hub::MailHub;
pub use message::{Message, MessageType};
