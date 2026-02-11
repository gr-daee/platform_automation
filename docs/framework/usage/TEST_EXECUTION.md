# Test Execution Modes Guide

## Overview

The DAEE Platform test automation framework supports three distinct execution modes optimized for different use cases:

1. **Production Mode** - For regression, smoke, and scheduled test runs
2. **Debug Mode** - For investigating failures and debugging specific tests
3. **Development Mode** - For writing and developing new tests

## Execution Modes

### Production Mode (Default)

**Use Cases:**
- Regression test runs
- Smoke test suites
- Weekly scheduled test runs
- CI/CD pipeline execution
- Ad-hoc test execution on specific or all tests

**Configuration:**
- **Workers**: Auto (50% of CPU cores) or custom via `TEST_WORKERS`
- **Headed**: No (headless)
- **Parallel**: Yes (fully parallel execution)
- **Screenshots**: Only on failure
- **Video**: Only on failure
- **Trace**: Only on first retry

**Commands:**
```bash
# Run all tests (regression)
npm run test:regression

# Run smoke tests only
npm run test:smoke

# Run critical tests only
npm run test:critical

# Run weekly test suite
npm run test:weekly

# Run with custom worker count
TEST_WORKERS=4 npm run test:regression

# Run with percentage of CPU cores
TEST_WORKERS=50% npm run test:regression

# Run specific feature
npm run test:regression -- e2e/features/auth/login.feature

# Run specific scenario
npm run test:regression -- --grep "Login fails with invalid TOTP code"
```

**Environment Variables:**
```env
TEST_EXECUTION_MODE=production
TEST_WORKERS=auto  # or specific number (e.g., 4) or percentage (e.g., 50%)
TEST_HEADED=false
```

### Debug Mode

**Use Cases:**
- Investigating test failures
- Debugging specific test scenarios
- Reviewing test flow and interactions
- Troubleshooting flaky tests

**Configuration:**
- **Workers**: 1 (by default, can override)
- **Headed**: Optional (can enable)
- **Parallel**: No (single worker ensures sequential execution)
- **Screenshots**: On every step (if `DEBUG_MODE=true`)
- **Video**: Full recording (if `DEBUG_MODE=true`)
- **Trace**: Full trace (if `DEBUG_MODE=true`)

**Commands:**
```bash
# Debug specific test (headless)
npm run test:debug -- --grep "Login fails with invalid TOTP code"

# Debug with browser visible
npm run test:debug:headed -- --grep "@AUTH-LOGIN-TC-002"

# Debug specific feature
npm run test:debug -- e2e/features/auth/login.feature

# Debug with 2 workers (if needed)
TEST_WORKERS=2 npm run test:debug -- e2e/features/auth/

# Debug with enhanced logging
DEBUG_MODE=true npm run test:debug -- --grep "Login"
```

**Environment Variables:**
```env
TEST_EXECUTION_MODE=debug
TEST_WORKERS=1
TEST_HEADED=false  # or true for visible browser
DEBUG_MODE=true    # Optional: enables screenshots at every step
```

### Development Mode

**Use Cases:**
- Writing new test scenarios
- Developing test cases for a module
- Testing new Page Object Models
- Module-based test development
- Visual verification during test creation

**Configuration:**
- **Workers**: 1 (always, ensures sequential execution)
- **Headed**: Yes (always, browser visible)
- **Parallel**: No (single worker)
- **Screenshots**: On every step (if `DEBUG_MODE=true`)
- **Video**: Full recording (if `DEBUG_MODE=true`)
- **Trace**: Full trace (if `DEBUG_MODE=true`)

**Commands:**
```bash
# Develop tests for a module (all tests in module)
npm run test:dev -- e2e/features/auth/

# Develop specific feature
npm run test:dev -- e2e/features/auth/login.feature

# Develop tests matching a pattern
npm run test:dev -- --grep "Login"

# Develop with debug mode enabled
DEBUG_MODE=true npm run test:dev -- e2e/features/auth/
```

**Environment Variables:**
```env
TEST_EXECUTION_MODE=development
TEST_WORKERS=1
TEST_HEADED=true
DEBUG_MODE=true  # Optional: enables screenshots at every step
```

## Module-Based Test Execution

Tests are organized by module in `e2e/features/`:

```
e2e/features/
  auth/
    login.feature
    logout.feature
  o2c/
    indents.feature
    orders.feature
  finance/
    payments.feature
```

**Run all tests in a module:**
```bash
# Production mode
npm run test:regression -- e2e/features/auth/

# Development mode
npm run test:dev -- e2e/features/o2c/

# Debug mode
npm run test:debug -- e2e/features/finance/
```

## Worker Configuration

### Automatic (Default)
Playwright automatically uses 50% of available CPU cores:
```bash
npm run test:regression
# Uses: 50% of CPU cores (e.g., 4 workers on 8-core machine)
```

