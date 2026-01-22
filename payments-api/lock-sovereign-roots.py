# Lock Sovereign Roots
import sqlite3
import sys
from pathlib import Path

# Connect to database
db_path = Path(__file__).parent / "payments.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Lock 25 sovereign roots
sovereign_roots = [
    'law', 'legal', 'ai', 'justice', 'court', 'governance', 'compliance', 'regulation', 'policy',
    'bank', 'finance', 'treasury', 'trust', 'audit', 'risk',
    'identity', 'evidence', 'registry', 'records', 'contracts',
    'enforcement', 'dispute', 'claims', 'arbitration', 'ops'
]

c.execute(f"""
UPDATE available_namespaces 
SET status = 'reserved', 
    reserved_for = 'Y3K_SOVEREIGN_ISSUER', 
    reserved_at = datetime('now'), 
    notes = 'Sovereign issuer root - non-transferable, issuer-only, constitutional lock'
WHERE namespace IN ({','.join('?' * len(sovereign_roots))})
""", sovereign_roots)

rows_updated = c.rowcount
conn.commit()

# Verify
c.execute("SELECT COUNT(*) FROM available_namespaces WHERE reserved_for = 'Y3K_SOVEREIGN_ISSUER'")
locked_count = c.fetchone()[0]

print(f"✅ LOCKED {locked_count} SOVEREIGN ROOTS (updated {rows_updated} rows)")
print("\n" + "="*60)
print("ALL Y3K RESERVED NAMESPACES")
print("="*60)

c.execute("""
SELECT namespace, reserved_for, status, reserved_at 
FROM available_namespaces 
WHERE reserved_for IN ('Y3K_SOVEREIGN_ISSUER', 'Y3K_INFRASTRUCTURE') 
ORDER BY reserved_for, namespace
""")

current_category = None
for row in c.fetchall():
    namespace, reserved_for, status, reserved_at = row
    if reserved_for != current_category:
        print(f"\n{reserved_for}:")
        current_category = reserved_for
    print(f"  {namespace:20} [{status}]")

conn.close()
print("\n✅ Database updated successfully")
