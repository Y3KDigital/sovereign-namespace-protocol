#!/usr/bin/env node

/**
 * Sovereign Build Verification
 * Ensures the build contains the correct sovereign version
 * before deployment to production
 */

const fs = require('fs');
const path = require('path');

const MINT_CLIENT_PATH = path.join(__dirname, '..', 'app', 'mint', 'MintClient.tsx');

console.log('🔍 Verifying Sovereign Build Requirements...\n');

// Read the MintClient file
const content = fs.readFileSync(MINT_CLIENT_PATH, 'utf8');

// Critical checks
const checks = [
  {
    name: 'No Email Field',
    pattern: /email.*input|<input.*email/i,
    shouldNotExist: true,
    errorMsg: 'FAIL: Email input field detected. Sovereign flow must not collect emails.'
  },
  {
    name: 'No Stripe References',
    pattern: /stripe|credit.*card|bank.*transfer/i,
    shouldNotExist: true,
    errorMsg: 'FAIL: Fiat payment references found. Must be crypto-only.'
  },
  {
    name: 'Numeric Root Validation',
    pattern: /\[0-9\]\{0,3\}|\[0-9\]\{3\}/,
    shouldNotExist: false,
    errorMsg: 'FAIL: Missing numeric-only validation. Must enforce 100-999 pattern.'
  },
  {
    name: 'Client-Side Key Generation',
    pattern: /Ed25519.*key.*generation|window\.crypto\.getRandomValues/i,
    shouldNotExist: false,
    errorMsg: 'FAIL: Missing client-side key generation logic.'
  },
  {
    name: 'Version Stamp Present',
    pattern: /v2\.1.*Sovereign/,
    shouldNotExist: false,
    errorMsg: 'FAIL: Missing version stamp. Users need build verification.'
  },
  {
    name: 'Build Hash Present',
    pattern: /Hash:\s*[a-f0-9]{7}/,
    shouldNotExist: false,
    errorMsg: 'FAIL: Missing build hash. Cannot verify deployment provenance.'
  }
];

let allPassed = true;

checks.forEach(check => {
  const found = check.pattern.test(content);
  const passed = check.shouldNotExist ? !found : found;
  
  if (passed) {
    console.log(`✓ ${check.name}`);
  } else {
    console.error(`✗ ${check.name}`);
    console.error(`  ${check.errorMsg}\n`);
    allPassed = false;
  }
});

console.log('');

if (allPassed) {
  console.log('✅ All sovereign requirements verified. Build is safe to deploy.\n');
  process.exit(0);
} else {
  console.error('❌ Sovereign verification failed. Fix issues before deploying.\n');
  process.exit(1);
}
