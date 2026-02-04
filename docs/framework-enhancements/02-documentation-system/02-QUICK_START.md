# Documentation System - Quick Start Guide

**For**: Sr Automation Engineers
**Purpose**: Get started with the new documentation & knowledge management system in 10 minutes

---

## TL;DR (30 seconds)

**Before creating ANY test**:
1. Search for duplicates: `grep -i "[scenario]" docs/modules/[module]/test-cases.md`
2. Read gap-analysis: `docs/modules/[module]/gap-analysis.md`
3. Check impact (if code changed): `./scripts/analyze-change-impact.sh`

**After creating test**:
4. Create IMPL doc: Use `docs/implementations/templates/implementation-template.md`
5. Update gap-analysis: Mark gaps ✅ resolved
6. Update test-impact-matrix: Map test to source files

---

## Quick Reference Card

### File Naming Conventions

| Document Type | Naming | Example | Location |
|--------------|--------|---------|----------|
| Implementation | `IMPL-###_feature-name.md` | `IMPL-025_auth-timeout.md` | `docs/implementations/YYYY-MM/` |
| Feature Analysis | `FEATURE-###-analysis.md` | `FEATURE-042-indent-approval.md` | `docs/modules/[module]/features/` |
| Gap ID | `GAP-MODULE-P#-###` | `GAP-O2C-P1-003` | In `gap-analysis.md` |
| Test ID | `MODULE-FEATURE-TC-###` | `O2C-INDENT-TC-001` | In `test-cases.md` |

---

## Common Workflows

### Workflow A: Creating Test for New Feature

```bash
# Step 1: Check for feature analysis
ls docs/modules/o2c/features/
# If missing, create: docs/modules/o2c/features/FEATURE-042-analysis.md

# Step 2: Check for duplicates
grep -i "create indent" docs/modules/o2c/test-cases.md

# Step 3: Read gap-analysis
cat docs/modules/o2c/gap-analysis.md

# Step 4: Create test (follow Workflow 1 in persona)

# Step 5: Create IMPL document
cp docs/implementations/templates/implementation-template.md \
   docs/implementations/2026-02/IMPL-026_indent-creation.md
# Fill in template

# Step 6: Update docs
# - Update gap-analysis.md (mark gaps ✅)
# - Update test-impact-matrix.md (map test)
# - Update implementation-history.md (link IMPL)
```

---

### Workflow B: Modifying Existing Test (Code Changed)

```bash
# Step 1: Run change impact analysis
./scripts/analyze-change-impact.sh main..feature-branch

# Step 2: Review output - which tests affected?
# Example output: O2C-INDENT-TC-001, O2C-INDENT-TC-002

# Step 3: Update affected tests
# - Update locators if component changed
# - Update assertions if behavior changed
# - Deprecate if feature removed

# Step 4: Create IMPL document
cp docs/implementations/templates/implementation-template.md \
   docs/implementations/2026-02/IMPL-027_indent-form-refactor.md
# Document: "Existing Tests Updated" section

# Step 5: Update test-impact-matrix.md
# - Update "Last Verified" dates for affected tests
```

---

### Workflow C: Checking for Duplicate Tests

```bash
# Step 1: Extract scenario signature
# Module: O2C
# Feature: Indent
# Action: Create with valid data
# Outcome: Success

# Step 2: Search test-cases.md
grep -i "create.*valid" docs/modules/o2c/test-cases.md

# Step 3: Search TEST_CASE_REGISTRY.md
grep -i "O2C.*create" docs/test-cases/TEST_CASE_REGISTRY.md

# Step 4: Analyze overlap
# If found: O2C-INDENT-TC-001 - "Create indent with valid dealer"
# Overlap: ~85% (same flow, different validation)

# Step 5: Decide
# >90%: Extend existing (don't create new)
# 80-90%: Consider parameterization
# <80%: Create new, document relationship
```

---

## Decision Trees

### Should I Create FEATURE-### Analysis?

