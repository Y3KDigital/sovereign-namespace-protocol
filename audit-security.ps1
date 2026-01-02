# SNP Security Audit Script
# Run this to verify your local security posture

Write-Host "`n🔍 SNP Security Audit" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

$auditPassed = $true

# Check 1: Secret key files exist and are secured
Write-Host "[1] Checking for secret key files..." -ForegroundColor Yellow
$secretFiles = Get-ChildItem -Path . -Filter "*seckey*.json" -Recurse -ErrorAction SilentlyContinue

if ($secretFiles.Count -gt 0) {
    Write-Host "  ⚠️  Found $($secretFiles.Count) secret key file(s):" -ForegroundColor Yellow
    
    foreach ($file in $secretFiles) {
        Write-Host "    📄 $($file.FullName)" -ForegroundColor White
        
        # Check permissions (Windows)
        $acl = Get-Acl $file.FullName
        $owner = $acl.Owner
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        
        if ($owner -ne $currentUser) {
            Write-Host "      ⚠️  File owned by: $owner (not current user)" -ForegroundColor Yellow
        }
        
        # Check if file is readable by others
        $otherAccess = $acl.Access | Where-Object { 
            $_.IdentityReference -notlike "*$env:USERNAME*" -and 
            $_.FileSystemRights -match "Read"
        }
        
        if ($otherAccess) {
            Write-Host "      ❌ INSECURE: File has read access for other users!" -ForegroundColor Red
            Write-Host "      Fix with: icacls `"$($file.FullName)`" /inheritance:r /grant:r `"`$env:USERNAME:F`"" -ForegroundColor Yellow
            $auditPassed = $false
        } else {
            Write-Host "      ✅ Permissions OK (restricted access)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  ℹ️  No secret key files found (or they're properly excluded)" -ForegroundColor Gray
}

# Check 2: .gitignore includes secret files
Write-Host "`n[2] Checking .gitignore for secret protection..." -ForegroundColor Yellow

if (Test-Path .gitignore) {
    $gitignoreContent = Get-Content .gitignore -Raw
    
    $requiredPatterns = @(
        "*seckey*.json",
        "*-sk.json",
        "*.key",
        ".env"
    )
    
    $missing = @()
    foreach ($pattern in $requiredPatterns) {
        if ($gitignoreContent -notmatch [regex]::Escape($pattern)) {
            $missing += $pattern
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "  ⚠️  .gitignore missing patterns:" -ForegroundColor Yellow
        foreach ($pattern in $missing) {
            Write-Host "    - $pattern" -ForegroundColor Red
        }
        $auditPassed = $false
    } else {
        Write-Host "  ✅ .gitignore includes secret file patterns" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  No .gitignore found!" -ForegroundColor Red
    $auditPassed = $false
}

# Check 3: No secrets in git history
Write-Host "`n[3] Checking git history for leaked secrets..." -ForegroundColor Yellow

if (Test-Path .git) {
    $secretPatterns = @("seckey", "secret.*key", "private.*key", "BEGIN.*PRIVATE")
    $leaks = @()
    
    foreach ($pattern in $secretPatterns) {
        $result = git log --all -p -S $pattern --oneline 2>$null
        if ($result) {
            $leaks += $pattern
        }
    }
    
    if ($leaks.Count -gt 0) {
        Write-Host "  ❌ CRITICAL: Potential secrets found in git history!" -ForegroundColor Red
        Write-Host "  Patterns matched: $($leaks -join ', ')" -ForegroundColor Red
        Write-Host "  WARNING: You may need to rewrite git history or rotate keys!" -ForegroundColor Yellow
        $auditPassed = $false
    } else {
        Write-Host "  ✅ No obvious secrets in git history" -ForegroundColor Green
    }
} else {
    Write-Host "  ℹ️  Not a git repository" -ForegroundColor Gray
}

# Check 4: Verify offline operation
Write-Host "`n[4] Verifying offline operation capability..." -ForegroundColor Yellow

$snpPath = ".\target\release\snp.exe"
if (Test-Path $snpPath) {
    Write-Host "  ✅ SNP CLI binary found at $snpPath" -ForegroundColor Green
    Write-Host "  ℹ️  All operations should work offline (no network required)" -ForegroundColor Gray
} else {
    Write-Host "  ⚠️  SNP CLI not built yet. Run: cargo build --release -p snp-cli" -ForegroundColor Yellow
}

# Check 5: Filesystem encryption
Write-Host "`n[5] Checking filesystem encryption..." -ForegroundColor Yellow

# Check if BitLocker is enabled on current drive
$currentDrive = (Get-Location).Drive.Name + ":"
try {
    $bitlockerStatus = Get-BitLockerVolume -MountPoint $currentDrive -ErrorAction SilentlyContinue
    
    if ($bitlockerStatus -and $bitlockerStatus.ProtectionStatus -eq "On") {
        Write-Host "  ✅ BitLocker enabled on $currentDrive" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  BitLocker NOT enabled on $currentDrive" -ForegroundColor Yellow
        Write-Host "  Recommendation: Enable BitLocker for at-rest encryption" -ForegroundColor Gray
        $auditPassed = $false
    }
} catch {
    Write-Host "  ℹ️  Unable to check BitLocker status (may require admin privileges)" -ForegroundColor Gray
}

# Check 6: Test artifacts cleanup
Write-Host "`n[6] Checking for test artifacts..." -ForegroundColor Yellow

$testFiles = Get-ChildItem -Path . -Filter "test-*.json" -ErrorAction SilentlyContinue

if ($testFiles.Count -gt 0) {
    Write-Host "  ⚠️  Found $($testFiles.Count) test artifact(s):" -ForegroundColor Yellow
    foreach ($file in $testFiles) {
        Write-Host "    📄 $($file.Name)" -ForegroundColor White
    }
    Write-Host "  Recommendation: Remove with: Remove-Item test-*.json" -ForegroundColor Gray
} else {
    Write-Host "  ✅ No test artifacts found" -ForegroundColor Green
}

# Check 7: Cargo.lock for dependency audit
Write-Host "`n[7] Checking dependencies..." -ForegroundColor Yellow

if (Test-Path Cargo.lock) {
    Write-Host "  ✅ Cargo.lock found (dependencies locked)" -ForegroundColor Green
    Write-Host "  ℹ️  Run 'cargo audit' to check for vulnerabilities" -ForegroundColor Gray
} else {
    Write-Host "  ⚠️  No Cargo.lock found" -ForegroundColor Yellow
}

# Final Summary
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "AUDIT SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if ($auditPassed) {
    Write-Host "`n✅ Security audit PASSED" -ForegroundColor Green
    Write-Host "Your SNP installation appears secure.`n" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Security audit found issues" -ForegroundColor Yellow
    Write-Host "Please address the warnings above.`n" -ForegroundColor Yellow
}

Write-Host "📚 For complete security guidelines, see: SECURITY.md`n" -ForegroundColor Cyan

# Key Security Reminders
Write-Host "🔐 KEY SECURITY REMINDERS:" -ForegroundColor Cyan
Write-Host "  1. All key generation happens on YOUR machine (local-only)" -ForegroundColor White
Write-Host "  2. Secret keys stored as JSON files - YOU control them" -ForegroundColor White
Write-Host "  3. Use high-entropy seeds (256+ bits)" -ForegroundColor White
Write-Host "  4. Set restrictive file permissions (owner-only)" -ForegroundColor White
Write-Host "  5. Backup seeds to encrypted password manager" -ForegroundColor White
Write-Host "  6. All verification works OFFLINE (no network needed)" -ForegroundColor White
Write-Host "  7. Never commit secret keys to git" -ForegroundColor White
Write-Host "  8. Rotate keys if compromise suspected`n" -ForegroundColor White
