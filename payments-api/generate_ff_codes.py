import sqlite3
from pathlib import Path
import random
import string

db_path = Path(__file__).parent / "payments.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Create table
print("Creating friends_family_codes table...")
c.execute("""
CREATE TABLE IF NOT EXISTS friends_family_codes (
    code TEXT PRIMARY KEY,
    tier TEXT NOT NULL, -- 'founder' or 'early'
    status TEXT NOT NULL DEFAULT 'active', -- active, claimed, disabled
    claimed_by_email TEXT,
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

# Generate Codes
codes = []

# Founder: F001 - F010
for i in range(1, 11):
    code = f"F{i:03d}"
    codes.append((code, "founder"))

# Early: E011 - E100
for i in range(11, 101):
    code = f"E{i:03d}"
    codes.append((code, "early"))

print(f"Generating {len(codes)} codes...")

for code, tier in codes:
    try:
        c.execute("INSERT INTO friends_family_codes (code, tier) VALUES (?, ?)", (code, tier))
        print(f"  Inserted {code} ({tier})")
    except sqlite3.IntegrityError:
        print(f"  Skipped {code} (already exists)")

conn.commit()
conn.close()

print("\n✅ Friends & Family Codes Generation Complete.")
