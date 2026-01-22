# Generate Crown Letter Certificates
# For the 11 locked Y3K Infrastructure Crown Letters

$ErrorActionPreference = "Continue"
$genesis_hash = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"
$output_dir = "..\..\genesis\CROWN_CERTIFICATES"

# Create output directory
New-Item -ItemType Directory -Path $output_dir -Force | Out-Null

Write-Host "`n" -NoNewline
Write-Host "="*70 -ForegroundColor Cyan
Write-Host "GENERATING Y3K CROWN LETTER CERTIFICATES" -ForegroundColor Cyan
Write-Host "="*70 -ForegroundColor Cyan

$crown_letters = @(
    @{letter='x'; purpose='Personal sovereignty root (kevan.x, tel.x, finance.x)'},
    @{letter='y'; purpose='Y3K business operations'},
    @{letter='k'; purpose='Y3K brand identity'},
    @{letter='l'; purpose='Legal infrastructure (law.l, legal.l, court.l)'},
    @{letter='a'; purpose='AI infrastructure (ai.a, agents.a, models.a)'},
    @{letter='b'; purpose='Banking infrastructure (bank.b, trust.b)'},
    @{letter='f'; purpose='Finance infrastructure (finance.f, payments.f)'},
    @{letter='t'; purpose='Trust/Identity infrastructure (trust.t, identity.t)'},
    @{letter='e'; purpose='Enforcement infrastructure (enforcement.e, dispute.e)'},
    @{letter='r'; purpose='Registry infrastructure (registry.r, records.r)'},
    @{letter='c'; purpose='Compliance infrastructure (compliance.c, risk.c)'}
)

$success_count = 0
$failed_count = 0

foreach ($crown in $crown_letters) {
    $letter = $crown.letter
    $purpose = $crown.purpose
    $output_file = Join-Path $output_dir "$letter.json"
    
    Write-Host "`nGenerating Crown '$letter' certificate..." -ForegroundColor Yellow
    Write-Host "  Purpose: $purpose" -ForegroundColor Gray
    
    $result = & cargo run --release -- namespace create `
        --genesis $genesis_hash `
        --label $letter `
        --sovereignty "immutable" `
        --output $output_file 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Generated: $output_file" -ForegroundColor Green
        $success_count++
    } else {
        Write-Host "  ❌ Failed: $result" -ForegroundColor Red
        $failed_count++
    }
}

Write-Host "`n" -NoNewline
Write-Host "="*70 -ForegroundColor Cyan
Write-Host "CROWN CERTIFICATE GENERATION COMPLETE" -ForegroundColor Cyan
Write-Host "="*70 -ForegroundColor Cyan
Write-Host "✅ Success: $success_count" -ForegroundColor Green
Write-Host "❌ Failed: $failed_count" -ForegroundColor Red
Write-Host "Output Directory: $output_dir" -ForegroundColor Cyan
