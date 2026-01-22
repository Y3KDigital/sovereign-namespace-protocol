# Claims Registry Specification

## Problem
Currently, namespace claims are only stored in client-side localStorage. There is no:
- Centralized record of who claimed what
- Way to verify claims across devices
- Prevention of duplicate claims
- Audit trail for Genesis Event

## Solution: Cloudflare KV Claims Registry

### Data Structure
```typescript
interface ClaimRecord {
  namespace: string;
  claimedBy: {
    publicKey: string; // Ed25519 public key (hex)
    biometricId?: string; // Hardware fingerprint
  };
  claimedAt: string; // ISO timestamp
  certificates: string[]; // List of sub-certificates
  ipfsCid: string; // Certificate storage location
  signature: string; // Claim signature
  tier: string;
  rarity: string;
  status: 'CLAIMED' | 'RESERVED' | 'REVOKED';
}
```

### KV Schema
- **Key**: `claim:{namespace}` (e.g., `claim:brad.x`)
- **Value**: JSON-serialized ClaimRecord
- **Metadata**: { claimedAt, claimedBy }

### API Endpoints

#### 1. Record Claim (POST /api/claim/register)
```typescript
// Called after successful certificate signing
{
  token: string,
  publicKey: Uint8Array,
  signature: Uint8Array,
  ipfsCid: string
}

// Response
{
  success: boolean,
  claimId: string,
  registryUrl: string
}
```

#### 2. Check Claim Status (GET /api/claim/status?namespace=brad.x)
```typescript
// Response
{
  claimed: boolean,
  claimedAt?: string,
  claimedBy?: string, // Partial public key for privacy
  ipfsCid?: string
}
```

#### 3. List All Claims (GET /api/claim/registry)
```typescript
// Response
{
  total: 20,
  claimed: 7,
  available: 13,
  claims: [
    { namespace: 'brad.x', claimedAt: '2026-01-15T...' },
    { namespace: '45.x', claimedAt: '2026-01-15T...' },
    ...
  ]
}
```

#### 4. Verify Claim (POST /api/claim/verify)
```typescript
// Verify ownership via signature challenge
{
  namespace: string,
  publicKey: Uint8Array,
  signature: Uint8Array,
  challenge: string
}
```

### Cloudflare Worker Implementation

```typescript
// functions/api/claim/register.ts
export async function onRequestPost(context: any) {
  const { token, publicKey, signature, ipfsCid } = await context.request.json();
  
  // Validate token exists
  const VALID_TOKENS = { /* existing validation */ };
  if (!VALID_TOKENS[token]) {
    return Response.json({ error: 'Invalid token' }, { status: 400 });
  }
  
  const claimData = VALID_TOKENS[token];
  const namespace = claimData.namespace;
  
  // Check if already claimed
  const existingClaim = await context.env.CLAIMS_KV.get(`claim:${namespace}`);
  if (existingClaim) {
    return Response.json({ 
      error: 'Namespace already claimed',
      claimedAt: JSON.parse(existingClaim).claimedAt 
    }, { status: 409 });
  }
  
  // Create claim record
  const claimRecord: ClaimRecord = {
    namespace,
    claimedBy: {
      publicKey: Buffer.from(publicKey).toString('hex'),
    },
    claimedAt: new Date().toISOString(),
    certificates: claimData.certificates,
    ipfsCid,
    signature: Buffer.from(signature).toString('hex'),
    tier: claimData.tier,
    rarity: claimData.rarity,
    status: 'CLAIMED'
  };
  
  // Store in KV
  await context.env.CLAIMS_KV.put(
    `claim:${namespace}`,
    JSON.stringify(claimRecord),
    {
      metadata: {
        claimedAt: claimRecord.claimedAt,
        tier: claimData.tier
      }
    }
  );
  
  // Ring the ceremony bell
  await ringCeremonyBell(namespace, claimData.displayName);
  
  return Response.json({
    success: true,
    claimId: `claim:${namespace}`,
    registryUrl: `https://y3kmarkets.com/registry/${namespace}`
  });
}
```

### Configuration

#### wrangler.toml
```toml
[[kv_namespaces]]
binding = "CLAIMS_KV"
id = "your-kv-namespace-id"
```

#### Setup Commands
```bash
# Create KV namespace
npx wrangler kv:namespace create "CLAIMS_KV"

# Bind to production
npx wrangler pages deployment tail y3kmarkets
```

### Migration Plan

1. **Create KV Namespace** (5 min)
2. **Deploy Registry Endpoints** (30 min)
3. **Update Claim Flow** to call `/api/claim/register` (15 min)
4. **Build Registry Dashboard** at `/registry` (1 hour)
5. **Backfill Known Claims** (if any) (15 min)

### Privacy Considerations

- **Public Data**: namespace, claimedAt (date only), tier
- **Private Data**: Full public key (only show first 8 chars publicly)
- **Verification**: Requires signature challenge to prove ownership

### Benefits

✅ **Prevent Double Claims**: KV enforces uniqueness
✅ **Cross-Device Verification**: Check claims from any device
✅ **Public Registry**: Transparent Genesis Event tracking
✅ **Audit Trail**: Immutable timestamp records
✅ **No Backend Needed**: Pure edge workers
✅ **Global Replication**: Cloudflare's 300+ data centers

### Cost
- **Cloudflare KV**: Free tier includes 100K reads/day, 1K writes/day
- **Expected Usage**: ~20 writes (claims), ~1000 reads/day (status checks)
- **Cost**: $0 (within free tier)

## Next Steps

Want me to implement this? I can have the registry live in ~1 hour with:
1. KV namespace creation
2. Registration endpoint
3. Status/list endpoints  
4. Public registry page at `/registry`
5. Update claim flow to record claims

This will give you real-time visibility into who has claimed their Web3 space.
