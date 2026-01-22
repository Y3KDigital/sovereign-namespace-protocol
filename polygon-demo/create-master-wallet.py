#!/usr/bin/env python3
"""
Create master distributor wallet + script to distribute MATIC to 5 demo wallets
"""

from eth_account import Account
import json
import secrets

# Enable unaudited HD wallet features
Account.enable_unaudited_hdwallet_features()

# Generate master wallet
private_key = "0x" + secrets.token_hex(32)
account = Account.from_key(private_key)

master_wallet = {
    "name": "Master Distributor",
    "address": account.address,
    "private_key": private_key,
    "purpose": "Send 3 MATIC here, then distribute 0.5 MATIC to each of 5 demo wallets",
    "network": "Polygon Mainnet",
    "chain_id": 137
}

print("="*60)
print("MASTER DISTRIBUTOR WALLET")
print("="*60)
print(f"\nAddress:     {account.address}")
print(f"Private Key: {private_key}")
print("\n" + "="*60)
print("INSTRUCTIONS:")
print("="*60)
print(f"\n1. Send 3 MATIC to: {account.address}")
print("2. Wait for confirmation (2-3 seconds)")
print("3. Run: python distribute-matic.py")
print("4. Script will send 0.5 MATIC to each of 5 demo wallets")
print("5. Remaining ~0.5 MATIC stays for gas fees")
print("\n" + "="*60)

# Save to file
with open("master-wallet.json", "w") as f:
    json.dump(master_wallet, f, indent=2)

print("\n✅ Master wallet saved to: master-wallet.json")
print("📝 Next: Send 3 MATIC to the address above")
