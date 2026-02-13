# Playwright Framework Compliance Review — Architect/SDET Assessment

**Date:** 2026-02-11  
**Scope:** platform_automation Playwright-BDD framework, Cursor rules, best-practice alignment  
**Reviewer perspective:** Top 5% Test Automation Architect / SDET

---

## Executive Summary

The DAEE platform automation framework is **well-architected** and aligns with many industry best practices: BDD, Page Object Model, Sandwich Method for DB verification, multi-user auth, and strong documentation. Gaps are mostly tactical (deprecated waits, minor rule coverage) and one strategic opportunity: **Playwright MCP integration** for AI-assisted test authoring and debugging.

| Area | Score | Notes |
|------|--------|------|
| Architecture & patterns | 9/10 | POM, BDD, component library, semantic locators |
| Cursor rules & AI guidance | 9/10 | Persona + patterns + workflows; MCP not yet referenced |
| Config & execution | 8/10 | Solid; env-based modes, projects, reporters |
| Code quality & maintainability | 7/10 | Few anti-patterns (waitForTimeout, bracket access) |
| Documentation system | 9/10 | Knowledge base, test registry, impact matrix |
| **Overall** | **8.4/10** | Production-ready; small fixes + MCP = excellent |

---

## 1. Best-Practice Compliance

### 1.1 What’s Done Well

- **BDD with playwright-bdd**  
  Gherkin in `e2e/features/**/*.feature`, step defs in TypeScript, tags (@smoke, @critical, @regression, test case IDs). Clear separation of scenarios vs implementation.

- **Page Object Model**  
  All POMs extend `BasePage`; shared navigation, toast, dialog, form, and wait helpers. Component library (Select, Dialog, Toast) for ShadCN/Radix. Aligns with “single place for UI” and reuse.

- **Semantic locators**  
  Rules enforce getByRole/getByLabel/getByPlaceholder; forbidden CSS classes and XPath. Implemented in BasePage and component wrappers.

- **Sandwich Method (DB verification)**  
  Read-only DB helper, SELECT-only, used for state-before / UI action / state-after. Documented in rules and used in steps where applicable.

- **Test data discipline**  
  `AUTO_QA_` prefix for transactional data; `TestDataLocator` for stable entities. Reduces flakiness and supports read-only DB policy.

- **Multi-user / multi-tenant**  
  Global setup with TOTP, multiple storage states (admin, iacs-md), project-based routing. Documented in framework-enhancements and persona.

- **Execution model**  
  Modes (production/debug/development), worker control, trace/screenshot/video policies, webServer for local dev. Allure Report 3 and Playwright HTML reporters.

- **Documentation system**  
  Module knowledge, test-cases, gap-analysis, TEST_CASE_REGISTRY, test-impact-matrix, IMPL templates. Strong traceability and onboarding.

### 1.2 Gaps and Non-Compliance

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| **`page.waitForTimeout()`** (deprecated / anti-pattern) | Medium | global.setup.ts, BasePage.ts, IndentsPage.ts, indent-steps.ts, auth-steps.ts, SelectComponent.ts | Replace with `expect(locator).toBeVisible()` or `waitForResponse` / `waitForLoadState`; only where truly needed use `setTimeout` in a promise or a short polling loop. |
| **Bracket access to private-like member** | Low | indent-steps.ts: `indentsPage['dealerSearchInput']` | Expose via public getter or method on IndentsPage (e.g. `getDealerSearchInput()`) to keep encapsulation. |
| **Quality gate vs implementation** | Low | framework-workflows.mdc forbids `waitForTimeout` but code still uses it | Fix all usages and add ESLint rule or comment in BasePage/patterns to prevent reintroduction. |

---

## 2. Cursor Rules Review

### 2.1 Rule Set Summary

| Rule | Purpose | Assessment |
|------|---------|------------|
| **sr-automation-engineer-persona.mdc** | Persona (Testra), workflows (new test, POM, debug, feature, code changes), anti-patterns, semantic locators, ShadCN patterns, Sandwich Method, docs checklist, deduplication | **Strong.** Single entry point; references docs and templates. |
| **automation-patterns.mdc** | POM template, component library usage, locator priority, step patterns, DB verification, test data, waits, errors | **Strong.** Concrete code examples; aligns with implementation. |
| **framework-workflows.mdc** | Pre-implementation checklist, test creation workflow, doc standards, debugging, lifecycle, quality gates | **Strong.** Process and quality gates are clear. |

### 2.2 Strengths

- **Persona as single entry point**  
  “Read this first” and “daily reference” are clear. Workflows (create test, POM, debug, new feature, code changes) are well scoped.

- **Context before code**  
  Mandatory reads: module knowledge, test-cases, gap-analysis, app source, TEST_CASE_REGISTRY, impact matrix. Reduces duplicate and misaligned tests.

- **Deduplication protocol**  
  Scenario signature, search steps, overlap thresholds (>90% don’t create, 80–90% extend), and documentation in test-cases.md are defined.

