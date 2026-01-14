# Environment Variables Setup Guide

## Quick Start

```bash
# Step 1: Copy the template
cp .env.local.TEMPLATE .env.local

# Step 2: Edit with your values
nano .env.local
# or
code .env.local

# Step 3: Verify it works
npm test
```

## Required Variables

### 🗄️ Database Connection

| Variable | Example | Where to Find |
|----------|---------|---------------|
| `SUPABASE_DB_HOST` | `db.abc123xyz.supabase.co` | Supabase Dashboard → Project Settings → Database |
| `SUPABASE_DB_PORT` | `5432` | Default PostgreSQL port |
| `SUPABASE_DB_NAME` | `postgres` | Default database name |
| `SUPABASE_DB_USER` | `postgres` | Default user |
| `SUPABASE_DB_PASSWORD` | `your_password_here` | From Supabase project creation |

**How to get database credentials:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon) → **Database**
4. Find **Connection string** section
5. Use **Connection pooler** mode for better stability
6. Extract values from the connection string

Example connection string:
```
postgresql://postgres.abc123xyz:[YOUR-PASSWORD]@db.abc123xyz.supabase.co:5432/postgres
               ↑                    ↑                    ↑               ↑        ↑
           DB_USER            DB_PASSWORD          DB_HOST           DB_PORT  DB_NAME
```

### 🌐 Test Environment

| Variable | Example | Description |
|----------|---------|-------------|
| `TEST_BASE_URL` | `http://localhost:3000` | Where your app is running |
| `TEST_ENV` | `local` or `staging` | Environment identifier |

**Common values:**
- **Local development**: `http://localhost:3000`
- **Vercel staging**: `https://your-app-staging.vercel.app`
- **Custom staging**: `https://staging.yourdomain.com`

### 🐛 Debug Mode Configuration

| Variable | Example | Description |
|----------|---------|-------------|
| `DEBUG_MODE` | `false` or `true` | Enable debug mode (screenshots at every step) |
| `DEBUG_SCREENSHOT_PATH` | `test-results/debug-screenshots` | Custom path for debug screenshots |
| `DEBUG_LOG_LEVEL` | `INFO` | Log level: DEBUG, INFO, WARN, ERROR |
| `DEBUG_LOG_FILE` | `test-results/debug.log` | Optional: path to log file |

**Debug Mode Behavior:**
- When `DEBUG_MODE=true`:
  - Screenshots captured at **every step** (Given/When/Then)
  - Full video recording enabled
  - Complete trace enabled
  - Verbose logging (DEBUG level)
- When `DEBUG_MODE=false` (default):
  - Screenshots only on failure
  - Video only on failure
  - Trace only on retry
  - Standard logging (INFO level)

**Usage:**
```bash
# Normal mode (default)
npm test login

# Debug mode
DEBUG_MODE=true npm test login
```

### ⚙️ Test Execution Mode Configuration

| Variable | Example | Description |
|----------|---------|-------------|
| `TEST_EXECUTION_MODE` | `production`, `debug`, `development` | Execution mode (default: `production`) |
| `TEST_WORKERS` | `auto`, `4`, `50%` | Number of parallel workers (default: `auto`) |
| `TEST_HEADED` | `true`, `false` | Show browser window (default: `false`) |

**Execution Modes:**

1. **Production Mode** (`TEST_EXECUTION_MODE=production`):
   - Default mode for regression, smoke, and scheduled runs
   - Parallel execution with auto workers (50% of CPU cores)
   - Headless browser
   - Use: `npm run test:regression`, `npm run test:smoke`

2. **Debug Mode** (`TEST_EXECUTION_MODE=debug`):
   - For investigating failures and debugging
   - Single worker (sequential execution)
   - Optional headed mode
   - Use: `npm run test:debug`, `npm run test:debug:headed`

3. **Development Mode** (`TEST_EXECUTION_MODE=development`):
   - For writing and developing new tests
   - Single worker (sequential execution)
   - Always headed (browser visible)
   - Use: `npm run test:dev`

**Worker Configuration:**
- `auto` (default): Playwright uses 50% of CPU cores
- Number (e.g., `4`): Specific number of workers
- Percentage (e.g., `50%`): Percentage of CPU cores

