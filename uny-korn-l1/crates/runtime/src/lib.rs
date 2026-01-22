//! Runtime wiring (block + tx dispatcher).

pub mod block;
pub mod dispatcher;
pub mod tx;

use anyhow::Result;

use uny_korn_audit::event_log::AuditLog;
use uny_korn_audit::event_log::AuditMeta;
use uny_korn_state::{namespaces::Namespace, ChainState, Address};
use uny_korn_tev::consensus::TevContext;

#[derive(Debug, Clone)]
pub struct RuntimeConfig {
    pub node_id: String,
    pub chain_id: String,
    pub policy_hash: String,
}

pub struct Runtime {
    pub cfg: RuntimeConfig,
    pub state: ChainState,
    pub tev: TevContext,
    pub audit: AuditLog,
    pub height: u64,
}

impl Runtime {
    pub fn new(cfg: RuntimeConfig) -> Self {
        Self {
            cfg,
            state: ChainState::default(),
            tev: TevContext::default(),
            audit: AuditLog::default(),
            height: 0,
        }
    }

    fn audit_meta(&self) -> AuditMeta {
        AuditMeta {
            height: self.height,
            slot: 0,
        }
    }

    pub fn init_genesis_y3k(&mut self) -> Result<()> {
        // Genesis-registered Y3K namespace.
        let controller: Address = [1u8; 32];
        self.state.namespaces.register_genesis_namespace(Namespace {
            name: "y3k".to_string(),
            controller,
            metadata_hash: None,
        })?;

        self.audit.append_with_meta(
            self.audit_meta(),
            "genesis_namespace",
            serde_json::json!({"name": "y3k", "state_root": self.state.state_root_hex()}),
        )?;

        Ok(())
    }

    pub fn tick_once(&mut self) -> Result<()> {
        self.height = self.height.saturating_add(1);
        // Fail-closed TEV: no decision means mint should fail.
        let mint_result = uny_korn_execution::mint::mint(
            &self.tev,
            &self.cfg.policy_hash,
            &mut self.audit,
            1,
        );
        self.audit.append_with_meta(
            self.audit_meta(),
            "tick",
            serde_json::json!({
                "mint_attempt": mint_result.as_ref().err().map(|e| e.to_string()),
                "state_root": self.state.state_root_hex(),
            }),
        )?;
        Ok(())
    }
}
