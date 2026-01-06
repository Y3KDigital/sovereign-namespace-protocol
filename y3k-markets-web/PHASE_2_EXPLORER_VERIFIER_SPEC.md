# PHASE 2: EXPLORER / VERIFIER SPECIFICATION

**Status:** Draft  
**Version:** 1.0  
**Date:** 2026-01-03  
**Owner:** Y3K Digital  
**Phase 1 Status:** ✅ COMPLETE & ACCEPTED  

---

## EXECUTIVE SUMMARY

**Objective:** Provide a public, read-only verification tool that demonstrates stateless certificate validation without enabling issuance, creating expectations, or requiring accounts.

**Core Principle:** Verification is educational and independent. It does NOT imply ownership, transferability, or entitlement.

**Non-Goals:**
- ❌ No minting or issuance paths
- ❌ No accounts or authentication
- ❌ No pricing or payment UI
- ❌ No promises or timelines
- ❌ No IPFS writes or pinning

---

## TECHNICAL ARCHITECTURE

### Verifier Integration Options

**Option A: Server-Side Verification (RECOMMENDED)**
- **Implementation:** Rust `snp-verifier` CLI wrapped in API endpoint
- **Endpoint:** `POST /api/verify/certificate`
- **Advantages:**
  - Reuses existing production verifier (100% fidelity)
  - No client-side cryptography dependencies
  - Consistent behavior across all platforms
  - Simple error handling
- **Disadvantages:**
  - Server dependency (but stateless, no DB writes)
  - Network latency for large certificates

**Option B: Client-Side WASM**
- **Implementation:** Compile `snp-verifier` to WebAssembly
- **Advantages:**
  - True offline verification
  - No server dependency
  - Instant results
- **Disadvantages:**
  - WASM binary size (~1-2 MB)
  - Dilithium5 WASM support may require additional work
  - Browser compatibility concerns

**DECISION: Start with Option A (Server-Side), evaluate Option B post-Genesis**

---

### API Specification

#### `POST /api/verify/certificate`

**Request:**
```json
{
  "certificate_json": "{...full certificate JSON...}"
}
```

**Response (Success):**
```json
{
  "status": "VALID" | "INVALID" | "SIMULATION",
  "checks": {
    "format_valid": true,
    "hash_integrity": true,
    "signature_valid": true,
    "ipfs_cid_match": true,
    "genesis_valid": true
  },
  "details": {
    "namespace": "example.x",
    "tier": "Rare",
    "ipfs_cid": "QmXXXXXXXXXX",
    "issued_at": "2026-01-10T12:00:00Z",
    "genesis_timestamp": "2026-01-15T00:00:00Z",
    "is_simulation": false
  },
  "warnings": [],
  "errors": []
}
```

**Response (Invalid):**
```json
{
  "status": "INVALID",
  "checks": {
    "format_valid": true,
    "hash_integrity": false,
    "signature_valid": false,
    "ipfs_cid_match": true,
    "genesis_valid": true
  },
  "details": {},
  "warnings": [],
  "errors": [
    "Certificate hash does not match computed hash",
    "Dilithium5 signature verification failed"
  ]
}
```

**Response (Simulation):**
```json
{
  "status": "SIMULATION",
  "checks": {
    "format_valid": true,
    "hash_integrity": true,
    "signature_valid": false,
    "ipfs_cid_match": true,
    "genesis_valid": true
  },
  "details": {
    "namespace": "example.x",
    "tier": "Rare",
    "ipfs_cid": "QmPRACTICEXXXXXXXXX",
    "issued_at": "2026-01-03T10:00:00Z",
    "genesis_timestamp": "2026-01-15T00:00:00Z",
    "is_simulation": true
  },
  "warnings": [
    "This is a practice certificate from Practice Mode",
    "Signature is mock data (MOCK_SIGNATURE_DATA_FOR_PRACTICE_MODE_ONLY_NOT_VALID)",
    "IPFS CID is prefixed with QmPRACTICE"
  ],
  "errors": []
}
```

**Error Cases:**
- `400 Bad Request` - Invalid JSON format
- `422 Unprocessable Entity` - Missing required fields
- `500 Internal Server Error` - Verifier execution failed

