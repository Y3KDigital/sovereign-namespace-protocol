-- NIL Labels Migration
-- Purpose: attach CityNIL / MascotNIL labels to payment intents + issuances
-- Date: 2026-01-08

-- ============================================================================
-- 1. PAYMENT INTENTS: NIL labeling
-- ============================================================================

ALTER TABLE payment_intents ADD COLUMN nil_name TEXT;
ALTER TABLE payment_intents ADD COLUMN nil_role TEXT;      -- 'city' | 'mascot'
ALTER TABLE payment_intents ADD COLUMN nil_pair_key TEXT;  -- stable key to group the pair

CREATE INDEX IF NOT EXISTS idx_payment_intents_nil_name ON payment_intents(nil_name);
CREATE INDEX IF NOT EXISTS idx_payment_intents_nil_pair_key ON payment_intents(nil_pair_key);

-- Enforce role values if provided
CREATE TRIGGER IF NOT EXISTS validate_payment_intent_nil_role
BEFORE INSERT ON payment_intents
WHEN NEW.nil_role IS NOT NULL
BEGIN
    SELECT CASE
        WHEN NEW.nil_role NOT IN ('city', 'mascot')
        THEN RAISE(ABORT, 'Invalid nil_role')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_payment_intent_nil_role_update
BEFORE UPDATE ON payment_intents
WHEN NEW.nil_role IS NOT NULL
BEGIN
    SELECT CASE
        WHEN NEW.nil_role NOT IN ('city', 'mascot')
        THEN RAISE(ABORT, 'Invalid nil_role')
    END;
END;

-- ============================================================================
-- 2. ISSUANCES: snapshot NIL labeling at issuance time
-- ============================================================================

ALTER TABLE issuances ADD COLUMN nil_name TEXT;
ALTER TABLE issuances ADD COLUMN nil_role TEXT;      -- 'city' | 'mascot'
ALTER TABLE issuances ADD COLUMN nil_pair_key TEXT;

CREATE INDEX IF NOT EXISTS idx_issuances_nil_name ON issuances(nil_name);
CREATE INDEX IF NOT EXISTS idx_issuances_nil_pair_key ON issuances(nil_pair_key);

CREATE TRIGGER IF NOT EXISTS validate_issuance_nil_role
BEFORE INSERT ON issuances
WHEN NEW.nil_role IS NOT NULL
BEGIN
    SELECT CASE
        WHEN NEW.nil_role NOT IN ('city', 'mascot')
        THEN RAISE(ABORT, 'Invalid issuance nil_role')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_issuance_nil_role_update
BEFORE UPDATE ON issuances
WHEN NEW.nil_role IS NOT NULL
BEGIN
    SELECT CASE
        WHEN NEW.nil_role NOT IN ('city', 'mascot')
        THEN RAISE(ABORT, 'Invalid issuance nil_role')
    END;
END;
