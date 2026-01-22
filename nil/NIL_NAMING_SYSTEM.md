# NIL Naming System (Locked & Scalable)

This document defines a **locked**, repeatable naming pattern for NIL markets.

It is a **branding / routing / compliance layer** intended to remain stable for years.
It does **not** change SNP v1.0 specifications.

---

## Canonical rule (do not break)

You will **always mint TWO names per market**:

1. **CityNIL** — institutional / compliance / governance shell
2. **MascotNIL** — athlete-facing / fan-facing / commercial shell

Format (exact):

- `CityNIL`
- `MascotNIL`

No prefixes. No suffixes. No casing variants.

---

## Hard rules (enforced by convention)

- No emojis
- No slang
- No numbers
- No suffixes like `DAO`, `Collective`, `Official`
- No variation in casing

Consistency > creativity.

---

## Normalization & validation (recommended)

Treat the minted NIL name as the canonical identifier.

Recommended syntactic checks:

- ASCII letters only: `A–Z` and `a–z`
- Must end with `NIL` exactly
- Must be `PascalCase` (leading capital, internal capitals allowed)
- No whitespace, punctuation, underscores, hyphens, or digits

Example acceptance:
- `GlendaleNIL` ✅
- `NewOrleansNIL` ❌ (contains no capitalization boundary for the space; if you want this market, canonical is `NewOrleansNIL` with no space)

---

## Mapping into Y3K / SNP objects (how this fits the protocol)

SNP namespaces (e.g. `1.x`) are **presentation identifiers** for a cryptographic asset.
The cryptographic hash is the truth.

Therefore:

- `CityNIL` / `MascotNIL` are **brand marks** (human-facing, stable).
- A Y3K mint produces a **namespace asset** (e.g. `N.x` + immutable hash).
- The binding between a brand mark and a namespace asset is done via **metadata** and/or a registry in your application layer.

### Recommended registry fields

For each minted NIL name, store:

- `nil_name` (e.g. `GlendaleNIL`)
- `nil_role` (`city` or `mascot`)
- `pair_key` (shared key for the market pair; e.g. `glendale`, `miami`, `athens`)
- `namespace_id` (e.g. `1234.x`)
- `namespace_hash` (the immutable truth)
- `owner` (wallet / legal entity reference)

This allows:

- consistent landing pages
- consistent AI agent routing
- compliance separation (city vs mascot)
- durable marketing that does not depend on `N.x` numbers

---

## Minting order (operational)

1. Bowl cities (fast national attention)
2. Mascots for teams in those bowls
3. Campus city + mascot for top universities
4. Expansion (conference mascots, statewide city markets)

---

## Source of truth

This file is the operational authority for NIL naming.
