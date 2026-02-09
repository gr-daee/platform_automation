# Troubleshooting Guide

This section contains problem-solution documentation for common issues encountered during test development and maintenance.

---

## How to Use This Section

### When You Encounter an Issue

1. **Check by date** - Look in the month folder (e.g., `2026-02/`)
2. **Check by symptom** - Search for error message keywords
3. **Check by type** - Import errors, runtime errors, configuration issues

### Document Structure

Each troubleshooting document follows this pattern:
- **Error Message**: Exact error you'll see
- **Root Cause**: Why the error occurred
- **Fix Applied**: How to resolve it
- **Prevention**: How to avoid it in future

---

## Troubleshooting by Date

### [2026-02/](2026-02/)
- [01-bdd-generation-import-fixes.md](2026-02/01-bdd-generation-import-fixes.md) - Import path errors, Cucumber vs playwright-bdd
- [02-navigation-and-toast-fixes.md](2026-02/02-navigation-and-toast-fixes.md) - Navigation method, multiple toast elements
- [03-dialog-component-method-names.md](2026-02/03-dialog-component-method-names.md) - DialogComponent API errors

---

## Common Issues Quick Reference

### Import Errors

**Symptom**: `Error: Cannot find module '../pages/auth/LoginPage'`

**Solution**: [01-bdd-generation-import-fixes.md](2026-02/01-bdd-generation-import-fixes.md#1-import-path-errors-in-auth-stepsts)

---

### Runtime Errors

**Symptom**: `TypeError: this.goto is not a function`

**Solution**: [02-navigation-and-toast-fixes.md](2026-02/02-navigation-and-toast-fixes.md#issue-1-indentspage-navigation-error)

---

**Symptom**: `strict mode violation: locator('[data-sonner-toast]') resolved to 9 elements`

**Solution**: [02-navigation-and-toast-fixes.md](2026-02/02-navigation-and-toast-fixes.md#issue-2-multiple-toast-notifications-error)

---

### Component API Errors

**Symptom**: `TypeError: this.dialogComponent.waitForDialog is not a function`

**Solution**: [03-dialog-component-method-names.md](2026-02/03-dialog-component-method-names.md#issue-dialogcomponent-method-names)

---

## Troubleshooting by Category

### BDD Generation Issues
- Import path errors → [01-bdd-generation-import-fixes.md](2026-02/01-bdd-generation-import-fixes.md)
- Cucumber vs playwright-bdd → [01-bdd-generation-import-fixes.md](2026-02/01-bdd-generation-import-fixes.md#2-cucumber-vs-playwright-bdd-import-error)
- Duplicate step definitions → [01-bdd-generation-import-fixes.md](2026-02/01-bdd-generation-import-fixes.md#3-duplicate-step-definitions)

### Page Object Issues
- Wrong method names → [02-navigation-and-toast-fixes.md](2026-02/02-navigation-and-toast-fixes.md)
- Component API errors → [03-dialog-component-method-names.md](2026-02/03-dialog-component-method-names.md)

### UI Element Interaction Issues
- Multiple elements matched → [02-navigation-and-toast-fixes.md](2026-02/02-navigation-and-toast-fixes.md#issue-2-multiple-toast-notifications-error)
- Dialog/Modal handling → [03-dialog-component-method-names.md](2026-02/03-dialog-component-method-names.md)

### Test Configuration Issues
- Browser launch issues → [02-navigation-and-toast-fixes.md](2026-02/02-navigation-and-toast-fixes.md#configuration-run-only-on-chromium)

---

## Contributing

When you encounter and fix an issue:

1. **Document it** - Create a troubleshooting guide
2. **Include details**:
   - Exact error message
   - Root cause analysis
   - Step-by-step fix
   - Prevention tips
3. **Save to** `troubleshooting/YYYY-MM/`
4. **Update this README** with quick reference

### Template

```markdown
# Issue Title

**Date**: YYYY-MM-DD
**Status**: ✅ Resolved

## Error Message
```
[Exact error message]
```

## Root Cause
[Why it happened]

## Fix Applied
[How to resolve]

## Prevention
[How to avoid]
```

---

## Related Documentation

- [Framework Documentation](../framework/) - Core framework usage
- [Implementation Guides](../implementations/) - Test implementations
- [Framework Enhancements](../framework-enhancements/) - Framework improvements

---

**Navigation**:
- [← Back to Documentation Home](../README.md)
