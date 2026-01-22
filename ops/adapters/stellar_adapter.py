"""
Stellar Event Adapter - Writes Stellar payment events to Unykorn Rust L1

Usage:
    python ops/adapters/stellar_adapter.py

Environment:
    RUST_L1_INDEXER - Rust L1 indexer URL (default: http://localhost:8089)
    RUST_L1_ADMIN_TOKEN - Admin token for minting
    STELLAR_HORIZON - Horizon URL (default: https://horizon.stellar.org)
"""

import os
import asyncio
import sys
from stellar_sdk import Server
from decimal import Decimal

# Add parent dir to path for rust_l1_gateway import
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from ops.adapters.rust_l1_gateway import RustL1Gateway

RUST_L1_INDEXER = os.getenv("RUST_L1_INDEXER", "http://localhost:8089")
RUST_L1_ADMIN_TOKEN = os.getenv("RUST_L1_ADMIN_TOKEN")
HORIZON = os.getenv("STELLAR_HORIZON", "https://horizon.stellar.org")

# Initialize gateway
gateway = RustL1Gateway(indexer_url=RUST_L1_INDEXER, admin_token=RUST_L1_ADMIN_TOKEN)

# Mapping: Stellar address → ledger account
ACCOUNT_MAPPING = {
    "GDMPZQEQHWZ7KGEILXYVBNOT4QCOWSVFDDHMWL42IM2VZWUEZC6AQ72M": "acct:treasury:STELLAR",
    # Add your distributors here
}

# Stellar asset mapping
ASSET_MAPPING = {
    "native": "XLM",
    "USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN": "USDC",
    "AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA": "AQUA",
    # Add more assets
}

async def credit_account_async(asset: str, account: str, amount_wei: int, memo: str):
    """Credit account via Rust L1 gateway (async wrapper)"""
    # Run sync gateway call in executor
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        lambda: gateway.credit_account(asset, account, amount_wei, memo)
    )

def get_asset_key(op: dict) -> str:
    """Get asset mapping key from operation"""
    if op.get("asset_type") == "native":
        return "native"
    
    code = op.get("asset_code", "")
    issuer = op.get("asset_issuer", "")
    return f"{code}:{issuer}"

async def handle_operation(op: dict, tx_hash: str):
    """Process Stellar payment operation"""
    if op.get("type") != "payment":
        return
    
    to_addr = op.get("to")
    amount = op.get("amount")
    
    # Map destination
    account = ACCOUNT_MAPPING.get(to_addr)
    if not account:
        print(f"Unmapped destination: {to_addr}")
        return
    
    # Map asset
    asset_key = get_asset_key(op)
    asset = ASSET_MAPPING.get(asset_key, asset_key)
    
    # Convert to wei
    value = Decimal(amount)
    amount_wei = int(value * (10 ** 18))
    
    # Credit via Rust L1 gateway
    result = await credit_account_async(
        asset=asset,
        account=account,
        amount_wei=amount_wei,
        memo=f"xlm:{tx_hash}"
    )
    
    print(f"✓ Credited {value} {asset} to {account} (new_balance: {result.get('new_balance_wei')}, state_root: {result.get('state_root')[:16]}...)")

async def stream_payments():
    """Stream Stellar payments"""
    server = Server(HORIZON)
    
    print(f"🔗 Connecting to {HORIZON}")
    print(f"📡 Minting via Rust L1: {RUST_L1_INDEXER}")
    
    # Get cursor for last processed ledger (or 'now')
    cursor = "now"
    
    print(f"✅ Streaming Stellar payments from cursor: {cursor}")
    
    async for tx in server.transactions().cursor(cursor).stream():
        tx_hash = tx.get("hash")
        
        # Fetch operations for this transaction
        ops = server.operations().for_transaction(tx_hash).call()
        
        for op in ops.get("_embedded", {}).get("records", []):
            try:
                await handle_operation(op, tx_hash)
            except Exception as e:
                print(f"❌ Error processing op: {e}")

if __name__ == "__main__":
    asyncio.run(stream_payments())
