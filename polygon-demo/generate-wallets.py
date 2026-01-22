#!/usr/bin/env python3
"""
Generate 5 Polygon wallets for UD comparison demo
"""

from eth_account import Account
import json
import secrets

# Enable unaudited HD wallet features
Account.enable_unaudited_hdwallet_features()

def generate_wallets(count=5):
    """Generate Polygon-compatible wallets"""
    wallets = []
    
    for i in range(1, count + 1):
        # Generate random private key
        private_key = "0x" + secrets.token_hex(32)
        
        # Create account from private key
        account = Account.from_key(private_key)
        
        wallet = {
            "id": i,
            "name": f"Demo Wallet {i}",
            "address": account.address,
            "private_key": private_key,
            "balance_matic": 0,
            "purpose": get_purpose(i)
        }
        
        wallets.append(wallet)
        
        print(f"\n{'='*60}")
        print(f"Wallet {i}")
        print(f"{'='*60}")
        print(f"Address:     {account.address}")
        print(f"Private Key: {private_key}")
        print(f"Purpose:     {get_purpose(i)}")
    
    return wallets


def get_purpose(wallet_id):
    """Define purpose for each wallet"""
    purposes = {
        1: "UD .x high-end domain (crypto.x, money.x equivalent)",
        2: "UD .x premium domain (master.x, player.x equivalent)",
        3: "UD .crypto domain #1 (elite.crypto, vault.crypto)",
        4: "UD .crypto domain #2 (finance.crypto, pay.crypto)",
        5: "Y3K comparison wallet (demonstrate value difference)"
    }
    return purposes.get(wallet_id, "General demo wallet")


def save_wallets(wallets, filename="wallets-generated.json"):
    """Save wallets to JSON file"""
    data = {
        "description": "5 Polygon wallets for UD vs Y3K comparison demo",
        "network": "Polygon Mainnet",
        "chain_id": 137,
        "rpc_url": "https://polygon-rpc.com",
        "explorer": "https://polygonscan.com",
        "wallets": wallets,
        "next_steps": [
            "1. Fund each wallet with ~0.1 MATIC (for gas fees)",
            "2. Run mint-ud-domains.py to mint .x and .crypto domains",
            "3. Compare costs: UD charges $5k-$51k, Y3K charges $35-$7.5k",
            "4. Demonstrate soulbound (non-transferable) feature"
        ]
    }
    
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✅ Wallets saved to: {filename}")


def print_funding_instructions(wallets):
    """Print instructions for funding wallets"""
    print(f"\n{'='*60}")
    print("FUNDING INSTRUCTIONS")
    print(f"{'='*60}")
    print("\nSend MATIC to these addresses:")
    print("(Recommended: 0.1 MATIC per wallet = 0.5 MATIC total)")
    print()
    
    for w in wallets:
        print(f"Wallet {w['id']}: {w['address']}")
    
    print(f"\n{'='*60}")
    print("How to fund:")
    print("1. Use MetaMask/Coinbase Wallet")
    print("2. Switch to Polygon network")
    print("3. Send 0.1 MATIC to each address")
    print("4. Wait for confirmations (2-3 seconds)")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    print("🔐 Generating 5 Polygon Wallets for UD Demo...")
    print("="*60)
    
    # Generate wallets
    wallets = generate_wallets(5)
    
    # Save to file
    save_wallets(wallets)
    
    # Print funding instructions
    print_funding_instructions(wallets)
    
    print("\n✅ DONE! Wallets generated.")
    print("📝 Next: Fund wallets with MATIC, then run mint-ud-domains.py")
