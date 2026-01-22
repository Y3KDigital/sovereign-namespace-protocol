#!/usr/bin/env python3
from web3 import Web3
import json
import time

POLYGON_RPC = "https://polygon-rpc.com"
w3 = Web3(Web3.HTTPProvider(POLYGON_RPC))

with open("master-wallet.json") as f:
    master = json.load(f)

account = w3.eth.account.from_key(master['private_key'])
current_nonce = w3.eth.get_transaction_count(account.address)
pending_nonce = w3.eth.get_transaction_count(account.address, 'pending')

print(f"Master: {master['address']}")
print(f"Balance: {w3.eth.get_balance(master['address']) / 10**18} POL")
print(f"Current nonce: {current_nonce}")
print(f"Pending nonce: {pending_nonce}")
print(f"Pending TXs: {pending_nonce - current_nonce}\n")

# Remaining wallets
remaining = [
    {"id": 3, "address": "0x881f50634b232cDAc2c365e00c40c68aaEA700Ab"},
    {"id": 5, "address": "0xC17E4d527b53b53B6a18E7E879B7acFf0FF2B497"}
]

# Use current_nonce (not pending)
gas_price = int(w3.eth.gas_price * 1.5)  # 50% higher gas

for i, wallet in enumerate(remaining):
    try:
        nonce = current_nonce + i
        
        tx = {
            'nonce': nonce,
            'to': wallet['address'],
            'value': Web3.to_wei(0.5, 'ether'),
            'gas': 21000,
            'gasPrice': gas_price,
            'chainId': 137
        }
        
        signed = w3.eth.account.sign_transaction(tx, master['private_key'])
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        print(f"✅ Wallet {wallet['id']}: {tx_hash.hex()}")
        time.sleep(2)
        
    except Exception as e:
        print(f"❌ Wallet {wallet['id']}: {e}")

time.sleep(5)
print(f"\nFinal balance: {w3.eth.get_balance(master['address']) / 10**18} POL")
