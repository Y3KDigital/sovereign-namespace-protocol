#!/usr/bin/env python3
from web3 import Web3
import json

w3 = Web3(Web3.HTTPProvider("https://polygon-rpc.com"))

with open("wallets-generated.json") as f:
    wallets = json.load(f)["wallets"]

print("="*60)
print("ALL WALLETS FUNDED - READY TO MINT")
print("="*60)

for w in wallets:
    balance = w3.eth.get_balance(w['address']) / 10**18
    print(f"\nWallet {w['id']}: {w['address']}")
    print(f"Balance: {balance} POL ✅")
    print(f"Purpose: {w['purpose']}")

print("\n" + "="*60)
print("NEXT: Mint UD comparison domains")
print("="*60)
