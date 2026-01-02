# Genesis Ceremony Specification

**Version**: 1.0.0  
**Status**: Pre-Genesis  
**Purpose**: Define the one-time, irreversible genesis event

---

## 1. Purpose

The genesis ceremony creates the **immutable foundation** from which all namespaces derive. This ceremony:

- Happens **once and only once**
- Produces the **genesis hash**
- Establishes **supply bounds**
- Destroys **all admin authority**
- Creates a **public, verifiable transcript**

After genesis, the system is **autonomous forever**.

---

## 2. Genesis Inputs

### A. Entropy Sources (Multi-Party)

Minimum **5 independent entropy sources**:

1. **Block hash** from Bitcoin (at predetermined height)
2. **Block hash** from Ethereum (at predetermined height)
3. **NIST randomness beacon** output
4. **Cosmic background radiation** measurement (public observatory)
5. **Cryptographic ceremony** - multi-party computation with at least 7 participants

Each participant commits entropy **before** seeing others' commitments.

### B. Protocol Parameters

Fixed at genesis:

```rust
GenesisParameters {
    // Cryptographic
    signature_scheme: "CRYSTALS-Dilithium5",
    hash_function: "SHA3-256",
    merkle_hash: "BLAKE3",
    
    // Supply
    max_root_namespaces: 10_000,
    max_depth: 10,
    max_total_namespaces: 1_000_000,
    
    // Rarity
    rarity_algorithm: "v1",
    tier_boundaries: [100, 250, 500, 750, 900],
    
    // Economics
    genesis_distribution: "public_auction",
    treasury_allocation: None,
    
    // Governance
    admin_keys: None,
    upgrade_mechanism: None,
    parameter_voting: None,
}
```

### C. Initial State

```rust
GenesisState {
    timestamp: UNIX_TIMESTAMP,
    root_namespace: "/",
    reserved_namespaces: [], // None
    founding_participants: [/* public keys */],
    ceremony_transcript: IPFS_CID,
}
```

---

## 3. Genesis Hash Derivation

### Formula

```
GENESIS_HASH = SHA3-256(
    PROTOCOL_VERSION ||
    BITCOIN_BLOCK_HASH ||
    ETHEREUM_BLOCK_HASH ||
    NIST_BEACON_OUTPUT ||
    COSMIC_MEASUREMENT ||
    MPC_CEREMONY_OUTPUT ||
    PARAMETERS_COMMITMENT ||
    PARTICIPANT_COMMITMENTS ||
    TIMESTAMP
)
```

### Properties

- **Deterministic** - Same inputs always produce same genesis hash
- **Unpredictable** - Cannot be predicted before ceremony
- **Verifiable** - All inputs are public and checkable
- **Irreproducible** - Cannot be recreated (time-dependent sources)

---

## 4. Ceremony Protocol

### Phase 1: Commitment (T-72 hours)

1. Announce ceremony date publicly
2. Specify Bitcoin and Ethereum block heights (future)
3. Designate NIST beacon timestamp
4. Identify cosmic observation source
5. Recruit ceremony participants (minimum 7)

### Phase 2: Entropy Collection (T-0 hours)

1. Bitcoin block mined → extract hash
2. Ethereum block finalized → extract hash
3. NIST beacon publishes → capture output
4. Observatory publishes measurement → capture value
5. MPC ceremony executes → participants contribute entropy

### Phase 3: Genesis Hash Computation (T+1 hour)

1. Aggregate all entropy sources
2. Commit protocol parameters
3. Compute genesis hash using formula
4. **Publish genesis hash** (irreversible point of no return)

### Phase 4: Key Destruction (T+2 hours)

1. Any temporary admin keys used for setup → **provably destroyed**
2. Destruction proof published on-chain
3. Ceremony transcript published to IPFS
4. Genesis block mined

### Phase 5: Verification Period (T+24 hours)

1. Public verifies all inputs
2. Public recomputes genesis hash independently
3. Any discrepancy → ceremony is invalid (restart required)
4. If verified → **genesis is final**

---

## 5. Genesis Transcript

The ceremony produces a **permanent public record**:

```json
{
  "version": "1.0.0",
  "ceremony_date": "2026-01-15T00:00:00Z",
  "entropy_sources": {
    "bitcoin_block": {
      "height": 875000,
      "hash": "0x...",
      "timestamp": 1737072000
    },
    "ethereum_block": {
      "height": 21000000,
      "hash": "0x...",
      "timestamp": 1737072000
    },
    "nist_beacon": {
      "pulse_index": "...",
      "output": "0x...",
      "timestamp": 1737072000
    },
    "cosmic_source": {
      "observatory": "Arecibo Observatory",
      "measurement_id": "...",
      "value": "0x..."
    },
    "mpc_ceremony": {
      "participants": ["pubkey1", "pubkey2", ...],
      "commitments": ["hash1", "hash2", ...],
      "final_output": "0x..."
    }
  },
  "parameters": {
    "signature_scheme": "CRYSTALS-Dilithium5",
    "hash_function": "SHA3-256",
    "max_supply": 1000000,
    ...
  },
  "genesis_hash": "0x...",
  "key_destruction_proof": "0x...",
  "ipfs_cid": "Qm...",
  "verification_script": "ipfs://Qm.../verify.rs"
}
```

