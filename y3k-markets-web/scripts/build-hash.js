#!/usr/bin/env node

/**
 * Build Hash Generator
 * Creates a unique, verifiable hash for each build
 * Uses git commit (if available) or timestamp
 */

const { execSync } = require('child_process');

function getBuildHash() {
  try {
    // Try git commit hash first
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    return hash;
  } catch {
    // Fallback to timestamp-based hash
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
    // Take first 7 chars to match git short hash length
    return timestamp.substring(7, 14);
  }
}

const hash = getBuildHash();
console.log(hash);

// Also export for require() usage
module.exports = { getBuildHash };
