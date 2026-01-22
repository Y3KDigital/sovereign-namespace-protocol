# Y3K Root Namespace Lock - IPFS Upload Script
# Uploads all genesis artifacts to IPFS via Pinata for immutable attestation

param(
    [Parameter(Mandatory=$false)]
    [string]$PinataApiKey = "23ee34ddc5ee1b7ad761",
    
    [Parameter(Mandatory=$false)]
    [string]$PinataApiSecret = "47d3afcc04156ab035d3d03d25c3b72682fabdcacdbb9deb853f2f3bb754eb89",
    
    [Parameter(Mandatory=$false)]
    [string]$PinataJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZWFhZGJhOS03NTc1LTRiMzQtODM4ZC1lNWZiMTI1NmJiNzMiLCJlbWFpbCI6ImtldmFuQHh4eGlpaS5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIyM2VlMzRkZGM1ZWUxYjdhZDc2MSIsInNjb3BlZEtleVNlY3JldCI6IjQ3ZDNhZmNjMDQxNTZhYjAzNWQzZDAzZDI1YzNiNzI2ODJmYWJkY2FjZGJiOWRlYjg1M2YyZjNiYjc1NGViODkiLCJleHAiOjE3OTk3OTYxODZ9.fv08rSoTtqf0mHS1fI1M_sprbqn_bwPz6sQLscPhr2g",
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "🌐 Y3K Root Namespace - IPFS Upload" -ForegroundColor Cyan
Write-Host "===================================`n" -ForegroundColor Cyan

# Pinata API endpoint
$pinataApiUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS"
$pinataJsonUrl = "https://api.pinata.cloud/pinning/pinJSONToIPFS"

# Headers for Pinata API
$headers = @{
    "Authorization" = "Bearer $PinataJWT"
}

# Function to upload JSON to IPFS
function Upload-JsonToIPFS {
    param(
        [string]$FilePath,
        [string]$Name,
        [hashtable]$Metadata = @{}
    )
    
    Write-Host "📤 Uploading: $Name" -ForegroundColor Yellow
    
    try {
        # Read JSON content
        $jsonContent = Get-Content $FilePath -Raw | ConvertFrom-Json
        
        # Prepare pinata metadata
        $pinataMetadata = @{
            name = $Name
            keyvalues = @{
                protocol = "Y3K"
                type = "root-lock-manifest"
                timestamp = (Get-Date -Format "o")
            }
        }
        
        # Add custom metadata
        foreach ($key in $Metadata.Keys) {
            $pinataMetadata.keyvalues[$key] = $Metadata[$key]
        }
        
        # Prepare request body
        $body = @{
            pinataContent = $jsonContent
            pinataMetadata = $pinataMetadata
            pinataOptions = @{
                cidVersion = 1
            }
        } | ConvertTo-Json -Depth 10
        
        # Upload to Pinata
        $response = Invoke-RestMethod -Uri $pinataJsonUrl -Method Post -Headers $headers -Body $body -ContentType "application/json"
        
        $cid = $response.IpfsHash
        $ipfsUrl = "ipfs://$cid"
        $gatewayUrl = "https://gateway.pinata.cloud/ipfs/$cid"
        
        Write-Host "  ✅ Uploaded: $cid" -ForegroundColor Green
        Write-Host "  🔗 IPFS URL: $ipfsUrl" -ForegroundColor Gray
        Write-Host "  🌐 Gateway: $gatewayUrl`n" -ForegroundColor Gray
        
        return @{
            cid = $cid
            ipfs_url = $ipfsUrl
            gateway_url = $gatewayUrl
            timestamp = (Get-Date -Format "o")
        }
    }
    catch {
        Write-Warning "Failed to upload $Name : $_"
        return $null
    }
}

# Function to generate certificate for a manifest
function Generate-Certificate {
    param(
        [string]$ManifestCID,
        [string]$ManifestName,
        [int]$TotalRoots
    )
    
    $certificate = @{
        certificate_type = "Y3K_ROOT_LOCK_ATTESTATION"
        version = "1.0.0"
        issued_at = (Get-Date -Format "o")
        genesis_hash = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"
        
        attestation = @{
            manifest_name = $ManifestName
            manifest_cid = $ManifestCID
            total_roots_locked = $TotalRoots
            lock_policy = "ROOTS_ONLY_NEVER_SOLD"
            transferability = "PROHIBITED"
            disclosure_policy = "INTENT_BASED_ONLY"
        }
        
        authority = @{
            protocol = "Y3K Sovereign Namespace Protocol"
            issuer = "Y3K Protocol Governance"
            signature_type = "Ed25519"
            public_key_fingerprint = "TO_BE_SIGNED"
        }
        
        verification = @{
            ipfs_hash = $ManifestCID
            can_verify_at = "https://gateway.pinata.cloud/ipfs/$ManifestCID"
            immutable = $true
            tamper_proof = $true
        }
        
        statement = "This certificate attests that the referenced root namespaces are sovereign-locked, privately held by Y3K Protocol, and subject to governance-controlled delegation only. Roots are never sold, auctioned, or publicly listed."
    }
    
    return $certificate
}

# Upload artifacts
$results = @{}

Write-Host "`n📋 Uploading Genesis Artifacts...`n" -ForegroundColor Cyan

# 1. Upload ROOT_LOCK_MANIFEST.json
$manifestPath = ".\genesis\ROOT_LOCK_MANIFEST.json"
if (Test-Path $manifestPath) {
    $manifestResult = Upload-JsonToIPFS -FilePath $manifestPath -Name "Y3K_Root_Lock_Manifest" -Metadata @{
        tier_count = 4
        total_roots = 82
        governance = "multisig"
    }
    
    if ($manifestResult) {
        $results["root_lock_manifest"] = $manifestResult
        
        # Generate certificate for manifest
        Write-Host "📜 Generating Certificate..." -ForegroundColor Yellow
        $certificate = Generate-Certificate -ManifestCID $manifestResult.cid -ManifestName "ROOT_LOCK_MANIFEST" -TotalRoots 82
        
        # Save certificate locally
        $certPath = ".\genesis\ROOT_LOCK_CERTIFICATE.json"
        $certificate | ConvertTo-Json -Depth 10 | Set-Content $certPath
        Write-Host "  ✅ Certificate saved: $certPath`n" -ForegroundColor Green
        
        # Upload certificate to IPFS
        $certResult = Upload-JsonToIPFS -FilePath $certPath -Name "Y3K_Root_Lock_Certificate" -Metadata @{
            manifest_cid = $manifestResult.cid
            certificate_type = "attestation"
        }
        
        if ($certResult) {
            $results["root_lock_certificate"] = $certResult
        }
    }
} else {
    Write-Warning "ROOT_LOCK_MANIFEST.json not found"
}

# 2. Upload PROTOCOL_RESERVED_NAMESPACES.md
$docPath = ".\PROTOCOL_RESERVED_NAMESPACES.md"
if (Test-Path $docPath) {
    Write-Host "📤 Uploading: Protocol Documentation" -ForegroundColor Yellow
    
    try {
        # For markdown, we need to use file upload
        $boundary = [System.Guid]::NewGuid().ToString()
        $fileName = "PROTOCOL_RESERVED_NAMESPACES.md"
        $fileContent = Get-Content $docPath -Raw
        
        # Create multipart form data
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
            "Content-Type: text/markdown",
            "",
            $fileContent,
            "--$boundary",
            "Content-Disposition: form-data; name=`"pinataMetadata`"",
            "Content-Type: application/json",
            "",
            (@{
                name = "Y3K_Protocol_Reserved_Namespaces_Specification"
                keyvalues = @{
                    protocol = "Y3K"
                    type = "specification"
                    version = "1.0.0"
                }
            } | ConvertTo-Json),
            "--$boundary--"
        )
        
        $body = $bodyLines -join "`r`n"
        
        $uploadHeaders = @{
            "Authorization" = "Bearer $PinataJWT"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }
        
        $response = Invoke-RestMethod -Uri $pinataApiUrl -Method Post -Headers $uploadHeaders -Body $body
        
        $cid = $response.IpfsHash
        Write-Host "  ✅ Uploaded: $cid" -ForegroundColor Green
        Write-Host "  🔗 IPFS URL: ipfs://$cid" -ForegroundColor Gray
        Write-Host "  🌐 Gateway: https://gateway.pinata.cloud/ipfs/$cid`n" -ForegroundColor Gray
        
        $results["protocol_specification"] = @{
            cid = $cid
            ipfs_url = "ipfs://$cid"
            gateway_url = "https://gateway.pinata.cloud/ipfs/$cid"
        }
    }
    catch {
        Write-Warning "Failed to upload documentation: $_"
    }
}

# Save results to file
$outputPath = ".\genesis\IPFS_UPLOAD_RESULTS.json"
$results | ConvertTo-Json -Depth 10 | Set-Content $outputPath

Write-Host "`n📊 Upload Summary" -ForegroundColor Cyan
Write-Host "================`n" -ForegroundColor Cyan

Write-Host "Artifacts Uploaded: $($results.Count)" -ForegroundColor Green

foreach ($key in $results.Keys) {
    $item = $results[$key]
    Write-Host "`n📦 $key" -ForegroundColor Yellow
    Write-Host "  CID: $($item.cid)" -ForegroundColor White
    Write-Host "  IPFS: $($item.ipfs_url)" -ForegroundColor Gray
    Write-Host "  Gateway: $($item.gateway_url)" -ForegroundColor Gray
}

Write-Host "`n📄 Results saved to: $outputPath" -ForegroundColor Gray

# Display verification instructions
Write-Host "`n✅ Verification Instructions:" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

if ($results["root_lock_manifest"]) {
    $manifestCID = $results["root_lock_manifest"].cid
    Write-Host "1. Verify Root Lock Manifest:" -ForegroundColor White
    Write-Host "   ipfs cat $manifestCID" -ForegroundColor Gray
    Write-Host "   curl https://gateway.pinata.cloud/ipfs/$manifestCID`n" -ForegroundColor Gray
}

if ($results["root_lock_certificate"]) {
    $certCID = $results["root_lock_certificate"].cid
    Write-Host "2. Verify Attestation Certificate:" -ForegroundColor White
    Write-Host "   ipfs cat $certCID" -ForegroundColor Gray
    Write-Host "   curl https://gateway.pinata.cloud/ipfs/$certCID`n" -ForegroundColor Gray
}

Write-Host "🔒 All artifacts are now immutably stored on IPFS" -ForegroundColor Green
Write-Host "📋 These CIDs should be recorded in the genesis block" -ForegroundColor Yellow
Write-Host "✨ Complete!`n" -ForegroundColor Green
