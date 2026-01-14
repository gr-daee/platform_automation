# Test Case Registry

This registry tracks all automated test cases with their unique identifiers for traceability and management.

## Test Case ID Format

`@Module-SubModule-TC-001`

**Format Breakdown:**
- **Module**: Uppercase module abbreviation (e.g., AUTH, O2C)
- **SubModule**: Uppercase submodule name (e.g., LOGIN, INDENT)
- **TC**: Test Case prefix
- **001**: Sequential number (3 digits)

## Authentication Module (AUTH)

### Login SubModule (LOGIN)

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| AUTH-LOGIN-TC-001 | AUTH | LOGIN | Successful login with valid TOTP for Admin user | e2e/features/auth/login.feature | @smoke @critical | ✅ |
| AUTH-LOGIN-TC-002 | AUTH | LOGIN | Login fails with invalid TOTP code | e2e/features/auth/login.feature | @smoke @critical | ✅ |
| AUTH-LOGIN-TC-003 | AUTH | LOGIN | Login fails with incorrect password | e2e/features/auth/login.feature | @regression | ✅ |
| AUTH-LOGIN-TC-004 | AUTH | LOGIN | Login form validation for empty fields | e2e/features/auth/login.feature | @regression | ✅ |

## Usage

### Running Tests by Test Case ID

```bash
# Run specific test case
npm run test:tc -- "@AUTH-LOGIN-TC-001"

# Run all tests in a module
npm run test:tc -- "@AUTH-"

# Run all critical tests
npm run test:tc -- "@critical"
```

### Linking to Linear Issues

Test case IDs can be linked to Linear issues by adding the Linear issue tag:

```gherkin
@AUTH-LOGIN-TC-001 @linear-123 @smoke @critical
Scenario: Successful login with valid TOTP for Admin user
```

## Maintenance

- **Status**: ✅ Automated | ⏳ Pending | ❌ Failed | 🔄 In Progress
- **Last Updated**: Update when test case is modified
- **Tags**: Standard tags include @smoke, @critical, @regression

## Adding New Test Cases

1. Assign next sequential test case ID (e.g., AUTH-LOGIN-TC-005)
2. Add test case ID tag to scenario in feature file
3. Add entry to this registry
4. Update module-specific test case documentation

## Search and Filter

This registry is version-controlled with git, making it:
- Searchable via IDE/git tools
- Trackable for changes over time
- Accessible without additional tools
- Free and lightweight for small teams
