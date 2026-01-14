# Authentication Module - Test Cases

## Automated Tests

### Test: Successful Login with Valid TOTP
- **Test Case ID**: `@AUTH-LOGIN-TC-001`
- **Feature File**: `e2e/features/auth/login.feature`
- **Scenario**: "Successful login with valid TOTP for Admin user"
- **Coverage**: Complete login flow with MFA verification
- **Status**: ✅ Automated
- **Last Updated**: 2026-01-14

**Gherkin**:
```gherkin
@AUTH-LOGIN-TC-001 @smoke @critical
Scenario: Successful login with valid TOTP for Admin user
  Given I am on the login page
  When I enter valid admin credentials
  And I submit the login form
  Then I should see the TOTP verification step
  When I generate and enter a valid TOTP code
  And I submit the TOTP verification
  Then I should see a success message
  And I should be redirected to the notes page
  And the user session should be authenticated in the database
```

**Notes**: 
- Uses Sandwich Method for DB verification
- Verifies AAL2 session creation
- Tests complete authentication flow

### Test: Login Fails with Invalid TOTP
- **Test Case ID**: `@AUTH-LOGIN-TC-002`
- **Feature File**: `e2e/features/auth/login.feature`
- **Scenario**: "Login fails with invalid TOTP code"
- **Coverage**: Error handling for invalid TOTP codes
- **Status**: ✅ Automated
- **Last Updated**: 2026-01-14

**Gherkin**:
```gherkin
@AUTH-LOGIN-TC-002 @smoke @critical
Scenario: Login fails with invalid TOTP code
  Given I am on the login page
  When I enter valid admin credentials
  And I submit the login form
  Then I should see the TOTP verification step
  When I enter an invalid TOTP code "000000"
  And I submit the TOTP verification
  Then I should see an error message
  And I should remain on the TOTP verification step
```

**Notes**: Tests error handling and user feedback

### Test: Login Fails with Incorrect Password
- **Test Case ID**: `@AUTH-LOGIN-TC-003`
- **Feature File**: `e2e/features/auth/login.feature`
- **Scenario**: "Login fails with incorrect password"
- **Coverage**: Password validation and error handling
- **Status**: ✅ Automated
- **Last Updated**: 2026-01-14

### Test: Login Form Validation
- **Test Case ID**: `@AUTH-LOGIN-TC-004`
- **Feature File**: `e2e/features/auth/login.feature`
- **Scenario**: "Login form validation for empty fields"
- **Coverage**: HTML5 form validation
- **Status**: ✅ Automated
- **Last Updated**: 2026-01-14

## Pending Test Cases

### Test: TOTP Setup Flow
- **Coverage**: New user TOTP setup with QR code
- **Status**: ⏳ Pending
- **Priority**: Medium

### Test: Google OAuth Login
- **Coverage**: Google sign-in flow (bypasses TOTP)
- **Status**: ⏳ Pending
- **Priority**: Low

### Test: Session Expiration
- **Coverage**: Session timeout and re-authentication
- **Status**: ⏳ Pending
- **Priority**: Low

## Manual Test References
- Manual test cases documented in: `docs/test-cases/manual/auth/`

## Test Data Requirements
- Admin user with TOTP enabled
- TOTP secret stored in `.env.local` as `TEST_USER_ADMIN_TOTP_SECRET`
- User must exist in database with verified TOTP factor

## Page Objects
- **LoginPage**: `e2e/src/pages/auth/LoginPage.ts`
  - Handles complete login flow
  - TOTP code generation
  - Multi-step navigation

## Step Definitions
- **auth-steps.ts**: `e2e/src/steps/auth-steps.ts`
  - Implements all Gherkin steps
  - Includes Sandwich Method for DB verification
