# Protocol Console Implementation Guide
## From Schema to Screen

**Companion to**: PROTOCOL_CONSOLE_STANDARD.md  
**For**: Developers implementing Protocol Consoles

---

## Quick Start

Every Web3 object needs exactly one file:

```
objects/
  777.yaml          # The object definition
  1-tron.yaml       # Another object
  vault-777.yaml    # Another object
```

Every object renders to the same UI.

---

## Step 1: Define Your Object

Create `objects/[id].yaml`:

```yaml
# Object identity
object_type: namespace  # chain | vault | asset | agent | namespace
canonical_id: "777.y3k"
display_name: "Genesis Root 777"
description: "SOVEREIGN NAMESPACE • Genesis Root"

# Authority
authority:
  entity: "Y3K Protocol"
  context: "Genesis Root Lock"
  verification: verified  # verified | unverified | contested

# QR Configuration
qr:
  protocol: "y3k"
  payload: "y3k://777"
  fallback_url: "https://y3k.xyz/777"
  encoding: protocol-native  # protocol-native | descriptor | resolver
  size: large  # small | medium | large

# Actions (max 5)
actions:
  - id: send_payment
    label: "Send Payment"
    enabled: true
    endpoint: "/api/payment/create"
    
  - id: mint_nft
    label: "Mint NFT"
    enabled: false
    disabled_reason: "Genesis period active"
    
  - id: verify_tx
    label: "Verify Transaction"
    enabled: true
    endpoint: "/api/verify"

# State blocks (infrastructure metrics only)
state:
  - label: "Total Supply"
    value: 900
    unit: "roots"
    
  - label: "Price"
    value: 29
    unit: "USD"
    format: currency
    
  - label: "Range"
    value: "100-999"
    
  - label: "Available"
    value: 847
    unit: "roots"

# Metadata (optional)
metadata:
  created: 2025-12-15T00:00:00Z
  chain: ethereum
  contract: "0x..."
  ipfs_hash: "Qm..."
```

---

## Step 2: Render with Standard Component

### React Component

```typescript
// components/ProtocolConsole.tsx
import { ObjectSchema } from '@/types/protocol';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  object: ObjectSchema;
}

export function ProtocolConsole({ object }: Props) {
  return (
    <div className="protocol-console">
      {/* 1. Identity Header */}
      <header className="identity-header">
        <h1 className="canonical-id">{object.canonical_id}</h1>
        <p className="type-badge">
          {object.display_name}
        </p>
        {object.authority.verification === 'verified' && (
          <p className="authority">
            ✓ Verified by {object.authority.entity}
          </p>
        )}
      </header>

      {/* 2. QR Primary Interface */}
      <div className="qr-interface">
        <QRCodeSVG 
          value={object.qr.payload}
          size={256}
          level="H"
        />
        <p className="qr-instruction">Scan to interact</p>
        <p className="qr-fallback">
          Fallback: <a href={object.qr.fallback_url}>
            {object.qr.fallback_url}
          </a>
        </p>
      </div>

      {/* 3. Deterministic Actions */}
      <div className="actions">
        {object.actions.map(action => (
          <button
            key={action.id}
            disabled={!action.enabled}
            title={action.disabled_reason}
            onClick={() => handleAction(action)}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* 4. State Blocks */}
      <div className="state-grid">
        {object.state.map((stat, i) => (
          <div key={i} className="state-block">
            <span className="state-label">{stat.label}</span>
            <span className="state-value">
              {formatValue(stat)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Standard CSS

```css
/* styles/protocol-console.css */

.protocol-console {
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem;
  background: #000;
  color: #fff;
  font-family: 'SF Mono', monospace;
}

/* 1. Identity Header */
.identity-header {
  text-align: center;
  margin-bottom: 3rem;
  border-bottom: 1px solid #333;
  padding-bottom: 1.5rem;
}

.canonical-id {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem 0;
}

.type-badge {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
  margin: 0 0 0.5rem 0;
}

.authority {
  font-size: 0.875rem;
  color: #00ff00;
  margin: 0;
}

/* 2. QR Interface */
.qr-interface {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
}

.qr-interface svg {
  display: block;
  margin: 0 auto 1rem auto;
}

