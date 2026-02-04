---
name: Framework Cleanup Plan
overview: Clean up redundant and archived files from the test automation framework, removing duplicates in .cursor/rules and consolidating documentation structure between docs/framework and docs/framework-enhancements folders.
todos: []
isProject: false
---

# Framework Cleanup Plan

## Overview

Remove redundant files and consolidate documentation structure to keep only what matters.

---

## Issues Identified

### 1. Duplicate Rules in .cursor/rules/

**Problem**: Old rules exist in BOTH `archive/` and root level

- `context-awareness.mdc` (archived + root)
- `docs-management.mdc` (archived + root)
- `framework-overview.mdc` (archived + root)
- `sqa-generator.mdc` (archived + root)
- `sqa-standards.mdc` (archived + root)

**Current Active Rules**: Only 3 should remain

- `sr-automation-engineer-persona.mdc` (primary entry point)
- `automation-patterns.mdc` (technical patterns)
- `framework-workflows.mdc` (process workflows)

### 2. Documentation Folder Overlap

**Problem**: Two similar folders with potential confusion

- `docs/framework/` - Basic setup/usage guides
- `docs/framework-enhancements/` - Enhancement implementation docs

**Purpose Clarification Needed**:

- `framework/` = Core framework docs (setup, configuration, usage)
- `framework-enhancements/` = Enhancement history (consolidation, doc system)

### 3. Potential Stale Documents

- `docs/DOCUMENTATION_ORGANIZATION_COMPLETE.md` (old organization doc, may be redundant with framework-enhancements/)

---

## Cleanup Actions

### Action 1: Delete Entire .cursor/rules/archive/ Folder

**Rationale**: These files are superseded by the 3 consolidated rules

**Files to Delete**:

- `.cursor/rules/archive/context-awareness.mdc`
- `.cursor/rules/archive/docs-management.mdc`
- `.cursor/rules/archive/framework-overview.mdc`
- `.cursor/rules/archive/sqa-generator.mdc`
- `.cursor/rules/archive/sqa-standards.mdc`
- `.cursor/rules/archive/` (entire folder)

**Impact**: No impact - these are archived/superseded files

---

### Action 2: Delete Redundant Root-Level Rules

**Rationale**: These 5 old rules were consolidated into 3 new rules

**Files to Delete**:

- `.cursor/rules/context-awareness.mdc`
- `.cursor/rules/docs-management.mdc`
- `.cursor/rules/framework-overview.mdc`
- `.cursor/rules/sqa-generator.mdc`
- `.cursor/rules/sqa-standards.mdc`

**Keep These (Active Rules)**:

- `.cursor/rules/sr-automation-engineer-persona.mdc` (primary)
- `.cursor/rules/automation-patterns.mdc` (technical)
- `.cursor/rules/framework-workflows.mdc` (process)

**Impact**: Cleaner rules folder, no confusion about which rules are active

---

### Action 3: Review and Archive Old Organization Doc

**File**: `docs/DOCUMENTATION_ORGANIZATION_COMPLETE.md`

**Options**:
A. **Delete** if content is fully superseded by `framework-enhancements/REORGANIZATION_COMPLETE.md`
B. **Keep** if it documents a different organizational change

**Recommendation**: Delete (superseded by newer reorganization doc)

---

### Action 4: Keep Both Framework Folders (Clarify Purpose)

**Decision**: Keep both folders - they serve different purposes

**[docs/framework/](docs/framework/README.md)** (Keep):

- Purpose: Core framework documentation (setup, configuration, usage)
- Audience: Engineers setting up and using the framework
- Content: Setup guides, test execution modes, environment config

**[docs/framework-enhancements/](docs/framework-enhancements/README.md)** (Keep):

- Purpose: Enhancement history and implementation records
- Audience: Architects, leads reviewing what changed
- Content: Consolidated rules implementation, documentation system implementation

**Action**: Update `docs/README.md` to clarify the distinction between these folders

---

## Files Summary

### To Delete (10 files + 1 folder)

1. `.cursor/rules/archive/` (entire folder with 5 files)
2. `.cursor/rules/context-awareness.mdc`
3. `.cursor/rules/docs-management.mdc`
4. `.cursor/rules/framework-overview.mdc`
5. `.cursor/rules/sqa-generator.mdc`
6. `.cursor/rules/sqa-standards.mdc`
7. `docs/DOCUMENTATION_ORGANIZATION_COMPLETE.md`

### To Keep

- `.cursor/rules/sr-automation-engineer-persona.mdc`
- `.cursor/rules/automation-patterns.mdc`
- `.cursor/rules/framework-workflows.mdc`
- `docs/framework/` (all files)
- `docs/framework-enhancements/` (all files)

### To Update

- `docs/README.md` - Add clarification about framework vs framework-enhancements folders

---

## Expected Outcome

**Before**:

- 8 rule files in `.cursor/rules/` (3 active + 5 redundant)
- 5 archived files in `.cursor/rules/archive/`
- Unclear distinction between docs/framework and docs/framework-enhancements

**After**:

- 3 active rule files in `.cursor/rules/` (clean)
- No archive folder (deleted)
- Clear documentation structure with purpose-based folders
- Updated docs/README.md explaining folder purposes

---

## Validation Steps

After cleanup:

1. Verify only 3 rule files remain in `.cursor/rules/`
2. Verify archive folder is deleted
3. Verify docs structure is clean and clear
4. Test Cursor persona still references correct documentation paths

