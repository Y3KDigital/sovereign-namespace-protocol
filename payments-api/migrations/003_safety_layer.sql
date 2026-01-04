-- Safety Layer Migration
-- Purpose: Idempotency, state machine, retry handling, refund protection
-- Date: 2026-01-03
-- Conformance: ISSUANCE_SAFETY_MODEL.md

-- ============================================================================
-- 1. STRIPE EVENT IDEMPOTENCY
-- ============================================================================

CREATE TABLE IF NOT EXISTS processed_stripe_events (
    stripe_event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    payment_intent_id TEXT,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    outcome TEXT NOT NULL,  -- 'success' | 'ignored' | 'failed'
    error_message TEXT
);

CREATE INDEX idx_processed_events_payment_intent ON processed_stripe_events(payment_intent_id);
CREATE INDEX idx_processed_events_type ON processed_stripe_events(event_type);
CREATE INDEX idx_processed_events_processed_at ON processed_stripe_events(processed_at);

-- ============================================================================
-- 2. PAYMENT INTENTS EXTENSIONS (Locking & Dispute Tracking)
-- ============================================================================

-- Add issuance lock token (prevents concurrent issuance)
ALTER TABLE payment_intents ADD COLUMN issuance_lock_token TEXT;
CREATE UNIQUE INDEX idx_payment_intents_lock_token ON payment_intents(issuance_lock_token) WHERE issuance_lock_token IS NOT NULL;

-- Add dispute flag (for post-24hr refunds/chargebacks)
ALTER TABLE payment_intents ADD COLUMN disputed BOOLEAN NOT NULL DEFAULT 0;
CREATE INDEX idx_payment_intents_disputed ON payment_intents(disputed);

-- Add processing timestamp (for tracking webhook handling time)
ALTER TABLE payment_intents ADD COLUMN processing_started_at TIMESTAMP;

-- ============================================================================
-- 3. ISSUANCES EXTENSIONS (State Machine & Voiding)
-- ============================================================================

-- Add state column (pending | processing | issued | failed | voided)
ALTER TABLE issuances ADD COLUMN state TEXT NOT NULL DEFAULT 'pending';
CREATE INDEX idx_issuances_state ON issuances(state);

-- Add voided timestamp (for refund handling)
ALTER TABLE issuances ADD COLUMN voided_at TIMESTAMP;

-- Add retry tracking
ALTER TABLE issuances ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE issuances ADD COLUMN last_error TEXT;
ALTER TABLE issuances ADD COLUMN next_retry_at TIMESTAMP;

-- ============================================================================
-- 4. ISSUANCE RETRY QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS issuance_retries (
    id TEXT PRIMARY KEY,
    payment_intent_id TEXT NOT NULL,
    attempt_number INTEGER NOT NULL,
    last_error TEXT NOT NULL,
    next_retry_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id)
);

CREATE INDEX idx_issuance_retries_payment_intent ON issuance_retries(payment_intent_id);
CREATE INDEX idx_issuance_retries_next_retry ON issuance_retries(next_retry_at);

-- ============================================================================
-- 5. SYSTEM STATE (Genesis & Configuration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),  -- Single row table
    genesis_completed BOOLEAN NOT NULL DEFAULT 0,
    genesis_cid TEXT,
    genesis_timestamp TIMESTAMP,
    genesis_hash TEXT,  -- SHA3-256 hash of Genesis snapshot
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Initialize system state (pre-genesis)
INSERT INTO system_state (id, genesis_completed) VALUES (1, 0);

-- ============================================================================
-- 6. INVENTORY EXTENSIONS (Freeze Tracking)
-- ============================================================================

ALTER TABLE inventory_tiers ADD COLUMN frozen_at TIMESTAMP;

-- ============================================================================
-- 7. VALIDATION CONSTRAINTS
-- ============================================================================

-- Ensure issuance state is valid
CREATE TRIGGER validate_issuance_state
BEFORE INSERT ON issuances
BEGIN
    SELECT CASE
        WHEN NEW.state NOT IN ('pending', 'processing', 'issued', 'failed', 'voided')
        THEN RAISE(ABORT, 'Invalid issuance state')
    END;
END;

CREATE TRIGGER validate_issuance_state_update
BEFORE UPDATE ON issuances
BEGIN
    SELECT CASE
        WHEN NEW.state NOT IN ('pending', 'processing', 'issued', 'failed', 'voided')
        THEN RAISE(ABORT, 'Invalid issuance state')
    END;
END;

-- Ensure event outcome is valid
CREATE TRIGGER validate_event_outcome
BEFORE INSERT ON processed_stripe_events
BEGIN
    SELECT CASE
        WHEN NEW.outcome NOT IN ('success', 'ignored', 'failed')
        THEN RAISE(ABORT, 'Invalid event outcome')
    END;
END;
