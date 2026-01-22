#!/usr/bin/env python3
"""
Retry distribution to failed wallets (2, 3, 5)
"""

from web3 import Web3
import json
import time

POLYGON_RPC = "https://polygon-rpc.com"
w3 = Web3(Web3.HTTPProvider(POLYGON_RPC))

AMOUNT_PER_WALLET = Web3.to_wei(0.5, 'ether')

# Load master wallet
with open("master-wallet.json", "r") as f:
    master = json.load(f)

# Wallets that failed (2, 3, 5)
failed_wallets = [
    {"id": 2, "address": "0x9493c2E088239cd21Add9b56B760e36659F5bbdF"},
    {"id": 3, "address": "0x881f50634b232cDAc2c365e00c40c68aaEA700Ab"},
    {"id": 5, "address": "0xC17E4d527b53b53B6a18E7E879B7acFf0FF2B497"}
]

account = w3.eth.account.from_key(master['private_key'])

print(f"Master: {master['address']}")
print(f"Balance: {w3.eth.get_balance(master['address']) / 10**18} POL\n")

for wallet in failed_wallets:
    try:
        nonce = w3.eth.get_transaction_count(account.address)
        
        tx = {
            'nonce': nonce,
            'to': wallet['address'],
            'value': AMOUNT_PER_WALLET,
            'gas': 21000,
            'gasPrice': w3.eth.gas_price,
            'chainId': 137
        }
        
        signed = w3.eth.account.sign_transaction(tx, master['private_key'])
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        print(f"✅ Wallet {wallet['id']}: {wallet['address']}")
        print(f"   TX: https://polygonscan.com/tx/{tx_hash.hex()}\n")
        
        time.sleep(3)
        
    except Exception as e:
        print(f"❌ Wallet {wallet['id']}: {e}\n")

print(f"Final balance: {w3.eth.get_balance(master['address']) / 10**18} POL")
