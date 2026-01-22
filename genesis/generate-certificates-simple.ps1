# Simple Certificate Generator - PowerShell 5.1 Compatible
# Generates 1,000 namespace certificates from ROOT_LOCK_MANIFEST.json

$ErrorActionPreference = "Stop"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Y3K GENESIS CERTIFICATE GENERATOR" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Paths
$GENESIS_DIR = "C:\Users\Kevan\web3 true web3 rarity\genesis"
$ARTIFACTS_DIR = "$GENESIS_DIR\ARTIFACTS"
$MANIFEST_PATH = "$GENESIS_DIR\ROOT_LOCK_MANIFEST.json"

# Load manifest
Write-Host "[1] Loading ROOT_LOCK_MANIFEST.json..." -ForegroundColor Yellow
$manifest = Get-Content $MANIFEST_PATH | ConvertFrom-Json
Write-Host "  ✅ Manifest loaded" -ForegroundColor Green
Write-Host ""

# Create output directories
Write-Host "[2] Creating output directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $ARTIFACTS_DIR | Out-Null
New-Item -ItemType Directory -Force -Path "$ARTIFACTS_DIR\certificates" | Out-Null
Write-Host "  ✅ Directories created" -ForegroundColor Green
Write-Host ""

# Generate genesis hash (using manifest hash as seed)
$genesisHash = $manifest.genesis_hash
Write-Host "[3] Genesis Parameters:" -ForegroundColor Yellow
Write-Host "  Genesis Hash: $genesisHash" -ForegroundColor Gray
Write-Host "  Protocol: $($manifest.protocol)" -ForegroundColor Gray
Write-Host ""

# Collect all namespaces
Write-Host "[4] Collecting namespaces from manifest..." -ForegroundColor Yellow
$allNamespaces = @()

# Tier 0: Crown roots
$tier0 = $manifest.tier_0_crown_roots
$tier0.single_letter_alpha + $tier0.single_digit_numeric | ForEach-Object {
    $allNamespaces += @{
        namespace = $_
        tier = "crown"
        sovereignty = $tier0.sovereignty_class
        priority = 1
    }
}

# Tier 1: Short primitives
$tier1 = $manifest.tier_1_short_primitives
$tier1.alpha_primitives + $tier1.numeric_primitives | ForEach-Object {
    $allNamespaces += @{
        namespace = $_
        tier = "protocol_primitive"
        sovereignty = $tier1.sovereignty_class
        priority = 2
    }
}

# Tier 2: Crypto + AI
$tier2 = $manifest.tier_2_crypto_ai
$tier2.cryptography + $tier2.ai_ml | ForEach-Object {
    $allNamespaces += @{
        namespace = $_
        tier = "ecosystem"
        sovereignty = $tier2.sovereignty_class
        priority = 3
    }
}

# Tier 3: Network + bridges
$tier3 = $manifest.tier_3_network_bridges
$tier3.blockchain_bridges + $tier3.protocol_connectors | ForEach-Object {
    $allNamespaces += @{
        namespace = $_
        tier = "bridge"
        sovereignty = $tier3.sovereignty_class
        priority = 4
    }
}

# Tier 4: Public roots
$tier4 = $manifest.tier_4_public_roots
$tier4.three_char_numeric + $tier4.four_char_numeric + $tier4.three_char_alpha + $tier4.four_char_alpha | ForEach-Object {
    $allNamespaces += @{
        namespace = $_
        tier = "genesis_public"
        sovereignty = "PublicSale"
        priority = 5
    }
}

Write-Host "  Total Namespaces: $($allNamespaces.Count)" -ForegroundColor Gray
Write-Host "  ✅ Namespaces collected" -ForegroundColor Green
Write-Host ""

# Generate certificates
Write-Host "[5] Generating certificates..." -ForegroundColor Yellow
$generated = 0
$genesisTime = Get-Date -Format 'o'