### Storage

- **IPFS** (permanent, content-addressed)
- **On-chain** (as calldata or state commitment)
- **Public archives** (GitHub, Arweave, multiple mirrors)

---

## 6. Post-Genesis Guarantees

After genesis:

### ✅ Immutable
- Genesis hash **cannot be changed**
- Parameters **cannot be modified**
- Supply **cannot be inflated**

### ✅ Verifiable
- Anyone can verify inputs
- Anyone can recompute genesis hash
- Ceremony transcript is public

### ✅ Unique
- This genesis can never happen again (time-dependent)
- Any copy produces different genesis hash
- Namespace identities are unique to this genesis

### ✅ Adminless
- No admin keys exist
- No emergency controls
- No governance
- Protocol is autonomous

---

## 7. Fork Resistance

If someone attempts to fork or copy the system:

### What They Get
- The same **code**
- The same **cryptographic schemes**

### What They Cannot Get
- The same **genesis hash** (time-dependent, non-reproducible)
- The same **namespace identities** (derived from genesis hash)
- The same **historical proofs** (tied to original genesis)

### Result
Their namespaces are **provably different** and have **no connection** to the original system's value, history, or authority.

---

## 8. Failure Modes

### If Ceremony Fails
- **Before genesis hash published** → Restart ceremony with new parameters
- **After genesis hash published** → Ceremony is **final**, cannot be undone

### If Entropy Source Compromised
- Multiple independent sources required
- Compromise of 1-2 sources is acceptable
- Compromise of ≥3 sources → restart ceremony

### If Verification Fails
- Discrepancy in recomputation → **ceremony is invalid**
- Must restart with new ceremony
- Better to delay than proceed with invalid genesis

---

## 9. Genesis Validation Checklist

Before finalizing genesis, verify:

- [ ] All entropy sources are public and verifiable
- [ ] Genesis hash recomputation matches published value
- [ ] Protocol parameters are correctly committed
- [ ] Key destruction proof is valid
- [ ] Ceremony transcript is published to IPFS
- [ ] No admin keys remain in protocol
- [ ] No upgrade paths exist in code
- [ ] Supply bounds are mathematically enforced
- [ ] Verification script is published
- [ ] At least 5 independent parties have verified

---

## 10. Implementation Notes

### Ceremony Execution

```rust
pub struct GenesisCeremony {
    entropy_sources: Vec<EntropySource>,
    parameters: GenesisParameters,
    participants: Vec<PublicKey>,
}

impl GenesisCeremony {
    pub fn collect_entropy(&mut self) -> Result<Vec<[u8; 32]>> {
        // Collect from all sources
    }
    
    pub fn compute_genesis_hash(&self, entropy: Vec<[u8; 32]>) -> [u8; 32] {
        let mut hasher = Sha3_256::new();
        
        hasher.update(PROTOCOL_VERSION);
        for e in entropy {
            hasher.update(&e);
        }
        hasher.update(&self.parameters.to_bytes());
        hasher.update(&self.participants.to_bytes());
        hasher.update(&current_timestamp().to_le_bytes());
        
        hasher.finalize().into()
    }
    
    pub fn publish_transcript(&self) -> IpfsCid {
        // Publish to IPFS, return CID
    }
    
    pub fn destroy_keys(&self) -> DestructionProof {
        // Generate proof that temporary keys are destroyed
    }
}
```

### Verification Script

Provided as separate `verify_genesis.rs` that anyone can run:

```rust
pub fn verify_genesis(transcript: GenesisTranscript) -> Result<bool> {
    // 1. Fetch all entropy sources
    // 2. Recompute genesis hash
    // 3. Compare to published hash
    // 4. Verify key destruction
    // 5. Return true if all checks pass
}
```

---

## Summary

The genesis ceremony is:

- **One-time** - Can never be repeated
- **Multi-party** - No single point of control
- **Verifiable** - All inputs are public
- **Irreversible** - No undo after genesis hash published
- **Permanent** - Creates foundation that lasts forever

This makes the namespace system **non-recreatable** and **truly sovereign**.

---

**Status**: Awaiting Ceremony  
**Next Step**: Schedule ceremony date and recruit participants
