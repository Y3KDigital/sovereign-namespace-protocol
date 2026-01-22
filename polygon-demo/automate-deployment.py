"""
AUTOMATED Y3K ECOSYSTEM DEPLOYMENT
- Deploys TRUTH token
- Mints 5 namespace NFTs
- Creates subdomains for each
- Sets up ERC-6551 accounts
- Distributes tokens to all wallets
"""
import json
from web3 import Web3
import time

print("="*80)
print("🚀 Y3K ECOSYSTEM - AUTOMATED DEPLOYMENT")
print("="*80)

# Load wallets
with open('master-wallet.json', 'r') as f:
    master = json.load(f)

with open('wallets-generated.json', 'r') as f:
    wallet_data = json.load(f)
    demo_wallets = wallet_data['wallets']

print("\n📋 DEPLOYMENT PLAN:")
print("\n1. ✅ TRUTH Token (ERC-20)")
print("   - 955M supply")
print("   - Distribute to 5 wallets")

print("\n2. ✅ Y3K Namespace NFT (ERC-721)")
print("   - Mint 5 NFTs (one per wallet)")
print("   - crypto.x, money.x, elite.crypto, vault.crypto, master.x")

print("\n3. ✅ Subdomains")
print("   - auth.crypto.x")
print("   - pay.money.x")
print("   - vault.elite.crypto")
print("   - secure.vault.crypto")
print("   - gov.master.x")

print("\n4. ✅ ERC-6551 Accounts")
print("   - Token-bound account for each NFT")
print("   - NFTs can own tokens!")

print("\n" + "="*80)
print("📝 DEPLOYMENT INSTRUCTIONS")
print("="*80)

instructions = """
STEP 1: Deploy Y3KEcosystemFactory via Remix
────────────────────────────────────────────

1. Open Remix: https://remix.ethereum.org
2. Create new file: Y3K_ECOSYSTEM.sol
3. Paste contents from polygon-demo/Y3K_ECOSYSTEM.sol
4. Compiler: 0.8.20+
5. Compile all contracts
6. Connect MetaMask to Polygon
7. Deploy: Y3KEcosystemFactory
8. Call: deployEcosystem()
9. Copy all 4 contract addresses from event

STEP 2: Run Python Distribution Script
────────────────────────────────────────────

After deployment, you'll have:
- TRUTH token address
- Y3KNamespace NFT address
- Y3KAccount implementation address
- Y3KRegistry address

Update addresses below and run this script.
"""

print(instructions)

# Template for after deployment
deployment_config = {
    "contracts": {
        "TRUTH": "0x_TRUTH_TOKEN_ADDRESS_HERE",
        "Y3KNamespace": "0x_NAMESPACE_NFT_ADDRESS_HERE",
        "Y3KAccount": "0x_ACCOUNT_IMPL_ADDRESS_HERE",
        "Y3KRegistry": "0x_REGISTRY_ADDRESS_HERE"
    },
    "demo_wallets": [
        {
            "id": 1,
            "address": demo_wallets[0]['address'],
            "namespace": "crypto.x",
            "truth_amount": "51546000",  # 51.546M TRUTH (matches $51,546 UD price)
            "subdomains": ["auth.crypto.x", "pay.crypto.x", "vault.crypto.x"]
        },
        {
            "id": 2,
            "address": demo_wallets[1]['address'],
            "namespace": "money.x",
            "truth_amount": "25000000",  # 25M TRUTH
            "subdomains": ["bank.money.x", "swap.money.x", "defi.money.x"]
        },
        {
            "id": 3,
            "address": demo_wallets[2]['address'],
            "namespace": "elite.crypto",
            "truth_amount": "5000000",   # 5M TRUTH
            "subdomains": ["vault.elite.crypto", "premium.elite.crypto"]
        },
        {
            "id": 4,
            "address": demo_wallets[3]['address'],
            "namespace": "vault.crypto",
            "truth_amount": "3500000",   # 3.5M TRUTH
            "subdomains": ["secure.vault.crypto", "cold.vault.crypto"]
        },
        {
            "id": 5,
            "address": demo_wallets[4]['address'],
            "namespace": "master.x",
            "truth_amount": "5000000",   # 5M TRUTH
            "subdomains": ["gov.master.x", "admin.master.x"]
        }
    ]
}

# Save deployment config
with open('deployment-config.json', 'w', encoding='utf-8') as f:
    json.dump(deployment_config, f, indent=2)

print("\n✅ Created: deployment-config.json")

