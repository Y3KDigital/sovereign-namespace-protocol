"""
Create and distribute fun tokens to our 5 demo wallets
"""
import json
from web3 import Web3
from eth_account import Account
import time

# Connect to Polygon
w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com'))
print(f"Connected to Polygon: {w3.is_connected()}")
print(f"Chain ID: {w3.eth.chain_id}")

# Load master wallet
with open('master-wallet.json', 'r') as f:
    master = json.load(f)

master_address = master['address']
master_key = master['private_key']

# Load 5 demo wallets
with open('wallets-generated.json', 'r') as f:
    wallet_data = json.load(f)
    wallets = wallet_data['wallets']

print("\n" + "="*70)
print("🎨 FUN TOKEN CREATION AND DISTRIBUTION")
print("="*70)

# Check master balance
master_balance = w3.eth.get_balance(master_address)
master_pol = master_balance / 10**18
print(f"\n💰 Master Wallet: {master_address}")
print(f"   Balance: {master_pol:.4f} POL")

# Simple ERC-20 contract (OpenZeppelin style)
token_contract = """
pragma solidity ^0.8.0;

contract TRUTH is ERC20 {
    constructor() ERC20("Truth Token", "TRUTH") {
        _mint(msg.sender, 955_000_000 * 10**18); // 955 million tokens
    }
}
"""

# Since we can't deploy Solidity from Python easily without compiled bytecode,
# let's use a pre-deployed token contract or create our own simple distribution

print("\n" + "="*70)
print("🎉 FUN TOKEN OPTIONS")
print("="*70)

print("\n📊 Suggested Fun Tokens to Create:")
print("\n1. TRUTH Token (955M supply)")
print("   Symbol: TRUTH")
print("   Purpose: Representing the truth about UD's 500,000x markup")
print("   Supply: 955,000,000 (matching our 955 namespaces)")
print("   Decimals: 18")

print("\n2. PROOF Token (100M supply)")
print("   Symbol: PROOF")
print("   Purpose: Proof of Y3K's superior value proposition")
print("   Supply: 100,000,000")
print("   Decimals: 18")

print("\n3. SOVEREIGN Token (955 supply)")
print("   Symbol: SOVR")
print("   Purpose: Ultra-rare, matching 955 genesis namespaces")
print("   Supply: 955 (no decimals, whole numbers only)")
print("   Decimals: 0")

print("\n4. Y3K Token (1B supply)")
print("   Symbol: Y3K")
print("   Purpose: Governance/utility token for Y3K ecosystem")
print("   Supply: 1,000,000,000")
print("   Decimals: 18")

print("\n5. DEMO Token (10B supply)")
print("   Symbol: DEMO")
print("   Purpose: Fun demonstration token")
print("   Supply: 10,000,000,000")
print("   Decimals: 18")

print("\n" + "="*70)
print("🚀 RECOMMENDATION: Create TRUTH Token")
print("="*70)

print("\nWhy TRUTH?")
print("  ✅ 955M supply (matches our 955 namespaces)")
print("  ✅ Represents truth about UD's markup")
print("  ✅ Fun backstory for demo")
print("  ✅ Can distribute 191M to each wallet (955M ÷ 5)")
print("  ✅ Memeable name")

print("\n" + "="*70)
print("📝 DEPLOYMENT PLAN")
print("="*70)

print("\nOption A: Use Remix IDE (Easiest)")
print("  1. Go to: https://remix.ethereum.org")
print("  2. Create new file: TRUTH.sol")
print("  3. Paste this code:")
print("""
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TRUTH is ERC20 {
    constructor() ERC20("Truth Token", "TRUTH") {
        _mint(msg.sender, 955_000_000 * 10**18);
    }
}
""")
print("  4. Compile with Solidity 0.8.20+")
print("  5. Deploy to Polygon using MetaMask")
print("  6. Copy contract address")
print("  7. Run distribution script")

print("\nOption B: Use Python Web3 (More Complex)")
print("  Requires: Solidity compiler, bytecode, ABI")
print("  Better for production, overkill for demo")

print("\nOption C: Use existing token contract")
print("  Deploy using Hardhat/Truffle")
print("  More professional setup")

# Let's create a distribution script that can be used after deployment
print("\n" + "="*70)
print("💸 TOKEN DISTRIBUTION SCRIPT")
print("="*70)

