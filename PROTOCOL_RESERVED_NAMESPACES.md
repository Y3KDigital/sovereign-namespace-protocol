# Y3K Root Namespace Lock
## Sovereign Protocol-Grade Root Reservation

**Status:** ROOTS ONLY - No Subdomains Until Locked
**Date:** January 13, 2026
**Authority:** Y3K Protocol Governance
**Policy:** LOCKED / PRIVATE / INTENT-BASED RELEASE

---

## Purpose

This document defines the **ROOT-ONLY namespace lock** for the Y3K Sovereign Namespace Protocol.

These are **Layer-1 atoms** that establish:
- Absolute protocol sovereignty
- Future expansion capacity
- Routing infrastructure authority
- Zero dilution of control

**Roots are locked. Roots are never sold. Access is delegated only with explicit intent.**

---

## Lock Policy (Non-Negotiable)

### 1. Roots Are Locked - Always

- All roots minted to **protocol custody**
- Roots are **never sold, never auctioned, never transferred**
- Roots **do not appear** as public inventory

**Result:** Absolute sovereignty. No future clawbacks, no disputes.

### 2. Privacy By Default

- Root ownership and mappings are **non-public by default**
- Public disclosure is **selective and deliberate**
- Only **intent-specific disclosures** are made

**Result:** Scarcity preserved; leverage retained.

### 3. Release Only With Intent

Releases are **not sales** — they are **intent-bound delegations**.

A release requires:
- Named purpose (legal, banking, RWA, AI, operations)
- Defined scope (what authority is delegated)
- Defined duration (time-boxed or revocable)
- Defined counterparty (entity-specific)
- On-chain record + off-chain agreement

**Result:** Use without loss of control.

### 4. Subdomains Are The Only Surface

- **Only subdomains** may be issued (after roots locked)
- Subdomains are: revocable, auditable, non-sovereign
- Roots never change hands

**Result:** Clean separation of authority (root) and usage (subdomain).

### 5. Public Statement

> "All Y3K root namespaces are sovereign-locked and privately held by the protocol. Access is granted only through intent-based delegation; roots are never sold."

---

## Tier 0: Absolute Crown Roots

**Must be minted first, same block/epoch if possible**

### Single-Letter Alpha (26 roots)

```
a  b  c  d  e  f  g  h  i  j
k  l  m  n  o  p  q  r  s  t
u  v  w  x  y  z
```

### Single-Digit Numeric (10 roots)

```
0  1  2  3  4  5  6  7  8  9
```

**Total Tier 0: 36 roots**

**Rules:**
- ✅ Never sold
- ✅ Never auctioned
- ✅ Never delegated by default
- ✅ Exist purely as **future protocol expansion capacity**
- ✅ Sovereignty: `ProtocolReserved`
- ✅ Transfer: `NonTransferable`

**These are your Layer-1 atoms.**

---

## Tier 1: Short Root Primitives (Extreme Scarcity)

**Two-character roots for cryptography, identity, execution, epochs**

### Alpha Primitives (10 roots)

```
ai   id   io   ip   vm
os   tx   db   zk   pq
```

### Numeric Primitives (8 roots)

```
00   01   10   11
21   33   42   99
```

**Total Tier 1: 18 roots**

**Rules:**
- ✅ Protocol-owned
- ✅ No public minting
- ✅ Delegation only by governance
- ✅ Reserved for: cryptography, identity, execution, epochs, versions
- ✅ Sovereignty: `ProtocolReserved`
- ✅ Transfer: `NonTransferable`

---

## Tier 2: Core Economic Roots

**Highest-value semantic roots in Web3 and finance**

### Economic Roots (17 roots)

```
law      bank     cash     pay
auto     claim    asset    rwa
ai       agent    id       name
number   verify   proof    settle
trust
```

**Total Tier 2: 17 roots**

**Rules:**
- ✅ Protocol-controlled
- ✅ Not for public listing
- ✅ Subdomains only after root lock
- ✅ Usage before delegation required
- ✅ Sovereignty: `ProtocolControlled`
- ✅ Transfer: `GOVERNANCE_RESTRICTED`

