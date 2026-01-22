# Real-Time Webhook Monitor
# Watches webhook server logs and database events during test calls

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║         KEVAN.TEL.X WEBHOOK MONITOR - LIVE VIEW             ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "Monitoring webhook server for incoming calls...`n" -ForegroundColor Yellow

# Paths
$logPath = "c:\Users\Kevan\web3 true web3 rarity\kevan-tel\webhook-server.log"
$dbPath = "c:\Users\Kevan\web3 true web3 rarity\kevan-tel\kevan.events.db"

# Check if server is running
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 3
    Write-Host "✅ Webhook server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Webhook server not responding on port 3000!" -ForegroundColor Red
    Write-Host "   Run: .\start-webhook-server.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Webhook URL: https://jeff-effective-charm-face.trycloudflare.com/webhooks/telnyx" -ForegroundColor Green
Write-Host "`n📞 Call +1-888-611-5384 (611-JEXT) to test zero-spam rejection`n" -ForegroundColor Magenta

Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray

# Function to query recent events
function Get-RecentEvents {
    $query = @"
SELECT 
    datetime(timestamp, 'unixepoch', 'localtime') as time,
    event_type,
    json_extract(payload, '$.from') as caller,
    json_extract(payload, '$.call_control_id') as call_id,
    json_extract(payload, '$.decision') as decision
FROM events 
WHERE event_type LIKE 'tel.%'
ORDER BY timestamp DESC 
LIMIT 10;
"@
    
    try {
        $result = sqlite3 $dbPath $query 2>$null
        if ($result) {
            Write-Host "`n📊 Recent Call Events:" -ForegroundColor Cyan
            Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor DarkGray
            $result | ForEach-Object {
                $parts = $_ -split '\|'
                $time = $parts[0]
                $type = $parts[1]
                $caller = if ($parts.Length -gt 2) { $parts[2] } else { "" }
                $decision = if ($parts.Length -gt 4) { $parts[4] } else { "" }
                
                $color = switch -Wildcard ($type) {
                    "tel.call_authenticated" { "Green" }
                    "tel.call_rejected" { "Red" }
                    "tel.call_inbound" { "Yellow" }
                    default { "White" }
                }
                
                Write-Host "  [$time] " -NoNewline -ForegroundColor Gray
                Write-Host "$type" -NoNewline -ForegroundColor $color
                if ($caller) {
                    Write-Host " from $caller" -NoNewline -ForegroundColor White
                }
                if ($decision) {
                    Write-Host " → $decision" -ForegroundColor Magenta
                } else {
                    Write-Host ""
                }
            }
            Write-Host ""
        }
    } catch {
        # Suppress errors if no events yet
    }
}

# Function to show event counts
function Get-EventStats {
    $query = @"
SELECT 
    event_type,
    COUNT(*) as count
FROM events 
WHERE event_type LIKE 'tel.%'
GROUP BY event_type;
"@
    
    try {
        $result = sqlite3 $dbPath $query 2>$null
        if ($result) {
            Write-Host "`n📈 Call Statistics:" -ForegroundColor Cyan
            Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor DarkGray
            $result | ForEach-Object {
                $parts = $_ -split '\|'
                $type = $parts[0]
                $count = $parts[1]
                
                $icon = switch -Wildcard ($type) {
                    "tel.call_authenticated" { "✅" }
                    "tel.call_rejected" { "🚫" }
                    "tel.call_inbound" { "📞" }
                    default { "•" }
                }
                
                Write-Host "  $icon $type`: $count" -ForegroundColor White
            }
            Write-Host ""
        }
    } catch {
        # Suppress errors if no events yet
    }
}

# Show initial state
Get-RecentEvents
Get-EventStats

Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray
Write-Host "📋 Live Webhook Logs (Ctrl+C to exit):`n" -ForegroundColor Cyan

# Tail the log file
if (Test-Path $logPath) {
    $lastEventCount = 0
    
    Get-Content $logPath -Wait -Tail 0 | ForEach-Object {
        $line = $_
        
        # Color code log lines
        $color = "White"
        if ($line -match "Received webhook") {
            $color = "Yellow"
            Write-Host ""
            Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
        } elseif ($line -match "rejected") {
            $color = "Red"
        } elseif ($line -match "authenticated") {
            $color = "Green"
        } elseif ($line -match "ERROR") {
            $color = "Red"
        } elseif ($line -match "INFO") {
            $color = "Cyan"
        }
        
        Write-Host $line -ForegroundColor $color
        
        # Refresh event stats every few lines
        $script:lineCount++
        if ($script:lineCount % 10 -eq 0) {
            # Check for new events
            $query = "SELECT COUNT(*) FROM events WHERE event_type LIKE 'tel.%';"
            try {
                $currentCount = sqlite3 $dbPath $query 2>$null
                if ($currentCount -gt $lastEventCount) {
                    Write-Host "`n" -NoNewline
                    Get-RecentEvents
                    Get-EventStats
                    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray
                    $lastEventCount = $currentCount
                }
            } catch {}
        }
    }
} else {
    Write-Host "⚠️  Log file not found: $logPath" -ForegroundColor Yellow
    Write-Host "   Server may not have received any webhooks yet." -ForegroundColor Gray
    Write-Host "`n   Waiting for log file to be created..." -ForegroundColor Cyan
    
    # Wait for log file
    while (-not (Test-Path $logPath)) {
        Start-Sleep -Seconds 1
    }
    
    Write-Host "   Log file created! Starting monitor...`n" -ForegroundColor Green
    Get-Content $logPath -Wait -Tail 0
}
