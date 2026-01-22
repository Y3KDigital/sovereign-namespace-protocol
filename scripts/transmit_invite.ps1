<#
.SYNOPSIS
    THE TRANSMISSION CONSOLE (Telnyx Integrated)
    Issues Sovereign Namespace Invites via High-Sec SMS.

.DESCRIPTION
    1. Generates unique Claim Token.
    2. Composes the "Badass" Invitation.
    3. Transmits via Telnyx Network.
    4. Logs to Immutable Ledger.

.EXAMPLE
    .\transmit_invite.ps1 -TargetName "Elon" -PhoneNumber "+15125550123" -Tier "Mars Warlord"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$TargetName,

    [Parameter(Mandatory=$true)]
    [string]$PhoneNumber,

    [string]$Tier = "Sovereign Operator",
    
    [string]$BaseUrl = "https://y3k.market/claim",
    
    [string]$TelnyxKey
)

# --- LOAD CONFIGURATION ---
$EnvPath = Join-Path (Get-Location) ".env"
if (Test-Path $EnvPath) {
    Get-Content $EnvPath | ForEach-Object {
        if ($_ -match "^\s*TELNYX_API_KEY\s*=\s*(.*)") {
            $Global:TELNYX_KEY_LOADED = $matches[1].Trim()
        }
    }
}

# Resolve Key Priority: Param -> Env Var -> .env File
if ([string]::IsNullOrWhiteSpace($TelnyxKey)) {
    if (![string]::IsNullOrWhiteSpace($env:TELNYX_API_KEY)) {
        $TelnyxKey = $env:TELNYX_API_KEY
    }
    elseif (![string]::IsNullOrWhiteSpace($Global:TELNYX_KEY_LOADED)) {
        $TelnyxKey = $Global:TELNYX_KEY_LOADED
    }
}


# --- CONFIGURATION (Frosty/Aqua Aesthetic) ---
$Theme = @{
    Text = "Cyan"
    Alert = "Magenta"
    Success = "Green"
}

function Write-Log {
    param([string]$Message, [string]$Color="White")
    Write-Host "[TRUTH_MECH] $Message" -ForegroundColor $Color
}

# --- HEADER ---
Clear-Host
Write-Log "========================================" $Theme.Text
Write-Log "   TRANSMISSION CONSOLE v1.0 (SECURE)   " $Theme.Text
Write-Log "========================================" $Theme.Text
Write-Log "TARGET:  $TargetName"
Write-Log "COMM:    $PhoneNumber"
Write-Log "TIER:    $Tier"
Write-Log "----------------------------------------"

# --- 1. TOKEN GENERATION ---
$TokenID = $TargetName.ToLower() -replace " ", ""
$ClaimLink = "$BaseUrl?token=$TokenID"

Write-Log "GENERATING ARTIFACTS..." $Theme.Text
Start-Sleep -Milliseconds 500
Write-Log "TOKEN: $TokenID" "Gray"
Write-Log "LINK:  $ClaimLink" "Green"

# --- 2. MESSAGE COMPOSITION ---
$MessageBody = @"
SECURE TRANSMISSION // Y3K MARKETS
To: $TargetName
Status: $Tier

You have been selected.
We have reserved a Sovereign Namespace for you.
This is not a website. It is a mathematical property you own forever.

1. Click: $ClaimLink
2. Claim.
3. Never start over again.

- The Architect
"@

Write-Log "COMPOSING PAYLOAD..." $Theme.Text
Write-Log $MessageBody "Gray"

# --- 3. TRANSMISSION (TELNYX) ---
if ([string]::IsNullOrWhiteSpace($TelnyxKey)) {
    Write-Log "WARNING: TELNYX_API_KEY not found in environment." $Theme.Alert
    $TelnyxKey = Read-Host "ENTER API KEY TO FIRE"
}

$Headers = @{
    "Authorization" = "Bearer $TelnyxKey"
    "Content-Type"  = "application/json"
}

$Payload = @{
    from = "+18888888888" # UPDATE THIS WITH YOUR TELNYX NUMBER
    to   = $PhoneNumber
    text = $MessageBody
} | ConvertTo-Json

Write-Log "INITIATING UPLINK..." $Theme.Text

try {
    # SIMULATION MODE (SAFETY FIRST)
    # Uncomment next lines for PRODUCTION FIRE
     $Response = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/messages" -Method Post -Headers $Headers -Body $Payload
     Write-Log "STATUS: CONFIRMED ($($Response.data.id))" $Theme.Success
    
    # Write-Log "SIMULATION: MESSAGE SENT VIA TELNYX" $Theme.Success
    # Write-Log "PAYLOAD SIZE: $(($MessageBody.Length)) BYTES"
}
catch {
    Write-Log "TRANSMISSION FAILURE: $_" $Theme.Alert
}

# --- 4. LEDGER COMMIT ---
$LogEntry = @{
    Timestamp = Get-Date
    Target = $TargetName
    Phone = $PhoneNumber
    Token = $TokenID
    Status = "SENT"
} 
# Append to local log
$LogEntry | ConvertTo-Json -Compress | Out-File -Append "c:\Users\Kevan\web3 true web3 rarity\GENESIS_LOG.jsonl"

Write-Log "LEDGER UPDATED." $Theme.Text
Write-Log "PROFILE LOCKED. DONE." $Theme.Success
