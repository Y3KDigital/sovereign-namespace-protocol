# UNYKORN Rust L1 (single-chain)

This folder is a **standalone Rust workspace** for a sovereign, single-chain Layer-1.

Design constraints (first principles):

- **Single chain / single truth** (no secondary execution rails)
- **Fail-closed by default**
- **TEV enforcement is inside the execution path** (non-bypassable)
- **Y3K namespaces are native state objects** (not smart contracts)
- **Audit log is append-only**; failure to log is a hard failure

## Quick start (local)

From this directory:

- Build everything: `cargo build --release`
- Run a node: `cargo run -p unykorn-node --release`
- Verify an audit log: `cargo run -p pst-verifier --release -- --help`

## Repo map

- `crates/state` – accounts, balances, assets, **namespaces (Y3K)**
- `crates/governance` – policy hash, authority, emergency halt
- `crates/tev` – oracle registry + decisions (default deny)
- `crates/execution` – mint/burn/transfer; **capital_gate enforces TEV**
- `crates/audit` – append-only hash-chain log
- `crates/runtime` – block/tx/dispatcher + boot wiring
- `crates/verifier` – `pst_verifier` CLI (mechanical acceptance)
- `node` – validator/node binary
