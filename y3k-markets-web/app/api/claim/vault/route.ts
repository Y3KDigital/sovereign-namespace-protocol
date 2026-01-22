import { NextResponse } from 'next/server';
import {
  NAMESPACE_VALUATIONS,
  generateVaultTrustLine,
  generateLiquidityPool,
  Y3K_TOKEN_CONFIG,
} from '@/lib/tokenomics';

export async function POST(request: Request) {
  try {
    const { namespace, xrplAddress } = await request.json();

    if (!namespace || !xrplAddress) {
      return NextResponse.json(
        { error: 'Namespace and XRPL address required' },
        { status: 400 }
      );
    }

    // Find namespace valuation
    const valuation = NAMESPACE_VALUATIONS.find((v) => v.namespace === namespace);

    if (!valuation) {
      return NextResponse.json(
        { error: 'Invalid namespace' },
        { status: 404 }
      );
    }

    // Generate XRPL trust line configuration
    const trustLine = generateVaultTrustLine(namespace, xrplAddress);

    // Generate liquidity pool configuration
    const lpConfig = generateLiquidityPool(namespace, 'USDC');

    // Vault package for claiming
    const vaultPackage = {
      namespace: namespace,
      valuation: {
        tier: valuation.tier,
        rarityScore: valuation.rarityScore,
        usdValue: valuation.usdValue,
        consortiumShare: valuation.consortiumShare,
      },
      y3kAllocation: {
        total: valuation.y3kAllocation,
        vaulted: valuation.y3kAllocation * 0.9, // 90% locked
        liquidityPool: valuation.y3kAllocation * 0.1, // 10% for LP
        status: 'LOCKED_UNTIL_CLAIMED',
      },
      xrplTrustLine: trustLine,
      liquidityPool: lpConfig,
      paymentAddress: `${namespace}.finance.x`,
      vaultAddress: `${namespace}.vault.x`,
      claimInstructions: [
        '1. Complete Ed25519 key generation',
        '2. Sign namespace certificate',
        '3. XRPL trust line activated automatically',
        '4. Y3K tokens locked in vault.x',
        '5. Create LP with 10% allocation (optional)',
        '6. Consortium revenue flows to finance.x',
      ],
    };

    return NextResponse.json(vaultPackage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
