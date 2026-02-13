# Monocart Reporter (Dev/Debug)

## What it is

[Monocart Reporter](https://github.com/cenfun/monocart-reporter) is used for **development and debug** test runs. It provides:

- **Tree-grid report**: Suites, cases, and steps in an interactive tree
- **Video recording**: Playwright videos linked in the report (when `video: 'on'` in config)
- **Attachments**: Screenshots and other artifacts with relative paths
- **Trace viewer**: Links to Playwright trace viewer for detailed debugging
- **Network reports**: Can be attached via `attachNetworkReport()` in tests
- **Performance**: CPU/memory monitoring, timeline workers graph (when enabled)

Monocart is **only active** when `TEST_EXECUTION_MODE` is `development` or `debug`. In production mode, Playwright HTML and Allure are used instead.

## When it runs

| Mode          | Monocart | Auto-open after tests |
|---------------|----------|------------------------|
| `development` | Yes      | Yes (via global teardown) |
| `debug`       | Yes      | Yes (via global teardown) |
| `production`  | No       | N/A (Allure generated instead) |

## How to use

### Development/Debug mode (Monocart)

1. Run tests in dev or debug mode:
   ```bash
   npm run test:dev -- e2e/features/auth/login.feature
   # or
   npm run test:debug -- --grep "@O2C-INDENT-TC-012"
   ```

2. After tests finish, **global teardown automatically opens** the Monocart report in your browser (via `npx monocart show-report monocart-report/index.html`).

3. If auto-open did not run or you closed the report, open it manually:
   ```bash
   npm run test:report:monocart
   # or
   npx monocart show-report monocart-report/index.html
   ```
   This serves the report and opens it in the browser (required for trace viewer links to work).

### View report without serving (file only)

You can open the HTML file directly:
```bash
open monocart-report/index.html   # macOS
# or double-click monocart-report/index.html in your file manager
```
Note: Trace viewer links may not work when opening the file directly; use `npx monocart show-report` for full functionality.

## Artifact folders

- **monocart-report/** – Generated Monocart HTML report (and optional `index.json`). Created only when running in development or debug mode. Gitignored.

## Configuration

Monocart is configured in `playwright.config.ts` when `TEST_EXECUTION_MODE` is `development` or `debug`:

```typescript
['monocart-reporter', {
  name: 'DAEE Test Report',
  outputFile: './monocart-report/index.html',
  copyAttachments: true,
  traceViewerUrl: 'https://trace.playwright.dev/?trace={traceUrl}',
}]
```

Video and screenshots are controlled by Playwright's `use` settings (e.g. `video: 'on'` in debug mode, `screenshot: 'on'` in debug mode).

## Comparison with other reports

| Feature           | Monocart (dev/debug) | Allure (production) | Playwright HTML (production) |
|------------------|----------------------|----------------------|------------------------------|
| When used        | Dev/Debug only       | Production           | Production                   |
| Auto-open        | Yes                  | No                   | No                           |
| Video in report  | Yes (Playwright)     | Yes (attachments)    | Yes (trace viewer)           |
| Network metrics  | Via attachNetworkReport | Step attachments   | Trace viewer                 |
| BDD step display | Tree steps           | Gherkin-focused      | Test steps                   |

## Troubleshooting

If you see `TypeError: Cannot read properties of undefined (reading 'model')` when running in dev/debug mode, the Monocart reporter may be failing to read CPU info in your environment. Workaround: run tests in production mode for that run (`TEST_EXECUTION_MODE=production npm run test:regression -- <path>`) or open the Playwright HTML report with `npm run test:report`.

## References

- [Monocart Reporter – GitHub](https://github.com/cenfun/monocart-reporter)
- [Monocart Reporter – npm](https://www.npmjs.com/package/monocart-reporter)
- [Attach Network Report](https://github.com/cenfun/monocart-reporter#attach-network-report)