```
Is this a NEW feature (not just bug fix)?
├─ YES: Does FEATURE-###-analysis.md exist?
│  ├─ YES: Read it and follow scenarios
│  └─ NO: Create from template FIRST
└─ NO: Skip feature analysis, just create IMPL-###
```

---

### Should I Extend Existing Test or Create New?

```
Search for similar test scenarios
├─ FOUND similar test
│  └─ Calculate overlap
│     ├─ >90%: ❌ DON'T CREATE (extend existing)
│     ├─ 80-90%: ⚠️ ASK: Can we parameterize?
│     ├─ 70-79%: ⚠️ CREATE (document why separate)
│     └─ <70%: ✅ CREATE (note relationship)
└─ NO similar test
   └─ ✅ CREATE (verify it's not a gap already tracked)
```

---

### What Priority for a Gap?

```
What's the impact of this gap?
├─ P0 (Critical): Blocks release, core flow unverified
├─ P1 (High): Important validation, high user impact
├─ P2 (Medium): Edge case, moderate user impact
└─ P3 (Low): Nice-to-have, rare scenario
```

---

## Essential Commands

### Search for Duplicates
```bash
# Search by action
grep -i "create indent" docs/modules/o2c/test-cases.md

# Search by scenario
grep -i "valid data" docs/modules/o2c/test-cases.md

# Search TEST_CASE_REGISTRY
grep "O2C.*INDENT" docs/test-cases/TEST_CASE_REGISTRY.md
```

### Check Change Impact
```bash
# Current branch vs main
./scripts/analyze-change-impact.sh

# Specific branch range
./scripts/analyze-change-impact.sh main..feature-indent-approval

# Output shows: affected tests, risk levels, recommendations
```

### Find Affected Tests for a Component
```bash
# Search test-impact-matrix
grep "IndentForm.tsx" docs/test-cases/test-impact-matrix.md

# Output: Lists all tests using that component
```

---

## Templates Location

| Template | Path |
|----------|------|
| Implementation | `docs/implementations/templates/implementation-template.md` |
| Feature Analysis | `docs/implementations/templates/feature-analysis-template.md` |
| Gap Analysis | `docs/modules/templates/gap-analysis-template.md` |

**Usage**:
```bash
# Copy template to new location
cp docs/implementations/templates/implementation-template.md \
   docs/implementations/2026-02/IMPL-###_my-feature.md

# Edit new file with your content
```

---

## Documentation Update Checklist

After creating or modifying tests, check these boxes:

### Minimum Required (MANDATORY)
- [ ] `test-cases.md` updated with new test details
- [ ] `IMPL-###.md` created documenting changes
- [ ] `gap-analysis.md` updated (gaps resolved or new gaps added)

### Highly Recommended
- [ ] `TEST_CASE_REGISTRY.md` updated with scenario hash
- [ ] `test-impact-matrix.md` updated with test-to-code mapping
- [ ] `implementation-history.md` updated with link to IMPL

### Optional (For New Features)
- [ ] `FEATURE-###-analysis.md` created (if new feature)
- [ ] `knowledge.md` updated (if new patterns discovered)

---

## Quick Examples

### Example 1: Creating IMPL Document

```markdown
# IMPL-026 - Indent Creation Tests

**Metadata**
- **ID**: IMPL-026
- **Date**: 2026-02-04
- **Module**: O2C
- **Type**: New Feature
- **Status**: Complete

## New Tests Created

| Test ID | Scenario | Status |
|---------|----------|--------|
| O2C-INDENT-TC-001 | Create with valid data | ✅ Pass |
| O2C-INDENT-TC-002 | Submit for approval | ✅ Pass |

## Tests Deprecated

None

## Corner Cases Discovered

1. **Unicode in dealer name**: System handles correctly
   - Test: O2C-INDENT-TC-004 (created)
```

---

### Example 2: Adding Gap to gap-analysis.md

