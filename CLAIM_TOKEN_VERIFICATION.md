# Claim Token Verification Report
**Date**: January 21, 2026  
**Status**: ⚠️ Token Mismatch Found

---

## ❌ INVALID URLs (Wrong Tokens)

### 1. **88.x** - WRONG TOKEN
**URL**: `https://1cb15260.y3kmarkets.pages.dev/claim/?token=88-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9`

**Problem**: Token does not match validation API
- URL uses: `88-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9`
- API expects: `88-2026-01-17-d1i6g2e5f7g0124d9ig5h6e8f7i0d1g2`

**Status**: ❌ Will fail validation

---

### 2. **222.x** - CORRECT TOKEN ✅
**URL**: `https://1cb15260.y3kmarkets.pages.dev/claim/?token=222-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0`

**Status**: ✅ VALID
- Token matches API: `222-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0`
- Namespace: `222.x`
- Certificates: 6 (root + 5 subs)

---

### 3. **333.x** - CORRECT TOKEN ✅
**URL**: `https://1cb15260.y3kmarkets.pages.dev/claim/?token=333-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1`

**Status**: ✅ VALID
- Token matches API: `333-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1`
- Namespace: `333.x`
- Certificates: 6 (root + 5 subs)

---

### 4. **brad.x** - VALID ✅
**URL**: `https://y3kmarkets.com/claim/?token=brad`

**Status**: ✅ VALID
- Token: `brad` (simple token)
- Namespace: `brad.x`
- Type: Named sovereign
- Certificates: 4 (brad.x, brad.auth.x, brad.ops.x, brad.data.x)

---

## ✅ VALID Tokens in API

### Active Claim Tokens:
```typescript
'88-2026-01-17-d1i6g2e5f7g0124d9ig5h6e8f7i0d1g2'  // 88.x (CORRECT)
'222-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0' // 222.x ✓
'333-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1' // 333.x ✓
'brad'                                             // brad.x ✓
'rogue'                                            // rogue.x ✓
'trump'                                            // trump.x ✓
'don'                                              // don.x ✓
'don77'                                            // 77.x ✓
'brad45'                                           // 45.x ✓
'buck'                                             // buck.x ✓
```

---

## 📂 SOVEREIGN_SUBNAMESPACES Structure

### ✅ Files Exist (Verified)

**88.x Stack** (6 files):
- ✅ `88.x.json` (root)
- ✅ `88.auth.x.json` (authentication)
- ✅ `88.finance.x.json` (treasury)
- ✅ `88.tel.x.json` (communications)
- ✅ `88.vault.x.json` (storage)
- ✅ `88.registry.x.json` (records)

**222.x Stack** (6 files):
- ✅ `222.x.json` (root)
- ✅ `222.auth.x.json`
- ✅ `222.finance.x.json`
- ✅ `222.tel.x.json`
- ✅ `222.vault.x.json`
- ✅ `222.registry.x.json`

**333.x Stack** (6 files):
- ✅ `333.x.json` (root)
- ✅ `333.auth.x.json`
- ✅ `333.finance.x.json`
- ✅ `333.tel.x.json`
- ✅ `333.vault.x.json`
- ✅ `333.registry.x.json`

**brad.x Stack** (6 files):
- ✅ `brad.x.json` (root)
- ✅ `brad.auth.x.json`
- ✅ `brad.finance.x.json`
- ✅ `brad.tel.x.json`
- ✅ `brad.vault.x.json`
- ✅ `brad.registry.x.json`

**rogue.x Stack** (6 files):
- ✅ `rogue.x.json` (root)
- ✅ `rogue.auth.x.json` ← **YOU FOUND THIS ONE**
- ✅ `rogue.finance.x.json`
- ✅ `rogue.tel.x.json`
- ✅ `rogue.vault.x.json`
- ✅ `rogue.registry.x.json`

**trump.x Stack** (6 files):
- ✅ `trump.x.json` (root)
- ✅ `trump.auth.x.json`
- ✅ `trump.finance.x.json`
- ✅ `trump.tel.x.json`
- ✅ `trump.vault.x.json`
- ✅ `trump.registry.x.json` ← **YOU FOUND THIS ONE**

---

## 🔍 File Content Analysis

