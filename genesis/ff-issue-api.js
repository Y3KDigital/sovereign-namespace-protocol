#!/usr/bin/env node
/**
 * F&F Token Issuance via Digital Giant API
 * Direct HTTP calls, no Stellar SDK
 */

const ISSUER_SECRET = 'SCBH7ZPFBGAJUKP5MICLHHGO4MCABSXYSNGCLO2TNA57E6SCTSYPH4MM';
const API_URL = 'http://localhost:13000';

const tokens = [
  { namespace: 'ben.x', asset: 'BEN', supply: 35000, dist_pub: 'GDYJH2DDKTYMSOHP7JSWLHO64KSOUZIOFDIW2DRKBGA752AM7UDG3ZLB3', dist_sec: 'SCTMSLT57Z6W6QNXL75IJEGIG7R725LJ52FFWUHXTJ5EHMYRKFK2FELH', tier: 'Mid-Tier ($35K)' },
  { namespace: 'rogue.x', asset: 'ROGUE', supply: 35000, dist_pub: 'GCRQAXCBFYXRYEDHZXJMR76NCMBWCWOGTKILDNIQ3OZF5SPLNTP7QP3R', dist_sec: 'SAOXFQVOQSYF6V6BAA77GSPYHMOQEXBRT5SLSKGYKIBVVXQ5HS723EUN', tier: 'Mid-Tier ($35K)' },
  { namespace: '77.x', asset: 'N77', supply: 35000, dist_pub: 'GAARKP4YZKZ4YSOMGSKRGBBG5U3RLJOA2BMJ22QXZJB5GOIEOVYGKGKX6', dist_sec: 'SBQCYYDYLGAAVLLS3KOUBKKLBKVYCO4MPHZXJF6H43ZJKLYELMM6FGJB', tier: 'Numeric ($35K)' },
  { namespace: '222.x', asset: 'N222', supply: 30000, dist_pub: 'GCA5H5ZCJ7XDBPCJBS6Y3MYRJ2G6FFNBUKZGMWCFIKOEQ5MBC5WZZB63', dist_sec: 'SCDF47PFA3PAWOKVF34DUTS6RV2B5WKYBONKVSVCESYT5VGNCEZF2NSL', tier: 'Numeric ($30K)' },
  { namespace: 'buck.x', asset: 'BUCK', supply: 50000, dist_pub: 'GAYDDPDYFJCFACBXYZX2EUXLOVNCWJKIRRRAJIIAB4X4YRIDXG6H3YSY', dist_sec: 'SA2M74QSLL5IA4CYGGZBUX54ZJL4GNCIBEHBRZ2SCNPROJQOVCJ37KDP', tier: 'Premium ($50K)' },
  { namespace: 'jimi.x', asset: 'JIMI', supply: 50000, dist_pub: 'GCXMKIIXJXVEOMZ267PZTZHZ7RL4J3VBU3W6H2PI6OFXXKW7VP4MWZ5R', dist_sec: 'SCNFBYQHNYKKA46QX3NAOU7CBWH5FWNHIIZN3JLJUVXVE6TP7KHGV65Y', tier: 'Premium ($50K)' },
  { namespace: 'yoda.x', asset: 'YODA', supply: 50000, dist_pub: 'GCPN7ILTKSO2ZR2QJTXYO5ORGIJ6T5H4VANXT5O3JYLMTS7SRK66UYJO', dist_sec: 'SCR32ZYXQOQY7OY76ILTDA5DWDDJTD4VQS6CVWABWNLYZZC4J6BJQIVM', tier: 'Premium ($50K)' },
  { namespace: 'trump.x', asset: 'TRUMP', supply: 50000, dist_pub: 'GA5WEWNGRA3XTQW3IUH6M2HDC2QTS57ZBNX4LY2LZHVW63H6QTG24VEX', dist_sec: 'SDEATZBA3F3ZOCQP3BM2243CQAWQF2ACHH2DMZH6I57M52W7FXE3O3WC', tier: 'Premium ($50K)' },
  { namespace: 'kaci.x', asset: 'KACI', supply: 25000, dist_pub: 'GB5ORUDHXQI5EVMGFCFVX7SHLUHEKLOL7HY2WDWKHPVZFVDN6ZX5VR7X', dist_sec: 'SAIZQX6F2PHPXS2TZLM57JGIGWYIUHFG5YCRZLACDLVXDEET2BNULZQW', tier: 'Standard ($25K)' },
  { namespace: 'konnor.x', asset: 'KONNOR', supply: 25000, dist_pub: 'GBINT6RQBFBLZVW7NVLYQWK5GYB7C5MSB356T6JDAQANVAKYHPLM2EJI', dist_sec: 'SCO67GJECIVWQ45NNQPMUULGT53FKNNZQJIWG6YK7KHEAUFZ6VNDQXSG', tier: 'Standard ($25K)' },
  { namespace: 'lael.x', asset: 'LAEL', supply: 25000, dist_pub: 'GABW33GLSNRGSDAUJ7LSCO6DXOODFF5K5XEVVXHUGTCFWVMRNK77F5WY', dist_sec: 'SABZNVWB6VRTWDSTQEVFGN4TEZIWT2NJSJ3NDM4JED7VLVQUFTI262HJ', tier: 'Standard ($25K)' }
];

