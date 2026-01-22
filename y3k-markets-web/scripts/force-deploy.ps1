# Force Deploy Sovereign Version
# This script ensures absolutely no caching occurs

Write-Host "`n" -NoNewline
Write-Host "🛡️ FORCE DEPLOY - Sovereign v2.1.1" -ForegroundColor Cyan
Write-Host "`n" -NoNewline

# Step 1: Nuclear clean
Write-Host "Step 1: Nuclear clean..." -ForegroundColor Yellow
Remove-Item -Recurse -Force ".next",".wrangler","out","node_modules/.cache" -ErrorAction SilentlyContinue
Write-Host "[OK] All caches destroyed`n" -ForegroundColor Green

# Step 2: Verify source
Write-Host "Step 2: Verifying source code..." -ForegroundColor Yellow
node scripts/verify-sovereign.js
if ($LASTEXITCODE -ne 0) {
    exit 1
}

# Step 3: Build with verbose output
Write-Host "Step 3: Building with full output..." -ForegroundColor Yellow
$env:NEXT_TELEMETRY_DISABLED = "1"
npx next build --no-lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed" -ForegroundColor Red
    exit 1
}

# Step 4: Verify output
Write-Host "`nStep 4: Verifying build output..." -ForegroundColor Yellow
$buildHash = node scripts\build-hash.js
if (Test-Path "out\_next\static\chunks\app\mint\*.js") {
    $mintJs = Get-ChildItem "out\_next\static\chunks\app\mint\*.js" | Select-Object -First 1
    $content = Get-Content $mintJs.FullName -Raw
    if ($content -match "v2\.1.*Sovereign" -and $content -match "Hash:\s*[a-f0-9]{7}") {
        Write-Host "[VERIFIED] Sovereign v2.1.1 in output (Hash: $buildHash)" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Old version still in output" -ForegroundColor Red
        Write-Host "Checking for old patterns..." -ForegroundColor Yellow
        if ($content -match "77\.x") { Write-Host "  Found: .x pattern" -ForegroundColor Red }
        if ($content -match "email") { Write-Host "  Found: email field" -ForegroundColor Red }
        if ($content -match "stripe") { Write-Host "  Found: stripe reference" -ForegroundColor Red }
        exit 1
    }
} else {
    Write-Host "[ERROR] Output file not found" -ForegroundColor Red
    exit 1
}

# Step 5: Deploy
Write-Host "`nStep 5: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy out --project-name=y3kmarkets --branch=main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n[SUCCESS] DEPLOYMENT COMPLETE`n" -ForegroundColor Green
Write-Host "Deployed version: v2.1.1 Sovereign" -ForegroundColor Cyan
Write-Host "Build hash: $buildHash" -ForegroundColor Cyan
Write-Host "Date: Jan 22, 2026" -ForegroundColor Cyan
Write-Host "URL: https://y3kmarkets.pages.dev`n" -ForegroundColor Cyan
Write-Host "[NOTE] Cloudflare may take 1-2 minutes to propagate" -ForegroundColor Yellow
Write-Host "Clear browser cache with Ctrl+F5 when testing`n" -ForegroundColor Yellow
