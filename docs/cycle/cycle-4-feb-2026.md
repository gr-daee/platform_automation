# Cycle 4 — Observations (Ending Feb 15, 2026)

**Scope**: DAEE-100 GSTR-1 Review Page automation completed.  
**Outcome**: 47 scenarios automated; 3 To Be Ignored (TC-002, TC-041, TC-046).  
**Reference**: [DAEE-100-GSTR1-Test-Scenarios-For-Review.md](../modules/finance/compliance/DAEE-100-GSTR1-Test-Scenarios-For-Review.md).

---

## 1. Gaps (vs Persona / Framework)

| Gap | Location | Persona/Framework Expectation | Current State |
|-----|----------|-------------------------------|---------------|
| **TEST_CASE_REGISTRY** | `docs/test-cases/TEST_CASE_REGISTRY.md` | All automated tests registered with ID, module, scenario, feature file, tags. | No Finance/Compliance (GSTR1) section; 47 GSTR1 scenarios not in registry. |
| **Test Impact Matrix** | `docs/test-cases/test-impact-matrix.md` | Every test mapped to source files for change impact. | No GSTR1 page or component entries; `web_app/.../gstr1/page.tsx` and related components not mapped. |
| **Gap analysis** | `docs/modules/finance/compliance/gap-analysis.md` | Per-module gap tracking; link resolved gaps to IMPL. | File not present. |
| **Implementation history** | `docs/modules/finance/compliance/implementation-history.md` | Per-module history with links to IMPL-###. | File not present. |
| **IMPL document** | `docs/implementations/YYYY-MM/` | Implementation record for DAEE-100 (new tests, updated, deprecated, corner cases). | No IMPL-### for DAEE-100 cycle. |

**Recommendation**: Add GSTR1 to TEST_CASE_REGISTRY and test-impact-matrix in Cycle 5; create gap-analysis and implementation-history (or adopt lightweight “post-cycle” summary in cycle doc only, if team agrees).

---

## 2. Bad Practices That Crept In

Reviewed against [sr-automation-engineer-persona.mdc](../../.cursor/rules/sr-automation-engineer-persona.mdc) (Testra).

### 2.1 CSS / Tailwind Class Selectors (Persona: “Don’t use CSS class selectors”)

| File | Example | Risk |
|------|---------|------|
| `e2e/src/pages/finance/GSTR1Page.ts` | `.text-red-700`, `span.text-slate-500`, `.text-2xl.font-bold`, `div.bg-blue-600`, `.text-lg.font-bold`, `.border-red-200.bg-red-50`, `span.text-xs.text-muted-foreground`, `[class*="break-words"]` | Tailwind/design change breaks locators. |
| `e2e/src/steps/finance/gstr1-steps.ts` | `page.locator('span.text-slate-500')` | Same. |

**Persona**: Prefer semantic locators (getByRole, getByLabel, getByText); data-testid if available.

**Recommendation**: In a follow-up, replace Tailwind/class-based locators with role/label/text or add stable `data-testid` in web_app for cards and key UI (e.g. Total Tax Liability box).

### 2.2 Fixed `waitForTimeout` (Persona: Prefer explicit waits)

| File | Usage | Prefer |
|------|--------|--------|
| `GSTR1Page.ts` | `waitForTimeout(1000)`, `waitForTimeout(500)`, `waitForTimeout(300/400)` in multiple methods | `waitForLoadState`, or `expect(locator).toBeVisible()` with timeout. |
| `gstr1-steps.ts` | `page.waitForTimeout(300)`, `page.waitForTimeout(500)` | Same. |

**Risk**: Arbitrary delays lengthen runs and can still be flaky if UI is slower.

**Recommendation**: Replace with “wait for element/state” (e.g. card visible, dropdown option selected) and use Playwright’s auto-waiting where possible.

### 2.3 Duplicated / Verbose Step Logic

- **TC-003 step** (“I should see {string} for GSTR-1 access”): Large debug logging block and string checks; could be shortened and aligned to shared “see X or Y” pattern if one exists.
- **Empty state step**: Uses both POM `verifyEmptyState()` and a direct `page.locator('span.text-slate-500')` in the step; step should rely on POM only to avoid duplicate Tailwind locators.

**Recommendation**: Prefer single source of truth in POM; steps delegate to POM. Reduce console logging in steps to essentials.

---

## 3. What Went Well (Learnings)

| Practice | Evidence |
|----------|----------|
| **BasePage + POM** | GSTR1Page extends BasePage; SelectComponent used for ShadCN dropdowns. |
| **BDD + tags** | Single feature file with @DAEE-100, @smoke/@regression, @p0/@p1/@p2, @iacs-md; easy to run subset. |
| **Semantic locators where used** | getByRole('combobox'), getByText, filter(hasText); data-slot for card title. |
| **Excel assertions** | exceljs in steps for TC-036–TC-039 (sheets, row 5, headers, date/POS format); no UI scraping for export content. |
| **Documentation** | knowledge.md, test-cases.md, DAEE-100 doc kept in sync; Progress summary and To Be Ignored convention clear. |
| **Export flow** | Trigger download in POM; steps load file and assert structure/content; reusable pattern for other export tests. |

---

## 4. Framework Update Recommendations

1. **Locator strategy**  
   - In LOCATOR_STRATEGY or QUICK_START: Explicitly call out “avoid Tailwind/utility class selectors”; prefer role/label/text/data-testid.  
   - Option: Add a “GSTR1 refactor” backlog item to replace class-based locators and document pattern.

2. **Waits**  
   - In persona or automation-patterns: “Prefer waitForLoadState / expect().toBeVisible() with timeout; avoid waitForTimeout except for known animation (and document reason).”

3. **Cycle documentation**  
   - Keep this cycle folder and template (README + cycle-N) as standard; link cycle doc from epic (e.g. DAEE-100) when automation is completed.

4. **Registry and impact matrix**  
   - In Workflow 1 (Creating a New Test): Add checklist item “Update TEST_CASE_REGISTRY and test-impact-matrix for new module/scenarios.”  
   - Backlog: Bulk-add GSTR1 to registry and matrix in Cycle 5.

5. **To Be Ignored**  
   - Progress summary instruction in DAEE-100 (Status = To Be Ignored, Auto = ❌, reason in Notes) is good; consider same pattern in test-cases.md for other modules.

---

## 5. Summary

- **DAEE-100**: Automation complete; 47 automated, 3 To Be Ignored.
- **Gaps**: TEST_CASE_REGISTRY, test-impact-matrix, gap-analysis, implementation-history (and optional IMPL) for GSTR1.
- **Bad practices**: Tailwind/class selectors and `waitForTimeout` in GSTR1 POM/steps; some duplicated locator and verbose logging.
- **Learnings**: BDD, POM, exceljs export checks, and docs workflow are solid; locator and wait discipline need tightening.
- **Next**: Cycle 5 starts Feb 16; address registry/matrix and consider locator/wait refactor and framework doc updates above.
