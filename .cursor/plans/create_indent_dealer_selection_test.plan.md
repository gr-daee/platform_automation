# Create Indent – Dealer List, Search and Select E2E Scenario (Revised)

## Scenario to Cover

**Verify**: "Create Indent" modal displays the list of active dealers and the user can search (by parameterized dealer code, e.g. IACS3018) and select that dealer to create an indent. Test runs as **IACS_MD_USER_EMAIL**.

---

## Clarifications Incorporated

### 1. Login user: IACS_MD_USER_EMAIL

- The scenario must run with the user identified by **IACS_MD_USER_EMAIL** (and corresponding password and TOTP).
- **Implementation options**:
  - **Option A (recommended)**: Add env vars `IACS_MD_USER_EMAIL`, `IACS_MD_USER_PASSWORD`, `IACS_MD_USER_TOTP_SECRET` to `.env.example` and use them in this scenario only. In the **Background** of the O2C indents feature, add a step: **Given I am logged in as the IACS MD user** – implemented by reading these env vars and performing full login (email, password, TOTP) via `LoginPage`, then saving no storage state (or optionally saving to a scenario-scoped state). This avoids changing global setup for other tests.
  - **Option B**: Add a second Playwright project (e.g. "O2C IACS") that uses a separate global setup or a second auth file (e.g. `.auth/iacs_md.json`) generated using IACS_MD_USER_* env vars; tag this scenario to run in that project. Requires extending global setup or a dedicated setup script to support IACS_MD_* and write a second storage state file.
- **Recommendation**: Option A – Background step **Given I am logged in as the IACS MD user** that performs login using `IACS_MD_USER_EMAIL`, `IACS_MD_USER_PASSWORD`, `IACS_MD_USER_TOTP_SECRET`. No change to existing global setup; other tests keep using admin. Ensure this feature does not depend on pre-authenticated state (use a project that does not apply `storageState`, or run this scenario in a project that uses a fresh context and the Background does login).

### 2. How we know dealers are displayed / searchable (and the 1000 limit)

- **Current behavior**: DealerSelectionDialog uses `pageSize: 100` (initial load shows up to 100 dealers). Search is **server-side** (debounced); typing in the search box triggers a new API call that returns matching dealers (same pagination applies to search results).
- **We do not assert "all dealers for the tenant are displayed"** in the UI because:
  - The dialog does not show a total count (e.g. "Showing 1–100 of 500").
  - The initial list is capped at 100; without a total, we cannot compare "displayed" vs "all."
- **What we do assert**:
  - **Searchability**: When the user searches for a **specific dealer code** (parameterized, e.g. IACS3018), the result list contains that dealer and the user can select it. This proves (1) that dealer belongs to the tenant, (2) server-side search works, and (3) there is no client-side cap preventing that dealer from appearing when searched.
  - **List loads**: The dealer selection modal shows at least one dealer (table row or card) when opened (optional, or after a neutral search), so the list is not empty due to permission/API failure.
- **Regarding a 1000 limit**: To verify search yields results across the full tenant list (and catch a 1000 cap), use **multiple dealers sampled from the list**: **oldest** (first by created_at), **newest** (last by created_at), and **3–4 from the middle** (e.g. at positions ~N/4, N/2, 3N/4). For each of these dealer codes, run the same search in the modal and assert the dealer appears in results. If any of these searches fails, we surface that search is not returning results for that part of the list (e.g. beyond 1000). See **Multi-dealer search verification** below.

### 3. Search dealer code parameterized from feature file (e.g. IACS3018)

- The dealer code to search for must be **parameterized in the feature file**.
- **Implementation**:
  - Use **Scenario Outline** with **Examples** so the dealer code is a column, e.g. `| dealer_code |` and `| IACS3018 |`.
  - Step: **When I search for dealer code "<dealer_code>"** (or **When I search for dealer code {string}** with the value in the Examples row).
  - Step definition receives the parameter (e.g. `IACS3018`) and passes it to the POM method `searchDealer(dealerCode)`.
- **Default value**: Feature file Examples table should use **IACS3018** as the default row; additional rows can be added for other dealer codes if needed.

---

## Source of Truth (Web App)

- **Entry**: O2CIndentsManager – "Create Indent" button opens DealerSelectionDialog.
- **Modal**: DealerSelectionDialog – Title "Select Dealer", search placeholder "Search by dealer code, name, GST, or territory...", server-side search (debounced 300ms), pageSize 100, table with Dealer Code / Company Name / GST / Territory and "Select" button per row.
- **Post-select**: Creates draft indent (or navigates to existing draft) and redirects to `/o2c/indents/{id}`.

---

## Implementation Plan (Revised)

### 1. Environment variables

- **Add to `.env.example`** (and use in `.env.local`):
  - `IACS_MD_USER_EMAIL=`
  - `IACS_MD_USER_PASSWORD=`
  - `IACS_MD_USER_TOTP_SECRET=`
- Document that these are used for the O2C Create Indent dealer-selection scenario (IACS MD user).

### 2. Feature file

**Path**: `e2e/features/o2c/indents.feature`

