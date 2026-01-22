# Y3K Launch Test Plan
**Date**: January 21, 2026  
**Goal**: Test complete purchase → certificate issuance flow

---

## 🎯 System Architecture

```
BUYER JOURNEY:
1. Browse available namespaces → /mint
2. Enter email + select rarity tier
3. Pay with Stripe (test mode)
4. Webhook triggers certificate generation
5. Receive email with certificate + claim link
6. Visit /claim/[token] to generate keys
7. Download sovereignty stack
```

---

## ✅ What EXISTS (Verified)

### 1. **Genesis Certificates** (955)
- ✅ Location: `genesis/ARTIFACTS/certificates/`
- ✅ Published to IPFS: `QmVr7U9y59aBWCGbd7MLH1pw1guAvoJJVuVaXNjkuTfPXn`
- ✅ Genesis hash: `0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc`

### 2. **Claim Ceremony** (`/claim/[token]`)
- ✅ Client-side key generation
- ✅ WebAuthn biometric binding
- ✅ Multi-sig governance setup
- ✅ Private key backup
- ✅ IPFS certificate signing
- **Test URLs**: 
  - https://y3kmarkets.com/claim/?token=brad
  - https://1cb15260.y3kmarkets.pages.dev/claim/?token=222-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0

### 3. **Mint/Purchase Page** (`/mint`)
- ✅ File: `y3k-markets-web/app/mint/MintClient.tsx`
- ✅ Stripe Elements integration
- ✅ Rarity tier selection
- ✅ Email capture
- ✅ Optional namespace specification
- ✅ Genesis Founder flag support
- ✅ NIL (city/mascot) labeling support
- ✅ IPFS verification link embedded

### 4. **Payments API** (Rust backend)
- ⚠️ **Status**: Compiled but won't start (port binding issue)
- ✅ Stripe webhook handler exists
- ✅ Certificate issuance logic built
- ✅ UCRED minting integration added (Phase 3)
- ❌ **BLOCKER**: Cannot bind to ports (Windows permission error)

---

## 🔧 Pre-Launch Requirements

### CRITICAL: Start Payments API

**Current Issue**: 
- Error 10013 (PermissionDenied) on ports 8081, 8082, 13000
- Windows Firewall or security policy blocking

**Solution Options**:
1. **Run as Administrator** (PowerShell → Right-click → Run as Admin)
   ```powershell
   cd "C:\Users\Kevan\web3 true web3 rarity"
   $env:BIND_ADDRESS = "127.0.0.1:8081"
   $env:RUST_L1_INDEXER = "http://localhost:8089"
   $env:RUST_L1_ADMIN_TOKEN = "R98uRNGES3kILGqwEv7Ss8JRrj8u4OabDob397RxhI8="
   .\target\release\payments-api.exe
   ```

2. **Use Port Forwarding** (if admin not available)
   ```powershell
   netsh interface portproxy add v4tov4 listenport=8081 listenaddress=127.0.0.1 connectport=3000 connectaddress=127.0.0.1
   ```

3. **Deploy to Server** (cloud, no local restrictions)

---

## 🧪 Test Scenarios

### Test 1: Purchase Flow (Stripe Test Mode)

**Steps**:
1. Visit: `http://localhost:3005/mint`
2. Enter test email: `test@y3kdigital.com`
3. Select rarity tier: "Common" ($35)
4. Click "Create Payment Intent"
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete payment

**Expected Result**:
- ✅ Payment succeeds
- ✅ Stripe webhook fires: `payment_intent.succeeded`
- ✅ Payments-API receives webhook
- ✅ Certificate generated for purchased namespace
- ✅ Email sent to customer
- ✅ UCRED minted to customer account (Rust L1)

