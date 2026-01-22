#!/usr/bin/env node

/**
 * Namespace Token Issuance Script
 * Bridges PowerShell authorization with Stellar token minting service
 * 
 * Called by: Y3KIssuance.psm1::Approve-Namespace
 */

const path = require('path');
const fs = require('fs');

// Load Stellar SDK from stellar-banking directory
const stellarBankingPath = path.join(__dirname, '../../stellar-banking');
const { Keypair } = require(path.join(stellarBankingPath, 'node_modules/@stellar/stellar-sdk'));

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

// Load Stellar service configuration
function loadConfig() {
  const stellarEnvPath = path.join(__dirname, '../../stellar-banking/.env');
  
  if (!fs.existsSync(stellarEnvPath)) {
    throw new Error(`Stellar configuration not found at: ${stellarEnvPath}`);
  }
  
  // Parse .env file
  const envContent = fs.readFileSync(stellarEnvPath, 'utf-8');
  const config = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      config[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
  
  return config;
}

// Main issuance logic
async function issueNamespaceToken(params) {
  try {
    const {
      namespace,
      'asset-code': assetCode,
      supply = '1000000',
      'issuer-secret': issuerSecret,
      distributor: distributorPublicKey,
      'distributor-secret': distributorSecret
    } = params;

    // Validate required parameters
    if (!namespace) throw new Error('Missing required parameter: --namespace');
    if (!assetCode) throw new Error('Missing required parameter: --asset-code');
    if (!issuerSecret) throw new Error('Missing required parameter: --issuer-secret');
    if (!distributorPublicKey) throw new Error('Missing required parameter: --distributor');

    // Load configuration
    const config = loadConfig();
    
    // Validate issuer secret
    let issuerKeypair;
    try {
      issuerKeypair = Keypair.fromSecret(issuerSecret);
    } catch (error) {
      throw new Error(`Invalid issuer secret: ${error.message}`);
    }
    
    const issuerPublicKey = issuerKeypair.publicKey();
    
    console.error(`[INFO] Issuing token for namespace: ${namespace}`);
    console.error(`[INFO] Asset Code: ${assetCode}`);
    console.error(`[INFO] Supply: ${supply}`);
    console.error(`[INFO] Issuer: ${issuerPublicKey}`);
    console.error(`[INFO] Distributor: ${distributorPublicKey}`);
    console.error(`[INFO] Network: ${config.STELLAR_NETWORK}`);

    // Import Stellar SDK directly
    const StellarSdk = require(path.join(stellarBankingPath, 'node_modules/@stellar/stellar-sdk'));
    
    // Initialize Horizon server
    const horizonUrl = config.STELLAR_HORIZON_URL || 'https://horizon.stellar.org';
    const server = new StellarSdk.Horizon.Server(horizonUrl);
    const networkPassphrase = config.STELLAR_NETWORK === 'public' 
      ? StellarSdk.Networks.PUBLIC 
      : StellarSdk.Networks.TESTNET;
    
    console.error(`[INFO] Horizon URL: ${horizonUrl}`);
    console.error(`[INFO] Network Passphrase: ${networkPassphrase}`);

    // Step 1: Load issuer account
    console.error(`[INFO] Loading issuer account...`);
    const issuerAccount = await server.loadAccount(issuerPublicKey);
    console.error(`[INFO] Issuer account loaded successfully`);

    // Step 2: Create asset
    const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
    console.error(`[INFO] Asset created: ${asset.code}`);

    // Step 3: Check if distributor exists, if not fund it
    console.error(`[INFO] Checking distributor account...`);
    let distributorAccount;
    try {
      distributorAccount = await server.loadAccount(distributorPublicKey);
      console.error(`[INFO] Distributor account exists`);
    } catch (error) {
      console.error(`[INFO] Distributor account does not exist - creating it...`);
      
      // Create account operation (requires minimum 1 XLM from issuer)
      const createAccountTx = new StellarSdk.TransactionBuilder(issuerAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkPassphrase
      })
        .addOperation(
          StellarSdk.Operation.createAccount({
            destination: distributorPublicKey,
            startingBalance: '2.5' // 2.5 XLM minimum
          })
        )
        .setTimeout(180)
        .build();
      
      createAccountTx.sign(issuerKeypair);
      await server.submitTransaction(createAccountTx);
      console.error(`[INFO] Distributor account created`);
      
      // Reload accounts
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for ledger
      distributorAccount = await server.loadAccount(distributorPublicKey);
    }

    // Step 4: Establish trustline (distributor trusts issuer for this asset)
    if (distributorSecret) {
      console.error(`[INFO] Establishing trustline from distributor to ${assetCode}...`);
      const distributorKeypair = Keypair.fromSecret(distributorSecret);
      
      // Reload distributor account to get latest sequence
      const latestDistributorAccount = await server.loadAccount(distributorPublicKey);
      
      const trustlineTx = new StellarSdk.TransactionBuilder(latestDistributorAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkPassphrase
      })
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: asset,
            limit: '10000000000' // Very high limit
          })
        )
        .setTimeout(180)
        .build();
      
      trustlineTx.sign(distributorKeypair);
      await server.submitTransaction(trustlineTx);
      console.error(`[INFO] Trustline established`);
      
      // Wait for ledger
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.error(`[WARN] No distributor secret provided - assuming trustline exists`);
    }

    // Step 5: Build and submit payment transaction
    console.error(`[INFO] Building payment transaction...`);
    // Reload issuer account to get latest sequence number
    const latestIssuerAccount = await server.loadAccount(issuerPublicKey);
    
    const transaction = new StellarSdk.TransactionBuilder(latestIssuerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: networkPassphrase
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: distributorPublicKey,
          asset: asset,
          amount: supply
        })
      )
      .setTimeout(180)
      .build();

    transaction.sign(issuerKeypair);
    console.error(`[INFO] Transaction signed`);

    console.error(`[INFO] Submitting to Stellar network...`);
    const result = await server.submitTransaction(transaction);
    console.error(`[INFO] Transaction submitted successfully`);
    console.error(`[INFO] Transaction Hash: ${result.hash}`);

    // Return JSON result to PowerShell
    const resultData = {
      success: true,
      namespace,
      asset: {
        code: assetCode,
        issuer: issuerPublicKey,
        supply: supply,
        distributor: distributorPublicKey
      },
      txHash: result.hash,
      stellarExpertUrl: `https://stellar.expert/explorer/public/tx/${result.hash}`,
      timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(resultData, null, 2));
    
    return resultData;

  } catch (error) {
    // Error output to stderr
    console.error(`[ERROR] Token issuance failed: ${error.message}`);
    console.error(error.stack);
    
    // Error JSON to stdout
    const errorResult = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    
    console.log(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  const params = parseArgs();
  issueNamespaceToken(params);
}

module.exports = { issueNamespaceToken };
