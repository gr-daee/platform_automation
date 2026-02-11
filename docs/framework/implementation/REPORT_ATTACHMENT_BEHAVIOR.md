# Report Attachment Behavior

## Overview

This document explains how screenshots and attachments are displayed in different test reports and the limitations/behaviors of each reporter.

## Artifact and report folders

| Folder | Purpose |
|--------|---------|
| **test-results/** | Playwright artifacts (screenshots, videos, traces). Debug screenshots under `test-results/debug-screenshots/`. |
| **playwright-report/** | Playwright HTML report. Open with `npm run test:report` (`playwright show-report`). |
| **allure-results/** | Allure Report 3 raw results (from allure-playwright). |
| **allure-report/** | Allure Report 3 generated HTML report. Generate with `npm run test:report:allure:generate`, open with `npm run test:report:allure:open`. |
| **blob-report/** | Blob report (e.g. for sharding/merge). Only if blob reporter is enabled. |

## Attachment Display Behavior

### Allure Report 3

**Behavior:**
- Attachments made with `testInfo.attach()` (e.g. from test-context screenshots) appear in the Allure report at test/step level.
- Steps are shown (including auto-steps from Playwright API and hooks when `detail: true`).
- Generate report after tests: `npm run test:report:allure:generate`. View: `npm run test:report:allure:open`, or one-shot: `npm run test:report:allure`.

**Where to Find Attachments:**
1. Open a test in the Allure report (generated in `allure-report/`).
2. Expand the test and its steps; attachments are listed with the relevant step or test.

See [ALLURE_REPORT.md](ALLURE_REPORT.md) for full usage.

### Playwright HTML Reporter

**Behavior:**
- Screenshots are displayed below the test steps
- Attachments are shown in a dedicated "Attachments" section
- Works correctly with both direct attachments and nested step attachments
- This is the default Playwright reporter behavior

**Where to Find Screenshots:**
1. Open a test case in Playwright HTML report
2. Scroll down to see attachments below the test steps
3. Screenshots are displayed as thumbnails with filenames

## Current Implementation

### How Screenshots Are Attached

Screenshots are captured and attached using:

```typescript
await playwrightTest.info().attach(filename, {
  path: filepath,
  contentType: 'image/png',
});
```

This attaches the screenshot to the current test context. Since BDD steps are wrapped in `test.step()` by playwright-bdd, attachments are associated with the step and appear in Playwright HTML and Allure reports.

### Screenshot Naming Convention

Screenshots are named with the following pattern:
```
{testName}_{stepName}_{timestamp}_{context}.png
```

Example:
```
test_I_should_see_the_TOTP_verification_step_2026-01-14T18-23-57_before_validation.png
```

This naming makes it easy to identify which step the screenshot belongs to, even if it's not visible in the step tree.

## Recommendations

1. **For daily use and step-level attachments**: Use **Allure Report 3** (`npm run test:report:allure` after running tests).
2. **For quick debugging and trace viewer**: Use **Playwright HTML report** (`npm run test:report`); open the trace from the report for screencast and logs per step.
3. **For CI/CD**: Playwright HTML and Allure reports are generated; use whichever fits your workflow.

## Verification

To verify screenshots are being captured correctly:

1. **Check attachments in Allure**: Open a test in the Allure report; attachments appear with the test or step.
2. **Check attachments in Playwright HTML**: Open a test; scroll to the Attachments section below steps.
3. **Check file system**: Screenshots are saved in `test-results/debug-screenshots/` when debug mode is enabled.

## Summary

- **Playwright HTML**: Attachments shown below steps; use for trace viewer link and quick debugging.
- **Allure Report 3**: Steps and attachments at test/step level; use for daily reporting and readability.
- **Current implementation**: Uses `testInfo.attach()`; attachments appear in both reporters.
