# Protocol Console System
## Infrastructure UX for Web3

**Version**: 1.0.0  
**Status**: Canonical Standard  
**Date**: January 22, 2026

---

## The Recognition

What we built at `/mint` is not a website.

It's a **Protocol Console** — the correct way to present any Web3 object.

This document formalizes that pattern as **law** for all future work.

---

## Core Principle

> **Every Web3 object gets exactly one canonical screen.**

Not pages. Not flows. **One screen.**

- One QR code (primary interface)
- One set of actions (max 5)
- One identity header (who/what/trust)
- One state display (infrastructure metrics)

---

## Documents in This System

### 1. **[PROTOCOL_CONSOLE_STANDARD.md](../PROTOCOL_CONSOLE_STANDARD.md)**

The law. Read this first.

**Defines**:
- The four non-negotiable elements
- What's allowed vs banned
- Design discipline
- The object schema
- When to use (and not use) websites

**Audience**: Everyone

---

### 2. **[PROTOCOL_CONSOLE_IMPLEMENTATION.md](../PROTOCOL_CONSOLE_IMPLEMENTATION.md)**

The implementation guide.

**Defines**:
- YAML object schema
- React component template
- CSS standards
- Multi-surface rendering (web, mobile, CLI)
- Type definitions
- Validation rules
- Testing approach

**Audience**: Developers

---

### 3. **[PROTOCOL_CONSOLE_VISUAL_GUIDE.md](PROTOCOL_CONSOLE_VISUAL_GUIDE.md)**

The transformation story.

**Defines**:
- Before/after comparison (website vs console)
- Visual diagrams
- Real-world analogies (ATM, cockpit, terminal)
- Multi-surface property
- Implementation checklist

**Audience**: Designers, product managers

---

## Reference Implementation

**Live**: https://y3kmarkets.pages.dev/mint

**Code**: `y3k-markets-web/app/mint/`

This is the canonical example of the standard in practice.

When in doubt, look at what we already built.

---

## Quick Start (For Developers)

### 1. Define Your Object

```yaml
# objects/777.yaml
object_type: namespace
canonical_id: "777.y3k"
display_name: "Genesis Root 777"

authority:
  entity: "Y3K Protocol"
  verification: verified

qr:
  payload: "y3k://777"
  fallback_url: "https://y3k.xyz/777"

actions:
  - id: send_payment
    label: "Send Payment"
    enabled: true

state:
  - label: "Supply"
    value: 900
```

### 2. Render It

```tsx
import { ProtocolConsole } from '@/components/ProtocolConsole';
import { loadObject } from '@/lib/objects';

const object = await loadObject('777');
return <ProtocolConsole object={object} />;
```

### 3. Deploy Everywhere

Same schema works on:
- Web browsers
- Mobile apps
- CLI tools
- QR posters
- NFC tags
- Kiosks

**One definition. Infinite surfaces.**

---

## The Four Elements (Summary)

### 1. Identity Header
Who/what/trust signal at the top.

### 2. QR Primary
The QR is the interface, not a share feature.

### 3. Deterministic Actions
System commands only. Max 5. No settings.

### 4. State Blocks
Infrastructure metrics. No marketing stats.

---

## What This System Enables

### Universal Recognition

When someone scans ANY object QR in your ecosystem:

- They see the same layout
- They understand immediately
- They know what to do
- No retraining needed

### Multi-Surface Consistency

One schema renders on:
- Websites (fallback)
- Mobile apps (primary)
- Desktop apps
- Kiosks
- Terminals
- Smart displays

### Infrastructure Feel

People won't say "nice website."

They'll say "this feels like infrastructure."

**That's the goal.**

---

## Design Rules (The Discipline)

### MUST DO
1. One screen per object
2. QR first, URL fallback
3. Max 5 actions
4. State not stats
5. Authority visible
6. Type clear

### MUST NOT DO
1. No navigation
2. No content sprawl
3. No marketing
4. No configuration
5. No animations
6. No social proof

---

## The North Star

> **"If you scan it, you can act."**

Not: "If you scan it, you read about it."

That's the line between Web2 and Web3.

---

## Validation Test

Before shipping any object interface, ask:

1. **Can it fit on one screen?**
   - If no: Wrong object definition

2. **Is the QR the primary interface?**
   - If no: Wrong priority

3. **Are there more than 5 actions?**
   - If yes: Too complex, break apart

4. **Does it have marketing stats?**
   - If yes: Remove them

5. **Would this work on a QR poster?**
   - If no: It doesn't belong

---

## Current Status

### ✓ Phase 1: Recognition
We realized `/mint` is already correct.

### ✓ Phase 2: Formalization
Standards documented, templates created.

### → Phase 3: Application
Apply to all objects in the ecosystem:
- Namespace objects
- Chain objects
- Vault objects
- Agent objects

### → Phase 4: Universal Renderer
Build apps that render ANY object from schema.

---

## Who This Is For

- **Developers**: Implement consoles for all objects
- **Designers**: Maintain visual discipline
- **Product**: Define object boundaries correctly
- **Leadership**: Understand the infrastructure positioning

---

## Examples in the Wild

### Infrastructure That Does This Right

1. **ATM machines** — One screen, deterministic actions
2. **Bloomberg terminals** — Identity, actions, state
3. **Aircraft cockpits** — No marketing, pure function
4. **Nuclear plant consoles** — System health only

### What We're NOT Building

1. **E-commerce sites** — Multiple pages, conversion funnels
2. **Social networks** — Feeds, profiles, engagement
3. **Content platforms** — Articles, videos, comments
4. **Marketing sites** — Feature comparisons, testimonials

We're building **infrastructure**.

Act accordingly.

---

## Migration Path (For Existing Work)

If you have a multi-page website:

1. **Identify the object** — What is the core thing?
2. **Extract identity** — Canonical ID, type, authority
3. **Define actions** — What can users DO (not learn)?
4. **Choose metrics** — System health only
5. **Generate QR** — Protocol payload
6. **Render console** — Single screen
7. **Demote website** — Keep as fallback/mirror

The website doesn't go away.  
It just stops being the truth.

---

## Support

Questions about the standard?

1. Read [PROTOCOL_CONSOLE_STANDARD.md](../PROTOCOL_CONSOLE_STANDARD.md)
2. Study `/mint` implementation
3. Check the visual guide
4. Test the "QR poster" rule

If it passes all four, it's correct.

---

## Contributing

To improve this standard:

1. Propose changes via PR
2. Include rationale
3. Show examples
4. Test on multiple surfaces
5. Get consensus

This is architecture. Changes are expensive.

**Measure twice, cut once.**

---

## Version History

- **v1.0.0** (Jan 22, 2026) — Initial formalization
  - Recognized `/mint` as correct pattern
  - Documented four elements
  - Created implementation guide
  - Established as canonical standard

---

## The Promise

When every object in your ecosystem uses this pattern:

- **Recognition**: Users understand instantly
- **Trust**: Looks like serious infrastructure
- **Scalability**: One schema, infinite renderers
- **Discipline**: No UX drift, no feature creep

**That's how real systems win.**

---

**Protocol Console System v1.0.0**  
**Y3K Digital**  
**Infrastructure Systems Architecture**  
**January 22, 2026**
