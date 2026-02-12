# Framework Enhancement Plan - Phase 4-5: API & Mobile Testing

## 📋 Overview

This plan outlines the implementation strategy for Phase 4 (API Testing Infrastructure) and Phase 5 (Mobile Browser Testing) for the DAEE Platform Automation Framework. These phases extend the framework's capabilities beyond UI testing to provide comprehensive test coverage.

**Status**: 📅 Planned (Not Yet Implemented)  
**Prerequisites**: Phase 1-3 Complete ✅  
**Estimated Effort**: 2-3 weeks  
**Priority**: Medium (implement when needed)

---

## 🎯 Phase 4: API Testing Infrastructure

### Objectives

1. Enable API-level testing for faster test execution
2. Support hybrid UI + API test patterns (API setup, UI verify)
3. Provide multi-tenant API authentication
4. Reduce test execution time by using API for prerequisite setup

### Benefits

- **Speed**: API tests run 10-20x faster than UI tests
- **Reliability**: Less flaky than UI tests (no page load issues)
- **Efficiency**: Use API for test data setup, UI for critical user journeys
- **Coverage**: Test backend logic without UI dependencies

---

## 🔧 Phase 4 Implementation Tasks

### 4.1 ApiClient Class with Multi-Tenant Support

**File**: `e2e/src/support/api/ApiClient.ts`

**Requirements**:
- Reuse authenticated sessions from UI tests (storage state)
- Support all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Multi-tenant request routing (tenant-specific headers/URLs)
- Automatic token refresh handling
- Request/response logging for debugging
- Type-safe request/response interfaces

**Implementation Outline**:

```typescript
import { request, APIRequestContext, Page } from '@playwright/test';
import { getUserProfile } from '../config/user-profiles.config';

export interface ApiClientOptions {
  baseURL: string;
  storageState?: string;
  extraHeaders?: Record<string, string>;
  tenant?: string;
  userProfile?: string;
}

export class ApiClient {
  private context: APIRequestContext | null = null;
  private options: ApiClientOptions;

  constructor(options: ApiClientOptions) {
    this.options = options;
  }

  /**
   * Initialize API context with authentication
   */
  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.options.baseURL,
      storageState: this.options.storageState,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        ...this.options.extraHeaders,
      },
    });
  }

  /**
   * GET request
   */
  async get<T>(url: string, options?: any): Promise<T> {
    // Implementation
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, options?: any): Promise<T> {
    // Implementation
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, options?: any): Promise<T> {
    // Implementation
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, options?: any): Promise<T> {
    // Implementation
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options?: any): Promise<T> {
    // Implementation
  }

  /**
   * Dispose of API context
   */
  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
    }
  }
}
```

**Key Features**:
- Constructor accepts user profile or storage state path
- Automatic authentication using stored session
- Type-safe generic methods for request/response
- Error handling with retry logic
- Response validation utilities

---

### 4.2 API Test Fixtures

**File**: `e2e/src/support/api/api-fixtures.ts`

**Purpose**: Provide pre-configured API clients for different user profiles

**Implementation Outline**:

```typescript
import { test as base } from '@playwright/test';
import { ApiClient } from './ApiClient';
import { getUserProfile } from '../config/user-profiles.config';

type ApiFixtures = {
  iacsApiClient: ApiClient;
  iacsFinanceApiClient: ApiClient;
  iacsWarehouseApiClient: ApiClient;
  superAdminApiClient: ApiClient;
  demoApiClient: ApiClient;
};

export const test = base.extend<ApiFixtures>({
  iacsApiClient: async ({ request }, use) => {
    const profile = getUserProfile('iacs-md');
    const client = new ApiClient({
      baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
      storageState: profile.storageStatePath,
    });
    await client.init();
    await use(client);
    await client.dispose();
  },

  iacsFinanceApiClient: async ({ request }, use) => {
    const profile = getUserProfile('iacs-finance-admin');
    const client = new ApiClient({
      baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
      storageState: profile.storageStatePath,
    });
    await client.init();
    await use(client);
    await client.dispose();
  },

  // ... other fixtures for each user profile
});

export { expect } from '@playwright/test';
```