---

### Data Flow

```
User Input (Paste/Upload)
    ↓
Client-Side Validation (JSON parse)
    ↓
POST /api/verify/certificate
    ↓
snp-verifier CLI execution
    ↓
Parse verifier output
    ↓
Return structured result
    ↓
Display Result Panel
```

**No Database Writes:** Verification is stateless and ephemeral.  
**No Session State:** Each verification is independent.  
**No Logging:** Do not log certificate contents (privacy).

---

## UX SPECIFICATION

### Screen Flow

```
/explore (Landing)
    ↓
/explore/verify (Upload/Paste)
    ↓
[Verification Processing]
    ↓
/explore/result (Result Display)
```

---

### SCREEN 1: Explorer Landing (`/explore`)

**Purpose:** Entry point for certificate exploration and verification.

**Content:**

**Header:**
- Title: "Certificate Explorer & Verifier"
- Subtitle: "Verify certificate authenticity offline"

**Main Section:**
- **What This Tool Does:**
  - ✓ Verifies certificate cryptographic integrity
  - ✓ Validates Dilithium5 post-quantum signatures
  - ✓ Confirms IPFS content addressing
  - ✓ Checks Genesis ceremony inclusion
  - ✓ Works offline (once downloaded)

- **What This Tool Does NOT Do:**
  - ✗ Does NOT prove ownership (certificates are non-transferable)
  - ✗ Does NOT enable minting or issuance
  - ✗ Does NOT require accounts or wallets
  - ✗ Does NOT modify or pin to IPFS

**Call to Action:**
- Button: "Verify Certificate" → `/explore/verify`
- Link: "Learn About Verification" → Educational modal/page

**Guardrails:**
- No pricing displayed
- No "Get Started" or minting links
- No countdown timers
- No promises

---

### SCREEN 2: Upload/Paste (`/explore/verify`)

**Purpose:** Accept certificate JSON input for verification.

**Layout:**

**Header:**
- Title: "Certificate Verification"
- Subtitle: "Upload or paste certificate JSON"

**Input Methods:**

**Option 1: File Upload**
- Drag-and-drop zone
- File type: `.json` only
- Max size: 10 KB (certificates are small)
- Preview: Show first 500 chars after upload

**Option 2: JSON Paste**
- Large textarea (10+ lines visible)
- Placeholder: 
  ```
  {
    "version": "1.0.0",
    "namespace": "example.x",
    "tier": "Rare",
    ...
  }
  ```
- Real-time JSON validation (syntax only)
- Character count display

**Sample Certificate:**
- Link: "Load Sample Certificate" (practice cert for demo)
- Warning: "This is a practice certificate with mock signature"

**Verification Button:**
- Label: "Verify Certificate"
- Disabled until valid JSON detected
- Loading state: "Verifying..." with spinner

**Disclaimers (Visible):**
- "⚠️ Verification does not prove ownership or transferability"
- "🔐 Your certificate is not stored or logged"
- "🌐 Verification is stateless and independent"

---

### SCREEN 3: Result Display (`/explore/result`)

**Purpose:** Display comprehensive verification results with educational context.

**Layout:**

**Status Badge (Top):**
- **VALID** (Green, ✓):
  - "Certificate is cryptographically valid"
  - All checks passed
  
- **INVALID** (Red, ✗):
  - "Certificate failed verification"
  - List specific failures
  
- **SIMULATION** (Orange, 🔶):
  - "This is a practice certificate"
  - "Not a real certificate from real issuance"

**Verification Checks Table:**

| Check | Status | Details |
|-------|--------|---------|
| Format Valid | ✓ / ✗ | JSON structure matches schema |
| Hash Integrity | ✓ / ✗ | SHA3-256 hash matches certificate_hash |
| Signature Valid | ✓ / ✗ | Dilithium5 signature verified with Genesis public key |
| IPFS CID Match | ✓ / ✗ | CID corresponds to certificate content |
| Genesis Valid | ✓ / ✗ | Issued before Genesis finalization (2026-01-15) |

