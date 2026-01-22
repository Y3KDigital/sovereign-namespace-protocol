"""
XRPL Event Adapter - Writes XRPL trustline/payment events to Unykorn Rust L1

Usage:
    python ops/adapters/xrpl_adapter.py

Environment:
    RUST_L1_INDEXER - Rust L1 indexer URL (default: http://localhost:8089)
    RUST_L1_ADMIN_TOKEN - Admin token for minting
    XRPL_WEBSOCKET - XRPL node URL (default: wss://s1.ripple.com)
"""

import os
import json
import asyncio
import sys
from xrpl.asyncio.clients import AsyncWebsocketClient
from xrpl.models import Subscribe, StreamParameter
from decimal import Decimal

# Add parent dir to path for rust_l1_gateway import
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from ops.adapters.rust_l1_gateway import RustL1Gateway

RUST_L1_INDEXER = os.getenv("RUST_L1_INDEXER", "http://localhost:8089")
RUST_L1_ADMIN_TOKEN = os.getenv("RUST_L1_ADMIN_TOKEN")
XRPL_WS = os.getenv("XRPL_WEBSOCKET", "wss://s1.ripple.com")

# Initialize gateway
gateway = RustL1Gateway(indexer_url=RUST_L1_INDEXER, admin_token=RUST_L1_ADMIN_TOKEN)

# Mapping: XRPL address → ledger account
ACCOUNT_MAPPING = {
    "rBXxr5NvZiimDEbdRNBxxxxxYYYYYYYYYY": "acct:user:demo",
    "rN7n7otQDd6FczFgLdlxxxxxxxxZZZZZZ": "acct:treasury:MAIN",
    # Add your actual mappings here
}

# XRPL asset mapping
CURRENCY_MAPPING = {
    "USD": "UUSD",
    "534f4c4f00000000000000000000000000000000": "XRP",  # hex for 'SOLO'
    # Add more currencies
}

async def credit_account_async(asset: str, account: str, amount_wei: int, memo: str):
    """Credit account via Rust L1 gateway (async wrapper)"""
    # Run sync gateway call in executor
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        lambda: gateway.credit_account(asset, account, amount_wei, memo)
    )

async def handle_transaction(tx: dict):
    """Process XRPL transaction"""
    tx_type = tx.get("TransactionType")
    
    if tx_type == "Payment":
        dest = tx.get("Destination")
        amount = tx.get("Amount")
        tx_hash = tx.get("hash")
        
        # Map destination to ledger account
        account = ACCOUNT_MAPPING.get(dest)
        if not account:
            print(f"Unmapped destination: {dest}")
            return
        
        # Parse amount (string for IOU, number for XRP)
        if isinstance(amount, dict):
            # IOU
            value = Decimal(amount["value"])
            currency = amount.get("currency", "USD")
            asset = CURRENCY_MAPPING.get(currency, currency)
        else:
            # XRP (in drops)
            value = Decimal(amount) / Decimal("1000000")  # drops to XRP
            asset = "XRP"
        
        # Convert to wei (18 decimals)
        amount_wei = int(value * (10 ** 18))
        
        # Credit via Rust L1 gateway
        result = await credit_account_async(
            asset=asset,
            account=account,
            amount_wei=amount_wei,
            memo=f"xrpl:{tx_hash}"
        )
        
        print(f"✓ Credited {value} {asset} to {account} (new_balance: {result.get('new_balance_wei')}, state_root: {result.get('state_root')[:16]}...)")

async def main():
    """Subscribe to XRPL transactions"""
    print(f"🔗 Connecting to {XRPL_WS}")
    print(f"📡 Minting via Rust L1: {RUST_L1_INDEXER}")
    
    async with AsyncWebsocketClient(XRPL_WS) as client:
        # Subscribe to transactions for monitored accounts
        await client.send(Subscribe(
            streams=[StreamParameter.TRANSACTIONS]
        ))
        
        print("✅ Subscribed to XRPL stream")
        
        async for message in client:
            if isinstance(message, dict) and "transaction" in message:
                tx = message["transaction"]
                try:
                    await handle_transaction(tx)
                except Exception as e:
                    print(f"❌ Error processing tx: {e}")

if __name__ == "__main__":
    asyncio.run(main())
