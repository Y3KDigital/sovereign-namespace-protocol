#!/bin/bash
# SNP Security Audit Script (Linux/Mac version)

echo ""
echo "🔍 SNP Security Audit"
echo "═══════════════════════════════════════"
echo ""

audit_passed=true

# Check 1: Secret key files exist and are secured
echo "[1] Checking for secret key files..."
secret_files=$(find . -name "*seckey*.json" -o -name "*-sk.json" 2>/dev/null)

if [ -n "$secret_files" ]; then
    echo "  ⚠️  Found secret key file(s):"
    
    while IFS= read -r file; do
        echo "    📄 $file"
        
        # Check permissions (should be 600 or 400)
        perms=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%A" "$file" 2>/dev/null)
        
        if [ "$perms" != "600" ] && [ "$perms" != "400" ]; then
            echo "      ❌ INSECURE: Permissions are $perms (should be 600)"
            echo "      Fix with: chmod 600 $file"
            audit_passed=false
        else
            echo "      ✅ Permissions OK ($perms)"
        fi
    done <<< "$secret_files"
else
    echo "  ℹ️  No secret key files found"
fi

# Check 2: .gitignore includes secret files
echo ""
echo "[2] Checking .gitignore for secret protection..."

if [ -f .gitignore ]; then
    required_patterns=("*seckey*.json" "*-sk.json" "*.key" ".env")
    missing=()
    
    for pattern in "${required_patterns[@]}"; do
        if ! grep -q "$pattern" .gitignore; then
            missing+=("$pattern")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        echo "  ⚠️  .gitignore missing patterns:"
        for pattern in "${missing[@]}"; do
            echo "    - $pattern"
        done
        audit_passed=false
    else
        echo "  ✅ .gitignore includes secret file patterns"
    fi
else
    echo "  ⚠️  No .gitignore found!"
    audit_passed=false
fi

# Check 3: No secrets in git history
echo ""
echo "[3] Checking git history for leaked secrets..."

if [ -d .git ]; then
    secret_patterns=("seckey" "secret.*key" "private.*key" "BEGIN.*PRIVATE")
    leaks=()
    
    for pattern in "${secret_patterns[@]}"; do
        result=$(git log --all -p -S "$pattern" --oneline 2>/dev/null)
        if [ -n "$result" ]; then
            leaks+=("$pattern")
        fi
    done
    
    if [ ${#leaks[@]} -gt 0 ]; then
        echo "  ❌ CRITICAL: Potential secrets found in git history!"
        echo "  Patterns matched: ${leaks[*]}"
        echo "  WARNING: You may need to rewrite git history or rotate keys!"
        audit_passed=false
    else
        echo "  ✅ No obvious secrets in git history"
    fi
else
    echo "  ℹ️  Not a git repository"
fi

# Check 4: Verify offline operation
echo ""
echo "[4] Verifying offline operation capability..."

if [ -f ./target/release/snp ]; then
    echo "  ✅ SNP CLI binary found"
    echo "  ℹ️  All operations should work offline (no network required)"
else
    echo "  ⚠️  SNP CLI not built yet. Run: cargo build --release -p snp-cli"
fi

# Check 5: Filesystem encryption
echo ""
echo "[5] Checking filesystem encryption..."

# Check for common encrypted filesystem indicators
if [ -d "/dev/mapper" ]; then
    if ls /dev/mapper/luks-* >/dev/null 2>&1; then
        echo "  ✅ LUKS encrypted volume detected"
    else
        echo "  ℹ️  Unable to detect LUKS encryption"
    fi
elif [ "$(uname)" == "Darwin" ]; then
    # Check FileVault on macOS
    if fdesetup status | grep -q "FileVault is On"; then
        echo "  ✅ FileVault enabled"
    else
        echo "  ⚠️  FileVault NOT enabled"
        echo "  Recommendation: Enable FileVault for at-rest encryption"
        audit_passed=false
    fi
else
    echo "  ℹ️  Unable to check filesystem encryption"
    echo "  Recommendation: Use LUKS, FileVault, or equivalent"
fi

# Check 6: Test artifacts cleanup
echo ""
echo "[6] Checking for test artifacts..."

test_files=$(find . -maxdepth 1 -name "test-*.json" 2>/dev/null)

if [ -n "$test_files" ]; then
    echo "  ⚠️  Found test artifact(s):"
    echo "$test_files" | while read -r file; do
        echo "    📄 $(basename $file)"
    done
    echo "  Recommendation: Remove with: rm test-*.json"
else
    echo "  ✅ No test artifacts found"
fi

# Check 7: Cargo.lock for dependency audit
echo ""
echo "[7] Checking dependencies..."

if [ -f Cargo.lock ]; then
    echo "  ✅ Cargo.lock found (dependencies locked)"
    echo "  ℹ️  Run 'cargo audit' to check for vulnerabilities"
else
    echo "  ⚠️  No Cargo.lock found"
fi

# Final Summary
echo ""
echo "═══════════════════════════════════════"
echo "AUDIT SUMMARY"
echo "═══════════════════════════════════════"
echo ""

if [ "$audit_passed" = true ]; then
    echo "✅ Security audit PASSED"
    echo "Your SNP installation appears secure."
else
    echo "⚠️  Security audit found issues"
    echo "Please address the warnings above."
fi

echo ""
echo "📚 For complete security guidelines, see: SECURITY.md"
echo ""
echo "🔐 KEY SECURITY REMINDERS:"
echo "  1. All key generation happens on YOUR machine (local-only)"
echo "  2. Secret keys stored as JSON files - YOU control them"
echo "  3. Use high-entropy seeds (256+ bits)"
echo "  4. Set restrictive file permissions (chmod 600)"
echo "  5. Backup seeds to encrypted password manager"
echo "  6. All verification works OFFLINE (no network needed)"
echo "  7. Never commit secret keys to git"
echo "  8. Rotate keys if compromise suspected"
echo ""
