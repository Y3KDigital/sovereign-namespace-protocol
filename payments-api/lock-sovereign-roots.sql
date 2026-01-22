-- Y3K SOVEREIGN ROOT LOCK
-- Effective: 2026-01-17
-- Authority: Root Lock Manifest v1.0
-- Constitutional: Non-transferable, Issuer-only, Revocable by Root Authority

-- Lock 25 Sovereign Issuer Roots
UPDATE available_namespaces 
SET status = 'reserved', 
    reserved_for = 'Y3K_SOVEREIGN_ISSUER',
    reserved_at = datetime('now'),
    notes = 'Sovereign issuer root - non-transferable, issuer-only, constitutional lock per Root Lock Manifest v1.0'
WHERE namespace IN (
    -- Tier 1: Legal/AI/Governance Core
    'law', 'legal', 'ai', 'justice', 'court', 'governance', 'compliance', 'regulation', 'policy',
    
    -- Tier 2: Financial/Institutional Control
    'bank', 'finance', 'treasury', 'trust', 'audit', 'risk',
    
    -- Tier 3: Identity/Evidence/Registry
    'identity', 'evidence', 'registry', 'records', 'contracts',
    
    -- Tier 4: Enforcement/Operations
    'enforcement', 'dispute', 'claims', 'arbitration', 'ops'
);

-- Verify lock
SELECT 
    'SOVEREIGN ROOTS LOCKED' AS status,
    COUNT(*) AS total_locked
FROM available_namespaces 
WHERE reserved_for = 'Y3K_SOVEREIGN_ISSUER';

-- Show all sovereign + infrastructure reservations
SELECT namespace, status, reserved_for, reserved_at 
FROM available_namespaces 
WHERE reserved_for IN ('Y3K_SOVEREIGN_ISSUER', 'Y3K_INFRASTRUCTURE')
ORDER BY namespace;
