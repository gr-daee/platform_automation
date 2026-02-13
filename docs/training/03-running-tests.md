# 03 - Running Tests

**Estimated Time**: 2 hours

**Prerequisites**: [01-getting-started.md](./01-getting-started.md), [02-framework-architecture.md](./02-framework-architecture.md)

---

## Learning Objectives

By the end of this module, you will:
- ✅ Master all execution modes (development, debug, production)
- ✅ Navigate Monocart and Allure reports
- ✅ Debug failing tests using traces and screenshots
- ✅ Run tests with different filters (tags, grep, projects)

---

## 1. Execution Modes (30 minutes)

### Three Execution Modes

The framework supports three modes controlled by `TEST_EXECUTION_MODE`:

| Mode | Purpose | Browser | Workers | Report | Artifacts |
|------|---------|---------|---------|--------|-----------|
| **Development** | Day-to-day testing | Headed | 1 | Monocart (auto-open) | Full (video, screenshots, traces) |
| **Debug** | Troubleshooting | Headed | 1 (sequential) | Monocart (auto-open) | Full (video, screenshots, traces) |
| **Production** | CI/CD, regression | Headless | Parallel | Allure + Playwright HTML | On failure only |

### Development Mode

**When to use**: Daily test development and quick verification.

**Command**:
```bash
npm run test:dev
```

**Characteristics**:
- Browser window visible (headed)
- Single worker (one test at a time)
- Monocart report auto-opens
- Full artifact capture (videos, screenshots, traces)

**Example**:
```bash
# Run all O2C tests
npm run test:dev -- e2e/features/o2c/

# Run specific test by tag
npm run test:dev -- --grep "@O2C-INDENT-TC-012"

# Run specific feature file
npm run test:dev -- e2e/features/o2c/indents.feature
```

### Debug Mode

**When to use**: Investigating test failures, step-by-step debugging.

**Command**:
```bash
npm run test:debug
```

**Characteristics**:
- Browser window visible (headed)
- Sequential execution (one test at a time, no parallelization)
- Monocart report auto-opens
- Full artifact capture
- Slower execution for detailed observation

**Example**:
```bash
# Debug specific failing test
npm run test:debug -- --grep "@O2C-INDENT-TC-012"
```

### Production Mode

**When to use**: CI/CD pipelines, regression suites, scheduled runs.

**Command**:
```bash
npm run test:regression
```

**Characteristics**:
- Headless (no browser window)
- Parallel execution (multiple workers)
- Allure + Playwright HTML reports
- Artifacts only on failure/retry
- Faster execution

**Example**:
```bash
# Run all regression tests
npm run test:regression

# Run smoke tests only
npm run test:smoke

# Run critical tests only
npm run test:regression -- --grep "@critical"
```

**Exercise**: Run the same test in all three modes and compare execution time and report output.

---

## 2. Monocart Report (Development/Debug) (30 minutes)

### Accessing Monocart Report

**Auto-open**: Report opens automatically after test completion in dev/debug mode.

**Manual open**:
```bash
npm run test:report:monocart
```

**Direct file access**:
```bash
open monocart-report/index.html
```

### Report Features

#### 1. Test Overview
- ✅ Passed tests (green)
- ❌ Failed tests (red)
- ⏭️ Skipped tests (gray)
- Total duration
- Test count

#### 2. Video Recording
- Full test execution video
- Playback controls
- Timestamp markers for each step

#### 3. Screenshots
- Screenshot at each step
- Click to enlarge
- Timestamp and step description

#### 4. Trace Viewer
- Click "View Trace" link
- Opens Playwright trace viewer
- Shows:
  - Timeline of all actions
  - Network requests
  - Console logs
  - DOM snapshots
  - Action details (locators, timing)

#### 5. Network Metrics
- API calls made during test
- Request/response details
- Timing information
- Status codes

#### 6. Tree-Grid Visualization
- Hierarchical test structure
- Expand/collapse scenarios
- Filter by status

### Navigating Monocart Report

**Step-by-Step**:
1. Open report (auto or manual)
2. Find your test in the list
3. Click to expand test details
4. Watch video recording
5. Review screenshots
6. Click "View Trace" for detailed timeline
7. Check network requests for API calls