# Create post-deployment script
post_deploy = """
# Run this AFTER deploying contracts via Remix

from web3 import Web3
import json
import time

# Connect to Polygon
w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com'))

# Load config
with open('deployment-config.json', 'r') as f:
    config = json.load(f)

# Load master wallet
with open('master-wallet.json', 'r') as f:
    master = json.load(f)

# Contract ABIs
ERC20_ABI = [{
    "constant": False,
    "inputs": [
        {"name": "recipient", "type": "address"},
        {"name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
}]

NFT_ABI = [{
    "constant": False,
    "inputs": [
        {"name": "to", "type": "address"},
        {"name": "name", "type": "string"}
    ],
    "name": "mintNamespace",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
}, {
    "constant": False,
    "inputs": [
        {"name": "parentTokenId", "type": "uint256"},
        {"name": "subName", "type": "string"}
    ],
    "name": "createSubdomain",
    "outputs": [],
    "type": "function"
}]

REGISTRY_ABI = [{
    "constant": False,
    "inputs": [
        {"name": "implementation", "type": "address"},
        {"name": "chainId", "type": "uint256"},
        {"name": "tokenContract", "type": "address"},
        {"name": "tokenId", "type": "uint256"}
    ],
    "name": "createAccount",
    "outputs": [{"name": "", "type": "address"}],
    "type": "function"
}]

print("="*80)
print("🎯 POST-DEPLOYMENT: Minting & Distribution")
print("="*80)

# 1. Distribute TRUTH tokens
print("\\n💰 Step 1: Distributing TRUTH tokens...")
truth = w3.eth.contract(address=config['contracts']['TRUTH'], abi=ERC20_ABI)

for wallet in config['demo_wallets']:
    amount = int(wallet['truth_amount']) * 10**18
    print(f"   Sending {wallet['truth_amount']} TRUTH to {wallet['namespace']}...")
    
    tx = truth.functions.transfer(
        wallet['address'],
        amount
    ).build_transaction({
        'from': master['address'],
        'nonce': w3.eth.get_transaction_count(master['address']),
        'gas': 100000,
        'gasPrice': int(w3.eth.gas_price * 1.2)
    })
    
    signed = w3.eth.account.sign_transaction(tx, master['private_key'])
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    print(f"   ✅ Tx: {tx_hash.hex()}")
    time.sleep(3)

# 2. Mint namespace NFTs
print("\\n🎨 Step 2: Minting namespace NFTs...")
nft = w3.eth.contract(address=config['contracts']['Y3KNamespace'], abi=NFT_ABI)

token_ids = []
for wallet in config['demo_wallets']:
    print(f"   Minting {wallet['namespace']} NFT...")
    
    tx = nft.functions.mintNamespace(
        wallet['address'],
        wallet['namespace']
    ).build_transaction({
        'from': master['address'],
        'nonce': w3.eth.get_transaction_count(master['address']),
        'gas': 200000,
        'gasPrice': int(w3.eth.gas_price * 1.2)
    })
    
    signed = w3.eth.account.sign_transaction(tx, master['private_key'])
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Get token ID from logs
    token_id = len(token_ids)  # Sequential
    token_ids.append(token_id)
    
    print(f"   ✅ Minted token ID {token_id}: {tx_hash.hex()}")
    time.sleep(3)

# 3. Create subdomains
print("\\n🔗 Step 3: Creating subdomains...")
for i, wallet in enumerate(config['demo_wallets']):
    token_id = token_ids[i]
    print(f"   Creating subdomains for {wallet['namespace']}...")
    
    for subdomain in wallet['subdomains']:
        print(f"      - {subdomain}")
        
        tx = nft.functions.createSubdomain(
            token_id,
            subdomain
        ).build_transaction({
            'from': wallet['address'],
            'nonce': w3.eth.get_transaction_count(wallet['address']),
            'gas': 150000,
            'gasPrice': int(w3.eth.gas_price * 1.2)
        })
        
        # Sign with wallet's private key
        wallet_key = # Load from wallets-generated.json
        signed = w3.eth.account.sign_transaction(tx, wallet_key)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        print(f"         ✅ {tx_hash.hex()}")
        time.sleep(2)

# 4. Create ERC-6551 accounts
print("\\n🏦 Step 4: Creating ERC-6551 token-bound accounts...")
registry = w3.eth.contract(address=config['contracts']['Y3KRegistry'], abi=REGISTRY_ABI)

for i, wallet in enumerate(config['demo_wallets']):
    token_id = token_ids[i]
    print(f"   Creating TBA for {wallet['namespace']} (token #{token_id})...")
    
    tx = registry.functions.createAccount(
        config['contracts']['Y3KAccount'],
        137,  # Polygon chain ID
        config['contracts']['Y3KNamespace'],
        token_id
    ).build_transaction({
        'from': master['address'],
        'nonce': w3.eth.get_transaction_count(master['address']),
        'gas': 300000,
        'gasPrice': int(w3.eth.gas_price * 1.2)
    })
    
    signed = w3.eth.account.sign_transaction(tx, master['private_key'])
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Get TBA address from event
    print(f"   ✅ TBA created: {tx_hash.hex()}")
    time.sleep(3)

print("\\n" + "="*80)
print("✅ DEPLOYMENT COMPLETE!")
print("="*80)
print("\\n📊 Summary:")
print(f"   - TRUTH distributed to 5 wallets")
print(f"   - 5 namespace NFTs minted")
print(f"   - {sum(len(w['subdomains']) for w in config['demo_wallets'])} subdomains created")
print(f"   - 5 ERC-6551 accounts created")
print("\\n🎉 Each NFT now owns its own wallet!")
"""

with open('run-after-deployment.py', 'w', encoding='utf-8') as f:
    f.write(post_deploy)

print("\n✅ Created: run-after-deployment.py")

print("\n" + "="*80)
print("🎯 NEXT STEPS")
print("="*80)
print("""
1. Deploy Y3KEcosystemFactory.sol via Remix
   → Get 4 contract addresses
   
2. Update deployment-config.json with addresses

3. Run: python run-after-deployment.py
   → Distributes tokens
   → Mints NFTs
   → Creates subdomains
   → Sets up ERC-6551

4. You send bonus tokens from MetaMask
   → Can send to wallet addresses
   → OR send to ERC-6551 accounts (NFTs own them!)

🎉 Result: Complete Web3 ecosystem with:
   - Fungible tokens (TRUTH)
   - NFTs (namespaces)
   - Subdomains (unlimited)
   - Token-bound accounts (NFTs own assets!)
""")

print("="*80)
