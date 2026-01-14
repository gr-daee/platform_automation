# Screenshot Capture Behavior

## Overview

This document clarifies when screenshots are captured in normal mode vs debug mode.

## Screenshot Capture Rules

### Normal Mode (DEBUG_MODE=false or unset)

**Validation Steps (Then steps)**: ✅ **ALWAYS capture screenshots**
- This is by design per requirements: "All validation steps should capture screenshot or logs"
- Screenshots are captured before and after validation
- Examples:
  - `Then I should see the TOTP verification step` → Screenshot captured
  - `Then I should see a success message` → Screenshot captured
  - `Then I should be redirected to the notes page` → Screenshot captured

**Action Steps (When steps)**: ❌ **No screenshots**
- Screenshots are NOT captured at action steps in normal mode
- Examples:
  - `When I enter valid admin credentials` → No screenshot
  - `When I submit the login form` → No screenshot
  - `When I generate and enter a valid TOTP code` → No screenshot

**Precondition Steps (Given steps)**: ❌ **No screenshots**
- Screenshots are NOT captured at precondition steps in normal mode
- Example:
  - `Given I am on the login page` → No screenshot (unless debug mode)

### Debug Mode (DEBUG_MODE=true)

**All Steps**: ✅ **Screenshots captured at EVERY step**
- Given steps: Screenshots captured
- When steps: Screenshots captured
- Then steps: Screenshots captured (as in normal mode)

## Why Validation Steps Always Capture

Per the original requirements:
> "All validation steps should capture screenshot or logs (as needed) or Specific Information like transaction ID"

This means:
- Validation steps (Then) should **always** capture screenshots
- This provides evidence of what was validated
- Helps with debugging when tests fail
- Provides traceability for test results

## Screenshot Cleanup

**Automatic Cleanup**: ALL screenshots from previous test runs are automatically cleaned up before each test run starts. This ensures:
- Screenshots from run 1 don't appear in run 2 (even in quick successions)
- Clean test reports with only current run screenshots
- No accumulation of old screenshots

**When Cleanup Runs**:
- In `global.setup.ts` - before all tests start
- In `TestContext` constructor - when module is first loaded

**Manual Cleanup**: You can manually delete screenshots:
```bash
rm -rf test-results/debug-screenshots/*.png
```

## What You'll See in Reports

### Normal Mode Report
- Screenshots from validation steps (Then steps) only
- Typically 2 screenshots per validation step (before/after)
- Example: 6-8 screenshots per test scenario

### Debug Mode Report
- Screenshots from ALL steps (Given/When/Then)
- Typically 10-15+ screenshots per test scenario
- Full trace of test execution

## Verification

To verify which steps captured screenshots, check the report attachments:
- Screenshot names include the step name
- Look for patterns like:
  - `test_I_should_see_...` (Then step - validation)
  - `test_I_am_on_the_login_page_...` (Given step - only in debug mode)
  - `test_I_enter_valid_admin_credentials_...` (When step - only in debug mode)

## Examples

### Normal Mode - Successful Login Test
```
Attachments:
1. test_I_should_see_the_TOTP_verification_step_..._before_validation.png (Then)
2. test_I_should_see_the_TOTP_verification_step_..._after_validation.png (Then)
3. test_I_should_see_a_success_message_..._before_validation.png (Then)
4. test_I_should_see_a_success_message_..._after_validation.png (Then)
5. test_I_should_be_redirected_to_the_notes_page_..._before_validation.png (Then)
6. test_I_should_be_redirected_to_the_notes_page_..._after_validation.png (Then)
```

### Debug Mode - Same Test
```
Attachments:
1. test_I_am_on_the_login_page_..._before_navigation.png (Given)
2. test_I_am_on_the_login_page_..._after_navigation.png (Given)
3. test_I_should_see_the_TOTP_verification_step_..._before_validation.png (Then)
4. test_I_should_see_the_TOTP_verification_step_..._after_validation.png (Then)
... (and more from When steps)
```

## Summary

✅ **Normal Mode**: Screenshots only at validation steps (Then) - This is CORRECT  
✅ **Debug Mode**: Screenshots at all steps (Given/When/Then)  
✅ **Cleanup**: Automatic cleanup of old screenshots (>24 hours)

If you see screenshots from Given/When steps in normal mode, it means:
1. DEBUG_MODE is set to true (check environment)
2. You're looking at old screenshots from a previous debug run
