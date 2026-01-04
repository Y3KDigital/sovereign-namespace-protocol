-- Inventory tiers (global supply limits)
CREATE TABLE IF NOT EXISTS inventory_tiers (
    tier TEXT PRIMARY KEY,
    genesis_supply INTEGER NOT NULL,
    presell_cap INTEGER NOT NULL,
    presold_count INTEGER NOT NULL DEFAULT 0,
    CHECK (presell_cap <= genesis_supply),
    CHECK (presold_count <= presell_cap)
);

-- Initialize tier inventory
INSERT INTO inventory_tiers (tier, genesis_supply, presell_cap) VALUES
    ('mythic', 5, 3),
    ('legendary', 25, 15),
    ('epic', 100, 60),
    ('rare', 300, 180),
    ('uncommon', 1000, 500),
    ('common', 10000, 10000);  -- Effectively unlimited for common

-- Inventory reservations (per-order tracking)
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id TEXT PRIMARY KEY,
    payment_intent_id TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL,
    reserved_at TIMESTAMP NOT NULL,
    released_at TIMESTAMP,
    status TEXT NOT NULL,  -- RESERVED, RELEASED, FULFILLED
    FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id),
    FOREIGN KEY (tier) REFERENCES inventory_tiers(tier)
);

CREATE INDEX idx_inventory_reservations_tier ON inventory_reservations(tier);
CREATE INDEX idx_inventory_reservations_status ON inventory_reservations(status);
CREATE INDEX idx_inventory_reservations_payment_intent ON inventory_reservations(payment_intent_id);

-- Partner inventory allocations (optional but included for future use)
CREATE TABLE IF NOT EXISTS partner_inventory (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL,
    tier TEXT NOT NULL,
    allocation INTEGER NOT NULL,
    sold INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    CHECK (sold <= allocation),
    UNIQUE(partner_id, tier),
    FOREIGN KEY (tier) REFERENCES inventory_tiers(tier)
);

CREATE INDEX idx_partner_inventory_partner ON partner_inventory(partner_id);
CREATE INDEX idx_partner_inventory_tier ON partner_inventory(tier);