.qr-instruction {
  font-size: 0.875rem;
  color: #000;
  margin: 1rem 0 0.5rem 0;
}

.qr-fallback {
  font-size: 0.75rem;
  color: #666;
  margin: 0;
}

.qr-fallback a {
  color: #0066cc;
  text-decoration: none;
}

/* 3. Actions */
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 3rem;
}

.actions button {
  padding: 1rem;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 0.15s ease;
}

.actions button:hover:not(:disabled) {
  background: #f0f0f0;
}

.actions button:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}

/* 4. State Grid */
.state-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.state-block {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #111;
  border: 1px solid #333;
  border-radius: 4px;
}

.state-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  margin-bottom: 0.5rem;
}

.state-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}
```

---

## Step 3: Dynamic Route (Optional)

If you want dynamic object rendering:

```typescript
// app/object/[id]/page.tsx
import { ProtocolConsole } from '@/components/ProtocolConsole';
import { loadObject } from '@/lib/objects';

export default async function ObjectPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const object = await loadObject(params.id);
  
  if (!object) {
    return <div>Object not found</div>;
  }
  
  return <ProtocolConsole object={object} />;
}

// Generate static pages for all objects
export async function generateStaticParams() {
  const objects = await getAllObjects();
  return objects.map(obj => ({ id: obj.canonical_id }));
}
```

---

## Step 4: Object Loader

```typescript
// lib/objects.ts
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { ObjectSchema } from '@/types/protocol';

const OBJECTS_DIR = path.join(process.cwd(), 'objects');

export async function loadObject(id: string): Promise<ObjectSchema | null> {
  try {
    const filePath = path.join(OBJECTS_DIR, `${id}.yaml`);
    const content = await fs.readFile(filePath, 'utf-8');
    return yaml.load(content) as ObjectSchema;
  } catch (error) {
    return null;
  }
}

export async function getAllObjects(): Promise<ObjectSchema[]> {
  const files = await fs.readdir(OBJECTS_DIR);
  const yamlFiles = files.filter(f => f.endsWith('.yaml'));
  
  const objects = await Promise.all(
    yamlFiles.map(f => loadObject(f.replace('.yaml', '')))
  );
  
  return objects.filter(Boolean) as ObjectSchema[];
}
```

---

## Type Definitions

```typescript
// types/protocol.ts
export type ObjectType = 
  | 'chain' 
  | 'vault' 
  | 'asset' 
  | 'agent' 
  | 'namespace';

export type VerificationStatus = 
  | 'verified' 
  | 'unverified' 
  | 'contested';

export type QREncoding = 
  | 'protocol-native' 
  | 'descriptor' 
  | 'resolver';

export interface ObjectSchema {
  object_type: ObjectType;
  canonical_id: string;
  display_name: string;
  description: string;
  
  authority: {
    entity: string;
    context: string;
    verification: VerificationStatus;
  };
  
  qr: {
    protocol: string;
    payload: string;
    fallback_url: string;
    encoding: QREncoding;
    size?: 'small' | 'medium' | 'large';
  };
  
  actions: Action[];
  state: StatBlock[];
  metadata?: Record<string, any>;
}

export interface Action {
  id: string;
  label: string;
  enabled: boolean;
  disabled_reason?: string;
  endpoint?: string;
}

export interface StatBlock {
  label: string;
  value: string | number;
  unit?: string;
  format?: 'currency' | 'percentage' | 'number';
}
```

---

## Validation Rules

```typescript
// lib/validate-object.ts
export function validateObject(obj: ObjectSchema): string[] {
  const errors: string[] = [];
  
  // Max 5 actions
  if (obj.actions.length > 5) {
    errors.push('Maximum 5 actions allowed');
  }
  
  // QR payload required
  if (!obj.qr.payload) {
    errors.push('QR payload is required');
  }
  
  // Authority must be verified or explicitly unverified
  if (!['verified', 'unverified', 'contested'].includes(obj.authority.verification)) {
    errors.push('Invalid verification status');
  }
  
  // State blocks should be infrastructure metrics only
  const bannedLabels = [
    'users', 'followers', 'likes', 'shares', 
    'growth', 'testimonials', 'press'
  ];
  
  obj.state.forEach(stat => {
    if (bannedLabels.some(banned => 
      stat.label.toLowerCase().includes(banned)
    )) {
      errors.push(`Banned state label: ${stat.label}`);
    }
  });
  
  return errors;
}
```

---

## Testing Your Console

```typescript
// __tests__/protocol-console.test.ts
import { render, screen } from '@testing-library/react';
import { ProtocolConsole } from '@/components/ProtocolConsole';