async function issueToken(token) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${token.namespace} → ${token.asset} (${token.supply.toLocaleString()} tokens) [${token.tier}]`);
  console.log('='.repeat(60));

  try {
    // Step 1: Issue token
    const issueRes = await fetch(`${API_URL}/api/tokens/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetCode: token.asset,
        description: `F&F namespace token for ${token.namespace}`,
        totalSupply: token.supply.toString(),
        issuerSecret: ISSUER_SECRET
      })
    });

    const issueData = await issueRes.json();
    console.log('Issue response:', JSON.stringify(issueData, null, 2));
    if (!issueData.success) throw new Error(`Issue failed: ${JSON.stringify(issueData)}`);

    
    console.log(`✓ Issued: ${token.asset}`);
    console.log(`  Issuer: ${issueData.issuer}`);

    // Step 2: Create distributor account
    const acctRes = await fetch(`${API_URL}/api/accounts/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fundingSecret: ISSUER_SECRET,
        newAccountPublic: token.dist_pub,
        startingBalance: '100'
      })
    });

    const acctData = await acctRes.json();
    if (!acctData.success) throw new Error(`Account creation failed: ${acctData.error}`);
    
    console.log(`✓ Distributor funded: ${token.dist_pub.substring(0, 8)}...`);

    // Step 3: Establish trustline
    const trustRes = await fetch(`${API_URL}/api/trustlines/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountSecret: token.dist_sec,
        assetCode: token.asset,
        assetIssuer: issueData.issuer,
        limit: token.supply.toString()
      })
    });

    const trustData = await trustRes.json();
    if (!trustData.success) throw new Error(`Trustline failed: ${trustData.error}`);
    
    console.log(`✓ Trustline established`);

    // Step 4: Send tokens
    const paymentRes = await fetch(`${API_URL}/api/payments/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceSecret: ISSUER_SECRET,
        destination: token.dist_pub,
        amount: token.supply.toString(),
        assetCode: token.asset,
        assetIssuer: issueData.issuer
      })
    });

    const paymentData = await paymentRes.json();
    if (!paymentData.success) throw new Error(`Payment failed: ${paymentData.error}`);
    
    console.log(`✓ Tokens distributed: ${token.supply.toLocaleString()}`);
    console.log(`  Tx Hash: ${paymentData.hash}`);
    console.log(`  Ledger: ${paymentData.ledger || 'pending'}`);

    // Record to registry
    const { recordIssuance } = require('../y3k-markets-web/scripts/track-issuance.js');
    recordIssuance({
      namespace: token.namespace,
      asset_code: token.asset,
      supply: token.supply.toString(),
      distributor: token.dist_pub,
      transaction_hash: paymentData.hash,
      ledger: paymentData.ledger,
      status: 'success',
      issuer: issueData.issuer,
      network: 'Digital Giant Private L1'
    });

    return { success: true, token: token.namespace, txHash: paymentData.hash };

  } catch (error) {
    console.log(`✗ FAILED: ${error.message}`);
    return { success: false, token: token.namespace, error: error.message };
  }
}

async function main() {
  console.log('\n========================================');
  console.log('F&F TOKEN ISSUANCE - DIGITAL GIANT L1');
  console.log('========================================');
  console.log(`API: ${API_URL}`);
  console.log(`Tokens: ${tokens.length}`);
  console.log(`Total Supply: ${tokens.reduce((sum, t) => sum + t.supply, 0).toLocaleString()}`);
  console.log('Cost: $0.00 (zero fees)\n');

  const results = [];
  
  for (const token of tokens) {
    const result = await issueToken(token);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n========================================');
  console.log('ISSUANCE COMPLETE');
  console.log('========================================');
  console.log(`✓ Successful: ${successful}/${tokens.length}`);
  console.log(`✗ Failed: ${failed}/${tokens.length}`);
  console.log(`Network: Digital Giant Private L1`);
  console.log(`Total Cost: $0.00\n`);

  // Save results
  const fs = require('fs');
  fs.writeFileSync(
    './genesis/FF_ISSUANCE_RESULTS.json',
    JSON.stringify(results, null, 2)
  );
  console.log('Results: genesis/FF_ISSUANCE_RESULTS.json\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
