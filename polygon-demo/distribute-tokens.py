
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
