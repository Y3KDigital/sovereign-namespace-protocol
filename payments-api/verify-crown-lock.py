# Verify Crown Lock and Inventory Status
import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "payments.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

print("\n" + "="*70)
print("DATABASE INVENTORY AFTER CROWN LOCK")
print("="*70)

# Status breakdown
c.execute("SELECT status, COUNT(*) FROM available_namespaces GROUP BY status ORDER BY status")
print("\nSTATUS BREAKDOWN:")
for row in c.fetchall():
    print(f"  {row[0]:15} {row[1]:5} namespaces")

# Infrastructure details
print("\n" + "="*70)
print("Y3K INFRASTRUCTURE (Crown Letters)")
print("="*70)
c.execute("""
SELECT namespace, tier 
FROM available_namespaces 
WHERE reserved_for = 'Y3K_INFRASTRUCTURE' 
ORDER BY namespace
""")
print("Locked Crown Letters:")
for row in c.fetchall():
    print(f"  {row[0]:5} ({row[1]})")

# Available inventory for F&F
print("\n" + "="*70)
print("F&F/PUBLIC INVENTORY (Available for Launch)")
print("="*70)
c.execute("""
SELECT tier, COUNT(*) 
FROM available_namespaces 
WHERE status = 'available' 
GROUP BY tier 
ORDER BY tier
""")
print("Available by tier:")
total_available = 0
for row in c.fetchall():
    print(f"  {row[0]:30} {row[1]:5}")
    total_available += row[1]

print(f"\n  {'TOTAL AVAILABLE FOR F&F/PUBLIC':30} {total_available:5}")

# Protocol infrastructure check
print("\n" + "="*70)
print("PROTOCOL INFRASTRUCTURE (Reserved, Not for Sale)")
print("="*70)
c.execute("""
SELECT namespace, status, reserved_for 
FROM available_namespaces 
WHERE tier = 'protocol_infrastructure' 
ORDER BY namespace
""")
print("Protocol roots:")
for row in c.fetchall():
    reserved_for = row[2] if row[2] else "N/A"
    print(f"  {row[0]:5} status={row[1]:10} reserved_for={reserved_for}")

conn.close()
print("\n" + "="*70)
print("✅ VERIFICATION COMPLETE")
print("="*70)
