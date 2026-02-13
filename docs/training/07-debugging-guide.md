# 07 - Debugging Guide

**Estimated Time**: 2 hours

**Prerequisites**: [03-running-tests.md](./03-running-tests.md)

---

## Learning Objectives

- ✅ Analyze test failures systematically
- ✅ Use reports effectively (Monocart, Allure)
- ✅ Fix common issues (locators, timeouts, assertions)
- ✅ Prevent flakiness

---

## Debugging Workflow

```
1. Identify Failure (error message, stack trace)
   ↓
2. Analyze Failure Point (video, screenshots, trace)
   ↓
3. Determine Root Cause (locator, timing, business logic)
   ↓
4. Apply Fix (update code)
   ↓
5. Verify Fix (run test again)
```

---

## Common Failure Patterns

### 1. Locator Not Found

**Error**:
```
Error: Locator not found: getByRole('button', { name: 'Submit' })
```

**Causes**:
- Element doesn't exist
- Element not visible
- Wrong locator
- Timing issue

**Solutions**:
- Verify element exists in trace viewer
- Check if element is hidden/disabled
- Update locator if UI changed
- Add explicit wait

### 2. Timeout

**Error**:
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

### 3. Assertion Failure

**Error**:
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

---

## Using Reports for Debugging

### Monocart Report (Dev/Debug)

1. **Watch Video**: See exactly what happened
2. **Review Screenshots**: Check UI state at failure
3. **Open Trace Viewer**: See timeline, network, console logs
4. **Check Network**: Verify API calls succeeded

### Allure Report (Production)

1. **Read Error Message**: Understand what failed
2. **View Screenshots**: Check failure point
3. **Download Trace**: Open in trace viewer
4. **Check Attachments**: Console logs, network logs

---

## Hands-On Exercise (60 minutes)

### Exercise 1: Debug Locator Failure

1. Break a locator in a Page Object
2. Run test and observe failure
3. Use trace viewer to identify correct locator
4. Fix and verify

### Exercise 2: Debug Timeout

1. Add a slow API call simulation
2. Run test and observe timeout
3. Add appropriate wait strategy
4. Verify fix

### Exercise 3: Debug Assertion Failure

1. Modify business logic to cause assertion failure
2. Run test and analyze failure
3. Update assertion or fix business logic
4. Verify fix

---

## Quick Reference

**Debugging Tools**:
- Video recording (Monocart)
- Screenshots (both reports)
- Trace viewer (both reports)
- Network logs (Monocart)
- Console logs (both reports)

**Common Fixes**:
- Update locators
- Add explicit waits
- Increase timeouts
- Fix test data
- Update assertions

---

## Next Steps

Continue to [08-best-practices.md](./08-best-practices.md) for anti-patterns and quality gates.
