# Report Attachment Behavior

## Overview

This document explains how screenshots and attachments are displayed in different test reports and the limitations/behaviors of each reporter.

## Attachment Display Behavior

### Monocart Reporter

**Behavior:**
- Screenshots are attached to test steps correctly
- **Limitation**: Attachments in nested `test.step()` calls may not display in the step tree view
- Screenshots are always available in the **Attachments** section of the test detail view
- This is a known limitation of how Monocart renders nested step attachments

**Where to Find Screenshots:**
1. Open a test case in Monocart report
2. Scroll to the **Attachments** section (below the steps/logs)
3. All screenshots will be listed there with their filenames
4. Click on a screenshot to view it

**Why This Happens:**
- Monocart reporter processes Playwright's test results
- When attachments are made within nested `test.step()` calls, Monocart may not render them in the step tree
- However, the attachments are correctly associated with the test and available in the Attachments section

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

This attaches the screenshot to the current test context. Since BDD steps are wrapped in `test.step()` by playwright-bdd, attachments should be associated with the step, but Monocart's rendering may not show them in the step tree.

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

## Workarounds and Solutions

### Option 1: Use Attachments Section (Current)
- **Pros**: Works with current implementation, all screenshots available
- **Cons**: Not visible in step tree in Monocart
- **Best for**: Current setup, no code changes needed

### Option 2: Use Playwright HTML Report
- **Pros**: Shows attachments correctly below steps
- **Cons**: Less feature-rich than Monocart
- **Best for**: Quick debugging, simpler view

### Option 3: Custom Monocart Configuration (Future)
- Investigate Monocart configuration options
- May require custom renderer or plugin
- **Best for**: Long-term solution if needed

## Recommendations

1. **For Daily Use**: Use Monocart report's **Attachments** section to view screenshots
2. **For Debugging**: Use Playwright HTML report for step-level attachment visibility
3. **For CI/CD**: Both reports are generated, use whichever fits your workflow

## Verification

To verify screenshots are being captured correctly:

1. **Check Attachments Count**: 
   - Monocart report shows total attachments in summary
   - Should match expected number (2 per validation step)

2. **Check Filenames**:
   - Screenshot filenames include step names
   - Easy to identify which step they belong to

3. **Check File System**:
   - Screenshots are saved in `test-results/debug-screenshots/`
   - Files should exist and be accessible

## Summary

- **Monocart**: Attachments available in "Attachments" section, may not show in step tree (limitation)
- **Playwright HTML**: Attachments shown below steps (works as expected)
- **Current Implementation**: Correctly attaches screenshots, limitation is in Monocart's rendering
- **Workaround**: Use Attachments section in Monocart or Playwright HTML report for step-level view
