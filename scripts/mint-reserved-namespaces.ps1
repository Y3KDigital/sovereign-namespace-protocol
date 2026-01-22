# Protocol Root Namespace Minting Script
# Mints ROOTS ONLY in strict tier order
# NO SUBDOMAINS until roots are locked

param(
    [Parameter(Mandatory=$false)]
    [string]$GenesisHash = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "./genesis/minted",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "🔒 Y3K Root Namespace Lock - Minting" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Load root lock manifest
$configPath = "./genesis/ROOT_LOCK_MANIFEST.json"
if (-not (Test-Path $configPath)) {
    Write-Error "Configuration file not found: $configPath"
    exit 1
}

$config = Get-Content $configPath | ConvertFrom-Json
Write-Host "✓ Loaded configuration: $($config.version)" -ForegroundColor Green

# Validate genesis hash matches
if ($config.genesis_hash -ne $GenesisHash) {
    Write-Warning "Genesis hash mismatch!"
    Write-Host "  Config: $($config.genesis_hash)" -ForegroundColor Yellow
    Write-Host "  Provided: $GenesisHash" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne 'y') {
        exit 1
    }
}

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "✓ Created output directory: $OutputDir" -ForegroundColor Green
}

# Function to mint a namespace
function Mint-Namespace {
    param(
        [string]$Label,
        [string]$SovereigntyClass,
        [string]$Tier,
        [string]$Category
    )
    
    if ($Verbose) {
        Write-Host "  Minting: $Label ($SovereigntyClass)" -ForegroundColor Gray
    }
    
    if ($DryRun) {
        return @{
            label = $Label
            sovereignty = $SovereigntyClass
            tier = $Tier
            category = $Category
            status = "dry-run"
        }
    }
    
    # Call snp-cli to mint the namespace
    try {
        $result = cargo run --release --bin snp-cli -- namespace derive `
            --genesis $GenesisHash `
            --label $Label `
            --sovereignty $SovereigntyClass `
            --output json 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            throw "CLI returned error code: $LASTEXITCODE"
        }
        
        $namespace = $result | ConvertFrom-Json
        
        return @{
            label = $Label
            id = $namespace.id
            sovereignty = $SovereigntyClass
            tier = $Tier
            category = $Category
            status = "minted"
        }
    }
    catch {
        Write-Warning "Failed to mint $Label : $_"
        return @{
            label = $Label
            sovereignty = $SovereigntyClass
            tier = $Tier
            category = $Category
            status = "failed"
            error = $_.Exception.Message
        }
    }
}

# Mint Tier 0 Constitutional Namespaces
Write-Host "`n📜 Tier 0: Constitutional Namespaces" -ForegroundColor Magenta
Write-Host "   (Non-transferable, governance-only)`n" -ForegroundColor Gray

$tier0Results = @()
$tier0Count = 0
foreach ($label in $config.tier_0_constitutional.namespaces) {
    $result = Mint-Namespace -Label $label `
        -SovereigntyClass "ProtocolReserved" `
        -Tier "0" `
        -Category "Constitutional"
    
    $tier0Results += $result
    $tier0Count++
    Write-Host "  [$tier0Count/$($config.tier_0_constitutional.namespaces.Count)] $label" -ForegroundColor Green
}

# Mint Tier 1 Strategic Assets
Write-Host "`n🏦 Tier 1: Strategic Asset Namespaces" -ForegroundColor Cyan
Write-Host "   (Protocol-controlled, delegable)`n" -ForegroundColor Gray

$tier1Results = @()
$tier1Categories = @(
    @{ name = "Legal & Compliance"; key = "tier_1_strategic_legal" },
    @{ name = "Financial Services"; key = "tier_1_strategic_financial" },
    @{ name = "Asset Management"; key = "tier_1_strategic_assets" },
    @{ name = "Identity & Verification"; key = "tier_1_strategic_identity" },
    @{ name = "AI & Agents"; key = "tier_1_strategic_ai" },
    @{ name = "Telecommunications"; key = "tier_1_strategic_telco" },
    @{ name = "Automotive"; key = "tier_1_strategic_auto" },
    @{ name = "Insurance & Risk"; key = "tier_1_strategic_insurance" }
)

$tier1Count = 0
foreach ($category in $tier1Categories) {
    Write-Host "`n  📂 $($category.name):" -ForegroundColor Yellow
    
    $categoryConfig = $config.($category.key)
    foreach ($label in $categoryConfig.namespaces) {
        $result = Mint-Namespace -Label $label `
            -SovereigntyClass "ProtocolControlled" `
            -Tier "1" `
            -Category $category.name
        
        $tier1Results += $result
        $tier1Count++
        Write-Host "     ✓ $label" -ForegroundColor Green
    }
}

# Summary
Write-Host "`n`n📊 Minting Summary" -ForegroundColor Cyan
Write-Host "==================`n" -ForegroundColor Cyan

$allResults = $tier0Results + $tier1Results
$successful = ($allResults | Where-Object { $_.status -eq "minted" }).Count
$failed = ($allResults | Where-Object { $_.status -eq "failed" }).Count
$dryRun = ($allResults | Where-Object { $_.status -eq "dry-run" }).Count

Write-Host "Tier 0 (Constitutional):  $tier0Count namespaces" -ForegroundColor Magenta
Write-Host "Tier 1 (Strategic):       $tier1Count namespaces" -ForegroundColor Cyan
Write-Host "Total:                    $($allResults.Count) namespaces`n" -ForegroundColor White

if ($DryRun) {
    Write-Host "Mode: DRY RUN (no actual minting)" -ForegroundColor Yellow
    Write-Host "Would mint: $dryRun namespaces`n" -ForegroundColor Yellow
} else {
    Write-Host "✅ Successful: $successful" -ForegroundColor Green
    if ($failed -gt 0) {
        Write-Host "❌ Failed: $failed" -ForegroundColor Red
    }
}

# Save results to file
$outputFile = Join-Path $OutputDir "minted-namespaces-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$outputData = @{
    timestamp = Get-Date -Format "o"
    genesis_hash = $GenesisHash
    dry_run = $DryRun.IsPresent
    tier_0 = $tier0Results
    tier_1 = $tier1Results
    summary = @{
        total = $allResults.Count
        tier_0_count = $tier0Count
        tier_1_count = $tier1Count
        successful = $successful
        failed = $failed
    }
}

$outputData | ConvertTo-Json -Depth 10 | Set-Content $outputFile
Write-Host "📄 Results saved to: $outputFile`n" -ForegroundColor Gray

# Display failures if any
if ($failed -gt 0) {
    Write-Host "`n❌ Failed Namespaces:" -ForegroundColor Red
    foreach ($result in ($allResults | Where-Object { $_.status -eq "failed" })) {
        Write-Host "   $($result.label): $($result.error)" -ForegroundColor Red
    }
}

# Display next steps
if (-not $DryRun -and $successful -gt 0) {
    Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Verify minted namespaces in blockchain/registry" -ForegroundColor White
    Write-Host "2. Transfer to protocol multisig address" -ForegroundColor White
    Write-Host "3. Begin active usage for routing" -ForegroundColor White
    Write-Host "4. Prepare subdomain delegation framework" -ForegroundColor White
    Write-Host "5. Update Y3K Markets to display reserved names`n" -ForegroundColor White
}

if ($DryRun) {
    Write-Host "💡 Run without -DryRun flag to execute actual minting`n" -ForegroundColor Yellow
}

Write-Host "✨ Complete!" -ForegroundColor Green
