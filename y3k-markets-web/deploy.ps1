# Deploy Y3K Markets to Cloudflare Pages

$ErrorActionPreference = "Stop"

Write-Host "Deploying Y3K Markets to Cloudflare Pages..." -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path -LiteralPath "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the project
Write-Host "Building Next.js application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

# Deploy to Cloudflare Pages
Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy out --project-name=y3kmarkets --branch=main --commit-dirty=true

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful." -ForegroundColor Green
    Write-Host ""
    Write-Host "Your site will be available at:" -ForegroundColor Cyan
    Write-Host "  https://y3k-markets.pages.dev" -ForegroundColor White
    Write-Host "  https://y3kmarkets.com" -ForegroundColor White
} else {
    Write-Host "Deployment failed." -ForegroundColor Red
    Write-Host "If authentication is required, run: npx wrangler login" -ForegroundColor Yellow
    exit 1
}
