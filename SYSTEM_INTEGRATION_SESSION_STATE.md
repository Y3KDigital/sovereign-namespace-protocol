// Integration: How existing systems connect to Sovereign Session State Machine

## System Integration Map

### A) Y3K Listener → Session Creation

**Location:** `y3k-listener/index.js` (port 3005)

**When namespace claim received:**

```javascript
// BEFORE (disconnected)
const claim = {
  namespace,
  controller,
  status: 'PENDING',
  ai_decision: null
};
claims.push(claim);

// AFTER (connected to session)
const sessionId = `Y3K-${namespace.replace('.x', '')}-${Date.now()}`;

const session = {
  session_id: sessionId,
  namespace,
  controller,
  operator_mode: 'OBSERVER', // Default for public claims
  status: 'CLAIMED',
  ipfs_certificate: ipfsCid,
  audit: {
    created_at: new Date().toISOString(),
    claimed_at: new Date().toISOString()
  }
};

// POST to session API
await fetch('http://localhost:3000/api/session', {
  method: 'POST',
  body: JSON.stringify(session)
});
```

**AI Decision Updates:**
```javascript
// After AI evaluates claim
await fetch(`http://localhost:3000/api/session/${sessionId}`, {
  method: 'PUT',
  body: JSON.stringify({
    ai_verdict: 'APPROVE',
    ai_reasoning: 'High-value namespace, legitimate claim',
    audit: {
      reviewed_at: new Date().toISOString()
    }
  })
});
```

---

### B) Human Approval → Session Transition

**Location:** `Y3KIssuance.psm1` → `Approve-Namespace`

**After successful issuance:**

```powershell
# Current: Updates local claim file
# New: Updates session state

$sessionId = "Y3K-$($Namespace.Replace('.x', ''))-$(Get-Date -Format 'yyyyMMdd')"

$updateBody = @{
  status = "ISSUED"
  stellar_asset = @{
    chain = "STELLAR"
    asset_code = $assetCode
    issuer_public_key = $issuerPublicKey
    supply = $supply
    tx_hash = $txHash
    stellar_expert_url = "https://stellar.expert/explorer/public/tx/$txHash"
  }
  audit = @{
    issued_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    approved_by = @{
      approved_by = "HUMAN"
      approver_identity = $env:USERNAME
      timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
      notes = "Controlled mainnet issuance"
    }
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/api/session/$sessionId" `
  -Method PUT `
  -Body $updateBody `
  -ContentType "application/json"
```

---

### C) XRPL Banking System → Financial Permissions

**Location:** XRPL AI banking service

**Role:** Advises on financial actions, does NOT control identity/issuance

```javascript
// Query session state BEFORE allowing trustline
const session = await fetch(`http://localhost:3000/api/session/${sessionId}`).then(r => r.json());

if (session.status !== 'ACTIVE') {
  return {
    allowed: false,
    reason: 'Trustline not yet activated - session must be ACTIVE status'
  };
}

// If ACTIVE, provide trustline recommendation
return {
  allowed: true,
  recommendation: 'APPROVE',
  confidence: 0.95,
  reasoning: 'Session active, asset issued, risk acceptable'
};
```

**Separation of Concerns:**
- ❌ XRPL system does NOT create namespaces
- ❌ XRPL system does NOT approve issuance
- ✅ XRPL system ONLY governs financial permissions
- ✅ XRPL system reads session state as input

---

### D) HUB UI → State-Aware Rendering

**Location:** `app/hub/333/page.tsx`

**Complete gating logic:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import type { SovereignSession } from '@/lib/sovereign-session';
import { CAPABILITIES } from '@/lib/sovereign-session';

export default function HubPage({ params }: { params: { number: string } }) {
  const [session, setSession] = useState<SovereignSession | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const sessionId = `Y3K-${params.number}-ELON-20260120`; // Derive from URL
    
    fetch(`/api/session/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.number]);
  
  if (loading) return <div>Loading...</div>;
  if (!session) return <div>Session not found</div>;
  
  // Get capabilities for current status
  const caps = CAPABILITIES[session.status];
  
  return (
    <div>
      {/* Ceremony text - always visible */}
      {caps.show_ceremony_text && (
        <CeremonyPhase session={session} />
      )}
      
      {/* Namespace info */}
      {caps.show_namespace && (
        <div>
          <h2>Namespace: {session.namespace}</h2>
          <p>Status: {session.status}</p>
        </div>
      )}
      
      {/* Stellar asset - only if issued */}
      {caps.show_stellar_asset && session.stellar_asset && (
        <div>
          <h3>Asset: {session.stellar_asset.asset_code}</h3>
          <p>Issuer: {session.stellar_asset.issuer_public_key}</p>
          {caps.show_explorer_links && (
            <a href={session.stellar_asset.stellar_expert_url}>View on Explorer</a>
          )}
        </div>
      )}
      
      {/* XRPL token info - only if active */}
      {caps.show_xrpl_token && session.xrpl_token && (
        <div>
          <h3>Y3K Token</h3>
          <p>Currency: {session.xrpl_token.currency}</p>
          <p>Trustline: {session.xrpl_token.trustline_status}</p>
        </div>
      )}
      
      {/* Trustline button - ONLY if ACTIVE status */}
      {caps.allow_trustline && (
        <button onClick={handleAddTrustline}>
          Add Y3K Trust Line
        </button>
      )}
      
      {/* DEX links - ONLY if ACTIVE status */}
      {caps.allow_trading && (
        <div>
          <a href="https://xrpl.to">Trade on DEX</a>
          <a href={`xumm://`}>Open in XUMM</a>
        </div>
      )}
    </div>
  );
}