### Sample: rogue.auth.x.json
```json
{
  "id": "0xr0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f1",
  "label": "rogue.auth.x",
  "sovereignty": "Delegable",
  "genesis_hash": "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc",
  "depth": 0
}
```

**Analysis:**
- ✅ Genesis hash matches: `0x6787...96fc`
- ✅ Sovereignty type: "Delegable"
- ✅ Proper structure
- ⚠️ **Different format** than genesis certificates (these are pre-designed sovereignty stacks)

### Sample: trump.registry.x.json
```json
{
  "id": "0xtr7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6fc",
  "label": "trump.registry.x",
  "sovereignty": "Delegable",
  "genesis_hash": "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc",
  "depth": 0
}
```

**Analysis:**
- ✅ Genesis hash matches
- ✅ Sovereignty: "Delegable"
- ✅ Proper structure

---

## 🆚 Two Different Certificate Types

### 1. **Genesis Certificates** (955 total)
**Location**: `genesis/ARTIFACTS/certificates/`  
**Format**:
```json
{
  "generated_at": "2026-01-16T18:20:10.7964218-05:00",
  "genesis_hash": "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc",
  "genesis_index": 159,
  "namespace": "222",
  "version": "1.0.0"
}
```

**Purpose**: 
- Genesis-locked roots (1.x, 222.x, 777.x, etc.)
- Immutable, cryptographically unique
- Published to IPFS
- Part of the 955 supply

---

### 2. **Sovereign Subnamespaces** (Pre-designed)
**Location**: `genesis/SOVEREIGN_SUBNAMESPACES/`  
**Format**:
```json
{
  "version": "1.0.0",
  "namespace": "222.x",
  "type": "CEREMONIAL_ALLOCATION",
  "genesis_hash": "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc",
  "sovereignty": "Ceremonial",
  "status": "RESERVED",
  "created_at": "2026-01-18T06:18:15.591Z"
}
```

**Purpose**:
- Pre-designed "sovereignty stacks" for special recipients
- Full sub-namespace trees (root + auth + finance + tel + vault + registry)
- Reserved for ceremonial allocations
- NOT part of the 955 genesis count (these are BUILT ON TOP of genesis roots)

---

## 🎯 Key Distinction

### Genesis Root (222.x)
- **File**: `genesis/ARTIFACTS/certificates/222.json`
- **Status**: Part of 955 genesis-locked supply
- **Created**: January 16, 2026 (genesis ceremony)
- **Immutable**: YES (IPFS locked)

### Sovereignty Stack (222.x + subs)
- **Files**: `genesis/SOVEREIGN_SUBNAMESPACES/222.*.json` (6 files)
- **Purpose**: Pre-built infrastructure for recipient
- **Created**: January 18, 2026 (post-genesis, ceremonial prep)
- **Contains**: 222.x root PLUS 5 sub-namespaces

**Analogy**: 
- Genesis certificate = deed to land
- Sovereignty stack = land + house + garage + pool + fence (full estate)

---

## 🔧 Fix Required

### Correct the 88.x URL

**Current (WRONG)**:
```
https://1cb15260.y3kmarkets.pages.dev/claim/?token=88-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9
```

**Fixed (CORRECT)**:
```
https://1cb15260.y3kmarkets.pages.dev/claim/?token=88-2026-01-17-d1i6g2e5f7g0124d9ig5h6e8f7i0d1g2
```

**Change**: 
- Remove: `a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9`
- Replace with: `d1i6g2e5f7g0124d9ig5h6e8f7i0d1g2`

---

## ✅ Summary

**Working URLs:**
1. ✅ `https://y3kmarkets.com/claim/?token=brad`
2. ✅ `https://1cb15260.y3kmarkets.pages.dev/claim/?token=222-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0`
3. ✅ `https://1cb15260.y3kmarkets.pages.dev/claim/?token=333-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1`

**Broken URL:**
4. ❌ `https://1cb15260.y3kmarkets.pages.dev/claim/?token=88-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9` (wrong token)

**Files Verified:**
- ✅ All SOVEREIGN_SUBNAMESPACES files exist
- ✅ All reference correct genesis hash
- ✅ rogue.auth.x.json exists
- ✅ trump.registry.x.json exists
- ✅ 88.x, 222.x, 333.x, brad.x stacks complete

**System Status**: ✅ Operational (1 URL needs token correction)
