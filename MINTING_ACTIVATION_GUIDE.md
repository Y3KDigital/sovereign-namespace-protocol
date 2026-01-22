# GENESIS CEREMONY → MINTING ENABLED

## Current Status
- ✅ Countdown updated to 6:00 PM EST (23:00 UTC)
- ✅ Website deployed with new time
- ✅ Scheduled task set for 6:00 PM EST

## Critical: Enabling Minting After Genesis

### Automated Scripts Created

1. **`genesis/populate-namespaces.ps1`**
   - Runs AFTER genesis completes
   - Reads genesis artifacts
   - Populates `available_namespaces` table in database
   - Makes 1000 namespaces available for purchase

2. **`genesis/run-genesis-and-enable-minting.ps1`**
   - Runs genesis ceremony
   - THEN automatically populates namespaces
   - Single command for complete setup

### Current Scheduled Task

**Task Name**: `Y3K_Genesis_Ceremony_Auto`
**Time**: 6:00 PM EST (January 16, 2026)
**Script**: `run-genesis-and-enable-minting.ps1` (updated)

### Manual Execution (If Needed)

If automatic execution doesn't work or you want to run it now:

```powershell
# Run everything (genesis + namespace population)
cd "c:\Users\Kevan\web3 true web3 rarity\genesis"
.\run-genesis-and-enable-minting.ps1

# OR run in two steps:
.\run-automated-ceremony.ps1
.\populate-namespaces.ps1
```

### Verify Minting is Ready

After ceremony runs at 6 PM:

```powershell
# Check if namespaces were populated
cd "c:\Users\Kevan\web3 true web3 rarity\payments-api"
sqlite3 payments.db "SELECT tier, COUNT(*) FROM available_namespaces WHERE status='available' GROUP BY tier;"

# Restart payments API
.\restart-payments-api.ps1

# Test minting
# Visit: https://y3kmarkets.com/mint
```

### What Happens at 6 PM EST

1. Scheduled task triggers `run-genesis-and-enable-minting.ps1`
2. Script runs genesis ceremony (~2 hours)
3. Creates artifacts in `genesis/ARTIFACTS/`
4. Script automatically runs `populate-namespaces.ps1`
5. Populates database with 1000 namespaces
6. Minting becomes available immediately

### If Task Doesn't Run

To manually reschedule with admin rights:

```powershell
# Run this in an ADMIN PowerShell
cd "c:\Users\Kevan\web3 true web3 rarity\genesis"
.\schedule-ceremony.ps1
```

Or just run manually at 6 PM:
```powershell
.\run-genesis-and-enable-minting.ps1
```

### Database Schema

The `populate-namespaces.ps1` script creates:

```sql
CREATE TABLE available_namespaces (
    id TEXT PRIMARY KEY,
    namespace TEXT UNIQUE NOT NULL,  -- "1.x", "2.x", etc.
    tier TEXT NOT NULL,               -- mythic, legendary, epic, rare, etc.
    rarity_score REAL NOT NULL,
    cryptographic_hash TEXT NOT NULL,
    genesis_index INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',  -- available, reserved, sold
    reserved_at TIMESTAMP,
    sold_at TIMESTAMP,
    payment_intent_id TEXT
);
```

### API Endpoints

After population, these work:

- `GET /api/inventory/status` - Shows available count per tier
- `POST /api/payments/create-intent` - Reserves namespace during checkout
- `GET /api/namespaces/available?tier=mythic` - Lists available namespaces

### Monitoring

Watch ceremony progress:
```powershell
# View logs
Get-Content "genesis\LOGS\CEREMONY_AUTO_*.txt" -Wait

# Check artifacts
ls genesis\ARTIFACTS\

# Watch database updates
sqlite3 payments.db "SELECT COUNT(*) FROM available_namespaces;"
```

## Summary

**Everything is configured to run automatically at 6 PM EST.**

The scheduled task will:
1. Run genesis ceremony
2. Populate namespace inventory
3. Enable minting immediately after completion (~8 PM EST)

Users can mint at https://y3kmarkets.com/mint starting around 8 PM EST.

**No manual intervention required** - but scripts are available if needed.
