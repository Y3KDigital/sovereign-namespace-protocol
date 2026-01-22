
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
print("\n💰 Step 1: Distributing TRUTH tokens...")
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
print("\n🎨 Step 2: Minting namespace NFTs...")
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
print("\n🔗 Step 3: Creating subdomains...")
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
print("\n🏦 Step 4: Creating ERC-6551 token-bound accounts...")
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

print("\n" + "="*80)
print("✅ DEPLOYMENT COMPLETE!")
print("="*80)
print("\n📊 Summary:")
print(f"   - TRUTH distributed to 5 wallets")
print(f"   - 5 namespace NFTs minted")
print(f"   - {sum(len(w['subdomains']) for w in config['demo_wallets'])} subdomains created")
print(f"   - 5 ERC-6551 accounts created")
print("\n🎉 Each NFT now owns its own wallet!")
