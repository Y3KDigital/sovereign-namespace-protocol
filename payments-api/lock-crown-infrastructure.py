import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "payments.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

crown_letters = ['x', 'y', 'k', 'l', 'a', 'b', 'f', 't', 'e', 'r', 'c']

# First, ensure the namespaces exist in the table (they should from genesis population)
# But just in case, we check.
print("Verifying Crown Letters exist in DB...")
c.execute(f"SELECT namespace FROM available_namespaces WHERE namespace IN ({','.join('?' * len(crown_letters))})", crown_letters)
found = [row[0] for row in c.fetchall()]
print(f"Found: {found}")

# Now lock them
# Note: table schema might not have 'status_msg', check prompt used 'notes' but sql in prompt used 'notes' which is not in CREATE TABLE schema provided earlier?
# The CREATE TABLE provided in populate-namespaces.ps1 showed:
# id, namespace, tier, rarity_score, cryptographic_hash, genesis_index, status, reserved_at, sold_at, payment_intent_id, created_at
# It did NOT show 'reserved_for' or 'notes'.
# I need to check the schema first or ADD the columns.

# Let's verify schema first.
cursor = c.execute("PRAGMA table_info(available_namespaces)")
columns = [info[1] for info in cursor.fetchall()]
print(f"Schema columns: {columns}")

if 'reserved_for' not in columns:
    print("Adding reserved_for column...")
    c.execute("ALTER TABLE available_namespaces ADD COLUMN reserved_for TEXT")

if 'status_msg' not in columns and 'notes' not in columns:
    print("Adding notes column...")
    c.execute("ALTER TABLE available_namespaces ADD COLUMN notes TEXT")

print("Locking Crown Infrastructure...")
c.execute(f"""
UPDATE available_namespaces 
SET status = 'reserved', 
    reserved_for = 'Y3K_INFRASTRUCTURE',
    reserved_at = datetime('now'),
    tier = 'crown',
    notes = 'Crown Letter - Y3K sovereign infrastructure root'
WHERE namespace IN ({','.join('?' * len(crown_letters))})
""", crown_letters)

conn.commit()

c.execute("SELECT namespace, tier, status FROM available_namespaces WHERE reserved_for = 'Y3K_INFRASTRUCTURE' ORDER BY namespace")
print("\n LOCKED CROWN INFRASTRUCTURE:")
rows = c.fetchall()
for row in rows:
    print(f"  {row[0]:<5} tier={row[1]:<15} status={row[2]}")

if len(rows) < len(crown_letters):
     print(f"\n WARNING: Only locked {len(rows)} out of {len(crown_letters)} requested keys. Some might be missing from the database.")

conn.close()
