# February 2026 - Troubleshooting Guides

Issues encountered and resolved during O2C-INDENT-TC-012 implementation and framework enhancements.

---

## Issues Fixed This Month

### [01-bdd-generation-import-fixes.md](01-bdd-generation-import-fixes.md)
**BDD Generation and Import Path Errors**

Issues encountered when generating Playwright tests from Gherkin feature files.

**Problems Solved**:
1. ❌ Import path errors (`../pages/` vs `../../pages/`)
2. ❌ Cucumber vs playwright-bdd import confusion
3. ❌ Duplicate step definition files
4. ❌ Conflicting shared vs module-specific steps
5. ❌ Generic parametrized steps causing conflicts
6. ❌ Missing authentication background steps

**Key Learning**: Always use `playwright-bdd`'s `createBdd()`, never import from `@cucumber/cucumber`.

---

### [02-navigation-and-toast-fixes.md](02-navigation-and-toast-fixes.md)
**Runtime Navigation and Toast Notification Errors**

Issues encountered during first test execution.

**Problems Solved**:
1. ❌ `TypeError: this.goto is not a function` (wrong method name)
2. ❌ `strict mode violation: 9 toast elements matched` (selector too broad)

**Key Learning**: 
- Use `BasePage.navigateTo()` not `this.goto()`
- Target visible toasts with `.first()` for multiple elements

---

### [03-dialog-component-method-names.md](03-dialog-component-method-names.md)
**DialogComponent API Method Name Errors**

Issues with incorrect DialogComponent method names.

**Problems Solved**:
1. ❌ `waitForDialog()` doesn't exist (should be `waitForOpen()`)
2. ❌ `waitForDialogClose()` doesn't exist (should be `waitForClose()`)
3. ❌ Tests running on 3 browsers (configured to chromium only)

**Key Learning**: Always verify component API before using methods.

---

## Timeline

```
2026-02-04: Test implementation started
  ↓
2026-02-04: BDD generation errors (Import paths)
  ↓ [Fixed: 01-bdd-generation-import-fixes]
2026-02-05: Runtime errors (Navigation, Toasts)
  ↓ [Fixed: 02-navigation-and-toast-fixes]
2026-02-05: Dialog method errors
  ↓ [Fixed: 03-dialog-component-method-names]
2026-02-05: ✅ All issues resolved, test passing
```

---

## Impact Summary

### Issues Fixed: 11
- Import path errors: 5
- BDD generation errors: 6
- Runtime errors: 2
- Component API errors: 2

### Files Modified: 10
- Step definitions: 4 files
- Page Objects: 1 file
- Configuration: 1 file
- Shared steps: 3 files
- Feature files: 1 file

### Documentation Created: 6
- Troubleshooting guides: 3
- Implementation docs: 1
- Framework enhancement: 2

---

## Quick Reference by Error Type

### "Cannot find module"
→ See [01-bdd-generation-import-fixes.md - Issue 1](01-bdd-generation-import-fixes.md#1-import-path-errors-in-auth-stepsts)

### "Cucumber that isn't running"
→ See [01-bdd-generation-import-fixes.md - Issue 2](01-bdd-generation-import-fixes.md#2-cucumber-vs-playwright-bdd-import-error)

### "Multiple step definitions matched"
→ See [01-bdd-generation-import-fixes.md - Issue 3-5](01-bdd-generation-import-fixes.md#3-duplicate-step-definitions)

### "this.goto is not a function"
→ See [02-navigation-and-toast-fixes.md - Issue 1](02-navigation-and-toast-fixes.md#issue-1-indentspage-navigation-error)

### "strict mode violation: 9 elements"
→ See [02-navigation-and-toast-fixes.md - Issue 2](02-navigation-and-toast-fixes.md#issue-2-multiple-toast-notifications-error)

### "waitForDialog is not a function"
→ See [03-dialog-component-method-names.md](03-dialog-component-method-names.md#issue-dialogcomponent-method-names)

---

## Lessons Learned

### Best Practices Established

1. **Import Paths**: Always verify relative path depth (`../` vs `../../`)
2. **BDD Framework**: Use `playwright-bdd`'s `createBdd()`, not `@cucumber/cucumber`
3. **Step Organization**: Module-specific steps should be non-parametrized to avoid conflicts
4. **Base Class Methods**: Verify BasePage API before implementing child class methods
5. **Component APIs**: Check component method names against actual implementation
6. **Element Selection**: Use `.first()` or filters for multiple element matches
7. **Browser Config**: Configure test execution per project for efficiency

### Framework Improvements Made

1. ✅ Reorganized step definitions (auth/, o2c/, shared/)
2. ✅ Fixed all import paths
3. ✅ Removed duplicate files
4. ✅ Improved shared assertion steps for multiple elements
5. ✅ Configured browser-specific test execution
6. ✅ Multi-user authentication system

---

## Prevention Checklist

Before creating new Page Objects:
- [ ] Verify BasePage API methods
- [ ] Check component library for available methods
- [ ] Use semantic locators (no CSS/XPath)
- [ ] Test method names match actual implementation

Before creating step definitions:
- [ ] Use `createBdd()` from playwright-bdd
- [ ] Avoid parametrized steps for module-specific actions
- [ ] Check for existing shared steps first
- [ ] Verify import paths are correct

Before running tests:
- [ ] Run `npx bddgen` to generate test files
- [ ] Verify auth files exist (`.auth/*.json`)
- [ ] Check browser configuration
- [ ] Review test logs for user context

---

**Navigation**:
- [← Back to Troubleshooting](../README.md)
- [← Back to Documentation Home](../../README.md)