**Usage in Tests**:
```typescript
import { test, expect } from '../support/api/api-fixtures';

test('API: Create order via API', async ({ iacsApiClient }) => {
  const order = await iacsApiClient.post('/api/orders', {
    dealerId: 'DEALER-001',
    items: [{ productId: 'PROD-001', quantity: 5 }],
  });
  
  expect(order.status).toBe('draft');
  expect(order.items).toHaveLength(1);
});
```

---

### 4.3 Hybrid UI + API Test Patterns

**Purpose**: Use API for setup/teardown, UI for critical user journeys

**Pattern 1: API Setup, UI Verification**

```typescript
test('Order workflow: Create via API, verify in UI', async ({ 
  page, 
  iacsApiClient 
}) => {
  // SETUP: Create order via API (fast)
  const order = await iacsApiClient.post('/api/orders', {
    dealerId: 'DEALER-001',
    items: [{ productId: 'PROD-001', quantity: 5 }],
  });

  // VERIFY: Check order appears in UI
  await page.goto('/orders');
  await expect(page.getByText(order.orderNumber)).toBeVisible();
  
  // UI INTERACTION: Submit order
  await page.getByText(order.orderNumber).click();
  await page.getByRole('button', { name: 'Submit' }).click();
  
  // VERIFY: Check status via API (fast)
  const updatedOrder = await iacsApiClient.get(`/api/orders/${order.id}`);
  expect(updatedOrder.status).toBe('submitted');
});
```

**Pattern 2: UI Action, API Verification**

```typescript
test('Create indent: UI action, verify via API', async ({ 
  page, 
  iacsApiClient 
}) => {
  // UI ACTION: Create indent
  await page.goto('/o2c/indents');
  await page.getByRole('button', { name: 'Create Indent' }).click();
  // ... fill form, submit
  
  const indentNumber = await page.locator('[data-testid="indent-number"]').textContent();
  
  // VERIFY: Check indent exists via API
  const indent = await iacsApiClient.get(`/api/indents?number=${indentNumber}`);
  expect(indent.status).toBe('draft');
  expect(indent.createdBy).toBe('md@idhyahagri.com');
});
```

**Pattern 3: Pure API Testing**

```typescript
test('API: Dealer CRUD operations', async ({ iacsApiClient }) => {
  // CREATE
  const dealer = await iacsApiClient.post('/api/dealers', {
    name: 'AUTO_QA_Dealer_001',
    gstin: '22AAAAA0000A1Z5',
  });
  expect(dealer.id).toBeDefined();
  
  // READ
  const fetchedDealer = await iacsApiClient.get(`/api/dealers/${dealer.id}`);
  expect(fetchedDealer.name).toBe(dealer.name);
  
  // UPDATE
  const updated = await iacsApiClient.patch(`/api/dealers/${dealer.id}`, {
    name: 'AUTO_QA_Dealer_Updated',
  });
  expect(updated.name).toBe('AUTO_QA_Dealer_Updated');
  
  // DELETE (if supported)
  await iacsApiClient.delete(`/api/dealers/${dealer.id}`);
});
```

---

### 4.4 API Helper Utilities

**File**: `e2e/src/support/api/api-helpers.ts`

**Utilities**:

```typescript
/**
 * Wait for async job completion via polling
 */
export async function waitForJobCompletion(
  apiClient: ApiClient,
  jobId: string,
  timeout: number = 30000
): Promise<any> {
  // Implementation with polling
}

/**
 * Create test data via API
 */
export async function createTestDealer(
  apiClient: ApiClient,
  data?: Partial<Dealer>
): Promise<Dealer> {
  // Implementation
}

/**
 * Bulk create test data
 */
export async function bulkCreateOrders(
  apiClient: ApiClient,
  count: number
): Promise<Order[]> {
  // Implementation
}

/**
 * Cleanup test data via API
 */
export async function cleanupTestData(
  apiClient: ApiClient,
  prefix: string = 'AUTO_QA_'
): Promise<void> {
  // Implementation
}
```

---

### 4.5 API Test Organization

**Directory Structure**:
```
e2e/
├── tests/
│   └── api/
│       ├── orders.api.spec.ts
│       ├── dealers.api.spec.ts
│       ├── indents.api.spec.ts
│       └── products.api.spec.ts
├── src/
│   └── support/
│       └── api/
│           ├── ApiClient.ts
│           ├── api-fixtures.ts
│           ├── api-helpers.ts
│           └── types/
│               ├── order-types.ts
│               ├── dealer-types.ts
│               └── indent-types.ts
```

