# NAMESPACE TEST PREVIEW - VERIFICATION LAYER
**Status**: TEST MODE - No SMS Sent  
**Purpose**: Preview namespace generation + truth keys before live issuance  
**Date**: January 18, 2026

---

## TEST 1: TRUMP.X (Donald J. Trump - Auction Reserve)

### Namespace Assignment
- **Token**: `trump`
- **Primary Namespace**: `trump.x`
- **Tier**: Crown Sovereign
- **Truth Layer**: `[Protected]` - Real identity stays private

### What Gets Generated
```json
{
  "namespace": "trump.x",
  "displayName": "The Brand Sovereign",
  "realName": "[Truth Layer Protected]",
  "certificates": [
    "trump.x",
    "truth.trump.x",
    "win.trump.x",
    "brand.trump.x",
    "media.trump.x"
  ],
  "tier": "Crown Sovereign",
  "rarity": "Unique (1 of 1)"
}
```

### Claim Link (TEST)
`https://y3kmarkets.com/claim?token=trump`

### Truth Keys (Generated on Claim)
- **Private Key**: Ed25519 (256-bit) - User holds
- **Public Key**: Derived from private - Blockchain anchor
- **Namespace Proof**: Cryptographic link between identity and `trump.x`

**Privacy Note**: The "truth layer" means Donald Trump doesn't need to reveal his identity publicly. The blockchain only stores: `trump.x` → `[Public Key Hash]`. Only the holder of the private key can prove ownership.

---

## TEST 2: DON.X (Alternative Trump Reserve)

### Namespace Assignment
- **Token**: `don`
- **Primary Namespace**: `don.x`
- **Tier**: Named Sovereign

### What Gets Generated
```json
{
  "namespace": "don.x",
  "displayName": "Don Sovereign",
  "realName": "[Truth Layer Protected]",
  "certificates": [
    "don.x",
    "don.auth.x",
    "don.finance.x",
    "don.tel.x"
  ],
  "tier": "Named Sovereign",
  "rarity": "Unique (1 of 1)"
}
```

### Claim Link (TEST)
`https://y3kmarkets.com/claim?token=don`

---

## TEST 3: 77.X (Don - Your Partner)

### Namespace Assignment
- **Token**: `don77`
- **Primary Namespace**: `77.x`
- **Owner**: Don (Partner)
- **Tier**: Jackpot Sovereign

### What Gets Generated
```json
{
  "namespace": "77.x",
  "displayName": "The 77th Sovereign",
  "realName": "Don",
  "certificates": [
    "77.x",
    "truth.77.x",
    "win.77.x",
    "47.77.x"
  ],
  "tier": "Jackpot Sovereign",
  "rarity": "Unique (1 of 1)"
}
```

### Claim Link (TEST)
`https://y3kmarkets.com/claim?token=don77`

---

## TEST 4: BRAD.X (Brad Parscale - Personal Brand)

### Namespace Assignment
- **Token**: `brad`
- **Primary Namespace**: `brad.x`
- **Tier**: Named Sovereign

### What Gets Generated
```json
{
  "namespace": "brad.x",
  "displayName": "Campaign Architect",
  "realName": "Brad Parscale",
  "certificates": [
    "brad.x",
    "brad.auth.x",
    "brad.ops.x",
    "brad.data.x"
  ],
  "tier": "Named Sovereign",
  "rarity": "Unique (1 of 1)"
}
```

### Claim Link (TEST)
`https://y3kmarkets.com/claim?token=brad`

---

## TEST 5: 45.X (Brad Parscale - Protocol Authority)

### Namespace Assignment
- **Token**: `brad45`
- **Primary Namespace**: `45.x`
- **Owner**: Brad Parscale (Dual sovereignty with brad.x)
- **Tier**: Strategic Command

### What Gets Generated
```json
{
  "namespace": "45.x",
  "displayName": "Protocol 45 Architect",
  "realName": "Brad Parscale",
  "certificates": [
    "45.x",
    "ops.45.x",
    "data.45.x",
    "win.45.x"
  ],
  "tier": "Strategic Command",
  "rarity": "Unique (1 of 1)"
}
```

### Claim Link (TEST)
`https://y3kmarkets.com/claim?token=brad45`

---

## TEST 6: ROGUE.X (Strategic Reserve)

