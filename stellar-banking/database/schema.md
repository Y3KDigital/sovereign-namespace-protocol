# Database schema for Digital Giant Stellar Infrastructure

## Tables

### accounts
Stores account information for both Stellar and XRPL networks

```sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  network VARCHAR(10) NOT NULL, -- 'stellar' or 'xrpl'
  address VARCHAR(100) NOT NULL UNIQUE,
  public_key VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_accounts_network ON accounts(network);
CREATE INDEX idx_accounts_address ON accounts(address);
```

### transactions
Stores transaction history

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  tx_hash VARCHAR(100) NOT NULL UNIQUE,
  network VARCHAR(10) NOT NULL,
  from_address VARCHAR(100) NOT NULL,
  to_address VARCHAR(100) NOT NULL,
  amount DECIMAL(20, 7) NOT NULL,
  asset VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_from ON transactions(from_address);
CREATE INDEX idx_transactions_to ON transactions(to_address);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
```

### bridge_transactions
Stores cross-chain bridge transactions

```sql
CREATE TABLE bridge_transactions (
  id SERIAL PRIMARY KEY,
  bridge_tx_id VARCHAR(100) NOT NULL UNIQUE,
  source_network VARCHAR(10) NOT NULL,
  destination_network VARCHAR(10) NOT NULL,
  source_address VARCHAR(100) NOT NULL,
  destination_address VARCHAR(100) NOT NULL,
  amount DECIMAL(20, 7) NOT NULL,
  fee DECIMAL(20, 7) NOT NULL,
  asset VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  source_tx_hash VARCHAR(100),
  destination_tx_hash VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  metadata JSONB
);

CREATE INDEX idx_bridge_tx_id ON bridge_transactions(bridge_tx_id);
CREATE INDEX idx_bridge_status ON bridge_transactions(status);
CREATE INDEX idx_bridge_created ON bridge_transactions(created_at DESC);
```

### assets
Stores information about supported assets

```sql
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  issuer VARCHAR(100),
  network VARCHAR(10) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_assets_code ON assets(code);
CREATE INDEX idx_assets_network ON assets(network);
```
