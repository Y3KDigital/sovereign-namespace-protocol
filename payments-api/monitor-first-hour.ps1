#!/usr/bin/env pwsh
# Y3K Genesis - First Hour Monitoring Script
# Run this every 5-10 minutes to track mint progress

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Y3K GENESIS - FIRST HOUR MONITORING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')`n" -ForegroundColor Gray

# Check database inventory
Write-Host "[DATABASE STATUS]" -ForegroundColor Yellow
try {
    $total = .\sqlite-tools\sqlite3.exe payments.db "SELECT COUNT(*) FROM available_namespaces;"
    $available = .\sqlite-tools\sqlite3.exe payments.db "SELECT COUNT(*) FROM available_namespaces WHERE status='available';"
    $reserved = .\sqlite-tools\sqlite3.exe payments.db "SELECT COUNT(*) FROM available_namespaces WHERE status='reserved';"
    $minted = .\sqlite-tools\sqlite3.exe payments.db "SELECT COUNT(*) FROM available_namespaces WHERE status='minted';"
    
    Write-Host "  Total: $total" -ForegroundColor White
    Write-Host "  Available: $available" -ForegroundColor Green
    Write-Host "  Reserved: $reserved" -ForegroundColor Yellow
    Write-Host "  Minted: $minted" -ForegroundColor Cyan
    
    if ($minted -gt 0) {
        Write-Host "`n  [MILESTONE] First mint detected!" -ForegroundColor Green
        
        # Get first mint details
        $firstMint = .\sqlite-tools\sqlite3.exe payments.db "SELECT namespace, minted_at, owner_address FROM available_namespaces WHERE status='minted' ORDER BY minted_at LIMIT 1;" -separator "|"
        if ($firstMint) {
            $parts = $firstMint -split '\|'
            Write-Host "  Namespace: $($parts[0])" -ForegroundColor White
            Write-Host "  Minted At: $($parts[1])" -ForegroundColor White
            if ($parts[2]) {
                Write-Host "  Owner: $($parts[2])" -ForegroundColor White
            }
        }
    }
}
catch {
    Write-Host "  [ERROR] Database query failed: $_" -ForegroundColor Red
}

# Check for recent transactions (last 15 minutes)
Write-Host "`n[RECENT ACTIVITY]" -ForegroundColor Yellow
try {
    $recentReservations = .\sqlite-tools\sqlite3.exe payments.db "SELECT namespace, reserved_at FROM available_namespaces WHERE reserved_at IS NOT NULL AND reserved_at > datetime('now', '-15 minutes') ORDER BY reserved_at DESC LIMIT 5;" -separator "|"
    
    if ($recentReservations) {
        Write-Host "  Recent reservations (last 15 min):" -ForegroundColor White
        foreach ($res in $recentReservations -split "`n") {
            if ($res) {
                $parts = $res -split '\|'
                Write-Host "    - $($parts[0]) at $($parts[1])" -ForegroundColor Gray
            }
        }
    }
    else {
        Write-Host "  No reservations in last 15 minutes" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  [ERROR] Recent activity query failed: $_" -ForegroundColor Red
}

# IPFS health check
Write-Host "`n[IPFS STATUS]" -ForegroundColor Yellow
try {
    $ipfsTest = ipfs id --timeout=3s 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] IPFS daemon running" -ForegroundColor Green
        
        # Check if genesis is still pinned
        $pinCheck = ipfs pin ls bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e 2>&1
        if ($pinCheck -match "bafybei") {
            Write-Host "  [OK] Genesis artifacts pinned" -ForegroundColor Green
        }
        else {
            Write-Host "  [WARNING] Genesis pin check inconclusive" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "  [WARNING] IPFS daemon not responding" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "  [WARNING] IPFS check failed (not critical for minting)" -ForegroundColor Yellow
}

# Process check
Write-Host "`n[SYSTEM HEALTH]" -ForegroundColor Yellow
$ipfsProcess = Get-Process | Where-Object { $_.ProcessName -like "*ipfs*" }
if ($ipfsProcess) {
    Write-Host "  [OK] IPFS process running (PID: $($ipfsProcess.Id))" -ForegroundColor Green
}
else {
    Write-Host "  [WARNING] No IPFS process found" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Next check: $(Get-Date -Date (Get-Date).AddMinutes(5) -Format 'HH:mm:ss')" -ForegroundColor Gray
Write-Host "Monitoring window: Until $(Get-Date -Date '2026-01-17 20:00:00' -Format 'MMM dd, HH:mm')" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan
