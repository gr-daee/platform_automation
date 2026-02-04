# Test Impact Matrix

**Purpose**: Maps automated tests to source code files for change impact analysis

**Last Updated**: YYYY-MM-DD

---

## Overview

This matrix enables:
1. **Change Impact Analysis**: Identify which tests to run when code changes
2. **Test Maintenance**: Find affected tests when components are updated
3. **Coverage Tracking**: Understand which source files have test coverage

---

## How to Use

### For Change Impact Analysis
```bash
# 1. Identify changed files
git diff main..HEAD --name-only | grep "web_app/src/app"

# 2. Search this matrix for changed files
grep "OrderForm.tsx" test-impact-matrix.md

# 3. Run affected tests
npm run test:dev -- e2e/features/o2c/orders.feature
```

### For Test Maintenance
```bash
# Component was refactored, find tests to update
grep "IndentForm.tsx" test-impact-matrix.md
```

---

## Matrix Format

Each entry maps:
- **Source File**: Web app source file path
- **Affected Tests**: Test IDs that interact with this file
- **Interaction Type**: How test uses this file (POM, Direct, API)
- **Last Verified**: When mapping was last confirmed accurate

---

## Auth Module

### `../web_app/src/app/auth/login/page.tsx`
**Affected Tests**:
- `AUTH-LOGIN-TC-001`: Login with valid credentials
  - **Interaction**: POM (`e2e/src/pages/auth/LoginPage.ts`)
  - **Locators Used**: `getByLabel('Email')`, `getByLabel('Password')`, `getByRole('button', { name: 'Sign In' })`
  - **Last Verified**: 2026-02-04

- `AUTH-LOGIN-TC-002`: Login with invalid credentials
  - **Interaction**: POM (`e2e/src/pages/auth/LoginPage.ts`)
  - **Last Verified**: 2026-02-04

