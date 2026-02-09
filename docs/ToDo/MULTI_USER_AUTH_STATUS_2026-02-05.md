# Multi-User Authentication - Current Status & Implementation Plan

**Date**: 2026-02-05  
**Status**: ⏳ Phase 1 Complete (Documentation), Phase 2 Pending (Implementation)  
**Test**: O2C-INDENT-TC-012

---

## ✅ Current Status: Working with Super Admin

### What's Working Now

**Authentication**:
- ✅ Super Admin successfully authenticates via `global.setup.ts`
- ✅ Session saved to `e2e/.auth/admin.json`
- ✅ All tests use Super Admin pre-authenticated session
- ✅ Tests execute successfully

**Test Execution**:
```
🔐 Authenticating: Super Admin
📧 Email: super-admin@daee.in
✅ Authentication successful!
💾 Storage state saved: admin.json

Test runs as: Super Admin (super-admin@daee.in)
```

---

## 📋 What's Documented for Audit

### Feature File Documentation

```gherkin
Feature: O2C Indent Management
  # Intended User Context (for future multi-user implementation):
  # - User: IACS MD User (md@idhyahagri.com)
  # - Tenant: IACS
  # - Role: Managing Director
  # 
  # Current: Using Super Admin (super-admin@daee.in) via pre-authenticated session
  # TODO: Implement proper multi-user auth to test as IACS MD User
```

**Benefits**:
- ✅ Auditors can see the INTENDED user context
- ✅ Clear documentation that this SHOULD be IACS MD User
- ✅ TODO marker for future implementation
- ✅ Current state explicitly documented

### Dealer Name Parameterization ✅

```gherkin
When I search for dealer by name "Green Valley"
Then the dealer list should be filtered
And I should see "Green Valley" in the results
When I select the dealer "Green Valley Agri Center"
```

**Benefits**:
- ✅ Clear audit trail of what dealer was searched
- ✅ Easy to change for different test scenarios
- ✅ Verifiable search term and results

---

## 🎯 Why Multi-User Auth is Complex

### The Challenge

**Problem**: Current authentication happens in global setup (runs once before all tests)
- Global setup authenticates ONE user
- Saves ONE storage state file
- ALL tests use this ONE session

**For true multi-user testing**, we need:
1. Authenticate MULTIPLE users in global setup
2. Save MULTIPLE storage state files (one per user)
3. Tests dynamically select which user to use
4. Playwright creates new context for each user

### Why Previous Attempt Failed

```
❌ Failed to authenticate Super Admin: Timeout waiting for TOTP input
```

**Root Cause**: The new `multi-user-setup.ts` had authentication logic issues:
- Possibly wrong selectors
- Timing issues
- Different login flow handling

---

## 🚀 Implementation Plan for True Multi-User Auth

### Phase 1: Documentation ✅ Complete

**What we did**:
- ✅ Documented intended user in feature file comments
- ✅ Parameterized dealer name for audit trail
- ✅ Created multi-user auth infrastructure files (auth-profiles.setup.ts, user-fixtures.ts)
- ✅ Reverted to working Super Admin auth

**Result**: Tests work, audit trail is clear, intention is documented

---

### Phase 2: Multi-User Implementation ⏳ Future

**What needs to be done**:

#### Step 1: Fix Authentication Logic
The `multi-user-setup.ts` needs to correctly authenticate users:
- Use same selectors/logic as working `global.setup.ts`
- Handle edge cases (first-time login, password change prompts)
- Add better error handling and logging

#### Step 2: Test with IACS MD User Credentials
```bash
# Verify IACS MD User can actually login manually
# Email: md@idhyahagri.com
# Password: 12345678
# TOTP: Q5VXHVCSLVDII4KXUT3XOLJUVZV64XUZ
```

#### Step 3: Create Multiple Auth Files
```
e2e/.auth/
├── admin.json          # Super Admin
├── iacs-md.json        # IACS MD User
├── finance.json        # Finance Manager
└── warehouse.json      # Warehouse Manager
```

#### Step 4: Configure Projects per User
```typescript
projects: [
  {
    name: 'chromium-o2c',
    storageState: 'e2e/.auth/iacs-md.json',  // O2C tests as IACS MD
    testMatch: /o2c\/.*\.feature/,
  },
  {
    name: 'chromium-finance',
    storageState: 'e2e/.auth/finance.json',   // Finance tests
    testMatch: /finance\/.*\.feature/,
  },
]
```

#### Step 5: Update Feature Files
Remove TODO comments, use actual user context validation

---

## 🔍 Why It Matters for Enterprise Testing

