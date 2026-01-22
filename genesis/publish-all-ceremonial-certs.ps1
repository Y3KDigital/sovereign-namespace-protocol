# Publish All Ceremonial Certificates to IPFS

$ErrorActionPreference = "Stop"

$PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZWFhZGJhOS03NTc1LTRiMzQtODM4ZC1lNWZiMTI1NmJiNzMiLCJlbWFpbCI6ImtldmFuQHh4eGlpaS5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkZjg3YjgyOGNhN2U3MDc3NWM3NSIsInNjb3BlZEtleVNlY3JldCI6IjQyM2NkMzg4NTdhZDM1OWM4ZGFlZjAxOTRhMDg5MDJjOWE3NGE0ZmZkYmY0YzNlYmJhZjg0MjY5YzRhZTVhNzUiLCJleHAiOjE4MDAxNjA1NDB9.gf0MgW_T-Ge7v7TgnWJ1xwnx0qUuUxRxyWnoSZMssVM"

$namespaces = @("brad.x", "donald.x", "77.x", "88.x", "222.x", "333.x")
$results = @()

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PUBLISH CEREMONIAL CERTIFICATES TO IPFS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($namespace in $namespaces) {
    $certPath = "genesis\SOVEREIGN_SUBNAMESPACES\$namespace.json"
    
    if (-not (Test-Path $certPath)) {
        Write-Host "[$namespace] Certificate not found, skipping..." -ForegroundColor Yellow
        continue
    }

    Write-Host "[$namespace] Publishing to IPFS..." -ForegroundColor Cyan
    
    try {
        $certificate = Get-Content $certPath -Raw
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"$namespace.json`"",
            "Content-Type: application/json$LF",
            $certificate,
            "--$boundary",
            "Content-Disposition: form-data; name=`"pinataMetadata`"",
            "Content-Type: application/json$LF",
            "{`"name`":`"$namespace Certificate`",`"keyvalues`":{`"namespace`":`"$namespace`",`"type`":`"genesis-cert`",`"timestamp`":`"$(Get-Date -Format 'yyyy-MM-dd')`"}}",
            "--$boundary--$LF"
        ) -join $LF
        
        $headers = @{
            "Authorization" = "Bearer $PINATA_JWT"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }
        
        $response = Invoke-RestMethod -Uri "https://api.pinata.cloud/pinning/pinFileToIPFS" `
            -Method Post `
            -Headers $headers `
            -Body ([System.Text.Encoding]::UTF8.GetBytes($bodyLines)) `
            -TimeoutSec 60
        
        $cid = $response.IpfsHash
        
        $results += [PSCustomObject]@{
            Namespace = $namespace
            CID = $cid
            CloudflareURL = "https://cloudflare-ipfs.com/ipfs/$cid"
            PinataURL = "https://gateway.pinata.cloud/ipfs/$cid"
            Status = "[OK] Published"
        }
        
        Write-Host "  [OK] $cid" -ForegroundColor Green
        
    } catch {
        Write-Host "  [X] Failed: $_" -ForegroundColor Red
        $results += [PSCustomObject]@{
            Namespace = $namespace
            CID = "ERROR"
            Status = "[X] Failed"
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PUBLICATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize

Write-Host "`nSaving results to IPFS_CERTIFICATES.txt..." -ForegroundColor Yellow
$output = @"
Y3K Ceremonial Certificates - IPFS Publication Record
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC")

"@

foreach ($result in $results) {
    if ($result.CID -ne "ERROR") {
        $output += @"

========================================
$($result.Namespace)
========================================
CID: $($result.CID)

Verify at:
- $($result.CloudflareURL)
- $($result.PinataURL)

"@
    }
}

$output | Out-File "genesis\IPFS_CERTIFICATES.txt" -Encoding UTF8
Write-Host "[OK] Saved to genesis\IPFS_CERTIFICATES.txt" -ForegroundColor Green

Write-Host "`nReady to send to users!" -ForegroundColor Cyan
