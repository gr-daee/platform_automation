# 04 - Creating Tests

**Estimated Time**: 2 hours

**Prerequisites**: [01-getting-started.md](./01-getting-started.md), [02-framework-architecture.md](./02-framework-architecture.md), [03-running-tests.md](./03-running-tests.md)

---

## Learning Objectives

By the end of this module, you will:
- ✅ Follow the complete test creation workflow
- ✅ Write feature files with proper Gherkin syntax
- ✅ Create Page Object Models with semantic locators
- ✅ Implement step definitions with Sandwich Method
- ✅ Update documentation alongside test code

---

## Test Creation Workflow

```
1. Context Gathering (Read docs, source code)
   ↓
2. Create Feature File (.feature)
   ↓
3. Generate BDD Files (npm run bdd:generate)
   ↓
4. Create Page Object Model (*Page.ts)
   ↓
5. Create Step Definitions (*-steps.ts)
   ↓
6. Run Test (npm run test:dev)
   ↓
7. Update Documentation (test-cases.md, knowledge.md)
```

---

## Step 1: Context Gathering (MANDATORY)

Before writing ANY code, read:

**Module Knowledge**:
- `docs/modules/[module]/knowledge.md` - Business rules, UI patterns
- `docs/modules/[module]/test-cases.md` - Existing tests (avoid duplicates)
- `docs/modules/[module]/gap-analysis.md` - Known gaps

**Source Code**:
- `../web_app/src/app/[module]/page.tsx` - Main page component
- `../web_app/src/app/[module]/components/*.tsx` - All related components

**Existing Tests**:
- `e2e/features/[module]/` - Existing feature files
- `e2e/src/pages/[module]/` - Existing Page Objects
- `e2e/src/steps/[module]/` - Existing step definitions

**Why**: Understand context to avoid duplicates and follow established patterns.

---

## Step 2: Create Feature File

**File**: `e2e/features/[module]/[feature].feature`

**Template**:
```gherkin
Feature: [Feature Name]

  As a [user role]
  I want to [perform action]
  So that [achieve goal]

  Background:
    Given I am logged in to the Application

  @[MODULE]-[FEATURE]-TC-001 @smoke @p1 @iacs-md
  Scenario: [Positive scenario - happy path]
    Given [precondition]
    When [user action]
    Then [expected outcome]
    And [additional verification]

  @[MODULE]-[FEATURE]-TC-002 @regression @p2 @iacs-md
  Scenario: [Negative scenario - validation]
    Given [precondition]
    When [invalid action]
    Then [error message displayed]
```

**Tag Requirements**:
- Test case ID: `@MODULE-FEATURE-TC-###`
- Test type: `@smoke`, `@critical`, or `@regression`
- Priority: `@p0` (critical), `@p1` (high), `@p2` (medium), `@p3` (low)
- User: `@iacs-md`, `@iacs-finance`, `@iacs-warehouse`, `@super-admin`

**Example**:
```gherkin
Feature: O2C Order Management

  Background:
    Given I am logged in to the Application

  @O2C-ORDER-TC-001 @smoke @p1 @iacs-md
  Scenario: Create order successfully
    Given I am on the orders page
    When I create a new order with valid data
    Then the order should be created successfully
    And I should see a success message
```

---

## Step 3: Generate BDD Files

```bash
npm run bdd:generate
```

**What this does**: Converts `.feature` files to `.spec.js` files that Playwright can execute.

**When to run**:
- After creating new feature files
- After modifying Gherkin steps
- After changing tags or parameterized values

---

## Step 4: Create Page Object Model

**File**: `e2e/src/pages/[module]/[Page]Page.ts`

**Template**:
```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { SelectComponent } from '../../support/components/SelectComponent';

/**
 * [Module] Page Object Model
 * 
 * Source: ../web_app/src/app/[module]/page.tsx
 * 
 * Purpose: [Brief description]
 */
export class [Module]Page extends BasePage {
  // Component library instances
  private selectComponent: SelectComponent;
  
  // Semantic locators
  readonly createButton: Locator;
  readonly nameInput: Locator;
  
  constructor(page: Page) {
    super(page);
    this.selectComponent = new SelectComponent(page);
    
    // Define locators using semantic selectors
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.nameInput = page.getByLabel('Name');
  }
  
  // Navigation methods
  async goto(): Promise<void> {
    await this.navigateTo('/[module]/[page]');
  }
  
  // High-level action methods
  async createEntity(data: EntityData): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.selectComponent.selectByLabel('Category', data.category);
    await this.createButton.click();
    await this.waitForToast('Created successfully');
  }
}
```

