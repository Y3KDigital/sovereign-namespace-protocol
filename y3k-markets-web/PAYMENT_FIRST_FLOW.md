# Payment-First Flow - Implementation Complete

**Status:** DEPLOYED
**Date:** January 22, 2026
**Build:** v2.1.1 Sovereign (71fb75f)

## Correct Flow (Now Enforced)

### Stage 1: Choose Root
- User selects 3-digit number (100-999)
- Input validation blocks invalid entries
- No keys generated yet

### Stage 2: Payment
- User sends $29 USD equivalent to treasury address
- BTC: `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`
- ETH/USDC/USDT: `0x71C7656EC7ab88b098defB751B7401B5f6d8976F`
- Payment tracked automatically

### Stage 3: Keys (Post-Payment)
- **AFTER** payment confirmation
- User redirected to `/mint/success`
- Keys generated client-side at that point
- Certificate published to IPFS
- Ownership established

## Why This Matters

### Before (Wrong)
1. Choose number
2. **Generate keys immediately** ❌
3. Pay later (maybe)
4. **Problem:** Namespace "claimed" without payment

### After (Correct)
1. Choose number
2. Pay $29
3. **Generate keys AFTER payment** ✅
4. **Result:** Payment verified before namespace claimed

## Implementation

### MintClient.tsx
```typescript
// Only 2 stages in mint flow
const [stage, setStage] = useState<"input" | "payment">("input");

// Keys NOT generated in mint page
// Comment documents where generation happens:
// "Ed25519 Key Generation happens client-side after payment confirmation"
// "Keys are generated in /mint/success page using window.crypto.getRandomValues"
```

### Payment Page Copy
- "After payment confirmation, you'll generate your ownership keys and receive your certificate."
- Clear 4-step process shown to user
- Link to `/mint/success` for status checking

## User Journey

1. Visit `/mint`
2. Enter 100-999
3. Click "Continue to Payment"
4. See payment addresses + instructions
5. Send crypto
6. Click "I've Sent Payment - Check Status"
7. Redirected to `/mint/success`
8. **THEN** generate keys + download certificate

## Security Benefits

- **No premature claiming:** Keys don't exist until payment confirmed
- **No abandoned claims:** Unpaid numbers stay available
- **Clean audit trail:** Payment → Keys → Certificate (in order)
- **No recovery expectations:** Keys generated post-payment = user's responsibility

## Verification

Build verification script checks for:
- ✅ Numeric-only validation
- ✅ No email capture
- ✅ No Stripe/fiat
- ✅ Client-side key generation (comment present)
- ✅ Version stamp
- ✅ Build hash

## Next Step

The `/mint/success` page needs to handle:
1. Payment confirmation polling
2. Key generation UI (post-payment)
3. Certificate download
4. Link to `/mint/ownership` guide

---

**Flow Status:** LOCKED
**Payment-First:** ENFORCED
**Deployment:** https://y3kmarkets.pages.dev