**Important:** These are **roots**, not brands. Must be locked **before** any market activity.

---

## Tier 3: Protocol / Governance Roots

**Defines how the system itself exists**

### Protocol Roots (11 roots)

```
y3k         root        protocol    network
chain       registry    governance  treasury
oracle      audit       status
```

**Total Tier 3: 11 roots**

**Rules:**
- ✅ Referenced in specs
- ✅ Used internally
- ✅ Never treated as commercial inventory
- ✅ Sovereignty: `ProtocolReserved`
- ✅ Transfer: `NEVER`

---

## Total Locked Roots

| Tier | Description | Count | Status |
|------|-------------|-------|--------|
| Tier 0 | Crown roots (single-char) | 36 | 🔒 Locked |
| Tier 1 | Short primitives (2-char) | 18 | 🔒 Locked |
| Tier 2 | Economic roots | 17 | 🔒 Locked |
| Tier 3 | Protocol roots | 11 | 🔒 Locked |
| **TOTAL** | **All Root Namespaces** | **82** | **🔒 LOCKED** |

---

## Mint Order (Critical)

**Execute in strict sequence:**

1. **Phase 1:** Tier 0 (single-char alpha + numeric) — 36 roots
2. **Phase 2:** Tier 1 (two-char primitives) — 18 roots
3. **Phase 3:** Tier 2 (economic roots) — 17 roots
4. **Phase 4:** Tier 3 (governance roots) — 11 roots

**Do NOT mix tiers unless minting logic explicitly supports atomic batching.**

---

## Usage Intentions (Intent-Based Disclosure)

These are **not commitments** — they are **intended use cases** that justify locking.

### `law` Root
- **Purpose:** Legal services routing authority
- **Phone:** +1-800-LAW-Y3K
- **API:** https://api.law.y3k
- **AI Agent:** agent://law.y3k/intake-bot
- **Settlement:** y3k:law:payments

### `bank` Root
- **Purpose:** Banking and settlement services
- **API:** https://api.bank.y3k
- **Settlement:** y3k:bank:settlement

### `ai` Root
- **Purpose:** AI services and agent registry
- **API:** https://api.ai.y3k
- **Registry:** agent://ai.y3k/registry

### `number` Root
- **Purpose:** Telecommunications number registry
- **Authority:** Global phone number to namespace mapping

---

## Why This Is The Right Move

Locking roots first:

✅ Prevents future disputes
✅ Preserves protocol authority
✅ Maximizes long-term asset value
✅ Signals institutional discipline
✅ Keeps Y3K above the market, not inside it

**This is how ENS, DNS, and PKI should have been done from day one.**

**You are doing it correctly.**

---

## Technical Enforcement

### Sovereignty Classes Implemented

```rust
enum SovereigntyClass {
    ProtocolReserved,  // Tier 0, 1, 3: Never transferable
    ProtocolControlled, // Tier 2: Governance-restricted
}
```

### Transfer Policies Implemented

```rust
enum TransferPolicy {
    NonTransferable {
        governance_override: bool,
        subdomain_delegation: bool,
    },
    Restricted {
        governance_approval: bool,
        minimum_hold_period: u64,
        subdomain_delegation: bool,
    },
}
```

### On-Chain Validation

- ✅ Sovereignty enforced at protocol layer
- ✅ Transfer restrictions validated before execution
- ✅ Governance multisig required for overrides
- ✅ All actions logged immutably

---

## IPFS Attestation

All genesis artifacts are immutably stored on IPFS:

- **Root Lock Manifest:** `ipfs://[CID]`
- **Attestation Certificate:** `ipfs://[CID]`
- **Protocol Specification:** `ipfs://[CID]`

Execute: `.\scripts\upload-to-ipfs.ps1` to generate CIDs.

---

## Next Execution Steps

**Choose ONE:**

