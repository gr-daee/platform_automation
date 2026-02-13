# Business Rules & Validation Logic

## Overview

This document captures cross-module business rules, validation logic, and workflow rules in the DAEE platform. These rules guide test scenario creation and assertion logic.

---

## Authentication & Authorization Rules

### Rule: Multi-Factor Authentication (MFA)

**Description**: Users must complete MFA (TOTP) after password authentication to access the application.

**Validation**:
- Client-side: Redirect to MFA page after password login
- Server-side: Check `auth.sessions.aal` level (aal1 = password, aal2 = password + MFA)

**Impact on Tests**:
- All tests must handle MFA flow in `global.setup.ts`
- Database verification checks `aal = 'aal2'` for authenticated sessions

**Test Pattern**:
```typescript
// Verify MFA completion
const hasMFA = await hasUserCompletedMFA(userId);
expect(hasMFA).toBe(true);

// Verify session AAL level
const session = await getLatestSession(userId);
expect(session.aal).toBe('aal2');
```

---

### Rule: Role-Based Access Control (RBAC)

**Description**: Users have different permissions based on their role.

**Roles**:
- **Super Admin**: Full access to all modules
- **IACS MD User**: Full access to O2C module (IACS tenant)
- **Finance Manager**: Read-only access to O2C reports
- **Warehouse Manager**: Access to inventory and warehouse operations

**Validation**:
- Client-side: Conditional rendering based on permissions
- Server-side: API endpoints check user role before operations

**Impact on Tests**:
- Use multi-user tests (70/30 split) for permission boundaries
- Verify users cannot access unauthorized features

**Test Pattern**:
```gherkin
@O2C-050 @multi-user @iacs-md @iacs-finance
Scenario Outline: User permissions for order deletion
  Given I am logged in as "<User>"
  When I try to delete an order
  Then I should see "<Result>"
  
  Examples:
    | User            | Result  |
    | IACS MD User    | Success |
    | Finance Manager | Denied  |
```

---

## Multi-Tenant Isolation Rules

### Rule: Tenant Data Isolation

**Description**: Users can only access data belonging to their tenant.

**Validation**:
- All database queries filter by `tenant_id`
- API endpoints validate user's tenant matches requested resource's tenant

**Impact on Tests**:
- Verify users cannot see other tenant's data
- Test cross-tenant access attempts return 403/404

**Test Pattern**:
```typescript
// Verify IACS user only sees IACS dealers
const dealers = await executeQuery(
  'SELECT * FROM dealers WHERE tenant_id = $1',
  [iacsUser.tenant_id]
);

// All dealers should belong to IACS tenant
dealers.forEach(dealer => {
  expect(dealer.tenant_id).toBe(iacsUser.tenant_id);
});
```

---

## O2C (Order-to-Cash) Business Rules

### Rule: Indent Creation Workflow

**Description**: Indents must be created before orders can be placed.

**Workflow**:
1. User creates indent with dealer selection
2. Indent starts in "draft" status
3. User adds products to indent
4. User submits indent (status → "submitted")
5. Approver reviews and approves (status → "approved")
6. Order can be created from approved indent

**Validation**:
- Cannot create order without approved indent
- Indent must have at least one product
- Dealer must be active

**Impact on Tests**:
- Test indent creation before order creation
- Verify status transitions (draft → submitted → approved)
- Test negative scenarios (order without indent)

**Test Pattern**:
```gherkin
Scenario: Cannot create order without approved indent
  Given I am logged in to the Application
  When I try to create an order without an indent
  Then I should see error "Approved indent required"
  And the order should not be created
```

---

### Rule: Order Approval Workflow

**Description**: Orders above a certain threshold require approval.

**Thresholds**:
- Orders < ₹10,000: Auto-approved
- Orders ≥ ₹10,000: Requires manager approval
- Orders ≥ ₹50,000: Requires director approval

**Validation**:
- Client-side: Show approval required message
- Server-side: Check order total and set approval status

**Impact on Tests**:
- Test orders at different thresholds
- Verify approval workflow for high-value orders

