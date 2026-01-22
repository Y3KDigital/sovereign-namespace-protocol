# Restore Marketplace Homepage Script
# Restores the full marketplace page after genesis ceremony

Write-Host "=== Restore Y3K Markets Homepage ===" -ForegroundColor Cyan
Write-Host ""

# Change to website directory
Set-Location "c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web"

if (Test-Path .\app\page.backup.tsx) {
    Write-Host "1. Restoring marketplace homepage..." -ForegroundColor Yellow
    Copy-Item .\app\page.backup.tsx .\app\page.tsx -Force
    Write-Host "✅ Homepage restored" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "2. Building site..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Build complete" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "3. Deploying to Cloudflare Pages..." -ForegroundColor Yellow
    npx wrangler pages deploy out --project-name=y3kmarkets --branch=main
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Deployment complete" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Marketplace Restored ===" -ForegroundColor Cyan
    Write-Host "URL: https://y3kmarkets.com" -ForegroundColor White
} else {
    Write-Host "❌ Backup file not found: app\page.backup.tsx" -ForegroundColor Red
    exit 1
}