distribution_script = """
# After deploying TRUTH token, run this:

from web3 import Web3
import json

# Connect to Polygon
w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com'))

# ERC-20 ABI (standard)
ERC20_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "recipient", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": False,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    }
]

# Your deployed token address (replace after deployment)
TOKEN_ADDRESS = "0x_YOUR_TOKEN_ADDRESS_HERE"

# Load master wallet
with open('master-wallet.json', 'r') as f:
    master = json.load(f)

# Load demo wallets
with open('wallets-generated.json', 'r') as f:
    wallets = json.load(f)

# Create contract instance
token = w3.eth.contract(address=TOKEN_ADDRESS, abi=ERC20_ABI)

# Distribute 191M TRUTH to each wallet (955M ÷ 5)
amount_per_wallet = 191_000_000 * 10**18

for wallet in wallets:
    print(f"Sending 191M TRUTH to {wallet['address']}...")
    
    # Build transaction
    tx = token.functions.transfer(
        wallet['address'],
        amount_per_wallet
    ).build_transaction({
        'from': master['address'],
        'nonce': w3.eth.get_transaction_count(master['address']),
        'gas': 100000,
        'gasPrice': w3.eth.gas_price
    })
    
    # Sign and send
    signed = w3.eth.account.sign_transaction(tx, master['private_key'])
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    
    print(f"✅ Tx: {tx_hash.hex()}")
    time.sleep(2)  # Wait between transactions
"""

with open('distribute-tokens.py', 'w', encoding='utf-8') as f:
    f.write(distribution_script)

print("\n✅ Created: distribute-tokens.py (run after token deployment)")

# Create simple POL distribution script
print("\n" + "="*70)
print("💰 POL DISTRIBUTION (Now)")
print("="*70)

print(f"\nMaster wallet has: {master_pol:.4f} POL")
print(f"Can send: ~{(master_pol - 0.05) / 5:.4f} POL to each wallet")
print(f"(Keeping 0.05 POL for gas)")

# Simple POL distribution
distribute_pol = input("\nWant to distribute remaining POL to wallets? (y/n): ").lower()

if distribute_pol == 'y':
    # Keep 0.05 POL for gas, distribute rest
    gas_reserve = 0.05
    distributable = master_pol - gas_reserve
    
    if distributable <= 0:
        print("\n❌ Not enough POL to distribute")
    else:
        amount_per_wallet_pol = distributable / 5
        amount_wei = int(amount_per_wallet_pol * 10**18)
        
        print(f"\n📤 Distributing {amount_per_wallet_pol:.4f} POL to each wallet...")
        
        nonce = w3.eth.get_transaction_count(master_address)
        gas_price = w3.eth.gas_price
        
        for i, wallet in enumerate(wallets):
            print(f"\nWallet {i+1}: {wallet['address']}")
            
            # Build transaction
            tx = {
                'nonce': nonce + i,
                'to': wallet['address'],
                'value': amount_wei,
                'gas': 21000,
                'gasPrice': int(gas_price * 1.5)  # 50% higher for speed
            }
            
            # Sign
            signed = w3.eth.account.sign_transaction(tx, master_key)
            
            # Send
            try:
                tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
                print(f"   ✅ Sent {amount_per_wallet_pol:.4f} POL")
                print(f"   📋 Tx: {tx_hash.hex()}")
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        print("\n✅ POL distribution complete!")
else:
    print("\n⏭️  Skipping POL distribution")

print("\n" + "="*70)
print("🎯 NEXT STEPS")
print("="*70)

print("\n1. Deploy TRUTH token using Remix:")
print("   → https://remix.ethereum.org")
print("   → Connect MetaMask to Polygon")
print("   → Deploy contract")
print("   → Copy contract address")

print("\n2. Update distribute-tokens.py:")
print("   → Replace TOKEN_ADDRESS with deployed address")
print("   → Run: python distribute-tokens.py")

print("\n3. You can then send from MetaMask/Uniswap:")
print("   → Any ERC-20 tokens you have")
print("   → More POL if desired")
print("   → NFTs if you want")

print("\n4. Fun things to send:")
print("   → USDC/USDT (real value)")
print("   → UNI tokens (from Uniswap)")
print("   → WETH (wrapped ETH)")
print("   → Any fun meme tokens")

print("\n" + "="*70)
print("💡 FUN IDEAS")
print("="*70)

print("\nMake each wallet themed:")
print("  Wallet 1 (crypto.x):  DeFi tokens (UNI, AAVE, CRV)")
print("  Wallet 2 (money.x):   Stablecoins (USDC, USDT, DAI)")
print("  Wallet 3 (elite.x):   Governance (COMP, MKR, SNX)")
print("  Wallet 4 (vault.x):   Yield tokens (YFI, CVX)")
print("  Wallet 5 (master.x):  Meme tokens (SHIB, DOGE)")

print("\nOr distribute TRUTH based on UD pricing:")
print("  crypto.x:  51.546M TRUTH (matching $51,546 UD price)")
print("  money.x:   25M TRUTH")
print("  elite.x:   5M TRUTH")
print("  vault.x:   3.5M TRUTH")
print("  master.x:  5M TRUTH")
print("  Total:     90.046M TRUTH (864.954M remaining for master)")

print("\n✅ Ready to create fun tokens!")
print("\nRun this script: python create-fun-tokens.py")
print("Then deploy TRUTH.sol via Remix")
print("Finally run: python distribute-tokens.py")

print("\n" + "="*70)
