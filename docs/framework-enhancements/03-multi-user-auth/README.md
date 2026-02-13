# Multi-User Authentication System

**Enhancement ID**: Framework Enhancement #3  
**Date Implemented**: 2026-02-05  
**Status**: ✅ Complete

---

## Overview

This enhancement adds support for multiple user authentication profiles in the test framework, allowing different tests to run as different users (IACS MD User, Super Admin, Finance Manager, etc.).

## Benefits

- ✅ **Test Isolation**: O2C tests run as IACS MD User, not Super Admin
- ✅ **Clear Context**: Feature files explicitly show which user is being tested
- ✅ **Audit Trail**: Logs clearly identify user email and role
- ✅ **Flexibility**: Easy to add new user profiles
- ✅ **Reusability**: Authentication steps work across all features

---

## Documentation

### 📖 [01-IMPLEMENTATION_GUIDE.md](01-IMPLEMENTATION_GUIDE.md)
**Complete implementation details including:**
- Why this enhancement was needed
- How multi-user authentication works
- Setup instructions and environment variables
- Configuration changes (playwright.config.ts)
- Usage examples in feature files
- Troubleshooting guide

**Read this first** for comprehensive understanding.

### 🚀 [02-QUICK_REFERENCE.md](02-QUICK_REFERENCE.md)
**Quick reference for daily use:**
- How to run tests with specific users
- Available user roles
- Supported dealers for testing
- Quick commands
- Audit trail examples
- How to add new users

**Read this** for quick lookups during test development.

---

## Quick Start

### 1. Verify Environment Variables

Ensure `.env.local` has user credentials:

```bash
# IACS MD User (for O2C tests)
IACS_MD_USER_EMAIL=md@idhyahagri.com
IACS_MD_USER_PASSWORD=12345678
IACS_MD_USER_TOTP_SECRET=Q5VXHVCSLVDII4KXUT3XOLJUVZV64XUZ

# Super Admin (for general tests)
TEST_PRIMARY_ADMIN_EMAIL=super-admin@daee.in
TEST_PRIMARY_ADMIN_PASSWORD=password
TEST_PRIMARY_ADMIN_TOTP_SECRET=XXXXX
```

### 2. Run Tests

```bash
# O2C tests automatically use IACS MD User
npm run test:dev -- --grep "@O2C-"

# Other tests use Super Admin
npm test
```

### 3. Use in Feature Files

```gherkin
Background:
  Given I am logged in as "IACS MD User"
```

---

## Files Modified

### New Files Created
- `e2e/src/steps/shared/auth-background-steps.ts` - Authentication step definitions

### Modified Files
- `e2e/src/support/global.setup.ts` - Multi-user auth (Super Admin + IACS MD User)
- `playwright.config.ts` - Added chromium-o2c project with IACS MD User
- `e2e/features/o2c/indents.feature` - Added Background with `Given I am logged in as "IACS MD User"`

### Generated Files
- `e2e/.auth/admin.json` - Super Admin session
- `e2e/.auth/iacs-md.json` - IACS MD User session

---

## Available User Profiles

| Profile | Email | Usage | Auth File |
|---------|-------|-------|-----------|
| **IACS MD User** | md@idhyahagri.com | O2C module tests | iacs-md.json |
| **Super Admin** | super-admin@daee.in | General tests | admin.json |
| **Finance Manager** | finance@daee.in | Finance tests | finance.json* |
| **Warehouse Manager** | warehouse@daee.in | Warehouse tests | warehouse.json* |

*Not yet configured - add credentials to `.env.local` to enable

---

## Architecture

```
Test Execution
     ↓
playwright.config.ts (determines which user based on test path)
     ↓
chromium-o2c project (O2C tests) → iacs-md.json
chromium project (Other tests) → admin.json
     ↓
Pre-authenticated session loaded
     ↓
Test runs with correct user context
```

---

## Integration Points

### With Existing Framework
- ✅ Works with existing global setup
- ✅ Compatible with pre-authenticated sessions
- ✅ No changes needed to existing tests
- ✅ Backward compatible

### With Test Cases
- ✅ O2C tests automatically use IACS MD User
- ✅ Login tests still use fresh context
- ✅ Other tests use Super Admin
- ✅ Clear separation of concerns

---

## Maintenance

### Adding New Users
1. Add credentials to `.env.local`
2. Add profile to users array in `global.setup.ts`
3. Add role to userRoleMap in `auth-background-steps.ts`
4. Create new project in `playwright.config.ts` (if needed)

### Testing New Users
```bash
# Verify auth file created
ls -lh e2e/.auth/

# Check user in test logs
npm run test:dev -- --grep "@TAG"
# Should show: "Running as [User Role]"
```

---

## Related Enhancements

- [01-Consolidated Rules](../01-consolidated-rules/) - Framework rule organization
- [02-Documentation System](../02-documentation-system/) - Test documentation standards

---

## Success Metrics

✅ **Implemented**: 2026-02-05  
✅ **Tests Using**: O2C-INDENT-TC-012 and all future O2C tests  
✅ **User Profiles**: 2 active (IACS MD, Super Admin)  
✅ **Test Impact**: Improved test isolation and audit trail

---

**Navigation**:
- [← Back to Framework Enhancements](../README.md)
- [← Back to Documentation Home](../../README.md)