- **Background**:
  - **Given I am logged in as the IACS MD user** (new step – uses IACS_MD_USER_EMAIL, PASSWORD, TOTP).
  - **And I am on the "o2c/indents" page** (shared navigation step).
- **Scenario Outline** (tagged e.g. `@O2C-INDENT-TC-012 @regression`):
  - **When** I open the Create Indent flow (click "Create Indent" button).
  - **Then** the dealer selection modal is open with title "Select Dealer".
  - **And** the dealer list is displayed (at least one dealer row or card).
  - **When** I search for dealer code **"<dealer_code>"** (parameter from Examples).
  - **Then** the dealer list shows the dealer with code **"<dealer_code>"** (assert that row/card contains the code or that the only/matching result is that dealer).
  - **When** I select the dealer with code **"<dealer_code>"** (click Select on that row/card).
  - **Then** the modal closes and I am on the indent detail page (URL `/o2c/indents/{uuid}`).

**Examples**:

```gherkin
Examples:
  | dealer_code |
  | IACS3018    |
```

(Additional rows optional.)

---

### 2b. Multi-dealer search verification (oldest, newest, 3–4 in middle)

Add a **second scenario** to verify search yields results across the full tenant list (surfaces 1000 limit or similar caps).

- **Scenario** (e.g. tagged `@O2C-INDENT-TC-013 @regression`):
  - **When** I open the Create Indent flow.
  - **Then** the dealer selection modal is open with title "Select Dealer".
  - **And** the dealer list is displayed.
  - **When** I verify search yields results for dealers spanning oldest, newest and middle of the tenant list.
  - **Then** each of the sampled dealers appears in the search results.

- **Step "I verify search yields results for dealers spanning oldest, newest and middle of the tenant list"**:
  1. **DB**: Resolve tenant_id for the logged-in user (IACS_MD_USER_EMAIL). Query `master_dealers` for that tenant (non-deleted):
     - **Oldest**: `ORDER BY created_at ASC LIMIT 1` → `dealer_code`.
     - **Newest**: `ORDER BY created_at DESC LIMIT 1` → `dealer_code`.
     - **Total count** N. If N &lt; 5, use oldest + newest only (or skip middle).
     - **Middle 3–4**: e.g. dealers at positions around N/4, N/2, 3N/4 (using a single query with `ROW_NUMBER() OVER (ORDER BY created_at)` and filter `rn IN (1, FLOOR(N/4), FLOOR(N/2), FLOOR(3*N/4), N)` to get oldest, 3 middle, newest; then take distinct `dealer_code`).
  2. Collect 5–6 distinct dealer codes (oldest, newest, 3–4 from middle).
  3. **UI**: With the modal already open, for each dealer code: fill search input with that code → wait for debounce + list update → assert that a table row (or card) containing that dealer code is visible. Clear search (or fill next code) before the next iteration so each search runs from a clean state.
  4. If tenant has very few dealers (e.g. N &lt; 3), reduce the sample (e.g. oldest + newest only) and still run the loop.

- **Helper**: Add a function (e.g. in `db-helper.ts` or `TestDataLocator`) such as `getSampleDealerCodesForSearchVerification(tenantId: string): Promise<string[]>` that returns `[oldest_code, ...middle_codes..., newest_code]` (3–6 codes). Use the same tenant resolution as the rest of the suite (e.g. from user’s tenant or env).

### 3. Page Object (POM)

**Path**: `e2e/src/pages/o2c/IndentsPage.ts`

- Locators and methods as in the original plan; add:
  - **searchDealer(dealerCode: string)** – fill search input with `dealerCode`, wait for debounce (e.g. 400–500ms) and for list update (e.g. wait for network or for table/cards to update).
  - **clearDealerSearch()** – clear the search input (e.g. fill with empty string) so the next search runs from a clean state; used between multi-dealer search iterations.
  - **getDealerRowByCode(dealerCode: string)** or **selectDealerByCode(dealerCode: string)** – find the row (or card) that contains the dealer code (e.g. cell with badge or text matching dealerCode), then click "Select" in that row. Use semantic locators (e.g. getByRole('row').filter({ hasText: dealerCode }).getByRole('button', { name: 'Select' })).
  - **assertDealerCodeVisibleInList(dealerCode: string)** – assert that the dialog list (table or cards) contains a row/card with text matching `dealerCode` (for use in the multi-dealer search scenario).
- Other methods: `goto()`, `openCreateIndentModal()`, `waitForIndentDetailPage()` as before.

### 4. Step definitions

**Path**: `e2e/src/steps/o2c/indent-steps.ts`

- **Given I am logged in as the IACS MD user**:
  - Read `IACS_MD_USER_EMAIL`, `IACS_MD_USER_PASSWORD`, `IACS_MD_USER_TOTP_SECRET` from `process.env`.
  - If missing, throw a clear error asking to set them in `.env.local`.
  - Navigate to login page, use LoginPage to perform full login (email, password, submit, TOTP, submit), wait for redirect (e.g. away from login).
