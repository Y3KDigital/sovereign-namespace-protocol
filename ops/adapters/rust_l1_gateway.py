"""
Rust L1 Gateway Client - mints UCRED on Unykorn Rust L1.

Replaces web3/EVM calls with native Rust L1 state mutations.
Used by consent-gateway to credit accounts after top-up verification.
"""

import json
import os
import requests
from typing import Optional
from decimal import Decimal


class RustL1Gateway:
    """Client for minting/crediting on Rust L1 via indexer API."""

    def __init__(
        self,
        indexer_url: str = "http://localhost:8089",
        admin_token: Optional[str] = None,
    ):
        """
        Initialize gateway client.

        Args:
            indexer_url: Rust L1 indexer API base URL
            admin_token: Operator admin token (defaults to RUST_L1_ADMIN_TOKEN env var)
        """
        self.indexer_url = indexer_url.rstrip("/")
        self.admin_token = admin_token or os.getenv(
            "RUST_L1_ADMIN_TOKEN", "INSECURE_DEV_TOKEN"
        )

    def get_balance(self, asset: str, account: str) -> Decimal:
        """
        Query account balance from Rust L1.

        Args:
            asset: Asset symbol (UCRED, UUSD, etc.)
            account: Account ID (acct:user:{sub})

        Returns:
            Balance in wei (18 decimals)
        """
        url = f"{self.indexer_url}/balances?account={account}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        balances = response.json()
        for bal in balances:
            if bal["asset"].upper() == asset.upper():
                return Decimal(bal["balance_wei"])

        return Decimal(0)

    def credit_account(
        self,
        asset: str,
        account: str,
        amount_wei: int,
        memo: str,
    ) -> dict:
        """
        Credit an account via admin endpoint (operator consent).

        Args:
            asset: Asset symbol (UCRED)
            account: Account ID (acct:user:{sub})
            amount_wei: Amount to credit (wei units)
            memo: Transaction memo (topup:{tx_hash})

        Returns:
            {"success": true, "new_balance_wei": "...", "state_root": "..."}
        """
        url = f"{self.indexer_url}/admin/credit"
        payload = {
            "asset": asset.upper(),
            "account": account,
            "amount_wei": str(amount_wei),
            "memo": memo,
            "operator_token": self.admin_token,
        }

        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()

        return response.json()

    def get_state_root(self) -> dict:
        """
        Get current Rust L1 state root and height.

        Returns:
            {"state_root": "0xabc...", "height": 12345}
        """
        url = f"{self.indexer_url}/audit"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()


# Example usage
if __name__ == "__main__":
    gateway = RustL1Gateway()

    # Query balance
    balance = gateway.get_balance("UCRED", "acct:user:alice")
    print(f"Alice UCRED balance: {balance} wei")

    # Credit account (dev mode)
    receipt = gateway.credit_account(
        asset="UCRED",
        account="acct:user:alice",
        amount_wei=100_000_000_000_000_000,  # 0.1 UCRED
        memo="topup:0x1234...",
    )
    print(f"Credit receipt: {receipt}")

    # Check state root
    audit = gateway.get_state_root()
    print(f"State root: {audit['state_root']} @ height {audit['height']}")
