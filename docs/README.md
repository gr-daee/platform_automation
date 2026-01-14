# DAEE Platform Automation - Documentation

## Overview
This directory contains all documentation for the DAEE Platform test automation framework, including setup guides, implementation details, module-specific knowledge, and test case documentation.

## Documentation Structure

### 📚 [Framework Documentation](framework/)
Framework-level documentation including setup guides, implementation details, and configuration.

**Key Documents:**
- [Setup Guide](framework/setup/SETUP_GUIDE.md) - Getting started with the framework
- [Environment Setup](framework/setup/ENV_SETUP_GUIDE.md) - Environment variable configuration
- [Implementation Complete](framework/implementation/IMPLEMENTATION_COMPLETE.md) - Framework implementation summary

### 🧪 [Test Cases](test-cases/)
Test case documentation organized by automation and manual testing.

**Structure:**
- `automation/` - Automated test case documentation
- `manual/` - Manual test case references

### 📦 [Modules](modules/)
Module-specific documentation organized by business domain.

**Available Modules:**
- [Authentication](modules/auth/) - Login, TOTP MFA, session management
- [Order-to-Cash (O2C)](modules/o2c/) - Indents, orders, invoicing

Each module contains:
- **knowledge.md** - Application knowledge and business rules
- **test-cases.md** - Test case inventory
- **gap-analysis.md** - Known gaps and issues
- **discussions.md** - Module discussions and decisions

### 🧠 [Knowledge Base](knowledge-base/)
Cross-module knowledge including architecture, database schema, and business rules.

**Key Documents:**
- `database-schema.md` - Database structure and relationships
- `business-rules.md` - Business logic and rules
- `architecture.md` - System architecture overview
- `api-endpoints.md` - API documentation

## Quick Navigation

### For Test Developers
1. Start with [Framework Setup Guide](framework/setup/SETUP_GUIDE.md)
2. Review [Module Knowledge](modules/) for your area
3. Check [Existing Test Cases](test-cases/automation/)
4. Follow [Context-Aware Rules](../.cursor/rules/context-awareness.mdc)

### For Framework Maintenance
1. Review [Implementation Documentation](framework/implementation/)
2. Check [Framework Standards](../.cursor/rules/sqa-standards.mdc)
3. Update [Knowledge Base](knowledge-base/) as needed

### For Module Understanding
1. Read [Module Knowledge](modules/[module]/knowledge.md)
2. Review [Test Cases](modules/[module]/test-cases.md)
3. Check [Gap Analysis](modules/[module]/gap-analysis.md)
4. Study [Source Code](../web_app/src/app/[module]/)

## Documentation Standards

### When Creating Tests
- ✅ Read module knowledge first
- ✅ Check existing test cases
- ✅ Update test case documentation
- ✅ Document new knowledge discovered

### When Discovering Information
- ✅ Add to module knowledge.md
- ✅ Update knowledge-base if cross-module
- ✅ Document in gap-analysis if it's a gap

### Documentation Format
- Use consistent markdown structure
- Include code examples
- Link to related documentation
- Keep README files updated

## Cursor Rules Integration

This documentation structure works with Cursor rules:

- **[context-awareness.mdc](../.cursor/rules/context-awareness.mdc)** - Enforces reading docs before generating tests
- **[docs-management.mdc](../.cursor/rules/docs-management.mdc)** - Maintains documentation when creating tests
- **[sqa-generator.mdc](../.cursor/rules/sqa-generator.mdc)** - Uses knowledge base for better code generation

## Contributing to Documentation

### Adding New Module Documentation
1. Create module directory: `modules/[module-name]/`
2. Create standard files (knowledge.md, test-cases.md, README.md)
3. Update [Modules README](modules/README.md)
4. Link from this README

### Updating Knowledge Base
1. Add cross-module knowledge to `knowledge-base/`
2. Update relevant module knowledge.md
3. Keep links current and valid

### Maintaining Test Cases
1. Update `modules/[module]/test-cases.md` when creating tests
2. Update `test-cases/automation/[module]/` for detailed documentation
3. Link to feature files and step definitions

## Related Resources

- **Source Code**: `../web_app/src/` - Application source code
- **Test Code**: `../e2e/` - Test automation code
- **Cursor Rules**: `../.cursor/rules/` - AI assistant rules
- **Project README**: `../README.md` - Project overview

## Need Help?

- Check [Framework Setup Guide](framework/setup/SETUP_GUIDE.md) for setup issues
- Review [Module Knowledge](modules/) for domain understanding
- Consult [Cursor Rules](../.cursor/rules/) for code generation standards
- Contact DAEE QA team for questions

---

**Last Updated**: 2026-01-14  
**Maintained By**: DAEE QA Team
