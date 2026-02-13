# Glossary of Terms

## Framework-Specific Terms

### AUTO_QA_ Prefix
**Definition**: Naming convention for test data created via UI.

**Format**: `AUTO_QA_${Date.now()}_[EntityName]`

**Example**: `AUTO_QA_1707234567890_Indent`

**Purpose**: Identify test data for manual cleanup (framework has read-only database access).

**Usage**:
```typescript
const indentName = `AUTO_QA_${Date.now()}_Indent`;
await indentsPage.createIndent({ name: indentName });
```

---

### BDD (Behavior-Driven Development)
**Definition**: Software development approach where tests are written in business-readable language (Gherkin).

**Components**:
- Feature files (.feature): Business scenarios
- Step definitions (*-steps.ts): Implementation code
- Page Objects (*Page.ts): UI interaction layer

**Example**:
```gherkin
Feature: Order Management
  Scenario: Create order successfully
    Given I am logged in to the Application
    When I create a new order
    Then the order should be created successfully
```

---

### bddgen
**Definition**: Command to generate Playwright spec files from Gherkin feature files.

**Command**: `npm run bdd:generate`

**Purpose**: Converts `.feature` files to `.spec.js` files that Playwright can execute.

**When to Run**:
- After creating new feature files
- After modifying Gherkin steps
- After changing tags or parameterized values

---

### Component Library
**Definition**: Reusable abstraction layer for ShadCN/Radix UI components.

**Location**: `e2e/src/support/components/`

**Components**:
- `SelectComponent`: Radix Select/Combobox interactions
- `DialogComponent`: Modal/Dialog handling
- `ToastComponent`: Toast notification verification
- `FormComponent`: Form validation patterns

