use anyhow::Result;
use chrono::{Utc};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Posting {
    pub id: String,
    pub ts_utc: String,
    pub asset: String,
    pub account: String,
    pub side: String,       // "CR" or "DR"
    pub amount_wei: i128,   // 18 decimals
    pub memo: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Balance {
    pub asset: String,
    pub account: String,
    pub balance_wei: i128,
}

pub struct Ledger {
    conn: Connection,
}

impl Ledger {
    pub fn open(db_path: &str) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        Ok(Self { conn })
    }

    pub fn init(&self, schema_sql: &str) -> Result<()> {
        self.conn.execute_batch(schema_sql)?;
        Ok(())
    }

    pub fn upsert_asset(&self, symbol: &str, decimals: i64, policy_uri: Option<&str>) -> Result<()> {
        self.conn.execute(
            "insert into assets(symbol,decimals,policy_uri) values(?1,?2,?3)
             on conflict(symbol) do update set decimals=excluded.decimals, policy_uri=excluded.policy_uri",
            params![symbol, decimals, policy_uri],
        )?;
        Ok(())
    }

    pub fn upsert_account(&self, account: &str, display: Option<&str>) -> Result<()> {
        self.conn.execute(
            "insert into accounts(account,display_name) values(?1,?2)
             on conflict(account) do update set display_name=excluded.display_name",
            params![account, display],
        )?;
        Ok(())
    }

    pub fn post(&self, asset: &str, account: &str, side: &str, amount_wei: i128, memo: Option<&str>) -> Result<String> {
        anyhow::ensure!(amount_wei > 0, "amount must be positive");
        anyhow::ensure!(side == "CR" || side == "DR", "side must be CR or DR");

        // For DR, ensure non-negative balance after
        if side == "DR" {
            let bal = self.balance_of(asset, account)?;
            anyhow::ensure!(bal >= (amount_wei as i128), "insufficient balance");
        }

        let id = Uuid::new_v4().to_string();
        let ts = Utc::now().to_rfc3339();
        self.conn.execute(
            "insert into postings(id,ts_utc,asset,account,side,amount_wei,memo)
             values(?1,?2,?3,?4,?5,?6,?7)",
            params![id, ts, asset, account, side, amount_wei.to_string(), memo],
        )?;
        Ok(id)
    }

    pub fn transfer(&self, asset: &str, from_acct: &str, to_acct: &str, amount_wei: i128, memo: Option<&str>) -> Result<(String,String)> {
        self.conn.execute("begin immediate", [])?;
        // debit from
        let dr = self.post(asset, from_acct, "DR", amount_wei, memo)?;
        // credit to
        let cr = self.post(asset, to_acct, "CR", amount_wei, memo)?;
        self.conn.execute("commit", [])?;
        Ok((dr, cr))
    }

    pub fn balance_of(&self, asset: &str, account: &str) -> Result<i128> {
        let mut stmt = self.conn.prepare(
            "select coalesce(sum(case when side='CR' then amount_wei else -amount_wei end),0)
             from postings where asset=?1 and account=?2"
        )?;
        let val: i128 = stmt.query_row(params![asset, account], |row| row.get::<_, i128>(0))?;
        Ok(val)
    }

    pub fn balances_for_account(&self, account: &str) -> Result<Vec<Balance>> {
        let mut stmt = self.conn.prepare(
            "select asset,
                    coalesce(sum(case when side='CR' then amount_wei else -amount_wei end),0) as bal
             from postings where account=?1 group by asset order by asset"
        )?;
        let mut rows = stmt.query(params![account])?;
        let mut out = vec![];
        while let Some(r) = rows.next()? {
            out.push(Balance {
                asset: r.get::<_, String>(0)?,
                account: account.to_string(),
                balance_wei: r.get::<_, i128>(1)?,
            });
        }
        Ok(out)
    }

    pub fn list_assets(&self) -> Result<Vec<(String, i64, Option<String>)>> {
        let mut stmt = self.conn.prepare("select symbol,decimals,policy_uri from assets order by symbol")?;
        let rows = stmt.query_map([], |r| {
            Ok((r.get::<_, String>(0)?, r.get::<_, i64>(1)?, r.get::<_, Option<String>>(2)?))
        })?;
        let mut out = vec![];
        for row in rows { out.push(row?); }
        Ok(out)
    }

    pub fn audit_hash_system(&self) -> Result<String> {
        let mut stmt = self.conn.prepare(
            "select asset,account,side,amount_wei,ts_utc,id from postings order by asset,account,ts_utc,id"
        )?;
        let mut rows = stmt.query([])?;
        let mut hasher = Sha256::new();
        while let Some(r) = rows.next()? {
            let asset: String = r.get(0)?;
            let account: String = r.get(1)?;
            let side: String = r.get(2)?;
            let amount: String = r.get(3)?;
            let ts: String = r.get(4)?;
            let id: String = r.get(5)?;
            hasher.update(asset.as_bytes());
            hasher.update(account.as_bytes());
            hasher.update(side.as_bytes());
            hasher.update(amount.as_bytes());
            hasher.update(ts.as_bytes());
            hasher.update(id.as_bytes());
        }
        Ok(hex::encode(hasher.finalize()))
    }
}