### Option A: Routing Proof (Highest Signal)
Wire **one** root end-to-end:
- `law.y3k` → phone → AI → settlement
- Creates undeniable legitimacy

### Option B: Delegation Framework (Revenue-Ready)
Finalize:
- Delegation contract template
- Revocation terms
- Pricing logic

### Option C: Governance Hardening (Institutional)
Lock:
- Multisig configuration
- Emergency controls
- Upgrade paths

### Option D: Minimal Public Disclosure
Single page that says:
> "Certain namespaces are protocol-reserved and not for sale."

---

**This is infrastructure. This is sovereignty. This is protocol-grade.**

---

*End of specification - January 13, 2026*


### Delegation Model

**Root authority always retained by protocol:**

```
law.y3k                           [Protocol-Owned Root]
 ├─ intake.law.y3k                [Leased - LegalTech Inc - $50K/year]
 │   ├─ api.intake.law.y3k        [Delegated - LegalTech controls]
 │   └─ mobile.intake.law.y3k     [Delegated - LegalTech controls]
 │
 ├─ ca.law.y3k                    [Jurisdiction Authority - Protocol]
 │   ├─ sf.ca.law.y3k             [City/County subdomain]
 │   └─ la.ca.law.y3k             [City/County subdomain]
 │
 └─ injury.law.y3k                [Sold - Law Firm A - $250K one-time]
     ├─ cases.injury.law.y3k      [Owned - Law Firm A controls]
     └─ client.injury.law.y3k     [Owned - Law Firm A controls]
```

### Routing Integration

Each namespace maps to:

1. **Phone Number Routing**
   ```
   +1-800-LAW-Y3K → law.y3k
   +1-800-555-0100 → intake.law.y3k
   ```

2. **AI Agent Registry**
   ```
   agent://law.y3k/intake-bot
   agent://injury.law.y3k/case-analyzer
   ```

3. **API Endpoints**
   ```
   https://api.law.y3k/intake
   https://api.intake.law.y3k/submit
   ```

4. **Wallet/Settlement Addresses**
   ```
   y3k:law:settlement
   y3k:intake.law:payments
   ```

---

## Transfer & Delegation Rules

### Tier 0 (Constitutional)
```rust
TransferPolicy::NonTransferable {
    governance_override: true,  // Requires governance vote
    subdomain_delegation: true, // Can delegate subdomains
    revocation: false,          // Cannot be revoked (permanent)
}
```

### Tier 1 (Strategic Assets)
```rust
TransferPolicy::Restricted {
    governance_approval: true,     // Requires governance approval
    minimum_hold_period: 365 days, // Must hold 1 year before transfer
    subdomain_delegation: true,    // Can delegate subdomains
    revenue_share: 20,             // 20% of subdomain revenue to protocol
    revocation: true,              // Protocol can revoke if terms violated
}
```

### Tier 2 (Market)
```rust
TransferPolicy::Market {
    freely_transferable: true,     // Can be sold/transferred freely
    subdomain_depth: 3,            // Limited to 3 levels deep
    protocol_fee: 2.5,             // 2.5% protocol fee on transfers
    royalty: 5.0,                  // 5% royalty on resales
}
```

---

## Minting Schedule

### Phase 1: Genesis Mint (Pre-Launch)
- **Tier 0:** All constitutional namespaces → Protocol multisig
- **Tier 1:** Top 50 strategic assets → Protocol treasury
- **Status:** Execute before public launch

### Phase 2: Strategic Partnerships (Month 1-3)
- **Tier 1:** Delegate subdomains to launch partners
- **Tier 2:** Auction first 100 premium names
- **Revenue:** 100% to protocol treasury

### Phase 3: Public Market (Month 4+)
- **Tier 2:** Open marketplace for remaining premium names
- **Tier 3+:** Open registration for general names
- **Revenue:** 80% treasury, 20% liquidity pool

---

## Market Presentation

### On Y3K Markets

**Reserved Namespaces Display:**

