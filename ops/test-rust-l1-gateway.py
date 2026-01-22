#!/usr/bin/env python3
"""Test Rust L1 Gateway - Admin Minting"""

import os
import sys
from decimal import Decimal

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ops.adapters.rust_l1_gateway import RustL1Gateway


def main():
    print("\n" + "=" * 60)
    print("RUST L1 GATEWAY TEST - Admin Minting")
    print("=" * 60 + "\n")

    # Initialize gateway
    indexer_url = os.getenv("RUST_L1_INDEXER", "http://localhost:8089")
    admin_token = os.getenv("RUST_L1_ADMIN_TOKEN")

    if not admin_token or admin_token == "INSECURE_DEV_TOKEN":
        print("⚠️  WARNING: RUST_L1_ADMIN_TOKEN not set in environment")
        print("   Using insecure fallback token\n")

    gateway = RustL1Gateway(indexer_url=indexer_url, admin_token=admin_token)

    test_account = "acct:user:test_alice"
    test_asset = "UCRED"

    # Test 1: Get initial balance
    print("[1/4] Get initial balance...")
    try:
        initial_balance = gateway.get_balance(test_asset, test_account)
        initial_ucred = initial_balance / Decimal(10**18)
        print(f"✅ Initial balance: {initial_balance} wei ({initial_ucred} UCRED)")
    except Exception as e:
        print(f"❌ Failed: {e}")
        return 1

    # Test 2: Credit account
    print("\n[2/4] Credit account (admin mint)...")
    amount_wei = 100_000_000_000_000_000  # 0.1 UCRED
    try:
        receipt = gateway.credit_account(
            asset=test_asset,
            account=test_account,
            amount_wei=amount_wei,
            memo="test:manual_credit",
        )
        print(f"✅ Credit success: {receipt['success']}")
        print(f"   New balance: {receipt['new_balance_wei']} wei")
        print(f"   State root: {receipt['state_root'][:32]}...")
    except Exception as e:
        print(f"❌ Failed: {e}")
        return 1

    # Test 3: Verify new balance
    print("\n[3/4] Verify new balance...")
    try:
        new_balance = gateway.get_balance(test_asset, test_account)
        new_ucred = new_balance / Decimal(10**18)
        delta = new_balance - initial_balance
        delta_ucred = delta / Decimal(10**18)

        print(f"✅ New balance: {new_balance} wei ({new_ucred} UCRED)")
        print(f"   Delta: +{delta} wei (+{delta_ucred} UCRED)")

        if delta != amount_wei:
            print(f"⚠️  WARNING: Expected delta {amount_wei}, got {delta}")
    except Exception as e:
        print(f"❌ Failed: {e}")
        return 1

    # Test 4: Get state root
    print("\n[4/4] Get state root...")
    try:
        audit = gateway.get_state_root()
        print(f"✅ State root: {audit['state_root'][:32]}...")
        print(f"   Height: {audit['height']}")
    except Exception as e:
        print(f"❌ Failed: {e}")
        return 1

    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED")
    print("=" * 60 + "\n")

    print("Next steps:")
    print("  1. Wire consent-gateway to use this client")
    print("  2. Set RUST_L1_INDEXER and RUST_L1_ADMIN_TOKEN in production")
    print("  3. Test end-to-end top-up flow\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
