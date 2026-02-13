# Locator Strategy Guide - Top 5% SDET Best Practices

## Framework Locator Priority Order

The DAEE automation framework follows a **semantic-first** locator strategy with the following priority order:

### 1. **data-testid** (Highest Priority - **IF Available**)
```typescript
// ✅ BEST: Explicit test identifier (most stable)
page.locator('[data-testid="submit-order-btn"]')
page.locator('[data-testid="gstr1-seller-gstin-dropdown"]')
```

**When to Use:**
- ✅ Critical user flows (checkout, payment, data submission)
- ✅ Complex components without semantic roles
- ✅ Dynamic content where text/roles change frequently
- ✅ Components that need explicit test identification

**Pros:**
- 🎯 **Most stable** - Purpose-built for testing, won't change with UI refactoring
- 🚀 **Fast** - Direct DOM query, no accessibility tree traversal
- 🔒 **Explicit** - Clear intent: "This element is for testing"
- 🛡️ **Resilient** - Survives CSS class changes, text changes, layout shifts

**Cons:**
- ❌ **Requires dev cooperation** - Frontend team must add attributes
- ❌ **Not always available** - Legacy code or third-party components may lack them
- ❌ **Maintenance overhead** - Need to add/update attributes as UI evolves
- ❌ **Not semantic** - Doesn't verify accessibility (screen readers, keyboard nav)

---

### 2. **getByRole with Accessible Name** (Recommended Default)
```typescript
// ✅ EXCELLENT: Semantic + accessible (recommended default)
page.getByRole('button', { name: 'Submit Order' })
page.getByRole('textbox', { name: 'Email Address' })
page.getByRole('combobox', { name: 'Select Category' })
page.getByRole('heading', { name: 'GSTR-1 Review' })
```

**When to Use:**
- ✅ **Default choice** for most elements
- ✅ Buttons, links, form fields, headings
- ✅ When you want to verify accessibility
- ✅ When element has clear semantic role

**Pros:**
- ♿ **Accessibility-first** - Verifies screen reader compatibility
- 🎯 **Semantic** - Tests what users actually interact with
- 🔄 **Self-documenting** - Code reads like user actions
- 🛡️ **Resilient** - Survives CSS changes, layout shifts
- ✅ **No dev dependency** - Works with existing accessible HTML

