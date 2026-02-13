# DAEE Platform Automation - Setup Guide

This guide will help you set up and run the test automation framework for the first time.

## Prerequisites

✅ Node.js 18+ installed  
✅ Access to DAEE test environment  
✅ Test user credentials with TOTP secrets  
✅ Supabase database connection details  

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /Users/goverdhanreddygarudaiah/Documents/GitHub/daee/platform_automation
npm install
npx playwright install
```

This will install:
- Playwright and browser binaries
- playwright-bdd for Cucumber/BDD support
- allure and allure-playwright for Allure Report 3
- otpauth for TOTP generation
- pg for PostgreSQL database access
- TypeScript and type definitions

### 2. Configure Environment Variables

Create `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your actual values:

```env
# Database Connection (from Supabase Project Settings)
SUPABASE_DB_HOST=db.xxxxxxxxxxxx.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_actual_password

# Test Environment
TEST_BASE_URL=http://localhost:3000
TEST_ENV=local

# Admin User (must exist in your database with TOTP enabled)
TEST_USER_ADMIN_EMAIL=your_admin@example.com
TEST_USER_ADMIN_PASSWORD=YourSecurePassword123!
TEST_USER_ADMIN_TOTP_SECRET=YOUR_BASE32_SECRET_HERE
```

**How to get TOTP secret:**
1. Log into the web app with your test user
2. During TOTP setup, you'll see a QR code
3. Below the QR code is a text string (Base32 format)
4. Copy that string to `TEST_USER_ADMIN_TOTP_SECRET`

### 3. Verify Database Connection

Test your database connection:

```bash
node -e "
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST,
  port: 5432,
  database: 'postgres',
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT 1 as test')
  .then(() => console.log('✅ Database connection successful'))
  .catch(err => console.error('❌ Database connection failed:', err.message))
  .finally(() => pool.end());
"
```

### 4. Generate BDD Step Files

playwright-bdd needs to generate TypeScript files from your feature files:

```bash
npm run bdd:generate
```

This creates `.spec.ts` files from `.feature` files.

### 5. Run Tests

Start with a single test to verify everything works:

**Production Mode (Default - for regression/smoke runs):**
```bash
# Run all tests
npm run test:regression

# Run smoke tests only
npm run test:smoke

# Run critical tests only
npm run test:critical
```

**Debug Mode (for investigating failures):**
```bash
# Debug specific test (headless)
npm run test:debug -- --grep "Login fails with invalid TOTP code"

# Debug with browser visible
npm run test:debug:headed -- --grep "@AUTH-LOGIN-TC-002"
```

**Development Mode (for writing new tests):**
```bash
# Develop tests for a module (browser visible)
npm run test:dev -- e2e/features/auth/

# Develop specific feature
npm run test:dev -- e2e/features/auth/login.feature
```

**Other Commands:**
```bash
# Run in headed mode (see browser)
npm run test:headed -- login

# Run in headless mode
npm test login

# Run with UI mode (interactive)
npm run test:ui
```

**📖 For detailed execution mode guide, see**: [TEST_EXECUTION.md](../usage/TEST_EXECUTION.md)

### 6. View Test Reports

After tests complete, you can view:

**Playwright HTML report** (with trace viewer link):
```bash
npm run test:report
```

**Allure Report 3** (steps and attachments):
```bash
npm run test:report:allure
```

Reports show test results, screenshots, execution timeline, and failed test details with traces (Playwright) or step-level attachments (Allure).

## Troubleshooting

### Issue: "Admin credentials missing from .env.local"

**Solution:** Ensure your `.env.local` file has all required variables:
- `TEST_USER_ADMIN_EMAIL`
- `TEST_USER_ADMIN_PASSWORD`
- `TEST_USER_ADMIN_TOTP_SECRET`

### Issue: "Database connection failed"

**Solutions:**
1. Verify your Supabase database credentials
2. Check that your IP is allowed in Supabase (or disable IP restrictions for testing)
3. Ensure you're using the connection pooler URL from Supabase

### Issue: "TOTP verification failed"

**Solutions:**
1. Verify the TOTP secret is correct (Base32 format, no spaces)
2. Ensure system clock is synchronized (TOTP is time-based)
3. Test TOTP generation manually:

```bash
node -e "
const TOTP = require('otpauth').TOTP;
const totp = new TOTP({
  secret: 'YOUR_SECRET_HERE',
  digits: 6,
  period: 30
});
console.log('Current TOTP code:', totp.generate());
"
```

### Issue: "Global setup failed"

**Solutions:**
1. Run global setup in headed mode to see what's happening:
   ```bash
   HEADED=true npm test
   ```
2. Check the screenshot in `e2e/.auth/setup-error.png`
3. Verify the web app is running if testing locally

### Issue: "Cannot find module 'playwright-bdd'"

**Solution:** Run `npm run bdd:generate` before running tests. This is normally done automatically via the `pretest` script.

## Directory Structure

```
platform_automation/
├── e2e/
│   ├── .auth/                     # ⚠️  Git-ignored - authentication states
│   ├── features/                  # 📝 Gherkin feature files
│   │   └── auth/
│   │       └── login.feature
│   ├── fixtures/                  # 📦 Test data files
│   └── src/
│       ├── pages/                 # 🎭 Page Object Models
│       │   └── auth/
│       │       └── LoginPage.ts
│       ├── steps/                 # 🎬 Step definitions
│       │   └── auth-steps.ts
│       └── support/               # 🛠️  Utilities
│           ├── fixtures.ts
│           ├── global.setup.ts
│           └── db-helper.ts
├── allure-results/                # Allure raw results (gitignored)
├── allure-report/                 # Allure HTML report (gitignored)
├── playwright-report/            # Playwright HTML report (gitignored)
├── test-results/                  # 🧪 Test execution results
├── .env.local                     # ⚠️  Git-ignored - your config
├── .env.example                   # 📋 Template configuration
├── playwright.config.ts           # ⚙️  Playwright configuration
└── package.json
```

## Next Steps

Once the first test passes:

1. **Add More Test Users**: Configure additional roles in `.env.local`
   - Dealer user
   - Accountant user
   - Sales Manager user

2. **Create More Features**: Add feature files for other modules
   - O2C (Order-to-Cash) flows
   - Inventory management
   - Reports

3. **Extend Page Objects**: Create POMs for other pages following `LoginPage.ts` pattern

4. **CI/CD Integration**: Set up test execution in your CI pipeline
   - GitHub Actions
   - GitLab CI
   - Jenkins

## Support

For questions or issues:
- Check the [project README](../../../README.md)
- Check the [main documentation](../../README.md)
- Review `.cursor/rules/sqa-standards.mdc` for coding standards
- Review `.cursor/rules/context-awareness.mdc` for test generation guidelines
- Contact the DAEE QA team

Happy Testing! 🚀
