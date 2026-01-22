use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

/// A small, in-memory fixed-window rate limiter.
///
/// This is intentionally simple (no external deps) and meant as a safety belt,
/// not as a replacement for edge/CDN protections.
#[derive(Clone)]
pub struct RateLimiter {
    window: Duration,
    max_requests: u32,
    state: Arc<Mutex<HashMap<String, WindowState>>>,
}

#[derive(Debug, Clone)]
struct WindowState {
    start: Instant,
    count: u32,
}

impl RateLimiter {
    pub fn per_minute(max_requests: u32) -> Self {
        Self {
            window: Duration::from_secs(60),
            max_requests,
            state: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Returns true if the request should be allowed.
    pub fn allow(&self, key: &str) -> bool {
        if self.max_requests == 0 {
            return true;
        }

        let now = Instant::now();
        let mut map = self.state.lock().expect("rate limiter lock");

        let entry = map.entry(key.to_string()).or_insert_with(|| WindowState {
            start: now,
            count: 0,
        });

        if now.duration_since(entry.start) >= self.window {
            entry.start = now;
            entry.count = 0;
        }

        entry.count = entry.count.saturating_add(1);
        entry.count <= self.max_requests
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn allows_up_to_limit_per_window() {
        let rl = RateLimiter::per_minute(2);
        assert!(rl.allow("ip:1"));
        assert!(rl.allow("ip:1"));
        assert!(!rl.allow("ip:1"));
        // Different key should not be affected.
        assert!(rl.allow("ip:2"));
    }
}