**Exercise**: Run a test and explore all Monocart report features. Find the trace viewer and identify the slowest action.

---

## 3. Allure Report (Production) (20 minutes)

### Generating Allure Report

**After production run**:
```bash
npm run test:regression
npm run test:report:allure:open
```

**Manual generation**:
```bash
npm run test:report:allure:generate
npm run test:report:allure:open
```

### Report Features

#### 1. BDD Step Display
- Gherkin steps shown in report
- Step-level pass/fail status
- Step-level attachments

#### 2. Historical Trends
- Test pass rate over time
- Flakiness detection
- Duration trends

#### 3. Test Categories
- Group by feature, module, priority
- Filter by tags
- Search functionality

#### 4. Attachments
- Screenshots on failure
- Traces on failure
- Console logs

### Allure vs Monocart

| Feature | Monocart (Dev/Debug) | Allure (Production) |
|---------|----------------------|---------------------|
| Video recording | ✅ Full | ❌ No |
| Screenshots | ✅ Every step | ✅ On failure |
| Trace viewer | ✅ Links | ✅ Attachments |
| Network metrics | ✅ Yes | ❌ No |
| BDD steps | ❌ No | ✅ Yes |
| Historical trends | ❌ No | ✅ Yes |
| Auto-open | ✅ Yes | ❌ Manual |

**Exercise**: Run a test in production mode and compare Allure report to Monocart report.

---

## 4. Filtering Tests (20 minutes)

### By Tag

```bash
# Run smoke tests
npm run test:dev -- --grep "@smoke"

# Run critical tests
npm run test:dev -- --grep "@critical"

# Run specific test case
npm run test:dev -- --grep "@O2C-INDENT-TC-012"

# Run multiple tags (OR)
npm run test:dev -- --grep "@smoke|@critical"
```

### By Feature File

```bash
# Run all O2C tests
npm run test:dev -- e2e/features/o2c/

# Run specific feature file
npm run test:dev -- e2e/features/o2c/indents.feature
```

### By Project (User)

```bash
# Run as IACS MD User
npm run test:dev -- --project=iacs-md

# Run as Finance Manager
npm run test:dev -- --project=iacs-finance
```

### By Priority

```bash
# Run P0 (critical) tests
npm run test:dev -- --grep "@p0"

# Run P1 (high) tests
npm run test:dev -- --grep "@p1"
```

### Combining Filters

```bash
# Run O2C smoke tests
npm run test:dev -- --grep "@smoke" e2e/features/o2c/

# Run critical tests as specific user
npm run test:dev -- --project=iacs-md --grep "@critical"
```

**Exercise**: Create filter commands for:
1. All O2C tests with priority P0
2. Smoke tests for indents module
3. All tests as Finance Manager

---

## 5. Debugging Failing Tests (30 minutes)

### Step 1: Identify Failure

**In Monocart Report**:
- Failed test marked with ❌
- Error message displayed
- Stack trace available

**In Allure Report**:
- Failed test in red
- Error message and stack trace
- Attachments (screenshots, traces)

### Step 2: Analyze Failure Point

**Watch Video**:
- See exactly what happened
- Identify the failing step

**Review Screenshots**:
- Check UI state at failure
- Verify expected elements visible

**Open Trace Viewer**:
- See timeline of all actions
- Check network requests
- Review console logs
- Inspect DOM snapshots

### Step 3: Common Failure Patterns

#### Locator Not Found
```
Error: Locator not found: getByRole('button', { name: 'Submit' })
```

**Causes**:
- Element doesn't exist
- Element not visible
- Wrong locator
- Timing issue (element not loaded yet)

**Solutions**:
- Verify element exists in trace viewer
- Check if element is hidden/disabled
- Update locator if UI changed
- Add explicit wait

#### Timeout
```
Error: Timeout 30000ms exceeded waiting for element
```

**Causes**:
- Slow network/API
- Element never appears
- Animation delay

**Solutions**:
- Increase timeout: `{ timeout: 60000 }`
- Wait for network idle: `await page.waitForLoadState('networkidle')`
- Wait for specific response: `await page.waitForResponse(...)`

