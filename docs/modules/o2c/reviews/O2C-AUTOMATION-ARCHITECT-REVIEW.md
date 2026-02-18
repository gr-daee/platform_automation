# O2C E2E Automation — Architect Review (Top 5%)

**Reviewer**: Automation Architect  
**Scope**: `e2e/features/o2c`, `docs/modules/o2c`  
**Date**: 2026-02-16  
**Purpose**: Identify GAPs, missed best practices, and new guidelines for Sr Automation Engineers.

---

## Executive Summary

O2C indent automation is **well-structured** (single feature file, clear test data profiles in FEATURE-001, journey-based TC-012, semantic locators, BasePage/POM). Several **gaps** and **missed practices** remain: stale documentation vs implementation, no Sandwich Method/DB verification, heavy use of `waitForTimeout`, no multi-user tests, no scenario hashes in registry, and test-impact matrix out of sync. The following sections detail GAPs, best-practice misses, and **new guidelines** for the team.

---

## 1. GAPs Identified

### 1.1 Documentation vs Implementation Drift

| Artifact | Issue | Action |
|----------|--------|--------|
| **gap-analysis.md** | Overall coverage still "60%", GAP-O2C-P0-001 "No test for indent approval" marked Open; TC-028 and TC-049 cover approval and 90-day block. Metrics and P0/P1 gaps don’t reflect current implementation. | Re-run gap discovery; mark approval/90-day as resolved; refresh coverage % and Resolved Gaps. |
| **knowledge.md** | "Test Coverage" lists "⏳ Indent creation (pending)", "⏳ Indent submission (pending)", "⏳ Indent approval (pending)". | Replace with current automated scenarios (e.g. TC-002, TC-026, TC-028, TC-048, TC-049). |
| **implementation-history.md** | "Tests Created: 4", "Current Coverage: 30%". Doesn’t reflect TC-028 consolidation and 25+ automated scenarios. | Update tests created/updated counts and coverage; add IMPL entries for straight-path and profile-based scenarios. |
| **TEST_CASE_REGISTRY.md** | TC-046 through TC-052 still "📋 To Start" but are implemented in `indents.feature`. | Set status to ✅ for TC-046–TC-052. |
| **test-impact-matrix.md** | References O2C-INDENT-TC-001 as "Create indent with valid data" and old components (IndentForm.tsx, ProductTable.tsx). Actual flow: dealer modal → detail page (O2CIndentsManager, DealerSelectionDialog, indent detail page, EnhancedEditableItemsCard, WarehouseSelector). | Remap affected tests to current POMs (IndentsPage, IndentDetailPage) and real source files; add IndentDetailPage ↔ detail/components. |

### 1.2 Test Design & Coverage GAPs

| GAP ID | Description | Priority |
|--------|-------------|----------|
| **GAP-DOC-001** | No **scenario hashes** in TEST_CASE_REGISTRY for deduplication (persona requires "Add scenario hash"). | P1 |
| **GAP-DESIGN-001** | **List/filter in isolation**: TC-004, TC-005, TC-006, TC-008, TC-023 removed from feature file (folded into TC-028). If TC-028 fails early, list load/search/filter/row click are not tested in isolation. | P2 |
| **GAP-DESIGN-002** | **No multi-user tests**: Persona 70/30 rule—30% multi-user for RBAC/tenant isolation. O2C has zero `@multi-user` scenarios (e.g. "Finance can view but not approve", "Warehouse sees only warehouse-relevant indents"). | P1 |
| **GAP-DESIGN-003** | **No Sandwich Method**: No DB verification for indent creation (count/record), status transitions (draft→submitted, submitted→approved/rejected), or SO creation after Process Workflow. | P0 |
| **GAP-DESIGN-004** | **Sales Order / Invoice**: Only `indents.feature` exists. Master plan references `sales-orders.feature` and `invoices.feature` (To Start). No E2E for SO list/detail, Back Order, or Invoice. | P1 (backlog) |
| **GAP-DESIGN-005** | **Priority tags inconsistent**: Many scenarios lack @p0/@p1/@p2; smoke/critical present but not all regression scenarios have priority for CI tiers. | P2 |

### 1.3 Code & Data GAPs

| GAP ID | Description | Priority |
|--------|-------------|----------|
| **GAP-CODE-001** | **Hardcoded dealer/warehouse names** in Gherkin ("VAYUPUTRA AGENCIES", "Ramesh ningappa diggai", "IACS3039", "IACS1650", "Kurnook Warehouse"). Not using TestDataLocator or a single "profile" table (FEATURE-001 defines profiles but feature file doesn’t reference them). | P1 |
| **GAP-CODE-002** | **waitForTimeout** used extensively in steps and POMs (7 in indent-steps.ts; 10 in IndentDetailPage, 4 in IndentsPage). Framework rule: prefer event-based waits. | P0 |
| **GAP-CODE-003** | **Fragile locator**: IndentDetailPage uses `this.transporterSelectionHeading.locator('..').locator('..').getByText(/Selected:/i)` — parent chaining is brittle. | P2 |

