-- Agent Provisioning + Interface Bindings + Tamper-evident Ledger
-- Migration: 006_agent_provisioning
-- Created: 2026-01-08
-- Purpose: Ensure a minted namespace immediately results in an agent record,
--          and allow phone/interface bindings without coupling to a specific telco provider.

-- ============================================================================
-- 1. AGENTS (namespace-bound identity runtime)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    namespace TEXT UNIQUE NOT NULL,

    -- active | suspended
    status TEXT NOT NULL DEFAULT 'active',

    -- Prompt pack selector (v1: a name; later: versioned bundle)
    profile TEXT NOT NULL DEFAULT 'default',

    -- Optional model/provider metadata (does NOT contain secrets)
    ai_provider TEXT,
    ai_model TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agents_namespace ON agents(namespace);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- ============================================================================
-- 2. INTERFACE BINDINGS (phone/SMS/webhooks/etc)
-- ============================================================================

CREATE TABLE IF NOT EXISTS interface_bindings (
    id TEXT PRIMARY KEY,
    namespace TEXT NOT NULL,

    -- phone | sms | web | api | iot
    binding_type TEXT NOT NULL,

    -- twilio | telnyx | internal
    provider TEXT NOT NULL,

    -- E.164 number, webhook address, device id, etc.
    address TEXT NOT NULL,

    -- active | released | pending
    status TEXT NOT NULL DEFAULT 'active',

    metadata_json TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP,

    UNIQUE(binding_type, provider, address)
);

CREATE INDEX IF NOT EXISTS idx_bindings_namespace ON interface_bindings(namespace);
CREATE INDEX IF NOT EXISTS idx_bindings_address ON interface_bindings(address);
CREATE INDEX IF NOT EXISTS idx_bindings_status ON interface_bindings(status);

-- ============================================================================
-- 3. TAMPER-EVIDENT LEDGER (internal audit chain)
-- ============================================================================

CREATE TABLE IF NOT EXISTS namespace_ledger (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    namespace TEXT,
    event_type TEXT NOT NULL,
    event_json TEXT NOT NULL,

    prev_hash TEXT,
    hash TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_namespace_ledger_namespace ON namespace_ledger(namespace);
CREATE INDEX IF NOT EXISTS idx_namespace_ledger_created_at ON namespace_ledger(created_at);

-- ============================================================================
-- 4. VALIDATION
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS validate_agent_status
BEFORE INSERT ON agents
BEGIN
    SELECT CASE
        WHEN NEW.status NOT IN ('active', 'suspended')
        THEN RAISE(ABORT, 'Invalid agent status')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_agent_status_update
BEFORE UPDATE ON agents
BEGIN
    SELECT CASE
        WHEN NEW.status NOT IN ('active', 'suspended')
        THEN RAISE(ABORT, 'Invalid agent status')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_binding_type
BEFORE INSERT ON interface_bindings
BEGIN
    SELECT CASE
        WHEN NEW.binding_type NOT IN ('phone', 'sms', 'web', 'api', 'iot')
        THEN RAISE(ABORT, 'Invalid binding type')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_binding_type_update
BEFORE UPDATE ON interface_bindings
BEGIN
    SELECT CASE
        WHEN NEW.binding_type NOT IN ('phone', 'sms', 'web', 'api', 'iot')
        THEN RAISE(ABORT, 'Invalid binding type')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_binding_status
BEFORE INSERT ON interface_bindings
BEGIN
    SELECT CASE
        WHEN NEW.status NOT IN ('active', 'released', 'pending')
        THEN RAISE(ABORT, 'Invalid binding status')
    END;
END;

CREATE TRIGGER IF NOT EXISTS validate_binding_status_update
BEFORE UPDATE ON interface_bindings
BEGIN
    SELECT CASE
        WHEN NEW.status NOT IN ('active', 'released', 'pending')
        THEN RAISE(ABORT, 'Invalid binding status')
    END;
END;