**Certificate Details Panel:**
- Namespace: `example.x`
- Tier: `Rare` (color-coded)
- IPFS CID: `QmXXXXXXXXXX` (with copy button)
- Issued At: `2026-01-10 12:00:00 UTC`
- Genesis Timestamp: `2026-01-15 00:00:00 UTC`
- Protocol Version: `1.0.0`

**Simulation Detection (if applicable):**
- Orange warning box:
  - "🔶 PRACTICE CERTIFICATE DETECTED"
  - "This certificate was generated in Practice Mode"
  - "Signature: MOCK_SIGNATURE_DATA_FOR_PRACTICE_MODE_ONLY_NOT_VALID"
  - "IPFS CID: Prefixed with QmPRACTICE"
  - "This is NOT a real certificate"

**Educational Panels (Collapsible):**

**"What Does This Mean?"**
- Explains each check in plain language
- Links to technical documentation

**"How Stateless Verification Works"**
- 4-step process visualization
- Cryptographic primitives explanation
- Post-quantum security note

**"Certificate Non-Transferability"**
- "Verification does NOT prove current ownership"
- "Certificates cannot be transferred or sold"
- "This tool only validates cryptographic integrity"

**Actions:**
- Button: "Verify Another Certificate" → `/explore/verify`
- Button: "Return to Explorer" → `/explore`
- **NO** "Mint Certificate" button
- **NO** "Register Now" button

---

## GUARDRAILS CHECKLIST

### Design Guardrails
- [ ] No pricing displayed anywhere
- [ ] No mint/issuance buttons or links
- [ ] No countdown timers (except Genesis finalization in footer)
- [ ] No "limited time" or urgency language
- [ ] No account creation prompts
- [ ] No wallet connection UI
- [ ] Clear "verification ≠ ownership" disclaimers on every screen

### Technical Guardrails
- [ ] No database writes during verification
- [ ] No session state persistence
- [ ] No certificate logging (privacy)
- [ ] No IPFS writes or pinning
- [ ] Read-only IPFS gateway access only
- [ ] Rate limiting on verification endpoint (10 req/min per IP)

### Content Guardrails
- [ ] All copy is educational, not promotional
- [ ] Simulation certificates clearly marked
- [ ] No promises or guarantees about real issuance
- [ ] "Non-transferable" mentioned on result screen
- [ ] No investor/financial language
- [ ] No "join waitlist" or similar CTAs

### Routing Guardrails
- [ ] All routes under `/explore/*` namespace
- [ ] No paths from verifier to `/create/*` or `/mint/*`
- [ ] No cross-linking to payment flows
- [ ] Static export compatible

---

## IMPLEMENTATION MILESTONES

### **EM-1: Backend Verifier API** (Week 1)

**Objective:** Create stateless verification endpoint using `snp-verifier`.

**Tasks:**
1. Create Rust API wrapper for `snp-verifier` CLI
2. Implement `POST /api/verify/certificate` endpoint
3. Parse verifier output into JSON response
4. Add simulation detection (check for QmPRACTICE, mock signature)
5. Implement rate limiting (10 req/min per IP)
6. Add error handling for malformed certificates
7. Test with real and practice certificates

**Acceptance Criteria:**
- [ ] Valid certificates return `status: "VALID"` with all checks passed
- [ ] Invalid certificates return `status: "INVALID"` with specific errors
- [ ] Practice certificates return `status: "SIMULATION"` with warnings
- [ ] Malformed JSON returns 400 error
- [ ] Rate limiting enforced (429 after 10 requests)
- [ ] Zero database writes during verification
- [ ] Response time < 500ms for valid certificates

---

### **EM-2: Frontend Upload/Paste Screen** (Week 1)

**Objective:** Create certificate input interface at `/explore/verify`.

**Tasks:**
1. Create `/explore/verify` page with Suspense
2. Implement file upload (drag-and-drop, .json only)
3. Implement JSON textarea with syntax validation
4. Add "Load Sample Certificate" button (practice cert)
5. Add real-time JSON validation (parse check only)
6. Display character count and file size
7. Show disclaimers ("verification ≠ ownership")
8. Add "Verify Certificate" button with loading state

