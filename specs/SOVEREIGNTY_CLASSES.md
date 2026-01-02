# Sovereignty Classes Specification

**Version**: 1.0.0  
**Status**: Locked at Genesis  
**Purpose**: Define permanent transfer and control rules

---

## 1. Core Principle

> Sovereignty class is **assigned at creation** and **cannot be changed**. It defines what authority over the namespace is possible, forever.

Different use cases require different sovereignty models. This system provides 5 fundamental classes.

---

## 2. Class Overview

| Class | Transferable | Multi-Key | Inheritance | Use Case |
|-------|--------------|-----------|-------------|----------|
| **Immutable** | Never | No | No | Foundational roots, protocols |
| **Transferable** | Yes | No | No | Tradable property, assets |
| **Delegable** | Conditional | Yes | Optional | Organizations, DAOs |
| **Heritable** | Conditional | No | Yes | Estates, long-term holdings |
| **Sealed** | Never | No | No | Permanent vaults, time capsules |

---

## 3. Class 1: Immutable (Non-Transferable)

### Definition

```rust
pub struct ImmutableClass {
    pub owner: PublicKey,          // Set at creation, permanent
    pub creation_timestamp: i64,
}
```

### Rules

- **Cannot be transferred** under any circumstances
- **Cannot be sold** or traded
- **Cannot be inherited** (exception: pre-committed at creation)
- **Owner is permanent** for the life of the namespace

### Use Cases

- Protocol roots (e.g., "1.x" might be the protocol foundation)
- Institutional anchors (governments, standards bodies)
- Personal identity namespaces (sovereign identity)
- Public goods (permanent community resources)

### Value Proposition

The **permanence itself is the value**:
- Known ownership forever
- Cannot be captured or sold
- Provides stability for dependent namespaces
- Trust anchor for ecosystems

### Security

- Loss of key = **permanent loss** (no recovery)
- This is a feature, not a bug (creates real scarcity)

---

## 4. Class 2: Transferable

### Definition

```rust
pub struct TransferableClass {
    pub transfer_mode: TransferMode,
    pub transfer_count: u32,           // Incrementing counter
    pub last_transfer: Option<i64>,    // Timestamp
}

pub enum TransferMode {
    Once,         // Can only be transferred one time
    Unlimited,    // Can be transferred any number of times
}
```

### Rules

#### Mode: Once
- Namespace can be transferred **exactly one time**
- After transfer, it becomes **immutable**
- Use case: Gift, initial distribution, one-time sale

#### Mode: Unlimited
- Namespace can be transferred **unlimited times**
- Each transfer is atomic and final
- Use case: Tradable property, speculation, markets

### Transfer Protocol

```rust
pub struct TransferProof {
    pub namespace_hash: [u8; 32],
    pub from: PublicKey,
    pub to: PublicKey,
    pub timestamp: i64,
    pub nonce: u32,                    // Prevents replay
    pub signature: Vec<u8>,
}

impl TransferProof {
    pub fn verify(&self, namespace: &Namespace) -> bool {
        // 1. Verify class allows transfer
        if !namespace.class.allows_transfer() {
            return false;
        }
        
        // 2. Verify sender is current owner
        if namespace.owner != self.from {
            return false;
        }
        
        // 3. Verify signature over transfer message
        let message = self.transfer_message();
        if !self.from.verify_signature(&message, &self.signature) {
            return false;
        }
        
        // 4. Verify nonce (prevents replay attacks)
        if self.nonce != namespace.transfer_count + 1 {
            return false;
        }
        
        true
    }
    
    fn transfer_message(&self) -> Vec<u8> {
        let mut msg = Vec::new();
        msg.extend_from_slice(b"TRANSFER");
        msg.extend_from_slice(&self.namespace_hash);
        msg.extend_from_slice(&self.to.to_bytes());
        msg.extend_from_slice(&self.timestamp.to_le_bytes());
        msg.extend_from_slice(&self.nonce.to_le_bytes());
        msg
    }
}
```

### Anti-Fraud Protection

- **Atomic**: Transfer succeeds completely or fails completely
- **Final**: No undo, no reversal
- **Provable**: Full cryptographic audit trail
- **Non-repudiable**: Signature proves authorization

---

## 5. Class 3: Delegable (Multi-Key Control)

### Definition

```rust
pub struct DelegableClass {
    pub controllers: Vec<PublicKey>,   // Up to 10 keys
    pub threshold: u8,                 // M-of-N signatures required
    pub delegation_rules: DelegationRules,
}

pub struct DelegationRules {
    pub can_add_controllers: bool,     // Can add new keys
    pub can_remove_controllers: bool,  // Can remove keys
    pub threshold_mutable: bool,       // Can change threshold
}
```

