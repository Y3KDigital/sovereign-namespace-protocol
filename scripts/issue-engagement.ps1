param(
    [string]$TargetName,
    [string]$Role = "Broker"
)

$BaseUrl = "http://127.0.0.1:3006/claim"
$Token = $TargetName.ToLower()
$Link = "$BaseUrl?token=$Token"
$QR_API = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=$Link"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   TRUTH MECHANISM :: ISSUING ENGAGEMENT PACKET" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "TARGET:   " -NoNewline; Write-Host $TargetName.ToUpper() -ForegroundColor White
Write-Host "ROLE:     " -NoNewline; Write-Host $Role.ToUpper() -ForegroundColor White
Write-Host "LINK:     " -NoNewline; Write-Host $Link -ForegroundColor Green
Write-Host ""
Write-Host "SCANABLE ARTIFACT:" -ForegroundColor Cyan
Write-Host "------------------" -ForegroundColor Gray
Write-Host "![QR CODE]($QR_API)" 
Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "1. Fwd this graphic to Target."
Write-Host "2. Target scans -> Selects Payout -> Signs."
Write-Host "3. System locks. Done forever."
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