**Acceptance Criteria:**
- [ ] File upload accepts .json files only (max 10 KB)
- [ ] Paste area validates JSON syntax in real-time
- [ ] Sample certificate loads practice cert with warning
- [ ] Button disabled until valid JSON detected
- [ ] Disclaimers visible above submit button
- [ ] Loading state shows during API call
- [ ] Static export compatible (no dynamic routes)

---

### **EM-3: Frontend Result Display Screen** (Week 1)

**Objective:** Display verification results at `/explore/result`.

**Tasks:**
1. Create `/explore/result` page with query param routing
2. Display status badge (VALID/INVALID/SIMULATION)
3. Show verification checks table (5 checks)
4. Display certificate details panel
5. Add simulation detection warning (orange box)
6. Implement educational collapsible panels (3 sections)
7. Add "Verify Another" and "Return to Explorer" buttons
8. Ensure no mint/issuance links present

**Acceptance Criteria:**
- [ ] Status badge color-coded (green/red/orange)
- [ ] All 5 checks displayed with pass/fail icons
- [ ] Certificate details extracted and formatted
- [ ] Simulation warning shown for practice certs
- [ ] Educational panels collapsible and informative
- [ ] No mint buttons or payment CTAs
- [ ] "Verification ≠ ownership" disclaimer visible
- [ ] Static export compatible

---

### **EM-4: Explorer Landing Page** (Week 1)

**Objective:** Create entry point at `/explore` with educational framing.

**Tasks:**
1. Create `/explore` landing page
2. Add "What This Tool Does" section (5 items)
3. Add "What This Tool Does NOT Do" section (4 items)
4. Implement "Verify Certificate" button → `/explore/verify`
5. Add "Learn About Verification" educational modal/page
6. Ensure no pricing or minting CTAs
7. Footer with Genesis countdown

**Acceptance Criteria:**
- [ ] Landing page clearly explains verifier purpose
- [ ] "Does NOT prove ownership" explicitly stated
- [ ] No pricing or mint links present
- [ ] Educational content accessible
- [ ] Clean navigation to verify screen
- [ ] Static export compatible
- [ ] Genesis countdown in footer only

---

### **EM-5: End-to-End Testing** (Week 2)

**Objective:** Validate full verification flow with real and practice certificates.

**Tasks:**
1. Test with valid real certificate (if available pre-Genesis)
2. Test with practice certificate from Phase 1
3. Test with tampered certificate (modified hash)
4. Test with invalid signature
5. Test with malformed JSON
6. Test with oversized payload (>10 KB)
7. Verify rate limiting enforcement
8. Cross-browser testing (Chrome, Firefox, Safari, Edge)
9. Mobile responsiveness testing
10. Static export deployment test

**Acceptance Criteria:**
- [ ] Valid certificates verify correctly
- [ ] Practice certificates detected as SIMULATION
- [ ] Tampered certificates show INVALID with errors
- [ ] Malformed JSON handled gracefully
- [ ] Rate limiting prevents abuse
- [ ] Works across all major browsers
- [ ] Mobile-friendly UI
- [ ] Static export deploys without errors

---

### **EM-6: Documentation & Deployment** (Week 2)

**Objective:** Document verifier usage and deploy to production.

**Tasks:**
1. Write "How to Use the Verifier" guide
2. Create video/GIF demo of verification flow
3. Document API endpoint for developers
4. Add verifier to main navigation menu
5. Update README with Phase 2 status
6. Deploy to Cloudflare Pages (feature-flagged)
7. Monitor error logs for first 48 hours
8. Collect user feedback (if any)

**Acceptance Criteria:**
- [ ] User guide published
- [ ] Demo video/GIF created
- [ ] API documentation complete
- [ ] Verifier accessible from main nav
- [ ] README updated
- [ ] Deployed to production (feature-flagged)
- [ ] Error monitoring active
- [ ] Zero critical bugs in first 48 hours

---

## ACCEPTANCE CRITERIA (PHASE 2 COMPLETE)

