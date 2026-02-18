# Defect: O2C Inventory page reload after search/filter (UX broken)

**Post this as a comment on Linear:** [DAEE-91 Test automation defect list](https://linear.app/daee-issues/issue/DAEE-91/test-automation-defect-list)

---

## Defect template (copy into Linear comment)

**Title:** [O2C Inventory] Page reloads after search and warehouse filter, breaking UX and automation

### 1. Summary

**Description:** On `/o2c/inventory`, after entering a product search and selecting a warehouse filter, the page triggers a reload (or refetch that clears/resets the view), breaking user experience and causing E2E tests to see no table rows (null snapshot).

**Linked Story:** [Link to User Story] *(Crucial: Do not close story until all defects are resolved.)*

### 2. Steps to Reproduce

1. Log in and navigate to **O2C → Inventory** (`/o2c/inventory`).
2. Enter a product search (e.g. `1013`) in the search field (min 3 characters).
3. Open the **Warehouse** dropdown and select a warehouse (e.g. **Kurnook Warehouse**).
4. Observe the page behavior.

### 3. Results

**Expected:** Table updates to show filtered inventory (product + warehouse) without a full page reload; filters remain applied and table stays stable.

**Actual:** The page attempts to reload or refetches in a way that causes the view to reset or empty (e.g. table shows no rows or filters appear to clear), breaking UX and causing automation to read zero rows and fail (e.g. `expect(snapshot).not.toBeNull()`).

### 4. Evidence & Context

**Environment:** Local (E2E run with `npm run test:dev -- --grep "@O2C-E2E-TC-001"`).

**Attachments:**
- **Screenshot:** `platform_automation/test-results/e2e-features-o2c-o2c-e2e-i-d5764-porter-Just-In-Time-Shipper-iacs-md/test-failed-1.png`
- **Screen recording (video):** `platform_automation/test-results/e2e-features-o2c-o2c-e2e-i-d5764-porter-Just-In-Time-Shipper-iacs-md/video.webm`
- **Monocart report (includes video + trace):** Open `platform_automation/monocart-report/index.html` after running the test, or run `npx monocart show-report monocart-report/index.html` from repo root.

**Direct Link:** `http://localhost:3000/o2c/inventory` (after search + warehouse filter selection).

---

*Generated for E2E scenario @O2C-E2E-TC-001 (O2C Indent → SO → eInvoice → Dealer Ledger).*
