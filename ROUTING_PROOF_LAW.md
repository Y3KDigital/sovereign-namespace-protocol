# Routing Proof: law Root
## Minimal End-to-End Validation

**Objective:** Prove `law` root routes correctly without public exposure
**Scope:** Internal validation only — no announcements, no partners, no marketplace
**Timeline:** 48 hours from root minting
**Status:** Not started

---

## Purpose

This proof demonstrates that:
1. Root namespace resolves correctly
2. Routing logic functions end-to-end
3. Integration points work under real conditions
4. Design is production-ready

**This is NOT:**
- A public demo
- A partnership launch
- A revenue test
- A marketing event

**This IS:**
- Internal validation
- Technical de-risking
- Design verification
- Usage proof-of-concept

---

## Scope (Minimal)

### What Gets Built

**1. Namespace Resolution** (Core)
- `law` root resolves to protocol-controlled record
- Namespace ID returns correct metadata
- Sovereignty class enforced: `ProtocolControlled`
- Transfer policy enforced: `Restricted`

**2. Phone Number Mapping** (Interface)
- `+1-800-LAW-Y3K` (+1-800-529-9935) → `law` namespace
- Lookup: phone number → namespace ID
- Reverse lookup: namespace ID → phone number
- Validation: mapping is unique and immutable

**3. AI Agent Registration** (Usage)
- Agent ID: `agent://law/intake-bot`
- Metadata: name, version, capability
- Routing: inbound request → agent handler
- Response: agent output → auditable log

**4. Audit Trail** (Verification)
- Call received: timestamp, caller, namespace
- Agent executed: input, output, duration
- Record stored: immutable log entry
- Retrieval: query log by namespace ID

---

## What Does NOT Get Built

- ❌ Public-facing website
- ❌ Customer intake forms
- ❌ Payment processing
- ❌ Partner integrations
- ❌ Marketing materials
- ❌ Dashboard/analytics
- ❌ Mobile apps
- ❌ Subdomain delegation

**Just the four components above. Nothing else.**

---

## Architecture

```
Phone Call                Namespace Lookup           AI Agent              Audit Log
+1-800-LAW-Y3K     →     law (namespace ID)    →    intake-bot       →    Immutable record
                         
                         Resolves to:
                         - ID: 0x...
                         - Sovereignty: ProtocolControlled
                         - Transfer: Restricted
                         - Owner: Protocol multisig
                         
                                                     Returns:
                                                     - Acknowledged
                                                     - Case ID: XXX
                                                     - Timestamp: UTC
                                                     
                                                                            Stores:
                                                                            - Caller: +1-XXX
                                                                            - Namespace: law
                                                                            - Agent: intake-bot
                                                                            - Output: {...}
                                                                            - Time: UTC
```

---

## Implementation

### Step 1: Namespace Resolution (snp-core)

**File:** `snp-core/src/resolver.rs` (if needed, or use existing registry)

```rust
// Minimal resolver
pub struct NamespaceResolver {
    registry: HashMap<String, Namespace>,
}

impl NamespaceResolver {
    pub fn resolve(&self, label: &str) -> Result<&Namespace> {
        self.registry.get(label)
            .ok_or(SnpError::NamespaceNotFound(label.to_string()))
    }
    
    pub fn verify_ownership(&self, label: &str, owner: &Address) -> Result<bool> {
        let ns = self.resolve(label)?;
        Ok(ns.owner == *owner)
    }
}
```

**Test:**
```rust
#[test]
fn test_law_resolution() {
    let resolver = NamespaceResolver::new();
    let law = resolver.resolve("law").unwrap();
    
    assert_eq!(law.sovereignty, SovereigntyClass::ProtocolControlled);
    assert_eq!(law.label, "law");
    assert!(law.transfer_policy().allows_revocation());
}
```

---

### Step 2: Phone Number Mapping

**File:** `phone-routing/src/lib.rs` (new module)

