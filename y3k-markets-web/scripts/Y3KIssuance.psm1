# Y3K Namespace Issuance - PowerShell Authorization Module
# CRITICAL: This is the ONLY path to mainnet token issuance
# Human gate: Requires explicit "YES" confirmation

# Module-level configuration - DIGITAL GIANT PRIVATE L1
$Script:IssuanceScriptPath = Join-Path $PSScriptRoot "namespace-issuance-dg.js"
$Script:GenesisArtifacts = Join-Path (Split-Path $PSScriptRoot -Parent) "..\genesis\ARTIFACTS"

function Get-DerivedAssetCode {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Namespace
    )
    
    $name = $Namespace.Replace('.x', '')
    
    # Numbers get N prefix
    if ($name -match '^\d+$') {
        return "N$name"
    }
    
    # Letters become uppercase
    return $name.ToUpper()
}

function Approve-Namespace {
    <#
    .SYNOPSIS
    Authorizes mainnet token issuance for a namespace (HUMAN GATE)
    
    .DESCRIPTION
    This is the ONLY path to token issuance. Requires explicit human confirmation.
    
    .PARAMETER Namespace
    The namespace to approve (e.g., brad.x, 333.x)
    
    .PARAMETER Supply
    Token supply to issue
    
    .PARAMETER IssuerSecret
    Stellar issuer account secret key
    
    .PARAMETER DistributorPublicKey
    Stellar distributor account public key
    
    .EXAMPLE
    Approve-Namespace -Namespace "brad.x" -Supply 1000 -IssuerSecret "S..." -DistributorPublicKey "G..."
    #>
    
    [CmdletBinding(SupportsShouldProcess=$true, ConfirmImpact='High')]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Namespace,
        
        [Parameter(Mandatory=$true)]
        [ValidateRange(1, 1000000000)]
        [int]$Supply,
        
        [Parameter(Mandatory=$true)]
        [string]$IssuerSecret,
        
        [Parameter(Mandatory=$true)]
        [string]$DistributorPublicKey,
        
        [Parameter(Mandatory=$false)]
        [string]$DistributorSecret
    )
    
    Write-Host ''
    Write-Host 'NAMESPACE APPROVAL - HUMAN AUTHORIZATION GATE' -ForegroundColor Magenta
    Write-Host ('=' * 60) -ForegroundColor DarkGray
    Write-Host ''
    
    # Derive asset code
    try {
        $assetCode = Get-DerivedAssetCode -Namespace $Namespace
        Write-Host "Asset Code: $assetCode (derived from $Namespace)" -ForegroundColor Green
    }
    catch {
        Write-Host "Invalid namespace: $_" -ForegroundColor Red
        return
    }
    
    # Load genesis certificate (check both locations)
    $certPath = Join-Path $Script:GenesisArtifacts "certificates\$($Namespace.Replace('.x', '')).json"
    $sovereignPath = Join-Path (Split-Path $Script:GenesisArtifacts -Parent) "SOVEREIGN_SUBNAMESPACES\$Namespace.json"
    
    if (Test-Path $certPath) {
        $cert = Get-Content $certPath | ConvertFrom-Json
        Write-Host 'Genesis Certificate: Verified (numeric namespace)' -ForegroundColor Green
    }
    elseif (Test-Path $sovereignPath) {
        $cert = Get-Content $sovereignPath | ConvertFrom-Json
        Write-Host 'Genesis Certificate: Verified (F&F sovereign namespace)' -ForegroundColor Green
    }
    else {
        Write-Host "Genesis certificate not found: $Namespace" -ForegroundColor Red
        Write-Host "  Checked: $certPath" -ForegroundColor DarkGray
        Write-Host "  Checked: $sovereignPath" -ForegroundColor DarkGray
        return
    }
    
    Write-Host ''
    # Display issuance summary
    Write-Host 'ISSUANCE SUMMARY' -ForegroundColor Cyan
    Write-Host ('=' * 60) -ForegroundColor DarkGray
    Write-Host "  Namespace:     $Namespace" -ForegroundColor White
    Write-Host "  Asset Code:    $assetCode" -ForegroundColor White
    Write-Host "  Supply:        $Supply tokens" -ForegroundColor White
    Write-Host '  Network:       STELLAR MAINNET' -ForegroundColor Yellow
    Write-Host "  Genesis Hash:  $($cert.genesis_hash)" -ForegroundColor DarkGray
    Write-Host ('=' * 60) -ForegroundColor DarkGray
    Write-Host ''
    
    # HUMAN GATE (non-bypassable)
    Write-Host 'WARNING: This will mint tokens on MAINNET (irreversible)' -ForegroundColor Yellow
    Write-Host ''
    $confirmation = Read-Host 'Type YES to authorize (anything else cancels)'
    
    if ($confirmation -ne 'YES') {
        Write-Host ''
        Write-Host 'Issuance cancelled - YES confirmation not received' -ForegroundColor Red
        Write-Host ''
        return
    }
    
    Write-Host ''
    Write-Host 'Authorization received. Proceeding with issuance...' -ForegroundColor Green
    Write-Host ''
    
    # Execute issuance
    Write-Host 'EXECUTING MAINNET ISSUANCE...' -ForegroundColor Magenta
    Write-Host ('=' * 60) -ForegroundColor DarkGray
    Write-Host ''
    
    try {
        # Call Node.js issuance script
        $nodeArgs = @(
            $Script:IssuanceScriptPath,
            "--namespace", $Namespace,
            "--asset-code", $assetCode,
            "--supply", $Supply,
            "--issuer-secret", $IssuerSecret,
            "--distributor", $DistributorPublicKey
        )
        
        if ($DistributorSecret) {
            $nodeArgs += "--distributor-secret", $DistributorSecret
        }
        
        # Capture all output, parse last line as JSON
        $allOutput = node @nodeArgs 2>&1
        $jsonLine = ($allOutput | Select-Object -Last 1) -as [string]
        
        # Display all console output except JSON line
        $allOutput | Select-Object -SkipLast 1 | ForEach-Object { Write-Host $_ }
        
        $resultJson = $jsonLine | ConvertFrom-Json
        
        if ($LASTEXITCODE -ne 0 -or -not $resultJson.success) {
            Write-Host ''
            Write-Host 'Issuance failed' -ForegroundColor Red
            Write-Host "  Error: $($resultJson.error)" -ForegroundColor Yellow
            Write-Host ''
            return
        }
        
        Write-Host ''
        Write-Host 'ISSUANCE COMPLETE' -ForegroundColor Green
        Write-Host ('=' * 60) -ForegroundColor DarkGray
        Write-Host ''
        
        # Display transaction details
        Write-Host 'Transaction Hash:' -ForegroundColor Cyan
        Write-Host "  $($resultJson.txHash)" -ForegroundColor White
        Write-Host ''
        Write-Host "Execution error: $_" -ForegroundColor Red
        Write-Host '  Issuance aborted' -ForegroundColor Yellow
        Write-Host ''
        Write-Host 'Stellar Expert:' -ForegroundColor Cyan
        Write-Host "  $($resultJson.stellarExpertUrl)" -ForegroundColor White
        Write-Host ''
        
        Write-Host "Token $assetCode now exists on Stellar mainnet" -ForegroundColor Green
        Write-Host "Economic loop closed for namespace: $Namespace" -ForegroundColor Green
        Write-Host ''
        
        return $resultJson
    }
    catch {
        Write-Host "❌ Execution error: $_" -ForegroundColor Red
        Write-Host "   Issuance aborted`n" -ForegroundColor Yellow
        return
    }
}

# Export public functions
Export-ModuleMember -Function @(
    'Get-DerivedAssetCode',
    'Approve-Namespace'
)
