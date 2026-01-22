# Blockchain Minting System - Implementation Plan

## Critical Issue
**Current State**: IPFS-only claiming system (certificates stored off-chain)
**Required State**: Full blockchain minting with on-chain registration and NFT ownership

## User Requirements
- "the ipfs didnt work this has to mint its vital"
- Need actual blockchain minting, not just IPFS certificate claiming
- Must provide true ownership via NFT/on-chain registration

---

## System Architecture

### 1. Smart Contract Design

#### Y3KNamespaceRegistry (Primary Contract)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Y3KNamespaceRegistry {
    struct Namespace {
        uint256 tokenId;           // ERC721 token ID
        string label;              // "77.x", "88.x", etc.
        bytes32 genesisHash;       // Binds to genesis ceremony
        bytes32 certificateHash;   // IPFS hash of full certificate
        address owner;             // Current owner
        uint256 mintedAt;          // Timestamp
        bool immutable;            // Can never be transferred (sovereignty lock)
    }
    
    mapping(uint256 => Namespace) public namespaces;
    mapping(string => uint256) public labelToTokenId;
    mapping(bytes32 => bool) public usedCertificateHashes;
    
    bytes32 public constant GENESIS_HASH = 0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc;
    
    event NamespaceMinted(
        uint256 indexed tokenId,
        string label,
        address indexed owner,
        bytes32 certificateHash
    );
    
    function mintNamespace(
        string calldata label,
        bytes32 certificateHash,
        bytes calldata signature // Ed25519 signature from genesis keys
    ) external payable returns (uint256 tokenId);
    
    function verifyOwnership(uint256 tokenId, address claimer) external view returns (bool);
}
```

**Key Features**:
- ERC721-compatible for NFT wallets
- Genesis hash binding (cryptographic proof of ceremony)
- IPFS certificate hash for off-chain data
- Ed25519 signature verification (from genesis keys)
- Immutability flag (can never be transferred = true sovereignty)

---

### 2. Payment Flow

#### Current (Stripe → IPFS)
```
User → Stripe Payment → /api/payments/create-intent → IPFS Certificate
```

#### Required (Stripe → Blockchain Mint)
```
User → Stripe Payment → Backend Verification → Smart Contract Mint → On-chain NFT + IPFS
```

**Implementation Steps**:
1. User pays via Stripe (existing flow)
2. Backend verifies payment success
3. Backend generates Ed25519 signature using genesis keys
4. Backend calls smart contract `mintNamespace()`
5. Smart contract verifies signature, mints NFT, records IPFS hash
6. User receives:
   - NFT in their wallet (on-chain proof)
   - IPFS certificate (off-chain data)
   - Blockchain transaction hash (immutable proof)

---

### 3. Blockchain Selection

#### Option A: Ethereum L2 (Recommended)
**Pros**:
- Established ecosystem
- Low gas fees ($0.01-0.10 per mint)
- Direct Ethereum security
- Easy wallet integration

**Best Candidates**:
- **Base** (Coinbase L2) - Best UX, mainstream adoption
- **Arbitrum One** - Mature, low fees
- **Optimism** - Strong developer tools

**Why L2 over Ethereum mainnet?**
- Mainnet gas: $20-100 per mint
- L2 gas: $0.01-0.10 per mint
- Same security guarantees via rollups

#### Option B: Polygon (Alternative)
**Pros**:
- Very low fees (<$0.01)
- Fast finality (2 seconds)
- Large NFT ecosystem

**Cons**:
- Separate security model from Ethereum
- Less "premium" perception

#### Option C: Custom Y3K Chain (Future)
**Pros**:
- Full control
- Zero gas fees for users
- Custom governance

**Cons**:
- Requires validator infrastructure
- Months of development
- Bootstrap security from scratch

**Recommendation**: **Base (Coinbase L2)** for launch, migrate to custom chain later

---

### 4. Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                            │
│              (y3k-markets-web/app/mint)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Stripe Payment                             │
│            (payments-api Rust backend)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Payment Verification                            │
│   - Verify Stripe webhook (payment_intent.succeeded)        │
│   - Check namespace availability                            │
│   - Generate Ed25519 signature                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Blockchain Interaction                            │
│   - Connect to Base L2 RPC                                  │
│   - Call Y3KNamespaceRegistry.mintNamespace()               │
│   - Wait for transaction confirmation                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│             IPFS Publication                                 │
│   - Upload full certificate to IPFS (Pinata/Cloudflare)    │
│   - Link IPFS hash to on-chain token                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            User Confirmation                                 │
│   - Send transaction hash                                   │
│   - Send NFT wallet address                                 │
│   - Send IPFS certificate link                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Backend Changes (payments-api)

**New Endpoints Required**:

#### `/api/mint/namespace` (POST)
- Verify Stripe payment
- Generate Ed25519 signature
- Call smart contract
- Return transaction hash + NFT details

#### `/api/mint/status` (GET)
- Check blockchain transaction status
- Return minting progress (pending/confirmed/failed)

**New Dependencies**:
```rust
// Add to payments-api/Cargo.toml
ethers = "2.0"           // Ethereum interaction
ethers-contract = "2.0"  // Smart contract bindings
alloy-primitives = "0.4" // For bytes32, addresses
ed25519-dalek = "2.0"    // Ed25519 signing (already have)
```

---

### 6. Implementation Phases

#### Phase 1: Smart Contract (1-2 days)
- [ ] Write `Y3KNamespaceRegistry.sol`
- [ ] Add Ed25519 signature verification
- [ ] Test on Base Sepolia (testnet)
- [ ] Deploy to Base mainnet

#### Phase 2: Backend Integration (2-3 days)
- [ ] Add `ethers-rs` to payments-api
- [ ] Create `/api/mint/namespace` endpoint
- [ ] Generate Ed25519 signatures from genesis keys
- [ ] Integrate with Stripe webhook

#### Phase 3: Frontend Updates (1 day)
- [ ] Update mint flow to show blockchain transaction
- [ ] Display NFT wallet address input
- [ ] Show transaction hash after minting
- [ ] Add Etherscan/Basescan link

#### Phase 4: Testing (1-2 days)
- [ ] Test full flow on Base Sepolia
- [ ] Test with real Stripe payment
- [ ] Verify NFT appears in wallet
- [ ] Load test (100+ mints)

#### Phase 5: Launch (1 day)
- [ ] Deploy contracts to Base mainnet
- [ ] Update all hardcoded addresses
- [ ] Update documentation
- [ ] Monitor first 10 mints

**Total Timeline**: 5-10 days

---

### 7. Cost Analysis

#### Per-Mint Costs:
- **Gas fees (Base L2)**: ~$0.05 per mint
- **IPFS pinning**: $0.01 per certificate (Pinata)
- **Total infrastructure**: ~$0.06 per mint

#### Revenue Model:
- **Sale price**: $100-10,000 per namespace (rarity-based)
- **Infrastructure cost**: $0.06
- **Profit margin**: 99.9%+

---

### 8. Security Considerations

#### Smart Contract Security:
- [ ] Reentrancy guards
- [ ] Signature replay protection
- [ ] Genesis hash verification
- [ ] OpenZeppelin audit (optional, $10k-30k)

#### Backend Security:
- [ ] Genesis keys in HSM or secure enclave
- [ ] Rate limiting on mint endpoint
- [ ] Stripe webhook verification
- [ ] Transaction monitoring

#### User Security:
- [ ] Educate users on wallet security
- [ ] Provide seed phrase backup guide
- [ ] Warn against phishing

---

### 9. User Experience Flow

```
1. User visits /mint page
2. User enters email + desired namespace (77, 88, 222, etc.)
3. User enters Ethereum wallet address (MetaMask, Coinbase Wallet)
4. User pays via Stripe ($100-10k depending on rarity)
5. Backend receives payment webhook
6. Backend mints NFT to user's wallet address
7. User receives:
   - Email with transaction hash
   - NFT in wallet (visible in OpenSea, Rainbow, etc.)
   - IPFS certificate link
   - Sovereignty documentation
