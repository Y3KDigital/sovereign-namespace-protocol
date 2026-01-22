// Y3K Token Economics & Namespace Valuation
// Built on Stellar L1 (Forked & Integrated)
// 3-Validator Quorum | 3-5s Finality | Sub-Cent Fees

export interface NamespaceValuation {
  namespace: string;
  tier: string;
  rarityScore: number;
  y3kAllocation: number; // Y3K tokens locked in vault
  usdValue: number;
  consortiumShare: number; // Percentage of revenue pool
}

export interface Y3KToken {
  totalSupply: number;
  circulatingSupply: number;
  vaultedSupply: number;
  treasurySupply: number;
}

// Y3K Token Configuration (Stellar-based)
// Asset Code: Y3K | Issuer: Y3K Digital
export const Y3K_TOKEN_CONFIG: Y3KToken = {
  totalSupply: 1_000_000_000, // 1 billion Y3K
  circulatingSupply: 0, // Starts at 0, unlocks via claiming
  vaultedSupply: 700_000_000, // 70% locked in namespace vaults
  treasurySupply: 300_000_000, // 30% protocol treasury
};

// Rarity-Based Valuation Tiers
const TIER_MULTIPLIERS = {
  'Crown Sovereign': 1000, // trump.x, rogue.x
  'Protocol Authority': 500, // 45.x
  'Fortune Number': 100, // 88.x
  'Premium': 75, // 222.x, 333.x
  'Named Number': 50, // 77.x
  'Named Sovereign': 25, // brad.x, don.x
  'Genesis Founder': 10, // personal names
};

// Base Y3K per namespace (before multiplier)
const BASE_Y3K_ALLOCATION = 10_000;

// Calculate namespace allocations
export const NAMESPACE_VALUATIONS: NamespaceValuation[] = [
  // CROWN SOVEREIGN
  {
    namespace: 'trump.x',
    tier: 'Crown Sovereign',
    rarityScore: 1000,
    y3kAllocation: BASE_Y3K_ALLOCATION * 1000, // 10 million Y3K
    usdValue: 1_000_000, // $1M valuation
    consortiumShare: 15.0, // 15% of all revenue
  },
  {
    namespace: 'rogue.x',
    tier: 'Crown Sovereign',
    rarityScore: 1000,
    y3kAllocation: BASE_Y3K_ALLOCATION * 1000, // 10 million Y3K
    usdValue: 1_000_000,
    consortiumShare: 10.0, // 10% of revenue (shadow ops)
  },

  // PROTOCOL AUTHORITY
  {
    namespace: '45.x',
    tier: 'Protocol Authority',
    rarityScore: 500,
    y3kAllocation: BASE_Y3K_ALLOCATION * 500, // 5 million Y3K
    usdValue: 500_000, // $500k valuation
    consortiumShare: 12.0, // 12% (Brad's protocol role)
  },

  // FORTUNE NUMBER
  {
    namespace: '88.x',
    tier: 'Fortune Number',
    rarityScore: 100,
    y3kAllocation: BASE_Y3K_ALLOCATION * 100, // 1 million Y3K
    usdValue: 100_000, // $100k
    consortiumShare: 3.0,
  },

  // PREMIUM
  {
    namespace: '222.x',
    tier: 'Premium',
    rarityScore: 75,
    y3kAllocation: BASE_Y3K_ALLOCATION * 75, // 750k Y3K
    usdValue: 75_000,
    consortiumShare: 2.5,
  },
  {
    namespace: '333.x',
    tier: 'Premium',
    rarityScore: 75,
    y3kAllocation: BASE_Y3K_ALLOCATION * 75, // 750k Y3K
    usdValue: 75_000,
    consortiumShare: 2.5,
  },

  // NAMED NUMBER
  {
    namespace: '77.x',
    tier: 'Named Number',
    rarityScore: 50,
    y3kAllocation: BASE_Y3K_ALLOCATION * 50, // 500k Y3K
    usdValue: 50_000,
    consortiumShare: 5.0, // Partner Don
  },

  // NAMED SOVEREIGN
  {
    namespace: 'brad.x',
    tier: 'Named Sovereign',
    rarityScore: 25,
    y3kAllocation: BASE_Y3K_ALLOCATION * 25, // 250k Y3K
    usdValue: 25_000,
    consortiumShare: 8.0, // Brad's personal brand
  },
  {
    namespace: 'don.x',
    tier: 'Named Sovereign',
    rarityScore: 25,
    y3kAllocation: BASE_Y3K_ALLOCATION * 25, // 250k Y3K
    usdValue: 25_000,
    consortiumShare: 5.0,
  },
  {
    namespace: 'kevan.x',
    tier: 'Named Sovereign',
    rarityScore: 25,
    y3kAllocation: BASE_Y3K_ALLOCATION * 25, // 250k Y3K
    usdValue: 25_000,
    consortiumShare: 20.0, // Founder allocation
  },

  // GENESIS FOUNDERS (Personal Names)
  {
    namespace: 'buck.x',
    tier: 'Genesis Founder',
    rarityScore: 10,
    y3kAllocation: BASE_Y3K_ALLOCATION * 10, // 100k Y3K
    usdValue: 10_000,
    consortiumShare: 2.0,
  },
  {
    namespace: 'jimi.x',
    tier: 'Genesis Founder',
    rarityScore: 10,
    y3kAllocation: BASE_Y3K_ALLOCATION * 10,
    usdValue: 10_000,
    consortiumShare: 2.0,
  },
  {
    namespace: 'ben.x',
    tier: 'Genesis Founder',
    rarityScore: 10,
    y3kAllocation: BASE_Y3K_ALLOCATION * 10, // 100k Y3K
    usdValue: 10_000,
    consortiumShare: 2.0,
  },
  {
    namespace: 'kaci.x',
    tier: 'Genesis Founder',
    rarityScore: 10,
    y3kAllocation: BASE_Y3K_ALLOCATION * 10,
    usdValue: 10_000,
    consortiumShare: 2.0,
  },
  {
    namespace: 'konnor.x',
    tier: 'Genesis Founder',
    rarityScore: 10,
    y3kAllocation: BASE_Y3K_ALLOCATION * 10,
    usdValue: 10_000,
    consortiumShare: 2.0,
  },
  {
    namespace: 'lael.x',
    tier: 'Genesis Founder',
    rarityScore: 10,
    y3kAllocation: BASE_Y3K_ALLOCATION * 10,
    usdValue: 10_000,
    consortiumShare: 2.0,
  },
  {
    namespace: 'yoda.x',
    tier: 'Genesis Founder',
    rarityScore: 10,
    y3kAllocation: BASE_Y3K_ALLOCATION * 10,
    usdValue: 10_000,
    consortiumShare: 2.0,
  },
];

