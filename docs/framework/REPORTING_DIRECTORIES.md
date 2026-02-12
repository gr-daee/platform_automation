# Reporting Directories Explained

## Quick Answers

### 1. Can `monocart-report/` be deleted?
**✅ YES - Safe to delete**

- `monocart-report/` was previously used but has been **disabled** (Feb 2025)
- Not referenced in `playwright.config.ts` (only Playwright HTML and Allure are configured)
- Not in `package.json` dependencies
- Not in `.gitignore` (should be added if you want to keep it ignored)
- Leftover from previous setup

**Action**: Delete the directory - it's not being used.

---

### 2. How to Access Allure Reports?

**✨ Automatic Generation**: Allure report is **automatically generated** after each test run (like Extent Reports in WebdriverIO). No manual generation needed!

**Step 1: Run tests** (automatically generates `allure-results/` and `allure-report/`)
```bash
npm run test:dev -- e2e/features/auth/login.feature
# or
npm run test:regression
```

**Step 2: Open Allure report** (report is already generated!)
```bash
npm run test:report:allure:open
```

**Manual generation** (if automatic generation failed):
```bash
# Generate report manually
npm run test:report:allure:generate

# Then open
npm run test:report:allure:open
```

**One-command option** (generates + opens):
```bash
npm run test:report:allure
```

---

### 3. Are the directories redundant?

**❌ NO - They serve different purposes:**

| Directory | Purpose | When Created | Can Delete? |
|-----------|---------|--------------|-------------|
| **`test-results/`** | Playwright artifacts (screenshots, videos, traces, debug screenshots) | During test execution | ✅ Yes (regenerated each run) |
| **`playwright-report/`** | Playwright HTML report (interactive, trace viewer links) | After test execution | ✅ Yes (regenerated) |
| **`allure-results/`** | Raw Allure data (JSON files, attachments) | During test execution (by allure-playwright) | ✅ Yes (regenerated) |
| **`allure-report/`** | Generated Allure HTML report (final report) | When you run `npm run test:report:allure:generate` | ✅ Yes (regenerated) |

**Key Differences:**

- **`test-results/`** = Raw artifacts (screenshots, videos, traces)
- **`playwright-report/`** = Playwright's HTML report (different UI, trace viewer)
- **`allure-results/`** = Raw Allure data (JSON) - needed to generate report
- **`allure-report/`** = Final Allure HTML report (step-level attachments, better for BDD)

---

## Directory Flow

```
Test Execution
    ↓
┌─────────────────────────────────────┐
│  test-results/                      │ ← Screenshots, videos, traces
│  allure-results/                    │ ← Raw Allure JSON data
└─────────────────────────────────────┘
    ↓
Generate Playwright Report
    ↓
┌─────────────────────────────────────┐
│  playwright-report/                 │ ← Playwright HTML report
└─────────────────────────────────────┘
    ↓
Generate Allure Report
    ↓
┌─────────────────────────────────────┐
│  allure-report/                     │ ← Allure HTML report
└─────────────────────────────────────┘
```

---

## Which Report to Use?

### **Allure Report 3** (Recommended for BDD)
- ✅ Step-level attachments (screenshots per Gherkin step)
- ✅ Better for BDD/Cucumber workflows
- ✅ Cleaner step hierarchy
- **Access**: `npm run test:report:allure`

### **Playwright HTML Report**
- ✅ Trace viewer integration (screencast, network logs)
- ✅ Quick debugging
- ✅ Better for CI/CD integration
- **Access**: `npm run test:report`

---

## Cleanup Recommendations

### Safe to Delete (all are regenerated):
```bash
# Delete all report directories
rm -rf test-results/ playwright-report/ allure-results/ allure-report/ monocart-report/
```

### Add to `.gitignore` (if not already):
```
test-results/
playwright-report/
allure-results/
allure-report/
monocart-report/  # Add this if you want to ignore it
```

---

## Summary

1. ✅ **Delete `monocart-report/`** - Not used anymore
2. ✅ **Access Allure**: Run tests → `npm run test:report:allure`
3. ✅ **Not redundant** - Each directory serves a specific purpose:
   - `test-results/` = Artifacts
   - `playwright-report/` = Playwright HTML
   - `allure-results/` = Raw Allure data
   - `allure-report/` = Final Allure HTML

All directories are gitignored and regenerated on each test run, so they're safe to delete anytime.
