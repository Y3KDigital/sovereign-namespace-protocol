import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "payments.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT code, tier, status FROM friends_family_codes ORDER BY tier DESC, code ASC")
rows = c.fetchall()

output_path = Path(__file__).parent / "FRIENDS_FAMILY_CODES.txt"

with open(output_path, "w") as f:
    f.write("Y3K GENESIS - FRIENDS & FAMILY ACCESS CODES\n")
    f.write("===========================================\n")
    f.write("Status: GENERATED\n")
    f.write("Validation Endpoint: https://y3kmarkets.com/api/friends-family/validate\n\n")
    
    f.write("FOUNDER TIER (F001-F010)\n")
    f.write("------------------------\n")
    for row in rows:
        if row[1] == "founder":
            f.write(f"GENESIS-{row[0]}-2026 - [ ] Unclaimed\n")
    
    f.write("\nEARLY ACCESS TIER (E011-E100)\n")
    f.write("-----------------------------\n")
    for row in rows:
        if row[1] == "early":
            f.write(f"GENESIS-{row[0]}-2026 - [ ] Unclaimed\n")

print(f"Exported codes to {output_path}")
conn.close()