**Test Pattern**:
```gherkin
Scenario Outline: Order approval based on amount
  Given I am logged in to the Application
  When I create an order with amount "<Amount>"
  Then the order status should be "<Status>"
  
  Examples:
    | Amount | Status        |
    | 5000   | Auto-approved |
    | 15000  | Pending       |
    | 60000  | Pending       |
```

---

### Rule: Product Availability Check

**Description**: Products must be in stock before adding to order.

**Validation**:
- Client-side: Disable "Add to Order" if out of stock
- Server-side: Check inventory before order creation

**Impact on Tests**:
- Verify out-of-stock products cannot be added
- Test inventory updates after order placement

---

## Form Validation Rules

### Rule: Required Fields

**Description**: Certain fields are mandatory for form submission.

**Common Required Fields**:
- Dealer selection (indents, orders)
- Product selection (order items)
- Quantity (must be > 0)
- Email (must be valid format)

**Validation**:
- Client-side: Show error message under field (role="alert")
- Server-side: Return 400 with validation errors

**Impact on Tests**:
- Test form submission with missing required fields
- Verify error messages appear correctly

**Test Pattern**:
```typescript
// Submit form without required field
await page.getByRole('button', { name: 'Submit' }).click();

// Verify validation error
await expect(page.getByRole('alert')).toContainText('Dealer is required');
```

---

### Rule: Field Format Validation

**Description**: Fields must match expected format.

**Format Rules**:
- Email: Valid email format (user@domain.com)
- Phone: 10 digits (Indian format)
- SKU: Alphanumeric, 6-12 characters
- Quantity: Positive integer

**Validation**:
- Client-side: Regex validation, show error on blur
- Server-side: Schema validation (Zod)

**Impact on Tests**:
- Test invalid formats (e.g., "invalid-email")
- Verify error messages guide user to correct format

---

## Data Integrity Rules

### Rule: Unique Constraints

**Description**: Certain fields must be unique across records.

**Unique Fields**:
- `dealers.code`: Dealer code must be unique
- `products.sku`: Product SKU must be unique
- `orders.order_number`: Order number must be unique
- `indents.indent_number`: Indent number must be unique

**Validation**:
- Database: UNIQUE constraint
- Server-side: Check existence before insert

**Impact on Tests**:
- Use `AUTO_QA_${Date.now()}_` prefix for uniqueness
- Test duplicate detection (negative scenario)

**Test Pattern**:
```typescript
const uniqueName = `AUTO_QA_${Date.now()}_${Math.random()}_Order`;
await ordersPage.createOrder({ name: uniqueName });
```

---

### Rule: Referential Integrity

**Description**: Foreign key relationships must be valid.

**Key Relationships**:
- `orders.dealer_id` → `dealers.id`
- `orders.indent_id` → `indents.id`
- `order_items.order_id` → `orders.id`
- `order_items.product_id` → `products.id`

**Validation**:
- Database: FOREIGN KEY constraint
- Server-side: Check referenced record exists

**Impact on Tests**:
- Use TestDataLocator for stable prerequisite data
- Verify relationships in database after creation

**Test Pattern**:
```typescript
// Verify order → order_items → products relationship
const orderItems = await executeQuery(`
  SELECT oi.*, p.name as product_name
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  WHERE oi.order_id = $1
`, [orderId]);

expect(orderItems.length).toBeGreaterThan(0);
expect(orderItems[0].product_name).toBeDefined();
```

---

## Status Transition Rules

### Rule: Indent Status Transitions

**Description**: Indents follow a specific status flow.

**Valid Transitions**:
```
draft → submitted → approved → completed
  ↓         ↓          ↓
cancelled cancelled cancelled
```

**Invalid Transitions**:
- draft → approved (must go through submitted)
- submitted → completed (must be approved first)
- completed → draft (cannot revert)

**Validation**:
- Server-side: Check current status before transition
- Database: Status enum constraint

**Impact on Tests**:
- Test valid transitions (draft → submitted → approved)
- Test invalid transitions (expect error)

**Test Pattern**:
```gherkin
Scenario: Cannot approve draft indent directly
  Given I have a draft indent
  When I try to approve the indent
  Then I should see error "Indent must be submitted first"
  And the indent status should remain "draft"
```

---

### Rule: Order Status Transitions

