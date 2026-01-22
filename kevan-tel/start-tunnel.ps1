# Start Cloudflared Tunnel - Keep Running
# This script starts cloudflared in a persistent window

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║           CLOUDFLARED TUNNEL - KEEP THIS RUNNING             ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "Starting cloudflared tunnel to expose webhook server...`n" -ForegroundColor Yellow
Write-Host "⚠️  DO NOT CLOSE THIS WINDOW - Tunnel must stay running`n" -ForegroundColor Magenta

cd "c:\Users\Kevan\web3 true web3 rarity\payments-api"

Write-Host "Webhook server: http://localhost:3000" -ForegroundColor White
Write-Host "Public URL will appear below...`n" -ForegroundColor White

Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray

# Run cloudflared
cloudflared tunnel --url http://localhost:3000

# If tunnel stops, prompt to restart
Write-Host "`n`n⚠️  Tunnel stopped!" -ForegroundColor Red
Write-Host "Press any key to restart, or Ctrl+C to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Restart
& $PSCommandPath