**Purpose**: Abstract complex ShadCN/Radix interaction patterns (native selectors don't work).

**Example**:
```typescript
await selectComponent.selectByLabel('Category', 'Electronics');
```

---

### Execution Mode
**Definition**: Configuration that determines how tests run and which reports are generated.

**Modes**:
1. **Development** (`TEST_EXECUTION_MODE=development`): Headed, Monocart report
2. **Debug** (`TEST_EXECUTION_MODE=debug`): Sequential, full capture, Monocart report
3. **Production** (`TEST_EXECUTION_MODE=production`): Parallel, headless, Allure report

**Commands**:
- `npm run test:dev` → development mode
- `npm run test:debug` → debug mode
- `npm run test:regression` → production mode

---

### Fixture
**Definition**: Playwright's dependency injection mechanism for test context.

**Common Fixtures**:
- `page`: Playwright Page object
- `testContext`: Custom test context (shared data)
- `browser`: Browser instance
- `context`: Browser context

**Usage**:
```typescript
Given('I am on the page', async function ({ page, testContext }) {
  // page and testContext are fixtures
  await page.goto('/');
});
```

**Note**: `transactionExtractor` is NOT a fixture (it's an imported utility).

---

### GAP-###
**Definition**: Gap identifier for missing test coverage.

**Format**: `GAP-###` (e.g., GAP-001, GAP-002)

**Location**: `docs/modules/[module]/gap-analysis.md`

**Purpose**: Track missing test scenarios and prioritize implementation.

**Example**:
```markdown
## GAP-001 - Negative Scenario: Invalid Dealer Selection
- **Status**: ❌ Not Implemented
- **Priority**: P1 (High)
- **Reason**: Need to verify error handling
```

---

### Gherkin
**Definition**: Business-readable language for writing test scenarios.

**Keywords**:
- `Feature`: High-level description of functionality
- `Scenario`: Specific test case
- `Given`: Precondition/setup
- `When`: User action
- `Then`: Expected outcome
- `And`: Additional step
- `Background`: Common steps for all scenarios

**Example**:
```gherkin
Feature: Login
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

---

### IMPL-###
**Definition**: Implementation record identifier.

**Format**: `IMPL-###_[feature-name].md` (e.g., IMPL-001_indent-creation.md)

**Location**: `docs/implementations/YYYY-MM/`

**Purpose**: Document test implementation details (tests created, updated, deprecated).

**Contents**:
- Metadata (ID, date, module, type, status)
- New tests created (with Test IDs)
- Existing tests updated (with reasons)
- Tests deprecated (with reasons)
- Corner cases discovered
- Test results & flakiness checks

---

### Monocart Reporter
**Definition**: Playwright reporter for development/debug modes with rich debugging features.

**Features**:
- Video recording
- Screenshots
- Network metrics
- Tree-grid visualization
- Trace viewer links
- Auto-opens after tests

**When Used**: Development and debug modes only

**Access**: `npm run test:report:monocart` or `monocart-report/index.html`

---

### Allure Report
**Definition**: Playwright reporter for production mode with BDD step display and historical tracking.

**Features**:
- BDD step-level display
- Step-level attachments
- Historical trends
- Test categories and suites

**When Used**: Production mode only

**Access**: `npm run test:report:allure:open`

---

### Multi-User Testing (70/30 Split)
**Definition**: Framework strategy for test distribution across user types.

**Split**:
- **70% Single-User**: Tests run once with primary user (happy path, workflows, UI validation)
- **30% Multi-User**: Tests run multiple times with different users (permissions, tenant isolation, RBAC)

**Single-User Example**:
```gherkin
@O2C-001 @smoke @iacs-md
Scenario: Create order
  Given I am logged in to the Application  # Runs once as IACS MD User
```

**Multi-User Example**:
```gherkin
@O2C-050 @multi-user @iacs-md @iacs-finance
Scenario Outline: User permissions
  Given I am logged in as "<User>"
  Examples:
    | User            |
    | IACS MD User    |
    | Finance Manager |
  # Runs twice (once per user)
```

---

### Page Object Model (POM)
**Definition**: Design pattern that creates object repository for UI elements.

**Structure**:
```typescript
export class OrdersPage extends BasePage {
  readonly submitButton: Locator;
  
  constructor(page: Page) {
    super(page);
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }
  
  async createOrder(data: OrderData): Promise<void> {
    // High-level action method
  }
}
```

**Benefits**:
- Maintainability (locators in one place)
- Reusability (methods used across tests)
- Abstraction (hide implementation details)

---

### Sandwich Method
**Definition**: Database verification pattern that queries state before and after UI actions.

**Pattern**:
```typescript
// 1. DB BEFORE - Query initial state
const countBefore = await getOrderCount();

// 2. UI ACTION - Perform user interaction
await ordersPage.createOrder(orderData);

// 3. DB AFTER - Verify state change
const countAfter = await getOrderCount();
expect(countAfter).toBe(countBefore + 1);
```

**Purpose**: Verify UI actions result in correct database state changes.

---

### Scenario Hash
**Definition**: Unique identifier for test scenarios to detect duplicates.

**Format**: Hash of (Module + Feature + Action + Expected Outcome)

**Location**: `docs/test-cases/TEST_CASE_REGISTRY.md`

**Purpose**: Prevent duplicate test creation (>90% overlap detection).

---

### Semantic Locator
**Definition**: Locator strategy that uses accessible attributes instead of CSS classes.

**Priority Order**:
1. `data-testid` (highest priority)
2. `getByRole` with name
3. `getByLabel`
4. `getByPlaceholder`
5. `getByText`
6. ID selector (last resort)

**Example**:
```typescript
// ✅ Semantic locator
page.getByRole('button', { name: 'Submit' })

// ❌ CSS class selector (forbidden)
page.locator('.bg-blue-500')
```

**Benefits**: Resilient to CSS changes, accessibility-friendly.

---

### Storage State
**Definition**: Saved authentication state (cookies, localStorage) for reuse across tests.

**Location**: `.auth/[user].json`

**Purpose**: Avoid login in every test (multi-user authentication).

**Example**:
```json
{
  "cookies": [...],
  "origins": [
    {
      "origin": "https://app.daee.com",
      "localStorage": [
        { "name": "supabase.auth.token", "value": "..." }
      ]
    }
  ]
}
```

**Usage**:
```typescript
// playwright.config.ts
{
  name: 'iacs-md',
  use: { storageState: '.auth/iacs-md-user.json' }
}
```

---

### TestDataLocator
**Definition**: Utility class for retrieving stable prerequisite data from database.

**Location**: `e2e/src/support/data/TestDataLocator.ts`

**Purpose**: Reuse existing stable data instead of creating new data (read-only database).

**Methods**:
- `getStableDealer()`: Get first active dealer
- `getStableProduct(category?)`: Get first active product (optionally by category)
- `getStableUser(role)`: Get first user by role

**Example**:
```typescript
const dealer = await TestDataLocator.getStableDealer();
await ordersPage.selectDealer(dealer.name);
```

**Benefits**: No hardcoded IDs, cached for performance, reusable across tests.

---

### Test Impact Matrix
**Definition**: Document mapping tests to source code files.

**Location**: `docs/test-cases/test-impact-matrix.md`

**Purpose**: Identify which tests are affected by code changes.

**Format**:
```markdown
| Test ID | Source Files | Locators Used | Last Verified |
|---------|--------------|---------------|---------------|
| O2C-001 | page.tsx, OrderForm.tsx | getByRole('button') | 2025-02-12 |
```

---

### Test Case Registry
**Definition**: Central registry of all test cases with scenario hashes.

**Location**: `docs/test-cases/TEST_CASE_REGISTRY.md`

**Purpose**: Track all tests and detect duplicates.

**Format**:
```markdown
| Test ID | Module | Scenario | Hash | Status |
|---------|--------|----------|------|--------|
| O2C-001 | O2C | Create order | abc123 | ✅ Active |
```

---

## Domain-Specific Terms

### AAL (Authentication Assurance Level)
**Definition**: Level of authentication confidence.

**Levels**:
- **aal1**: Password-only authentication
- **aal2**: Password + MFA (Multi-Factor Authentication)

**Usage**: Verify MFA completion by checking `auth.sessions.aal = 'aal2'`.

---

### Dealer
**Definition**: Business entity that places orders in the O2C module.

**Attributes**: name, code, tenant_id, status

**Test Usage**: Use `TestDataLocator.getStableDealer()` for prerequisite data.

---

### Indent
**Definition**: Request for quotation or order intent in the O2C module.

**Workflow**: draft → submitted → approved → completed

**Test Usage**: Create via UI with `AUTO_QA_` prefix, verify status transitions.

---

### Multi-Tenant
**Definition**: Architecture where multiple customers (tenants) share the same application instance.

**Isolation**: Each tenant's data is isolated (filtered by `tenant_id`).

**Test Usage**: Verify users cannot access other tenant's data.

---

### O2C (Order-to-Cash)
**Definition**: Business process from order creation to payment receipt.

**Modules**: Indents, Orders, Invoices, Payments

**Test Coverage**: Order creation, approval workflows, status transitions.

---

### RBAC (Role-Based Access Control)
**Definition**: Authorization model where permissions are assigned to roles.

**Roles**: Super Admin, IACS MD User, Finance Manager, Warehouse Manager

**Test Usage**: Multi-user tests verify permission boundaries.

---

### ShadCN/Radix UI
**Definition**: Component library used in DAEE frontend.

**Challenge**: Components use custom implementations (not native HTML).

**Solution**: Component library abstracts interaction patterns.

**Example**: Radix Select requires clicking trigger, then clicking option from listbox (native `selectOption()` doesn't work).

---

### Tenant
**Definition**: Customer organization in a multi-tenant system.

**Examples**: IACS, Demo Tenant

**Isolation**: Users can only access data from their tenant.

---

### TOTP (Time-Based One-Time Password)
**Definition**: MFA method using time-based codes (e.g., Google Authenticator).

**Usage**: Framework uses `otpauth` library to generate TOTP codes in `global.setup.ts`.

---

## Acronyms

| Acronym | Full Form | Definition |
|---------|-----------|------------|
| AAL | Authentication Assurance Level | Level of authentication confidence |
| BDD | Behavior-Driven Development | Testing approach using business-readable scenarios |
| MFA | Multi-Factor Authentication | Authentication requiring multiple verification methods |
| O2C | Order-to-Cash | Business process from order to payment |
| POM | Page Object Model | Design pattern for UI element abstraction |
| RBAC | Role-Based Access Control | Authorization model based on user roles |
| TOTP | Time-Based One-Time Password | MFA method using time-based codes |
| UI | User Interface | Visual elements users interact with |

---

## References

- **Architecture**: `docs/knowledge-base/architecture.md`
- **Database Schema**: `docs/knowledge-base/database-schema.md`
- **Business Rules**: `docs/knowledge-base/business-rules.md`
- **Cursor Rules**: `.cursor/rules/sr-automation-engineer-persona.mdc`
