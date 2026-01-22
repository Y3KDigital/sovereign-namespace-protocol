Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   KEVAN.OS OBSERVER MODE (READ-ONLY ACCESS)      " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check for binary
if (-not (Test-Path ".\kevan-os.exe")) {
    Write-Host "Error: kevan-os.exe not found." -ForegroundColor Red
    exit 1
}

Write-Host "`n[1/4] Booting System in Observer Mode..." -ForegroundColor Yellow
./kevan-os.exe --observer status

Write-Host "`n[2/4] Reading Immutable Audit Log (Tail)..." -ForegroundColor Yellow
./kevan-os.exe --observer audit tail --limit 5

Write-Host "`n[3/4] Checking Communications Logs..." -ForegroundColor Yellow
./kevan-os.exe --observer tel logs --limit 3

Write-Host "`n[4/4] Verifying Write Protection..." -ForegroundColor Yellow
Write-Host "      Attempting to mutate state (Add Contact)..." -ForegroundColor Gray
$output = ./kevan-os.exe --observer contacts add "intruder.x" 2>&1
if ($output | Select-String "PERMISSION DENIED") {
    Write-Host "      ✅ BLOCKED: Write permission denied as expected." -ForegroundColor Green
    Write-Host "         ($($output | Select-String 'allowed'))" -ForegroundColor DarkGray
} else {
    Write-Host "      ❌ ERROR: Write operation was NOT blocked!" -ForegroundColor Red
    Write-Host "      Output: $output" -ForegroundColor Gray
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "   OBSERVER SESSION COMPLETE. NO STATE CHANGED.   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit..."