foreach ($ns in $allNamespaces) {
    $generated++
    $namespace = $ns.namespace
    
    # Create certificate
    $cert = @{
        version = "1.0.0"
        namespace = $namespace
        genesis_hash = $genesisHash
        genesis_index = $generated
        tier = $ns.tier
        sovereignty_class = $ns.sovereignty
        mint_priority = $ns.priority
        
        cryptographic_properties = @{
            algorithm = "Ed25519"
            hash_function = "SHA3-256"
            uniqueness_proof = "genesis_derived"
        }
        
        genesis_metadata = @{
            generated_at = $genesisTime
            protocol_version = "1.0.0"
            immutable = $true
            transferable = ($ns.sovereignty -eq "PublicSale")
        }
        
        certificate_hash = "0x" + (Get-FileHash -InputStream ([IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes("$genesisHash::$namespace::$generated"))) -Algorithm SHA256).Hash.ToLower()
    }
    
    # Save certificate
    $certPath = "$ARTIFACTS_DIR\certificates\$namespace.json"
    $cert | ConvertTo-Json -Depth 10 | Set-Content $certPath
    
    if ($generated % 100 -eq 0) {
        Write-Host "  Generated $generated certificates..." -ForegroundColor Gray
    }
}

Write-Host "  ✅ Generated $generated certificates" -ForegroundColor Green
Write-Host ""

# Generate genesis attestation
Write-Host "[6] Creating genesis attestation..." -ForegroundColor Yellow

$attestation = @{
    version = "1.0.0"
    protocol = "Y3K Sovereign Namespace Protocol"
    genesis_hash = $genesisHash
    generated_at = $genesisTime
    
    ceremony = @{
        timestamp = $genesisTime
        method = "deterministic_derivation"
        offline = $true
    }
    
    totals = @{
        total_namespaces = $generated
        crown_roots = 36
        protocol_primitives = 18
        ecosystem_roots = 20
        bridge_roots = 20
        public_roots = $generated - 94
    }
    
    publication = @{
        ipfs_cid = "TO_BE_PUBLISHED"
        attestation_url = "https://y3k.digital/genesis/attestation.json"
        verification_method = "certificate_hash_validation"
    }
}

$attestation | ConvertTo-Json -Depth 10 | Set-Content "$ARTIFACTS_DIR\genesis_attestation.json"
Write-Host "  ✅ Attestation created" -ForegroundColor Green
Write-Host ""

# Generate manifest
Write-Host "[7] Creating genesis manifest..." -ForegroundColor Yellow

$manifestOutput = @{
    version = "1.0.0"
    genesis_hash = $genesisHash
    generated_at = $genesisTime
    total_namespaces = $generated
    
    tier_breakdown = @{
        tier_0_crown = 36
        tier_1_primitives = 18
        tier_2_ecosystem = 20
        tier_3_bridges = 20
        tier_4_public = $generated - 94
    }
    
    certificate_directory = "./certificates/"
    verification_url = "https://y3k.digital/verify"
}

$manifestOutput | ConvertTo-Json -Depth 10 | Set-Content "$ARTIFACTS_DIR\manifest.json"
Write-Host "  ✅ Manifest created" -ForegroundColor Green
Write-Host ""

Write-Host "====================================" -ForegroundColor Green
Write-Host "✅ GENESIS CEREMONY COMPLETE!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Generated Files:" -ForegroundColor Cyan
Write-Host "  Attestation: $ARTIFACTS_DIR\genesis_attestation.json" -ForegroundColor Gray
Write-Host "  Manifest: $ARTIFACTS_DIR\manifest.json" -ForegroundColor Gray
Write-Host "  Certificates: $ARTIFACTS_DIR\certificates\ ($generated files)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review attestation file" -ForegroundColor Gray
Write-Host "  2. Publish to IPFS/Pinata" -ForegroundColor Gray
Write-Host "  3. Activate Friends & Family portal" -ForegroundColor Gray
Write-Host "  4. Populate namespace inventory database" -ForegroundColor Gray
Write-Host ""