### Specific Number
Set exact number of workers:
```bash
TEST_WORKERS=4 npm run test:regression
# Uses: 4 workers
```

### Percentage
Use percentage of CPU cores:
```bash
TEST_WORKERS=50% npm run test:regression
# Uses: 50% of CPU cores
```

### Single Worker
Force sequential execution:
```bash
TEST_WORKERS=1 npm run test:regression
# Uses: 1 worker (sequential)
```

## Individual Test Execution

### By Feature File
```bash
npm run test:feature -- e2e/features/auth/login.feature
```

### By Scenario Name
```bash
npm run test:scenario -- "Login fails with invalid TOTP code"
```

### By Test Case ID
```bash
npm run test:tc -- "@AUTH-LOGIN-TC-002"
```

**Note:** `--grep` filters by test title (scenario name), not tags directly. To run by test case ID, use the scenario name:
```bash
npm run test:scenario -- "Login fails with invalid TOTP code"
```

## Execution Mode Comparison

| Feature | Production | Debug | Development |
|---------|-----------|-------|-------------|
| **Workers** | Auto (50% CPU) | 1 | 1 |
| **Headed** | No | Optional | Yes |
| **Parallel** | Yes | No | No |
| **Speed** | Fastest | Slowest | Slowest |
| **Use Case** | Regression/Smoke | Failure Investigation | Test Development |
| **Browser Visible** | No | Optional | Yes |
| **Screenshots** | On failure | Every step* | Every step* |
| **Video** | On failure | Full* | Full* |

*When `DEBUG_MODE=true`

## Best Practices

### Production Runs
- ✅ Use `npm run test:regression` for full test suite
- ✅ Use `npm run test:smoke` for quick validation
- ✅ Use `npm run test:critical` for critical path tests
- ✅ Run in parallel for faster execution
- ✅ Use headless mode to save resources

### Debug Runs
- ✅ Use `npm run test:debug` for investigating failures
- ✅ Enable `DEBUG_MODE=true` for comprehensive logging
- ✅ Use `TEST_HEADED=true` to see browser interactions
- ✅ Run single test or small subset
- ✅ Use single worker to avoid interference

### Development Runs
- ✅ Use `npm run test:dev` when writing new tests
- ✅ Run module-specific tests during development
- ✅ Enable `DEBUG_MODE=true` for detailed feedback
- ✅ Use visible browser to verify interactions
- ✅ Run sequentially to avoid confusion

## Environment Variable Reference

### Execution Mode Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `TEST_EXECUTION_MODE` | `production`, `debug`, `development` | `production` | Execution mode |
| `TEST_WORKERS` | `auto`, number (e.g., `4`), percentage (e.g., `50%`) | `auto` | Number of parallel workers |
| `TEST_HEADED` | `true`, `false` | `false` | Show browser window |
| `DEBUG_MODE` | `true`, `false` | `false` | Enable debug logging and screenshots |

### Example `.env.local` Configuration

```env
# Execution Mode (optional - defaults to production)
TEST_EXECUTION_MODE=production

# Worker Configuration (optional - defaults to auto)
TEST_WORKERS=auto

# Headed Mode (optional - defaults to false)
TEST_HEADED=false

# Debug Mode (optional - defaults to false)
DEBUG_MODE=false
```

## Troubleshooting

### Tests Running Too Slow
- **Issue**: Production mode using too many workers
- **Solution**: Set `TEST_WORKERS=4` to limit parallelism

### Tests Failing Intermittently
- **Issue**: Race conditions in parallel execution
- **Solution**: Run in debug mode with `TEST_WORKERS=1` to isolate

### Need to See Browser
- **Issue**: Tests running headless
- **Solution**: Use `npm run test:dev` or set `TEST_HEADED=true`

### Screenshots Not Capturing
- **Issue**: Screenshots only on failure
- **Solution**: Enable `DEBUG_MODE=true` for screenshots at every step

## Viewing Reports

- **Playwright HTML**: `npm run test:report` (opens playwright-report)
- **Allure Report 3**: After running tests, run `npm run test:report:allure` to generate and open the Allure report. See [ALLURE_REPORT.md](../implementation/ALLURE_REPORT.md).
- **Artifact folders**: See [REPORT_ATTACHMENT_BEHAVIOR.md](../implementation/REPORT_ATTACHMENT_BEHAVIOR.md) for test-results, playwright-report, allure-results, allure-report.

## Related Documentation

- [Environment Setup Guide](../setup/ENV_SETUP_GUIDE.md) - Environment variable configuration
- [Setup Guide](../setup/SETUP_GUIDE.md) - Framework setup instructions
- [Debug Mode Guide](../implementation/DEBUG_MODE_GUIDE.md) - Debug mode details
- [ALLURE_REPORT.md](../implementation/ALLURE_REPORT.md) - Allure Report 3 usage
- [Main README](../../README.md) - Framework overview
