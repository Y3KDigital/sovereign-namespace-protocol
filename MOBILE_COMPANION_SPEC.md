# Mobile Companion Spec - Sequence 1

## Vision
The Mobile Companion is a "Steering Wheel" for the Sovereign Life OS. It is **READ/APPROVE ONLY**. It does not store the Master Key (Root Key). It does not hold the Vault. It simply connects to the running OS engine to authorize actions and view status.

## Philosophy
> "Phone = Steering Wheel. OS = Engine."

- **No Heavy Lifting**: The phone does not sync the blockchain. It does not index files.
- **No Master Keys**: If the phone is stolen, the attacker gets nothing but a disconnected remote.
- **Approval Based**: The OS creates a transaction; the Phone signs an approval intent (or just uses an API token for V1).

## Architecture: The "Sovereign Link" (PWA)
We will build a **Progressive Web App (PWA)** served directly by the `kevan-os` binary (or a helper service).
This bypasses App Stores, updates instantly, and works on iOS/Android immediately.

### Stack
- **Backend**: Rust (Actix/Axum) running as part of `kevan-os` or `kevan-companion`.
- **Frontend**: Minimal HTML/HTMX or React (Single file if possible) optimized for mobile.
- **Transport**: HTTPS (Cloudflared Tunnel) for global access.
- **Auth**:
    - **V0**: High-entropy "Link Token" via QR Code (User scans QR on PC, phone is logged in).
    - **V1**: WebAuthn / Passkeys.

## Feature Scope (V1)

### 1. Dashboard (Read-Only)
- **Status Signal**: Green/Red indicator for OS health.
- **Financial Snapshot**: "You can spend X today." (No detailed ledger).
- **Recent Events**: "Email from Mom", "Payment sent".

### 2. Approval Queue (Action)
- **Concept**: The OS queues explicit actions ("Send 500 USDC", "Delete Folder").
- **UI**: List of cards with "APPROVE" / "DENY".
- **Security**: Approval requires Biometric (if WebAuthn) or simple confirm (if V0).

### 3. Emergency (Write)
- **Panic Button**: "Lock Down System" (Kills remote access, unmounts vault).
- **Signal**: "I'm OK" / "I need help" broadcast to Family List.

## Technical Implementation Steps

### Phase 1: The Companion Server
1. Create `kevan-companion` Rust crate.
2. Implement basic HTTP server (Actix-web).
3. Bind to `kevan-os` context (shared status).

### Phase 2: The Secure Tunnel
1. Reuse `cloudflared` setup.
2. Map `hub.kevan.x` (or similar) to the companion port.

### Phase 3: The Interface
1. Build a mobile-first HTML/CSS template (Dark Mode, OLED Black).
2. Serve via the Rust binary.

## Security Model (V0)
- The Phone is an *Authorized Device*.
- Pairing: Display QR Code on Terminal -> Scan on Phone -> Sets long-lived cookie.
- Rate Limiting: Strict.