```rust
use std::collections::HashMap;

pub struct PhoneRouter {
    // Phone → Namespace ID mapping
    phone_to_namespace: HashMap<String, [u8; 32]>,
    // Namespace ID → Phone mapping (reverse)
    namespace_to_phone: HashMap<[u8; 32], String>,
}

impl PhoneRouter {
    pub fn new() -> Self {
        Self {
            phone_to_namespace: HashMap::new(),
            namespace_to_phone: HashMap::new(),
        }
    }
    
    pub fn register(&mut self, phone: &str, namespace_id: [u8; 32]) -> Result<()> {
        // Validate phone format
        if !phone.starts_with("+1") {
            return Err(Error::InvalidPhoneFormat);
        }
        
        // Check uniqueness
        if self.phone_to_namespace.contains_key(phone) {
            return Err(Error::PhoneAlreadyRegistered);
        }
        
        // Register bidirectional mapping
        self.phone_to_namespace.insert(phone.to_string(), namespace_id);
        self.namespace_to_phone.insert(namespace_id, phone.to_string());
        
        Ok(())
    }
    
    pub fn lookup_by_phone(&self, phone: &str) -> Option<[u8; 32]> {
        self.phone_to_namespace.get(phone).copied()
    }
    
    pub fn lookup_by_namespace(&self, namespace_id: &[u8; 32]) -> Option<&str> {
        self.namespace_to_phone.get(namespace_id).map(|s| s.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_law_phone_routing() {
        let mut router = PhoneRouter::new();
        let law_id = [0u8; 32]; // Actual namespace ID
        
        router.register("+18005299935", law_id).unwrap();
        
        assert_eq!(router.lookup_by_phone("+18005299935"), Some(law_id));
        assert_eq!(router.lookup_by_namespace(&law_id), Some("+18005299935"));
    }
}
```

---

### Step 3: AI Agent Handler

