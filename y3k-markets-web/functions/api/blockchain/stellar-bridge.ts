/**
 * Stellar Bridge - Connect Y3K Namespace Registry to Stellar L1
 * Uses Digital Giant infrastructure at localhost:13000
 */

interface Env {
  STELLAR_API_URL?: string;
  GENESIS_CERTIFICATES: any;
}

interface StellarNamespaceAsset {
  namespace: string;
  controller: string;
  metadata_hash: string;
  stellar_account?: string;
  stellar_asset_code?: string;
}

export async function onRequestPost(context: any) {
  try {
    const { namespace, controller, metadata_hash } = await context.request.json();
    
    // STEP 1: Register in KV (immediate)
    const registration = {
      namespace,
      controller,
      metadata_hash,
      registered_at: new Date().toISOString()
    };

    await context.env.GENESIS_CERTIFICATES.put(
      `namespace:${namespace}`,
      JSON.stringify(registration)
    );

    // STEP 2: Create Stellar account for namespace
    const stellarApiUrl = context.env.STELLAR_API_URL || 'http://localhost:13000';
    
    let stellarAccount = null;
    let stellarAsset = null;

    try {
      // Create Stellar account
      const accountResponse = await fetch(`${stellarApiUrl}/api/accounts/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fundingAmount: '10', // 10 XLM to start
          metadata: {
            namespace,
            controller,
            purpose: 'y3k-namespace-root'
          }
        })
      });

      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        stellarAccount = accountData.data?.publicKey;

        // STEP 3: Issue namespace token on Stellar
        const assetCode = namespace.replace('.x', '').toUpperCase().substring(0, 12);
        
        const tokenResponse = await fetch(`${stellarApiUrl}/api/tokens/issue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetCode,
            issuerAccount: stellarAccount,
            amount: '1000000', // 1M tokens
            metadata: {
              namespace,
              controller,
              metadata_hash,
              type: 'y3k-namespace-token'
            }
          })
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          stellarAsset = tokenData.data?.assetCode;
        }
      }
    } catch (stellarError) {
      console.log('Stellar integration failed (continuing with KV only):', stellarError);
    }

    // Update registration with Stellar data
    const fullRegistration = {
      ...registration,
      stellar_account: stellarAccount,
      stellar_asset_code: stellarAsset,
      stellar_integration: !!stellarAccount
    };

    await context.env.GENESIS_CERTIFICATES.put(
      `namespace:${namespace}`,
      JSON.stringify(fullRegistration)
    );

    // Calculate commitment hash
    const commitment_hash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(fullRegistration))
    );
    const commitment_hex = Array.from(new Uint8Array(commitment_hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return new Response(JSON.stringify({
      success: true,
      namespace,
      commitment_hash: commitment_hex,
      stellar_account: stellarAccount,
      stellar_asset: stellarAsset,
      blockchain: stellarAccount ? 'stellar-l1' : 'kv-only'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
