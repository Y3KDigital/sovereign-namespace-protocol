# Numeric-Only Genesis Root Policy

**Status:** LOCKED AND ENFORCED
**Date:** January 22, 2026
**Version:** v2.1.1 Sovereign

## Canonical Rule

Genesis Roots are **numeric identifiers only**:
- **Allowed:** Three-digit numbers (100–999)
- **Disallowed:** 
  - 1-digit (7)
  - 2-digit (77) ❌
  - 4+ digits (1000)
  - Letters of any kind
  - Special characters or spaces

**One per buyer. No suffixes. No `.x` notation in user-facing content.**

## Validation

```typescript
// Exact regex used in production
const ROOT_REGEX = /^[0-9]{0,3}$/;

// Range validation
if (val.length === 3) {
  const num = parseInt(val, 10);
  if (num < 100 || num > 999) {
    // Invalid: outside allowed range
  }
}
```

## Pricing

**$29 per Genesis Root** (flat rate, no tiers)

## User-Facing Language

### Mint Page
- **Placeholder:** "Enter a number (100–999)"
- **Helper Text:** "Genesis Roots are numeric only. Three digits (100–999). Alphabetical roots are not available."
- **Error Message:** "Invalid root. Use a three-digit number between 100 and 999."

### Availability Line
"Available now: 900 numeric Genesis Roots (100–999)."

### One-Line Truth (use everywhere)
"Genesis Roots are numeric identifiers from 100–999, created once at genesis and owned permanently."

## Subdomain Examples

Users create unlimited subdomains under their numeric root:

**Example with root 777:**
- `777` (the root)
- `777/wallet`
- `777/docs`
- `777/vault`
- `777/anything-you-want`

## What Changed

### Before (Contaminated)
- Alphabet examples: "alice", "vault", "root9"
- 2-digit allowed: "77"
- Mixed validation: letters and numbers
- Inconsistent messaging

### After (Clean)
- Numbers only: 100-999
- All examples use numeric roots
- Consistent validation everywhere
- Clear, defensible policy

## Verification Gates

Build verification script (`scripts/verify-sovereign.js`) enforces:
- ✅ Numeric-only validation present
- ✅ No email fields
- ✅ No Stripe/fiat references
- ✅ Client-side key generation
- ✅ Version stamp with build hash

## Deployment URL

**Production:** https://y3kmarkets.pages.dev
**Version:** v2.1.1 Sovereign
**Build Hash:** 71fb75f

## Forbidden Patterns (Zero Hits Required)

These must never appear in user-facing content:
- `alice` (as root example)
- `77` (2-digit example)
- `root9` (mixed format)
- `.x` notation (except in technical docs)
- "alphabet" or "letters allowed"
- ENS/Unstoppable Domains comparisons
- Token/staking/yield language

## Files Modified

### Core Changes
- `app/mint/MintClient.tsx` - Validation, pricing ($29), helper text, examples
- `app/page.tsx` - Removed "alice, bob" subdomain examples
- `app/mint/ownership/page.tsx` - Changed "alice" → "777" in all examples
- `scripts/verify-sovereign.js` - Updated to check numeric validation

### Deleted (Phase 4 Audit)
- `/vs` - Competitor comparisons
- `/marketplace` - Token/staking
- `/trade` - APY/yield
- `/tokens` - Token docs
- `/buy` - Old Stripe flow
- `/stellar` - Token supply data
- `/pricing` - Unstoppable Domains comparison

## Rationale

### Why Numbers-Only?

1. **Simplicity:** Easy to communicate, verify, and enforce
2. **Scarcity:** 900 roots (100-999) creates genuine supply limit
3. **Defensibility:** No trademark/brand conflicts with alphabet names
4. **Clean Story:** "Numeric identifier" = infrastructure, not consumer product
5. **International:** Numbers work globally without language barriers

### Why Not Letters?

- Trademark risk ("apple", "google", "trump")
- Expectations management ("I want my name!")
- Unclear policy ("Why can't I have 2 letters?")
- Feature creep ("Now everyone wants custom words")

### Why $29?

- Not cheap (signals value)
- Impulse-buy range (moves inventory)
- Clean margin over cost
- Leaves upside for resale

## Future Premium Tiers (Optional)

Without changing the numeric-only rule, premium pricing can be added:

**Standard:** $29 (most numbers)
**Premium:** $49-$99 (culturally significant numbers)
- 111, 222, 333, 444, 555, 666, 777, 888, 999
- 100, 200, 300, 400, 500, 600, 700, 800, 900
- 420, 911, 314, etc.

**This is future enhancement, not required for launch.**

## Enforcement

1. **Client-side:** Input validation blocks non-numeric entry
2. **Build-time:** Verification script fails deployment if validation missing
3. **Documentation:** All examples show numeric roots only
4. **Navigation:** No references to alphabet/letter options

## Contact

For questions about numeric-only policy:
- See: `/mint/ownership` - Complete post-mint orientation
- See: `/docs` - Technical documentation
- Status: `/status` - System health dashboard

---

**Policy Status:** LOCKED
**Last Updated:** January 22, 2026
**Build:** v2.1.1 Sovereign (71fb75f)