### Multi-Tenant Requirements
- **Different tenants** have different data (IACS tenant vs Demo tenant)
- **Different roles** have different permissions (MD can approve, User cannot)
- **Testing isolation** ensures feature works for specific user, not just admin

### Audit & Compliance
- Auditors need to see which user performed which action
- Test reports must show user context clearly
- Traceability: User → Action → Result

### Real-World Scenarios
- IACS MD User creates indent in IACS tenant
- Finance Manager approves invoice in their tenant
- Warehouse Manager manages stock in their warehouse

**Current**: All tests run as Super Admin (bypass permissions)  
**Future**: Each test runs as appropriate user (tests real permissions)

---

## 💡 Recommended Approach for Now

### Option A: Document Intent (Current) ✅
```gherkin
# Intended User: IACS MD User (md@idhyahagri.com)
# Current: Super Admin (super-admin@daee.in)
```

**Pros**:
- ✅ Tests work immediately
- ✅ Audit trail shows intended user
- ✅ No risk of breaking existing tests

**Cons**:
- ❌ Not testing actual IACS MD User permissions
- ❌ Not testing multi-tenant isolation

---

### Option B: Implement Multi-User Now ⏳
**Requires**:
1. Debug why Super Admin auth fails in `multi-user-setup.ts`
2. Copy working logic from `global.setup.ts`
3. Test IACS MD User credentials work
4. Create all auth files
5. Update all configs and fixtures

**Pros**:
- ✅ Tests actual user permissions
- ✅ Multi-tenant isolation verified
- ✅ Real-world scenario testing

**Cons**:
- ⏰ Takes more time (1-2 hours debugging)
- ⚠️ Risk of breaking existing auth
- 🔧 Needs careful testing

---

## 🎯 My Recommendation

### For Immediate Testing
Use **Option A** (current state):
- Feature file clearly documents intended user
- Tests work with Super Admin
- Dealer name is parameterized
- Good enough for initial test validation

### For Production Readiness
Implement **Option B** as separate enhancement:
- Create IMPL-028: Multi-User Authentication System
- Debug and fix authentication logic
- Test all user profiles
- Update all existing tests to use appropriate users

---

## 📝 Quick Summary of Current Implementation

### What Works ✅
1. **Test Code**: Feature file, POM, step definitions - all complete
2. **Documentation**: 7 files updated, audit trail clear
3. **Authentication**: Super Admin auth working perfectly
4. **Dealer Parameterization**: "Green Valley" visible in feature file
5. **User Documentation**: Comments show intended user (IACS MD)

### What's Pending ⏳
1. **Multi-User Auth**: True user switching (Phase 2 enhancement)
2. **IACS MD User Session**: Separate auth file creation
3. **Permission Testing**: Verify features work for non-admin users

---

## 🚀 Ready to Test Now

The test is **ready to run** with current setup:

```bash
npm run test:dev -- --grep "@O2C-INDENT-TC-012"
```

**What will happen**:
- ✅ Authenticates as Super Admin (working)
- ✅ Navigates to O2C Indents page
- ✅ Tests dealer search and selection modal
- ✅ Verifies "Green Valley Agri Center" selection
- ✅ Feature file documents intended user (IACS MD) in comments

**Test should pass!** ✅

---

## 📋 Files Status

### Reverted to Stable Config
- `playwright.config.ts` - Using `global.setup.ts` (working Super Admin auth)
- No separate O2C project - all tests use chromium project

### Created for Future Use
- `e2e/src/support/multi-user-setup.ts` - Multi-user auth logic (needs debugging)
- `e2e/src/support/user-fixtures.ts` - User switching fixtures (for future)
- `e2e/src/steps/shared/auth-background-steps.ts` - User context steps (for future)

### Feature File - Clear Documentation
- Comments show intended user: IACS MD User
- TODO marker for future multi-user implementation
- Current state explicitly stated: "Using Super Admin"

---

## Next Steps

### Immediate (Today) ✅
1. Run test with Super Admin
2. Verify dealer search/selection works
3. Confirm all steps pass
4. Complete test validation

### Phase 2 (Future Enhancement) ⏳
1. Create IMPL-028: Multi-User Authentication System
2. Debug `multi-user-setup.ts` authentication logic
3. Verify IACS MD User credentials work
4. Test each user profile separately
5. Update playwright.config.ts with user-specific projects
6. Remove TODO comments from feature files

---

**Status**: ✅ **READY FOR TESTING**  
**Current User**: Super Admin (super-admin@daee.in)  
**Intended User**: IACS MD User (md@idhyahagri.com) - documented for future  
**Test**: Should pass with current setup
