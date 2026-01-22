# Unykorn Ledger Recovery - Quick Reference

## Build & Run

```powershell
# Build ledger
cd ops/ledger
cargo build --release

# Run ledger API (port 8088)
$env:LEDGER_DB="../../data/ledger.db"
./target/release/unykorn-ledger
```

## Genesis Issuance

```powershell
# Credit genesis balances to treasuries
pwsh -ExecutionPolicy Bypass -File scripts/genesis-issuance.ps1
```

## Verification

```powershell
# Run all verification tests
pwsh -ExecutionPolicy Bypass -File scripts/verify-ledger.ps1

# Manual checks
curl http://localhost:8088/assets
curl "http://localhost:8088/balances?account=acct:treasury:MAIN"
curl http://localhost:8088/audit
```

## VS Code Tasks

- **Ctrl+Shift+B** → `ledger:build` - Build Rust binary
- **Ctrl+Shift+P** → `Tasks: Run Task` → `ledger:run` - Start API server
- **Ctrl+Shift+P** → `Tasks: Run Task` → `ledger:genesis` - Run genesis issuance
- **Ctrl+Shift+P** → `Tasks: Run Task` → `ledger:verify` - Verify API health

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/assets` | GET | List all registered assets |
| `/balances?account=X` | GET | Get balances for account |
| `/audit` | GET | Get system audit hash |
| `/internal/posting` | POST | **DEV ONLY** - Direct posting |

## Account Naming Convention

- `acct:user:{sub}` - User accounts (sub from JWT)
- `acct:treasury:MAIN` - Main treasury
- `acct:treasury:FTH` - FTH treasury
- `acct:treasury:MOG` - MOG treasury
- `acct:ops:XXXIII` - XXXIII operations
- `acct:yield:XXXIII` - XXXIII yield distribution

## Balance Format

- All amounts stored as **18-decimal wei** (1 UCRED = 1e18 wei)
- API returns `balance_wei` as string to avoid JS precision loss
- Format with: `BigInt(balance_wei) / BigInt(10**18)`

## Daily Snapshot

```powershell
# Manual snapshot
pwsh -ExecutionPolicy Bypass -File scripts/audit-snapshot.ps1

# Schedule (Windows Task Scheduler)
# Trigger: Daily at 00:05 UTC
# Action: pwsh -ExecutionPolicy Bypass -File C:\path\to\scripts\audit-snapshot.ps1
```

## XRPL/Stellar Adapters

```powershell
# Install Python deps
pip install -r ops/adapters/requirements.txt

# Run XRPL adapter (background)
python ops/adapters/xrpl_adapter.py

# Run Stellar adapter (background)
python ops/adapters/stellar_adapter.py
```

## Dashboard Integration

```typescript
// y3k-markets-web/lib/ledger-client.ts
import { getBalances, formatBalance, getUserAccount } from '@/lib/ledger-client';

// In component
const account = getUserAccount(session.user.sub);
const balances = await getBalances(account);

// Display
{balances.map(b => (
  <div key={b.asset}>
    {formatBalance(b.balance_wei)} {b.asset}
  </div>
))}
```

## Dev Credit (Testing)

```powershell
# Credit 5 UCRED to demo user
$five = "5000000000000000000"
Invoke-RestMethod http://localhost:8088/internal/posting `
  -Method POST -ContentType "application/json" `
  -Body (@{ 
    account="acct:user:demo"
    asset="UCRED"
    side="CR"
    amount_wei=$five
    memo="dev-topup"
  } | ConvertTo-Json)
```

## Troubleshooting

**Port 8088 in use:**
```powershell
netstat -ano | findstr :8088
taskkill /PID <pid> /F
```

**Database locked:**
```powershell
# Stop all ledger processes
Get-Process unykorn-ledger | Stop-Process -Force
```

**Wrong balance after genesis:**
```powershell
# Delete DB and re-run genesis
Remove-Item data/ledger.db
pwsh scripts/genesis-issuance.ps1
```

## Success Criteria

- ✅ `/assets` returns 11 symbols (FTH, MOG, XXXIII, OPTKAS1, KBURNS, UUSD, UCRED, GOLD, EUR, GBP, DRUNKS)
- ✅ Three treasuries show exactly 1,000 UCRED (1e21 wei)
- ✅ `/audit` returns stable 64-char SHA-256 hash
- ✅ Dashboard wallet tile reads from ledger (not cache)
- ✅ XRPL/Stellar adapters writing postings for external flows
- ✅ Daily snapshot running and logging to `data/audit-log.csv`

## Production Hardening

**Before removing `/internal/posting`:**

1. Implement operator consent-gateway path for mints
2. Add JWT authentication to all endpoints
3. Rate limit `/balances` and `/assets` (100 req/min per IP)
4. Move to HTTPS with proper TLS cert
5. Add Cloudflare proxy for DDoS protection
6. Set up database backups (hourly snapshots to S3/IPFS)

**Environment variables (production):**

```bash
LEDGER_DB=/secure/path/ledger.db
RUST_LOG=info
LEDGER_BIND_ADDR=127.0.0.1:8088  # Internal only, proxy via nginx
```

## File Structure

```
ops/ledger/
├─ Cargo.toml          # Rust dependencies
├─ src/
│  ├─ main.rs          # Server boot
│  ├─ balances.rs      # Double-entry ledger engine
│  ├─ http.rs          # API endpoints
│  └─ schema.sql       # SQLite schema

data/
├─ ledger.db           # SQLite database (DO NOT commit)
├─ ff-namespaces.json  # F&F token definitions
└─ audit-log.csv       # Daily snapshot log

scripts/
├─ genesis-issuance.ps1  # Genesis credit script
├─ verify-ledger.ps1     # Health check script
└─ audit-snapshot.ps1    # Daily snapshot script

ops/adapters/
├─ xrpl_adapter.py       # XRPL event → posting adapter
├─ stellar_adapter.py    # Stellar event → posting adapter
└─ requirements.txt      # Python deps

y3k-markets-web/lib/
└─ ledger-client.ts      # Next.js ledger client
```
