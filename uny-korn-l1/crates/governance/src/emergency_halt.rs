use anyhow::Result;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HaltState {
    Running,
    Halted,
}

#[derive(Debug, Clone)]
pub struct EmergencyHalt {
    state: HaltState,
}

impl Default for EmergencyHalt {
    fn default() -> Self {
        Self { state: HaltState::Running }
    }
}

impl EmergencyHalt {
    pub fn state(&self) -> HaltState {
        self.state
    }

    pub fn halt(&mut self) {
        self.state = HaltState::Halted;
    }

    pub fn require_running(&self) -> Result<()> {
        anyhow::ensure!(self.state == HaltState::Running, "chain is halted");
        Ok(())
    }
}
