"""
Check master wallet for all tokens received
"""
import json
from web3 import Web3
import requests

# Connect to Polygon
w3 = Web3(Web3.HTTPProvider('https://polygon-rpc.com'))

# Master wallet address
master_address = "0xb544Ceb2F4e18b53bF3fb0cb56a557923A84DcEE"

print("="*70)
print("🔍 CHECKING MASTER WALLET FOR TOKENS")
print("="*70)
print(f"\n📬 Address: {master_address}")

# Check POL balance
pol_balance = w3.eth.get_balance(master_address)
pol = pol_balance / 10**18
print(f"💰 POL Balance: {pol:.6f} POL")

# ERC-20 ABI (minimal for checking balance)
ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    }
]

# Use PolygonScan API to get token list
print("\n🔎 Scanning for ERC-20 tokens using PolygonScan API...")

try:
    # PolygonScan API (free tier)
    api_url = f"https://api.polygonscan.com/api"
    params = {
        "module": "account",
        "action": "tokentx",
        "address": master_address,
        "startblock": 0,
        "endblock": 99999999,
        "sort": "desc"
    }
    
    response = requests.get(api_url, params=params, timeout=10)
    data = response.json()
    
    if data['status'] == '1' and data['message'] == 'OK':
        transactions = data['result']
        
        # Get unique token contracts
        token_contracts = {}
        for tx in transactions:
            if tx['to'].lower() == master_address.lower():
                contract = tx['contractAddress']
                if contract not in token_contracts:
                    token_contracts[contract] = {
                        'name': tx.get('tokenName', 'Unknown'),
                        'symbol': tx.get('tokenSymbol', 'UNK'),
                        'decimals': int(tx.get('tokenDecimal', 18))
                    }
        
        print(f"\n✅ Found {len(token_contracts)} different tokens!")
        print("\n" + "="*70)
        print("💎 TOKEN BALANCES")
        print("="*70)
        
        tokens_found = []
        
        for contract_address, token_info in token_contracts.items():
            try:
                # Create contract instance
                token = w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=ERC20_ABI)
                
                # Get balance
                balance_wei = token.functions.balanceOf(master_address).call()
                decimals = token_info['decimals']
                balance = balance_wei / (10 ** decimals)
                
                if balance > 0:
                    print(f"\n🪙 {token_info['name']} ({token_info['symbol']})")
                    print(f"   Contract: {contract_address}")
                    print(f"   Balance: {balance:,.6f} {token_info['symbol']}")
                    
                    tokens_found.append({
                        'name': token_info['name'],
                        'symbol': token_info['symbol'],
                        'contract': contract_address,
                        'balance': balance,
                        'decimals': decimals
                    })
            except Exception as e:
                print(f"\n⚠️  Error checking {token_info['symbol']}: {e}")
        
        # Save results
        with open('master-wallet-tokens.json', 'w', encoding='utf-8') as f:
            json.dump({
                'address': master_address,
                'pol_balance': pol,
                'tokens': tokens_found,
                'total_tokens_found': len(tokens_found)
            }, f, indent=2)
        
        print("\n" + "="*70)
        print(f"📊 SUMMARY: {len(tokens_found)} tokens with balance > 0")
        print("="*70)
        print(f"\n✅ Saved to: master-wallet-tokens.json")
        
    else:
        print(f"❌ API Error: {data.get('message', 'Unknown error')}")
        print("\n💡 Checking common tokens manually...")
        
        # Fallback: Check common Polygon tokens manually
        common_tokens = {
            'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            'WETH': '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
            'WMATIC': '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
            'DAI': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
        }
        
        for symbol, contract_address in common_tokens.items():
            try:
                token = w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=ERC20_ABI)
                balance_wei = token.functions.balanceOf(master_address).call()
                name = token.functions.name().call()
                decimals = token.functions.decimals().call()
                balance = balance_wei / (10 ** decimals)
                
                if balance > 0:
                    print(f"\n🪙 {name} ({symbol})")
                    print(f"   Balance: {balance:,.6f} {symbol}")
            except Exception as e:
                pass

except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\n💡 Try checking manually on Polygonscan:")
    print(f"   https://polygonscan.com/address/{master_address}")

print("\n" + "="*70)
print("🚀 NEXT: Deploy ERC-6551 + Token Ecosystem")
print("="*70)