// Total consortium math validation
const totalAllocation = NAMESPACE_VALUATIONS.reduce(
  (sum, ns) => sum + ns.y3kAllocation,
  0
);
const totalConsortiumShare = NAMESPACE_VALUATIONS.reduce(
  (sum, ns) => sum + ns.consortiumShare,
  0
);

export const TOKENOMICS_SUMMARY = {
  totalNamespaceAllocation: totalAllocation,
  remainingForTreasury: Y3K_TOKEN_CONFIG.vaultedSupply - totalAllocation,
  totalConsortiumShare: totalConsortiumShare, // Should be 100%
  totalUsdValue: NAMESPACE_VALUATIONS.reduce((sum, ns) => sum + ns.usdValue, 0),
};

// XRPL Token Issuance Configuration
export interface XRPLTokenConfig {
  issuer: string; // XRPL address of Y3K issuer (your neo bank)
  currency: string; // 'Y3K'
  value: string; // Amount to issue
  destination: string; // Recipient XRPL address
  memo?: {
    type: string;
    data: string;
  };
}

// Generate XRPL trust line for namespace vault
export function generateVaultTrustLine(
  namespace: string,
  recipientAddress: string
): XRPLTokenConfig {
  const valuation = NAMESPACE_VALUATIONS.find((v) => v.namespace === namespace);
  
  if (!valuation) {
    throw new Error(`No valuation found for namespace: ${namespace}`);
  }

  return {
    issuer: 'rY3KDigital...', // Your XRPL neo bank address (replace with actual)
    currency: 'Y3K',
    value: valuation.y3kAllocation.toString(),
    destination: recipientAddress,
    memo: {
      type: 'NAMESPACE_VAULT',
      data: JSON.stringify({
        namespace: namespace,
        tier: valuation.tier,
        rarityScore: valuation.rarityScore,
        consortiumShare: valuation.consortiumShare,
        lockType: 'VAULTED',
        claimTimestamp: Date.now(),
      }),
    },
  };
}

// Liquidity Pool Creation
export interface LiquidityPool {
  namespace: string;
  pairA: string; // Y3K
  pairB: string; // XRP or USDC
  y3kAmount: number;
  pairAmount: number;
  poolAddress: string;
}

// Generate LP for namespace holder
export function generateLiquidityPool(
  namespace: string,
  pairCurrency: 'XRP' | 'USDC' = 'USDC'
): LiquidityPool {
  const valuation = NAMESPACE_VALUATIONS.find((v) => v.namespace === namespace);
  
  if (!valuation) {
    throw new Error(`No valuation found for namespace: ${namespace}`);
  }

  // 10% of Y3K allocation available for LP creation
  const lpY3kAmount = valuation.y3kAllocation * 0.1;
  
  // Pair ratio: 1 Y3K = $0.01 (starting price)
  const y3kPrice = 0.01;
  const pairAmount = lpY3kAmount * y3kPrice;

  return {
    namespace: namespace,
    pairA: 'Y3K',
    pairB: pairCurrency,
    y3kAmount: lpY3kAmount,
    pairAmount: pairAmount,
    poolAddress: `amm_pool_${namespace}_Y3K_${pairCurrency}`,
  };
}

// Consortium Revenue Distribution
export function calculateConsortiumPayout(totalRevenue: number) {
  return NAMESPACE_VALUATIONS.map((ns) => ({
    namespace: ns.namespace,
    address: `${ns.namespace}.finance.x`, // Payment routing address
    amount: totalRevenue * (ns.consortiumShare / 100),
    percentage: ns.consortiumShare,
  }));
}
