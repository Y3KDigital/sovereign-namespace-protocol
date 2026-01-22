#!/usr/bin/env pwsh
# Pinata Emergency Upload Script
# Uploads genesis ARTIFACTS to Pinata for reliable IPFS hosting

$ErrorActionPreference = "Stop"

$PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZWFhZGJhOS03NTc1LTRiMzQtODM4ZC1lNWZiMTI1NmJiNzMiLCJlbWFpbCI6ImtldmFuQHh4eGlpaS5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkZjg3YjgyOGNhN2U3MDc3NWM3NSIsInNjb3BlZEtleVNlY3JldCI6IjQyM2NkMzg4NTdhZDM1OWM4ZGFlZjAxOTRhMDg5MDJjOWE3NGE0ZmZkYmY0YzNlYmJhZjg0MjY5YzRhZTVhNzUiLCJleHAiOjE4MDAxNjA1NDB9.gf0MgW_T-Ge7v7TgnWJ1xwnx0qUuUxRxyWnoSZMssVM"
$ARTIFACTS_PATH = "c:\Users\Kevan\web3 true web3 rarity\genesis\ARTIFACTS"
$EXPECTED_CID = "bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "EMERGENCY: PINATA GENESIS UPLOAD" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if ARTIFACTS directory exists
if (-not (Test-Path $ARTIFACTS_PATH)) {
    Write-Host "[ERROR] ARTIFACTS directory not found at: $ARTIFACTS_PATH" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Counting files to upload..." -ForegroundColor Yellow
$files = Get-ChildItem -Path $ARTIFACTS_PATH -Recurse -File
$totalFiles = $files.Count
Write-Host "  Found $totalFiles files" -ForegroundColor Cyan

Write-Host "`n[2/5] Creating temporary archive..." -ForegroundColor Yellow
$tempZip = "$env:TEMP\y3k-genesis-artifacts.zip"
if (Test-Path $tempZip) {
    Remove-Item $tempZip -Force
}

try {
    Compress-Archive -Path "$ARTIFACTS_PATH\*" -DestinationPath $tempZip -Force
    $zipSize = [math]::Round((Get-Item $tempZip).Length / 1MB, 2)
    Write-Host "  Created archive: $zipSize MB" -ForegroundColor Cyan
}
catch {
    Write-Host "[ERROR] Failed to create archive: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n[3/5] Uploading to Pinata..." -ForegroundColor Yellow
Write-Host "  This may take 2-5 minutes..." -ForegroundColor Gray

try {
    # Prepare multipart form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    # Read zip file
    $fileBytes = [System.IO.File]::ReadAllBytes($tempZip)
    
    # Build multipart body
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"artifacts.zip`"",
        "Content-Type: application/zip$LF",
        [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes),
        "--$boundary",
        "Content-Disposition: form-data; name=`"pinataMetadata`"",
        "Content-Type: application/json$LF",
        '{"name":"Y3K Genesis Artifacts","keyvalues":{"project":"y3k-genesis","timestamp":"2026-01-16"}}',
        "--$boundary--$LF"
    ) -join $LF
    
    $headers = @{
        "Authorization" = "Bearer $PINATA_JWT"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $response = Invoke-RestMethod -Uri "https://api.pinata.cloud/pinning/pinFileToIPFS" `
        -Method Post `
        -Headers $headers `
        -Body ([System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($bodyLines)) `
        -TimeoutSec 300
    
    $uploadedCID = $response.IpfsHash
    
    Write-Host "  [SUCCESS] Upload complete!" -ForegroundColor Green
    Write-Host "  Pinata CID: $uploadedCID" -ForegroundColor Cyan
    
    # Verify CID matches
    Write-Host "`n[4/5] Verifying CID..." -ForegroundColor Yellow
    if ($uploadedCID -eq $EXPECTED_CID) {
        Write-Host "  [OK] CID matches genesis CID!" -ForegroundColor Green
    }
    else {
        Write-Host "  [WARNING] CID mismatch!" -ForegroundColor Red
        Write-Host "    Expected: $EXPECTED_CID" -ForegroundColor Yellow
        Write-Host "    Got:      $uploadedCID" -ForegroundColor Yellow
        Write-Host "  This may be due to archive format. Testing gateway..." -ForegroundColor Gray
    }
    
    # Test Pinata gateway
    Write-Host "`n[5/5] Testing Pinata gateway..." -ForegroundColor Yellow
    $gatewayUrl = "https://gateway.pinata.cloud/ipfs/$uploadedCID"
    
    try {
        $testResponse = Invoke-WebRequest -Uri $gatewayUrl -TimeoutSec 10 -UseBasicParsing
        if ($testResponse.StatusCode -eq 200) {
            Write-Host "  [OK] Gateway responding!" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  [WARNING] Gateway test failed: $_" -ForegroundColor Yellow
    }
    
    # Cleanup
    Remove-Item $tempZip -Force
    
    # Summary
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "PINATA UPLOAD COMPLETE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    Write-Host "`nPinata Gateway URLs:" -ForegroundColor Cyan
    Write-Host "  Directory: https://gateway.pinata.cloud/ipfs/$uploadedCID" -ForegroundColor White
    Write-Host "  Attestation: https://gateway.pinata.cloud/ipfs/$uploadedCID/genesis_attestation.json" -ForegroundColor White
    Write-Host "  Manifest: https://gateway.pinata.cloud/ipfs/$uploadedCID/manifest.json" -ForegroundColor White
    
    if ($uploadedCID -ne $EXPECTED_CID) {
        Write-Host "`n[ACTION REQUIRED] CID changed - need to update website links" -ForegroundColor Yellow
        Write-Host "  Old CID: $EXPECTED_CID" -ForegroundColor Gray
        Write-Host "  New CID: $uploadedCID" -ForegroundColor Gray
    }
    else {
        Write-Host "`n[OK] CID unchanged - no website updates needed" -ForegroundColor Green
    }
    
    Write-Host ""
}
catch {
    Write-Host "[ERROR] Upload failed: $_" -ForegroundColor Red
    Write-Host "`nError details: $($_.Exception.Message)" -ForegroundColor Gray
    
    if (Test-Path $tempZip) {
        Remove-Item $tempZip -Force
    }
    
    exit 1
}
