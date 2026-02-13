# 06 - Advanced Patterns

**Estimated Time**: 2 hours

**Prerequisites**: [04-creating-tests.md](./04-creating-tests.md), [05-multi-user-testing.md](./05-multi-user-testing.md)

---

## Learning Objectives

- ✅ Master component library for ShadCN/Radix
- ✅ Use TestDataLocator effectively
- ✅ Implement Sandwich Method correctly
- ✅ Handle complex UI interactions

---

## 1. Component Library (45 minutes)

### Why Component Library?

**Problem**: ShadCN/Radix components use custom implementations.

```typescript
// ❌ Doesn't work on Radix Select
await page.selectOption('select', 'value');

// ✅ Works with component library
await selectComponent.selectByLabel('Category', 'Electronics');
```

### SelectComponent

```typescript
// In Page Object
private selectComponent: SelectComponent;

constructor(page: Page) {
  super(page);
  this.selectComponent = new SelectComponent(page);
}

// Usage
async selectDealer(dealerName: string): Promise<void> {
  await this.selectComponent.selectByLabel('Dealer', dealerName);
}
```

### DialogComponent

```typescript
// Wait for dialog to open
await dialogComponent.waitForOpen();

// Interact with dialog
await dialogComponent.fillField('Name', 'Product A');
await dialogComponent.clickButton('Save');

// Wait for dialog to close
await dialogComponent.waitForClose();
```

### ToastComponent

```typescript
// Wait for success toast
await toastComponent.waitForSuccess('Created successfully');

// Wait for error toast
await toastComponent.waitForError('Failed to create');
```

---

## 2. TestDataLocator (30 minutes)

### Purpose

Reuse existing stable data instead of creating new data (read-only database).

### Usage

```typescript
import { TestDataLocator } from '../../support/data/TestDataLocator';

// Get stable dealer
const dealer = await TestDataLocator.getStableDealer();
await ordersPage.selectDealer(dealer.name);

// Get stable product by category
const product = await TestDataLocator.getStableProduct('Electronics');
await ordersPage.addProduct(product.name, 5);
```

### Benefits

- No hardcoded IDs
- Cached for performance
- Reusable across tests
- Easy to update centrally

---

## 3. Sandwich Method (30 minutes)

### Pattern

```typescript
When('I create order', async function ({ page }) {
  // 1. DB BEFORE
  const countBefore = await executeQuery(
    'SELECT COUNT(*) FROM orders WHERE user_id = $1',
    [userId]
  );
  
  // 2. UI ACTION
  await ordersPage.createOrder(orderData);
  
  // 3. DB AFTER
  const countAfter = await executeQuery(
    'SELECT COUNT(*) FROM orders WHERE user_id = $1',
    [userId]
  );
  
  expect(countAfter[0].count).toBe(countBefore[0].count + 1);
});
```

### When to Use

- ✅ Verify data creation
- ✅ Check status transitions
- ✅ Validate relationships
- ❌ Pure UI validation
- ❌ Navigation assertions

---

## Hands-On Exercise (45 minutes)

### Exercise 1: Use Component Library

Create a test that uses SelectComponent, DialogComponent, and ToastComponent.

### Exercise 2: Implement TestDataLocator

Refactor a test to use TestDataLocator instead of hardcoded data.

### Exercise 3: Apply Sandwich Method

Add database verification to an existing test using Sandwich Method.

---

## Quick Reference

**Component Library**:
- `SelectComponent`: Radix Select/Combobox
- `DialogComponent`: Modal/Dialog handling
- `ToastComponent`: Toast notifications
- `FormComponent`: Form validation

**TestDataLocator**:
- `getStableDealer()`: Get first active dealer
- `getStableProduct(category?)`: Get first active product
- `getStableUser(role)`: Get first user by role

**Sandwich Method**:
1. DB BEFORE: Query initial state
2. UI ACTION: Perform user interaction
3. DB AFTER: Verify state change

---

## Next Steps

Continue to [07-debugging-guide.md](./07-debugging-guide.md) for debugging techniques.
