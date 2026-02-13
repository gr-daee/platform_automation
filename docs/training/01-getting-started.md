# 01 - Getting Started

**Estimated Time**: 2 hours

**Prerequisites**: None (this is your starting point!)

---

## Learning Objectives

By the end of this module, you will:
- ✅ Set up the development environment
- ✅ Run your first test successfully
- ✅ Understand the project structure
- ✅ Verify your setup is working correctly

---

## Step 1: Environment Setup (30 minutes)

### 1.1 Install Prerequisites

**Required Software**:
```bash
# Node.js (v18 or higher)
node --version  # Should show v18.x.x or higher

# npm (comes with Node.js)
npm --version   # Should show 9.x.x or higher

# Git
git --version   # Any recent version
```

**Install Node.js** (if needed):
- Download from: https://nodejs.org/
- Choose LTS (Long Term Support) version

### 1.2 Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd platform_automation

# Verify you're in the correct directory
ls -la
# Should see: e2e/, docs/, package.json, playwright.config.ts
```

### 1.3 Install Dependencies

```bash
# Install npm packages
npm install

# Install Playwright browsers
npx playwright install

# Verify installation
npm run --version
```

**Expected Output**: No errors, all packages installed successfully.

---

## Step 2: Environment Configuration (20 minutes)

### 2.1 Copy Environment File

```bash
# Copy example environment file
cp .env.example .env.local

# Open .env.local in your editor
```

### 2.2 Configure Environment Variables

**Update `.env.local`** with your credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Database Configuration (for Sandwich Method)
DATABASE_URL=postgresql://user:password@host:5432/database

# Test User Credentials (provided by team lead)
IACS_MD_USER_EMAIL=user@example.com
IACS_MD_USER_PASSWORD=your-password
IACS_MD_USER_TOTP_SECRET=your-totp-secret

# Test Execution Mode (default: production)
TEST_EXECUTION_MODE=development
```

