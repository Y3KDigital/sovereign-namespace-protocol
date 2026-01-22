# Deploy Y3K Markets to Cloudflare Pages

$ErrorActionPreference = "Stop"

# Pin Wrangler to a known-good version to avoid intermittent Pages deploy failures.
# (Newer Wrangler releases have occasionally returned: "Failed to publish your Function. Got error: Unknown internal error occurred.")
$WranglerVersion = "3.22.1"

Write-Host "Deploying Y3K Markets to Cloudflare Pages..." -ForegroundColor Cyan

function Get-DotenvValue([string]$Path, [string]$Key) {
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    $lines = Get-Content -LiteralPath $Path -ErrorAction SilentlyContinue
    foreach ($line in $lines) {
        $t = $line.Trim()
        if ($t -eq "" -or $t.StartsWith("#")) { continue }
        if ($t.StartsWith("$Key=")) {
            return $t.Substring($Key.Length + 1)
        }
    }
    return $null
}

# Preflight: Stripe publishable key must be present at build time or the live /mint page cannot accept payments.
$envFile = Join-Path (Get-Location) ".env.local"
$publishable = $env:NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
if (-not $publishable) { $publishable = Get-DotenvValue -Path $envFile -Key "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" }
$publishable = ($publishable ?? "").Trim()

if (-not $publishable) {
    Write-Host "ERROR: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set (build-time)." -ForegroundColor Red
    Write-Host "  Set it in Cloudflare Pages (Settings → Environment variables) OR in y3k-markets-web/.env.local before running this deploy script." -ForegroundColor Yellow
    exit 1
}

if ($publishable.StartsWith("pk_test_")) {
    Write-Host "WARNING: Using a Stripe TEST publishable key (pk_test_*). This deploy will NOT take real money." -ForegroundColor Yellow
}

# Preflight: API base should point at the public payments-api.
$apiUrl = $env:NEXT_PUBLIC_API_URL
if (-not $apiUrl) { $apiUrl = Get-DotenvValue -Path $envFile -Key "NEXT_PUBLIC_API_URL" }
$apiUrl = ($apiUrl ?? "").Trim()
if (-not $apiUrl) {
    Write-Host "WARNING: NEXT_PUBLIC_API_URL is not set. The app will default to https://api.y3kmarkets.com." -ForegroundColor Yellow
} elseif ($apiUrl -match "^http://(127\\.0\\.0\\.1|localhost)(:|/|$)") {
    Write-Host "WARNING: NEXT_PUBLIC_API_URL is set to localhost ($apiUrl). For production, use https://api.y3kmarkets.com." -ForegroundColor Yellow
}

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
npx -y "wrangler@$WranglerVersion" pages deploy out --project-name=y3kmarkets --branch=main --commit-dirty=true

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful." -ForegroundColor Green
    Write-Host ""
    Write-Host "Your site will be available at:" -ForegroundColor Cyan
    Write-Host "  https://y3kmarkets.pages.dev" -ForegroundColor White
    Write-Host "  https://x.y3kmarkets.com" -ForegroundColor White
    Write-Host "  https://y3kmarkets.com" -ForegroundColor White
} else {
    Write-Host "Deployment failed." -ForegroundColor Red
    Write-Host "If authentication is required, run: npx wrangler login" -ForegroundColor Yellow
    exit 1
}
