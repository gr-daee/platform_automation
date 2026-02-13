# Database Schema & Test Data Strategy

## Overview

The DAEE platform uses PostgreSQL (Supabase) with a multi-tenant architecture. The test automation framework has **read-only** access to the database, requiring specific strategies for test data management.

---

## Key Database Constraints

### Read-Only Access

**Constraint**: Test framework can only execute `SELECT` queries.

**Implications**:
- ❌ Cannot INSERT test data directly
- ❌ Cannot UPDATE records for test setup
- ❌ Cannot DELETE test data after tests
- ✅ Can query existing data for verification
- ✅ Can verify state changes via UI actions

**Workaround**: Create test data via UI, prefix with `AUTO_QA_` for identification.

---

## Core Tables Used in Tests

### 1. Authentication Tables (auth schema)

#### `auth.users`
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Test Usage**:
- Verify user authentication state
- Check MFA completion
- Validate session creation

**Common Queries**:
```typescript
// Get user by email
const user = await getUserByEmail('admin@example.com');

// Check MFA status
const hasMFA = await hasUserCompletedMFA(userId);
```

#### `auth.sessions`
```sql
CREATE TABLE auth.sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  aal TEXT, -- Authentication Assurance Level (aal1, aal2)
  factor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Test Usage**:
- Verify session creation after login
- Check AAL level (aal1 = password, aal2 = password + MFA)
- Validate multi-factor authentication flow

---

### 2. O2C (Order-to-Cash) Tables

#### `dealers`
```sql
CREATE TABLE dealers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Test Usage**:
- Stable prerequisite data (use TestDataLocator)
- Dealer selection in orders/indents
- Tenant isolation verification

**TestDataLocator Pattern**:
```typescript
const dealer = await TestDataLocator.getStableDealer();
// Returns: { id, name: "VAYUPUTRA AGENCIES", code: "VAYU001", tenant_id }
```

#### `indents`
```sql
CREATE TABLE indents (
  id UUID PRIMARY KEY,
  indent_number TEXT UNIQUE NOT NULL,
  dealer_id UUID REFERENCES dealers(id),
  status TEXT DEFAULT 'draft',
  tenant_id UUID REFERENCES tenants(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Test Usage**:
- Create via UI with `AUTO_QA_${Date.now()}_` prefix
- Verify creation via Sandwich Method
- Check status transitions (draft → submitted → approved)

**Sandwich Method Example**:
```typescript
// Before: No indent with this name
const indentsBefore = await executeQuery(
  'SELECT * FROM indents WHERE indent_number = $1',
  [`AUTO_QA_${timestamp}_IND001`]
);
expect(indentsBefore.length).toBe(0);

// UI Action: Create indent
await indentsPage.createIndent(indentData);

