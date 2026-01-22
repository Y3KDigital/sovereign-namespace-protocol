import {
  NAMESPACE_VALUATIONS,
  generateVaultTrustLine,
  generateLiquidityPool,
} from '../../../lib/tokenomics';

export async function onRequestPost(context: any) {
  try {
    const { namespace, xrplAddress } = await context.request.json();

    if (!namespace || !xrplAddress) {
      return new Response(
        JSON.stringify({ error: 'Namespace and XRPL address required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find namespace valuation
    const valuation = NAMESPACE_VALUATIONS.find((v) => v.namespace === namespace);

    if (!valuation) {
      return new Response(
        JSON.stringify({ error: 'Invalid namespace' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
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

    return new Response(JSON.stringify(vaultPackage), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