### Rules

- **Multiple keys** can control the namespace
- **Threshold signature** required for actions
- **Role-based** permissions possible

### Example: 3-of-5 Multisig

```rust
DelegableClass {
    controllers: vec![key1, key2, key3, key4, key5],
    threshold: 3,  // Requires any 3 signatures
    delegation_rules: DelegationRules {
        can_add_controllers: true,
        can_remove_controllers: true,
        threshold_mutable: false,  // Threshold locked
    },
}
```

### Use Cases

- DAOs (decentralized autonomous organizations)
- Corporate entities (board of directors)
- Joint ownership (partnerships)
- Escrow (3rd party required for release)

### Action Protocol

```rust
pub struct DelegableAction {
    pub namespace_hash: [u8; 32],
    pub action: Action,                // Transfer, Execute, Modify
    pub signatures: Vec<Signature>,    // M signatures
    pub timestamp: i64,
}

pub struct Signature {
    pub signer: PublicKey,
    pub signature: Vec<u8>,
}

impl DelegableAction {
    pub fn verify(&self, namespace: &Namespace) -> bool {
        let class = match &namespace.sovereignty_class {
            SovereigntyClass::Delegable(c) => c,
            _ => return false,
        };
        
        // 1. Check we have enough signatures
        if self.signatures.len() < class.threshold as usize {
            return false;
        }
        
        // 2. Verify each signature is from a valid controller
        let message = self.action_message();
        let mut valid_count = 0;
        
        for sig in &self.signatures {
            if class.controllers.contains(&sig.signer) {
                if sig.signer.verify_signature(&message, &sig.signature) {
                    valid_count += 1;
                }
            }
        }
        
        // 3. Must meet threshold
        valid_count >= class.threshold as usize
    }
}
```

---

## 6. Class 4: Heritable (Succession Planning)

### Definition

```rust
pub struct HeritableClass {
    pub current_owner: PublicKey,
    pub heirs: Vec<Heir>,
    pub unlock_conditions: Vec<UnlockCondition>,
}

pub struct Heir {
    pub heir_key: PublicKey,
    pub share: f64,                    // Percentage (0.0-1.0)
}

pub enum UnlockCondition {
    TimeDelay {
        unlock_at: i64,                // Unix timestamp
    },
    DeadManSwitch {
        last_proof_required_by: i64,   // Owner must prove alive
        check_interval: i64,           // How often to check
    },
    WitnessQuorum {
        witnesses: Vec<PublicKey>,     // Trusted witnesses
        required_signatures: u8,       // M-of-N witnesses
    },
    BlockHeight {
        unlock_after_block: u64,       // After specific block
    },
    Composite {
        conditions: Vec<UnlockCondition>,
        logic: CompositeLogic,         // AND or OR
    },
}

pub enum CompositeLogic {
    And,  // All conditions must be met
    Or,   // Any condition can trigger
}
```

### Use Cases

- **Estate planning**: Pass namespace to children after death
- **Time locks**: Unlock after 10 years
- **Dead man switch**: If owner doesn't check in, heirs get access
- **Witness attestation**: Trusted parties confirm eligibility

### Example: Estate Plan

```rust
HeritableClass {
    current_owner: grandparent_key,
    heirs: vec![
        Heir { heir_key: child1_key, share: 0.5 },
        Heir { heir_key: child2_key, share: 0.5 },
    ],
    unlock_conditions: vec![
        UnlockCondition::Composite {
            conditions: vec![
                // 1 year time delay
                UnlockCondition::TimeDelay {
                    unlock_at: 1767542400,  // 2026 + 10 years
                },
                // AND witness attestation
                UnlockCondition::WitnessQuorum {
                    witnesses: vec![lawyer_key, executor_key],
                    required_signatures: 2,  // Both must sign
                },
            ],
            logic: CompositeLogic::And,
        },
    ],
}
```

### Inheritance Claim Protocol

```rust
pub struct InheritanceClaim {
    pub namespace_hash: [u8; 32],
    pub heir: PublicKey,
    pub condition_proofs: Vec<ConditionProof>,
    pub signature: Vec<u8>,
}

pub enum ConditionProof {
    TimeProof { current_timestamp: i64 },
    DeadManProof { missed_checkins: Vec<i64> },
    WitnessProof { signatures: Vec<Signature> },
    BlockProof { block_number: u64 },
}

impl InheritanceClaim {
    pub fn verify(&self, namespace: &Namespace) -> bool {
        let class = match &namespace.sovereignty_class {
            SovereigntyClass::Heritable(c) => c,
            _ => return false,
        };
        
        // 1. Verify heir is in the list
        if !class.heirs.iter().any(|h| h.heir_key == self.heir) {
            return false;
        }
        
        // 2. Verify all unlock conditions are met
        for condition in &class.unlock_conditions {
            if !self.verify_condition(condition) {
                return false;
            }
        }
        
        // 3. Verify heir signature
        let message = self.claim_message();
        self.heir.verify_signature(&message, &self.signature)
    }
}
```