```markdown
### GAP-O2C-P1-005: No test for concurrent submission
- **Description**: Multiple users submitting same indent simultaneously
- **Impact**: High - Data corruption possible
- **Scenario**: Two users click submit at same time
- **Risk**: Race condition, duplicate submissions
- **Test ID Needed**: O2C-INDENT-TC-020
- **Status**: 🔴 Open
- **Priority Rationale**: High user impact, data integrity risk
```

---

### Example 3: Marking Gap Resolved

```markdown
### ✅ GAP-O2C-P1-003: No test for duplicate name validation
- **Resolved**: 2026-02-04
- **Resolution**: Created test O2C-INDENT-TC-007
- **Implementation**: IMPL-026
- **Notes**: Test covers database constraint and UI error message
```

---

## Troubleshooting

### Q: Where do I find the IMPL number?

**A**: Check the highest existing number in `docs/implementations/YYYY-MM/` and increment by 1.

```bash
ls docs/implementations/2026-02/ | grep "IMPL" | sort -V | tail -1
# Output: IMPL-025_auth-timeout.md
# Your new number: IMPL-026
```

---

### Q: How do I know if a test is a duplicate?

**A**: Search test-cases.md for similar scenarios, calculate overlap:

```bash
# Search for similar action
grep -i "create.*indent" docs/modules/o2c/test-cases.md

# If found: "O2C-INDENT-TC-001: Create indent with valid dealer"
# Compare scenarios:
# - Yours: "Create indent with valid products"
# - Existing: "Create indent with valid dealer"
# Overlap: ~70% (same flow, different validation)
# Decision: Create new, document relationship
```

---

### Q: Change impact script shows no results, but I changed code?

**A**: Script only detects changes in `web_app/src/app`. If you changed:
- Backend code: Manually check test-impact-matrix.md
- Database schema: Review affected modules in knowledge.md
- Config files: Manual review needed

---

### Q: Should I create FEATURE-### for a bug fix?

**A**: **NO**. Feature analysis is for NEW features only.

**For bug fixes**:
1. Create IMPL-### documenting fix
2. Update affected tests (if test needs changing)
3. Update test-impact-matrix.md

---

## Getting Help

### Ask in this Order:
1. **Read the templates** - Most questions answered there
2. **Check examples** - auth and o2c modules have examples
3. **Search this guide** - Ctrl+F for keywords
4. **Ask Sr Automation Engineer persona in Cursor** - It knows the system
5. **Ask team lead** - For policy/priority questions

---

## Pro Tips

### 1. Use Templates as Checklists
Don't fill templates blindly. Each section is a reminder of what to consider.

### 2. Link Everything
In IMPL documents, link to:
- Test IDs in test-cases.md
- Gap IDs in gap-analysis.md
- Source files in web_app
- Related IMPL documents

### 3. Capture Corner Cases Immediately
When you discover a corner case during testing:
1. Document in IMPL-### (Corner Cases Discovered section)
2. If not implemented, add to gap-analysis.md as new gap

### 4. Verify Your Work
Before PR:
- Run: `./scripts/analyze-change-impact.sh`
- Verify: test-impact-matrix.md mappings accurate
- Check: All documentation updated

### 5. Think Like a Detective
When debugging or analyzing:
- What changed? (git diff)
- What broke? (which tests)
- What's missing? (gap-analysis.md)
- What's the relationship? (test-impact-matrix.md)

---

## One-Minute Workflow Summary

**New Feature Test**:
1. Search duplicates → 2. Check gaps → 3. Create test → 4. Create IMPL-### → 5. Update docs

**Code Change**:
1. Run impact script → 2. Update tests → 3. Create IMPL-### → 4. Update matrix

**That's it!** 🎯

---

## Next Steps

1. ✅ Bookmark this guide
2. ✅ Try creating a FEATURE-### or IMPL-### for practice
3. ✅ Run `./scripts/analyze-change-impact.sh` to see it in action
4. ✅ Ask questions early (system is new, questions are expected)

---

**Remember**: Documentation is not overhead—it's insurance. Future you (and your teammates) will thank present you.

**Good luck!** 🚀
