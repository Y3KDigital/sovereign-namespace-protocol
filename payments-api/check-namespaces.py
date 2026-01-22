# Check if word-based namespaces exist
import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "payments.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Check what namespaces we have
c.execute("SELECT namespace, tier FROM available_namespaces ORDER BY LENGTH(namespace), namespace LIMIT 50")
print("First 50 namespaces in database:")
for row in c.fetchall():
    print(f"  {row[0]:20} tier={row[1]}")

print("\n" + "="*60)
print("Checking for word-based roots...")
words = ['law', 'legal', 'ai', 'bank', 'trust', 'finance', 'x', 'y', 'k']
for word in words:
    c.execute("SELECT namespace, tier, status FROM available_namespaces WHERE namespace = ?", (word,))
    result = c.fetchone()
    if result:
        print(f"✅ {word:15} EXISTS - tier={result[1]}, status={result[2]}")
    else:
        print(f"❌ {word:15} NOT IN DATABASE")

conn.close()