const mockObject: ObjectSchema = {
  object_type: 'namespace',
  canonical_id: '777.y3k',
  display_name: 'Genesis Root 777',
  description: 'SOVEREIGN NAMESPACE',
  authority: {
    entity: 'Y3K Protocol',
    context: 'Genesis Root Lock',
    verification: 'verified'
  },
  qr: {
    protocol: 'y3k',
    payload: 'y3k://777',
    fallback_url: 'https://y3k.xyz/777',
    encoding: 'protocol-native'
  },
  actions: [
    { id: 'pay', label: 'Send Payment', enabled: true }
  ],
  state: [
    { label: 'Supply', value: 900 }
  ]
};

describe('ProtocolConsole', () => {
  it('renders identity header', () => {
    render(<ProtocolConsole object={mockObject} />);
    expect(screen.getByText('777.y3k')).toBeInTheDocument();
    expect(screen.getByText(/Verified by/)).toBeInTheDocument();
  });
  
  it('renders QR code', () => {
    render(<ProtocolConsole object={mockObject} />);
    expect(screen.getByText('Scan to interact')).toBeInTheDocument();
  });
  
  it('renders actions', () => {
    render(<ProtocolConsole object={mockObject} />);
    expect(screen.getByText('Send Payment')).toBeInTheDocument();
  });
  
  it('renders state blocks', () => {
    render(<ProtocolConsole object={mockObject} />);
    expect(screen.getByText('Supply')).toBeInTheDocument();
    expect(screen.getByText('900')).toBeInTheDocument();
  });
});
```

---

## Multi-Surface Rendering

### Mobile App (React Native)

Same schema, different renderer:

```typescript
// mobile/ProtocolConsole.tsx
import { QRCode } from 'react-native-qrcode-svg';

export function ProtocolConsole({ object }) {
  return (
    <View style={styles.console}>
      <View style={styles.header}>
        <Text style={styles.canonicalId}>{object.canonical_id}</Text>
        <Text style={styles.typeBadge}>{object.display_name}</Text>
      </View>
      
      <View style={styles.qrContainer}>
        <QRCode value={object.qr.payload} size={200} />
        <Text style={styles.qrInstruction}>Tap to share</Text>
      </View>
      
      {object.actions.map(action => (
        <TouchableOpacity 
          key={action.id}
          disabled={!action.enabled}
          onPress={() => handleAction(action)}
        >
          <Text>{action.label}</Text>
        </TouchableOpacity>
      ))}
      
      <View style={styles.stateGrid}>
        {object.state.map((stat, i) => (
          <View key={i} style={styles.statBlock}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
```

### CLI Renderer

```bash
$ uny object 777.y3k

┌─────────────────────────────────────┐
│ 777.y3k                             │
│ SOVEREIGN NAMESPACE • Genesis Root  │
│ ✓ Y3K Protocol                      │
├─────────────────────────────────────┤
│ QR: y3k://777                       │
│     (scan with mobile app)          │
├─────────────────────────────────────┤
│ 1. Send Payment                     │
│ 2. Mint NFT [disabled]              │
│ 3. Verify Transaction               │
├─────────────────────────────────────┤
│ Supply:   900  | Price: $29         │
│ Range: 100-999 | Available: 847     │
└─────────────────────────────────────┘

Select action [1-3]:
```

---

## The Promise

With this system:

1. Define object once (YAML)
2. Renders everywhere (web, mobile, CLI, kiosk)
3. Same UX, different transport
4. No duplication, no drift

**Infrastructure thinking.**

---

## Reference Implementation

See: `/mint` page in y3k-markets-web

This is the canonical example.

When in doubt, look at what we already built correctly.
