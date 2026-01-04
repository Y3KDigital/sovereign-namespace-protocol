# SNP Genesis CLI

**Genesis ceremony tooling for Sovereign Namespace Protocol (SNP) v1.0**

## Purpose

This tool orchestrates the **one-time, irreversible genesis ceremony** that creates the immutable foundation for all SNP namespaces.

## What Genesis Does

The genesis ceremony:
- ✅ Happens **once and only once**
- ✅ Produces the **genesis hash** (32 bytes, permanent)
- ✅ Establishes **supply bounds** (1,000,000 max namespaces)
- ✅ Destroys **all admin authority** (provably, on-chain)
- ✅ Creates a **public, verifiable transcript** (IPFS-stored)

After genesis, the system is **autonomous forever**.

## Installation

```bash
cargo build --release
```

Binary: `target/release/snp-genesis`

## Commands

### Run Mock Ceremony (Testing)

```bash
snp-genesis run-mock --output genesis-transcript.json
```

**Warning**: This uses mock data. Production ceremony requires:
- Live Bitcoin block hash (future block height)
- Live Ethereum block hash (future block height)
- NIST randomness beacon (specific timestamp)
- Cosmic radiation measurement (public observatory)
- Multi-party computation (7+ participants)

### Verify Genesis Transcript

```bash
snp-genesis verify --transcript genesis-transcript.json
```

Recomputes genesis hash from entropy sources and verifies it matches.

### Show Ceremony Phases

```bash
snp-genesis phases
```

Educational output showing the 5 phases of genesis.

## Genesis Formula

From [GENESIS_SPEC.md](../specs/GENESIS_SPEC.md):

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

## Ceremony Phases

### Phase 1: Commitment (T-72 hours)
- Announce ceremony date publicly
- Specify future blockchain block heights
- Recruit 7+ ceremony participants

### Phase 2: Entropy Collection (T-0)
- Bitcoin block mined → extract hash
- Ethereum block finalized → extract hash
- NIST beacon publishes → capture output
- Cosmic observation → capture measurement
- MPC ceremony executes → collect entropy

### Phase 3: Genesis Hash Computation (T+1 hour)
- Aggregate all entropy sources
- Commit protocol parameters
- Compute SHA3-256 genesis hash
- **PUBLISH GENESIS HASH** (point of no return)

### Phase 4: Key Destruction (T+2 hours)
- Destroy all temporary admin keys
- Publish destruction proofs on-chain
- Publish ceremony transcript to IPFS
- Mine genesis block

### Phase 5: Verification (T+24 hours)
- Public verifies all inputs
- Public recomputes genesis hash independently
- If verified → **GENESIS IS FINAL**

## Post-Genesis Guarantees

After genesis:
- ❌ No admin keys exist
- ❌ No governance possible
- ❌ Genesis hash CANNOT be changed
- ✅ Protocol is autonomous forever
- ✅ All namespaces bind to this genesis
- ✅ Fork resistance (different genesis = different IDs)

## Example Output

```
🔮 Starting Mock Genesis Ceremony

=== Phase 1: Entropy Collection ===

⛏️  Fetching Bitcoin block...
   Height: 875000
   Hash: 0x...

🔷 Fetching Ethereum block...
   Height: 21000000
   Hash: 0x...

🏛️  Fetching NIST beacon...
   Pulse: 1767358779
   Output: 0x...

🌌 Fetching cosmic measurement...
   Observatory: Arecibo Observatory
   Value: 0x...

🤝 Performing MPC ceremony...
   Participants: 7
   Final Output: 0x...

=== Phase 2: Genesis Hash Computation ===

🧮 Computing genesis hash...
   Genesis Hash: 0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc

✅ Transcript saved: genesis-transcript.json
```

## Conformance

Implements:
- [GENESIS_SPEC.md](../specs/GENESIS_SPEC.md) - Genesis ceremony protocol
- [CRYPTO_PROFILE.md](../specs/CRYPTO_PROFILE.md) - SHA3-256 hashing

## License

MIT
