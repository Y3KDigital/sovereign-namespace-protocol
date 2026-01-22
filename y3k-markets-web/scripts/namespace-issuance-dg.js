#!/usr/bin/env node

/**
 * Y3K Namespace Token Issuance - Digital Giant Stellar Edition
 * Uses YOUR private Stellar Layer 1 blockchain
 * 
 * Called by: Y3KIssuance.psm1::Approve-Namespace
 * API: http://localhost:13000 (YOUR Digital Giant Stellar API)
 */

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    params[key] = value;
  }
  
  return params;
}

// Issue token on Digital Giant Stellar (private L1)
async function issueNamespaceToken(params) {
  const {
    namespace,
    assetCode,
    supply,
    issuerSecret,
    distributor,
    distributorSecret
  } = params;

  console.log('[INFO] Issuing token for namespace:', namespace);
  console.log('[INFO] Asset Code:', assetCode);
  console.log('[INFO] Supply:', supply);
  console.log('[INFO] Network: Digital Giant Stellar (Private L1)');
  console.log('[INFO] API: http://localhost:13000');
  console.log('');

  try {
    // Step 1: Issue token on YOUR private Stellar chain
    console.log('[INFO] Calling Digital Giant Stellar API to issue token...');
    
    const issueResponse = await fetch('http://localhost:13000/api/tokens/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issuerSecret: issuerSecret,
        assetCode: assetCode,
        description: `Token for Y3K namespace: ${namespace}`,
        totalSupply: supply.toString()
      })
    });

    if (!issueResponse.ok) {
      const error = await issueResponse.text();
      throw new Error(`Token issuance failed: ${error}`);
    }

    const issueResult = await issueResponse.json();
    console.log('[INFO] Token issued successfully');
    console.log('[INFO] Issuer:', issueResult.issuer || 'N/A');
    console.log('[INFO] Asset Code:', issueResult.assetCode);
    console.log('[INFO] Transaction Hash:', issueResult.transactionHash || 'N/A');
    console.log('[INFO] Ledger:', issueResult.ledger || 'N/A');
    console.log('');

    // Step 2: Create distributor account (auto-funded from YOUR genesis)
    console.log('[INFO] Creating distributor account...');
    console.log('[INFO] Distributor will be auto-funded from genesis (zero cost)');
    
    const createAccountResponse = await fetch('http://localhost:13000/api/accounts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: distributor,
        initialBalance: '10' // XLM from YOUR genesis
      })
    });

    if (!createAccountResponse.ok) {
      const error = await createAccountResponse.text();
      // Account might already exist - that's okay
      console.log('[INFO] Account creation response:', error);
    } else {
      console.log('[INFO] Distributor account created and funded from genesis');
    }
    console.log('');

    // Step 3: Establish trustline (if distributor secret provided)
    if (distributorSecret) {
      console.log('[INFO] Establishing trustline from distributor to', assetCode);
      
      const trustlineResponse = await fetch('http://localhost:13000/api/trustlines/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountSecret: distributorSecret,
          assetCode: assetCode,
          issuer: issueResult.issuer || params.issuerPublic
        })
      });

      if (!trustlineResponse.ok) {
        const error = await trustlineResponse.text();
        console.log('[WARN] Trustline creation:', error);
      } else {
        console.log('[INFO] Trustline established');
      }
      console.log('');
    }

    // Step 4: Send tokens to distributor
    console.log('[INFO] Sending', supply, assetCode, 'to distributor...');
    
    const paymentResponse = await fetch('http://localhost:13000/api/payments/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceSecret: issuerSecret,
        destination: distributor,
        amount: supply.toString(),
        assetCode: assetCode,
        issuer: issueResult.issuer || params.issuerPublic
      })
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.text();
      throw new Error(`Payment failed: ${error}`);
    }

    const paymentResult = await paymentResponse.json();
    console.log('[INFO] Payment successful');
    console.log('[INFO] Transaction Hash:', paymentResult.txHash || paymentResult.hash || 'N/A');
    console.log('');

    // Return success result
    const result = {
      success: true,
      namespace: namespace,
      asset: {
        code: assetCode,
        issuer: issueResult.issuer || 'ISSUER',
        supply: supply.toString(),
        distributor: distributor
      },
      txHash: paymentResult.txHash || paymentResult.hash || 'DG_TX_' + Date.now(),
      ledger: paymentResult.ledger || issueResult.ledger || null,
      timestamp: new Date().toISOString(),
      network: 'Digital Giant Stellar (Private L1)',
      apiUrl: 'http://localhost:13000'
    };

    // Record to issuance registry
    try {
      const tracker = require('./track-issuance.js');
      tracker.recordIssuance({
        namespace: namespace,
        asset_code: assetCode,
        supply: supply.toString(),
        distributor: distributor,
        transaction_hash: result.txHash,
        ledger: result.ledger,
        status: 'success',
        issuer: result.asset.issuer,
        network: 'Digital Giant Private L1'
      });
      console.log('[TRACKING] Recorded to registry:', namespace);
    } catch (trackError) {
      console.log('[WARN] Failed to record to registry:', trackError.message);
    }

    // Output JSON for PowerShell parsing
    console.log(JSON.stringify(result, null, 2));
    return result;

  } catch (error) {
    console.error('[ERROR]', error.message);
    
    const errorResult = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    
    console.log(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }
}

// Main execution
(async () => {
  const params = parseArgs();
  
  // Validate required parameters
  const required = ['namespace', 'asset-code', 'supply', 'issuer-secret', 'distributor'];
  const missing = required.filter(key => !params[key.replace('-', '')]);
  
  if (missing.length > 0) {
    console.error('[ERROR] Missing required parameters:', missing.join(', '));
    process.exit(1);
  }

  // Map parameters
  const issueParams = {
    namespace: params.namespace,
    assetCode: params['asset-code'] || params.assetcode,
    supply: parseInt(params.supply),
    issuerSecret: params['issuer-secret'] || params.issuersecret,
    distributor: params.distributor,
    distributorSecret: params['distributor-secret'] || params.distributorsecret
  };

  await issueNamespaceToken(issueParams);
})();