**Checklist**:
- [ ] Inherits from `BasePage`
- [ ] Uses component library for ShadCN/Radix
- [ ] Semantic locators (getByRole, getByLabel, getByPlaceholder)
- [ ] High-level action methods (not just locator getters)
- [ ] Documents source file location

---

## Step 5: Create Step Definitions

**File**: `e2e/src/steps/[module]/[feature]-steps.ts`

**Template**:
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { [Module]Page } from '../../pages/[module]/[Page]Page';
import { executeQuery } from '../../support/db-helper';
import { TestDataLocator } from '../../support/data/TestDataLocator';

let [module]Page: [Module]Page;

Given('I am on the [module] page', async function ({ page }) {
  [module]Page = new [Module]Page(page);
  await [module]Page.goto();
});

When('I create a new entity with valid data', async function ({ page }) {
  // Use TestDataLocator for stable data
  const category = await TestDataLocator.getStableCategory();
  
  // Use AUTO_QA_ prefix for test data
  const entityData = {
    name: `AUTO_QA_${Date.now()}_Entity`,
    category: category.name,
  };
  
  await [module]Page.createEntity(entityData);
});

Then('the entity should be created successfully', async function ({ page }) {
  // Verify success toast
  await expect(page.locator('[data-sonner-toast]'))
    .toContainText('Created successfully');
  
  // Verify URL changed
  await expect(page).toHaveURL(/\/[module]\/[entity]\/\d+/);
});
```

**With Sandwich Method**:
```typescript
When('I create entity', async function ({ page }) {
  // 1. DB BEFORE
  const countBefore = await executeQuery(
    'SELECT COUNT(*) FROM entities WHERE created_by = $1',
    [userId]
  );
  
  // 2. UI ACTION
  await [module]Page.createEntity(entityData);
  
  // 3. DB AFTER
  const countAfter = await executeQuery(
    'SELECT COUNT(*) FROM entities WHERE created_by = $1',
    [userId]
  );
  
  expect(countAfter[0].count).toBe(countBefore[0].count + 1);
});
```

---

## Step 6: Run Test

```bash
# Run in development mode
npm run test:dev -- --grep "@[MODULE]-[FEATURE]-TC-001"
```

**Verify**:
- Test passes consistently
- Monocart report shows expected behavior
- No linter errors
- Follows all patterns

---

## Step 7: Update Documentation

**Update `docs/modules/[module]/test-cases.md`**:
```markdown
## @[MODULE]-[FEATURE]-TC-001 - [Scenario Name]

- **Feature File**: `e2e/features/[module]/[feature].feature`
- **Scenario**: [Scenario name from feature file]
- **Coverage**: [What this test verifies]
- **Status**: ✅ Automated
- **Tags**: @smoke, @p1
- **Last Updated**: 2025-02-12

**Test Steps**:
1. [Given] Navigate to [module] page
2. [When] Perform [action]
3. [Then] Verify [outcome]

**Prerequisites**:
- [Required data or state]

