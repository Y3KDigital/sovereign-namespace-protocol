// Claim completion with blockchain registry
export async function onRequestPost(context: any) {
  try {
    const { token, publicKey, signature, ipfsCid, namespace } = await context.request.json();

    if (!token || !publicKey || !signature || !namespace) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const BLOCKCHAIN_API = context.env.BLOCKCHAIN_API_URL || '';
    const STELLAR_API = context.env.STELLAR_API_URL || 'http://localhost:13000';

    // STEP 1: Check if namespace already claimed on blockchain
    // Use relative URL for internal Cloudflare Functions calls
    const checkUrl = BLOCKCHAIN_API 
      ? `${BLOCKCHAIN_API}/api/blockchain/check/${namespace}`
      : `/api/blockchain/check/${namespace}`;
    
    const checkResponse = await fetch(checkUrl);
    const checkData = await checkResponse.json();

    if (checkData.exists) {
      return new Response(JSON.stringify({ 
        error: 'Namespace already claimed',
        namespace,
        claimedBy: checkData.namespace.controller.substring(0, 16) + '...',
      }), {
        status: 409, // Conflict
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // STEP 2: Register on blockchain (enforces uniqueness)
    // Use relative URL for internal Cloudflare Functions calls
    const registerUrl = BLOCKCHAIN_API 
      ? `${BLOCKCHAIN_API}/api/blockchain/register`
      : `/api/blockchain/register`;
      
    const registerResponse = await fetch(registerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namespace,
        controller: Buffer.from(publicKey).toString('hex'),
        metadata_hash: ipfsCid
      })
    });

    const registerData = await registerResponse.json();

    if (!registerData.success) {
      return new Response(JSON.stringify({ 
        error: registerData.error || 'Blockchain registration failed',
        namespace
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // STEP 3: Create Stellar account and token (optional, non-blocking)
    let stellarAccount = null;
    let stellarAsset = null;
    
    try {
      // Create Stellar account for namespace
      const accountResponse = await fetch(`${STELLAR_API}/api/accounts/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        const issuerPub = accountData.data?.publicKey;
        const issuerSec = accountData.data?.secret;
        stellarAccount = issuerPub;

        // Fund with testnet XLM (friendbot)
        if (issuerPub) {
          await fetch(`https://friendbot.stellar.org?addr=${issuerPub}`, { method: 'GET' });
          
          // Wait 3 seconds for funding
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Issue namespace token
          const assetCode = namespace.replace('.x', '').toUpperCase().substring(0, 12);
          const tokenBody = JSON.stringify({
            issuerSecret: issuerSec,
            assetCode: assetCode,
            description: `${namespace} - Y3K Namespace Token`,
            totalSupply: '1000000',
            metadata: {
              namespace,
              controller: Buffer.from(publicKey).toString('hex'),
              ipfs_cid: ipfsCid,
              type: 'y3k-namespace-token'
            }
          });

          const tokenResponse = await fetch(`${STELLAR_API}/api/tokens/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: tokenBody
          });

          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            stellarAsset = assetCode;
          }
        }
      }
    } catch (stellarError) {
      // Stellar integration is optional - don't fail the claim
      console.log('Stellar integration failed (non-critical):', stellarError);
    }

    console.log('Claim completed:', { 
      namespace, 
      publicKey: publicKey.slice(0, 16) + '...', 
      commitment: registerData.commitment_hash 
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Sovereignty claimed successfully',
      namespace,
      ipfsCid,
      commitment_hash: registerData.commitment_hash,
      stellar_account: stellarAccount,
      stellar_asset: stellarAsset,
      token_supply: stellarAsset ? '1,000,000' : null,
      blockchain: stellarAccount ? 'stellar-l1' : 'kv-only',
      verifyUrl: `https://cloudflare-ipfs.com/ipfs/${ipfsCid}`,
      blockchainProof: `Registered on-chain at state root: ${registerData.commitment_hash}`,
      stellarProof: stellarAccount ? `Token ${stellarAsset} issued on Stellar: ${stellarAccount}` : null
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
