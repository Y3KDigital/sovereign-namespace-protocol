// Dashboard Wallet Tile - Ledger Integration
// Path: y3k-markets-web/lib/ledger-client.ts

const LEDGER_API = process.env.NEXT_PUBLIC_LEDGER_API || 'http://localhost:8088';

export interface Balance {
  asset: string;
  account: string;
  balance_wei: string;
}

export interface Asset {
  symbol: string;
  decimals: number;
  policy_uri: string | null;
}

/**
 * Fetch balances for an account
 * @param account - Ledger account identifier (e.g., "acct:user:demo")
 */
export async function getBalances(account: string): Promise<Balance[]> {
  const url = `${LEDGER_API}/balances?account=${encodeURIComponent(account)}`;
  
  const res = await fetch(url, {
    cache: 'no-store',
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch balances: ${res.statusText}`);
  }

  return res.json();
}

/**
 * List all registered assets
 */
export async function getAssets(): Promise<Asset[]> {
  const url = `${LEDGER_API}/assets`;
  
  const res = await fetch(url, {
    cache: 'no-store',
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch assets: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get audit hash (current system state)
 */
export async function getAuditHash(): Promise<{ scope: string; hash_hex: string }> {
  const url = `${LEDGER_API}/audit`;
  
  const res = await fetch(url, {
    cache: 'no-store',
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch audit hash: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Format balance from wei to human-readable
 * @param balance_wei - Balance as string (18 decimals)
 * @param decimals - Asset decimals (default 18)
 */
export function formatBalance(balance_wei: string, decimals: number = 18): string {
  const value = BigInt(balance_wei);
  const divisor = BigInt(10 ** decimals);
  
  const whole = value / divisor;
  const fraction = value % divisor;
  
  // Pad fraction to decimals length
  const fractionStr = fraction.toString().padStart(decimals, '0');
  
  // Trim trailing zeros
  const trimmed = fractionStr.replace(/0+$/, '');
  
  if (trimmed.length === 0) {
    return whole.toString();
  }
  
  return `${whole}.${trimmed}`;
}

/**
 * Get account identifier for current user
 * @param sub - User subject from JWT (e.g., auth0|123abc)
 */
export function getUserAccount(sub: string): string {
  return `acct:user:${sub}`;
}
