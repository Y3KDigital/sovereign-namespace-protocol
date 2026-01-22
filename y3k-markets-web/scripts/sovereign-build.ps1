# Sovereign Build Automation
# Clear cache + verify sovereignty + clean build
# Run this before any production deployment

Write-Host "🛡️  Y3K Sovereign Build Process" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Step 1: Clean cache
Write-Host "Step 1: Cleaning cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Cache cleared`n" -ForegroundColor Green
} else {
    Write-Host "ℹ No cache found (already clean)`n" -ForegroundColor Gray
}

# Step 2: Verify sovereign requirements
Write-Host "Step 2: Verifying sovereign build..." -ForegroundColor Yellow
node scripts/verify-sovereign.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Sovereign verification failed. Aborting build." -ForegroundColor Red
    exit 1
}

# Step 3: Build
Write-Host "Step 3: Building production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Sovereign build complete. Ready to deploy.`n" -ForegroundColor Green
Write-Host "Deploy with: npm run pages:deploy" -ForegroundColor Cyan
