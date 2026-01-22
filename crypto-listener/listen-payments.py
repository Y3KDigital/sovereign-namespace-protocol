#!/usr/bin/env python3
"""
Crypto Payment Listener
Watches Stellar & XRPL for incoming payments, auto-generates certificates

No admin terminal needed - runs as normal user
"""

import asyncio
import json
import os
from datetime import datetime
from stellar_sdk import Server, Asset
from xrpl.clients import JsonRpcClient
from xrpl.models import AccountTx

# Configuration
STELLAR_SERVER = "https://horizon.stellar.org"
XRPL_SERVER = "https://s1.ripple.com:51234"

# Payment addresses (REPLACE WITH REAL ADDRESSES)
STELLAR_ADDRESS = "GBQVZ4XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
XRPL_ADDRESS = "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# Pricing (in USD)
PRICING = {
    "founder": 7500,
    "premier": 3500,
    "distinguished": 1250,
    "standard": 350,
    "essential": 125,
    "basic": 35
}

# Processed transactions (prevent double-spend)
processed_txs = set()


def load_processed_txs():
    """Load already-processed transaction IDs"""
    try:
        with open("processed_txs.json", "r") as f:
            return set(json.load(f))
    except FileNotFoundError:
        return set()


def save_processed_tx(tx_id):
    """Mark transaction as processed"""
    processed_txs.add(tx_id)
    with open("processed_txs.json", "w") as f:
        json.dump(list(processed_txs), f)


def generate_certificate(namespace, customer_email, payment_tx):
    """Generate namespace certificate after payment confirmation"""
    cert = {
        "version": "1.0.0",
        "namespace": namespace,
        "type": "PURCHASED",
        "customer_email": customer_email,
        "genesis_hash": "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc",
        "payment": {
            "tx_id": payment_tx["tx_id"],
            "amount": payment_tx["amount"],
            "currency": payment_tx["currency"],
            "network": payment_tx["network"],
            "timestamp": payment_tx["timestamp"]
        },
        "issued_at": datetime.utcnow().isoformat() + "Z",
        "claim_token": f"{namespace}-{datetime.utcnow().strftime('%Y-%m-%d')}-{os.urandom(16).hex()}"
    }
    
    # Save certificate
    cert_path = f"../genesis/ARTIFACTS/certificates/purchased/{namespace}.json"
    os.makedirs(os.path.dirname(cert_path), exist_ok=True)
    with open(cert_path, "w") as f:
        json.dump(cert, f, indent=2)
    
    print(f"✅ Certificate generated: {cert_path}")
    return cert


def send_claim_email(customer_email, namespace, claim_token):
    """Send claim token to customer (TODO: integrate SendGrid/Mailgun)"""
    print(f"\n📧 EMAIL TO: {customer_email}")
    print(f"Subject: Your {namespace} Namespace is Ready!")
    print(f"\nClaim your namespace:")
    print(f"https://y3kmarkets.com/claim?token={claim_token}")
    print(f"\n" + "="*60 + "\n")
    
    # TODO: Replace with actual email service
    # sendgrid_client.send(...)