// Ceremony text adapts to status
function CeremonyPhase({ session }: { session: SovereignSession }) {
  switch (session.status) {
    case 'INVITED':
      return <div>You've been selected. Await claim instructions.</div>;
    
    case 'CLAIMED':
      return <div>Namespace claimed. AI review in progress.</div>;
    
    case 'ISSUED':
      return (
        <div>
          <p>Asset issued on Stellar mainnet.</p>
          <p>Awaiting public activation by ARCHITECT.</p>
        </div>
      );
    
    case 'ACTIVE':
      return (
        <div>
          <p>Protocol 77 ACTIVE - Live Fire authorized.</p>
          <p>Trustline and trading enabled.</p>
        </div>
      );
    
    case 'DENIED':
      return <div>Access denied. Session terminated.</div>;
    
    default:
      return null;
  }
}
```

**Key Insight:**
> **The UI reads state. It does not create it.**

Every button, every link, every piece of text is **conditional on `session.status`**.

---

## State Transition Diagram

```
INVITED
  ↓ (user claims)
CLAIMED
  ↓ (AI reviews)
  ↓ (human approves)
ISSUED ← **ARCHITECT visibility only**
  ↓ (architect activates)
ACTIVE ← **PUBLIC trading enabled**
  ↓ (if needed)
SUSPENDED
```

**Critical Gates:**
- `CLAIMED → ISSUED`: Requires human approval (PowerShell)
- `ISSUED → ACTIVE`: Requires ARCHITECT authorization (manual decision)
- `ACTIVE`: Only state where trustline/trading buttons appear

---

## Immediate Implementation Checklist

### 1. Y3K Listener Integration
- [ ] Add session creation on claim
- [ ] POST to `/api/session`
- [ ] Update AI decision via PUT

### 2. PowerShell Module Integration
- [ ] Generate `session_id` in `Approve-Namespace`
- [ ] PUT session update after issuance
- [ ] Include tx_hash in update

### 3. UI Gating
- [ ] Load session from `/api/session/{id}`
- [ ] Use `CAPABILITIES` matrix for conditional rendering
- [ ] Remove hardcoded token info
- [ ] Gate trustline buttons on `status === 'ACTIVE'`

### 4. XRPL Banking Integration
- [ ] Query session before approving trustlines
- [ ] Reject if `status !== 'ACTIVE'`
- [ ] Return advisory only (no execution authority)

---

## What This Fixes

### Before (disconnected):
- Claims in JSON file
- Tokens issued separately
- UI shows everything always
- No state coordination
- Premature financial claims

### After (unified):
- Single source of truth (`SovereignSession`)
- All systems read from `/api/session/{id}`
- UI adapts to status automatically
- Clear phase gates
- No premature trading enabled

---

## Next Steps (Pick One)

**Option A:** Integrate Y3K Listener with session creation
**Option B:** Update PowerShell module to write session state
**Option C:** Build state-aware HUB UI component

**ONLY ONE.** No expansion. Systems-first, not marketing-first.