```

**Key UX Improvements**:
- No need to connect wallet upfront (just enter address)
- No gas fees for user (backend pays)
- Instant confirmation (L2 finality ~2 seconds)
- NFT appears in all major wallets automatically

---

### 10. Migration Path

#### Existing IPFS Claims → Blockchain
For users who already claimed via IPFS (77, 88, 222, 333):

**Option A: Airdrop**
- Collect wallet addresses from existing claimants
- Admin mints NFTs to their addresses (no payment)
- Links to existing IPFS certificates

**Option B: Claim Portal**
- Existing claimants prove ownership (email verification)
- Enter wallet address
- System mints NFT free of charge

**Recommendation**: Option B (more secure, user-controlled)

---

## Next Steps

1. **Create smart contract** (`contracts/Y3KNamespaceRegistry.sol`)
2. **Deploy to Base Sepolia testnet**
3. **Update payments-api** with minting logic
4. **Test end-to-end flow**
5. **Deploy to Base mainnet**
6. **Update frontend** with blockchain transaction display
7. **Launch minting** for 77, 88, 222, 333 first

---

## Technical Debt to Address

- [ ] Remove IPFS-only claiming flow
- [ ] Archive old claiming tokens (77-2026-01-17-*, etc.)
- [ ] Update DEPLOYMENT_STATUS.md with blockchain info
- [ ] Create BLOCKCHAIN_VERIFICATION_GUIDE.md
- [ ] Update all documentation to reflect minting (not claiming)

---

## Success Metrics

- [ ] 100% of payments result in on-chain NFT
- [ ] 0 failed transactions
- [ ] <5 second mint time (payment → NFT)
- [ ] All NFTs visible in OpenSea/Rainbow/Zerion
- [ ] 100% IPFS certificate availability

---

## Resources

- Base L2 docs: https://docs.base.org
- ethers-rs: https://github.com/gakonst/ethers-rs
- Ed25519 in Solidity: https://github.com/Keydonix/ed25519-solidity
- OpenZeppelin: https://docs.openzeppelin.com/contracts/5.x/

---

*Document created: 2026-01-17*
*Status: Planning phase - awaiting approval to proceed*