**File:** `ai-agents/src/intake_bot.rs` (new module)

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentRequest {
    pub namespace_id: [u8; 32],
    pub caller_phone: String,
    pub timestamp: u64,
    pub input: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentResponse {
    pub status: String,
    pub case_id: String,
    pub message: String,
    pub timestamp: u64,
}

pub struct IntakeBot {
    pub namespace_id: [u8; 32],
}

impl IntakeBot {
    pub fn new(namespace_id: [u8; 32]) -> Self {
        Self { namespace_id }
    }
    
    pub fn handle(&self, request: AgentRequest) -> AgentResponse {
        // Minimal response (no actual AI yet)
        AgentResponse {
            status: "acknowledged".to_string(),
            case_id: format!("LAW-{}", uuid::Uuid::new_v4()),
            message: "Your call has been logged. A representative will contact you.".to_string(),
            timestamp: chrono::Utc::now().timestamp() as u64,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_intake_bot_response() {
        let law_id = [0u8; 32];
        let bot = IntakeBot::new(law_id);
        
        let request = AgentRequest {
            namespace_id: law_id,
            caller_phone: "+15551234567".to_string(),
            timestamp: 1736899200,
            input: "Test intake".to_string(),
        };
        
        let response = bot.handle(request);
        
        assert_eq!(response.status, "acknowledged");
        assert!(response.case_id.starts_with("LAW-"));
    }
}
```

---

### Step 4: Audit Log

**File:** `audit-log/src/lib.rs` (new module)

```rust
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEntry {
    pub id: String,
    pub timestamp: u64,
    pub namespace_id: [u8; 32],
    pub namespace_label: String,
    pub caller_phone: String,
    pub agent_id: String,
    pub request: String,
    pub response: String,
}

pub struct AuditLog {
    entries: VecDeque<AuditEntry>,
}

impl AuditLog {
    pub fn new() -> Self {
        Self {
            entries: VecDeque::new(),
        }
    }
    
    pub fn append(&mut self, entry: AuditEntry) {
        self.entries.push_back(entry);
    }
    
    pub fn query_by_namespace(&self, namespace_id: &[u8; 32]) -> Vec<&AuditEntry> {
        self.entries.iter()
            .filter(|e| &e.namespace_id == namespace_id)
            .collect()
    }
    
    pub fn query_by_phone(&self, phone: &str) -> Vec<&AuditEntry> {
        self.entries.iter()
            .filter(|e| e.caller_phone == phone)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_audit_log() {
        let mut log = AuditLog::new();
        let law_id = [0u8; 32];
        
        let entry = AuditEntry {
            id: "entry-1".to_string(),
            timestamp: 1736899200,
            namespace_id: law_id,
            namespace_label: "law".to_string(),
            caller_phone: "+15551234567".to_string(),
            agent_id: "intake-bot".to_string(),
            request: "Test".to_string(),
            response: "Acknowledged".to_string(),
        };
        
        log.append(entry);
        
        assert_eq!(log.query_by_namespace(&law_id).len(), 1);
    }
}
```

---

## End-to-End Test

**File:** `tests/routing_proof.rs`

```rust
#[test]
fn test_law_routing_end_to_end() {
    // 1. Resolve namespace
    let resolver = NamespaceResolver::new();
    let law = resolver.resolve("law").unwrap();
    
    // 2. Lookup phone
    let mut router = PhoneRouter::new();
    router.register("+18005299935", law.id).unwrap();
    
    let resolved_id = router.lookup_by_phone("+18005299935").unwrap();
    assert_eq!(resolved_id, law.id);
    
    // 3. Handle request
    let bot = IntakeBot::new(law.id);
    let request = AgentRequest {
        namespace_id: law.id,
        caller_phone: "+15551234567".to_string(),
        timestamp: chrono::Utc::now().timestamp() as u64,
        input: "Legal intake test".to_string(),
    };
    
    let response = bot.handle(request.clone());
    assert_eq!(response.status, "acknowledged");
    
    // 4. Log to audit
    let mut log = AuditLog::new();
    log.append(AuditEntry {
        id: "test-1".to_string(),
        timestamp: request.timestamp,
        namespace_id: law.id,
        namespace_label: "law".to_string(),
        caller_phone: request.caller_phone.clone(),
        agent_id: "intake-bot".to_string(),
        request: request.input,
        response: serde_json::to_string(&response).unwrap(),
    });
    
    let entries = log.query_by_namespace(&law.id);
    assert_eq!(entries.len(), 1);
    
    println!("✅ End-to-end routing proof: SUCCESS");
}
```

---

## Success Criteria

**Proof is complete when:**

1. ✅ `law` namespace resolves correctly
2. ✅ Phone number maps to namespace ID
3. ✅ AI agent handles request and returns response
4. ✅ Audit log stores entry with all metadata
5. ✅ End-to-end test passes
6. ✅ No public exposure (internal only)

**Proof is verified when:**

- Test suite passes: `cargo test routing_proof`
- Manual test via CLI: phone → namespace → agent → log
- Audit log queryable by namespace ID or phone

---

## What This Proves

**Technical:**
- Namespace resolution works
- Routing logic is sound
- Integration points function
- Design is production-ready

**Strategic:**
- Root has observable utility
- Usage justifies lock
- No speculative holding
- Infrastructure, not inventory

---

## What Happens After Success

**Immediate:**
- Document proof in internal report
- Archive test results
- Verify no leakage to public

**Next Phase (Choose ONE):**
- **Option B:** Delegation framework (if revenue focus)
- **Option C:** Governance hardening (if institutional focus)
- **Option D:** Minimal disclosure page (if market presence needed)

**DO NOT:**
- Announce proof publicly
- Rush to market
- Add partners prematurely
- Expand scope beyond proof

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Namespace resolution | 4 hours | Not started |
| Phone routing | 4 hours | Not started |
| AI agent handler | 4 hours | Not started |
| Audit log | 4 hours | Not started |
| End-to-end test | 2 hours | Not started |
| Verification | 2 hours | Not started |
| **TOTAL** | **20 hours** | **Not started** |

**Target completion:** 48 hours from start

---

## Risk Mitigation

**If test fails:**
- Document failure mode
- Fix issue in isolation
- Re-test specific component
- Re-run end-to-end test

**If design flaw discovered:**
- Do NOT ship workaround
- Fix at architecture level
- Re-validate entire flow
- Update documentation

**If timeline slips:**
- Reduce scope if needed (remove AI agent, keep phone routing)
- Maintain quality over speed
- No public commitments

---

## Post-Proof Actions

**Documentation:**
- Internal report: "Law Root Routing Proof - Results"
- Test coverage summary
- Performance metrics (if any)
- Lessons learned

**Archive:**
- Test logs
- Audit entries
- Performance data
- Codebase snapshot

**Security:**
- Verify no API keys leaked
- Verify no private keys exposed
- Verify audit log private
- Verify phone number not public

---

**This proof validates design. It does not launch product.**

**Complete quietly. Document thoroughly. Move to next phase only after success.**

---

*End of specification*