---

## 2. Missed Best Practices

### 2.1 Wait Strategy (Critical)

- **Rule**: automation-patterns.mdc and persona: "Replacing waitForTimeout" — use `expect(locator).toBeVisible({ timeout })`, `page.waitForResponse`, or PollingHelper instead of fixed delays.
- **Current**: Multiple `page.waitForTimeout(500|800|1500|2000)` in steps and POMs for debounce, modal close, warehouse selection.
- **Practice**: Replace with:
  - Dealer/search: `PollingHelper.pollUntil` (already used in some steps) or `waitForResponse` for search API.
  - Modal close: `expect(dialog).toBeHidden()`.
  - Warehouse/transporter: wait for card/button state (e.g. Approve enabled) or network idle after selection.

### 2.2 Test Data

- **Rule**: Use TestDataLocator for stable entities; AUTO_QA_ prefix for transactional data.
- **Current**: Dealer and warehouse names are literal strings in feature file; product code "1013" is in steps. No TestDataLocator for dealers/warehouses.
- **Practice**: Introduce TestDataLocator (or a small profile map) for dealer-by-profile (e.g. P-APPROVAL, P-90DAY, P-CREDIT-WARN) and document in knowledge.md; keep "1013" as config/constant if it’s the standard test product.

### 2.3 Sandwich Method (DB Verification)

- **Rule**: Persona and automation-patterns: use Sandwich Method for creation, status transitions, and relationship creation.
- **Current**: No `db-helper` or `executeQuery` in indent-steps; assertions are UI-only (URL, toasts, button visibility, status badge).
- **Practice**: Add optional DB checks (read-only): e.g. indent count before/after create; indent status = submitted after submit; status = approved/rejected after approval dialog; SO/back_order record after Process Workflow (if schema accessible).

### 2.4 Scenario Hashes (Deduplication)

- **Rule**: Persona "Test Deduplication Protocol" and "Update TEST_CASE_REGISTRY.md — Add scenario hash".
- **Current**: TEST_CASE_REGISTRY has no hash column; duplicate scenario detection is manual.
- **Practice**: Add a "Scenario Hash" (e.g. hash of normalized Given/When/Then text) per row; document in 02-QUICK_START how to generate and compare.

### 2.5 Multi-User (70/30)

- **Rule**: Persona: 30% multi-user for permission/tenant tests.
- **Current**: All O2C scenarios use single-user (Background: I am logged in to the Application).
- **Practice**: Add at least one Scenario Outline with @multi-user and role-based expectations (e.g. indent list visibility or approve permission by role); tag with @iacs-md @iacs-finance etc.

### 2.6 Profile Tagging

- **Rule**: FEATURE-001 defines test data profiles (P-APPROVAL, P-REJECT, P-90DAY, etc.).
- **Current**: Feature file mentions profiles in comments only; no `@profile-P-*` tags.
- **Practice**: Tag scenarios with `@profile-P-APPROVAL`, `@profile-P-REJECT`, etc., and add a short "Test Data Profiles" comment block at top of feature file mapping profile → dealer/warehouse for implementors.

### 2.7 Test Impact Matrix Accuracy

- **Rule**: framework-workflows — map tests to source files; update on implementation.
- **Current**: Matrix still references IndentForm, ProductTable, and old TC-001/TC-002 descriptions; missing IndentDetailPage and indent detail route/components.
- **Practice**: One-time update: map each O2C test ID to IndentsPage vs IndentDetailPage and to actual web_app paths (O2CIndentsManager, DealerSelectionDialog, indents/[id]/page, EnhancedEditableItemsCard, WarehouseSelector, etc.); add "Last Verified" and review on UI changes.

### 2.8 Priority Tags

- **Rule**: Tag with @p0/@p1/@p2 for CI tiers and prioritization.
- **Current**: Only some scenarios have @p1; many regression scenarios have no priority.
- **Practice**: Assign @p0 to smoke/critical path, @p1 to core flows, @p2 to edge cases; ensure every scenario has a priority tag.

---

## 3. New Guidelines for Sr Automation Engineers

### 3.1 Documentation Sync (Mandatory)

1. **After any test add/change**: Update test-cases.md, gap-analysis.md (resolve/open gaps), TEST_CASE_REGISTRY.md (status + scenario hash if adopted), and test-impact-matrix.md (affected files + POM).
2. **After a batch (e.g. consolidation)**: Update implementation-history.md and create/update IMPL-### with tests created/updated and coverage impact.
3. **knowledge.md**: Keep "Test Coverage" and "Known Issues" in sync with current automation; add new UI patterns and locators as discovered.

### 3.2 Wait Strategy (Mandatory)

