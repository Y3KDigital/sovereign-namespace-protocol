-- Genesis Namespace Inventory
-- This migration creates the table for genesis roots (955 total)

CREATE TABLE IF NOT EXISTS available_namespaces (
    id TEXT PRIMARY KEY,
    namespace TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL,  -- crown_letter, crown_digit, genesis_public, protocol_infrastructure
    rarity_score REAL NOT NULL,
    cryptographic_hash TEXT NOT NULL,
    genesis_index INTEGER NOT NULL,
    certificate_cid TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',  -- available, reserved, minted
    price_usd_cents INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reserved_at TIMESTAMP,
    minted_at TIMESTAMP,
    owner_address TEXT,
    CHECK (genesis_index >= 0 AND genesis_index < 955)
);

CREATE INDEX IF NOT EXISTS idx_available_namespaces_status ON available_namespaces(status);
CREATE INDEX IF NOT EXISTS idx_available_namespaces_tier ON available_namespaces(tier);
CREATE INDEX IF NOT EXISTS idx_available_namespaces_namespace ON available_namespaces(namespace);
CREATE INDEX IF NOT EXISTS idx_available_namespaces_genesis_index ON available_namespaces(genesis_index);