- **Globs**  
  Rules apply to `e2e/**/*.ts`, `e2e/**/*.feature`, `docs/**/*.md` where relevant, so AI gets context when editing tests/docs.

### 2.3 Suggestions for Cursor Rules

1. **Add “Playwright MCP” section to persona or a dedicated rule**  
   - When to use MCP (explore app, generate selectors, record flows, screenshot debugging).  
   - That MCP is for **assistive** authoring; final tests must still follow framework rules (BasePage, semantic locators, BDD, docs).

2. **Reference MCP in debugging workflow**  
   - e.g. “For live DOM/layout issues, use Playwright MCP snapshot/screenshot before changing locators.”

3. **Optional: automation-patterns.mdc**  
   - One short subsection: “Replacing waitForTimeout” with preferred patterns (wait for element, network, or explicit expect with timeout).

4. **Optional: project-level rule**  
   - `.cursor/rules/playwright-mcp-usage.mdc` (globs: `e2e/**`) describing MCP tools available and how they map to framework concepts (e.g. “use snapshot to derive getByRole/getByLabel, then implement in POM”).

---

## 3. Playwright MCP Integration

### 3.1 Why Integrate

- **Live DOM / accessibility snapshot**  
  MCP can expose current page structure so the AI suggests locators that match your semantic strategy (role, name, label).

- **Screenshot-driven debugging**  
  “Why did this step fail?” can be answered with a screenshot or snapshot from the same environment.

- **Test generation from real UI**  
  Navigate in MCP, then generate Gherkin + steps that follow your patterns (with human review).

- **Consistency with Cursor**  
  One more context source (browser state) alongside code and docs.

### 3.2 Recommended Server

**@executeautomation/playwright-mcp-server** is a good fit:

- Widely used; supports DOM snapshot, screenshots, codegen, device emulation.
- Works over stdio (Cursor-friendly).
- Cursor has a 60-char limit for `server_name:tool_name`; this server is aware of that.

### 3.3 Configuration Added

- **Project-level:** `.cursor/mcp.json` in `platform_automation` (committed) so every contributor gets Playwright MCP in this repo.
- **Content:** Single `playwright` (or `playwright-mcp`) server with `npx -y @executeautomation/playwright-mcp-server` so no global install is required.

See **Section 4** below for the exact JSON and usage notes.

### 3.4 Safe Integration with Framework

- MCP = **exploration and authoring aid**.  
- All committed tests must still:
  - Live in `e2e/features` + `e2e/src/steps` and `e2e/src/pages`.
  - Use BasePage, component library, semantic locators, BDD, and docs updates per persona/workflows.
- Use MCP to:
  - Inspect pages and suggest locators.
  - Capture screenshots for failure analysis.
  - Generate draft scenarios/steps that you then refactor into framework conventions.

---

## 4. Playwright MCP Setup (Applied in Repo)

- **Config file:** `platform_automation/.cursor/mcp.json`  
- **Content:** See that file; it registers the Playwright MCP server for Cursor in this project.

**Usage after setup:**

1. Open Cursor with `platform_automation` as the workspace (or ensure this folder’s `.cursor/mcp.json` is used).
2. Start your app (e.g. `cd ../web_app && npm run dev`).
3. In chat, ask the AI to use Playwright MCP to e.g. “open BASE_URL/o2c/indents and take an accessibility snapshot” or “take a screenshot of the current page.”
4. Use the snapshot/screenshot to refine locators or debug failures; then implement or fix tests in the framework as per the Cursor rules.

**Note:** If Cursor uses a global MCP config (e.g. `~/.cursor/mcp.json`), you can add the same `playwright` server block there instead of or in addition to the project config.

---

## 5. Action Items (Prioritized)

| Priority | Action | Owner |
|----------|--------|--------|
| P1 | Remove or replace all `page.waitForTimeout()` with event-based waits or expect with timeout | Dev/QA |
| P1 | Add Playwright MCP to Cursor (config already added in repo) and document in persona or MCP rule | Dev/QA |
| P2 | Replace `indentsPage['dealerSearchInput']` with a public getter/method on IndentsPage | Dev/QA |
| P2 | Add “Replacing waitForTimeout” to automation-patterns.mdc and “Playwright MCP” to persona or playwright-mcp-usage.mdc | Dev/QA |
| P3 | Optional: ESLint rule or comment in BasePage to discourage `waitForTimeout` | Dev/QA |

---

## 6. Conclusion

The framework is in the **top tier** for structure, documentation, and alignment with BDD, POM, and DB verification best practices. Cursor rules are a real strength and make the repo AI-friendly.

**Immediate improvements:**  
- Replace deprecated `waitForTimeout` usages.  
- Integrate Playwright MCP (config provided) and document its role in the Cursor rules.

**Result:**  
- Fewer flaky waits, better encapsulation, and stronger AI-assisted authoring and debugging, with no compromise to your existing standards.
