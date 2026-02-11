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

After each run, the **allure-playwright** reporter writes raw results into `allure-results/`.

## How to generate the report

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

- **allure-results/** – Raw Allure results (JSON, attachments) written by allure-playwright. Do not edit; regenerate the report after each test run.
- **allure-report/** – Generated HTML report. Created by `allure generate`; served by `allure open`.

Both are gitignored.

## References

- [Allure Report 3 – Introduction](https://allurereport.org/docs/v3/)
- [Allure Playwright – Getting started](https://allurereport.org/docs/playwright/)
- [Allure Playwright – Configuration](https://allurereport.org/docs/playwright-configuration/)
- [Allure 3 – Install (Node.js)](https://allurereport.org/docs/v3/install-for-nodejs/)
- [Allure 3 – Generate report](https://allurereport.org/docs/v3/generate-report/)
- [Allure 3 – View report](https://allurereport.org/docs/v3/view-report/)
