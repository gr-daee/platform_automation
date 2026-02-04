# Quick Start Guide - Consolidated Framework

## 🚀 5-Minute Quick Start

### For Test Creation

1. **Read the persona rule** (2 minutes):
   ```
   .cursor/rules/sr-automation-engineer-persona.mdc
   ```

2. **Follow the workflow**:
   - Read module knowledge: `docs/modules/[module]/knowledge.md`
   - Read source code: `../web_app/src/app/[module]/`
   - Generate POM using `BasePage`
   - Create step definitions
   - Update documentation

3. **Use infrastructure code**:
   - Extend `BasePage` for POMs
   - Use component library for ShadCN/Radix
   - Use `TestDataLocator` for stable data
   - Reuse shared steps

---

## 📂 Key File Locations

### Cursor Rules (AI Guidance)
```
.cursor/rules/
├── sr-automation-engineer-persona.mdc  ← START HERE
├── automation-patterns.mdc             ← Technical patterns
└── framework-workflows.mdc             ← Process workflows
```

### Infrastructure Code
```
e2e/src/support/
├── base/BasePage.ts                    ← Inherit from this
├── components/                          ← ShadCN wrappers
│   ├── SelectComponent.ts
│   ├── DialogComponent.ts
│   └── ToastComponent.ts
└── data/TestDataLocator.ts             ← Stable test data
```

### Shared Steps
```
e2e/src/steps/shared/
├── navigation-steps.ts                  ← Common navigation
├── assertion-steps.ts                   ← Common assertions
└── form-steps.ts                        ← Generic form actions
```

---

## 💡 Code Examples

### 1. Create a Page Object Model

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { SelectComponent } from '../../support/components/SelectComponent';
import { DialogComponent } from '../../support/components/DialogComponent';

export class OrdersPage extends BasePage {
  private selectComponent: SelectComponent;
  private dialogComponent: DialogComponent;
  
  readonly createButton: Locator;
  readonly nameInput: Locator;
  
  constructor(page: Page) {
    super(page);  // ← Must call super()
    this.selectComponent = new SelectComponent(page);
    this.dialogComponent = new DialogComponent(page);
    
    // Use semantic locators
    this.createButton = page.getByRole('button', { name: 'Create Order' });
    this.nameInput = page.getByLabel('Order Name');
  }
  
  async goto(): Promise<void> {
    await this.navigateTo('/orders');  // ← From BasePage
  }
  
  async createOrder(name: string, category: string): Promise<void> {
    await this.createButton.click();
    await this.dialogComponent.waitForOpen();  // ← From DialogComponent
    await this.fillInput(this.nameInput, name);  // ← From BasePage
    await this.selectComponent.selectByLabel('Category', category);  // ← From SelectComponent
    await this.dialogComponent.clickButtonAndWaitClose('Save');
    await this.waitForSuccessToast('Order created');  // ← From BasePage
  }
}
```

### 2. Use TestDataLocator

```typescript
import { TestDataLocator } from '../../support/data/TestDataLocator';

When('I create an order', async function ({ page }) {
  const ordersPage = new OrdersPage(page);
  
  // Get stable data (cached, no hardcoded IDs)
  const dealer = await TestDataLocator.getStableDealer();
  const product = await TestDataLocator.getStableProduct('Electronics');
  
  // Use in test
  await ordersPage.createOrder(`AUTO_QA_${Date.now()}_Order`, dealer.id);
  await ordersPage.addProduct(product.name, 5);
});
```

### 3. Reuse Shared Steps

```gherkin
Feature: Order Management

  Scenario: Create new order
    Given I am on the "orders" page           # ← From shared/navigation-steps.ts
    When I click the "Create Order" button    # ← From shared/navigation-steps.ts
    And I fill the "Name" field with "Order A" # ← From shared/form-steps.ts
    And I select "Active" from the "Status" dropdown # ← From shared/form-steps.ts
    And I submit the form                     # ← From shared/form-steps.ts
    Then I should see a success message       # ← From shared/assertion-steps.ts
    And I should be on the "orders/list" page # ← From shared/assertion-steps.ts
```

---

## 🎯 Common Patterns

### Pattern 1: ShadCN Select

```typescript
// ❌ DON'T: Native select doesn't work
await page.selectOption('select', 'value');

// ✅ DO: Use SelectComponent
const selectComponent = new SelectComponent(page);
await selectComponent.selectByLabel('Category', 'Electronics');
```

### Pattern 2: Dialog/Modal

```typescript
const dialogComponent = new DialogComponent(page);

// Open dialog
await page.getByRole('button', { name: 'Add Product' }).click();
await dialogComponent.waitForOpen();  // Wait for 200ms animation

// Interact
await dialogComponent.fillFields({
  'Name': 'Product A',
  'Price': '29.99'
});