**Test Data**:
- Uses TestDataLocator for [data type]
- Creates AUTO_QA_ prefixed data
```

**Update `docs/modules/[module]/knowledge.md`** (if new patterns discovered):
- Add new UI interactions
- Document new business rules
- Update "Testing Context" section

---

## Hands-On Exercise (60 minutes)

### Exercise: Create a Complete Test

**Scenario**: Create a test for "User views order details"

**Step 1: Context Gathering (10 minutes)**
1. Read `docs/modules/o2c/knowledge.md`
2. Check `docs/modules/o2c/test-cases.md` for similar tests
3. Review `../web_app/src/app/o2c/orders/page.tsx`

**Step 2: Create Feature File (10 minutes)**
1. Create `e2e/features/o2c/orders-view.feature`
2. Write scenario with proper tags
3. Use Background for login

**Step 3: Generate BDD Files (2 minutes)**
```bash
npm run bdd:generate
```

**Step 4: Create Page Object (15 minutes)**
1. Create `e2e/src/pages/o2c/OrdersViewPage.ts`
2. Inherit from BasePage
3. Define locators for order details elements
4. Create method `async viewOrderDetails(orderId: string)`

**Step 5: Create Step Definitions (15 minutes)**
1. Create `e2e/src/steps/o2c/orders-view-steps.ts`
2. Implement Given/When/Then steps
3. Use Sandwich Method to verify order exists in DB

**Step 6: Run Test (5 minutes)**
```bash
npm run test:dev -- --grep "@O2C-ORDER-VIEW-TC-001"
```

**Step 7: Update Documentation (3 minutes)**
1. Add test to `docs/modules/o2c/test-cases.md`
2. Update knowledge.md if needed

---

## Best Practices

### Feature Files
- ✅ Write from user perspective (no technical details)
- ✅ Use consistent Given/When/Then structure
- ✅ One scenario per test case
- ✅ Tag with test case ID, type, priority, user

### Page Objects
- ✅ Inherit from BasePage
- ✅ Use component library for ShadCN/Radix
- ✅ Semantic locators (getByRole, getByLabel)
- ✅ High-level action methods
- ✅ Document source file location

### Step Definitions
- ✅ Implement Sandwich Method for database verification
- ✅ Reuse shared steps when possible
- ✅ Use TestDataLocator for stable data
- ✅ Use AUTO_QA_ prefix for test data

### Documentation
- ✅ Update test-cases.md immediately after creating test
- ✅ Update knowledge.md if new patterns discovered
- ✅ Update gap-analysis.md to mark gaps resolved

---

## Common Mistakes to Avoid

### ❌ Don't Do This

```typescript
// ❌ CSS class selectors
await page.locator('.bg-blue-500').click();

// ❌ Hardcoded test data
const dealer = await executeQuery('SELECT * FROM dealers WHERE id = 123');

// ❌ Skip documentation updates

// ❌ Create tests without reading module knowledge
```

### ✅ Do This

```typescript
// ✅ Semantic locators
await page.getByRole('button', { name: 'Submit' }).click();

// ✅ TestDataLocator for stable data
const dealer = await TestDataLocator.getStableDealer();

// ✅ Update documentation immediately

// ✅ Read module knowledge before creating tests
```

---

## Troubleshooting

### Issue: "Step definition not found"
**Solution**: Run `npm run bdd:generate` after creating feature file.

### Issue: "Locator not found"
**Solution**: Verify element exists in source code, use semantic locators.

### Issue: "Test data not found"
**Solution**: Use TestDataLocator for stable data, or create via UI with AUTO_QA_ prefix.

---

## Key Takeaways

1. **Always read context** before creating tests (avoid duplicates)
2. **Follow workflow**: Feature → BDD gen → POM → Steps → Run → Document
3. **Use semantic locators** (getByRole, getByLabel, getByPlaceholder)
4. **Implement Sandwich Method** for database verification
5. **Update documentation** immediately after creating tests

---

## Next Steps

**Ready for multi-user testing?** Continue to [05-multi-user-testing.md](./05-multi-user-testing.md) to learn the 70/30 split strategy.

**Need advanced patterns?** Jump to [06-advanced-patterns.md](./06-advanced-patterns.md) for component library and TestDataLocator.

---

## Quick Reference

**Test Creation Checklist**:
- [ ] Read module knowledge, test-cases, gap-analysis
- [ ] Review source code (page.tsx, components)
- [ ] Create feature file with proper tags
- [ ] Run `npm run bdd:generate`
- [ ] Create Page Object Model (inherit from BasePage)
- [ ] Create step definitions (use Sandwich Method)
- [ ] Run test in development mode
- [ ] Update test-cases.md
- [ ] Update knowledge.md (if needed)
- [ ] Update gap-analysis.md (mark gaps resolved)
