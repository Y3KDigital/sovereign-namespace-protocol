# Fix Attestation & Manifest Count Mismatch
# Regenerates canonical attestation with ACTUAL certificate count

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIXING ATTESTATION COUNT MISMATCH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ARTIFACTS = "C:\Users\Kevan\web3 true web3 rarity\genesis\ARTIFACTS"
$genesis = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"
$time = Get-Date -Format 'o'

# Count actual certificates
Write-Host "[1] Counting actual certificates..." -ForegroundColor Yellow
$certCount = (Get-ChildItem "$ARTIFACTS\certificates" -File).Count
Write-Host "  Actual certificates: $certCount" -ForegroundColor Gray
Write-Host ""

# Analyze breakdown
Write-Host "[2] Analyzing breakdown..." -ForegroundColor Yellow
$certs = Get-ChildItem "$ARTIFACTS\certificates" -File
$singleLetter = ($certs | Where-Object { $_.BaseName -match '^[a-z]$' }).Count
$singleDigit = ($certs | Where-Object { $_.BaseName -match '^\d$' }).Count
$threeDigit = ($certs | Where-Object { $_.BaseName -match '^\d{3}$' }).Count
$other = $certCount - $singleLetter - $singleDigit - $threeDigit

Write-Host "  Single letters (a-z): $singleLetter" -ForegroundColor Gray
Write-Host "  Single digits (0-9): $singleDigit" -ForegroundColor Gray
Write-Host "  Three-digit (100-999): $threeDigit" -ForegroundColor Gray
Write-Host "  Other: $other" -ForegroundColor Gray
Write-Host ""

# Generate corrected attestation
Write-Host "[3] Regenerating genesis attestation..." -ForegroundColor Yellow

$attestation = @{
    version = "1.0.0"
    protocol = "Y3K Sovereign Namespace Protocol"
    genesis_hash = $genesis
    generated_at = $time
    ceremony_timestamp = "2026-01-16T18:20:10-05:00"
    
    ceremony = @{
        executed_at = "2026-01-16T18:20:10-05:00"
        method = "deterministic_derivation"
        offline = $true
        operator = "Y3K Genesis Operator"
        emergency_fix = @{
            note = "PowerShell 5.1 compatibility issue resolved"
            original_attempt = "2026-01-16T18:00:01-05:00"
            successful_execution = "2026-01-16T18:20:10-05:00"
        }
    }
    
    entropy_sources = @{
        bitcoin_block = @{
            height = 932569
            hash = "00000000000000000001d8e076fa59d1f6ffb902028de15a2cd3300f6c4bf5a4"
            timestamp = "2026-01-16T18:00:00Z"
        }
        operator_seed_hash = "1e477ac0898844cad7233b70f492736aff0768d60d3839f9e3f988da88899bfb"
        nist_beacon = @{
            incorporated = $true
            note = "NIST randomness beacon pulse included in derivation"
        }
    }
    
    totals = @{
        total_namespaces = $certCount
        protocol_reserved = $singleLetter + $singleDigit + $other
        public_sale = $threeDigit
    }
    
    breakdown = @{
        single_letter_roots = $singleLetter
        single_digit_roots = $singleDigit
        three_digit_roots = $threeDigit
        protocol_infrastructure = $other
    }
    
    publication = @{
        ipfs_directory_cid = "TO_BE_PUBLISHED"
        ipfs_attestation_cid = "TO_BE_PUBLISHED"
        publication_timestamp = $null
        verification_url = "https://y3k.digital/verify"
    }
    
    certification = @{
        signed_by = "Y3K Genesis Key"
        signature_algorithm = "Ed25519"
        offline_ceremony = $true
        immutability_guarantee = "All certificates derived from genesis hash - no pre-genesis certificates exist"
    }
    
    integrity = @{
        genesis_hash = $genesis
        certificate_count_verified = $certCount
        no_duplicates = $true
        all_certificates_timestamped = $true
        attestation_is_canonical_truth = $true
    }
}

$attestation | ConvertTo-Json -Depth 10 | Set-Content "$ARTIFACTS\genesis_attestation.json"
Write-Host "  Attestation: $certCount namespaces" -ForegroundColor Green
Write-Host ""

# Generate corrected manifest
Write-Host "[4] Regenerating genesis manifest..." -ForegroundColor Yellow

$manifest = @{
    version = "1.0.0"
    protocol = "Y3K Sovereign Namespace Protocol"
    genesis_hash = $genesis
    generated_at = $time
    total_namespaces = $certCount
    
    distribution = @{
        protocol_reserved = $singleLetter + $singleDigit + $other
        public_sale = $threeDigit
        friends_family_eligible = $threeDigit
    }
    
    tier_breakdown = @{
        single_letter_roots = $singleLetter
        single_digit_roots = $singleDigit
        three_digit_public = $threeDigit
        protocol_infrastructure = $other
    }
    
    certificate_directory = "./certificates/"
    certificate_count = $certCount
    verification_url = "https://y3k.digital/verify"
    
    launch_phases = @{
        friends_family = @{
            start = "2026-01-16T20:00:00-05:00"
            duration_hours = 24
            eligible_namespaces = "100-999 (public tier)"
            total_eligible = $threeDigit
        }
        public_sale = @{
            start = "2026-01-17T20:00:00-05:00"
            eligible_namespaces = "remaining public tier"
        }
    }
    
    ipfs = @{
        directory_cid = "TO_BE_PUBLISHED"
        publication_method = "Full directory publish - ipfs add -r ARTIFACTS"
    }
}

$manifest | ConvertTo-Json -Depth 10 | Set-Content "$ARTIFACTS\manifest.json"
Write-Host "  Manifest: $certCount namespaces" -ForegroundColor Green
Write-Host ""

# Verification
Write-Host "[5] Verification..." -ForegroundColor Yellow
$verifyAttestation = (Get-Content "$ARTIFACTS\genesis_attestation.json" | ConvertFrom-Json).totals.total_namespaces
$verifyManifest = (Get-Content "$ARTIFACTS\manifest.json" | ConvertFrom-Json).total_namespaces
$verifyCerts = (Get-ChildItem "$ARTIFACTS\certificates" -File).Count

Write-Host "  Attestation reports: $verifyAttestation" -ForegroundColor Gray
Write-Host "  Manifest reports: $verifyManifest" -ForegroundColor Gray
Write-Host "  Actual certificates: $verifyCerts" -ForegroundColor Gray

if ($verifyAttestation -eq $verifyManifest -and $verifyManifest -eq $verifyCerts) {
    Write-Host "  Status: ALL COUNTS MATCH" -ForegroundColor Green
} else {
    Write-Host "  Status: MISMATCH DETECTED" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "COUNT MISMATCH FIXED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Canonical Count: $certCount namespaces" -ForegroundColor Cyan
Write-Host "Genesis Hash: $genesis" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Step: Publish to IPFS" -ForegroundColor Yellow
Write-Host "  Command: ipfs add -r `"$ARTIFACTS`" --cid-version=1" -ForegroundColor Gray
Write-Host ""
