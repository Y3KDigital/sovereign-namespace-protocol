# FRIENDS & FAMILY EMAIL DISTRIBUTION
# Sends activation emails to 100 recipients

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Y3K GENESIS - FRIENDS & FAMILY LAUNCH" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Configuration
$CODES_FILE = "FF-CODES-2026-01-16.txt"
$PORTAL_URL = "https://y3kmarkets.com/friends-family"
$GENESIS_HASH = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"
$IPFS_CID = "bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e"
$EXPIRATION = "January 17, 2026 at 8:00 PM EST"

# Read codes
if (-not (Test-Path $CODES_FILE)) {
    Write-Host "❌ ERROR: Codes file not found: $CODES_FILE" -ForegroundColor Red
    exit 1
}

$codes = Get-Content $CODES_FILE | Where-Object { $_ -match '^GENESIS-' }
Write-Host "`n✅ Loaded $($codes.Count) access codes" -ForegroundColor Green

# Email template
function Get-EmailBody {
    param($code)
    
    return @"
Subject: Genesis Complete - Your Y3K Early Access is Live

Genesis is complete. 955 roots are now available for claiming.

Your access code: $code
Portal: $PORTAL_URL
Expires: $EXPIRATION (24 hours)

What you get:
- 24-hour early access to claim your genesis root before public launch
- Genesis Founder badge on your certificate
- First choice of unclaimed roots (900 available)
- Activate your post-quantum cryptographic ownership certificate

Genesis verification:
Hash: $GENESIS_HASH
IPFS: https://ipfs.io/ipfs/$IPFS_CID

You can independently verify the ceremony artifacts on IPFS. Every root is cryptographically unique and locked to this genesis hash.

What "claiming" means: In Y3K, claiming activates your ownership of a pre-existing genesis namespace. No new supply is created—all 955 roots were mathematically fixed at the genesis ceremony.

Questions? Reply to this email.

- Y3K Team
"@
}