- `AUTH-MFA-TC-001`: TOTP authentication
  - **Interaction**: POM (`e2e/src/pages/auth/LoginPage.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 3 tests affected

---

### `../web_app/src/app/auth/components/TOTPInput.tsx`
**Affected Tests**:
- `AUTH-MFA-TC-001`: TOTP authentication
  - **Interaction**: POM (`e2e/src/pages/auth/LoginPage.ts`)
  - **Locators Used**: `getByPlaceholder('Enter TOTP code')`
  - **Last Verified**: 2026-02-04

**Change Risk**: 🟡 Medium - 1 test affected

---

## O2C Module

### `../web_app/src/app/o2c/indents/page.tsx`
**Affected Tests**:
- `O2C-INDENT-TC-001`: Create indent with valid data
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Last Verified**: 2026-02-04

- `O2C-INDENT-TC-002`: Submit indent for approval
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 2 tests affected

---

### `../web_app/src/app/o2c/indents/components/IndentForm.tsx`
**Affected Tests**:
- `O2C-INDENT-TC-001`: Create indent with valid data
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Locators Used**: 
    - `getByRole('combobox', { name: 'Dealer' })`
    - `getByLabel('Indent Name')`
    - `getByRole('button', { name: 'Add Product' })`
  - **Last Verified**: 2026-02-04

- `O2C-INDENT-TC-003`: Validation error on empty required field
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 2 tests affected

---

### `../web_app/src/app/o2c/indents/components/ProductTable.tsx`
**Affected Tests**:
- `O2C-INDENT-TC-001`: Create indent with valid data
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Locators Used**: `getByRole('button', { name: 'Add Product' })`
  - **Last Verified**: 2026-02-04

**Change Risk**: 🟡 Medium - 1 test affected

---

## API Routes

### `../web_app/src/app/api/auth/login/route.ts`
**Affected Tests**:
- `AUTH-LOGIN-TC-001`: Login with valid credentials
  - **Interaction**: API (via UI action)
  - **Verification**: Database check (Sandwich Method)
  - **Last Verified**: 2026-02-04

- `AUTH-LOGIN-TC-002`: Login with invalid credentials
  - **Interaction**: API (via UI action)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 2 tests affected

---

### `../web_app/src/app/api/o2c/indents/route.ts`
**Affected Tests**:
- `O2C-INDENT-TC-001`: Create indent with valid data
  - **Interaction**: API (via UI action)
  - **Verification**: Database check (Sandwich Method)
  - **Last Verified**: 2026-02-04

- `O2C-INDENT-TC-002`: Submit indent for approval
  - **Interaction**: API (via UI action)
  - **Verification**: Database check (Sandwich Method)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 2 tests affected

---

## Component Library (Shared Components)

### `../web_app/src/components/ui/select.tsx` (ShadCN Select)
**Affected Tests**:
- `O2C-INDENT-TC-001`: Create indent with valid data
  - **Interaction**: Component Library (`SelectComponent.ts`)
  - **Last Verified**: 2026-02-04

- Any test using dropdowns/comboboxes
  - **Interaction**: Component Library (`SelectComponent.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 Critical - Affects ALL tests using dropdowns

---

### `../web_app/src/components/ui/dialog.tsx` (ShadCN Dialog)
**Affected Tests**:
- Any test using modals/dialogs
  - **Interaction**: Component Library (`DialogComponent.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 Critical - Affects ALL tests using dialogs

---

### `../web_app/src/components/ui/toast.tsx` (Sonner Toast)
**Affected Tests**:
- Any test verifying toast notifications
  - **Interaction**: Component Library (`ToastComponent.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 Critical - Affects ALL tests using toast verification

---

## Change Impact Risk Levels

| Risk Level | Impact | Recommendation |
|------------|--------|----------------|
| 🔴 Critical | Affects 10+ tests or core component | Run full regression suite |
| 🔴 High | Affects 3-9 tests | Run all affected module tests |
| 🟡 Medium | Affects 1-2 tests | Run affected tests only |
| 🟢 Low | No direct test impact | No test execution required (but verify) |

---

## Automated Impact Analysis

### Script: `analyze-change-impact.sh`

```bash
#!/bin/bash
# Usage: ./scripts/analyze-change-impact.sh main..feature-branch

BRANCH_RANGE="${1:-main..HEAD}"

echo "Analyzing changed files..."
CHANGED_FILES=$(git diff "$BRANCH_RANGE" --name-only | grep "web_app/src/app")

echo "Affected Tests:"
for FILE in $CHANGED_FILES; do
  FILENAME=$(basename "$FILE")
  echo "\n📄 Changed: $FILE"
  grep -A 5 "$FILENAME" docs/test-cases/test-impact-matrix.md | grep "TC-" || echo "  No tests found"
done
```

**Setup**:
```bash
chmod +x scripts/analyze-change-impact.sh
./scripts/analyze-change-impact.sh
```

---

## Maintenance Schedule

### Weekly (Every Friday)
- [ ] Review matrix for new tests created this week
- [ ] Add mappings for new tests
- [ ] Verify "Last Verified" dates for changed components

### Monthly
- [ ] Audit matrix completeness (all tests mapped?)
- [ ] Update risk levels based on test reliability
- [ ] Remove mappings for deprecated tests

### Quarterly
- [ ] Full audit: Run tests and verify locators still accurate
- [ ] Update component library mappings
- [ ] Archive outdated mappings (tests removed)

---

## Matrix Statistics

**Last Full Audit**: YYYY-MM-DD

| Metric | Count |
|--------|-------|
| Total Source Files Tracked | XX |
| Total Tests Mapped | XX |
| Average Tests per File | X.X |
| Files with 🔴 Critical Risk | X |
| Files with 🔴 High Risk | X |
| Files with 🟡 Medium Risk | X |
| Files with 🟢 Low Risk | X |

---

## Contributing Guidelines

### Adding New Mappings

When creating new tests, you MUST update this matrix:

1. **Identify Source Files**: List all web_app files your test interacts with
2. **Document Interaction Type**: POM, Direct, API, etc.
3. **List Locators Used**: Key locators from the source file
4. **Set Risk Level**: Based on number of affected tests
5. **Add Last Verified Date**: Today's date

**Template**:
```markdown
### `../web_app/src/app/[module]/[file].tsx`
**Affected Tests**:
- `MODULE-FEATURE-TC-###`: [Test name]
  - **Interaction**: POM (`e2e/src/pages/[module]/[Page].ts`)
  - **Locators Used**: `locator1`, `locator2`
  - **Last Verified**: YYYY-MM-DD

**Change Risk**: 🟡 Medium - 1 test affected
```

### Updating Existing Mappings

When source files change:
1. **Find Mapping**: Search for filename in this document
2. **Update "Last Verified"**: Set to today's date
3. **Update Locators**: If locators changed in component
4. **Update Risk Level**: If number of affected tests changed
5. **Add Note**: If mapping changed significantly

---

## Known Limitations

1. **Manual Maintenance**: Matrix requires manual updates (no automated syncing)
2. **Component Library**: Shared components affect many tests, hard to track individually
3. **API Routes**: Indirect relationships hard to capture (API called by multiple pages)
4. **Dynamic Components**: Components loaded conditionally may not be tracked

**Future Improvements**:
- Automated matrix generation from test code analysis
- Integration with code coverage tools
- Real-time impact analysis during CI/CD

---

**Document Owner**: QA Lead
**Contributors**: All automation engineers MUST update this when creating tests