**Cons:**
- ⚠️ **Requires accessible names** - Element must have aria-label, label, or visible text
- ⚠️ **Can be slower** - Traverses accessibility tree
- ⚠️ **May break if text changes** - If button text changes, test breaks (but that's good - catches UI changes!)

---

### 3. **getByPlaceholder** (For Input Fields)
```typescript
// ✅ GOOD: For input fields with placeholders
page.getByPlaceholder('Enter your email')
page.getByPlaceholder('Search products...')
```

**When to Use:**
- ✅ Input fields with placeholder text
- ✅ Search boxes, filters
- ✅ When label is not available

**Pros:**
- 🎯 **Clear intent** - Placeholder describes expected input
- 🔄 **User-focused** - Matches what users see

**Cons:**
- ⚠️ **Less stable** - Placeholders may change with UX updates
- ⚠️ **Not accessible** - Placeholders aren't always read by screen readers

---

### 4. **getByText** (For Content Verification)
```typescript
// ✅ GOOD: For verifying content, messages, labels
page.getByText('Order created successfully', { exact: true })
page.getByText(/Successfully created/i) // Regex for partial match
```

**When to Use:**
- ✅ Toast notifications, error messages
- ✅ Content verification (not interaction)
- ✅ When role-based locators don't work

**Pros:**
- 🎯 **Content-focused** - Verifies what user sees
- 🔄 **Flexible** - Supports exact and regex matching

**Cons:**
- ⚠️ **Fragile** - Breaks if text changes (but that's intentional - catches content changes)
- ⚠️ **Not for interaction** - Use for verification, not clicking/filling

---

### 5. **getByLabel** (For Form Fields)
```typescript
// ✅ GOOD: For form fields with labels
page.getByLabel('Product Name')
page.getByLabel('Quantity')
page.getByLabel('Email Address')
```

**When to Use:**
- ✅ Form inputs with associated `<label>` elements
- ✅ When you want to verify label association
- ✅ Accessible form testing

**Pros:**
- ♿ **Accessible** - Verifies proper label association
- 🎯 **Semantic** - Matches form structure
- 🔄 **User-focused** - Users click labels to focus inputs

**Cons:**
- ⚠️ **Requires labels** - Form must have proper label elements
- ⚠️ **May break if label text changes**

---

### 6. **ID Selectors** (Last Resort)
```typescript
// ⚠️ ACCEPTABLE: Only when semantic locators fail
page.locator('input#email')
page.locator('#submit-btn')
```

**When to Use:**
- ⚠️ **Last resort** - Only when semantic locators don't work
- ⚠️ Legacy code without semantic structure
- ⚠️ Third-party components

**Pros:**
- 🚀 **Fast** - Direct DOM query

**Cons:**
- ❌ **Fragile** - IDs may change during refactoring
- ❌ **Not semantic** - Doesn't verify accessibility
- ❌ **Not user-focused** - Tests implementation, not user experience

---

## ❌ FORBIDDEN Locators (Never Use)

### CSS Class Selectors
```typescript
// ❌ NEVER: Tailwind/utility classes change frequently
page.locator('.bg-blue-500')
page.locator('.text-gray-900')
page.locator('.btn-primary') // Even component classes can change
```

**Why Forbidden:**
- 🚨 **Highly unstable** - Tailwind classes change with every design update
- 🚨 **Not semantic** - Tests styling, not functionality
- 🚨 **Breaks easily** - Design system updates break tests

### XPath Selectors
```typescript
// ❌ NEVER: Brittle and hard to maintain
page.locator('//div[@class="container"]/button')
page.locator('//table//tr[2]//td[3]')
```

**Why Forbidden:**
- 🚨 **Brittle** - Breaks with any DOM structure change
- 🚨 **Hard to read** - Complex syntax, difficult to maintain
- 🚨 **Not semantic** - Tests structure, not meaning

---

## Real-World Example: GSTR-1 Page

Let's analyze the locators used in `GSTR1Page.ts`:

### ✅ Good Examples

```typescript
// 1. Semantic role-based (RECOMMENDED)
this.pageDescription = page.getByText('Review outward supplies and export for GST filing');

// 2. Label-based for form fields (GOOD)
const sellerGSTINLabel = page.locator('label').filter({ hasText: /seller gstin/i });
const combobox = sellerGSTINLabel.locator('..').getByRole('combobox');

// 3. Role + text filter (GOOD)
this.errorMessage = page.getByRole('alert');
```

### ⚠️ Workaround Examples (When Semantic Fails)

```typescript
// Workaround: CardTitle renders as <div>, not <h1>
// Used data-slot attribute as fallback
this.pageTitle = page.locator('[data-slot="card-title"]').filter({ hasText: 'GSTR-1 Review' })
  .or(page.getByText('GSTR-1 Review', { exact: true }));

// Workaround: Empty state in conditional render
// Used CSS class + text as fallback
this.emptyStateMessage = page.locator('span.text-slate-500')
  .filter({ hasText: 'Select filters to load' })
  .or(page.getByText('Select filters to load', { exact: false }));
```

**Why Workarounds Were Needed:**
- ShadCN components don't always render semantic HTML
- Conditional rendering makes semantic locators unreliable
- Fallback strategies ensure tests work despite component limitations

---

## Recommendation: Hybrid Strategy

### **For New Features (Ideal State)**

1. **Request data-testid for critical flows:**
   ```typescript
   // Frontend: Add data-testid
   <Button data-testid="gstr1-export-excel-btn">Export Excel</Button>
   
   // Test: Use data-testid
   page.locator('[data-testid="gstr1-export-excel-btn"]')
   ```

2. **Use semantic locators as default:**
   ```typescript
   // Most elements: Use semantic locators
   page.getByRole('button', { name: 'Submit' })
   page.getByLabel('Email Address')
   ```

3. **Fallback chain for complex components:**
   ```typescript
   // Try semantic first, fallback to data-testid, then workarounds
   const submitBtn = page.getByRole('button', { name: 'Submit' })
     .or(page.locator('[data-testid="submit-btn"]'))
     .or(page.locator('button[type="submit"]'));
   ```

### **For Existing Code (Current State)**

1. **Use semantic locators** (getByRole, getByLabel) as primary strategy
2. **Add data-testid incrementally** for:
   - Critical user flows (checkout, payments, exports)
   - Complex components (tables, modals, dynamic content)
   - Flaky tests that need extra stability
3. **Document workarounds** when semantic locators fail

---

## Decision Matrix: When to Use What?

| Element Type | Primary Choice | Fallback | Avoid |
|--------------|----------------|----------|-------|
| **Buttons** | `getByRole('button', { name })` | `data-testid` | CSS classes, XPath |
| **Form Fields** | `getByLabel()` or `getByPlaceholder()` | `data-testid` | CSS classes, IDs |
| **Links** | `getByRole('link', { name })` | `getByText()` | CSS classes |
| **Headings** | `getByRole('heading', { name })` | `getByText()` | CSS classes |
| **Dropdowns** | `getByRole('combobox', { name })` | `data-testid` | CSS classes |
| **Modals** | `getByRole('dialog')` | `data-testid` | CSS classes |
| **Error Messages** | `getByRole('alert')` | `getByText()` | CSS classes |
| **Tables** | `getByRole('table')` + `getByRole('cell')` | `data-testid` | CSS classes, XPath |
| **Dynamic Content** | `data-testid` | `getByText()` with regex | CSS classes |
| **Third-party Components** | `data-testid` | Workarounds | CSS classes |

---

## Best Practices Summary

### ✅ DO:
1. **Start with semantic locators** (`getByRole`, `getByLabel`) - they're accessible and user-focused
2. **Request data-testid** for critical flows and complex components
3. **Use fallback chains** when semantic locators are unreliable
4. **Document workarounds** - explain why semantic locators failed
5. **Verify accessibility** - semantic locators ensure accessible UI

### ❌ DON'T:
1. **Don't use CSS classes** - Tailwind/utility classes change frequently
2. **Don't use XPath** - Brittle and hard to maintain
3. **Don't rely solely on data-testid** - Missing accessibility verification
4. **Don't use IDs** unless absolutely necessary
5. **Don't hardcode text** without considering i18n

---

## Framework-Specific Guidelines

### Current Framework Approach (DAEE)

**Priority Order:**
1. `data-testid` (if available) - Request from frontend team
2. `getByRole` with accessible name - **Default choice**
3. `getByPlaceholder` - For inputs
4. `getByText` - For content verification
5. `getByLabel` - For form fields
6. ID selectors - Last resort

**ShadCN/Radix Components:**
- Use component library (`SelectComponent`, `DialogComponent`) when available
- Fallback to semantic locators when component library doesn't cover the case
- Document workarounds for non-semantic component rendering

**Example from Framework:**
```typescript
// ✅ Framework pattern: Use component library
await selectComponent.selectByLabel('Category', 'Electronics');

// ✅ Framework pattern: Semantic locator fallback
await page.getByRole('combobox', { name: 'Category' }).click();
await page.getByRole('option', { name: 'Electronics' }).click();
```

---

## Conclusion

**For DAEE Framework:**
- ✅ **Use semantic locators** (`getByRole`, `getByLabel`) as **default**
- ✅ **Request data-testid** for critical flows and complex components
- ✅ **Document workarounds** when semantic locators fail
- ❌ **Never use CSS classes** or XPath

**Why This Approach:**
- 🎯 **Accessibility-first** - Semantic locators verify accessible UI
- 🛡️ **Resilient** - Survives CSS changes, layout shifts
- 📚 **Self-documenting** - Code reads like user actions
- 🔄 **Maintainable** - Clear priority order, easy to follow

**Trade-offs:**
- Semantic locators may require frontend accessibility improvements
- data-testid requires dev cooperation but provides maximum stability
- Hybrid approach balances stability with accessibility verification

---

## References

- Framework Rules: `.cursor/rules/sr-automation-engineer-persona.mdc` - "Semantic Locator Strategy"
- Framework Patterns: `.cursor/rules/automation-patterns.mdc` - "Semantic Locator Strategies"
- Playwright Best Practices: https://playwright.dev/docs/selectors#best-practices
- Accessibility Testing: https://playwright.dev/docs/accessibility-testing
