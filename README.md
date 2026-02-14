# DAEE Platform Automation

> End-to-end test automation framework for the DAEE SaaS ERP platform using Playwright with BDD (Cucumber).

[![Playwright](https://img.shields.io/badge/Playwright-v1.48-green)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8-blue)](https://www.typescriptlang.org/)
[![BDD](https://img.shields.io/badge/BDD-Cucumber-brightgreen)](https://cucumber.io/)

---

## ✨ Key Features

- 🎭 **Playwright** browser automation with TypeScript
- 🥒 **BDD/Cucumber** business-readable test scenarios
- 👥 **Multi-User Testing** with pre-authenticated sessions
- 📊 **Conditional Reporting** (Monocart for dev, Allure for production)
- 🔍 **Sandwich Method** database verification
- 🎨 **Component Library** for ShadCN/Radix UI patterns
- 🔐 **MFA Support** with TOTP authentication

---

## 🚀 Quick Start (5 Minutes)

### 1. Prerequisites

- Node.js 18+ installed
- Access to DAEE test environment
- Test user credentials with TOTP secrets

### 2. Installation

```bash
# Clone repository
git clone <repository-url>
cd platform_automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### 3. Configuration

```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local with your credentials
# (Database URL, test user credentials, TOTP secrets)
```

### 4. Run Your First Test

```bash
# Run a smoke test
npm run test:dev -- --grep "@smoke"
```

**Expected**: Browser opens, test runs, Monocart report auto-opens with video recording.

**🎉 Success!** You're ready to start testing.

---

## 📚 Learning Path

### New to the Framework?

Follow this structured learning path:

1. **[Getting Started](docs/training/01-getting-started.md)** (2 hours)
   - Setup environment
   - Run your first test
   - Understand project structure

2. **[Framework Architecture](docs/training/02-framework-architecture.md)** (2 hours)
   - Learn BDD, POM, Sandwich Method
   - Understand multi-user authentication
   - Explore component library

3. **[Running Tests](docs/training/03-running-tests.md)** (2 hours)
   - Master execution modes (dev, debug, production)
   - Navigate reports (Monocart, Allure)
   - Debug failing tests

4. **[Creating Tests](docs/training/04-creating-tests.md)** (2 hours)
   - Follow test creation workflow
   - Write feature files, POMs, step definitions
   - Update documentation

**[📖 View Complete Training Path](docs/training/README.md)**

---

## 🎯 Common Tasks

### Running Tests

```bash
# Development mode (headed, Monocart report, full capture)
npm run test:dev

# Debug mode (sequential, full capture)
npm run test:debug

# Production mode (headless, parallel, Allure report)
npm run test:regression

# Smoke tests only
npm run test:smoke
```

### Viewing Reports

```bash
# Monocart report (dev/debug mode - auto-opens)
npm run test:report:monocart

# Allure report (production mode)
npm run test:report:allure:open

# Playwright HTML report
npm run test:report
```

### Filtering Tests

```bash
# By tag
npm run test:dev -- --grep "@smoke"

# By feature file
npm run test:dev -- e2e/features/o2c/indents.feature

# By test case ID
npm run test:dev -- --grep "@O2C-INDENT-TC-012"

# By project (user)
npm run test:dev -- --project=iacs-md
```

### Creating Tests

```bash
# 1. Create feature file
# e2e/features/[module]/[feature].feature

# 2. Generate BDD files
npm run bdd:generate

# 3. Create Page Object Model
# e2e/src/pages/[module]/[Page]Page.ts

# 4. Create step definitions
# e2e/src/steps/[module]/[feature]-steps.ts

# 5. Run test
npm run test:dev -- --grep "@[TEST-ID]"

# 6. Update documentation
# docs/modules/[module]/test-cases.md
```

**[📖 Detailed Test Creation Guide](docs/training/04-creating-tests.md)**

---

## 📖 Core Concepts

### BDD (Behavior-Driven Development)

Tests written in business-readable Gherkin syntax:

```gherkin
Feature: Order Management

  Background:
    Given I am logged in to the Application

  @O2C-ORDER-TC-001 @smoke @p1 @iacs-md
  Scenario: Create order successfully
    Given I am on the orders page
    When I create a new order with valid data
    Then the order should be created successfully
    And I should see a success message
```

### Page Object Model (POM)

UI elements abstracted into reusable page objects:

```typescript
export class OrdersPage extends BasePage {
  readonly createButton: Locator;
  
  async createOrder(data: OrderData): Promise<void> {
    await this.createButton.click();
    // ... high-level action method
  }
}
```

### Sandwich Method

Database verification before and after UI actions:

```typescript
// 1. DB BEFORE - Query initial state
const countBefore = await getOrderCount();

// 2. UI ACTION - Perform user interaction
await ordersPage.createOrder(orderData);

// 3. DB AFTER - Verify state change
const countAfter = await getOrderCount();
expect(countAfter).toBe(countBefore + 1);
```

### Multi-User Testing (70/30 Split)

- **70% Single-User**: Run once with primary user (happy path, workflows)
- **30% Multi-User**: Run across users (permissions, tenant isolation)

```gherkin
# Single-user test (70%)
@O2C-001 @smoke @iacs-md
Scenario: Create order
  Given I am logged in to the Application
  # Runs ONCE as IACS MD User

# Multi-user test (30%)
@O2C-050 @multi-user @iacs-md @iacs-finance
Scenario Outline: User permissions
  Given I am logged in as "<User>"
  Examples:
    | User            |
    | IACS MD User    |
    | Finance Manager |
  # Runs TWICE (once per user)
```

**[📖 Learn More About Architecture](docs/knowledge-base/architecture.md)**

---

## 📊 Execution Modes & Reports

### Execution Modes

| Mode | Purpose | Browser | Workers | Report | Artifacts |
|------|---------|---------|---------|--------|-----------|
| **Development** | Day-to-day testing | Headed | 1 | Monocart (auto-open) | Full (video, screenshots, traces) |
| **Debug** | Troubleshooting | Headed | 1 (sequential) | Monocart (auto-open) | Full |
| **Production** | CI/CD, regression | Headless | Parallel | Allure + HTML | On failure only |

### Reports

**Monocart (Dev/Debug)**:
- ✅ Video recording
- ✅ Screenshots at every step
- ✅ Trace viewer links
- ✅ Network metrics
- ✅ Auto-opens after tests

**Allure (Production)**:
- ✅ BDD step display
- ✅ Historical trends
- ✅ Step-level attachments
- ✅ Test categories

**[📖 Detailed Reporting Guide](docs/framework/implementation/MONOCART_REPORT.md)**

---

## 🏗️ Project Structure

```
platform_automation/
├── e2e/
│   ├── features/              # Gherkin feature files
│   │   ├── o2c/               # O2C module features
│   │   └── shared/            # Shared features
│   ├── src/
│   │   ├── pages/             # Page Object Models
│   │   ├── steps/             # Step definitions
│   │   │   ├── o2c/           # Module-specific steps
│   │   │   └── shared/        # Reusable steps
│   │   └── support/           # Utilities and helpers
│   │       ├── base/          # BasePage, BaseComponent
│   │       ├── components/    # Component library
│   │       ├── data/          # TestDataLocator
│   │       └── db-helper.ts   # Database utilities
│   └── .auth/                 # Pre-authenticated sessions
├── docs/
│   ├── training/              # Training materials
│   ├── modules/               # Module-specific docs
│   ├── knowledge-base/        # Cross-module knowledge
│   └── framework/             # Framework documentation
├── .cursor/                   # Cursor AI rules
│   └── rules/
│       └── sr-automation-engineer-persona.mdc
├── playwright.config.ts       # Playwright configuration
├── package.json               # Dependencies and scripts
└── .env.local                 # Environment variables (not in Git)
```

---

## 🎨 Tech Stack

- **[Playwright](https://playwright.dev/)** ^1.48.0 - Browser automation
- **[playwright-bdd](https://github.com/vitalets/playwright-bdd)** ^7.5.0 - BDD/Cucumber integration
- **[Monocart Reporter](https://github.com/cenfun/monocart-reporter)** ^2.10.0 - Dev/debug reports
- **[Allure Report 3](https://allurereport.org/)** ^3.4.5 - Production BDD reports
- **[TypeScript](https://www.typescriptlang.org/)** ^5.8.0 - Type-safe development
- **[PostgreSQL (pg)](https://node-postgres.com/)** ^8.13.1 - Database verification
- **[otpauth](https://github.com/hectorm/otpauth)** ^9.3.4 - TOTP/MFA handling

---

## 📋 Command Cheat Sheet

### Test Execution

| Command | Description |
|---------|-------------|
| `npm run test:dev` | Development mode (headed, Monocart) |
| `npm run test:debug` | Debug mode (sequential, full capture) |
| `npm run test:regression` | Production mode (parallel, Allure) |
| `npm run test:smoke` | Smoke tests only |
| `npm run bdd:generate` | Generate BDD spec files |

### Reports

| Command | Description |
|---------|-------------|
| `npm run test:report:monocart` | Open Monocart report |
| `npm run test:report:allure:open` | Open Allure report |
| `npm run test:report` | Open Playwright HTML report |

### Filtering

| Command | Description |
|---------|-------------|
| `npm run test:dev -- --grep "@smoke"` | Run smoke tests |
| `npm run test:dev -- --grep "@O2C-001"` | Run specific test |
| `npm run test:dev -- e2e/features/o2c/` | Run O2C module tests |
| `npm run test:dev -- --project=iacs-md` | Run as specific user |

---

## 📚 Documentation

### Essential Reading

- **[Training Materials](docs/training/README.md)** - Start here for new team members
- **[Framework Architecture](docs/knowledge-base/architecture.md)** - Understand the framework
- **[Database Schema](docs/knowledge-base/database-schema.md)** - Database and test data
- **[Business Rules](docs/knowledge-base/business-rules.md)** - Business logic
- **[Glossary](docs/knowledge-base/glossary.md)** - Terms and definitions

### Framework Documentation

- **[Documentation Index](docs/README.md)** - Main documentation hub
- **[Framework Enhancements](docs/framework-enhancements/README.md)** - Navigation index
- **[Module Documentation](docs/modules/)** - Module-specific knowledge
- **[Cycle (Sprint) Observations](docs/cycle/README.md)** - End-of-cycle learnings and framework updates

### Cursor AI Rules

- **[Sr Automation Engineer Persona](. cursor/rules/sr-automation-engineer-persona.mdc)** - Main AI persona
- **[Automation Patterns](.cursor/rules/automation-patterns.mdc)** - Technical patterns
- **[Framework Workflows](.cursor/rules/framework-workflows.mdc)** - Process workflows

---

## 🤝 Contributing

### Before Creating Tests

1. **Read module knowledge**: `docs/modules/[module]/knowledge.md`
2. **Check existing tests**: `docs/modules/[module]/test-cases.md`
3. **Review source code**: `../web_app/src/app/[module]/`
4. **Follow established patterns**

### Test Creation Workflow

1. Context gathering (read docs, source code)
2. Create feature file (.feature)
3. Generate BDD files (`npm run bdd:generate`)
4. Create Page Object Model (*Page.ts)
5. Create step definitions (*-steps.ts)
6. Run test (`npm run test:dev`)
7. Update documentation (test-cases.md, knowledge.md)

**[📖 Detailed Contributing Guide](docs/training/04-creating-tests.md)**

---

## 🆘 Support

### Getting Help

- **Documentation**: Check [docs/](docs/README.md) for comprehensive guides
- **Training**: Follow [training materials](docs/training/README.md)
- **Team**: Contact DAEE QA team for assistance

### Troubleshooting

**Common Issues**:
- **"npm install" fails**: Check Node.js version (v18+), clear npm cache
- **"Playwright browsers not installed"**: Run `npx playwright install`
- **"Test fails with auth error"**: Verify credentials in `.env.local`
- **"Monocart report doesn't open"**: Run `npm run test:report:monocart`

**[📖 Full Troubleshooting Guide](docs/training/07-debugging-guide.md)**

---

## 🎯 Best Practices

### ✅ Do This

- Use semantic locators (getByRole, getByLabel, getByPlaceholder)
- Use component library for ShadCN/Radix interactions
- Use TestDataLocator for stable prerequisite data
- Prefix test data with `AUTO_QA_${Date.now()}_`
- Implement Sandwich Method for database verification
- Update documentation immediately after creating tests

### ❌ Don't Do This

- CSS class selectors (Tailwind classes change)
- Hardcoded test data (use TestDataLocator)
- Skip documentation updates
- Create tests without reading module knowledge
- Duplicate step definitions

**[📖 Complete Best Practices Guide](docs/training/08-best-practices.md)**

---

## 📈 Framework Health

### Quality Gates

**Before Committing**:
- [ ] Test passes consistently (run 3 times)
- [ ] No linter errors
- [ ] Documentation updated
- [ ] Follows all patterns

**Before PR**:
- [ ] All tests pass in production mode
- [ ] Allure report generated successfully
- [ ] No flaky tests (run 5 times)
- [ ] Module knowledge updated

---

## 📄 License

Internal use only - DAEE Platform

---

## 🚀 Quick Links

- **[Training Path](docs/training/README.md)** - Start here for new team members
- **[Architecture](docs/knowledge-base/architecture.md)** - Framework architecture
- **[Test Creation](docs/training/04-creating-tests.md)** - Create new tests
- **[Debugging](docs/training/07-debugging-guide.md)** - Debug failing tests
- **[Best Practices](docs/training/08-best-practices.md)** - Anti-patterns and quality gates

---

**Ready to start?** Follow the [Quick Start](#-quick-start-5-minutes) guide above, then dive into the [Training Path](docs/training/README.md)!
