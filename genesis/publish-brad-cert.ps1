# Emergency: Publish Brad's Certificate to IPFS

$ErrorActionPreference = "Stop"

$PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZWFhZGJhOS03NTc1LTRiMzQtODM4ZC1lNWZiMTI1NmJiNzMiLCJlbWFpbCI6ImtldmFuQHh4eGlpaS5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkZjg3YjgyOGNhN2U3MDc3NWM3NSIsInNjb3BlZEtleVNlY3JldCI6IjQyM2NkMzg4NTdhZDM1OWM4ZGFlZjAxOTRhMDg5MDJjOWE3NGE0ZmZkYmY0YzNlYmJhZjg0MjY5YzRhZTVhNzUiLCJleHAiOjE4MDAxNjA1NDB9.gf0MgW_T-Ge7v7TgnWJ1xwnx0qUuUxRxyWnoSZMssVM"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PUBLISH BRAD'S CERTIFICATE TO IPFS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Load brad's certificate
$certPath = "genesis\SOVEREIGN_SUBNAMESPACES\brad.x.json"
if (-not (Test-Path $certPath)) {
    Write-Host "[ERROR] Brad's certificate not found at: $certPath" -ForegroundColor Red
    exit 1
}

$certificate = Get-Content $certPath -Raw
Write-Host "[1/3] Loaded certificate for brad.x" -ForegroundColor Green

# Upload to Pinata
Write-Host "[2/3] Uploading to Pinata IPFS..." -ForegroundColor Yellow

try {
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    # Build multipart form
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"brad.x.json`"",
        "Content-Type: application/json$LF",
        $certificate,
        "--$boundary",
        "Content-Disposition: form-data; name=`"pinataMetadata`"",
        "Content-Type: application/json$LF",
        '{"name":"brad.x Certificate","keyvalues":{"namespace":"brad.x","type":"genesis-cert","timestamp":"' + (Get-Date -Format "yyyy-MM-dd") + '"}}',
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
    
    Write-Host "[3/3] SUCCESS!" -ForegroundColor Green
    Write-Host "`nBrad's Certificate IPFS CID:" -ForegroundColor Cyan
    Write-Host "  $cid" -ForegroundColor Yellow
    Write-Host "`nVerify at:" -ForegroundColor Cyan
    Write-Host "  https://gateway.pinata.cloud/ipfs/$cid" -ForegroundColor Blue
    Write-Host "  https://cloudflare-ipfs.com/ipfs/$cid" -ForegroundColor Blue
    Write-Host "`nSend this to Brad!" -ForegroundColor Green
    
}
catch {
    Write-Host "[ERROR] Upload failed: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Gray
    exit 1
}
