# UNY-KORN L1 — Security & Determinism Audit (Rust workspace)

Date: 2026-01-08

Scope: `uny-korn-l1/` workspace (`crates/*`, `node/`, `genesis/`, `docker/`).

This report is written to be “fail-closed friendly”: anything that affects consensus safety, determinism, or key trust is treated as a hard requirement.

## Executive summary

- The workspace currently functions as a **skeleton / wiring prototype**: several consensus/state/execution modules are explicitly marked *placeholder*.
- The **TEV gate is structurally non-bypassable** for the currently implemented capital path (`execution::capital_gate` wraps `mint`), but TEV decisions are not yet cryptographically authenticated (attestations and oracle registry are placeholders).
- The **audit log hash chain is now deterministic and consensus-safe** (no wall-clock time inside the hashed payload; canonical JSON hashing; explicit audit metadata).
- The chain now exposes a **deterministic state commitment** (`ChainState::state_root_hex()`), currently based on the namespaces registry.

## High-impact findings

### 1) Consensus is not implemented (PLACEHOLDER)

**Status:** Blocker for production.


- `crates/consensus/*` are placeholders (`validator_set`, `finality`, etc.).
- `crates/runtime/{block,tx,dispatcher}.rs` are placeholders.

**Why it matters:** Without a real consensus/blocks/tx pipeline, there is no defined deterministic state transition function for multiple validators.

**Recommendation:** Decide and implement a minimal consensus and block format (even a “single leader + signed blocks” prototype), then lock determinism and replay rules.

### 2) TEV decisions are not authenticated

**Status:** Blocker for production.


- `crates/tev/attestations.rs` and `crates/tev/oracle_registry.rs` are placeholders.
- `tev::decision::require_consensus` accepts any `TevDecision` stored in memory (`TevContext.latest_decision`) with no signature, quorum proof, or policy hash pinning.

**Why it matters:** Any component that can mutate `TevContext` can mint/transfer by injecting an “allowed” decision.

**Recommendation:**

- Define a signed attestation format (domain-separated).
- Pin TEV decisions to the chain’s `policy_hash` (from genesis).
- Verify against an on-chain (or genesis-pinned) oracle registry; require quorum.

### 3) Genesis config contains placeholders

**Status:** Blocker for production.


- `genesis/genesis.json` and `genesis/policy_hash.json` include `*PLACEHOLDER*` values.

**Why it matters:** Without pinned controller keys and a pinned policy hash, the chain cannot prove which governance/TEV policy it is enforcing.

**Recommendation:** Implement policy hash generation (from the canonical spec bundle), and enforce non-placeholder genesis values under a strict mode (CI / release).

## Changes applied in this audit (code)

### A) Deterministic audit hashing (✅ done)

Files:

- `crates/audit/src/event_log.rs`

Key properties:

- Introduced `AuditMeta { height, slot }`.
- Removed wall-clock time from the hashed payload.
- Canonicalized JSON before hashing (sorted object keys).
- Added a domain separator `uny-korn-audit-v1`.

Impact:

- Two nodes replaying the same sequence with the same meta now produce identical hashes.

### B) Deterministic state commitments (✅ done)

Files:

- `crates/state/src/namespaces.rs`
- `crates/state/src/lib.rs`

Key properties:

- `NamespaceRegistry::commitment_hash_hex()` uses a domain separator and iterates a `BTreeMap` in sorted order.
- `ChainState::state_root_hex()` returns the namespace commitment (to be expanded as other modules become real).

### C) Runtime now emits state roots into the audit log (✅ done)

Files:

- `crates/runtime/src/lib.rs`

Impact:

- Auditors/verifiers can correlate events with the committed state root.

### D) TEV decisions are now policy-hash pinned (✅ partial)

Files:

- `crates/tev/src/decision.rs`
- `crates/execution/src/capital_gate.rs`
- `crates/execution/src/mint.rs`
- `crates/runtime/src/lib.rs`

Impact:

- Even if a component injects an "allowed" TEV decision, execution additionally requires it be pinned to the runtime's expected `policy_hash`.
- This does **not** yet authenticate TEV decisions cryptographically (oracle registry + attestations remain placeholders).

## Verifier status

- `crates/verifier` (`pst-verifier`) verifies the audit hash chain (mechanical acceptance).
- With the new audit hash scheme, old sample logs generated with wall-clock timestamps will not verify; the sample log in `audit.sample.json` has been updated accordingly.

## Next hardening steps (recommended order)

1. **Define block/tx canonical encoding** (no JSON in consensus). Prefer a stable binary encoding.
2. **Implement TEV attestation verification** (domain separation, policy hash pinning, quorum).
3. **Implement genesis loader + strict mode** (reject placeholders in release/CI).
4. **Define and commit a full state root** across all state modules.
5. Add property tests: replay determinism, state root stability, and rejection of malformed inputs.

## Reproduction

From `uny-korn-l1/`:

- Build/test: `cargo test --workspace`
- Generate audit JSON: `cargo run -p unykorn-node --quiet`
- Verify sample: `cargo run -p pst-verifier --quiet -- audit.sample.json`
