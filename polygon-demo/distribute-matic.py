#!/usr/bin/env python3
"""
Distribute MATIC from master wallet to 5 demo wallets
Sends 0.5 MATIC to each (total 2.5 MATIC)
"""

from web3 import Web3
import json
import time

# Polygon RPC
POLYGON_RPC = "https://polygon-rpc.com"
w3 = Web3(Web3.HTTPProvider(POLYGON_RPC))

# Amount to send per wallet (0.5 MATIC = enough for gas fees)
AMOUNT_PER_WALLET = Web3.to_wei(0.5, 'ether')

def load_master_wallet():
    """Load master distributor wallet"""
    with open("master-wallet.json", "r") as f:
        return json.load(f)

def load_demo_wallets():
    """Load 5 demo wallets"""
    with open("wallets-generated.json", "r") as f:
        return json.load(f)["wallets"]

def check_balance(address):
    """Check MATIC balance"""
    balance_wei = w3.eth.get_balance(address)
    balance_matic = Web3.from_wei(balance_wei, 'ether')
    return balance_matic

def send_matic(from_private_key, to_address, amount_wei):
    """Send MATIC transaction"""
    
    # Get account from private key
    account = w3.eth.account.from_key(from_private_key)
    
    # Get current nonce
    nonce = w3.eth.get_transaction_count(account.address)
    
    # Get current gas price
    gas_price = w3.eth.gas_price
    
    # Build transaction
    tx = {
        'nonce': nonce,
        'to': to_address,
        'value': amount_wei,
        'gas': 21000,  # Standard transfer
        'gasPrice': gas_price,
        'chainId': 137  # Polygon Mainnet
    }
    
    # Sign transaction
    signed_tx = w3.eth.account.sign_transaction(tx, from_private_key)
    
    # Send transaction
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    return tx_hash.hex()

def main():
    print("💸 MATIC Distribution Starting...")
    print("="*60)
    
    # Load wallets
    master = load_master_wallet()
    demo_wallets = load_demo_wallets()
    
    # Check master balance
    print(f"\n📊 Master Wallet: {master['address']}")
    master_balance = check_balance(master['address'])
    print(f"Balance: {master_balance} MATIC")
    
    # Verify sufficient balance
    required = Web3.from_wei(AMOUNT_PER_WALLET * 5, 'ether')
    if master_balance < required:
        print(f"\n❌ ERROR: Insufficient balance!")
        print(f"Required: {required} MATIC")
        print(f"Current:  {master_balance} MATIC")
        print(f"\nPlease send {required - master_balance} more MATIC to:")
        print(master['address'])
        return
    
    print(f"\n✅ Sufficient balance: {master_balance} MATIC")
    print(f"Will send: {Web3.from_wei(AMOUNT_PER_WALLET, 'ether')} MATIC to each wallet")
    
    # Distribute to each wallet
    results = []
    
    for i, wallet in enumerate(demo_wallets, 1):
        print(f"\n{'='*60}")
        print(f"Wallet {i}: {wallet['address']}")
        print(f"Purpose: {wallet['purpose']}")
        
        try:
            # Send MATIC
            tx_hash = send_matic(
                master['private_key'],
                wallet['address'],
                AMOUNT_PER_WALLET
            )
            
            print(f"✅ Sent: {Web3.from_wei(AMOUNT_PER_WALLET, 'ether')} MATIC")
            print(f"TX: https://polygonscan.com/tx/{tx_hash}")
            
            results.append({
                "wallet_id": i,
                "address": wallet['address'],
                "amount_matic": Web3.from_wei(AMOUNT_PER_WALLET, 'ether'),
                "tx_hash": tx_hash,
                "status": "success"
            })
            
            # Wait 2 seconds between transactions
            if i < len(demo_wallets):
                print("⏳ Waiting 2 seconds...")
                time.sleep(2)
            
        except Exception as e:
            print(f"❌ Error: {e}")
            results.append({
                "wallet_id": i,
                "address": wallet['address'],
                "status": "failed",
                "error": str(e)
            })
    
    # Summary
    print(f"\n{'='*60}")
    print("DISTRIBUTION COMPLETE")
    print(f"{'='*60}")
    
    successful = sum(1 for r in results if r['status'] == 'success')
    print(f"\n✅ Successful: {successful}/5")
    
    if successful < 5:
        print(f"❌ Failed: {5 - successful}/5")
    
    # Check remaining balance
    remaining = check_balance(master['address'])
    print(f"\n💰 Master wallet remaining: {remaining} MATIC")
    
    # Save results
    with open("distribution-results.json", "w") as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "master_wallet": master['address'],
            "amount_per_wallet": Web3.from_wei(AMOUNT_PER_WALLET, 'ether'),
            "total_distributed": Web3.from_wei(AMOUNT_PER_WALLET * successful, 'ether'),
            "results": results
        }, f, indent=2)
    
    print(f"\n📄 Results saved to: distribution-results.json")
    print("\n🎉 Done! All wallets funded and ready to mint!")

if __name__ == "__main__":
    # Check if files exist
    try:
        with open("master-wallet.json", "r") as f:
            pass
        with open("wallets-generated.json", "r") as f:
            pass
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print("Run create-master-wallet.py and generate-wallets.py first")
        exit(1)
    
    main()
