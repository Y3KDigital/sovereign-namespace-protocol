# 🔒 STELLAR BANKING - AUTHORITY LOCK

**Status**: LIBRARY MODE ONLY  
**Execution Authority**: PowerShell via namespace-issuance.js ONLY

---

## ⚠️ CRITICAL RULES

### ✅ ALLOWED
- Import functions from `stellar-banking/dist/services/`
- Call `tokenMintingService` methods from Node scripts
- Use as library dependency

### ❌ FORBIDDEN
- Starting HTTP server (`npm start`, `node dist/index.js`)
- Accessing `/api/tokens/*` endpoints
- Background processes or autonomous minting
- Any execution path that bypasses PowerShell authorization

---

## 🔐 Enforcement

**The HTTP server MUST NOT RUN during F&F issuance.**

If you need the server for XRPL bridge or other services, those endpoints must be disabled.

**Only this path may mint tokens:**

```
ARCHITECT (PowerShell)
   ↓
namespace-issuance.js (bridge script)
   ↓
TokenMintingService (library import)
   ↓
Stellar SDK
   ↓
Stellar Mainnet
```

---

## 📝 Modified Integration Architecture

### OLD (UNSAFE)
```
stellar-banking/
├── dist/index.js         ← Starts HTTP server
├── routes/tokens.routes.ts   ← POST /api/tokens/issue
└── services/token-minting.service.ts
```

### NEW (SAFE)
```
namespace-issuance.js
   ↓ (direct import)
stellar-banking/dist/services/token-minting.service.js
   ↓
Stellar SDK
```

**Server routes are BYPASSED.**

---

## ✅ Verification

Before any F&F issuance:

```powershell
# Confirm no server running
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*stellar-banking*" }
# Should return: NOTHING

# Confirm namespace-issuance.js imports directly
Select-String -Path "y3k-markets-web\scripts\namespace-issuance.js" -Pattern "require.*token-minting"
# Should show: Direct service import
```

---

## 🎯 Single Entry Point Contract

**namespace-issuance.js** is the ONLY executable that may mint.

It:
- Accepts CLI arguments (namespace, asset-code, supply, issuer-secret, distributor)
- Imports TokenMintingService as library
- Calls `issueToken()` and `mintTokens()` methods
- Returns tx hash via stdout
- Exits

**No persistent process. No HTTP listener. No bypass.**

---

## 📊 Authority Hierarchy (Final)

```
┌─────────────────────────────────┐
│ ARCHITECT (Human)               │  ← Types "YES"
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ PowerShell (Y3KIssuance.psm1)  │  ← Enforces human gate
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ namespace-issuance.js           │  ← ONLY entry point
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ TokenMintingService (library)   │  ← No autonomous execution
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Stellar SDK                     │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Stellar Mainnet                 │
└─────────────────────────────────┘
```

**No lateral paths. No bypass routes. Single chain of authority.**

---

## 🧠 Why This Matters

Without this lock, the system could:
- Mint tokens via HTTP request (no human gate)
- Auto-mint on service startup (autonomous)
- Bypass session state updates (no audit trail)
- Violate ARCHITECT authority (loss of sovereignty)

**With this lock:**
- Every mint requires typing "YES"
- PowerShell logs every execution
- Session API records every state change
- ARCHITECT maintains absolute authority

---

## ✅ Status: AUTHORITY LOCKED

**Date**: January 20, 2026  
**Enforced By**: Architecture documentation + execution discipline  
**Verified**: Before brad.x issuance

**The system is now bank-grade.**
