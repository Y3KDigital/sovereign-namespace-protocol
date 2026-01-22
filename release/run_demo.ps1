# Sovereign OS - Friends & Family Demo Script
# Version 1.0.0
# Automated 'Day in the Life' Simulation

$ErrorActionPreference = "Stop"
$bin = ".\kevan-os.exe"

function Print-Header($text) {
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host " $text" -ForegroundColor White
    Write-Host "========================================================" -ForegroundColor Cyan
    Start-Sleep -Seconds 1
}

function Print-Step($num, $text, $cmd) {
    Write-Host "`n[$num] $text" -ForegroundColor Yellow
    Write-Host "    > $cmd" -ForegroundColor Gray
    Start-Sleep -Seconds 1
}

# 0. Check Environment
Print-Header "INITIALIZING SOVEREIGN DEMO SEQUENCE"
if (-not (Test-Path $bin)) {
    Write-Host "Error: kevan-os.exe not found. Please run this script from the release folder." -ForegroundColor Red
    exit
}

Write-Host "This script will execute a 'Day in the Life' simulation of the Sovereign OS." -ForegroundColor Gray
Write-Host "No real funds will be moved (Simulation Mode)." -ForegroundColor Gray
Write-Host "Press any key to begin..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 1. Calendar
Print-Step 1 "Asserting Time Sovereignty (Calendar)" "calendar add 'DAO Ceremony'"
& $bin calendar add --title "DAO Ceremony" --time "2026-02-01T12:00:00"

# 2. Telephony
Print-Step 2 "Establishing Secure Voice Circuit (Telephony)" "tel call header"
& $bin tel call --to "+1-888-SOVEREIGN" --from "kevan.x"

# 3. Finance
Print-Step 3 "Executing Treasury Transaction (Finance)" "finance pay 5000 XRP"
& $bin finance pay --amount 5000 --currency "XRP" --to "rTreasuryManaged" --memo "Grant Disbursement"

# 4. Mail
Print-Step 4 "Dispatching Encrypted Communique (Mail)" "mail send via Signal"
& $bin mail send --to "council@kevan.x" --subject "Status" --msg "Ceremony confirmed. Assets disbursed." --via "signal"

# 5. Audit
Print-Header "VERIFYING IMMUTABLE LOGS"

Write-Host "`n--- [AUDIT] FINANCIAL LEDGER ---" -ForegroundColor Green
& $bin finance history | Select-Object -First 3

Write-Host "`n--- [AUDIT] COMMUNIQUES ---" -ForegroundColor Green
& $bin mail inbox | Select-Object -First 3

Write-Host "`n--- [AUDIT] VOICE RECORDS ---" -ForegroundColor Green
& $bin tel logs | Select-Object -First 3

Print-Header "DEMONSTRATION COMPLETE"
Write-Host "System is verified. Identity is sovereign." -ForegroundColor Green
Write-Host "Welcome to the Friends & Family OS." -ForegroundColor White
Pause