**Test File Example**:
```typescript
// e2e/tests/api/orders.api.spec.ts
import { test, expect } from '../../src/support/api/api-fixtures';

test.describe('Orders API', () => {
  test('should create order with valid data', async ({ iacsApiClient }) => {
    // Test implementation
  });

  test('should reject order with invalid dealer', async ({ iacsApiClient }) => {
    // Test implementation
  });

  test('should list orders with pagination', async ({ iacsApiClient }) => {
    // Test implementation
  });
});
```

---

### 4.6 npm Scripts for API Tests

**Add to package.json**:
```json
{
  "scripts": {
    "test:api": "playwright test e2e/tests/api/",
    "test:api:dev": "TEST_EXECUTION_MODE=development playwright test e2e/tests/api/",
    "test:api:orders": "playwright test e2e/tests/api/orders.api.spec.ts",
    "test:api:dealers": "playwright test e2e/tests/api/dealers.api.spec.ts",
    "test:api:fast": "playwright test e2e/tests/api/ --grep '@fast'",
    "test:hybrid": "playwright test --grep '@hybrid'"
  }
}
```

---

## 📱 Phase 5: Mobile Browser Testing

### Objectives

1. Enable mobile browser testing (Chrome Android, Safari iOS)
2. Support responsive UI validation
3. Provide mobile-specific interaction helpers (swipe, tap, pinch)
4. Test mobile-first features and layouts

### Benefits

- **Comprehensive Coverage**: Test across desktop and mobile browsers
- **Responsive UI**: Validate mobile-specific layouts and breakpoints
- **Touch Interactions**: Test gestures not available on desktop
- **User Experience**: Ensure mobile users have optimal experience

---

## 🔧 Phase 5 Implementation Tasks

### 5.1 Mobile Browser Projects

**File**: `playwright.config.ts`

**Add Mobile Projects**:

```typescript
{
  name: 'mobile-chrome-android',
  use: {
    ...devices['Pixel 5'],
    storageState: 'e2e/.auth/admin.json',
  },
  dependencies: ['setup'],
  testMatch: /(?!login).*mobile.*\.feature/,
  grep: /@mobile/,
},
{
  name: 'mobile-safari-ios',
  use: {
    ...devices['iPhone 13'],
    storageState: 'e2e/.auth/admin.json',
  },
  dependencies: ['setup'],
  testMatch: /(?!login).*mobile.*\.feature/,
  grep: /@mobile/,
},
```

**Execution Scripts**:
```json
{
  "scripts": {
    "test:mobile": "playwright test --project=mobile-chrome-android --project=mobile-safari-ios",
    "test:mobile:android": "playwright test --project=mobile-chrome-android",
    "test:mobile:ios": "playwright test --project=mobile-safari-ios",
    "test:mobile:dev": "TEST_EXECUTION_MODE=development TEST_WORKERS=1 TEST_HEADED=true playwright test --project=mobile-chrome-android"
  }
}
```

---

### 5.2 MobileHelper Class

**File**: `e2e/src/support/helpers/MobileHelper.ts`

**Implementation Outline**:

