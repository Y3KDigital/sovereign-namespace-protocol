use anyhow::{anyhow, Result};

use uny_korn_state::Address;

#[derive(Debug, Clone)]
pub struct AuthoritySet {
    pub emergency_halt: Address,
}

impl AuthoritySet {
    pub fn validate(&self) -> Result<()> {
        if self.emergency_halt == [0u8; 32] {
            return Err(anyhow!("emergency_halt authority cannot be zero"));
        }
        Ok(())
    }
}
