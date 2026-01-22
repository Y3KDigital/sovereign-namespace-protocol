import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, '../genesis-payments.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create payments table
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    root INTEGER NOT NULL CHECK(root >= 100 AND root <= 999),
    asset TEXT NOT NULL CHECK(asset IN ('BTC', 'ETH', 'USDC', 'USDT')),
    expected_usd DECIMAL NOT NULL,
    tx_hash TEXT,
    confirmations INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'complete')),
    created_at INTEGER NOT NULL,
    confirmed_at INTEGER,
    certificate_ipfs_hash TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_status ON payments(status);
  CREATE INDEX IF NOT EXISTS idx_root ON payments(root);
  CREATE INDEX IF NOT EXISTS idx_tx_hash ON payments(tx_hash);
  CREATE INDEX IF NOT EXISTS idx_created_at ON payments(created_at);
`);

console.log('✅ Database initialized:', dbPath);
console.log('📊 Tables created: payments');

// Show current payment count
const count = db.prepare('SELECT COUNT(*) as count FROM payments').get();
console.log(`📈 Current payments: ${count.count}`);

db.close();