**Important**: Never commit `.env.local` to Git (it's in `.gitignore`).

### 2.3 Verify Configuration

```bash
# Check environment variables are loaded
node -e "require('dotenv').config({ path: '.env.local' }); console.log('SUPABASE_URL:', process.env.SUPABASE_URL)"
```

**Expected Output**: Your Supabase URL should be printed.

---

## Step 3: Run Your First Test (30 minutes)

### 3.1 Generate BDD Files

```bash
# Generate Playwright spec files from Gherkin feature files
npm run bdd:generate
```

**What this does**: Converts `.feature` files to `.spec.js` files that Playwright can execute.

**Expected Output**:
```
✔ BDD files generated successfully
Generated: .features-gen/e2e/features/o2c/indents.feature.spec.js
```

### 3.2 Run a Single Test (Development Mode)

```bash
# Run indent creation test in development mode
npm run test:dev -- --grep "@O2C-INDENT-TC-012"
```

**What happens**:
1. Test runs in headed mode (you see the browser)
2. Test executes step by step
3. Monocart report auto-opens after completion
4. You see videos, screenshots, traces

**Expected Output**:
```
Running 1 test using 1 worker

  ✓ [iacs-md] › indents.feature.spec.js:12:5 › O2C Indent Management › User searches and selects dealer (15s)

  1 passed (15s)

📊 ===== OPENING MONOCART REPORT =====
```

### 3.3 Explore the Report

**Monocart Report** should open automatically in your browser.

**What to look for**:
- ✅ Test passed (green checkmark)
- 📹 Video recording of test execution
- 📸 Screenshots at each step
- 🔍 Trace viewer link (click to see detailed timeline)
- 📊 Network requests and metrics

**Exercise**: Click on the trace viewer link and explore the timeline.

---

## Step 4: Understand Project Structure (30 minutes)

### 4.1 Directory Layout

```
platform_automation/
├── e2e/                          # Test automation code
│   ├── features/                 # Gherkin feature files
│   │   ├── o2c/                  # O2C module features
│   │   │   └── indents.feature   # Indent management scenarios
│   │   └── shared/               # Shared feature files
│   ├── src/
│   │   ├── pages/                # Page Object Models
│   │   │   └── o2c/
│   │   │       └── IndentsPage.ts
│   │   ├── steps/                # Step definitions
│   │   │   ├── o2c/
│   │   │   │   └── indent-steps.ts
│   │   │   └── shared/
│   │   │       └── auth-background-steps.ts
│   │   ├── support/              # Support utilities
│   │   │   ├── base/             # BasePage, BaseComponent
│   │   │   ├── components/       # Component library
│   │   │   ├── data/             # TestDataLocator
│   │   │   ├── db-helper.ts      # Database utilities
│   │   │   ├── global.setup.ts   # Pre-test setup
│   │   │   └── global.teardown.ts # Post-test cleanup
│   │   └── fixtures/             # Test data files
│   └── .auth/                    # Saved authentication states
├── docs/                         # Documentation
│   ├── framework/                # Framework docs
│   ├── modules/                  # Module-specific docs
│   ├── knowledge-base/           # Cross-module knowledge
│   └── training/                 # Training materials (you are here!)
├── .cursor/                      # Cursor AI rules
│   └── rules/
│       └── sr-automation-engineer-persona.mdc
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Dependencies and scripts
└── .env.local                    # Environment variables (not in Git)
```

### 4.2 Key Files to Know

**Configuration**:
- `playwright.config.ts`: Test runner configuration (projects, reporters, timeouts)
- `.env.local`: Environment variables (credentials, URLs)
- `package.json`: npm scripts and dependencies

**Test Code**:
- `e2e/features/[module]/[feature].feature`: Gherkin scenarios (business-readable)
- `e2e/src/steps/[module]/[feature]-steps.ts`: Step implementations (code)
- `e2e/src/pages/[module]/[Page]Page.ts`: Page Object Models (UI abstraction)

**Documentation**:
- `docs/modules/[module]/knowledge.md`: Module-specific knowledge
- `docs/modules/[module]/test-cases.md`: Test inventory
- `docs/knowledge-base/`: Cross-module documentation

### 4.3 Explore a Feature File

**Open**: `e2e/features/o2c/indents.feature`

```gherkin
Feature: O2C Indent Management

  Background:
    Given I am logged in to the Application

  @O2C-INDENT-TC-012 @smoke @p1 @iacs-md
  Scenario: User searches and selects dealer from Create Indent modal
    Given I am on the indents page
    When I click the "Create Indent" button
    And I search for dealer by name "VAYUPUTRA AGENCIES"
    And I select the dealer from search results
    Then the dealer should be selected in the form
```

**Notice**:
- `Feature`: High-level description
- `Background`: Common setup for all scenarios
- `@Tags`: Test case ID, type, priority, user
- `Scenario`: Specific test case
- `Given/When/Then`: Test steps in business language

---

## Step 5: Verify Your Setup (10 minutes)

### 5.1 Run Smoke Tests

```bash
# Run all smoke tests
npm run test:smoke
```

**Expected Output**: All smoke tests should pass.

### 5.2 Check Reports

**Monocart Report** (dev/debug mode):
```bash
npm run test:report:monocart
```

**Playwright HTML Report** (always available):
```bash
npm run test:report
```

### 5.3 Verify BDD Generation

```bash
# Regenerate BDD files
npm run bdd:generate

# Check generated files
ls -la .features-gen/e2e/features/o2c/
```

**Expected**: `.spec.js` files should be generated for each `.feature` file.

---

## Hands-On Exercise (30 minutes)

### Exercise 1: Run a Test and Explore Report

1. Run the indent test:
   ```bash
   npm run test:dev -- --grep "@O2C-INDENT-TC-012"
   ```

2. When Monocart report opens:
   - Watch the video recording
   - Click through screenshots
   - Open the trace viewer
   - Explore network requests

3. Answer these questions:
   - How long did the test take?
   - How many screenshots were captured?
   - What was the final URL after test completion?

### Exercise 2: Explore Project Structure

1. Open `e2e/features/o2c/indents.feature`
2. Find the scenario with tag `@O2C-INDENT-TC-012`
3. Open `e2e/src/steps/o2c/indent-steps.ts`
4. Find the step definition for "I search for dealer by name"
5. Open `e2e/src/pages/o2c/IndentsPage.ts`
6. Find the `searchDealerByName` method

**Question**: How does the feature file connect to the step definition and page object?

### Exercise 3: Run Tests in Different Modes

1. **Development mode** (headed, Monocart report):
   ```bash
   npm run test:dev -- --grep "@O2C-INDENT-TC-012"
   ```

2. **Debug mode** (sequential, full capture):
   ```bash
   npm run test:debug -- --grep "@O2C-INDENT-TC-012"
   ```

3. **Production mode** (headless, Allure report):
   ```bash
   npm run test:regression -- --grep "@O2C-INDENT-TC-012"
   npm run test:report:allure:open
   ```

**Compare**: What differences do you notice between modes?

---

## Troubleshooting

### Issue: "npm install" fails
**Solution**: 
- Check Node.js version: `node --version` (should be v18+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then retry

### Issue: "Playwright browsers not installed"
**Solution**:
```bash
npx playwright install
```

### Issue: "Environment variables not loaded"
**Solution**:
- Verify `.env.local` exists
- Check file has correct format (KEY=value, no spaces around =)
- Restart terminal after creating `.env.local`

### Issue: "Test fails with authentication error"
**Solution**:
- Verify credentials in `.env.local` are correct
- Check TOTP secret is valid
- Run `npm run test:setup` to regenerate auth states

### Issue: "Monocart report doesn't open"
**Solution**:
```bash
# Manually open report
npm run test:report:monocart

# Or open file directly
open monocart-report/index.html
```

---

## Checklist: Setup Complete ✅

Before moving to the next module, verify:

- [ ] Node.js and npm installed
- [ ] Repository cloned and dependencies installed
- [ ] `.env.local` configured with credentials
- [ ] First test runs successfully
- [ ] Monocart report opens and displays results
- [ ] Project structure understood
- [ ] Hands-on exercises completed

---

## Next Steps

**Ready for more?** Continue to [02-framework-architecture.md](./02-framework-architecture.md) to learn about BDD, POM, and the Sandwich Method.

**Need help?** Review the troubleshooting section or ask your team lead.

---

## Quick Reference

**Common Commands**:
```bash
# Install dependencies
npm install

# Generate BDD files
npm run bdd:generate

# Run tests (development mode)
npm run test:dev

# Run tests (debug mode)
npm run test:debug

# Run tests (production mode)
npm run test:regression

# Open Monocart report
npm run test:report:monocart

# Open Allure report
npm run test:report:allure:open

# Open Playwright HTML report
npm run test:report
```

**Key Directories**:
- `e2e/features/`: Gherkin feature files
- `e2e/src/pages/`: Page Object Models
- `e2e/src/steps/`: Step definitions
- `docs/training/`: Training materials
