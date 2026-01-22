//! Balance ledger: tracks account balances for registered assets.
//! 
//! This is the **sovereign mint**—balances are ONLY mutated by authorized operations
//! (consent gateway, yields, governance).

use anyhow::{anyhow, Result};
use blake3::Hasher;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Account identifier (acct:user:{sub}, acct:treasury:MAIN, etc.)
pub type AccountId = String;

/// Asset symbol (UCRED, UUSD, GOLD, etc.)
pub type AssetSymbol = String;

/// Balance in smallest unit (wei-style, 18 decimals)
pub type BalanceWei = u128;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Balance {
    pub asset: AssetSymbol,
    pub account: AccountId,
    pub balance_wei: BalanceWei,
}

#[derive(Debug, Default, Clone)]
pub struct BalanceLedger {
    /// (asset, account) → balance_wei
    balances: HashMap<(AssetSymbol, AccountId), BalanceWei>,
}

impl BalanceLedger {
    /// Credit an account (mint or transfer).
    pub fn credit(&mut self, asset: &str, account: &str, amount_wei: BalanceWei) -> Result<()> {
        if amount_wei == 0 {
            return Err(anyhow!("credit amount must be > 0"));
        }

        let key = (asset.to_uppercase(), account.to_string());
        let current = self.balances.get(&key).copied().unwrap_or(0);
        let new_balance = current
            .checked_add(amount_wei)
            .ok_or_else(|| anyhow!("balance overflow"))?;

        self.balances.insert(key, new_balance);
        Ok(())
    }

    /// Debit an account (burn or transfer).
    pub fn debit(&mut self, asset: &str, account: &str, amount_wei: BalanceWei) -> Result<()> {
        if amount_wei == 0 {
            return Err(anyhow!("debit amount must be > 0"));
        }

        let key = (asset.to_uppercase(), account.to_string());
        let current = self.balances.get(&key).copied().unwrap_or(0);
        if current < amount_wei {
            return Err(anyhow!(
                "insufficient balance: {} has {} wei, need {} wei",
                account,
                current,
                amount_wei
            ));
        }

        let new_balance = current - amount_wei;
        if new_balance == 0 {
            self.balances.remove(&key);
        } else {
            self.balances.insert(key, new_balance);
        }
        Ok(())
    }

    /// Transfer between accounts (atomic debit + credit).
    pub fn transfer(
        &mut self,
        asset: &str,
        from: &str,
        to: &str,
        amount_wei: BalanceWei,
    ) -> Result<()> {
        self.debit(asset, from, amount_wei)?;
        self.credit(asset, to, amount_wei)?;
        Ok(())
    }

    /// Query single asset balance for an account.
    pub fn balance_of(&self, asset: &str, account: &str) -> BalanceWei {
        let key = (asset.to_uppercase(), account.to_string());
        self.balances.get(&key).copied().unwrap_or(0)
    }

    /// Query all asset balances for an account.
    pub fn balances_for_account(&self, account: &str) -> Vec<Balance> {
        self.balances
            .iter()
            .filter(|((_, acc), _)| acc == account)
            .map(|((asset, account), balance_wei)| Balance {
                asset: asset.clone(),
                account: account.clone(),
                balance_wei: *balance_wei,
            })
            .collect()
    }

    /// List all non-zero balances (for audit/snapshot).
    pub fn list_all_balances(&self) -> Vec<Balance> {
        self.balances
            .iter()
            .map(|((asset, account), balance_wei)| Balance {
                asset: asset.clone(),
                account: account.clone(),
                balance_wei: *balance_wei,
            })
            .collect()
    }

    /// Deterministic commitment hash over all balances.
    pub fn commitment_hash_hex(&self) -> String {
        const DOMAIN: &[u8] = b"uny-korn-state-balances-v1";

        let mut hasher = Hasher::new();
        hasher.update(DOMAIN);

        // Sort by (asset, account) for determinism
        let mut sorted: Vec<_> = self.balances.iter().collect();
        sorted.sort_by(|(k1, _), (k2, _)| k1.cmp(k2));

        for ((asset, account), balance_wei) in sorted {
            hasher.update(b"|");
            hasher.update(asset.as_bytes());
            hasher.update(b"|");
            hasher.update(account.as_bytes());
            hasher.update(b"|");
            hasher.update(&balance_wei.to_le_bytes());
        }

        hex::encode(*hasher.finalize().as_bytes())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn credit_and_balance_of() {
        let mut ledger = BalanceLedger::default();
        ledger
            .credit("UCRED", "acct:user:alice", 1_000_000_000_000_000_000)
            .unwrap();

        assert_eq!(
            ledger.balance_of("UCRED", "acct:user:alice"),
            1_000_000_000_000_000_000
        );
    }

    #[test]
    fn debit_insufficient_balance() {
        let mut ledger = BalanceLedger::default();
        ledger
            .credit("UCRED", "acct:user:bob", 500)
            .unwrap();

        let result = ledger.debit("UCRED", "acct:user:bob", 1000);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("insufficient"));
    }

    #[test]
    fn transfer_atomic() {
        let mut ledger = BalanceLedger::default();
        ledger
            .credit("UUSD", "acct:treasury:MAIN", 10_000)
            .unwrap();

        ledger
            .transfer("UUSD", "acct:treasury:MAIN", "acct:user:charlie", 3_000)
            .unwrap();

        assert_eq!(ledger.balance_of("UUSD", "acct:treasury:MAIN"), 7_000);
        assert_eq!(ledger.balance_of("UUSD", "acct:user:charlie"), 3_000);
    }

    #[test]
    fn commitment_is_deterministic() {
        let mut a = BalanceLedger::default();
        a.credit("UCRED", "acct:user:alice", 1000).unwrap();
        a.credit("UUSD", "acct:user:bob", 2000).unwrap();

        let mut b = BalanceLedger::default();
        b.credit("UUSD", "acct:user:bob", 2000).unwrap();
        b.credit("UCRED", "acct:user:alice", 1000).unwrap();

        assert_eq!(a.commitment_hash_hex(), b.commitment_hash_hex());
    }
}