async def listen_stellar():
    """Monitor Stellar for USDC/USDT/XLM payments"""
    server = Server(STELLAR_SERVER)
    cursor = "now"
    
    print(f"👂 Listening for Stellar payments to {STELLAR_ADDRESS}...")
    
    while True:
        try:
            # Get latest transactions
            txs = server.transactions().for_account(STELLAR_ADDRESS).cursor(cursor).call()
            
            for tx in txs.get("_embedded", {}).get("records", []):
                tx_id = tx["id"]
                
                # Skip if already processed
                if tx_id in processed_txs:
                    continue
                
                # Get operations (payments)
                ops = server.operations().for_transaction(tx_id).call()
                
                for op in ops.get("_embedded", {}).get("records", []):
                    if op["type"] == "payment" and op["to"] == STELLAR_ADDRESS:
                        amount = float(op["amount"])
                        asset = op.get("asset_code", "XLM")
                        memo = tx.get("memo", "")
                        
                        print(f"\n💰 Payment detected: {amount} {asset}")
                        print(f"   Memo: {memo}")
                        print(f"   TX: {tx_id}")
                        
                        # Extract customer email from memo
                        customer_email = memo.strip()
                        
                        if "@" in customer_email:
                            # TODO: Match amount to namespace tier
                            namespace = "222.x"  # Placeholder
                            
                            payment_tx = {
                                "tx_id": tx_id,
                                "amount": amount,
                                "currency": asset,
                                "network": "stellar",
                                "timestamp": tx["created_at"]
                            }
                            
                            # Generate certificate
                            cert = generate_certificate(namespace, customer_email, payment_tx)
                            
                            # Send claim email
                            send_claim_email(customer_email, namespace, cert["claim_token"])
                            
                            # Mark as processed
                            save_processed_tx(tx_id)
                            
                            print(f"✅ Purchase complete: {namespace} → {customer_email}")
                        else:
                            print(f"⚠️ Invalid memo (expected email): {memo}")
                
                cursor = tx["paging_token"]
            
            # Poll every 5 seconds
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"❌ Stellar error: {e}")
            await asyncio.sleep(10)


async def listen_xrpl():
    """Monitor XRPL for XRP payments"""
    client = JsonRpcClient(XRPL_SERVER)
    
    print(f"👂 Listening for XRPL payments to {XRPL_ADDRESS}...")
    
    while True:
        try:
            # Get account transactions
            response = client.request(AccountTx(
                account=XRPL_ADDRESS,
                ledger_index_min=-1,
                ledger_index_max=-1,
                limit=10
            ))
            
            for tx in response.result.get("transactions", []):
                tx_data = tx.get("tx", {})
                tx_id = tx_data.get("hash")
                
                # Skip if already processed
                if tx_id in processed_txs:
                    continue
                
                # Check if payment to our address
                if tx_data.get("TransactionType") == "Payment" and \
                   tx_data.get("Destination") == XRPL_ADDRESS:
                    
                    amount = float(tx_data.get("Amount", 0)) / 1_000_000  # Convert drops to XRP
                    memo_hex = tx_data.get("Memos", [{}])[0].get("Memo", {}).get("MemoData", "")
                    memo = bytes.fromhex(memo_hex).decode("utf-8") if memo_hex else ""
                    
                    print(f"\n💰 XRP Payment detected: {amount} XRP")
                    print(f"   Memo: {memo}")
                    print(f"   TX: {tx_id}")
                    
                    customer_email = memo.strip()
                    
                    if "@" in customer_email:
                        namespace = "333.x"  # Placeholder
                        
                        payment_tx = {
                            "tx_id": tx_id,
                            "amount": amount,
                            "currency": "XRP",
                            "network": "xrpl",
                            "timestamp": datetime.utcnow().isoformat() + "Z"
                        }
                        
                        cert = generate_certificate(namespace, customer_email, payment_tx)
                        send_claim_email(customer_email, namespace, cert["claim_token"])
                        save_processed_tx(tx_id)
                        
                        print(f"✅ Purchase complete: {namespace} → {customer_email}")
                    else:
                        print(f"⚠️ Invalid memo: {memo}")
            
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"❌ XRPL error: {e}")
            await asyncio.sleep(10)


async def main():
    """Run both listeners concurrently"""
    global processed_txs
    processed_txs = load_processed_txs()
    
    print("🚀 Crypto Payment Listener Started")
    print("="*60)
    print(f"Stellar Address: {STELLAR_ADDRESS}")
    print(f"XRPL Address: {XRPL_ADDRESS}")
    print(f"Processed TXs: {len(processed_txs)}")
    print("="*60)
    
    # Run both listeners
    await asyncio.gather(
        listen_stellar(),
        listen_xrpl()
    )


if __name__ == "__main__":
    asyncio.run(main())
