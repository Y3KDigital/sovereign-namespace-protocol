# Web3 Rarity Namespace System - Copilot Instructions

## Project Overview
This is a Rust-based Web3 rarity namespace system where each namespace is unique and immutable.

## Architecture
- Namespace format: .x (1.x, 2.x, etc.) starting from root /
- Each namespace is cryptographically unique and can never be recreated
- IPFS-backed certificate storage
- Blockchain-based verification
- Rarity-based value system

## Development Guidelines
- Follow Rust best practices
- Ensure cryptographic security for all namespace operations
- Never allow namespace duplication
- All certificates must be IPFS-locked
- Maintain immutability guarantees

## Project Status
✅ All modules implemented and compiled successfully
✅ Core namespace engine with cryptographic uniqueness
✅ Rarity calculation system with 6-tier scoring
✅ IPFS integration for certificate storage
✅ Smart contract interface for NFT minting
✅ Certificate generation with Ed25519 signatures
✅ REST API server with full CRUD operations
✅ Comprehensive documentation and examples

## Quick Start
```powershell
# Build the project
cargo build --release

# Run the API server
cargo run --release --bin api-server

# Run tests
cargo test --all
```

## API Server
Server runs on `http://127.0.0.1:8080`
- Visit `/docs` for full API documentation
- See `examples/README.md` for usage examples
