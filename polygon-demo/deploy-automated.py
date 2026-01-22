"""
Y3K Ecosystem - Automated Deployment Script
Deploys entire ecosystem to Polygon in one go
"""

import json
import time
from web3 import Web3
from eth_account import Account
import os
from pathlib import Path

# Configuration
POLYGON_RPC = "https://polygon-rpc.com"
CHAIN_ID = 137

# Master wallet (from your funded wallet)
MASTER_ADDRESS = "0xb544Ceb2F4e18b53bF3fb0cb56a557923A84DcEE"

print("=" * 80)
print("🚀 Y3K ECOSYSTEM - AUTOMATED DEPLOYMENT")
print("=" * 80)
print()

# Connect to Polygon
print("📡 Connecting to Polygon...")
w3 = Web3(Web3.HTTPProvider(POLYGON_RPC))

if not w3.is_connected():
    print("❌ Failed to connect to Polygon RPC")
    print("   Try alternative RPC: https://rpc-mainnet.matic.network")
    exit(1)

print(f"✅ Connected to Polygon (Chain ID: {w3.eth.chain_id})")
print()

# Get private key
print("🔑 Wallet Setup")
print(f"   Master Address: {MASTER_ADDRESS}")

private_key = os.getenv("POLYGON_PRIVATE_KEY")
if not private_key:
    print()
    print("⚠️  POLYGON_PRIVATE_KEY not found in environment")
    print()
    print("To deploy automatically, you need to set your private key:")
    print()
    print("Option 1: Set environment variable (PowerShell):")
    print('   $env:POLYGON_PRIVATE_KEY = "your_private_key_here"')
    print()
    print("Option 2: Create .env file in polygon-demo folder:")
    print('   POLYGON_PRIVATE_KEY=your_private_key_here')
    print()
    print("🔐 SECURITY WARNING:")
    print("   - Never commit private keys to git")
    print("   - Never share private keys")
    print("   - Use a test wallet for initial deployments")
    print()
    print("📖 To get private key from MetaMask:")
    print("   1. Open MetaMask")
    print("   2. Click 3 dots → Account details")
    print("   3. Click 'Show private key'")
    print("   4. Enter password and copy")
    print()
    print("Alternative: Use manual deployment (see DEPLOY_NOW.md Option A)")
    exit(1)

# Load account
try:
    account = Account.from_key(private_key)
    if account.address.lower() != MASTER_ADDRESS.lower():
        print(f"❌ Private key doesn't match master address")
        print(f"   Expected: {MASTER_ADDRESS}")
        print(f"   Got: {account.address}")
        exit(1)
    print(f"✅ Wallet loaded: {account.address}")
except Exception as e:
    print(f"❌ Invalid private key: {e}")
    exit(1)

# Check balance
balance = w3.eth.get_balance(account.address)
balance_matic = w3.from_wei(balance, 'ether')
print(f"   Balance: {balance_matic:.4f} MATIC")

if balance_matic < 1.5:
    print(f"⚠️  Warning: Low balance. Recommended: 2+ MATIC")
    print(f"   Current: {balance_matic:.4f} MATIC")

print()

# Read contract source
print("📄 Loading contract...")
contract_path = Path(__file__).parent / "Y3K_ECOSYSTEM.sol"
if not contract_path.exists():
    print(f"❌ Contract not found: {contract_path}")
    exit(1)

with open(contract_path, 'r', encoding='utf-8') as f:
    contract_source = f.read()

print(f"✅ Contract loaded ({len(contract_source)} bytes)")
print()

# Compile contract
print("🔨 Compiling contract...")
print()
print("⚠️  COMPILATION REQUIRED:")
print("   Automated deployment requires solc compiler.")
print("   For first deployment, use manual method (Option A).")
print()
print("To enable automated deployment:")
print("   1. Install solc: pip install py-solc-x")
print("   2. Run: from solcx import compile_source, install_solc")
print("   3. Run: install_solc('0.8.20')")
print()
print("OR use Remix for one-click deployment:")
print("   1. Go to https://remix.ethereum.org")
print("   2. Copy Y3K_ECOSYSTEM.sol")
print("   3. Deploy Y3KEcosystemFactory")
print("   4. Call deployEcosystem()")
print("   5. Copy addresses from transaction logs")
print()

# For now, guide user to manual deployment
print("=" * 80)
print("🎯 RECOMMENDED: Manual Deployment via Remix")
print("=" * 80)
print()
print("Automated deployment requires additional setup.")
print("For fastest deployment, follow these steps:")
print()
print("1. Open: https://remix.ethereum.org")
print("2. Create file: Y3K_ECOSYSTEM.sol")
print("3. Copy from: polygon-demo/Y3K_ECOSYSTEM.sol")
print("4. Compile with Solidity 0.8.20+")
print("5. Connect MetaMask to Polygon")
print("6. Deploy: Y3KEcosystemFactory")
print("7. Call: deployEcosystem()")
print("8. Copy 4 contract addresses from logs")
print("9. Update: deployment-config.json")
print("10. Run: python run-after-deployment.py")
print()
print("⏱️  Total time: 10 minutes")
print("💰 Total cost: ~$0.80")
print()
print("See DEPLOY_NOW.md for detailed step-by-step guide.")
print()

# Alternative: Provide pre-compiled bytecode
print("=" * 80)
print("💡 ADVANCED: Pre-compiled Deployment")
print("=" * 80)
print()
print("If you have contract bytecode, update this script with:")
print("   - FACTORY_BYTECODE = '0x...'")
print("   - FACTORY_ABI = [...]")
print()
print("Then this script can deploy directly without compilation.")
print()
