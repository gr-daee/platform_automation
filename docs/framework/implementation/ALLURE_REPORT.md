# Allure Report 3

## What it is

[Allure Report 3](https://allurereport.org/docs/v3/) is an additional HTML report for the DAEE Playwright-BDD framework. It provides:

- **Steps**: Test steps (including auto-steps from Playwright API, hooks, and assertions when `detail: true`).
- **Attachments**: Screenshots and other files attached via `testInfo.attach()` (e.g. from test-context) appear at test/step level.
- **Suite structure**: Tests grouped by file/suite.
- **Environment info**: Node version and Playwright version on the report overview.

Allure 3 is Node.js-only (no Java required). Results are written by the **allure-playwright** adapter; the **allure** CLI generates and serves the HTML report.

## How to run tests

Unchanged. Use your usual commands:

- `npm run test:regression` – full regression
- `npm run test:dev -- e2e/features/auth/login.feature` – development mode, single feature
- `npm run test:smoke`, `npm run test:critical`, etc.

After each run:
1. The **allure-playwright** reporter writes raw results into `allure-results/`
2. **Global teardown automatically generates** the Allure HTML report (like Extent Reports)
3. Report is ready immediately - no manual generation needed!

## Automatic Report Generation

**✨ NEW**: Allure report is automatically generated after each test execution (similar to Extent Reports in WebdriverIO).

- **Before tests**: Previous reports are cleaned up (configurable)
- **After tests**: Allure report is automatically generated
- **Result**: Report is always ready - just open `allure-report/index.html` or use `npm run test:report:allure:open`

### Manual Report Generation (if needed)

If automatic generation fails or you want to regenerate:

From existing results in `allure-results/`:

```bash
npm run test:report:allure:generate
```

Or directly:

```bash
npx allure generate allure-results -o allure-report
```

This creates (or overwrites) the `allure-report/` directory with the HTML report.

## How to view the report

**Option 1 – Generate and open in one step (recommended):**

```bash
npm run test:report:allure
```

This runs `allure generate` then `allure open`, so the report opens in your browser.

**Option 2 – Generate and open separately:**

```bash
npm run test:report:allure:generate
npm run test:report:allure:open
```

**Option 3 – Run tests and then open Allure (Allure 3 style):**

```bash
npm run test:allure
```

This runs `npx allure run -- npm run test`, which executes your test suite and then generates and opens the Allure report (using the default `npm test` script and results in `allure-results/`).

## Artifact folders

- **allure-results/** – Raw Allure results (JSON, attachments) written by allure-playwright. Do not edit; automatically regenerated after each test run.
- **allure-report/** – Generated HTML report. Automatically created by global teardown after each test run; served by `allure open`.

Both are gitignored.

## Report Cleanup Configuration

By default, reports accumulate across test runs (Allure's default behavior). To start fresh each run (like Extent Reports):

Add to `.env.local`:
```bash
CLEAN_ALLURE_RESULTS=true  # Clean allure-results/ before each test run (fresh start)
```

**Default behavior** (`CLEAN_ALLURE_RESULTS` not set or `false`):
- ✅ Results accumulate (historical data preserved)
- ✅ Generated reports (`allure-report/`, `playwright-report/`, `test-results/`) are cleaned before each run

**Fresh start mode** (`CLEAN_ALLURE_RESULTS=true`):
- ✅ All reports cleaned before each run
- ✅ No result accumulation (like Extent Reports)

## References

- [Allure Report 3 – Introduction](https://allurereport.org/docs/v3/)
- [Allure Playwright – Getting started](https://allurereport.org/docs/playwright/)
- [Allure Playwright – Configuration](https://allurereport.org/docs/playwright-configuration/)
- [Allure 3 – Install (Node.js)](https://allurereport.org/docs/v3/install-for-nodejs/)
- [Allure 3 – Generate report](https://allurereport.org/docs/v3/generate-report/)
- [Allure 3 – View report](https://allurereport.org/docs/v3/view-report/)