// Close
await dialogComponent.clickButtonAndWaitClose('Save');
```

### Pattern 3: Toast Verification

```typescript
// ✅ Simple: Use BasePage method
await this.waitForSuccessToast('Order created');

// ✅ Advanced: Use ToastComponent
const toastComponent = new ToastComponent(page);
await toastComponent.waitForSuccess('Order created successfully');
await toastComponent.dismiss();
```

### Pattern 4: Sandwich Method (DB Verification)

```typescript
When('I create order', async function ({ page }) {
  // 1. DB BEFORE
  const userBefore = await getUserByEmail('admin@test.com');
  const orderCountBefore = userBefore.order_count;
  
  // 2. UI ACTION
  await ordersPage.createOrder(orderData);
  
  // 3. DB AFTER
  const userAfter = await getUserByEmail('admin@test.com');
  expect(userAfter.order_count).toBe(orderCountBefore + 1);
});
```

---

## 🔧 Command Reference

### Test Execution
```bash
# Development mode (browser visible, single worker)
npm run test:dev -- e2e/features/auth/

# Debug mode (sequential, screenshots)
npm run test:debug -- --grep "Login"

# Production mode (parallel, headless)
npm run test:regression

# Smoke tests only
npm run test:smoke
```

### BDD Generation
```bash
# Generate BDD spec files from feature files
npm run bdd:generate

# Watch mode (auto-regenerate on changes)
npm run bdd:watch
```

---

## 📊 Token Efficiency Tips

1. **Use BasePage**: Saves ~500 tokens per POM
2. **Use Component Library**: Saves ~300 tokens per component interaction
3. **Use TestDataLocator**: Saves ~200 tokens per test
4. **Reuse Shared Steps**: Saves ~500 tokens per test
5. **Read persona rule only**: Saves ~2,500 tokens (vs reading all 5 old rules)

**Total Savings**: ~40-50% token reduction per test generation

---

## ❓ FAQ

### Q: Do I need to update existing tests?
**A**: No, existing tests continue to work. Updates are optional but recommended.

### Q: What if BasePage doesn't have a method I need?
**A**: Add it to your POM. If it's reusable, consider adding to BasePage.

### Q: How do I know which shared step to use?
**A**: Check `e2e/src/steps/shared/`:
- `navigation-steps.ts` - Page navigation, clicks
- `assertion-steps.ts` - Verify results
- `form-steps.ts` - Fill forms, select options

### Q: Where do module-specific steps go?
**A**: Create `e2e/src/steps/[module]/[feature]-steps.ts`

### Q: How do I add new data types to TestDataLocator?
**A**: Use `queryAndCache()` method or add a new method following existing pattern.

---

## 🎓 Learning Path

### Day 1: Core Concepts (30 min)
1. Read `sr-automation-engineer-persona.mdc` (10 min)
2. Review `BasePage.ts` methods (10 min)
3. Review component library (10 min)

### Day 2: Hands-On (2 hours)
1. Read existing auth tests (30 min)
2. Create a simple POM using BasePage (30 min)
3. Create feature file + step definitions (30 min)
4. Run test and review results (30 min)

### Day 3: Advanced (2 hours)
1. Use TestDataLocator in tests (30 min)
2. Implement Sandwich Method (30 min)
3. Create shared steps (30 min)
4. Update documentation (30 min)

**Total Learning Time**: ~4.5 hours (vs 8-10 hours with old structure)

---

## 📞 Support

### Documentation
- **Implementation Summary**: `CONSOLIDATED_RULES_IMPLEMENTATION.md`
- **Framework Patterns**: `.cursor/rules/automation-patterns.mdc`
- **Workflows**: `.cursor/rules/framework-workflows.mdc`

### Code Examples
- **Login Test**: `e2e/features/auth/login.feature` + `e2e/src/steps/auth/auth-steps.ts`
- **LoginPage POM**: `e2e/src/pages/auth/LoginPage.ts`

### Ask Questions
- Review existing tests for patterns
- Check shared steps for reusable actions
- Read module knowledge for business rules

---

## ✅ Checklist: Creating Your First Test

- [ ] Read `sr-automation-engineer-persona.mdc`
- [ ] Read module knowledge: `docs/modules/[module]/knowledge.md`
- [ ] Read source code: `../web_app/src/app/[module]/`
- [ ] Create POM extending `BasePage`
- [ ] Use component library (SelectComponent, DialogComponent, ToastComponent)
- [ ] Create feature file with Gherkin scenarios
- [ ] Create step definitions (reuse shared steps)
- [ ] Use TestDataLocator for stable data
- [ ] Update test registry: `docs/modules/[module]/test-cases.md`
- [ ] Run test in dev mode: `npm run test:dev`
- [ ] Verify documentation is current

---

**You're ready!** Start with a simple test and build from there. 🚀
