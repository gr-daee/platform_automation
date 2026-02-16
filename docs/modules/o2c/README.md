# O2C Module Documentation

## Overview
Documentation for the Order-to-Cash (O2C) module: indents, sales orders, and invoicing. **Indent test cases:** O2C-INDENT-TC-001 through TC-020 (sequential). **Single source of truth for indent TCs:** [test-cases.md](test-cases.md). Do not duplicate TC lists elsewhere; link to test-cases.md or TEST_CASE_REGISTRY.

## Core Documentation (aligned with finance/compliance)

| Document | Purpose |
|----------|---------|
| **[knowledge.md](knowledge.md)** | Application knowledge, business rules, test data (products, warehouses), component details |
| **[test-cases.md](test-cases.md)** | Test case inventory (TC-001–TC-020), coverage, POMs, step definitions |
| **[O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md](O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md)** | High-level test plan: Indent → SO → Invoice by block; status and feature file references |

## Supporting Documentation

| Document | Purpose |
|----------|---------|
| **[gap-analysis.md](gap-analysis.md)** | Known gaps and coverage tracking |
| **[implementation-history.md](implementation-history.md)** | IMPL records and coverage history |

## Feature analysis & test design

| Document | Purpose |
|----------|---------|
| **[features/FEATURE-001_indent-test-design-and-data-profiles.md](features/FEATURE-001_indent-test-design-and-data-profiles.md)** | Indent → SO: workflow analysis, component/locator notes, Test Data Profiles (P-APPROVAL, P-REJECT, etc.), journey-based E2E, scenario grouping (TC-001–TC-020) |

## Reviews (architect & response)

| Document | Purpose |
|----------|---------|
| **[reviews/O2C-AUTOMATION-ARCHITECT-REVIEW.md](reviews/O2C-AUTOMATION-ARCHITECT-REVIEW.md)** | Architect review: GAPs, best practices, guidelines |
| **[reviews/O2C-SR-AUTOMATION-ENGINEER-RESPONSE-TO-ARCHITECT.md](reviews/O2C-SR-AUTOMATION-ENGINEER-RESPONSE-TO-ARCHITECT.md)** | Sr Automation Engineer response and action plan |
| **[../../framework-enhancements/SR-AUTOMATION-ENGINEER-GUIDELINES-O2C.md](../../framework-enhancements/SR-AUTOMATION-ENGINEER-GUIDELINES-O2C.md)** | Sr Automation Engineer guidelines (O2C & general) |

## Quick Links

### Source Code
- O2C: `../web_app/src/app/o2c/`
- Indents: `../web_app/src/app/o2c/indents/`

### Test Code
- Feature: `../../e2e/features/o2c/indents.feature`
- POMs: `../../e2e/src/pages/o2c/`
- Steps: `../../e2e/src/steps/o2c/`

### Related
- [Framework Implementation](../../framework/implementation/IMPLEMENTATION_COMPLETE.md)
- [Back to Modules](../README.md) | [Back to Main Docs](../../README.md)
