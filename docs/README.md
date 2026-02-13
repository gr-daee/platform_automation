# DAEE Platform Automation - Documentation

## Overview
This directory contains all documentation for the DAEE Platform test automation framework, including setup guides, implementation details, module-specific knowledge, and test case documentation.

## Documentation Structure

### 🎓 [Training Materials](training/) **← START HERE FOR NEW TEAM MEMBERS**
**Purpose**: Structured learning path for new engineers joining the automation team.

Progressive training modules covering setup, architecture, test creation, and best practices.

**Learning Path:**
- [Training Index](training/README.md) - Complete learning path (Week 1-2)
- [01 - Getting Started](training/01-getting-started.md) - Setup and first test (2h)
- [02 - Framework Architecture](training/02-framework-architecture.md) - BDD, POM, Sandwich Method (2h)
- [03 - Running Tests](training/03-running-tests.md) - Execution modes and reports (2h)
- [04 - Creating Tests](training/04-creating-tests.md) - Test creation workflow (2h)
- [05 - Multi-User Testing](training/05-multi-user-testing.md) - 70/30 split strategy (2h)
- [06 - Advanced Patterns](training/06-advanced-patterns.md) - Component library, TestDataLocator (2h)
- [07 - Debugging Guide](training/07-debugging-guide.md) - Debug failures effectively (2h)
- [08 - Best Practices](training/08-best-practices.md) - Anti-patterns and quality gates (1h)

### 📚 [Framework Documentation](framework/)
**Purpose**: Core framework documentation for engineers setting up and using the framework.

Framework-level documentation including setup guides, implementation details, and configuration.

**Key Documents:**
- [Setup Guide](framework/setup/SETUP_GUIDE.md) - Getting started with the framework
- [Environment Setup](framework/setup/ENV_SETUP_GUIDE.md) - Environment variable configuration
- [Implementation Complete](framework/implementation/IMPLEMENTATION_COMPLETE.md) - Framework implementation summary
- [Test Execution](framework/usage/TEST_EXECUTION.md) - Test execution modes

### 🚀 [Framework Enhancements](framework-enhancements/)
**Purpose**: Enhancement history and implementation records for architects and leads.

Documentation of major framework enhancements, including consolidated rules implementation, documentation system setup, and multi-user authentication.

**Key Documents:**
- [Enhancements Overview](framework-enhancements/README.md) - Navigation index for all enhancements
- [01 - Consolidated Rules](framework-enhancements/01-consolidated-rules/01-IMPLEMENTATION_SUMMARY.md) - Rule consolidation (68% token reduction)
- [02 - Documentation System](framework-enhancements/02-documentation-system/02-QUICK_START.md) - Knowledge management system (daily reference)
- [03 - Multi-User Auth](framework-enhancements/03-multi-user-auth/02-QUICK_REFERENCE.md) - User-specific authentication (O2C uses IACS MD User)

### 🔧 [Troubleshooting](troubleshooting/)
**Purpose**: Problem-solution guides for common issues encountered during development.

Documentation of issues encountered and resolved, organized chronologically for easy reference.

**Quick Access:**
- [Troubleshooting Index](troubleshooting/README.md) - All troubleshooting guides
- [February 2026](troubleshooting/2026-02/) - BDD generation, runtime errors, component API fixes
- [Common Issues](troubleshooting/README.md#common-issues-quick-reference) - Quick symptom → solution lookup

### 📋 [Implementations](implementations/)
**Purpose**: Detailed records of test implementations following IMPL-### naming convention.

Documentation of specific test case implementations, including technical details, corner cases, and lessons learned.

**Structure:**
- `implementations/2026-02/` - February 2026 implementations
- `implementations/templates/` - Templates for new implementations

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
- [Architecture](knowledge-base/architecture.md) - Framework architecture and design patterns
- [Database Schema](knowledge-base/database-schema.md) - Database structure and test data strategy
- [Business Rules](knowledge-base/business-rules.md) - Business logic and validation rules
- [Glossary](knowledge-base/glossary.md) - Terms and definitions

## Quick Navigation

### For New Team Members 🆕
1. **Start with [Training Materials](training/README.md)** - Complete learning path
2. Follow [Getting Started](training/01-getting-started.md) - Setup and first test
3. Progress through [Training Modules](training/) - Week 1-2 curriculum
4. Reference [Cursor Rules](../.cursor/rules/sr-automation-engineer-persona.mdc) - AI assistance

### For Test Developers
1. Start with [Framework Setup Guide](framework/setup/SETUP_GUIDE.md)
2. Review [Module Knowledge](modules/) for your area
3. Check [Existing Test Cases](test-cases/)
4. Follow [Sr Automation Engineer Persona](../.cursor/rules/sr-automation-engineer-persona.mdc)

### For Framework Maintenance
1. Review [Implementation Documentation](framework/implementation/)
2. Check [Automation Patterns](../.cursor/rules/automation-patterns.mdc)
3. Review [Framework Workflows](../.cursor/rules/framework-workflows.mdc)
4. Update [Knowledge Base](knowledge-base/) as needed

### For Understanding Framework Evolution
1. Review [Framework Enhancements](framework-enhancements/README.md)
2. Check [Consolidated Rules Summary](framework-enhancements/01-consolidated-rules/01-IMPLEMENTATION_SUMMARY.md)
3. Read [Documentation System Guide](framework-enhancements/02-documentation-system/01-COMPLETE_GUIDE.md)
4. Review [Multi-User Auth System](framework-enhancements/03-multi-user-auth/README.md)

### For Troubleshooting Issues
1. Check [Troubleshooting Index](troubleshooting/README.md) by symptom
2. Search [Common Issues](troubleshooting/README.md#common-issues-quick-reference) for error messages
3. Review [February 2026 Fixes](troubleshooting/2026-02/) for recent solutions

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

This documentation structure works with Cursor rules (3 consolidated rules):

- **[sr-automation-engineer-persona.mdc](../.cursor/rules/sr-automation-engineer-persona.mdc)** - Primary entry point for test automation
- **[automation-patterns.mdc](../.cursor/rules/automation-patterns.mdc)** - Technical patterns for POMs, steps, and components
- **[framework-workflows.mdc](../.cursor/rules/framework-workflows.mdc)** - Process workflows and documentation standards

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

- **New to framework?** Start with [Training Materials](training/README.md) 🎓
- Check [Framework Setup Guide](framework/setup/SETUP_GUIDE.md) for setup issues
- **Search [Troubleshooting](troubleshooting/) for common errors** ✨
- Review [Module Knowledge](modules/) for domain understanding
- Consult [Cursor Rules](../.cursor/rules/) for code generation standards
- Contact DAEE QA team for questions

---

## Documentation Folder Distinction

**[framework/](framework/)** vs **[framework-enhancements/](framework-enhancements/)**

| Aspect | framework/ | framework-enhancements/ |
|--------|-----------|-------------------------|
| **Purpose** | Core framework usage | Enhancement history |
| **Audience** | All engineers using framework | Architects, QA leads |
| **Content** | Setup, configuration, usage | Implementation records, change history |
| **Updates** | When framework capabilities change | When major enhancements are made |
| **Examples** | Setup guides, test execution | Consolidated rules, doc system |

---

**Last Updated**: 2026-02-05  
**Maintained By**: DAEE QA Team