# Check for recipient list
$RECIPIENTS_FILE = "ff-recipients.txt"
if (-not (Test-Path $RECIPIENTS_FILE)) {
    Write-Host "`n⚠️  No recipient list found: $RECIPIENTS_FILE" -ForegroundColor Yellow
    Write-Host "Creating template..." -ForegroundColor Yellow
    
    $template = @"
# FRIENDS & FAMILY RECIPIENTS
# Format: email@domain.com
# One email per line, 100 total

# Founder Tier (10)
founder1@example.com
founder2@example.com
founder3@example.com
founder4@example.com
founder5@example.com
founder6@example.com
founder7@example.com
founder8@example.com
founder9@example.com
founder10@example.com

# Early Supporters (90)
# Add 90 more email addresses here...

"@
    $template | Set-Content $RECIPIENTS_FILE
    
    Write-Host "`n📝 Created template: $RECIPIENTS_FILE" -ForegroundColor Green
    Write-Host "   Fill in email addresses and run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Read recipients
$recipients = Get-Content $RECIPIENTS_FILE | Where-Object { $_ -match '@' -and $_ -notmatch '^#' }

if ($recipients.Count -eq 0) {
    Write-Host "`n❌ ERROR: No email addresses found in $RECIPIENTS_FILE" -ForegroundColor Red
    exit 1
}

if ($recipients.Count -gt $codes.Count) {
    Write-Host "`n❌ ERROR: More recipients ($($recipients.Count)) than codes ($($codes.Count))" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Loaded $($recipients.Count) recipients" -ForegroundColor Green

# Confirmation
Write-Host "`n⚠️  READY TO SEND:" -ForegroundColor Yellow
Write-Host "   Recipients: $($recipients.Count)"
Write-Host "   Portal: $PORTAL_URL"
Write-Host "   Expiration: $EXPIRATION"
Write-Host ""

$confirm = Read-Host "Send activation emails now? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "`n❌ Cancelled by user" -ForegroundColor Red
    exit 0
}

# Email sending options
Write-Host "`n📧 EMAIL SENDING OPTIONS:" -ForegroundColor Cyan
Write-Host "   1) Use SendGrid API (requires SENDGRID_API_KEY env var)"
Write-Host "   2) Use Outlook/Office365 (requires credentials)"
Write-Host "   3) Generate .eml files for manual sending"
Write-Host "   4) Print to console (test mode)"
Write-Host ""

$method = Read-Host "Select method (1-4)"

switch ($method) {
    "1" {
        # SendGrid
        $apiKey = $env:SENDGRID_API_KEY
        if (-not $apiKey) {
            Write-Host "❌ ERROR: SENDGRID_API_KEY environment variable not set" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "`n📤 Sending via SendGrid..." -ForegroundColor Cyan
        
        $sent = 0
        for ($i = 0; $i -lt $recipients.Count; $i++) {
            $email = $recipients[$i]
            $code = $codes[$i]
            $body = Get-EmailBody -code $code
            
            try {
                $payload = @{
                    personalizations = @(@{
                        to = @(@{ email = $email })
                        subject = "Genesis Complete - Your Y3K Early Access is Live"
                    })
                    from = @{
                        email = "genesis@y3kmarkets.com"
                        name = "Y3K Team"
                    }
                    content = @(@{
                        type = "text/plain"
                        value = $body
                    })
                } | ConvertTo-Json -Depth 10
                
                $headers = @{
                    "Authorization" = "Bearer $apiKey"
                    "Content-Type" = "application/json"
                }
                
                Invoke-RestMethod -Uri "https://api.sendgrid.com/v3/mail/send" -Method Post -Headers $headers -Body $payload
                
                $sent++
                Write-Host "   ✅ Sent to $email (Code: $code)" -ForegroundColor Green
            }
            catch {
                Write-Host "   ❌ Failed: $email - $_" -ForegroundColor Red
            }
            
            Start-Sleep -Milliseconds 100
        }
        
        Write-Host "`n✅ Sent $sent of $($recipients.Count) emails" -ForegroundColor Green
    }
    
    "3" {
        # Generate .eml files
        Write-Host "`n📝 Generating .eml files..." -ForegroundColor Cyan
        
        $outputDir = "ff-emails"
        New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
        
        for ($i = 0; $i -lt $recipients.Count; $i++) {
            $email = $recipients[$i]
            $code = $codes[$i]
            $body = Get-EmailBody -code $code
            
            $eml = @"
From: genesis@y3kmarkets.com
To: $email
Subject: Genesis Complete - Your Y3K Early Access is Live
Content-Type: text/plain; charset=utf-8

$body
"@
            
            $filename = "$outputDir/ff-$($i+1)-$($email -replace '@.*', '').eml"
            $eml | Set-Content $filename -Encoding UTF8
        }
        
        Write-Host "✅ Generated $($recipients.Count) .eml files in $outputDir/" -ForegroundColor Green
        Write-Host "   Open each file and send via your email client" -ForegroundColor Yellow
    }
    
    "4" {
        # Test mode
        Write-Host "`n📋 TEST MODE - Printing emails to console..." -ForegroundColor Cyan
        Write-Host ""
        
        for ($i = 0; $i -lt [Math]::Min(3, $recipients.Count); $i++) {
            $email = $recipients[$i]
            $code = $codes[$i]
            $body = Get-EmailBody -code $code
            
            Write-Host "=" * 60 -ForegroundColor Gray
            Write-Host "TO: $email" -ForegroundColor White
            Write-Host "=" * 60 -ForegroundColor Gray
            Write-Host $body
            Write-Host ""
        }
        
        if ($recipients.Count -gt 3) {
            Write-Host "... and $($recipients.Count - 3) more emails" -ForegroundColor Gray
        }
    }
    
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n[SUCCESS] FRIENDS & FAMILY ACTIVATION COMPLETE" -ForegroundColor Green
Write-Host "`n📊 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Monitor portal: $PORTAL_URL"
Write-Host "   2. Watch for first mints in database"
Write-Host "   3. Check Stripe dashboard for payments"
Write-Host "   4. Public launch: January 17, 8:00 PM EST"
Write-Host ""
