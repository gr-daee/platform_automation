# Automatic Allure Report Generation

## Overview

Allure reports are now automatically generated after each test execution, similar to Extent Reports in WebdriverIO. This eliminates the need for manual report generation steps.

## How It Works

### Before Test Execution (Global Setup)
1. **Cleanup**: Previous reports are cleaned up automatically:
   - `allure-report/` - Generated HTML report (always cleaned)
   - `playwright-report/` - Playwright HTML report (always cleaned)
   - `test-results/` - Test artifacts (always cleaned)
   - `allure-results/` - Raw results (cleaned only if `CLEAN_ALLURE_RESULTS=true`)

2. **Fresh Start**: Ensures clean environment for each test run

### After Test Execution (Global Teardown)
1. **Results Written**: `allure-playwright` writes results to `allure-results/`
2. **Report Generated**: Global teardown automatically runs `allure generate`
3. **Report Ready**: HTML report is available immediately at `allure-report/index.html`

## Configuration

### Result Accumulation (Default)

By default, Allure results accumulate across test runs (preserves historical data):

```bash
# .env.local (default behavior)
# CLEAN_ALLURE_RESULTS not set or false
```

**Behavior**:
- ✅ Results accumulate in `allure-results/`
- ✅ Generated reports cleaned before each run
- ✅ Historical test data preserved

### Fresh Start Mode (Like Extent Reports)

To start fresh each run (no accumulation):

```bash
# .env.local
CLEAN_ALLURE_RESULTS=true
```

**Behavior**:
- ✅ All reports cleaned before each run
- ✅ No result accumulation
- ✅ Fresh start every time (like Extent Reports)

## Usage

### Running Tests

```bash
# Run tests (report automatically generated)
npm run test:dev -- e2e/features/auth/login.feature
npm run test:regression
npm run test:smoke
```

### Viewing Reports

After tests complete, the report is already generated:

```bash
# Open the automatically generated report
npm run test:report:allure:open
```

Or open directly:
```
allure-report/index.html
```

### Manual Generation (Fallback)

If automatic generation fails, you can manually generate:

```bash
npm run test:report:allure:generate
npm run test:report:allure:open
```

## Implementation Details

### Files Created/Modified

1. **`e2e/src/support/global.teardown.ts`** (NEW)
   - Automatically generates Allure report after tests
   - Handles errors gracefully (doesn't fail tests if report generation fails)

2. **`e2e/src/support/global.setup.ts`** (MODIFIED)
   - Added `cleanupPreviousReports()` function
   - Cleans reports before test execution
   - Configurable via `CLEAN_ALLURE_RESULTS` env var

3. **`playwright.config.ts`** (MODIFIED)
   - Added `globalTeardown` configuration

### Error Handling

- If report generation fails, tests still complete successfully
- Error message logged with instructions for manual generation
- No test failures due to report generation issues

## Benefits

1. **No Manual Steps**: Report always ready after tests (like Extent Reports)
2. **Consistent**: Same workflow every time
3. **Configurable**: Choose accumulation or fresh start
4. **Error Resilient**: Tests don't fail if report generation fails
5. **CI/CD Ready**: Works seamlessly in automated pipelines

## Comparison with Extent Reports

| Feature | Extent Reports (WebdriverIO) | Allure (Playwright) |
|---------|------------------------------|---------------------|
| **Auto Generation** | ✅ Yes | ✅ Yes (now) |
| **Cleanup Before Run** | ✅ Yes | ✅ Yes (configurable) |
| **Result Accumulation** | ❌ No (fresh each run) | ✅ Yes (configurable) |
| **Manual Generation** | N/A | ✅ Available (fallback) |

## Migration Notes

**Before**:
```bash
npm run test:dev -- e2e/features/auth/login.feature
npm run test:report:allure:generate  # Manual step
npm run test:report:allure:open
```

**After**:
```bash
npm run test:dev -- e2e/features/auth/login.feature
npm run test:report:allure:open  # Report already generated!
```

## Troubleshooting

### Report Not Generated

1. Check console output for errors
2. Verify `allure-results/` has result files
3. Manually generate: `npm run test:report:allure:generate`

### Old Report Showing

1. Hard refresh browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Close and reopen: `npm run test:report:allure:open`

### Want Fresh Start Each Run

Add to `.env.local`:
```bash
CLEAN_ALLURE_RESULTS=true
```

## References

- [Allure Report Documentation](ALLURE_REPORT.md)
- [Reporting Directories Guide](../REPORTING_DIRECTORIES.md)
