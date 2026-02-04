#!/bin/bash
# Change Impact Analysis Tool
# Identifies which automated tests are affected by code changes
#
# Usage: ./scripts/analyze-change-impact.sh [git-branch-range]
# Example: ./scripts/analyze-change-impact.sh main..feature-branch
# Default: ./scripts/analyze-change-impact.sh (uses main..HEAD)

set -e

BRANCH_RANGE="${1:-main..HEAD}"
MATRIX_FILE="docs/test-cases/test-impact-matrix.md"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHANGE IMPACT ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Analyzing: ${BRANCH_RANGE}"
echo "📄 Using matrix: ${MATRIX_FILE}"
echo ""

# Check if matrix file exists
if [ ! -f "$MATRIX_FILE" ]; then
  echo -e "${RED}❌ Error: Test impact matrix not found at ${MATRIX_FILE}${NC}"
  echo "   Run: touch ${MATRIX_FILE}"
  exit 1
fi

# Get changed files
echo "📁 Detecting changed files..."
CHANGED_FILES=$(git diff "$BRANCH_RANGE" --name-only 2>/dev/null | grep "web_app/src/app" || echo "")

if [ -z "$CHANGED_FILES" ]; then
  echo -e "${GREEN}✅ No web_app source files changed${NC}"
  echo "   No tests need to be run."
  exit 0
fi

echo -e "${BLUE}Found $(echo "$CHANGED_FILES" | wc -l) changed file(s):${NC}"
echo "$CHANGED_FILES" | sed 's/^/  • /'
echo ""

# Analyze each changed file
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 AFFECTED TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_TESTS=0
CRITICAL_FILES=0
HIGH_FILES=0
MEDIUM_FILES=0

for FILE in $CHANGED_FILES; do
  FILENAME=$(basename "$FILE")
  
  echo -e "${YELLOW}📄 Changed: ${FILE}${NC}"
  
  # Search matrix for this file
  MATCHES=$(grep -A 10 "$FILENAME" "$MATRIX_FILE" | grep -E "TC-[0-9]{3}" || echo "")
  
  if [ -z "$MATCHES" ]; then
    echo -e "   ${GREEN}✓ No tests affected${NC}"
  else
    # Count test IDs found
    TEST_COUNT=$(echo "$MATCHES" | grep -o "TC-[0-9]\{3\}" | wc -l)
    TOTAL_TESTS=$((TOTAL_TESTS + TEST_COUNT))
    
    # Get risk level
    RISK=$(grep -A 15 "$FILENAME" "$MATRIX_FILE" | grep "Change Risk:" | head -1 || echo "")
    
    if echo "$RISK" | grep -q "Critical"; then
      CRITICAL_FILES=$((CRITICAL_FILES + 1))
      echo -e "   ${RED}🔴 CRITICAL RISK${NC} - Affects core component"
    elif echo "$RISK" | grep -q "High"; then
      HIGH_FILES=$((HIGH_FILES + 1))
      echo -e "   ${RED}🔴 HIGH RISK${NC} - ${TEST_COUNT} test(s) affected"
    elif echo "$RISK" | grep -q "Medium"; then
      MEDIUM_FILES=$((MEDIUM_FILES + 1))
      echo -e "   ${YELLOW}🟡 MEDIUM RISK${NC} - ${TEST_COUNT} test(s) affected"
    fi
    
    # List affected test IDs
    echo "$MATCHES" | grep -o "[A-Z0-9]\+-[A-Z0-9]\+-TC-[0-9]\{3\}" | sort -u | sed 's/^/     • /'
  fi
  
  echo ""
done

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 IMPACT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Total Changed Files: $(echo "$CHANGED_FILES" | wc -l)"
echo "   Total Tests Affected: ${TOTAL_TESTS}"
echo ""
echo "   Risk Breakdown:"
echo "     🔴 Critical: ${CRITICAL_FILES} file(s)"
echo "     🔴 High: ${HIGH_FILES} file(s)"
echo "     🟡 Medium: ${MEDIUM_FILES} file(s)"
echo ""

# Recommendations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $CRITICAL_FILES -gt 0 ]; then
  echo -e "${RED}⚠️  CRITICAL CHANGES DETECTED${NC}"
  echo "   Run full regression suite:"
  echo "   $ npm run test:regression"
  echo ""
elif [ $HIGH_FILES -gt 0 ]; then
  echo -e "${YELLOW}⚠️  HIGH IMPACT CHANGES${NC}"
  echo "   Run all affected module tests:"
  
  # Extract unique modules from test IDs
  MODULES=$(echo "$CHANGED_FILES" | while read FILE; do
    FILENAME=$(basename "$FILE")
    grep -A 10 "$FILENAME" "$MATRIX_FILE" | grep -o "[A-Z0-9]\+-[A-Z0-9]\+-TC" | cut -d'-' -f1 | sort -u
  done | sort -u)
  
  if [ -n "$MODULES" ]; then
    for MODULE in $MODULES; do
      MODULE_LOWER=$(echo "$MODULE" | tr '[:upper:]' '[:lower:]')
      echo "   $ npm run test:dev -- e2e/features/${MODULE_LOWER}/"
    done
  fi
  echo ""
elif [ $MEDIUM_FILES -gt 0 ]; then
  echo -e "${GREEN}ℹ️  MEDIUM IMPACT CHANGES${NC}"
  echo "   Run affected tests only (see list above)"
  echo ""
else
  echo -e "${GREEN}✅ LOW IMPACT${NC}"
  echo "   No test execution required, but verify manually"
  echo ""
fi

# Additional tips
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Review affected tests and update if needed"
echo "2. Run recommended test suite"
echo "3. Update test-impact-matrix.md with new mappings"
echo "4. Document changes in IMPL-### document"
echo ""

exit 0