#### Assertion Failure
```
Error: Expected "5" but received "4"
```

**Causes**:
- Business logic changed
- Test data issue
- Race condition

**Solutions**:
- Review business rules
- Check test data setup
- Add explicit waits before assertions

### Step 4: Fix and Verify

1. **Make fix** in code
2. **Run test again** in debug mode
3. **Verify fix** with trace viewer
4. **Run in production mode** to ensure no regression

**Exercise**: Intentionally break a test (change a locator), run it, analyze the failure in the report, and fix it.

---

## Hands-On Exercise (30 minutes)

### Exercise 1: Run Tests in All Modes

1. Run indent test in development mode:
   ```bash
   npm run test:dev -- --grep "@O2C-INDENT-TC-012"
   ```
   - Note execution time
   - Explore Monocart report

2. Run same test in debug mode:
   ```bash
   npm run test:debug -- --grep "@O2C-INDENT-TC-012"
   ```
   - Compare execution time
   - Watch browser actions

3. Run same test in production mode:
   ```bash
   npm run test:regression -- --grep "@O2C-INDENT-TC-012"
   npm run test:report:allure:open
   ```
   - Compare execution time
   - Explore Allure report

**Question**: Which mode is fastest? Which report is most useful for debugging?

### Exercise 2: Debug a Failing Test

1. Modify `e2e/src/pages/o2c/IndentsPage.ts`:
   - Change a locator to an incorrect value
   - Example: Change `'Create Indent'` to `'Create Order'`

2. Run the test:
   ```bash
   npm run test:dev -- --grep "@O2C-INDENT-TC-012"
   ```

3. Analyze failure:
   - Read error message
   - Watch video to see where it failed
   - Open trace viewer
   - Identify the exact action that failed

4. Fix the locator and verify test passes

### Exercise 3: Filter Tests

Create commands to run:
1. All smoke tests in O2C module
2. All P0 tests as IACS MD User
3. All tests in indents.feature file
4. All critical tests in debug mode

---

## Troubleshooting

### Issue: "Monocart report doesn't open"
**Solution**:
```bash
npm run test:report:monocart
# Or open directly
open monocart-report/index.html
```

### Issue: "Allure report shows no tests"
**Solution**:
```bash
# Clean and regenerate
npm run test:report:allure:clean
npm run test:regression
npm run test:report:allure:open
```

### Issue: "Test runs but no video in report"
**Solution**:
- Verify execution mode is development or debug
- Check `playwright.config.ts` video setting
- Ensure test completes (video saved at end)

### Issue: "Trace viewer link doesn't work"
**Solution**:
- Click "View Trace" button in report
- Or manually open trace file from `test-results/`

---

## Key Takeaways

1. **Development mode**: Daily testing, full artifacts, Monocart report
2. **Debug mode**: Troubleshooting, sequential execution, full artifacts
3. **Production mode**: CI/CD, parallel execution, Allure report
4. **Monocart**: Video, screenshots, traces, network metrics
5. **Allure**: BDD steps, historical trends, production reporting
6. **Filtering**: Tags, feature files, projects, priorities
7. **Debugging**: Video → Screenshots → Trace viewer → Fix

---

## Next Steps

**Ready to create tests?** Continue to [04-creating-tests.md](./04-creating-tests.md) to learn the test creation workflow.

**Need more debugging help?** Jump to [07-debugging-guide.md](./07-debugging-guide.md) for advanced debugging techniques.

---

## Quick Reference

**Execution Commands**:
```bash
# Development mode
npm run test:dev

# Debug mode
npm run test:debug

# Production mode
npm run test:regression

# Smoke tests
npm run test:smoke
```

**Report Commands**:
```bash
# Monocart report
npm run test:report:monocart

# Allure report
npm run test:report:allure:open

# Playwright HTML report
npm run test:report
```

**Filtering**:
```bash
# By tag
npm run test:dev -- --grep "@smoke"

# By feature file
npm run test:dev -- e2e/features/o2c/indents.feature

# By project
npm run test:dev -- --project=iacs-md

# Combine filters
npm run test:dev -- --project=iacs-md --grep "@critical"
```