// After: Indent exists
const indentsAfter = await executeQuery(
  'SELECT * FROM indents WHERE indent_number = $1',
  [`AUTO_QA_${timestamp}_IND001`]
);
expect(indentsAfter.length).toBe(1);
expect(indentsAfter[0].status).toBe('draft');
```

#### `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  dealer_id UUID REFERENCES dealers(id),
  indent_id UUID REFERENCES indents(id),
  status TEXT DEFAULT 'draft',
  total_amount DECIMAL(10,2),
  tenant_id UUID REFERENCES tenants(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Test Usage**:
- Create via UI with `AUTO_QA_` prefix
- Verify order creation and status transitions
- Check relationship with indents

#### `order_items`
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Test Usage**:
- Verify items added to order
- Check quantity and pricing calculations
- Validate relationships (order → order_items → products)

---

### 3. Product Tables

#### `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  status TEXT DEFAULT 'active',
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Test Usage**:
- Stable prerequisite data (use TestDataLocator)
- Product selection in orders
- Category-based filtering

**TestDataLocator Pattern**:
```typescript
const product = await TestDataLocator.getStableProduct('Electronics');
// Returns: { id, name, sku, category_id }
```

#### `categories`
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Test Usage**:
- Stable prerequisite data
- Category selection in product filters

---

### 4. Tenant Tables

#### `tenants`
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Test Usage**:
- Multi-tenant isolation verification
- Ensure users only see their tenant's data

**Isolation Test Pattern**:
```typescript
// Verify IACS user cannot see Demo Tenant data
const iacsDealers = await executeQuery(
  'SELECT * FROM dealers WHERE tenant_id = $1',
  [iacsUser.tenant_id]
);
// Should only return IACS dealers, not Demo Tenant dealers
```

---

## Test Data Management Strategies

### 1. AUTO_QA_ Prefix Pattern

**Purpose**: Identify test data for manual cleanup (since framework cannot DELETE).

**Pattern**:
```typescript
const indentName = `AUTO_QA_${Date.now()}_Indent`;
const orderRef = `AUTO_QA_${Date.now()}_ORD`;
const productSKU = `AUTO_QA_${Date.now()}_SKU`;
```

**Benefits**:
- Easy to identify test data in database
- Timestamp ensures uniqueness
- Manual cleanup via SQL: `DELETE FROM indents WHERE indent_number LIKE 'AUTO_QA_%'`

---

### 2. TestDataLocator (Stable Prerequisite Data)

**Purpose**: Reuse existing stable data instead of creating new data.

**Implementation**: `e2e/src/support/data/TestDataLocator.ts`

```typescript
export class TestDataLocator {
  private static cache = new Map<string, any>();
  
  static async getStableDealer(): Promise<Dealer> {
    if (this.cache.has('dealer')) {
      return this.cache.get('dealer');
    }
    
    const dealers = await executeQuery<Dealer>(
      'SELECT * FROM dealers WHERE status = $1 ORDER BY created_at ASC LIMIT 1',
      ['active']
    );
    
    if (dealers.length === 0) {
      throw new Error('No stable dealer found');
    }
    
    this.cache.set('dealer', dealers[0]);
    return dealers[0];
  }
  
  static async getStableProduct(category?: string): Promise<Product> {
    const cacheKey = `product_${category || 'any'}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const query = category
      ? 'SELECT p.* FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name = $1 AND p.status = $2 LIMIT 1'
      : 'SELECT * FROM products WHERE status = $1 LIMIT 1';
    
    const params = category ? [category, 'active'] : ['active'];
    const products = await executeQuery<Product>(query, params);
    
    if (products.length === 0) {
      throw new Error(`No stable product found${category ? ` for category ${category}` : ''}`);
    }
    
    this.cache.set(cacheKey, products[0]);
    return products[0];
  }
}
```

**Usage in Tests**:
```typescript
When('I create order with dealer', async function ({ page }) {
  const dealer = await TestDataLocator.getStableDealer();
  await ordersPage.selectDealer(dealer.name);
});
```

**Benefits**:
- No hardcoded IDs
- Cached for performance (single query per test run)
- Reusable across all tests
- Easy to update centrally

---

### 3. Sandwich Method (Database Verification)

**Purpose**: Verify UI actions result in correct database state changes.

**Pattern**:
```typescript
When('I perform database-affecting action', async function ({ page }) {
  // 1. DB BEFORE - Query initial state
  const countBefore = await executeQuery(
    'SELECT COUNT(*) FROM orders WHERE dealer_id = $1',
    [dealerId]
  );
  
  // 2. UI ACTION - Perform user interaction
  await ordersPage.createOrder(orderData);
  
  // 3. DB AFTER - Verify state change
  const countAfter = await executeQuery(
    'SELECT COUNT(*) FROM orders WHERE dealer_id = $1',
    [dealerId]
  );
  
  expect(countAfter[0].count).toBe(countBefore[0].count + 1);
});
```

**When to Use**:
- ✅ Verify record creation
- ✅ Check status transitions
- ✅ Validate relationships
- ✅ Confirm authentication state

**When NOT to Use**:
- ❌ Pure UI validation (form errors, button states)
- ❌ Navigation assertions (URL changes)
- ❌ Visual confirmations (toast messages)

---

## Database Helper Utilities

### Location
`e2e/src/support/db-helper.ts`

### Common Functions

#### Generic Query Execution
```typescript
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}
```

#### User Queries
```typescript
export async function getUserByEmail(email: string): Promise<User> {
  const users = await executeQuery<User>(
    'SELECT * FROM auth.users WHERE email = $1',
    [email]
  );
  return users[0];
}