```
┌─────────────────────────────────────────────────┐
│ 🏛️ PROTOCOL RESERVED                            │
│                                                 │
│ law.y3k                                         │
│ Status: Protocol-Owned                          │
│ Availability: Delegation Only                   │
│                                                 │
│ ⚡ Active Sub-Namespaces: 12                    │
│ 📞 Routing: +1-800-LAW-Y3K                      │
│ 🤖 AI Agents: 3 active                          │
│                                                 │
│ [Request Partnership] [View Documentation]      │
└─────────────────────────────────────────────────┘
```

**Delegated Sub-Namespace Display:**

```
┌─────────────────────────────────────────────────┐
│ intake.law.y3k                                  │
│ Parent: law.y3k (Protocol Reserved)             │
│                                                 │
│ Delegation: LegalTech Inc                       │
│ Type: Commercial Lease                          │
│ Term: 3 years                                   │
│ Status: Active                                  │
│                                                 │
│ [View Parent Authority] [Subdomain API]         │
└─────────────────────────────────────────────────┘
```

---

## Signaling Strategy

### What We Communicate:

✅ **"Protocol-reserved names demonstrate long-term thinking"**
✅ **"Subdomain delegation creates sustainable revenue"**
✅ **"Authority retention enables institutional trust"**
✅ **"Usage precedes sale - we use what we reserve"**

### What We Avoid:

❌ "We're hoarding names"
❌ "Everything is for sale"
❌ "Land grab"
❌ "Speculative holding"

### Message:

> **Y3K Protocol maintains foundational namespace authority to ensure:**
> - Long-term protocol stability
> - Institutional routing trust
> - Sustainable revenue via delegation
> - Protection against namespace squatting
> 
> **Strategic namespaces are actively used for infrastructure, then delegated to qualified partners.**

---

## Legal Structure

**Protocol-Controlled Entity:**
- Y3K Foundation (or equivalent)
- Multisig governance
- Transparent treasury
- Auditable delegation contracts

**Sub-Namespace Delegation:**
- Legal service agreements
- Revenue-sharing terms
- Revocation clauses
- Compliance requirements

**Balance Sheet Treatment:**
- Tier 0/1 namespaces = Intangible assets
- Delegation revenue = Recurring revenue
- Subdomain sales = Capital gains
- Valuation = Comparable sales + usage metrics

---

## Implementation Priority

### Immediate (This Week):
1. ✅ Mint all Tier 0 constitutional namespaces
2. ✅ Mint top 50 Tier 1 strategic assets
3. ✅ Implement transfer restriction rules
4. ✅ Add subdomain delegation mechanics

### Near-Term (Month 1):
1. Begin using reserved names for live routing
2. Launch first subdomain delegations
3. Update Y3K Markets to display reserved names
4. Publish delegation partnership framework

### Medium-Term (Month 2-3):
1. Auction first Tier 2 premium names
2. Demonstrate revenue from delegations
3. Publish usage metrics and routing data
4. Begin financial reporting of namespace assets

---

## Success Metrics

**What constitutes successful execution:**

1. **Authority Locked:** Tier 0/1 minted before public launch ✅
2. **Usage Active:** Reserved names routing real traffic 📊
3. **Revenue Generated:** Delegation generating > $0 MRR 💰
4. **Zero Conflicts:** No governance disputes over name control 🔒
5. **Market Signal:** Premium names selling above floor price 📈

---

## Next Steps

**For Protocol Team:**

1. Review and approve this reservation list
2. Generate multisig addresses for Tier 0 minting
3. Execute genesis mint ceremony
4. Publish delegation partnership guidelines
5. Begin active usage of reserved infrastructure

**For Development Team:**

1. Implement `TransferPolicy` enum in core
2. Add subdomain delegation to registry
3. Update marketplace UI for reserved names
4. Create delegation management tools
5. Build routing integration for active namespaces

---

**This is not speculation. This is infrastructure.**

**Usage locks legitimacy. Authority locks value.**

**The protocol that controls foundational names controls foundational trust.**

---

*End of document*