### Functional Requirements
- ✅ Users can upload or paste certificate JSON
- ✅ Server-side verification executes without errors
- ✅ Results display all 5 checks with pass/fail status
- ✅ Simulation certificates clearly marked
- ✅ Invalid certificates show specific error messages
- ✅ Rate limiting prevents abuse

### Non-Functional Requirements
- ✅ Verification completes in < 500ms
- ✅ No database writes during verification process
- ✅ Static export generates all routes without errors
- ✅ Mobile-responsive design
- ✅ Works offline after initial load (if WASM implemented)

### Guardrail Requirements
- ✅ Zero pricing displayed
- ✅ Zero mint/issuance links
- ✅ Zero account creation prompts
- ✅ "Verification ≠ ownership" disclaimer on all screens
- ✅ All routes under `/explore/*` namespace
- ✅ No promises or guarantees made

### Documentation Requirements
- ✅ User guide published
- ✅ API documentation complete
- ✅ Demo video/GIF available
- ✅ README updated with Phase 2 status

---

## TIMELINE

**Week 1 (Jan 6-12):**
- EM-1: Backend Verifier API (3 days)
- EM-2: Upload/Paste Screen (2 days)
- EM-3: Result Display Screen (2 days)

**Week 2 (Jan 13-19):**
- EM-4: Explorer Landing Page (1 day)
- EM-5: End-to-End Testing (2 days)
- EM-6: Documentation & Deployment (2 days)

**Genesis Day:** January 15, 2026 00:00:00 UTC (during Week 2)

**Post-Genesis:**
- Monitor verification traffic
- Validate real certificates as they're issued
- Collect feedback for improvements

---

## TECHNICAL DEPENDENCIES

### Backend
- `snp-verifier` CLI (already built in `snp-verifier/` crate)
- Rust API server (reuse `payments-api` or create new `verifier-api`)
- IPFS read-only gateway access (optional, for CID validation)

### Frontend
- Next.js 14 (already configured for static export)
- React 18
- Tailwind CSS (already configured)
- File upload library (react-dropzone or native input)

### Infrastructure
- Cloudflare Pages (static hosting)
- Cloudflare Tunnel (backend API access)
- Rate limiting via Cloudflare Workers (optional)

---

## RISK ASSESSMENT

### High Risk
- **Dilithium5 signature verification performance** - May need optimization for web context
- **IPFS gateway availability** - Need fallback if primary gateway is down

### Medium Risk
- **Certificate format changes** - Need versioning strategy if schema evolves
- **Browser compatibility** - Dilithium5 verification may not work in older browsers

### Low Risk
- **Rate limiting bypass** - Can be mitigated with Cloudflare Workers
- **UI/UX clarity** - Can iterate based on user feedback

### Mitigation Strategies
1. **Performance:** Cache Genesis public key, optimize hash computation
2. **IPFS:** Use multiple gateway endpoints with fallback logic
3. **Versioning:** Check `version` field in certificate, handle gracefully
4. **Compatibility:** Display browser requirements, provide CLI alternative
5. **Rate Limiting:** Implement both server-side and edge-level limits

---

## SUCCESS METRICS

### Primary Metrics
- **Verification Accuracy:** 100% correct validation (no false positives/negatives)
- **Response Time:** < 500ms p95 for verification requests
- **Error Rate:** < 1% of verification attempts fail due to system errors

### Secondary Metrics
- **User Engagement:** Track unique verifications per day
- **Simulation Detection:** % of verifications that are practice certificates
- **Geographic Distribution:** Where verification requests originate (privacy-preserving)

### Quality Metrics
- **Zero Mint Leakage:** No users mistakenly think they can mint from verifier
- **Zero Pricing Display:** No pricing information visible anywhere
- **Zero Ownership Claims:** No users think verification proves ownership

---

## POST-GENESIS CONSIDERATIONS

### After Genesis Finalization (2026-01-15)
1. **Real Certificate Verification:** Begin validating real certificates as they're issued
2. **Historical Record:** Archive practice certificates separately from real ones
3. **Supply Tracking:** Display issued/remaining per tier (read-only, no minting)
4. **Public Registry:** Consider publishing verified namespaces (privacy-preserving)

