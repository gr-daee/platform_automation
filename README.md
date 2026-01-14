# DAEE Platform Automation

End-to-end test automation framework for the DAEE SaaS ERP platform using Playwright with BDD (Cucumber).

## Tech Stack

- **Playwright**: Browser automation framework
- **playwright-bdd**: BDD/Cucumber integration for Playwright
- **monocart-reporter**: Rich HTML test reporting
- **otpauth**: TOTP generation for MFA authentication
- **pg**: PostgreSQL client for database verification
- **TypeScript**: Type-safe test development

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Access to DAEE test environment
- Test user credentials with TOTP secrets

### Installation

```bash
npm install
npx playwright install
```

### Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your test environment details:
   - Database connection (Supabase)
   - Test user credentials (email + TOTP secret)
   - Base URL for test environment

### Running Tests

The framework supports three execution modes optimized for different use cases:

**Production Mode (Default - for regression/smoke runs):**
```bash
# Run all tests (parallel execution)
npm run test:regression

# Run smoke tests only
npm run test:smoke

# Run critical tests only
npm run test:critical

# Run weekly test suite
npm run test:weekly
```

**Debug Mode (for investigating failures):**
```bash
# Debug specific test (headless, single worker)
npm run test:debug -- --grep "Login fails with invalid TOTP code"

# Debug with browser visible
npm run test:debug:headed -- --grep "@AUTH-LOGIN-TC-002"
```

**Development Mode (for writing new tests):**
```bash
# Develop tests for a module (browser visible, single worker)
npm run test:dev -- e2e/features/auth/

# Develop specific feature
npm run test:dev -- e2e/features/auth/login.feature
```

**Other Commands:**
```bash
# Run with browser visible
npm run test:headed

# Open Playwright UI (interactive)
npm run test:ui

# Debug mode (Playwright Inspector)
npm run test:debug

# Debug mode (capture screenshots at every step)
DEBUG_MODE=true npm test

# View test report
npm run test:report
```

**📖 For detailed execution mode guide, see**: [Test Execution Guide](docs/framework/usage/TEST_EXECUTION.md)

### Running Individual Tests

You can run specific tests using the following commands:

```bash
# Run a specific feature file
npm run test:feature -- e2e/features/auth/login.feature

# Run a specific scenario by name (use quotes for multi-word names)
npm run test:scenario -- "Successful login with valid TOTP for Admin user"

# Run a test by test case ID tag
npm run test:tc -- "@AUTH-LOGIN-TC-001"

# Run multiple scenarios matching a pattern
npm run test:scenario -- "Login fails"

# Run all tests with a specific tag
npm run test:tc -- "@smoke"
```

**Examples:**
- `npm run test:feature -- e2e/features/auth/login.feature` - Runs all scenarios in login feature
- `npm run test:scenario -- "Login fails with invalid TOTP code"` - Runs specific scenario
- `npm run test:tc -- "@AUTH-LOGIN-TC-002"` - Runs test case TC-002
- `npm run test:tc -- "@critical"` - Runs all critical tests

## Debug Mode

The framework supports a comprehensive debug mode that captures screenshots, logs, and transaction information at every step.

### Enabling Debug Mode

Set the `DEBUG_MODE` environment variable to `true`:

```bash
DEBUG_MODE=true npm test login
```

### Debug Mode Features

When `DEBUG_MODE=true`:
- **Screenshots**: Captured at every step (Given/When/Then)
- **Video**: Full video recording enabled
- **Trace**: Complete execution trace
- **Logging**: Verbose DEBUG-level logging
- **Transaction IDs**: Automatically extracted and logged

### Normal Mode (Default)

When `DEBUG_MODE=false` or unset:
- Screenshots only on failure
- Video only on failure
- Trace only on retry
- Standard INFO-level logging

### Configuration

Add to your `.env.local`:

```env
DEBUG_MODE=false                    # Set to 'true' for debug mode
DEBUG_SCREENSHOT_PATH=test-results/debug-screenshots  # Custom screenshot path
DEBUG_LOG_LEVEL=INFO                # DEBUG, INFO, WARN, ERROR
```

See [Environment Setup Guide](docs/framework/setup/ENV_SETUP_GUIDE.md) for details.

### Transaction ID Extraction

The framework automatically extracts transaction IDs from:
- UI elements (data attributes, text content)
- URL parameters
- API responses (when intercepted)

Example usage in step definitions:
```typescript
const transactionId = await transactionExtractor.extractTransactionId(page);
if (transactionId) {
  testContext.addTransactionId(transactionId);
}
```

## Framework Architecture

```
platform_automation/
├── e2e/
│   ├── .auth/              # Pre-authenticated storage states
│   ├── features/           # Gherkin feature files
│   │   └── auth/
│   │       └── login.feature
│   ├── fixtures/           # Test data files
│   └── src/
│       ├── pages/          # Page Object Models
│       │   └── auth/
│       │       └── LoginPage.ts
│       ├── steps/          # Step definitions
│       │   └── auth-steps.ts
│       └── support/        # Utilities and helpers
│           ├── global.setup.ts
│           └── db-helper.ts
├── .env.local              # Local environment config (git-ignored)
├── .env.example            # Example configuration
├── playwright.config.ts    # Playwright configuration
└── package.json
```

## Testing Standards

- **BDD Approach**: Features written in Gherkin syntax
- **Semantic Locators**: Use `getByRole`, `getByPlaceholder`, avoid CSS selectors
- **Sandwich Method**: DB verification before/after UI actions
- **Read-Only DB**: No data cleanup, use `AUTO_QA_` prefixes for test data
- **Pre-Authentication**: Global setup creates authenticated sessions

## Environment Variables

See `.env.example` for all available configuration options. Key variables:

- `TEST_BASE_URL`: Application URL (default: http://localhost:3000)
- `TEST_USER_ADMIN_EMAIL`: Admin user email
- `TEST_USER_ADMIN_TOTP_SECRET`: Admin user TOTP secret (Base32)
- `SUPABASE_DB_*`: Database connection details

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Documentation Index](docs/README.md)** - Main documentation hub
- **[Setup Guide](docs/framework/setup/SETUP_GUIDE.md)** - Getting started
- **[Environment Setup](docs/framework/setup/ENV_SETUP_GUIDE.md)** - Configuration guide
- **[Test Execution Guide](docs/framework/usage/TEST_EXECUTION.md)** - Execution modes (production/debug/development)
- **[Module Documentation](docs/modules/)** - Module-specific knowledge and test cases

## Contributing

Follow the standards defined in `.cursor/rules/`:
- `sqa-standards.mdc`: Automation standards and best practices
- `sqa-generator.mdc`: Guidelines for generating POMs and steps
- `context-awareness.mdc`: Context-aware test generation requirements
- `docs-management.mdc`: Documentation maintenance standards

**Before creating tests:**
1. Read module knowledge: `docs/modules/[module]/knowledge.md`
2. Check existing tests: `docs/modules/[module]/test-cases.md`
3. Review source code: `../web_app/src/app/[module]/`
4. Follow established patterns

## Support

For issues or questions:
- Check [Documentation](docs/README.md)
- Review [Setup Guide](docs/framework/setup/SETUP_GUIDE.md)
- Contact the DAEE QA team
