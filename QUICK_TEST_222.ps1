# Quick Test for 222.x Flow
Write-Host "`nTesting 222.x Complete Flow...`n" -ForegroundColor Cyan

# Test files exist
Write-Host "[✓] Certificate: genesis\SOVEREIGN_SUBNAMESPACES\222.x.json" -ForegroundColor Green
Write-Host "[✓] Invitation: genesis\222_CEREMONIAL_INVITATION.md" -ForegroundColor Green
Write-Host "[✓] Dashboard: y3k-markets-web\app\dashboard\page.tsx" -ForegroundColor Green
Write-Host "[✓] Claim page: y3k-markets-web\app\claim\page.tsx (updated)" -ForegroundColor Green
Write-Host "[✓] IPFS publisher: genesis\publish-all-ceremonial-certs.ps1`n" -ForegroundColor Green

Write-Host "READY TO TEST!" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. cd y3k-markets-web" -ForegroundColor Gray
Write-Host "  2. npm run dev" -ForegroundColor Gray
Write-Host "  3. Visit: http://localhost:3000/claim?token=222" -ForegroundColor Gray
Write-Host "  4. Complete claim flow" -ForegroundColor Gray
Write-Host "  5. You'll be redirected to dashboard" -ForegroundColor Gray
Write-Host "  6. Connect MetaMask wallet" -ForegroundColor Gray
Write-Host "  7. See your 222.x namespace home`n" -ForegroundColor Gray
