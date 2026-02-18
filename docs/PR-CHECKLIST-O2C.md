# PR Checklist – O2C / Documentation Updates

Use this before raising a PR for O2C automation or docs changes.

---

## 1. Automation repo (platform_automation)

### Scripts available
- **No `npm run lint` or `npm run typecheck`** in this repo. Use IDE linter and run tests instead.
- **`npm run bdd:generate`** – run before commit so `.features-gen/` is up to date.
- **`npm run test:o2c`** or **`npm run test:o2c:dev`** – run O2C tests (dev needs env).

### Linting / IDE
- **Feature file “Undefined step”** warnings in `indents.feature` are expected: steps are defined in TypeScript (`indent-steps.ts`) via playwright-bdd and resolve at runtime. No fix needed.
- Fix any **TypeScript/ESLint errors** in `e2e/src/` (steps, pages, support).

### Pre-PR checks
- [ ] `npm run bdd:generate` – run and commit if `.features-gen/` changed.
- [ ] Run O2C tests: `npm run test:o2c` (or `test:o2c:dev` with env) – ensure they pass.
- [ ] No `page.waitForTimeout()` added (framework prefers event-based waits).
- [ ] No CSS class selectors; use semantic locators (getByRole, getByLabel, etc.).
- [ ] POMs extend BasePage; use component library where applicable.

---

## 2. Documentation (framework Quality Gates)

- [ ] **test-cases.md** – O2C TC-001–TC-020 and step list up to date.
- [ ] **TEST_CASE_REGISTRY.md** – O2C Indent section matches test-cases.md (TC-001–TC-020, all ✅).
- [ ] **knowledge.md** – Test coverage and test data sections current.
- [ ] **gap-analysis.md** – Resolved/open gaps and “Last Updated” correct.
- [ ] **implementation-history.md** – New/updated IMPL or consolidation noted.
- [ ] **README / features/README** – Links point to current docs (e.g. FEATURE-001).
- [ ] **Broken links** – No links to removed files (e.g. old FEATURE-002).

---

## 3. PR description

- [ ] Short summary of changes (e.g. “O2C docs sync, FEATURE-001/002 consolidated, registry TC-001–TC-020”).
- [ ] List touched areas: docs/modules/o2c, docs/test-cases, e2e/features/o2c, e2e/src (if any).
- [ ] Note if tests were run and result (e.g. “O2C indent scenarios passed locally”).

---

## 4. Optional (if tests were modified)

- [ ] test-impact-matrix.md – Affected tests and source files updated.
- [ ] IMPL-### created/updated in docs/implementations/YYYY-MM/ if new tests or major changes.

---

**Reference:** Framework Quality Gates – `.cursor/rules/framework-workflows.mdc` §6.
