-- Immutable postings journal (CR/DR)
create table if not exists postings (
  id            text primary key,        -- uuid v4
  ts_utc        text not null,           -- ISO8601
  asset         text not null,           -- e.g., UUSD, UCRED, GOLD
  account       text not null,           -- acct:user:{sub} or treasury:xxx
  side          text not null,           -- "CR" or "DR"
  amount_wei    integer not null,        -- 18 decimals
  memo          text
);

create index if not exists idx_postings_account on postings(account);
create index if not exists idx_postings_asset on postings(asset);

-- Logical accounts (registry)
create table if not exists accounts (
  account       text primary key,
  display_name  text
);

-- Assets registry (truth list)
create table if not exists assets (
  symbol        text primary key,        -- UUSD, UCRED, GOLD, etc.
  decimals      integer not null,        -- 18
  policy_uri    text                     -- PoR / redemption policy
);

-- Daily snapshots (for /audit)
create table if not exists snapshots (
  day_utc       text not null,           -- YYYY-MM-DD
  scope         text not null,           -- "system", "asset:UUSD", etc.
  hash_hex      text not null,
  primary key (day_utc, scope)
);