export async function hasUserCompletedMFA(userId: string): Promise<boolean> {
  const sessions = await executeQuery<Session>(
    'SELECT * FROM auth.sessions WHERE user_id = $1 AND aal = $2',
    [userId, 'aal2']
  );
  return sessions.length > 0;
}
```

#### Session Queries
```typescript
export async function getUserSessions(userId: string): Promise<Session[]> {
  return executeQuery<Session>(
    'SELECT * FROM auth.sessions WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
}

export async function getLatestSession(userId: string): Promise<Session> {
  const sessions = await getUserSessions(userId);
  return sessions[0];
}
```

---

## Multi-Tenant Data Isolation

### Tenant Filtering

All queries should respect tenant boundaries:

```typescript
// ✅ CORRECT - Tenant-aware query
const dealers = await executeQuery(
  'SELECT * FROM dealers WHERE tenant_id = $1',
  [user.tenant_id]
);

// ❌ WRONG - Missing tenant filter
const dealers = await executeQuery('SELECT * FROM dealers');
```

### Tenant Isolation Tests

Verify users cannot access other tenant's data:

```gherkin
@O2C-050 @multi-user @iacs-md @demo-tenant
Scenario Outline: Tenant isolation for dealers
  Given I am logged in as "<User>"
  When I view dealers list
  Then I should only see dealers from "<Tenant>"
  
  Examples:
    | User            | Tenant      |
    | IACS MD User    | IACS        |
    | Demo Tenant User| Demo Tenant |
```

---

## Performance Considerations

### Connection Pooling

```typescript
// db-helper.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum 10 connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Query Optimization

- Use indexes on frequently queried columns
- Limit result sets with `LIMIT` clause
- Cache stable data with TestDataLocator
- Avoid `SELECT *` (specify needed columns)

### Parallel Test Safety

- Each test uses unique data (`AUTO_QA_${Date.now()}_${Math.random()}`)
- Read-only queries have no conflicts
- No shared state between tests

---

## Common Query Patterns

### Check Record Existence
```typescript
const exists = await executeQuery(
  'SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = $1)',
  [orderNumber]
);
return exists[0].exists; // true/false
```

### Count Records
```typescript
const count = await executeQuery(
  'SELECT COUNT(*) FROM indents WHERE status = $1',
  ['draft']
);
return count[0].count;
```

### Get Latest Record
```typescript
const latest = await executeQuery(
  'SELECT * FROM orders ORDER BY created_at DESC LIMIT 1'
);
return latest[0];
```

### Join Tables
```typescript
const orderWithItems = await executeQuery(`
  SELECT o.*, oi.product_id, oi.quantity
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  WHERE o.order_number = $1
`, [orderNumber]);
```

---

## Troubleshooting

### Issue: "No stable data found"
**Cause**: TestDataLocator cannot find prerequisite data.
**Solution**: Ensure stable data exists in database (dealers, products, categories).

### Issue: "Connection timeout"
**Cause**: Database connection pool exhausted.
**Solution**: Check for unclosed connections, increase pool size.

### Issue: "Duplicate key violation"
**Cause**: Test data with same name already exists.
**Solution**: Ensure `Date.now()` is used in test data names for uniqueness.

---

## References

- **Database Helper**: `e2e/src/support/db-helper.ts`
- **TestDataLocator**: `e2e/src/support/data/TestDataLocator.ts`
- **Sandwich Method**: `docs/knowledge-base/architecture.md`
- **Multi-Tenant Auth**: `docs/framework-enhancements/03-multi-user-auth/`