### Future Enhancements (Post-Phase 2)
- **WASM Verifier:** Compile to WebAssembly for true offline verification
- **CLI Distribution:** Package standalone verifier for power users
- **Batch Verification:** Verify multiple certificates at once
- **Public Explorer:** Browse all issued certificates (if privacy-compatible)
- **Namespace Search:** Look up specific identifiers (read-only)

---

## APPROVAL WORKFLOW

### Phase 2 Milestones Approval
- [ ] EM-1 (Backend API) - Requires: Working endpoint, test coverage
- [ ] EM-2 (Upload Screen) - Requires: UI mockup approval, validation logic
- [ ] EM-3 (Result Screen) - Requires: All 3 status types displayed correctly
- [ ] EM-4 (Landing Page) - Requires: Content review, no guardrail violations
- [ ] EM-5 (Testing) - Requires: All test cases passed, cross-browser verified
- [ ] EM-6 (Deployment) - Requires: Documentation complete, production ready

### Final Phase 2 Acceptance
- [ ] All 6 milestones approved
- [ ] All acceptance criteria met
- [ ] All guardrails verified
- [ ] Documentation published
- [ ] No critical bugs
- [ ] User guide reviewed

**Phase 2 Complete:** Ready for public launch (feature-flagged until Genesis)

---

## APPENDIX A: SAMPLE CERTIFICATE FORMATS

### Real Certificate (Post-Genesis)
```json
{
  "version": "1.0.0",
  "namespace": "sovereign.x",
  "tier": "Legendary",
  "issued_at": "2026-01-14T23:59:00Z",
  "ipfs_cid": "QmXGZjTjEaB5BvXPL8Z8Xx7sXhZx9k3hZxYz",
  "certificate_hash": "0x3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea",
  "signature": "0xABCDEF123456...[Dilithium5 signature]",
  "genesis_timestamp": "2026-01-15T00:00:00Z",
  "protocol_version": "1.0.0",
  "is_simulation": false
}
```

### Practice Certificate
```json
{
  "version": "1.0.0",
  "namespace": "example.x",
  "tier": "Rare",
  "issued_at": "2026-01-03T10:00:00Z",
  "ipfs_cid": "QmPRACTICE3f79bb7b435b05321651daefd374",
  "certificate_hash": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
  "signature": "MOCK_SIGNATURE_DATA_FOR_PRACTICE_MODE_ONLY_NOT_VALID",
  "genesis_timestamp": "2026-01-15T00:00:00Z",
  "protocol_version": "1.0.0",
  "is_simulation": true
}
```

---

## APPENDIX B: ERROR MESSAGES

### Client-Side Errors
- **Invalid JSON:** "Unable to parse JSON. Please check syntax and try again."
- **Missing Fields:** "Certificate is missing required field: {field_name}"
- **File Too Large:** "Certificate file exceeds 10 KB limit. Please verify file size."
- **Invalid File Type:** "Only .json files are accepted. Please upload a JSON certificate."

### Server-Side Errors
- **Verification Failed:** "Certificate verification failed: {specific_error}"
- **Rate Limit Exceeded:** "Too many verification requests. Please try again in 1 minute."
- **Server Error:** "Verification service temporarily unavailable. Please try again later."
- **Invalid Certificate Format:** "Certificate does not match expected schema version {version}"

### Warning Messages
- **Simulation Detected:** "This is a practice certificate from Practice Mode. It is NOT a real certificate."
- **Expired Genesis:** "Certificate issued after Genesis finalization (2026-01-15). Invalid issuance window."
- **Tampered Hash:** "Certificate hash does not match computed hash. Certificate may be tampered."
- **Invalid Signature:** "Dilithium5 signature verification failed. Certificate is not authentic."

---

**END OF SPECIFICATION**

**Next Steps:**
1. Review and approve specification
2. Begin EM-1 (Backend Verifier API)
3. Checkpoint after each milestone
4. Full acceptance testing before Genesis
5. Deploy to production (feature-flagged)

**Contact:** Y3K Digital  
**Repository:** sovereign-namespace-protocol  
**Phase:** 2 of 3 (Practice Mode → **Explorer/Verifier** → Real Issuance)
