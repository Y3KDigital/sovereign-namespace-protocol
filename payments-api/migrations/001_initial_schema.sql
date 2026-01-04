-- Payment intents table
CREATE TABLE IF NOT EXISTS payment_intents (
    id TEXT PRIMARY KEY,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    namespace_reserved TEXT,
    rarity_tier TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    settled_at TIMESTAMP,
    partner_id TEXT,
    affiliate_id TEXT
);

CREATE INDEX idx_payment_intents_stripe_id ON payment_intents(stripe_payment_intent_id);
CREATE INDEX idx_payment_intents_customer_email ON payment_intents(customer_email);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);

-- Issuances table
CREATE TABLE IF NOT EXISTS issuances (
    id TEXT PRIMARY KEY,
    payment_intent_id TEXT NOT NULL,
    namespace TEXT UNIQUE NOT NULL,
    certificate_ipfs_cid TEXT NOT NULL,
    certificate_hash_sha3 TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    download_token TEXT UNIQUE NOT NULL,
    download_expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id)
);

CREATE INDEX idx_issuances_payment_intent ON issuances(payment_intent_id);
CREATE INDEX idx_issuances_namespace ON issuances(namespace);
CREATE INDEX idx_issuances_download_token ON issuances(download_token);
CREATE INDEX idx_issuances_customer_email ON issuances(customer_email);
