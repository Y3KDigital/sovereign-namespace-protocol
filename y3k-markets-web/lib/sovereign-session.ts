// Y3K Sovereign Session State Machine
// The canonical object that unifies namespace claims, token issuance, and operator experience

export type SessionStatus = 
  | 'INVITED'      // Selection phase - no financial actions
  | 'CLAIMED'      // Namespace claimed - awaiting AI/human review
  | 'ISSUED'       // Token issued on Stellar - architect visibility only
  | 'ACTIVE'       // Trustline enabled - public trading allowed
  | 'DENIED'       // Explicitly rejected
  | 'SUSPENDED';   // Temporarily disabled

export type AIVerdict = 'APPROVE' | 'REVIEW' | 'DENY';

export type OperatorMode = 
  | 'OBSERVER'     // Read-only access
  | 'LIVE_FIRE'    // Full execution authority
  | 'ARCHITECT';   // System-level control

export interface StellarAsset {
  chain: 'STELLAR';
  asset_code: string;        // Derived from namespace (e.g., "ELON")
  issuer_public_key: string; // Stellar issuer address
  supply: string;            // Total supply issued
  tx_hash?: string;          // Issuance transaction hash
  stellar_expert_url?: string;
}

export interface XRPLToken {
  chain: 'XRPL';
  currency: string;          // Usually "Y3K"
  issuer: string;            // XRPL issuer address (e.g., rKNvud9D...)
  trustline_status: 'NONE' | 'PENDING' | 'ACTIVE' | 'FAILED';
  trustline_tx?: string;     // Trustline establishment tx hash
  balance?: string;          // Current balance (if trustline active)
}

export interface AuditRecord {
  approved_by: 'HUMAN' | 'AI' | 'SYSTEM';
  approver_identity?: string;
  timestamp: string;
  notes?: string;
}

export interface SovereignSession {
  // Core Identity
  session_id: string;        // Format: Y3K-{number}-{asset}-{date}
  namespace: string;         // e.g., "333.x"
  
  // Identity Target (ceremonial/narrative)
  identity_target?: string;  // e.g., "Donald J. Trump" (who this represents)
  operator_mode: OperatorMode;
  
  // State
  status: SessionStatus;
  ai_verdict?: AIVerdict;
  ai_reasoning?: string;
  
  // Blockchain Assets
  stellar_asset?: StellarAsset;
  xrpl_token?: XRPLToken;
  
  // Cryptographic Proof
  controller: string;        // Ed25519 public key (32 bytes hex)
  ipfs_certificate?: string; // IPFS CID of signed certificate
  
  // Audit Trail
  audit: {
    created_at: string;
    claimed_at?: string;
    reviewed_at?: string;
    issued_at?: string;
    activated_at?: string;
    approved_by?: AuditRecord;
  };
  
  // Metadata
  metadata?: {
    description?: string;
    tags?: string[];
    external_links?: Record<string, string>;
  };
}

// State Transition Rules (enforced invariants)
export const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  INVITED: ['CLAIMED', 'DENIED'],
  CLAIMED: ['ISSUED', 'DENIED'],
  ISSUED: ['ACTIVE', 'SUSPENDED', 'DENIED'],
  ACTIVE: ['SUSPENDED'],
  SUSPENDED: ['ACTIVE', 'DENIED'],
  DENIED: [], // Terminal state
};

// Capability Matrix - what's visible/allowed per status
export const CAPABILITIES: Record<SessionStatus, {
  show_namespace: boolean;
  show_stellar_asset: boolean;
  show_xrpl_token: boolean;
  allow_trustline: boolean;
  allow_trading: boolean;
  show_explorer_links: boolean;
  show_ceremony_text: boolean;
}> = {
  INVITED: {
    show_namespace: false,
    show_stellar_asset: false,
    show_xrpl_token: false,
    allow_trustline: false,
    allow_trading: false,
    show_explorer_links: false,
    show_ceremony_text: true,
  },
  CLAIMED: {
    show_namespace: true,
    show_stellar_asset: false,
    show_xrpl_token: false,
    allow_trustline: false,
    allow_trading: false,
    show_explorer_links: false,
    show_ceremony_text: true,
  },
  ISSUED: {
    show_namespace: true,
    show_stellar_asset: true,      // ARCHITECT only
    show_xrpl_token: false,
    allow_trustline: false,         // Not yet public
    allow_trading: false,
    show_explorer_links: true,      // ARCHITECT only
    show_ceremony_text: true,
  },
  ACTIVE: {
    show_namespace: true,
    show_stellar_asset: true,
    show_xrpl_token: true,
    allow_trustline: true,          // PUBLIC - trustline buttons visible
    allow_trading: true,            // DEX links enabled
    show_explorer_links: true,
    show_ceremony_text: true,
  },
  DENIED: {
    show_namespace: true,
    show_stellar_asset: false,
    show_xrpl_token: false,
    allow_trustline: false,
    allow_trading: false,
    show_explorer_links: false,
    show_ceremony_text: false,
  },
  SUSPENDED: {
    show_namespace: true,
    show_stellar_asset: true,
    show_xrpl_token: true,
    allow_trustline: false,         // Frozen - no new trustlines
    allow_trading: false,           // Trading disabled
    show_explorer_links: true,
    show_ceremony_text: false,
  },
};

// Example Session Lifecycle
export const EXAMPLE_SESSION: SovereignSession = {
  session_id: 'Y3K-333-ELON-20260120',
  namespace: '333.x',
  identity_target: 'Elon Musk',
  operator_mode: 'LIVE_FIRE',
  status: 'ISSUED',
  ai_verdict: 'APPROVE',
  ai_reasoning: 'High-value namespace, legitimate claim, no conflicts',
  
  stellar_asset: {
    chain: 'STELLAR',
    asset_code: 'ELON',
    issuer_public_key: 'GCRP6UEZO6S6AFSHEZVCMVPZ3D5QWXYZ...',
    supply: '1000000',
    tx_hash: 'abc123...',
    stellar_expert_url: 'https://stellar.expert/explorer/public/asset/ELON-G...',
  },
  
  xrpl_token: {
    chain: 'XRPL',
    currency: 'Y3K',
    issuer: 'rKNvud9D3yDhLvqEZpu7MZPSVh3dLzaGAd',
    trustline_status: 'NONE', // Not yet activated
  },
  
  controller: '0x1234567890abcdef...',
  ipfs_certificate: 'QmXXX...',
  
  audit: {
    created_at: '2026-01-20T10:00:00Z',
    claimed_at: '2026-01-20T10:05:00Z',
    reviewed_at: '2026-01-20T10:10:00Z',
    issued_at: '2026-01-20T10:15:00Z',
    approved_by: {
      approved_by: 'HUMAN',
      approver_identity: 'Kevan (ARCHITECT)',
      timestamp: '2026-01-20T10:10:00Z',
      notes: 'First controlled mainnet issuance - symbolic proof',
    },
  },
};
