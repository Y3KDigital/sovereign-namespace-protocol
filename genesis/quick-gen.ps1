# Simple 1000 Certificate Generator
$ARTIFACTS = "C:\Users\Kevan\web3 true web3 rarity\genesis\ARTIFACTS"
New-Item -Force -ItemType Directory -Path "$ARTIFACTS\certificates" | Out-Null

$genesis = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"
$time = Get-Date -Format 'o'
$all = @()

# Add a-z, 0-9
[char[]](97..122) | ForEach-Object { $all += "$_" }
0..9 | ForEach-Object { $all += "$_" }

# Add 100-999
100..999 | ForEach-Object { $all += "$_" }

Write-Host "Generating $($all.Count) certificates..."

$index = 0
foreach ($ns in $all) {
    $index++
    $cert = @{
        version = "1.0.0"
        namespace = $ns
        genesis_hash = $genesis
        genesis_index = $index
        generated_at = $time
    }
    $cert | ConvertTo-Json | Out-File -FilePath "$ARTIFACTS\certificates\$ns.json"
    if ($index % 100 -eq 0) { Write-Host "  $index..." }
}

# Create attestation
$attestation = @{
    genesis_hash = $genesis
    generated_at = $time
    total_namespaces = $all.Count
    ipfs_cid = "TO_BE_PUBLISHED"
}
$attestation | ConvertTo-Json | Out-File "$ARTIFACTS\genesis_attestation.json"

# Create manifest
$manifest = @{
    version = "1.0.0"
    genesis_hash = $genesis
    total_namespaces = $all.Count
    generated_at = $time
}
$manifest | ConvertTo-Json | Out-File "$ARTIFACTS\manifest.json"

Write-Host "Complete! Generated $($all.Count) certificates"
Write-Host "Location: $ARTIFACTS"