1. **Do not add new `page.waitForTimeout(ms)`**; use:
   - `expect(locator).toBeVisible({ timeout })` / `.toBeHidden()`
   - `page.waitForResponse(urlOrPredicate)` for API-driven UI
   - `PollingHelper.pollUntil(condition, options)` for debounced or async UI
   - Short, documented timeouts only where no event-based alternative exists (and add a TODO to replace).
2. **Refactor existing**: Replace existing waitForTimeout in O2C steps and POMs in a dedicated change (by file) and run full indent suite to confirm stability.

### 3.3 Test Data & Profiles

1. **Centralize test data**: Prefer TestDataLocator (or a single profile table in docs) for dealers, warehouses, and products. Document profile IDs (P-APPROVAL, P-REJECT, etc.) in FEATURE-001 and in feature file header.
2. **Tag scenarios with profile**: Use `@profile-P-APPROVAL` etc. so runs and failures can be tied to data requirements.
3. **AUTO_QA_ prefix**: Use for any transactional data created in tests (e.g. approval comments already use "AUTO_QA …").

### 3.4 Sandwich Method (Where Applicable)

1. **Indent creation**: Optional but recommended: DB BEFORE (count indents for tenant/user), UI create, DB AFTER (count +1, or fetch latest indent and assert dealer_id/status).
2. **Status transitions**: After Submit Indent → assert indent status = submitted; after Approve/Reject → assert status = approved/rejected (read-only queries).
3. **Process Workflow**: After Confirm & Process → assert SO (and back_order if applicable) record exists and links to indent (if schema and permissions allow).
4. Keep all DB usage read-only (SELECT only); no DELETE/UPDATE in tests.

### 3.5 Scenario Hashes (Deduplication)

1. **TEST_CASE_REGISTRY**: Add a "Scenario Hash" column. Hash = stable hash of normalized scenario text (e.g. strip tags, normalize whitespace, Given/When/Then only).
2. **Before adding a new scenario**: Compute hash and search registry; if hash or near-duplicate exists, extend existing test or document why a new one is needed (overlap % and difference).

### 3.6 Multi-User (70/30)

1. **When to add**: For O2C, add multi-user when validating permissions (e.g. who can approve, who sees what indents) or tenant isolation.
2. **Pattern**: Scenario Outline with Examples (User, Expected Result); step "I am logged in as \<User\>"; tag @multi-user and role tags.
3. **Target**: Aim for ~30% of O2C scenarios to be multi-user once SO/Invoice and roles are in scope.

### 3.7 List vs Journey Coverage

1. **When consolidating into one E2E journey**: Keep at least one short smoke that does **list-only** (load list, optional search/filter) and one **create → detail** (no full approval). This gives fast feedback if list or create breaks without running the full journey.
2. **Current**: TC-038 (back from detail) and TC-002 (create → detail) help; consider re-adding a single "list load + table or empty state" smoke if TC-028 is the only list assertion.

### 3.8 Locators

1. **Avoid** `locator('..').locator('..')`; prefer getByRole, getByLabel, getByText with scoping (e.g. within dialog/card).
2. **If parent chaining is unavoidable**: Add a brief comment and a data-testid request for the frontend so it can be replaced.

### 3.9 Priority and Tags

1. **Every scenario** must have a priority: @p0 (critical/smoke), @p1 (high), @p2 (medium), @p3 (low).
2. **Keep** @smoke @critical @regression and user/tenant tags as per persona; add @profile-* when using a documented profile.

### 3.10 Run Order / Tags (Optional)

1. **FEATURE-001** suggests run order: list/navigation (no create) → E2E journey → profile-specific. Consider tags like `@list-only`, `@e2e-journey`, `@profile-P-REJECT` to support ordered or parallel runs and clearer failure attribution.

---

## 4. Summary Checklist for Sr Engineers

| Area | Action |
|------|--------|
| **Docs** | Sync gap-analysis, knowledge, implementation-history, TEST_CASE_REGISTRY, test-impact-matrix with current implementation. |
| **Waits** | Stop adding waitForTimeout; replace existing with event-based waits. |
| **Data** | Use TestDataLocator or profile table; tag scenarios with @profile-*; document profiles in feature header. |
| **DB** | Add Sandwich Method for indent create, submit, approve/reject, and Process Workflow (read-only). |
| **Registry** | Add scenario hashes; check before new scenarios. |
| **Multi-user** | Add at least one @multi-user scenario; plan for 30% when SO/roles ready. |
| **Locators** | Avoid parent chaining; prefer semantic locators. |
| **Priority** | Ensure every scenario has @p0/@p1/@p2. |
| **Impact** | Keep test-impact-matrix aligned with POMs and real source files. |

---

**Document Owner**: QA / Automation Lead  
**Next Review**: After O2C wait refactor and documentation sync (suggest within one sprint).