---

## 7. Class 5: Sealed (Permanent Vault)

### Definition

```rust
pub struct SealedClass {
    pub owner: PublicKey,              // Can manage, but not extract
    pub creation_timestamp: i64,
    pub seal_type: SealType,
}

pub enum SealType {
    Permanent,                         // Can never be unsealed
    TimeLocked { unseal_at: i64 },    // Unseal at specific time
    ConditionalUnseal {                // Unseal if condition met
        condition: UnlockCondition,
    },
}
```

### Rules

- Namespace **can receive value** (tokens, assets, NFTs)
- Namespace **cannot send value out** (vault is write-only)
- Owner can **view** contents, but not **extract**

### Use Cases

- **Time capsules**: Lock value for 50 years
- **Burn mechanisms**: Permanent removal from circulation
- **Commitments**: Provable locked funds
- **Trust funds**: Can't be accessed early

### Example: 10-Year Time Capsule

```rust
SealedClass {
    owner: creator_key,
    creation_timestamp: 1737072000,  // 2026
    seal_type: SealType::TimeLocked {
        unseal_at: 1767542400,  // 2036 (10 years later)
    },
}
```

### Value Proposition

- **Provable commitments**: Can prove funds are locked
- **Long-term planning**: Forces discipline
- **Deflationary**: Sealed value is out of circulation
- **Trust**: Others know you can't rugpull

---

## 8. Class Assignment Rules

### At Creation

```rust
pub fn create_namespace(
    id: String,
    parent: Namespace,
    sovereignty_class: SovereigntyClass,
    owner: PublicKey,
) -> Result<Namespace, Error> {
    // Class is set here and CANNOT BE CHANGED
    
    Namespace {
        id,
        sovereignty_class,  // IMMUTABLE
        owner,
        // ... other fields
    }
}
```

### Immutability

Once created:
- ❌ Cannot change class (Transferable → Immutable)
- ❌ Cannot upgrade (Immutable → Delegable)
- ❌ Cannot downgrade (Delegable → Transferable)

### Why Immutable?

- **Predictability**: Buyers know what they're getting
- **Security**: No rug pulls or bait-and-switch
- **Trust**: Rules are guaranteed forever
- **Value**: Scarcity is real, not policy-based

---

## 9. Class Composition (Advanced)

### Hybrid Classes (Optional)

For maximum flexibility, classes can be **composed**:

```rust
pub struct CompositeClass {
    pub base_class: BaseClass,
    pub modifiers: Vec<ClassModifier>,
}

pub enum BaseClass {
    Immutable,
    Transferable,
    Delegable,
    Heritable,
    Sealed,
}

pub enum ClassModifier {
    TimeLockedTransfer { unlock_at: i64 },
    QuorumRequired { threshold: u8 },
    WitnessApproval { witnesses: Vec<PublicKey> },
    RateLimited { max_transfers_per_year: u32 },
}
```

Example: **Transferable + Time Lock**

```rust
CompositeClass {
    base_class: BaseClass::Transferable,
    modifiers: vec![
        ClassModifier::TimeLockedTransfer {
            unlock_at: 1767542400,  // Can't transfer for 10 years
        },
    ],
}
```

---

## 10. Security Guarantees

### What Classes Prevent

- **Immutable**: Prevents market manipulation (can't be bought)
- **Transferable**: Prevents false ownership claims (cryptographic proof)
- **Delegable**: Prevents single-point-of-failure (multi-sig)
- **Heritable**: Prevents loss on death (succession plan)
- **Sealed**: Prevents rug pulls (value is locked)

### What Classes Enable

- **Immutable**: Enables trust anchors, stable identity
- **Transferable**: Enables markets, liquidity, speculation
- **Delegable**: Enables organizations, DAOs, institutions
- **Heritable**: Enables estates, long-term holdings
- **Sealed**: Enables commitments, vaults, time capsules

---

## Summary

Sovereignty classes provide:

- **Flexibility**: 5 distinct models for different needs
- **Permanence**: Class set at creation, never changes
- **Security**: Cryptographic enforcement, not policy
- **Predictability**: Buyers know exactly what rules apply
- **Composability**: Classes can be combined (optional)

This is **sovereignty by design**, not by governance.

---

**Status**: Locked at Genesis  
**Modification**: Prohibited  
**Class Assignment**: Immutable