**Current Status**: ❌ BLOCKED (payments-api won't start)

---

### Test 2: Claim Ceremony

**Steps**:
1. Receive email with claim token
2. Visit: `https://y3kmarkets.com/claim/?token=[TOKEN]`
3. Generate keys (client-side)
4. Enable WebAuthn (FaceID/TouchID)
5. Download private key backup
6. Sign certificate
7. Publish to IPFS

**Expected Result**:
- ✅ Keys generated in browser
- ✅ Private key downloaded (JSON file)
- ✅ Certificate signed with user's key
- ✅ IPFS CID returned
- ✅ Success screen shows sovereignty stack

**Current Status**: ✅ WORKS (tested with brad, 222, 333 tokens)

---

### Test 3: Friends & Family Access

**URL**: `http://localhost:3005/friends-family`

**Steps**:
1. Enter access code: `GENESIS-XXXX-XXXX`
2. Validate against invite list
3. Redirect to `/mint?genesis_founder=true`
4. Complete purchase flow

**Expected Result**:
- ✅ 24-hour early access window enforced
- ✅ Genesis Founder badge added to certificate
- ✅ Same pricing (no discount - compliance)

**Current Status**: ⏳ Not tested

---

### Test 4: Namespace Inventory

**API Endpoint**: `/api/available-namespaces`

**Expected**:
- ✅ Returns list of unclaimed roots (100-999.x)
- ✅ Filters out reserved (88, 222, 333, brad, trump, etc.)
- ✅ Shows rarity tier for each
- ✅ Real-time availability

**Current Status**: ⏳ Need to verify endpoint exists

---

## 🚀 Launch Checklist

### Phase 1: Technical Validation (TODAY)

- [ ] **1.1** Fix payments-api port binding (run as admin)
- [ ] **1.2** Start payments-api successfully
- [ ] **1.3** Configure Stripe test keys
  - `STRIPE_API_KEY=sk_test_...`
  - `STRIPE_WEBHOOK_SECRET=whsec_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- [ ] **1.4** Test Stripe webhook locally:
  ```bash
  stripe listen --forward-to localhost:8081/webhooks/stripe
  ```
- [ ] **1.5** Complete one test purchase end-to-end
- [ ] **1.6** Verify certificate generation
- [ ] **1.7** Verify email delivery (or mock email)
- [ ] **1.8** Test claim ceremony with generated token
- [ ] **1.9** Verify UCRED minting (check Rust L1 balance)

---

### Phase 2: Content & Compliance (2 hours)

- [ ] **2.1** Add disclaimers to `/mint` page:
  - ⚠️ NOT an investment
  - ⚠️ NO guaranteed returns
  - ⚠️ Value may go DOWN or ZERO
  - ✅ Purchase only if you can afford to lose it
- [ ] **2.2** Update pricing display with tier breakdown
- [ ] **2.3** Add "Compare to Unstoppable Domains" link
- [ ] **2.4** Show IPFS verification link prominently
- [ ] **2.5** Terms & Conditions page (legal required)
- [ ] **2.6** Privacy Policy (email capture required)
- [ ] **2.7** Refund policy (Stripe required)

---

### Phase 3: Public Launch (24 hours)

- [ ] **3.1** Switch to Stripe LIVE keys
- [ ] **3.2** Deploy payments-api to production server
- [ ] **3.3** Deploy website to production domain
- [ ] **3.4** Configure DNS properly
- [ ] **3.5** Enable HTTPS (SSL certificates)
- [ ] **3.6** Set up email service (SendGrid/Mailgun)
- [ ] **3.7** Monitor webhook logs
- [ ] **3.8** Test production purchase ($35 tier)
- [ ] **3.9** Announce to waitlist/social
- [ ] **3.10** Go live 🚀

---

## 💰 Pricing Strategy (Genesis Launch)

### Tier Structure (955 total)

| Tier | Price | Supply | Description |
|------|-------|--------|-------------|
| **Founder** | $7,500 | 5 | Single digits (1-9.x) + named (brad.x) |
| **Premier** | $3,500 | 25 | Low numbers (10-99.x) |
| **Distinguished** | $1,250 | 100 | Premium patterns (100-199.x) |
| **Standard** | $350 | 300 | Mid-range (200-599.x) |
| **Essential** | $125 | 570 | Entry tier (600-999.x) |
| **Basic** | $35 | Dynamic | Reserved pool |

**Revenue Projections** (if all sell):
- Founder: 5 × $7,500 = $37,500
- Premier: 25 × $3,500 = $87,500
- Distinguished: 100 × $1,250 = $125,000
- Standard: 300 × $350 = $105,000
- Essential: 570 × $125 = $71,250
- **Total**: $426,250

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Purchase Funnel**:
   - `/mint` page visits
   - Payment intents created
   - Successful payments
   - Failed payments (reason)
   - Refund rate

2. **Claim Ceremony**:
   - Token validations
   - Key generation completions
   - WebAuthn successes/failures
   - IPFS publication rate
   - Download rate (private key backups)

3. **Revenue**:
   - Daily sales
   - Tier distribution
   - Average transaction value
   - Refund volume

4. **Technical Health**:
   - Payments-API uptime
   - Stripe webhook success rate
   - IPFS availability
   - Certificate generation errors
   - UCRED minting success rate

---

## 🎯 Marketing Launch Plan

### Pre-Launch (Week 1)

**Goal**: Build anticipation, validate demand

1. **Comparison Page** (vs Unstoppable Domains)
   - Side-by-side feature table
   - Pricing comparison
   - Scarcity proof (955 vs unlimited)
   - IPFS verification demo

2. **Explainer Video** (2 minutes)
   - What is a namespace?
   - Why genesis-locked matters
   - Pure Web3 architecture
   - Claiming ceremony demo

3. **Social Proof**:
   - Brad testimonial (if approved)
   - Genesis founder badges
   - IPFS verification screenshots

4. **Waitlist**:
   - Email capture
   - Early bird notification
   - Friends & Family invites

---

### Launch Day

**Goal**: First 10 sales, prove system works

1. **Friends & Family** (8:00 PM EST)
   - Email invitations
   - 24-hour exclusive access
   - Access codes distributed

2. **Public Launch** (8:00 PM EST + 24h)
   - Open /mint to public
   - Social media announcement
   - Press release (optional)

3. **Real-Time Updates**:
   - "X namespaces claimed" counter
   - Recent purchases feed (privacy-safe)
   - Trending tiers

---

### Post-Launch (Week 2)

**Goal**: Maintain momentum, secondary market prep

1. **Case Studies**:
   - Early adopter interviews
   - Use case highlights
   - Technical deep-dives

2. **Secondary Market**:
   - Enable transfers
   - P2P marketplace
   - Pricing discovery

3. **Partnerships**:
   - Web3 app integrations
   - Wallet support
   - Identity providers

---

## 🔒 Security Checklist

### Pre-Launch Security Review

- [ ] **S1** Rate limiting on `/mint` (prevent abuse)
- [ ] **S2** Email validation (prevent spam)
- [ ] **S3** Stripe webhook signature verification
- [ ] **S4** CORS properly configured
- [ ] **S5** Private keys never touch server
- [ ] **S6** HTTPS enforced (no HTTP)
- [ ] **S7** Environment variables secured
- [ ] **S8** Database backups enabled
- [ ] **S9** IPFS pinning redundancy
- [ ] **S10** Admin endpoints protected (Rust L1 token)

---

## 🐛 Known Issues

### Critical
- ❌ **Payments-API won't start** (port binding)
  - Impact: Cannot accept payments
  - Priority: P0 - BLOCKER
  - Fix: Run as administrator or deploy to server

### Medium
- ⚠️ **88.x claim token mismatch** (URL has wrong token)
  - Impact: One user can't claim
  - Priority: P1
  - Fix: Update URL or API validation

### Low
- 📝 Terms & Conditions page missing
- 📝 Privacy Policy page missing
- 📝 Refund policy not documented

---

## ✅ Success Criteria

**Launch is successful if:**

1. ✅ Payments-API operational
2. ✅ Stripe test purchase completes end-to-end
3. ✅ Certificate auto-generated after payment
4. ✅ Email delivery works
5. ✅ Claim ceremony functional
6. ✅ IPFS verification public
7. ✅ Disclaimers prominent
8. ✅ First 10 sales completed without errors
9. ✅ Zero security incidents
10. ✅ Positive user feedback

---

## 🎬 IMMEDIATE NEXT STEPS

1. **RIGHT NOW**: Fix payments-API startup (run PowerShell as admin)
2. **Test**: Complete one purchase with Stripe test keys
3. **Verify**: Check certificate generation + UCRED minting
4. **Document**: Create video showing complete flow
5. **Launch**: Open to Friends & Family (24h early access)

**Status**: 🟡 80% ready - ONE blocker (payments-API port issue)
