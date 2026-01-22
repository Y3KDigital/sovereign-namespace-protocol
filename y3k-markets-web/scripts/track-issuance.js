#!/usr/bin/env node

/**
 * Track Token Issuance - Records all issuances to registry
 * Updates: genesis/ISSUANCE_REGISTRY.json
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../../genesis/ISSUANCE_REGISTRY.json');

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    return {
      registry: {
        version: '1.0.0',
        network: 'Digital Giant Private Network ; January 2026',
        horizon_url: 'http://localhost:18000',
        issuer: 'GDMPZQEQHWZ7KGEILXYVBNOT4QCOWSVFDDHMWL42IM2VZWUEZC6AQ72M',
        last_updated: new Date().toISOString()
      },
      issuances: []
    };
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function saveRegistry(data) {
  data.registry.last_updated = new Date().toISOString();
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function recordIssuance(record) {
  const registry = loadRegistry();
  
  // Check for duplicate
  const existing = registry.issuances.find(i => 
    i.namespace === record.namespace && i.asset_code === record.asset_code
  );
  
  if (existing) {
    console.log('[WARN] Issuance already recorded:', record.namespace);
    return false;
  }
  
  // Add new record
  registry.issuances.push({
    ...record,
    recorded_at: new Date().toISOString()
  });
  
  saveRegistry(registry);
  console.log('[INFO] Issuance recorded:', record.namespace);
  return true;
}

function getIssuances(namespace = null) {
  const registry = loadRegistry();
  if (namespace) {
    return registry.issuances.filter(i => i.namespace === namespace);
  }
  return registry.issuances;
}

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'record') {
    const record = {
      namespace: args[1],
      asset_code: args[2],
      supply: args[3],
      distributor: args[4],
      transaction_hash: args[5] || null,
      ledger: args[6] || null,
      status: args[7] || 'success'
    };
    recordIssuance(record);
  } else if (command === 'list') {
    const namespace = args[1] || null;
    const issuances = getIssuances(namespace);
    console.log(JSON.stringify(issuances, null, 2));
  } else {
    console.log('Usage:');
    console.log('  node track-issuance.js record <namespace> <asset_code> <supply> <distributor> [tx_hash] [ledger] [status]');
    console.log('  node track-issuance.js list [namespace]');
  }
}

module.exports = { recordIssuance, getIssuances, loadRegistry };
