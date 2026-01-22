# Add schema columns for sovereign root tracking
import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "payments.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Add reserved_for column
try:
    c.execute("ALTER TABLE available_namespaces ADD COLUMN reserved_for TEXT")
    print("✅ Added reserved_for column")
except sqlite3.OperationalError as e:
    print(f"reserved_for column: {e}")

# Add notes column
try:
    c.execute("ALTER TABLE available_namespaces ADD COLUMN notes TEXT")
    print("✅ Added notes column")
except sqlite3.OperationalError as e:
    print(f"notes column: {e}")

conn.commit()

# Show updated schema
c.execute("PRAGMA table_info(available_namespaces)")
print("\nUpdated schema:")
for row in c.fetchall():
    print(f"  {row[1]:25} {row[2]:15}")

conn.close()