```typescript
import { Page, Locator } from '@playwright/test';

export interface SwipeOptions {
  direction: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
}

export class MobileHelper {
  constructor(private readonly page: Page) {}

  /**
   * Swipe gesture
   */
  async swipe(locator: Locator, options: SwipeOptions): Promise<void> {
    const box = await locator.boundingBox();
    if (!box) throw new Error('Element not visible');

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    let endX = startX;
    let endY = startY;

    const distance = options.distance || 100;

    switch (options.direction) {
      case 'up':
        endY = startY - distance;
        break;
      case 'down':
        endY = startY + distance;
        break;
      case 'left':
        endX = startX - distance;
        break;
      case 'right':
        endX = startX + distance;
        break;
    }

    await this.page.touchscreen.tap(startX, startY);
    await this.page.touchscreen.move(endX, endY);
  }

  /**
   * Pinch zoom gesture
   */
  async pinchZoom(locator: Locator, scale: number): Promise<void> {
    // Implementation
  }

  /**
   * Open mobile menu (hamburger)
   */
  async openMobileMenu(): Promise<void> {
    const menuButton = this.page.getByRole('button', { name: /menu/i });
    await menuButton.click();
  }

  /**
   * Check if element is in viewport (mobile)
   */
  async isInViewport(locator: Locator): Promise<boolean> {
    const box = await locator.boundingBox();
    if (!box) return false;

    const viewport = this.page.viewportSize();
    if (!viewport) return false;

    return (
      box.y >= 0 &&
      box.x >= 0 &&
      box.y + box.height <= viewport.height &&
      box.x + box.width <= viewport.width
    );
  }

  /**
   * Scroll element into viewport (mobile)
   */
  async scrollIntoViewport(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Get device orientation
   */
  async getOrientation(): Promise<'portrait' | 'landscape'> {
    const viewport = this.page.viewportSize();
    if (!viewport) throw new Error('No viewport');

    return viewport.height > viewport.width ? 'portrait' : 'landscape';
  }

  /**
   * Rotate device (simulate orientation change)
   */
  async rotate(): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) throw new Error('No viewport');

    await this.page.setViewportSize({
      width: viewport.height,
      height: viewport.width,
    });
  }
}
```

---

### 5.3 Mobile Test Patterns

**Feature File**: `e2e/features/mobile/orders-mobile.feature`

```gherkin
Feature: Mobile Orders Management

  Background:
    Given I am on a mobile device

  @mobile @smoke @p1
  Scenario: Mobile user views orders list
    Given I am logged in as "IACS MD User"
    When I navigate to orders page on mobile
    Then I should see the mobile-optimized orders list
    And the hamburger menu should be visible
    And pagination should be mobile-friendly

  @mobile @regression @p2
  Scenario: Mobile user filters orders
    Given I am logged in as "IACS MD User"
    And I am on the orders page
    When I open the mobile filter drawer
    And I select status "Submitted"
    And I apply filters
    Then I should see only submitted orders
    And the filter drawer should close

  @mobile @regression @p2
  Scenario: Mobile user swipes to refresh orders
    Given I am logged in as "IACS MD User"
    And I am on the orders page
    When I swipe down to refresh
    Then the orders list should reload
    And I should see the latest orders
```

**Step Definitions**:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { MobileHelper } from '../../support/helpers/MobileHelper';

Given('I am on a mobile device', async ({ page }) => {
  // Verify mobile viewport
  const viewport = page.viewportSize();
  expect(viewport?.width).toBeLessThan(768);
});

When('I open the mobile filter drawer', async ({ page }) => {
  const mobileHelper = new MobileHelper(page);
  await page.getByRole('button', { name: 'Filters' }).click();
  await page.waitForSelector('[data-testid="filter-drawer"]', { state: 'visible' });
});

When('I swipe down to refresh', async ({ page }) => {
  const mobileHelper = new MobileHelper(page);
  const container = page.locator('[data-testid="orders-container"]');
  await mobileHelper.swipe(container, { direction: 'down', distance: 150 });
});
```

---

### 5.4 Responsive UI Testing Patterns

**Test Breakpoints**:

```typescript
const BREAKPOINTS = {
  mobile: { width: 375, height: 667 },    // iPhone SE
  tablet: { width: 768, height: 1024 },   // iPad
  desktop: { width: 1920, height: 1080 }, // Desktop
};

