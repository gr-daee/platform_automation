# Modules Documentation

## Overview
Module-specific documentation organized by business domain. Each module contains knowledge, test cases, gap analysis, and discussions.

## Available Modules

### Authentication (`auth/`)
User authentication, login, TOTP MFA, and session management.
- [Knowledge Base](auth/knowledge.md)
- [Test Cases](auth/test-cases.md)
- [Module Overview](auth/README.md)

### Order-to-Cash (`o2c/`)
Order-to-cash process including indents, orders, and invoicing.
- [Knowledge Base](o2c/knowledge.md)
- [Test Cases](o2c/test-cases.md)
- [Module Overview](o2c/README.md)

### Plant Production (`plant-production/`)
Manufacturing lifecycle: plants, licenses, assets, BOMs, work orders, material issuance, finished goods, and QC.
- [Knowledge Base](plant-production/knowledge.md)
- [Test Cases](plant-production/test-cases.md)
- [Gap Analysis](plant-production/gap-analysis.md)
- [Implementation History](plant-production/implementation-history.md)

## Module Documentation Structure

Each module directory contains:

- **knowledge.md** - Application knowledge, business rules, component details
- **test-cases.md** - Test case inventory and coverage
- **gap-analysis.md** - Known gaps, issues, and missing functionality
- **discussions.md** - Module discussions, decisions, and design notes
- **README.md** - Module overview and navigation

## Adding New Modules

When adding a new module:

1. Create module directory: `docs/modules/[module-name]/`
2. Create standard files:
   - `knowledge.md` - Copy from template
   - `test-cases.md` - Copy from template
   - `README.md` - Module overview
3. Update this README with module entry
4. Link from main docs README

## Navigation
- [Back to Main Documentation](../README.md)
- [Framework Documentation](../framework/README.md)
- [Knowledge Base](../knowledge-base/README.md)
