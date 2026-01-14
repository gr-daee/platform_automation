# Authentication Module - Application Knowledge

## Overview
The Authentication module handles user login, TOTP MFA setup and verification, and session management for the DAEE platform.

## Key Components

### LoginPage Component
- **Location**: `../web_app/src/app/login/page.tsx`
- **Purpose**: Main login entry point, handles authentication flow
- **Key Behavior**: 
  - Checks existing user session
  - Redirects based on TOTP status
  - Handles Google OAuth users (bypasses TOTP)

### AnimatedLoginFlow Component
- **Location**: `../web_app/src/app/login/components/AnimatedLoginFlow.tsx`
- **Purpose**: Multi-step login UI with animations
- **Steps**:
  1. Login (email/password)
  2. TOTP Setup (for new users)
  3. TOTP Verification (for existing users)
  4. Success/Redirect

### Key UI Elements
- Email input: `input#email`
- Password input: `input#password` with visibility toggle
- Sign In button: `button` with text "Sign In"
- TOTP code input: `input#totp-code` (setup) or `input#verify-code` (verification)
- Verify buttons: "Verify & Enable" (setup) or "Verify Code" (verification)

## Business Rules

### Authentication Flow
1. User enters email/password
2. System checks if user has TOTP factor:
   - **No TOTP**: Redirects to setup flow
   - **Unverified TOTP**: Continues setup to complete verification
   - **Verified TOTP**: Requires verification code
3. Google OAuth users bypass TOTP entirely
4. Successful authentication redirects to `/notes`

### TOTP Requirements
- All non-Google users MUST have TOTP enabled
- TOTP secret is Base32 encoded (A-Z, 2-7)
- TOTP codes are 6 digits, 30-second period
- TOTP verification required for AAL2 (Multi-Factor Authentication)

### Session Management
- Sessions stored in `auth.sessions` table
- AAL levels:
  - `aal1`: Single-factor (email/password only)
  - `aal2`: Multi-factor (email/password + TOTP)
- Active sessions tracked with `aal` field

## Database Schema

### auth.users
- `id`: UUID (primary key)
- `email`: Text (unique)
- `created_at`: Timestamp
- `last_sign_in_at`: Timestamp
- `app_metadata`: JSONB (includes provider info)
- `identities`: JSONB (OAuth provider info)

### auth.mfa_factors
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `factor_type`: Text ('totp')
- `status`: Text ('unverified' | 'verified')
- `secret`: Text (Base32 TOTP secret)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### auth.sessions
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `aal`: Text ('aal1' | 'aal2')
- `factor_id`: UUID (foreign key to auth.mfa_factors)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## API Endpoints

### POST /api/auth/login
- **Purpose**: Email/password authentication
- **Request**: `{ email: string, password: string }`
- **Response**: `{ success: boolean, requiresTOTP: boolean, factorId?: string }`
- **Errors**: Invalid credentials, account locked

### POST /api/auth/totp/verify
- **Purpose**: Verify TOTP code
- **Request**: `{ factorId: string, code: string }`
- **Response**: `{ success: boolean, session: Session }`
- **Errors**: Invalid code, expired code

### GET /api/totp-status
- **Purpose**: Check user's TOTP setup status
- **Response**: `{ totpEnabled: boolean, isGoogleUser: boolean }`

## Test Patterns

### Login Flow Pattern
1. Navigate to `/login`
2. Fill email and password
3. Submit login form
4. Wait for TOTP step
5. Generate TOTP code using `otpauth` library
6. Enter and verify TOTP
7. Assert redirect to `/notes`

### Sandwich Method Pattern
1. **DB BEFORE**: Query user's auth state
2. **UI ACTION**: Perform login
3. **DB AFTER**: Verify session created with AAL2

### TOTP Generation Pattern
```typescript
const totp = new TOTP.TOTP({
  issuer: 'DAEE',
  label: email,
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  secret: totpSecret, // Base32 string
});
const code = totp.generate();
```

## Related Modules
- **RBAC**: Authentication determines user roles and permissions
- **Notes**: Default redirect after successful authentication

## Known Issues / Gaps
- TOTP setup can be interrupted if user closes browser
- Unverified TOTP factors need cleanup
- Google OAuth users don't require TOTP (by design)

## Test Coverage
- ✅ Successful login with TOTP
- ✅ Login with invalid TOTP
- ✅ Login with incorrect password
- ✅ Form validation
- ⏳ TOTP setup flow (pending)
- ⏳ Google OAuth flow (pending)
