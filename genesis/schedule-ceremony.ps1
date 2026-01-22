# Create Scheduled Task for Automated Genesis Ceremony
# Execution Time: 2026-01-16T20:00:00Z (3:00 PM EST / 8:00 PM UTC)

$ErrorActionPreference = "Stop"

Write-Host "=== Creating Scheduled Genesis Ceremony Task ===" -ForegroundColor Cyan
Write-Host ""

# Task Configuration
$TaskName = "Y3K_Genesis_Ceremony_Auto"
$ScriptPath = "C:\Users\Kevan\web3 true web3 rarity\genesis\run-genesis-and-enable-minting.ps1"
$ExecutionTime = Get-Date "2026-01-16T18:00:00" # 6:00 PM EST (local time)

Write-Host "Task Name: $TaskName" -ForegroundColor White
Write-Host "Script: $ScriptPath" -ForegroundColor White
Write-Host "Execution Time: $ExecutionTime" -ForegroundColor White
Write-Host ""

# Remove existing task if it exists
try {
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Removing existing task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "✅ Existing task removed" -ForegroundColor Green
    }
} catch {
    # Task doesn't exist, continue
}

# Create new task
Write-Host "Creating scheduled task..." -ForegroundColor Yellow

$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -NoProfile -WindowStyle Normal -File `"$ScriptPath`""

$Trigger = New-ScheduledTaskTrigger -Once -At $ExecutionTime

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 4)

$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description "Y3K Genesis Ceremony + Namespace Population - Automated Execution (enables minting)"

Write-Host "✅ Scheduled task created" -ForegroundColor Green
Write-Host ""

# Verify task
$task = Get-ScheduledTask -TaskName $TaskName
Write-Host "Task Status: $($task.State)" -ForegroundColor Gray
Write-Host "Next Run Time: $($task.Triggers[0].StartBoundary)" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Task Created Successfully ===" -ForegroundColor Green
Write-Host ""
Write-Host "The ceremony will execute automatically at:" -ForegroundColor White
Write-Host "  $ExecutionTime (local time)" -ForegroundColor Cyan
Write-Host "  2026-01-16T23:00:00Z (UTC)" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view task:" -ForegroundColor Yellow
Write-Host "  Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host ""
Write-Host "To run manually now:" -ForegroundColor Yellow
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host ""
Write-Host "To remove task:" -ForegroundColor Yellow
Write-Host "  Unregister-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host ""