**Description**: Orders follow a specific status flow.

**Valid Transitions**:
```
draft → submitted → approved → dispatched → delivered
  ↓         ↓          ↓           ↓
cancelled cancelled cancelled cancelled
```

**Validation**:
- Server-side: Check current status before transition
- Business logic: Cannot cancel after dispatch

**Impact on Tests**:
- Test full order lifecycle (draft → delivered)
- Test cancellation at different stages

---

## Calculation Rules

### Rule: Order Total Calculation

**Description**: Order total is sum of all order items.

**Formula**:
```
order_item.total_price = order_item.quantity × order_item.unit_price
order.total_amount = SUM(order_items.total_price)
```

**Validation**:
- Client-side: Calculate and display total in real-time
- Server-side: Recalculate total before saving

**Impact on Tests**:
- Verify total calculation after adding items
- Test edge cases (zero quantity, negative price)

**Test Pattern**:
```typescript
// Verify order total calculation
const orderItems = await executeQuery(
  'SELECT SUM(total_price) as calculated_total FROM order_items WHERE order_id = $1',
  [orderId]
);

const order = await executeQuery(
  'SELECT total_amount FROM orders WHERE id = $1',
  [orderId]
);

expect(order[0].total_amount).toBe(orderItems[0].calculated_total);
```

---

## Date & Time Rules

### Rule: Created/Updated Timestamps

**Description**: All records have `created_at` and `updated_at` timestamps.

**Behavior**:
- `created_at`: Set on record creation (immutable)
- `updated_at`: Set on record creation and updated on every modification

**Validation**:
- Database: DEFAULT NOW() on insert
- Database trigger: Update `updated_at` on UPDATE

**Impact on Tests**:
- Verify timestamps are set correctly
- Check `updated_at` changes after modification

---

### Rule: Date Range Validation

**Description**: End date must be after start date.

**Validation**:
- Client-side: Disable invalid date selections
- Server-side: Compare dates before saving

**Impact on Tests**:
- Test invalid date ranges (end before start)
- Verify error messages

---

## Error Handling Rules

### Rule: User-Friendly Error Messages

**Description**: Error messages should guide users to resolve issues.

**Good Error Messages**:
- ✅ "Email is required"
- ✅ "Quantity must be greater than 0"
- ✅ "Dealer not found. Please select a valid dealer."

**Bad Error Messages**:
- ❌ "Validation failed"
- ❌ "Error 500"
- ❌ "Null pointer exception"

**Impact on Tests**:
- Verify error messages are user-friendly
- Test that errors appear in correct location (under field)

---

### Rule: Toast Notifications

**Description**: User actions trigger toast notifications.

**Toast Types**:
- Success: Green, "Created successfully", "Saved successfully"
- Error: Red, "Failed to create", "An error occurred"
- Info: Blue, "Processing...", "Loading data"

**Validation**:
- Client-side: Show toast after action completes
- Auto-dismiss after 3 seconds (default)

**Impact on Tests**:
- Verify success toast after creation
- Verify error toast on failure

**Test Pattern**:
```typescript
await expect(page.locator('[data-sonner-toast]'))
  .toContainText('Created successfully', { timeout: 5000 });
```

---

## Performance Rules

### Rule: Pagination

**Description**: Large datasets are paginated to improve performance.

**Default Page Size**: 50 records

**Validation**:
- Client-side: Show page controls (Next, Previous)
- Server-side: Limit query results with OFFSET and LIMIT

**Impact on Tests**:
- Test pagination controls work correctly
- Verify correct number of records per page

---

### Rule: Search Debouncing

**Description**: Search inputs are debounced to reduce API calls.

**Debounce Delay**: 300ms

**Validation**:
- Client-side: Wait 300ms after last keystroke before search

**Impact on Tests**:
- Wait for debounce delay before asserting results
- Use `page.waitForResponse()` for search API calls

---

## References

- **Module Knowledge**: `docs/modules/[module]/knowledge.md`
- **Database Schema**: `docs/knowledge-base/database-schema.md`
- **Architecture**: `docs/knowledge-base/architecture.md`
- **Test Cases**: `docs/modules/[module]/test-cases.md`
