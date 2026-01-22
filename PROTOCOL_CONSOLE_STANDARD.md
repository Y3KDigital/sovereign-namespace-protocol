# Protocol Console Standard
## The Universal Web3 Object Interface

**Status**: Canonical Architecture  
**Version**: 1.0.0  
**Date**: January 22, 2026

---

## The Recognition

What we built at `/mint` is not a webpage.

It's a **Protocol Console** — the correct way to present any Web3 object to any human on any surface.

This is not a design preference.  
This is **infrastructure thinking**.

---

## The Law

> **Every Web3 object gets exactly one canonical screen.**

Not pages. Not sections. Not flows.

**One screen. One QR. One set of actions.**

Everything else is optional garnish.

---

## The Four Elements (Non-Negotiable)

### 1. Identity Header

**What it answers**: *What is this and why should I trust it?*

```
┌─────────────────────────────────────┐
│ 777.y3k                             │
│ SOVEREIGN NAMESPACE • Genesis Root  │
│ ✓ Verified by Y3K Protocol         │
└─────────────────────────────────────┘
```

**Required fields**:
- Canonical identifier (`1.tron`, `777.y3k`, `did:uny:001`)
- Type badge (Chain / Vault / Asset / Agent / Namespace)
- Authority/verification line (who/what guarantees this)

**Never**:
- No logo carousel
- No "about us"
- No social proof
- No marketing copy

---

### 2. QR = Primary Interface

**The QR is not a share feature.**  
**It IS the interface.**

```
┌─────────────────────────────────────┐
│                                     │
│        ███████████████████          │
│        ██ ▄▄▄▄▄ █▀█ █ ▄▄▄▄▄ ██      │
│        ██ █   █ █▀▄▀█ █   █ ██      │
│        ██ █▄▄▄█ █▀ ▀█ █▄▄▄█ ██      │
│        ███████████████████          │
│                                     │
│ Scan to interact                    │
│ Fallback: y3k.xyz/777               │
└─────────────────────────────────────┘
```

**What it encodes**:
- Protocol-native payload (`uny://`, `y3k://`, `did:`)
- OR signed descriptor
- OR resolver hint

**The browser link underneath is fallback only.**

The QR is the first-class citizen.  
The URL is the compatibility layer.

---

### 3. Deterministic Actions Only

**These are system commands, not features.**

```
┌─────────────────────────────────────┐
│ [ Send Payment ]                    │
│ [ Mint NFT     ]                    │
│ [ Verify Tx    ]                    │
└─────────────────────────────────────┘
```

**Maximum 5 actions.**

**What's allowed**:
- Transact
- Mint
- Verify
- Claim
- Delegate

**What's banned**:
- Settings
- Profile
- Edit
- Preferences
- Learn More

Configuration belongs in **tools**.  
This screen is for **interaction**.

---

### 4. State Blocks (Not Marketing Metrics)

**These are health indicators, not hype.**

```
┌─────────────────────────────────────┐
│ Validators:    4                    │
│ Uptime:        99.97%               │
│ Transactions:  866,234              │
│ TVL:           $1.04B               │
└─────────────────────────────────────┘
```

**Allowed**:
- System health (uptime, validators, nodes)
- Transaction volume (tx count, throughput)
- Economic state (TVL, fees, stakes)
- Protocol metrics (confirmations, finality time)

**Banned**:
- User counts
- Social followers
- "Growth" numbers
- Testimonials
- Press mentions

This reads like **infrastructure**, not hype.

---

## The Object Schema

Every object resolves to this schema:

```yaml
object_type: chain | vault | asset | agent | namespace
canonical_id: "777.y3k"
authority: "Y3K Protocol • Genesis Root Lock"
verification_status: verified | unverified | contested

qr:
  payload: "y3k://777"
  fallback_url: "https://y3k.xyz/777"
  encoding: protocol-native | descriptor | resolver

actions:
  - id: send_payment
    label: "Send Payment"
    enabled: true
  - id: mint_nft
    label: "Mint NFT"
    enabled: false
    reason: "Genesis period active"
  - id: verify_tx
    label: "Verify Transaction"
    enabled: true

state:
  validators: 4
  uptime: 99.97
  tx_count: 866234
  tvl: 1040000000
  confirmations: 12
  
metadata:
  created: 2025-12-15T00:00:00Z
  last_activity: 2026-01-22T14:30:00Z
  chain: ethereum
```

---

## The Renderer (This is the product)

Your "web" is just a **renderer for this schema**.

### Implementation surfaces

All of these render **the same object**:

- Website (compatibility layer)
- Mobile app (primary)
- Desktop app
- Kiosk
- Wallet plugin
- QR poster
- SMS link
- NFC tap

**The UI doesn't change.**  
**The transport does.**

---

## Example: Current `/mint` Page Analysis

What we already built correctly:

```
✓ Identity Header
  - "Genesis Root 777"
  - "SOVEREIGN NAMESPACE"
  - Verification badge

✓ QR Primary
  - Large, centered QR code
  - Protocol payload
  - Fallback link underneath

✓ Deterministic Actions
  - "Choose Root" (deterministic range: 100-999)
  - "Continue to Payment" (single transaction)
  - No settings, no config

✓ State Blocks
  - "900 total supply"
  - "100-999 range"
  - "$29 fixed price"
  - System facts, not marketing

✓ Minimal surface
  - One input (root number)
  - One choice (payment asset)
  - One button
```

**This is already correct.**

Now we apply it to everything else.

---

## Universal Examples

### Chain Object: `1.tron`

```
┌─────────────────────────────────────┐
│ 1.tron                              │
│ BLOCKCHAIN • Layer 1                │
│ ✓ TRON LLC Chain Authority          │
├─────────────────────────────────────┤
│         [QR CODE]                   │
│ Scan to connect                     │
│ Fallback: uny.tron.network          │
├─────────────────────────────────────┤
│ [ Bridge Assets  ]                  │
│ [ Deploy Contract]                  │
│ [ Verify Block   ]                  │
├─────────────────────────────────────┤
│ Validators:     27                  │
│ Block Time:     3s                  │
│ Transactions:   8.2B                │
│ TVL:            $8.9B               │
└─────────────────────────────────────┘
```

### Vault Object: `vault.777`

```
┌─────────────────────────────────────┐
│ vault.777                           │
│ ASSET VAULT • Sovereign Custody     │
│ ✓ Y3K Custody Protocol              │
├─────────────────────────────────────┤
│         [QR CODE]                   │
│ Scan to unlock                      │
│ Fallback: vault.y3k.xyz/777         │
├─────────────────────────────────────┤
│ [ Deposit Assets ]                  │
│ [ Withdraw       ]                  │
│ [ View History   ]                  │
├─────────────────────────────────────┤
│ Assets:         12                  │
│ Total Value:    $145,320            │
│ Last Access:    2h ago              │
│ Multisig:       2-of-3              │
└─────────────────────────────────────┘
```

### Agent Object: `agent.resolver`

```
┌─────────────────────────────────────┐
│ agent.resolver                      │
│ AI AGENT • Namespace Resolution     │
│ ✓ Y3K Agent Registry                │
├─────────────────────────────────────┤
│         [QR CODE]                   │
│ Scan to query                       │
│ Fallback: agent.y3k.xyz/resolver    │
├─────────────────────────────────────┤
│ [ Query Agent    ]                  │
│ [ View Tasks     ]                  │
│ [ Check Status   ]                  │
├─────────────────────────────────────┤
│ Uptime:         99.98%              │
│ Queries:        1.2M                │
│ Avg Response:   120ms               │
│ Success Rate:   99.94%              │
└─────────────────────────────────────┘
```

---

## Design Rules (The Discipline)

### What you MUST do

1. **One screen per object** — no multi-page flows
2. **QR first** — browser URL is fallback only
3. **Max 5 actions** — if you need more, wrong object
4. **State not stats** — health indicators, not hype
5. **Authority visible** — who guarantees this
6. **Type clear** — what kind of object is this

### What you MUST NOT do

1. **No navigation** — this isn't a website
2. **No content sprawl** — no blogs, no docs here
3. **No marketing** — no testimonials, no press
4. **No configuration** — settings belong in tools
5. **No animations** — this is infrastructure
6. **No social proof** — verification replaces followers

---

## The North Star

> **"If you scan it, you can act."**

Not: "If you scan it, you read about it."

That's the line between Web2 and Web3.

---

## Relationship to Websites

**You're not banning websites.**  
**You're demoting them.**

The website becomes:

- Compatibility layer for no-app users
- Read-only viewer
- Resolver for legacy browsers
- Marketing garnish (optional)

**The truth lives in**:

- The protocol
- The app
- The QR
- The chain

Which is exactly how it should be.

---

## Implementation Priority

### Phase 1: Current `/mint` (✓ Complete)

Already implements the standard correctly.

### Phase 2: Namespace Objects

Every registered namespace gets its own console:

- `777.y3k` → Protocol Console
- `001.tron` → Protocol Console
- `kevan.y3k` → Protocol Console

### Phase 3: Infrastructure Objects

- Chain console (`1.tron`)
- Vault console (`vault.777`)
- Resolver console (`resolver.y3k`)

### Phase 4: Universal Renderer

Mobile app that renders **any** object from schema.

---

## The Promise

When every object in your ecosystem looks like this, people won't say:

> "Nice website."

They'll say:

> "This feels like infrastructure."

**That's the reaction you're after.**

---

## Canonical Reference

This document is the law.

When in doubt:

1. Look at `/mint`
2. Look at this spec
3. Ask: "Would this work on a QR poster?"

If no, it doesn't belong.

---

**Protocol Console Standard v1.0.0**  
**Y3K Digital**  
**January 22, 2026**
