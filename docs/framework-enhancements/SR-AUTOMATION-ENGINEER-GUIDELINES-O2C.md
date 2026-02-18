# Sr Automation Engineer Guidelines (O2C & General)

**Source**: [O2C-AUTOMATION-ARCHITECT-REVIEW.md](../modules/o2c/reviews/O2C-AUTOMATION-ARCHITECT-REVIEW.md)  
**Audience**: Sr Automation Engineers  
**Scope**: Practices that apply to O2C and other modules unless stated otherwise.

---

## 1. Documentation (Mandatory)

- **After adding/changing tests**: Update `test-cases.md`, `gap-analysis.md`, `TEST_CASE_REGISTRY.md`, and `test-impact-matrix.md`. Resolve or open gaps; set registry status (✅ / 📋).
- **After a batch/release**: Update `implementation-history.md` and create/update `IMPL-###` with tests created/updated and coverage.
- **knowledge.md**: Keep "Test Coverage" and "Known Issues" aligned with current automation.

---

## 2. Waits (Mandatory)

- **Do not add** `page.waitForTimeout(ms)`.
- **Use instead**:
  - `expect(locator).toBeVisible({ timeout })` / `.toBeHidden()`
  - `page.waitForResponse(...)` for API-driven UI
  - `PollingHelper.pollUntil(condition, options)` for debounced or async UI
- **Existing timeouts**: Refactor out in a dedicated change; add TODO where replacement is deferred.

---

## 3. Test Data & Profiles

- Prefer **TestDataLocator** (or a single profile table in docs) for dealers, warehouses, products.
- Tag scenarios with **@profile-P-*** when using a documented profile (e.g. P-APPROVAL, P-REJECT).
- Use **AUTO_QA_** prefix for transactional data created in tests.
- Document **profile → dealer/warehouse** in feature file header or knowledge.

---

## 4. Sandwich Method (DB Verification)

- Use **read-only** DB checks for: indent/order creation (count before/after), status transitions (submitted, approved, rejected), SO/back_order after Process Workflow.
- **No** DELETE/UPDATE in tests; SELECT only.
- Import from `support/db-helper`; keep assertions optional where DB is not always available.

---

## 5. Deduplication (Scenario Hashes)

- **TEST_CASE_REGISTRY**: Add "Scenario Hash" (normalized Given/When/Then) when the process is adopted.
- **Before new scenario**: Check registry for same or near-duplicate hash; extend existing or document why new (overlap %, difference).

---

## 6. Multi-User (70/30)

- ~**30%** of tests should be multi-user (permissions, tenant isolation).
- Use **Scenario Outline** with Examples (User, Result), step "I am logged in as \<User\>", tags **@multi-user** and role tags.
- Single-user: "Given I am logged in to the Application" (user from project/tag).

---

## 7. Locators

- Prefer **getByRole**, **getByLabel**, **getByText** with scoping (e.g. within dialog).
- **Avoid** `locator('..').locator('..')`; if unavoidable, add comment and request data-testid from frontend.

---

## 8. Priority & Tags

- **Every scenario** must have **@p0** / **@p1** / **@p2** / **@p3**.
- Keep **@smoke** @critical @regression and user/tenant tags; add **@profile-*** when using a profile.

---

## 9. List vs Journey

- When using one big E2E journey, keep at least:
  - One **list-only** smoke (load list, optional search/filter).
  - One **create → detail** smoke (no full approval).
- So list or create failures are fast to isolate.

---

## 10. Test Impact Matrix

- Map each test to **actual POM** and **source files** (page + components).
- Update matrix when adding tests or when UI/components change; set "Last Verified" on review.

---

**Quick ref**: Full rationale and O2C-specific GAPs → [O2C-AUTOMATION-ARCHITECT-REVIEW.md](../modules/o2c/reviews/O2C-AUTOMATION-ARCHITECT-REVIEW.md).