**Usage:**
```bash
# Production mode (default)
npm run test:regression

# Debug mode
npm run test:debug -- --grep "Login fails"

# Development mode
npm run test:dev -- e2e/features/auth/

# Custom worker count
TEST_WORKERS=4 npm run test:regression
```

**📖 For detailed execution mode guide, see**: [TEST_EXECUTION.md](../usage/TEST_EXECUTION.md)

### 👤 Test User Credentials (Multi-Tenant Pattern)

**Pattern**: `TEST_[TENANT]_[ROLE]_[FIELD]`

| Variable Pattern | Example | Description |
|-----------------|---------|-------------|
| `TEST_[TENANT]_[ROLE]_EMAIL` | `TEST_PRIMARY_ADMIN_EMAIL=admin@primary.com` | User email address |
| `TEST_[TENANT]_[ROLE]_PASSWORD` | `TEST_PRIMARY_ADMIN_PASSWORD=SecurePass123!` | User password |
| `TEST_[TENANT]_[ROLE]_TOTP_SECRET` | `TEST_PRIMARY_ADMIN_TOTP_SECRET=JBSWY3DPEHPK3PXP` | Base32 TOTP secret |

**Tenant Identifiers**: `PRIMARY`, `SECONDARY`, `TENANT1`, `TENANT2`, etc.  
**Roles**: `ADMIN`, `DEALER`, `ACCOUNTANT`, `SALES_MANAGER`, etc.

**Example - Primary Tenant Admin**:
```env
TEST_PRIMARY_ADMIN_EMAIL=admin@primary.com
TEST_PRIMARY_ADMIN_PASSWORD=SecurePass123!
TEST_PRIMARY_ADMIN_TOTP_SECRET=JBSWY3DPEHPK3PXP
```

**Example - Secondary Tenant Dealer**:
```env
TEST_SECONDARY_DEALER_EMAIL=dealer@secondary.com
TEST_SECONDARY_DEALER_PASSWORD=DealerPass123!
TEST_SECONDARY_DEALER_TOTP_SECRET=DEALER_SECRET_HERE
```

**⚠️ CRITICAL: Users must already exist in database with TOTP enabled!**

**📖 For detailed multi-tenant organization standards, see**: [ENV_VARIABLE_ORGANIZATION.md](ENV_VARIABLE_ORGANIZATION.md)

## How to Get TOTP Secret

### Method 1: During Initial Setup

When you set up TOTP for the first time:

1. Log into the app with your test user
2. Navigate to the TOTP setup page
3. A QR code will be displayed
4. **Below the QR code**, you'll see a text string like:

```
Manual entry code: JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP
```

5. Copy this string → This is your `TOTP_SECRET`

### Method 2: Extract from Database (Advanced)

If you have database access:

```sql
SELECT 
  u.email,
  f.secret
FROM auth.users u
JOIN auth.mfa_factors f ON u.id = f.user_id
WHERE u.email = 'your.admin@example.com'
  AND f.factor_type = 'totp'
  AND f.status = 'verified';
```

The `secret` column contains the Base32 TOTP secret.

### Method 3: Reset and Re-setup

If you lost the secret:

1. Delete the existing TOTP factor from the database (or via app)
2. Log into the app
3. Go through TOTP setup again
4. This time, save the secret shown below the QR code

## TOTP Secret Format

**Valid Format:**
- Characters: `A-Z` and `2-7` only
- No: `0`, `1`, `8`, `9`, lowercase letters
- Length: 16-32 characters (typically 32)
- Example: `JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP`

**Invalid Examples:**
❌ `jbswy3dpehpk3pxp` (lowercase - must be uppercase)
❌ `JBSWY3DPEHPK3PX0` (contains 0 - invalid in Base32)
❌ `123456` (numbers only - not Base32)

## Example .env.local File