test.describe('Responsive Layout Tests', () => {
  for (const [device, viewport] of Object.entries(BREAKPOINTS)) {
    test(`should render correctly on ${device}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/orders');
      
      // Device-specific assertions
      if (device === 'mobile') {
        await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
        await expect(page.locator('.desktop-sidebar')).toBeHidden();
      } else {
        await expect(page.locator('.desktop-sidebar')).toBeVisible();
      }
    });
  }
});
```

---

### 5.5 Mobile-Specific Tags

**Add to Tests**:
- `@mobile` - Mobile-specific tests
- `@mobile:android` - Android-specific
- `@mobile:ios` - iOS-specific
- `@responsive` - Responsive layout tests
- `@touch` - Touch interaction tests

---

## 📊 Implementation Checklist

### Phase 4: API Testing Infrastructure

- [ ] **4.1**: Implement ApiClient class
  - [ ] HTTP methods (GET, POST, PUT, PATCH, DELETE)
  - [ ] Multi-tenant support
  - [ ] Authentication via storage state
  - [ ] Error handling and retry logic
  - [ ] Type-safe request/response

- [ ] **4.2**: Create API test fixtures
  - [ ] Fixture for each user profile
  - [ ] Auto-init and dispose
  - [ ] Shared context across tests

- [ ] **4.3**: Document hybrid patterns
  - [ ] API setup, UI verify
  - [ ] UI action, API verify
  - [ ] Pure API testing

- [ ] **4.4**: Implement API helpers
  - [ ] Job polling utilities
  - [ ] Test data creation
  - [ ] Bulk operations
  - [ ] Cleanup utilities

- [ ] **4.5**: Organize API tests
  - [ ] Create test files per module
  - [ ] Define type interfaces
  - [ ] Add code examples

- [ ] **4.6**: Add npm scripts
  - [ ] test:api
  - [ ] test:api:module
  - [ ] test:hybrid

### Phase 5: Mobile Browser Testing

- [ ] **5.1**: Configure mobile projects
  - [ ] Chrome Android project
  - [ ] Safari iOS project
  - [ ] Mobile test routing (@mobile tag)

- [ ] **5.2**: Implement MobileHelper
  - [ ] Swipe gestures
  - [ ] Pinch zoom
  - [ ] Mobile menu helpers
  - [ ] Viewport utilities
  - [ ] Orientation helpers

- [ ] **5.3**: Create mobile test patterns
  - [ ] Mobile feature files
  - [ ] Mobile step definitions
  - [ ] Touch interaction examples

- [ ] **5.4**: Responsive UI tests
  - [ ] Breakpoint testing
  - [ ] Layout validation
  - [ ] Mobile-specific assertions

- [ ] **5.5**: Add mobile tags
  - [ ] @mobile
  - [ ] @mobile:android
  - [ ] @mobile:ios
  - [ ] @responsive

---

## 📚 Documentation Tasks

- [ ] Create API testing guide
- [ ] Document hybrid UI+API patterns
- [ ] Create mobile testing guide
- [ ] Update cursor rules with API/mobile patterns
- [ ] Add examples to framework documentation

---

## 🎯 Success Criteria

### Phase 4 Success Criteria

✅ API tests run 10x faster than equivalent UI tests  
✅ All CRUD operations testable via API  
✅ Hybrid tests reduce setup time by 50%+  
✅ API tests integrated into CI/CD pipeline  
✅ Clear documentation for team adoption

### Phase 5 Success Criteria

✅ Mobile tests run on Android and iOS browsers  
✅ Touch gestures work reliably  
✅ Responsive layouts validated across breakpoints  
✅ Mobile-specific features tested  
✅ Mobile tests integrated into regression suite

---

## 🚀 Getting Started (When Ready)

### Prerequisites

1. ✅ Phase 1-3 complete
2. ✅ Framework stable and team trained
3. ✅ Need identified for API/mobile testing

### Implementation Order

1. **Start with Phase 4.1-4.2**: Basic API infrastructure
2. **Add Phase 4.3**: Hybrid patterns for specific modules
3. **Expand Phase 4.4-4.6**: Full API test suite
4. **Move to Phase 5.1-5.2**: Mobile infrastructure
5. **Complete Phase 5.3-5.5**: Mobile test coverage

### Estimated Timeline

- **Phase 4 (API)**: 1-2 weeks
  - Week 1: ApiClient, fixtures, basic patterns
  - Week 2: Helpers, full test suite, documentation

- **Phase 5 (Mobile)**: 1 week
  - Days 1-3: Mobile projects, MobileHelper
  - Days 4-5: Mobile tests, documentation

---

## 📝 Notes

- **API Testing**: Only implement if backend APIs are stable and well-documented
- **Mobile Testing**: Prioritize based on mobile traffic percentage
- **Incremental Adoption**: Start with one module, expand gradually
- **Team Training**: Ensure team understands new patterns before rollout

---

**Plan Created**: February 12, 2026  
**Status**: 📅 Ready for Future Implementation  
**Contact**: Framework Team for questions