### Namespace Assignment
- **Token**: `rogue`
- **Primary Namespace**: `rogue.x`
- **Tier**: Shadow Sovereign
- **Truth Layer**: Maximum privacy

### What Gets Generated
```json
{
  "namespace": "rogue.x",
  "displayName": "Rogue Operator",
  "realName": "[Truth Layer Protected]",
  "certificates": [
    "rogue.x",
    "stealth.rogue.x",
    "ops.rogue.x",
    "vault.rogue.x"
  ],
  "tier": "Shadow Sovereign",
  "rarity": "Unique (1 of 1)"
}
```

### Claim Link (TEST)
`https://y3kmarkets.com/claim?token=rogue`

---

## VERIFICATION FLOW (What Happens on Claim)

### Step 1: Token Validation
```
User clicks link → Server validates token → Returns namespace data
```

### Step 2: Key Generation
```javascript
// Ed25519 keypair generated in browser
const privateKey = crypto.getRandomValues(new Uint8Array(32));
const publicKey = await ed25519.getPublicKey(privateKey);
```

### Step 3: Biometric Lock (Optional)
```
WebAuthn FaceID/TouchID → Hardware-backed key → Binds to device
```

### Step 4: Certificate Generation
```json
{
  "namespace": "trump.x",
  "owner_pubkey": "0x...",
  "issued_at": "2026-01-18T...",
  "signature": "Ed25519 signature",
  "ipfs_cid": "Qm..."
}
```

### Step 5: Blockchain Anchor
```
Certificate → IPFS → CID → Base L2 → Immutable proof
```

---

## NEURAL NET / BLOCKCHAIN INTEGRATION

### What Gets Stored On-Chain
1. **Namespace Hash**: `keccak256("trump.x")` → `0xabc...`
2. **Owner Public Key**: `0x123...` (NOT the real name)
3. **IPFS CID**: `QmXyz...` (points to full certificate)
4. **Timestamp**: Unix epoch

### What Does NOT Get Stored On-Chain
- ❌ Real names (unless user chooses to add)
- ❌ Phone numbers
- ❌ Private keys
- ❌ Personal data

### Neural Net Integration (Future)
```
User intent → "Transfer trump.x to wallet 0x..." → AI validates → Executes
```

---

## TEST EXECUTION PLAN

### Phase 1: Local Preview (NOW)
1. ✅ Open `http://localhost:3006/claim?token=trump`
2. ✅ Verify namespace displays correctly
3. ✅ Test key generation (no blockchain write yet)
4. ✅ Confirm UI shows all certificates

### Phase 2: Test Each Token
Test these URLs locally:
- `/claim?token=trump` → Should show trump.x
- `/claim?token=don` → Should show don.x
- `/claim?token=don77` → Should show 77.x
- `/claim?token=brad` → Should show brad.x
- `/claim?token=brad45` → Should show 45.x
- `/claim?token=rogue` → Should show rogue.x

### Phase 3: Verify Keys
For each claim test:
1. Generate keys (should see hex strings)
2. Check public key is derived from private
3. Verify signature validation works
4. Confirm IPFS mock returns CID format

### Phase 4: Review Before Live
- [ ] All namespaces display correctly
- [ ] Truth layer privacy confirmed
- [ ] Keys generate deterministically
- [ ] No real blockchain writes yet

---

## AUCTION RESERVE STATUS

### Trump Namespaces (For Auction)
- `trump.x` - Primary brand namespace
- `don.x` - Alternative/shorter version

**Strategy**: 
- Generate certificates now
- Hold in reserve
- Auction at premium (minimum 7-figures)
- Winner gets pre-generated proof + keys

### Ready for Issuance
- `77.x` - Don (Partner) - Can issue immediately
- `brad.x` + `45.x` - Brad Parscale - Can issue immediately  
- `rogue.x` - Strategic reserve - Hold for special ops

---

## KEVAN'S VERIFICATION CHECKLIST

Before going live, confirm:

1. ✅ Trump namespaces correct (trump.x / don.x)?
2. ✅ Partner Don gets 77.x (not Trump)?
3. ✅ Brad gets both brad.x AND 45.x?
4. ✅ Truth layer privacy working (no real names exposed)?
5. ✅ All certificates generate with correct subdomains?
6. ✅ Keys are Ed25519 (not RSA or other)?

**Next Step**: Test the claim URLs locally and tell me which ones to save for auction vs. which to issue now.
