// Blockchain Registry API Client
// Connects Next.js frontend to Rust uny-korn-l1 blockchain

export interface NamespaceRegistration {
  name: string;
  controller: string; // Ed25519 public key hex
  metadata_hash?: string; // IPFS CID
}

export interface RegistrationResponse {
  success: boolean;
  namespace: string;
  commitment_hash: string; // Blockchain state root
  error?: string;
}

export interface QueryResponse {
  exists: boolean;
  namespace?: {
    name: string;
    controller: string;
    metadata_hash?: string;
  };
}

/**
 * Register a namespace on the blockchain
 * This enforces uniqueness at the protocol layer
 */
export async function registerNamespace(
  registration: NamespaceRegistration
): Promise<RegistrationResponse> {
  const BLOCKCHAIN_API = process.env.NEXT_PUBLIC_BLOCKCHAIN_API || process.env.BLOCKCHAIN_API_URL || 'http://127.0.0.1:3333';
  
  const response = await fetch(`${BLOCKCHAIN_API}/api/blockchain/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registration)
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      namespace: registration.name,
      commitment_hash: '',
      error: error.message || 'Registration failed'
    };
  }

  return await response.json();
}

/**
 * Check if namespace exists on blockchain
 */
export async function checkNamespace(namespace: string): Promise<QueryResponse> {
  const BLOCKCHAIN_API = process.env.NEXT_PUBLIC_BLOCKCHAIN_API || process.env.BLOCKCHAIN_API_URL || 'http://127.0.0.1:3333';
  
  const response = await fetch(`${BLOCKCHAIN_API}/api/blockchain/check/${namespace}`);
  
  if (!response.ok) {
    return { exists: false };
  }

  return await response.json();
}

/**
 * Get all registered namespaces
 */
export async function listNamespaces(): Promise<string[]> {
  const BLOCKCHAIN_API = process.env.NEXT_PUBLIC_BLOCKCHAIN_API || process.env.BLOCKCHAIN_API_URL || 'http://127.0.0.1:3333';
  
  const response = await fetch(`${BLOCKCHAIN_API}/api/blockchain/list`);
  const data = await response.json();
  
  return data.namespaces || [];
}
