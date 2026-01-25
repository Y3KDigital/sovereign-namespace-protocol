#!/bin/bash
# Quick Security Check Script
# Run this anytime you have concerns about repository security

echo "=========================================="
echo "  Repository Security Quick Check"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "1. Checking Git Configuration..."
echo "   Remote Repository:"
git remote -v | head -2
echo ""

echo "2. Checking Git Authors (Last 10 commits)..."
git log --all --format="%an <%ae>" -10 | sort | uniq
echo ""

echo "3. Checking for Unauthorized Commits..."
UNKNOWN_AUTHORS=$(git log --all --format="%an" | sort | uniq | grep -v "Y3K Digital" | grep -v "copilot-swe-agent" | grep -v "dependabot" | grep -v "github-actions")
if [ -z "$UNKNOWN_AUTHORS" ]; then
    print_status 0 "No unauthorized authors found"
else
    print_status 1 "WARNING: Unknown authors detected!"
    echo "$UNKNOWN_AUTHORS"
fi
echo ""

echo "4. Checking Current Branch..."
CURRENT_BRANCH=$(git branch --show-current)
echo "   Current: $CURRENT_BRANCH"
echo ""

echo "5. Checking Working Directory Status..."
if git diff-index --quiet HEAD -- 2>/dev/null; then
    print_status 0 "Working directory is clean"
else
    print_warning "Uncommitted changes detected (this may be normal if you're working)"
    git status --short | head -5
fi
echo ""

echo "6. Checking for Suspicious Files..."
SUSPICIOUS=$(find . -name "*.suspicious" -o -name "*backdoor*" -o -name "*malware*" -o -name "*.hack" 2>/dev/null | grep -v ".git")
if [ -z "$SUSPICIOUS" ]; then
    print_status 0 "No obviously suspicious files found"
else
    print_status 1 "WARNING: Suspicious filenames detected!"
    echo "$SUSPICIOUS"
fi
echo ""

echo "7. Checking for Recent File Modifications (Last 24 hours)..."
RECENT_FILES=$(find . -type f -mtime -1 ! -path "./.git/*" ! -path "./target/*" ! -path "*/node_modules/*" 2>/dev/null | wc -l)
echo "   Files modified: $RECENT_FILES"
if [ $RECENT_FILES -gt 100 ]; then
    print_warning "Large number of recent modifications (may be normal during development)"
fi
echo ""

echo "8. Checking Rust Dependencies..."
if [ -f "Cargo.toml" ]; then
    print_status 0 "Cargo.toml exists"
    if command -v cargo-audit &> /dev/null; then
        echo "   Running cargo audit..."
        cargo audit 2>&1 | grep -E "error|warning|Vulnerability" || echo "   No known vulnerabilities"
    else
        print_warning "cargo-audit not installed (run: cargo install cargo-audit)"
    fi
else
    print_warning "No Cargo.toml found"
fi
echo ""

echo "9. Checking for Suspicious Environment Variables..."
SUSPICIOUS_ENV=$(env | grep -i "malware\|hack\|backdoor\|suspicious" || true)
if [ -z "$SUSPICIOUS_ENV" ]; then
    print_status 0 "No suspicious environment variables"
else
    print_status 1 "WARNING: Suspicious environment variables!"
    echo "$SUSPICIOUS_ENV"
fi
echo ""

echo "10. Checking Running Processes..."
SUSPICIOUS_PROC=$(ps aux | grep -iE "malware|backdoor|keylog|rootkit" | grep -v grep || true)
if [ -z "$SUSPICIOUS_PROC" ]; then
    print_status 0 "No obviously suspicious processes"
else
    print_status 1 "WARNING: Suspicious processes detected!"
    echo "$SUSPICIOUS_PROC"
fi
echo ""

echo "=========================================="
echo "  Security Check Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Repository: $(basename $(git rev-parse --show-toplevel))"
echo "  - Current User: $(whoami)"
echo "  - Check Date: $(date)"
echo ""
echo "If you see any warnings or failures above, review them carefully."
echo "For detailed security audit, see: SECURITY_AUDIT_CODESPACE_2026-01-25.md"
echo "For troubleshooting help, see: CODESPACE_TROUBLESHOOTING.md"
echo ""