- **When I search for dealer code {string}** / **When I search for dealer code "<dealer_code>"**: call `indentsPage.searchDealer(dealerCode)`.
- **Then the dealer list shows the dealer with code {string}** / **"<dealer_code>"**: assert that the dialog contains a row (or card) with text matching the dealer code (e.g. badge or cell with IACS3018).
- **When I select the dealer with code {string}** / **"<dealer_code>"**: call `indentsPage.selectDealerByCode(dealerCode)`.
- **When I verify search yields results for dealers spanning oldest, newest and middle of the tenant list**: resolve tenant_id (from logged-in user or env), call `getSampleDealerCodesForSearchVerification(tenantId)` to get 3–6 dealer codes (oldest, newest, 3–4 middle). With the modal already open, for each code: `indentsPage.searchDealer(code)`, `indentsPage.assertDealerCodeVisibleInList(code)`, then `indentsPage.clearDealerSearch()` before the next iteration. If any assertion fails, the step fails (surfaces 1000 limit or search bug).
- **Then each of the sampled dealers appears in the search results**: optional; the "When" above already asserts each dealer appears. Can be a no-op or a final check that the sampled list was non-empty and all passed.
- Rest of steps as in original plan (open Create Indent, modal title, list displayed, modal closes, indent detail URL).

Use `createBdd()` and same fixture pattern as auth steps.

### 5. Playwright project for this scenario

- This scenario must run **without** the default admin storage state (so we can log in as IACS MD user in Background). Options:
  - **Option A**: Create a new project (e.g. `{ name: 'O2C with IACS user', testMatch: /indents\.feature/, use: { storageState: { cookies: [], origins: [] } } }` or no storageState) so that this feature gets a fresh context and Background does login.
  - **Option B**: Tag the scenario (e.g. `@iacs_user`) and in config, for that tag, use a different project with no (or empty) storage state.
- Implement one of these so that "Given I am logged in as the IACS MD user" runs in a context that is not pre-authenticated as admin.

### 6. Documentation updates

- **docs/modules/o2c/test-cases.md**: Add O2C-INDENT-TC-012 (parameterized dealer IACS3018, search + select + redirect) and O2C-INDENT-TC-013 (multi-dealer search: oldest, newest, 3–4 middle); note that tests run as IACS_MD_USER_EMAIL.
- **docs/modules/o2c/gap-analysis.md**: Mark GAP-O2C-P2-003 resolved; link to O2C-INDENT-TC-012 and O2C-INDENT-TC-013.
- **docs/modules/o2c/knowledge.md**: Add Testing Context – Create Indent opens DealerSelectionDialog; search is server-side; parameterized dealer code (e.g. IACS3018) verifies searchability; multi-dealer scenario (oldest, newest, middle) verifies search yields results across the list; IACS MD user is used for these scenarios.
- **.env.example** (or docs/framework/setup): Document IACS_MD_USER_EMAIL, IACS_MD_USER_PASSWORD, IACS_MD_USER_TOTP_SECRET for O2C dealer-selection scenario.

### 7. Dealer list completeness (summary)

- **Not asserted**: "All dealers for the tenant are displayed" (no total count in UI).
- **Asserted**:
  - **(Scenario 1 – parameterized)**: (1) Dealer list is displayed. (2) Searching for the parameterized dealer code (IACS3018) returns that dealer. (3) User can select that dealer and reach the indent detail page.
  - **(Scenario 2 – multi-dealer)**: Search yields results for **multiple dealers** sampled from the tenant list: **oldest** (first by created_at), **newest** (last by created_at), and **3–4 from the middle** (e.g. at N/4, N/2, 3N/4). For each of these codes we search in the modal and assert the dealer appears. This samples across the full list and helps surface a 1000 limit (e.g. if "oldest" or "middle" dealers are beyond the API cap, search would fail for them).

---

## File Summary

| Artifact | Path | Action |
|----------|------|--------|
| Env example | `.env.example` | Add IACS_MD_USER_EMAIL, PASSWORD, TOTP_SECRET |
| Feature | `e2e/features/o2c/indents.feature` | Create (Scenario Outline IACS3018 + multi-dealer scenario: oldest, newest, 3–4 middle) |
| POM | `e2e/src/pages/o2c/IndentsPage.ts` | Create (searchDealer, clearDealerSearch, selectDealerByCode, assertDealerCodeVisibleInList) |
| Steps | `e2e/src/steps/o2c/indent-steps.ts` | Create (IACS login, parameterized search/select, multi-dealer search verification step) |
| DB helper / TestDataLocator | `e2e/src/support/db-helper.ts` or `e2e/src/support/data/TestDataLocator.ts` | Add `getSampleDealerCodesForSearchVerification(tenantId)` (oldest, newest, 3–4 middle) |
| Playwright config | `playwright.config.ts` | Add project or tag for O2C scenario without admin storage state |
| Test cases | `docs/modules/o2c/test-cases.md` | Update (O2C-INDENT-TC-012, O2C-INDENT-TC-013 multi-dealer) |
| Gap analysis | `docs/modules/o2c/gap-analysis.md` | Update |
| Knowledge | `docs/modules/o2c/knowledge.md` | Update |