```bash
# Database (from Supabase)
SUPABASE_DB_HOST=db.abcdefghijklmnop.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=MySup3rS3cur3P@ssw0rd!

# Test Environment
TEST_BASE_URL=http://localhost:3000
TEST_ENV=local

# Test Execution Mode (optional - defaults to production)
TEST_EXECUTION_MODE=production
TEST_WORKERS=auto
TEST_HEADED=false

# Primary Tenant - Admin User (must exist in DB with TOTP enabled)
TEST_PRIMARY_ADMIN_EMAIL=admin@primary.com
TEST_PRIMARY_ADMIN_PASSWORD=AdminPass123!
TEST_PRIMARY_ADMIN_TOTP_SECRET=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP

# Secondary Tenant - Admin User (optional, for multi-tenant testing)
# TEST_SECONDARY_ADMIN_EMAIL=admin@secondary.com
# TEST_SECONDARY_ADMIN_PASSWORD=AdminPass456!
# TEST_SECONDARY_ADMIN_TOTP_SECRET=SECONDARY_SECRET_HERE
```

## Testing Your Configuration

### Test 1: Database Connection

```bash
node -e "
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

console.log('Testing database connection...');
pool.query('SELECT 1 as test')
  .then(() => console.log('✅ Database connection successful!'))
  .catch(err => console.error('❌ Database connection failed:', err.message))
  .finally(() => pool.end());
"
```

### Test 2: TOTP Code Generation

```bash
node -e "
const TOTP = require('otpauth').TOTP;
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

try {
  const totp = new TOTP({
    secret: process.env.TEST_USER_ADMIN_TOTP_SECRET,
    digits: 6,
    period: 30
  });
  
  const code = totp.generate();
  console.log('✅ TOTP code generated:', code);
  console.log('👉 Try logging in with this code in your app');
} catch (err) {
  console.error('❌ TOTP generation failed:', err.message);
  console.error('Check if TOTP_SECRET is in correct Base32 format');
}
"
```

### Test 3: User Exists in Database

```bash
node -e "
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

pool.query(
  'SELECT id, email, created_at FROM auth.users WHERE email = \$1',
  [process.env.TEST_USER_ADMIN_EMAIL]
)
  .then(result => {
    if (result.rows.length > 0) {
      console.log('✅ User found:', result.rows[0]);
    } else {
      console.error('❌ User not found! Create this user first.');
    }
  })
  .catch(err => console.error('❌ Query failed:', err.message))
  .finally(() => pool.end());
"
```

## Troubleshooting

### Error: "Database connection failed"

**Possible causes:**
1. Wrong `SUPABASE_DB_PASSWORD`
2. IP address not allowed in Supabase
3. Wrong `SUPABASE_DB_HOST`

**Solutions:**
- Double-check password in Supabase dashboard
- Disable IP restrictions in Supabase (for testing)
- Use connection pooler URL (has `.supabase.co` domain)

### Error: "User not found in database"

**Solution:** Create the user first:
1. Log into your app's signup page
2. Create an account with the email from `TEST_USER_ADMIN_EMAIL`
3. Set up TOTP MFA
4. Save the TOTP secret to `.env.local`

### Error: "TOTP verification failed"

**Possible causes:**
1. Wrong TOTP secret
2. Secret not in Base32 format
3. System clock out of sync

**Solutions:**
- Re-copy the TOTP secret from app setup
- Ensure it's uppercase A-Z and 2-7 only
- Sync your system clock: `sudo ntpdate time.apple.com` (macOS)

### Error: "Admin credentials missing from .env.local"

**Solution:** Ensure all required variables are set:
```bash
grep -E "^TEST_USER_ADMIN" .env.local
```

Should show:
```
TEST_USER_ADMIN_EMAIL=...
TEST_USER_ADMIN_PASSWORD=...
TEST_USER_ADMIN_TOTP_SECRET=...
```

## Security Best Practices

✅ **DO:**
- Keep `.env.local` git-ignored (already configured)
- Use strong passwords for test users
- Rotate TOTP secrets periodically
- Use separate database for testing (if possible)

❌ **DON'T:**
- Commit `.env.local` to git
- Use production credentials in tests
- Share `.env.local` via email/Slack
- Store passwords in plain text elsewhere

## Next Steps

Once your `.env.local` is configured:

```bash
# Generate BDD test files
npm run bdd:generate

# Run tests with browser visible
npm run test:headed

# View the test report
npm run test:report
```

## Need Help?

- Check [Setup Guide](SETUP_GUIDE.md) for detailed framework setup
- Check [Main Documentation](../../README.md) for general information
- Check [Root README](../../../README.md) for project overview
- Check `.env.example` in project root for variable format reference
