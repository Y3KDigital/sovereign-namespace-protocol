# Y3K Protocol Terminology Guide

## Executive Summary

This document defines the **canonical terminology** for Y3K Markets and Sovereign Namespace Protocol (SNP) to ensure technical accuracy, legal defensibility, and conversion-friendly UX.

---

## Core Definitions

### ✅ What "Claiming" Means in Y3K

**Claiming** refers to **deriving a pre-existing genesis namespace and generating its cryptographic certificate**.

**What Claiming Does:**
- Activates your ownership certificate with post-quantum signatures
- Derives deterministic cryptographic keys for your namespace
- Generates a verifiable certificate containing the genesis hash
- Registers your ownership in the protocol

**What Claiming Does NOT Do:**
- ❌ Create new supply (all 955 roots fixed at genesis)
- ❌ Execute blockchain transactions
- ❌ "Mint" in the NFT/ERC-721 sense
- ❌ Require any registry to "issue" your namespace

---

## The Root vs Sub-Namespace Distinction

### Genesis Roots (Fixed, Sovereign)

**Definition:** The 955 immutable namespace roots generated at genesis ceremony (Jan 16, 2026)

**Properties:**
- Mathematically fixed at genesis ceremony
- Can never be recreated, altered, or expanded
- Scarcity enforced by cryptographic uniqueness
- Either protocol-reserved (Crown tiers) or publicly claimable (three-digit roots)

**Examples:**
- Crown Letters: a-z (26 roots, protocol-reserved)
- Crown Digits: 0-9 (10 roots, protocol-reserved)
- Three-Digit Genesis: 100-999 (900 roots, publicly claimable)

**User Action:** Claim = Activate ownership certificate

---

### Sub-Namespaces (Derived, Permissioned)

**Definition:** Namespaces derived hierarchically beneath a genesis root

**Properties:**
- Governed by root's sovereignty rules
- Derived deterministically under parent root
- May be issued by root owner (if permitted by sovereignty class)
- Subject to root's cryptographic policies

**Examples:**
- `alice.100` (sub-namespace under root 100)
- `bob.payments.a` (nested sub-namespace under Crown Letter 'a')

**User Action:** Derive = Create sub-namespace under your root's sovereignty rules

---

## Terminology Matrix

| Term | Acceptable | Context | Notes |
|------|-----------|---------|-------|
| **Claim** | ✅ Preferred | Genesis roots | Protocol-accurate |
| **Derive** | ✅ Preferred | Sub-namespaces | Technically correct |
| **Mint** | ⚠️ Use sparingly | UX/marketing only | Must define once globally |
| **Generate** | ✅ Acceptable | Certificates/keys | Technical operations |
| **Allocate** | ✅ Acceptable | Inventory management | Backend/admin |
| **Issue** | ❌ Avoid | Any context | Implies centralized authority |
| **Create** | ❌ Avoid | Genesis roots | Implies new supply |

---

## Approved Marketing Language

### ✅ Safe to Use

- "Claim your genesis root"
- "Derive sub-namespaces beneath your root"
- "Activate your ownership certificate"
- "900 unclaimed genesis roots"
- "Generate your cryptographic keys"
- "Position-based pricing for genesis roots"

### ⚠️ Use with Definition

If using "mint" for conversion:
- **MUST include definition**: "In Y3K, 'minting' refers to deriving a pre-existing genesis namespace and activating its cryptographic certificate."
- Recommended placement: Homepage hero section, genesis page, F&F portal

### ❌ Never Use

- "Mint new roots"
- "Create new roots"
- "Unlimited supply"
- "We issue namespaces"
- "Y3K generates your namespace" (implies centralized creation)

---

## Protocol Reality vs UX Compromise

### Technical Truth (Protocol Layer)

```
Genesis (Jan 16, 2026)
  ↓
955 roots mathematically fixed
  ↓
User claims root → derives certificate
  ↓
User may derive sub-namespaces (if sovereignty permits)
```

### UX-Friendly Framing (Marketing Layer)

```
"Claim your genesis root"
  ↓
"Mint (derive) sub-namespaces beneath it"
  ↓
"Sovereign ownership from day one"
```

**Bridge Statement:** "Genesis roots are fixed. Sub-namespaces may be derived beneath your root."

---

## Legal/Regulatory Position

### Defensible Claims

✅ "Y3K controls sovereign root namespaces and permits the derivation of sub-namespaces under defined cryptographic rules."

✅ "All 955 roots were mathematically fixed at genesis. No new roots can ever be created."

✅ "Claiming activates your ownership certificate. No blockchain transaction or registry update occurs."

### Avoid Ambiguity

❌ "We mint roots" (implies issuance authority)
❌ "Unlimited minting" (conflicts with fixed supply)
❌ "Create your namespace" (implies new supply)

---

## One-Sentence Canonical Definition

**For all documentation, FAQs, and external communication:**

> "In Y3K, 'claiming' refers to the derivation and certification of a pre-existing genesis namespace that was mathematically fixed at genesis ceremony on January 16, 2026."

---

## Implementation Checklist

- [x] Homepage: Definition section added
- [x] Genesis page: Protocol terminology section added
- [x] F&F page: Updated from "minting" to "claiming"
- [x] Navigation CTAs: Changed "Mint Now" → "Claim Genesis Root"
- [x] Stats display: Changed "Available to Mint" → "Unclaimed Genesis Roots"
- [x] How It Works: Added "Genesis-Derived Allocation" explanation
- [ ] Mint flow: Update payment confirmation language
- [ ] Email templates: Update F&F invitation language
- [ ] Buyer verification guide: Update terminology
- [ ] Trust/legal page: Add canonical definition
- [ ] FAQ: Add "What does claiming mean?" entry

---

## Contact for Questions

**Technical accuracy:** Verify with SNP spec (SPEC_INDEX.md)
**Legal review:** Consult before external communications
**Marketing approval:** Balance conversion with protocol integrity

---

**Last Updated:** January 16, 2026 (Genesis Day)
**Status:** ✅ Implemented across core pages
