-- Affiliates & Referral Tracking
-- Purpose: broker/affiliate onboarding links, lead capture, commission ledger
-- Date: 2026-01-04

-- ============================================================================
-- 1. AFFILIATES (brokers / introducers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS affiliates (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,

    -- Bearer-style token used for "login link" access to the broker portal.
    -- Treat as a secret.
    portal_token TEXT UNIQUE NOT NULL,

    -- Short code intended to be shared publicly as invite/referral.
    referral_code TEXT UNIQUE NOT NULL,

    -- Commission policy (simple v1): commission_bps of gross, plus optional per-sale bonus.
    commission_bps INTEGER NOT NULL DEFAULT 0,
    bonus_cents INTEGER NOT NULL DEFAULT 0,

    active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_affiliates_email ON affiliates(email);
CREATE INDEX idx_affiliates_active ON affiliates(active);

-- ============================================================================
-- 2. LEADS (CRM-lite capture)
-- ============================================================================

CREATE TABLE IF NOT EXISTS affiliate_leads (
    id TEXT PRIMARY KEY,
    affiliate_id TEXT NOT NULL,
    referral_code TEXT NOT NULL,

    lead_email TEXT NOT NULL,
    lead_name TEXT,
    note TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
);

CREATE UNIQUE INDEX idx_affiliate_leads_unique ON affiliate_leads(affiliate_id, lead_email);
CREATE INDEX idx_affiliate_leads_created ON affiliate_leads(created_at);

-- ============================================================================
-- 3. EARNINGS LEDGER (commission state machine)
-- ============================================================================

CREATE TABLE IF NOT EXISTS affiliate_earnings (
    id TEXT PRIMARY KEY,
    affiliate_id TEXT NOT NULL,
    payment_intent_id TEXT NOT NULL,

    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',

    -- earned | paid | voided
    status TEXT NOT NULL DEFAULT 'earned',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    voided_at TIMESTAMP,
    void_reason TEXT,

    FOREIGN KEY (affiliate_id) REFERENCES affiliates(id),
    FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id)
);

CREATE UNIQUE INDEX idx_affiliate_earnings_unique ON affiliate_earnings(affiliate_id, payment_intent_id);
CREATE INDEX idx_affiliate_earnings_status ON affiliate_earnings(status);
CREATE INDEX idx_affiliate_earnings_created ON affiliate_earnings(created_at);

-- ============================================================================
-- 4. OPTIONAL: preserve referral_code used on a payment intent
-- ============================================================================

ALTER TABLE payment_intents ADD COLUMN affiliate_referral_code TEXT;
CREATE INDEX idx_payment_intents_affiliate_referral_code ON payment_intents(affiliate_referral_code);

-- ============================================================================
-- 5. VALIDATION
-- ============================================================================

CREATE TRIGGER validate_affiliate_earning_status
BEFORE INSERT ON affiliate_earnings
BEGIN
    SELECT CASE
        WHEN NEW.status NOT IN ('earned', 'paid', 'voided')
        THEN RAISE(ABORT, 'Invalid affiliate earning status')
    END;
END;

CREATE TRIGGER validate_affiliate_earning_status_update
BEFORE UPDATE ON affiliate_earnings
BEGIN
    SELECT CASE
        WHEN NEW.status NOT IN ('earned', 'paid', 'voided')
        THEN RAISE(ABORT, 'Invalid affiliate earning status')
    END;
END;
