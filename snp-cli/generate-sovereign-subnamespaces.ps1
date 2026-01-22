# Generate Sovereign Sub-Namespace Certificates
# Issue Layer 1 sub-namespaces beneath locked Crown Letters

$ErrorActionPreference = "Continue"
$genesisHash = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"
$outputDir = "..\..\genesis\SOVEREIGN_SUBNAMESPACES"

# Create output directory
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Write-Host "`n=== GENERATING SOVEREIGN SUB-NAMESPACE CERTIFICATES ===" -ForegroundColor Cyan
Write-Host "Output Directory: $outputDir`n" -ForegroundColor Gray

# Define sub-namespaces to issue
$subnamespaces = @(
    # Bradley's (Donald Trump's advisor) Sovereignty Stack
    "brad.x|immutable|Personal sovereignty root - Bradley",
    "brad.finance.x|delegable|Financial hub",
    "brad.tel.x|delegable|Communications endpoint",
    "brad.vault.x|immutable|Data vault",
    "brad.auth.x|delegable|Access control",
    "brad.registry.x|immutable|Registry authority",

    # Donald's (Donald Trump) Sovereignty Stack
    "don.x|immutable|Personal sovereignty root - Donald",
    "don.finance.x|delegable|Financial hub",
    "don.tel.x|delegable|Communications endpoint",
    "don.vault.x|immutable|Data vault",
    "don.auth.x|delegable|Access control",
    "don.registry.x|immutable|Registry authority",

    # Seven's (Donald Trump's son) Sovereignty Stack
    "77.x|immutable|Personal sovereignty root - Seven",
    "77.finance.x|delegable|Financial hub",
    "77.tel.x|delegable|Communications endpoint",
    "77.vault.x|immutable|Data vault",
    "77.auth.x|delegable|Access control",
    "77.registry.x|immutable|Registry authority",
    
    # Konnor's Sovereignty Stack
    "konnor.x|immutable|Personal sovereignty root",
    "konnor.finance.x|delegable|Financial hub",
    "konnor.tel.x|delegable|Communications endpoint",
    "konnor.vault.x|immutable|Data vault",
    "konnor.auth.x|delegable|Access control",
    "konnor.registry.x|immutable|Registry authority",

    # Kaci's Sovereignty Stack
    "kaci.x|immutable|Personal sovereignty root",
    "kaci.finance.x|delegable|Financial hub",
    "kaci.tel.x|delegable|Communications endpoint",
    "kaci.vault.x|immutable|Data vault",
    "kaci.auth.x|delegable|Access control",
    "kaci.registry.x|immutable|Registry authority",

    # Yoda's Sovereignty Stack
    "yoda.x|immutable|Personal sovereignty root",
    "yoda.finance.x|delegable|Financial hub",
    "yoda.tel.x|delegable|Communications endpoint",
    "yoda.vault.x|immutable|Data vault",
    "yoda.auth.x|delegable|Access control",
    "yoda.registry.x|immutable|Registry authority",

    # Jimmy's Sovereignty Stack
    "jimmy.x|immutable|Personal sovereignty root",
    "jimmy.finance.x|delegable|Financial hub",
    "jimmy.tel.x|delegable|Communications endpoint",
    "jimmy.vault.x|immutable|Data vault",
    "jimmy.auth.x|delegable|Access control",
    "jimmy.registry.x|immutable|Registry authority",

    # Lael's Sovereignty Stack
    "lael.x|immutable|Personal sovereignty root",
    "lael.finance.x|delegable|Financial hub",
    "lael.tel.x|delegable|Communications endpoint",
    "lael.vault.x|immutable|Data vault",
    "lael.auth.x|delegable|Access control",
    "lael.registry.x|immutable|Registry authority",

    # Buck's Sovereignty Stack
    "buck.x|immutable|Personal sovereignty root",
    "buck.finance.x|delegable|Financial hub",
    "buck.tel.x|delegable|Communications endpoint",
    "buck.vault.x|immutable|Data vault",
    "buck.auth.x|delegable|Access control",
    "buck.registry.x|immutable|Registry authority",
    "y3k.y|immutable|Y3K operational root",
    "y3k.finance.y|delegable|Y3K business finance",
    "y3k.markets.y|immutable|Y3K Markets namespace",
    "law.l|immutable|Legal infrastructure",
    "legal.l|immutable|Legal services",
    "court.l|delegable|Court/judicial",
    "justice.l|immutable|Justice system",
    "compliance.l|delegable|Compliance/regulatory",
    "ai.a|immutable|AI infrastructure",
    "agents.a|delegable|AI agents",
    "models.a|delegable|AI models",
    "bank.b|immutable|Banking infrastructure",
    "trust.b|delegable|Trust/custody",
    "treasury.b|delegable|Treasury management",
    "finance.f|immutable|Financial infrastructure",
    "payments.f|delegable|Payment processing",
    "settlement.f|delegable|Settlement",
    "trust.t|immutable|Trust infrastructure",
    "custody.t|delegable|Custody services",
    "energy.e|immutable|Energy/execution",
    "exec.e|delegable|Execution namespace",
    "routing.r|immutable|Routing infrastructure",
    "relay.r|delegable|Relay namespace",
    "compute.c|immutable|Compute infrastructure",
    "cloud.c|delegable|Cloud services",
    "key.k|immutable|Key/crypto infrastructure",
    "kms.k|delegable|Key management"
)

$success = 0
$failed = 0

foreach ($entry in $subnamespaces) {
    $parts = $entry -split '\|'
    $name = $parts[0]
    $sovereignty = $parts[1]
    $description = $parts[2]
    $outputFile = Join-Path $outputDir "$name.json"
    
    Write-Host "Generating: $name" -ForegroundColor Yellow
    Write-Host "  Sovereignty: $sovereignty | $description" -ForegroundColor Gray
    
    $result = cargo run --quiet -- namespace create --genesis $genesisHash --label $name --sovereignty $sovereignty --output $outputFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Success" -ForegroundColor Green
        $success++
    } else {
        Write-Host "  Failed: $result" -ForegroundColor Red
        $failed++
    }
    Write-Host ""
}

Write-Host "`n=== GENERATION COMPLETE ===" -ForegroundColor Cyan
Write-Host "Success: $success" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "`nCertificates saved to: $outputDir" -ForegroundColor Gray
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Verify certificate contents: Get-ChildItem `"$outputDir`" *.json" -ForegroundColor Gray
Write-Host "2. Add sub-namespaces to database with issuer_only status" -ForegroundColor Gray
Write-Host "3. Document delegation policy (which sub-namespaces can delegate to partners)" -ForegroundColor Gray
