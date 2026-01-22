#!/usr/bin/env node

/**
 * Clean Cache Script
 * Removes Next.js cache to ensure fresh builds
 * Prevents serving stale UI (especially important for Sovereign mint flow)
 */

const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', '.next');

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log('✓ Cleared Next.js cache:', dirPath);
    return true;
  } else {
    console.log('ℹ No cache directory found (already clean)');
    return false;
  }
}

console.log('🧹 Cleaning build cache...');
removeDirectory(CACHE_DIR);
console.log('✨ Cache cleared. Fresh build guaranteed.\n');
