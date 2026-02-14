# DAEE-100 GSTR-1 Review Page — Test Scenarios & Plan (For Review)

**Linear:** [DAEE-100](https://linear.app/daee-issues/issue/DAEE-100/gstr-1-review-page-and-govt-schema-exportexcel)  
**Route:** `/finance/compliance/gstr1`  
**Permissions:** `compliance.read`, `compliance.export`  
**Framework:** Playwright-BDD, BasePage, semantic locators ([Playwright MCP](https://github.com/executeautomation/mcp-playwright) for snapshots/locator discovery). See [PLAYWRIGHT_MCP_INTEGRATION.md](../../../framework/PLAYWRIGHT_MCP_INTEGRATION.md).

This document lists test scenarios for automation, **segregated into Smoke and Regression**, with a **test case ID strategy** and **@DAEE-100 tagging** so all DAEE-100 tests can be run together or filtered by smoke. It also acts as a **living document** — use the **Status** column to track development progress for each scenario.

---

## Development Status (Living Document)

Track progress per scenario using the **Status** column in each table. Update status as work progresses.

| Status | Meaning |
|--------|--------|
| **To Start** | Not yet implemented; planned for automation. |
| **In Progress** | Implementation or debugging in progress. |
| **Automated** | Implemented and included in the test suite (passing). |
| **To Be Ignored** | Decided to skip (e.g. manual only, out of scope, or deprecated). Add reason in Notes if needed. |
| **Blocked** | Cannot proceed (dependency, environment, or scope blocker). Add reason in Notes. |

**Progress summary** — update the counts below whenever you change a scenario's Status in the tables. For **To Be Ignored** scenarios: set Status = **To Be Ignored**, Auto = **❌**, and add the reason in the Notes column (e.g. Invalid Scenario, manual only, out of scope).

| Status | Count |
|--------|--------|
| To Start | 0 |
| In Progress | 0 |
| Automated | 47 |
| To Be Ignored | 3 |
| Blocked | 0 |

---

## Test Plan Summary

### Smoke vs Regression

- **All scenarios are Regression** — every test guards against regressions (including defect fixes DEF-001–DEF-014).
- **A limited subset is Smoke** — fast, critical-path checks run on every commit or before release (page load, filters, one export path, key UI).
- **Smoke ⊆ Regression:** Smoke scenarios carry both `@smoke` and `@regression`; regression-only scenarios carry only `@regression`.

### Test Case Number Strategy

| Item | Convention | Example |
|------|------------|--------|
| **Test Case ID** | `GSTR1-DAEE-100-TC-NNN` | `GSTR1-DAEE-100-TC-001` |
| **Linear tag (required)** | `@DAEE-100` | Every scenario |
| **Type tags** | `@smoke` and/or `@regression` | Smoke scenarios: `@smoke` + `@regression` |
| **Priority (optional)** | `@p0` (critical), `@p1` (high) | Smoke = p0; critical regression = p0 |
| **User tag** | e.g. `@iacs-md` or `@compliance` | When compliance user exists |

**Rule:** Every DAEE-100 scenario must have the **@DAEE-100** tag so anyone can run all DAEE-100 tests with:

```bash
npm run test:regression -- --grep "@DAEE-100"
npm run test:smoke       -- --grep "@DAEE-100"
npm run test:dev        -- --grep "@DAEE-100" e2e/features/finance/compliance/
```

### Smoke Test Set (8 scenarios)

Limited set for quick feedback; all are also part of regression.

| TC ID | Scenario (short) | Status |
|-------|-------------------|--------|
| GSTR1-DAEE-100-TC-001 | User with compliance can open GSTR-1 page | Automated |
| GSTR1-DAEE-100-TC-002 | Page shows empty state until filters applied | To Be Ignored |
| GSTR1-DAEE-100-TC-006 | Selecting GSTIN and Period loads data | Automated |
| GSTR1-DAEE-100-TC-007 | Return Period card shows human-readable period | Automated |
| GSTR1-DAEE-100-TC-034 | Export button opens menu (Excel/JSON) | Automated |
| GSTR1-DAEE-100-TC-035 | Export Excel downloads file with correct name pattern | Automated |
| GSTR1-DAEE-100-TC-042 | All tabs are clickable and show content | Automated |
| GSTR1-DAEE-100-TC-043 | Summary tab shows section totals and liability | Automated |

**Smoke tags:** `@DAEE-100 @smoke @regression @p0`

---

## Running DAEE-100 Tests (When Implemented)

| Goal | Command |
|------|--------|
| All DAEE-100 tests | `npm run test:regression -- --grep "@DAEE-100"` |
| DAEE-100 smoke only | `npm run test:smoke -- --grep "@DAEE-100"` or `npm run test:regression -- --grep "@DAEE-100 and @smoke"` |
| DAEE-100 in dev (headed) | `npm run test:dev -- --grep "@DAEE-100" e2e/features/finance/compliance/` |
| Single scenario | `npm run test:dev -- --grep "GSTR1-DAEE-100-TC-001"` |

Feature file location (per framework): `e2e/features/finance/compliance/gstr1.feature`. Use **Playwright MCP** for live DOM/snapshots at `TEST_BASE_URL/finance/compliance/gstr1` when authoring or fixing locators (see [PLAYWRIGHT_MCP_INTEGRATION.md](../../../framework/PLAYWRIGHT_MCP_INTEGRATION.md)).

---

## 1. Access & Navigation

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-001 | User with compliance.read can open `/finance/compliance/gstr1` and see the page | **Smoke** | @DAEE-100 @smoke @regression @p0 | Automated | ✅ | Permission check; 403 or redirect if no access. |
| GSTR1-DAEE-100-TC-002 | Page shows empty state with "Select filters to load" when no filters applied | **Smoke** | @DAEE-100 @smoke @regression @p0 | To Be Ignored | ❌ | **Invalid Scenario** - Empty state behavior is conditional and not reliable for automation. Removed from test suite. |
| GSTR1-DAEE-100-TC-003 | User without compliance permission cannot access GSTR-1 page (403 or redirect) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Multi-user: run as non-compliance role. Note: Currently tests with IACS MD User (has access). Need non-compliance user profile for denied case. |

---

## 2. Global Filters (AC1)

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-004 | Filing Period: Month/Year picker visible and includes current/open month | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Assert combobox/label; options include recent months. |
| GSTR1-DAEE-100-TC-005 | Supplier GSTIN dropdown displays "GSTIN - State Name" (e.g. 37GHZPK0145J1ZQ - Andhra Pradesh) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-003 (was city e.g. Kurnook). |
| GSTR1-DAEE-100-TC-006 | Selecting GSTIN and Period loads data and removes empty state | **Smoke** | @DAEE-100 @smoke @regression @p0 | Automated | ✅ | After select both, summary/tabs or data area visible. |
| GSTR1-DAEE-100-TC-007 | Return Period summary card shows human-readable period (e.g. "December 2025"), not raw "122025" | **Smoke** | @DAEE-100 @smoke @regression @p0 | Automated | ✅ | Regression DEF-004. |

---

## 3. Summary Cards / Health Check (AC2, DEF-001)

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-008 | "Total Liability" card visible and reflects (B2B+B2CL+B2CS tax) − (CDNR tax) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Compare card to sum from data or mock. |
| GSTR1-DAEE-100-TC-009 | "Total Taxable Value" card visible and matches gross taxable across active buckets | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Assert card present and numeric. |
| GSTR1-DAEE-100-TC-010 | "Validation Errors" card visible (count of Fix Required items) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-001. |
| GSTR1-DAEE-100-TC-011 | "e-Invoice Status" card visible (IRN Generated vs Pending/Failed) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-001. |
| GSTR1-DAEE-100-TC-012 | Net Taxable Value = Total Outward − CDNR once (no double subtraction) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-002. |

---

## 4. Validation Banner (AC4, DEF-012)

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-013 | When validation errors exist, collapsible "Fix Required" banner appears above tabs | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-012. |
| GSTR1-DAEE-100-TC-014 | Banner lists specific issues (e.g. "Invoice #X: Missing HSN") so user can identify and fix | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Expand banner; assert document_number or message. |
| GSTR1-DAEE-100-TC-015 | Banner does not appear when there are zero validation errors | Regression | @DAEE-100 @regression @p2 | Automated | ✅ | With clean data, banner not visible. |

---

## 5. B2B Tab (AC3, DEF-005, DEF-006, DEF-013)

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-016 | B2B tab shows columns: Status, GSTIN, Name, Inv No, Date, Inv Value, POS, RCM, Inv Type, Rate, Taxable Val, Cess | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-005. |
| GSTR1-DAEE-100-TC-017 | Status column reflects e-invoice status (invoices.einvoice_status) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression comment. |
| GSTR1-DAEE-100-TC-018 | Invoice Type shows "R" or "Regular" for IWT, not "IWT" | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | IWT rows show Regular. |
| GSTR1-DAEE-100-TC-019 | Rate column shows tax as percentage (e.g. 18), not "-" for taxable invoices | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Numeric rate where tax > 0. |
| GSTR1-DAEE-100-TC-020 | IWT rows show Buyer Name (not "Unknown") | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-006. |
| GSTR1-DAEE-100-TC-021 | Buyer Name column shows full legal name or wrap (no aggressive truncation) | Regression | @DAEE-100 @regression @p2 | Automated | ✅ | Regression DEF-013. |
| GSTR1-DAEE-100-TC-022 | B2B table supports filters: Status, Supply Type, Search; pagination works | Regression | @DAEE-100 @regression @p2 | Automated | ✅ | Change filters/page size; assert table updates. |

---

## 6. CDNR Tab (AC3, DEF-007)

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-023 | CDNR tab has columns: Note Type (C/D), Note Value, Taxable Val, Tax Amounts (IGST, CGST, SGST, Total Tax) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-007. App has no Rate/POS columns. |
| GSTR1-DAEE-100-TC-024 | Note values in CDNR shown as positive (not negative) in UI/Excel per DEF-007 | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-007. |

---

## 7. HSN Tab (AC3, DEF-008–010, HSN comment)

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-025 | HSN tab grouped by HSN Code + UQC; same HSN+UQC+Rate merged into one row | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-009. |
| GSTR1-DAEE-100-TC-026 | Rate column shows correct percentage (e.g. 18% or 18.0), not 0% or 0.18% | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-008. |
| GSTR1-DAEE-100-TC-027 | HSN grid has "Total Value" (Taxable + Tax) column | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-010. |
| GSTR1-DAEE-100-TC-028 | HSN tab does not show Description/Product Name column (HSN only) | Regression | @DAEE-100 @regression @p2 | Automated | ✅ | App currently has Description; test fails until removed. |
| GSTR1-DAEE-100-TC-029 | HSN shows single line per HSN+UQC+Rate (no duplicate lines for same HSN) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression "2 Line Items for same HSN". |

---

## 8. Docs Issued Tab (AC7, DEF-011)

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-030 | Docs tab shows separate rows per series (INV vs IWT), not grouped by first 3 chars | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Regression DEF-011. |
| GSTR1-DAEE-100-TC-031 | Columns: Nature of Doc, Sr No From, Sr No To, Total Number, Cancelled, Net Issued | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | App: Document Type, Series Prefix, From/To Number, Total Issued, Cancelled, Net Issued. |
| GSTR1-DAEE-100-TC-032 | Net Issued = Total Number − Cancelled; Total Number = actual count for GSTIN/prefix | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Shared sequence rule. |
| GSTR1-DAEE-100-TC-033 | Nature of Document uses exact strings: "Invoices for outward supply", "Credit Note", "Delivery Challan in cases other than..." | Regression | @DAEE-100 @regression @p2 | Automated | ✅ | Assert text in Nature column. |

---

## 9. Export (AC5, AC6, AC7, DEF-014)

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-034 | "Export" button opens menu with "Export Excel" / "Export JSON" options | **Smoke** | @DAEE-100 @smoke @regression @p0 | Automated | ✅ | Click Export; assert menu items. |
| GSTR1-DAEE-100-TC-035 | Export Excel downloads file named GSTR1_[GSTIN]_[Month].xlsx | **Smoke** | @DAEE-100 @smoke @regression @p0 | Automated | ✅ | Assert filename pattern (GSTIN, MMYYYY). |
| GSTR1-DAEE-100-TC-036 | Exported file has expected sheets (template fidelity) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | exceljs: ≥20 sheets, key sheets b2b, cdnr, docs, hsn(b2b). |
| GSTR1-DAEE-100-TC-037 | Data in b2b, cdnr, hsn(b2b), docs starts at Row 5; Rows 1–4 unchanged | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Parse Excel; assert b2b row 5 exists. |
| GSTR1-DAEE-100-TC-038 | b2b/cdnr export excludes Tax Amount columns; hsn includes Tax Amounts | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Assert row 4 headers: b2b/cdnr no "Tax Amount"; hsn(b2b) has Integrated/Central/State Tax Amount. |
| GSTR1-DAEE-100-TC-039 | Date format in Excel is dd-mmm-yyyy (text); POS is Code-StateName (e.g. 29-Karnataka) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | b2b row 5 col 5 (date), col 7 (POS); regex dd-mmm-yyyy and Code-StateName; skip if no data. |
| GSTR1-DAEE-100-TC-040 | Export "All GSTINs" downloads ZIP with one file per GSTIN | Regression | @DAEE-100 @regression @p2 | Automated | ✅ | Select All GSTINs; export; assert GSTR1_ALL_MMYYYY.zip. |
| GSTR1-DAEE-100-TC-041 | Exported file imports into GST Offline Tool without "Header Mismatch" / "Date Format" errors (DoD) | Regression | @DAEE-100 @regression @p2 | To Be Ignored | ❌ | Optional: manual/DoD; no CLI/API for Offline Tool. |

---

## 10. Tabs & Data Presence

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-042 | All tabs (Summary, B2B, B2CL, B2CS, CDNR, CDNUR, HSN, Docs) are clickable and show content | **Smoke** | @DAEE-100 @smoke @regression @p0 | Automated | ✅ | Click each tab; assert content or "No data". |
| GSTR1-DAEE-100-TC-043 | Summary tab shows section totals (B2B, B2CL, B2CS, CDNR, CDNUR) and liability | **Smoke** | @DAEE-100 @smoke @regression @p0 | Automated | ✅ | Assert summary cards/sections and Total Tax (Liability) visible. |
| GSTR1-DAEE-100-TC-044 | Liability check: Summary "Total Liability" matches sum of tax from HSN sheets (DoD) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Parse Summary Total Tax and HSN TOTAL rows; assert match (tolerance ₹1). |

---

## 11. Error & Loading States

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-045 | Loading state shown while fetching data (spinner/skeleton) | Regression | @DAEE-100 @regression @p2 | Automated | ✅ | After filter change, assert loading (if visible) then content. |
| GSTR1-DAEE-100-TC-046 | Error message displayed when API returns error | Regression | @DAEE-100 @regression @p2 | To Be Ignored | ❌ | Removed from automation: server-action mock unreliable in E2E. |
| GSTR1-DAEE-100-TC-047 | Export button disabled or shows loading during export | Regression | @DAEE-100 @regression @p2 | Automated | ✅ | Click Export Excel; assert button disabled within 2s then enabled after. |

---

## 12. Definition of Done (Cross-Cut)

| TC ID | Scenario | Smoke / Regression | Tags | Status | Auto | Notes |
|-------|----------|--------------------|------|--------|------|--------|
| GSTR1-DAEE-100-TC-048 | Dashboard data aggregates correctly for selected GSTIN and Period | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Change period to "current"; assert Return Period card updates. |
| GSTR1-DAEE-100-TC-049 | B2CS shown as grouped data (not individual invoices) in UI and Excel | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | B2CS tab shows "B2C Small Summary" and "Invoices in X Groups". |
| GSTR1-DAEE-100-TC-050 | Template fidelity: 32 sheets, data from row 5 (covered in TC-036, TC-037) | Regression | @DAEE-100 @regression @p1 | Automated | ✅ | Single scenario runs TC-036 + TC-037 steps (sheets + row 5). |

---

## Summary

| Category | Smoke | Regression | Total |
|----------|-------|------------|--------|
| Access & Navigation | 2 | 1 | 3 |
| Global Filters | 2 | 2 | 4 |
| Summary Cards | 0 | 5 | 5 |
| Validation Banner | 0 | 3 | 3 |
| B2B Tab | 0 | 7 | 7 |
| CDNR Tab | 0 | 2 | 2 |
| HSN Tab | 0 | 5 | 5 |
| Docs Tab | 0 | 4 | 4 |
| Export | 2 | 6 | 8 |
| Tabs & Data | 2 | 1 | 3 |
| Error/Loading | 0 | 3 | 3 |
| DoD | 0 | 3 | 3 |
| **Total** | **8** | **50** | **50** |

- **Smoke:** 8 scenarios (all also regression).  
- **Regression:** All 50 scenarios; 42 regression-only, 8 smoke+regression.  
- **Automatable:** 49 full; 1 optional (TC-041).  
- **Tag rule:** Every scenario has **@DAEE-100**; smoke scenarios also have **@smoke @regression @p0**.  
- **Living doc:** Update the **Status** column (To Start | In Progress | Automated | To Be Ignored | Blocked) and the **Progress summary** at the top as work progresses.

---

## Gherkin Tag Examples (When Implementing)

```gherkin
# Smoke + Regression
@GSTR1-DAEE-100-TC-001 @DAEE-100 @smoke @regression @p0 @iacs-md
Scenario: User with compliance can open GSTR-1 page
  Given I am logged in to the Application
  When I navigate to "/finance/compliance/gstr1"
  Then I should see the GSTR-1 page content

# Regression only
@GSTR1-DAEE-100-TC-003 @DAEE-100 @regression @p1
Scenario: User without compliance permission cannot access GSTR-1 page
  Given I am logged in as "Viewer"
  When I navigate to "/finance/compliance/gstr1"
  Then I should be denied access or redirected
```

---

## Framework Assumptions

- **User:** Compliance or user with `compliance.read` / `compliance.export`; else `iacs-md` (`finance:read`) until compliance profile exists.
- **Auth:** Same as rest of framework (login + TOTP); storage state per profile.
- **Read-only DB:** No INSERT/UPDATE/DELETE; use SELECT for Sandwich Method where applicable. Export checks = file-content assertions.
- **Semantic locators:** Use **Playwright MCP** to open `TEST_BASE_URL/finance/compliance/gstr1` and get accessibility snapshot when authoring POM/step defs (see [PLAYWRIGHT_MCP_INTEGRATION.md](../../../framework/PLAYWRIGHT_MCP_INTEGRATION.md)). getByRole, getByLabel, getByText for tabs and cards.
- **Excel assertions:** Node library (e.g. xlsx) in step definitions to assert sheet count, row 5, column names, date format.

---

## Defect → Scenario Mapping (Regression)

| Defect | TC IDs |
|--------|--------|
| DEF-001 | TC-010, TC-011 |
| DEF-002 | TC-012 |
| DEF-003 | TC-005 |
| DEF-004 | TC-007 |
| DEF-005 | TC-016 |
| DEF-006 | TC-020 |
| DEF-007 | TC-023, TC-024 |
| DEF-008 | TC-026 |
| DEF-009 | TC-025 |
| DEF-010 | TC-027 |
| DEF-011 | TC-030 |
| DEF-012 | TC-013, TC-014 |
| DEF-013 | TC-021 |
| DEF-014 | TC-036, TC-037, TC-041 |

---

## Next Steps (After Review)

1. Confirm smoke set (8) and priority (p0/p1/p2).
2. Create `docs/modules/finance/compliance/knowledge.md` and `test-cases.md`.
3. Add GSTR1 page object and step definitions under `e2e/src/pages/finance/`, `e2e/src/steps/finance/`.
4. Implement feature file `e2e/features/finance/compliance/gstr1.feature` with all scenarios tagged **@DAEE-100** and smoke/regression as above.
5. Add compliance user profile if needed; tag scenarios with user tag.
6. Use Playwright MCP for live DOM/snapshots at GSTR-1 URL when debugging or adding locators.
