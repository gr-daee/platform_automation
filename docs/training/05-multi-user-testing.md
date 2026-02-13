# 05 - Multi-User Testing

**Estimated Time**: 2 hours

**Prerequisites**: [04-creating-tests.md](./04-creating-tests.md)

---

## Learning Objectives

- ✅ Understand 70/30 split strategy
- ✅ Create single-user vs multi-user tests
- ✅ Implement Scenario Outlines
- ✅ Test permission boundaries and tenant isolation

---

## 70/30 Split Strategy

**Framework Approach**:
- **70% Single-User**: Run once with primary user (happy path, workflows, UI validation)
- **30% Multi-User**: Run across relevant users (permissions, tenant isolation, RBAC)

### When to Create Multi-User Tests (30%)

**✅ Use @multi-user tag for**:
1. Permission boundaries: "Can user X do action Y?"
2. Tenant isolation: Users cannot see other tenant data
3. Data visibility: Different users see different data by role
4. RBAC validation: Role-based access control rules

**❌ Keep as single-user (70%)**:
1. Happy path CRUD operations
2. Workflows and status transitions
3. UI validation (form errors, toasts)
4. Business rules and calculations

---

## Single-User Test Pattern

**Format**: `@{primary-user-role}`

**Example**:
```gherkin
@O2C-INDENT-TC-001 @smoke @p1 @iacs-md
Scenario: MD User creates indent
  Given I am logged in to the Application
  When I create a new indent
  Then the indent should be created successfully
  # Runs ONCE as IACS MD User (determined by @iacs-md tag)
```

**Key Points**:
- One tag per test
- Test runs once
- User determined by project routing
- Use `Given I am logged in to the Application`

---

## Multi-User Test Pattern

**Format**: `@multi-user @{user1} @{user2} @{user3}`

**Example**:
```gherkin
@O2C-INDENT-TC-050 @critical @p0 @multi-user
@iacs-md @iacs-finance @iacs-warehouse
Scenario Outline: User permissions for indent deletion
  Given I am logged in as "<User>"
  When I try to delete an indent
  Then I should see "<Result>"
  
  Examples:
    | User              | Result  | Reason              |
    | IACS MD User     | Success | Full permissions    |
    | Finance Manager  | Denied  | Read-only access    |
    | Warehouse Manager| Denied  | No delete permission|
  # Runs 3 TIMES (once per user)
```

**Key Points**:
- Must include `@multi-user` tag
- Multiple user tags
- Use Scenario Outline with Examples table
- Use `Given I am logged in as "<User>"`
- Test runs N times (once per user)

---

## Hands-On Exercise (60 minutes)

### Exercise 1: Convert Single-User to Multi-User

Take this single-user test:
```gherkin
@O2C-001 @smoke @iacs-md
Scenario: User creates order
  Given I am logged in to the Application
  When I create a new order
  Then the order should be created successfully
```

Convert to multi-user test for permission testing:
```gherkin
@O2C-001 @critical @multi-user @iacs-md @iacs-finance
Scenario Outline: User creates order based on permissions
  Given I am logged in as "<User>"
  When I try to create a new order
  Then I should see "<Result>"
  
  Examples:
    | User            | Result  |
    | IACS MD User    | Success |
    | Finance Manager | Denied  |
```

### Exercise 2: Create Tenant Isolation Test

Create a test to verify IACS user cannot see Demo Tenant data:
```gherkin
@O2C-050 @critical @multi-user @iacs-md @demo-tenant
Scenario Outline: Tenant isolation for dealers
  Given I am logged in as "<User>"
  When I view dealers list
  Then I should only see dealers from "<Tenant>"
  
  Examples:
    | User            | Tenant      |
    | IACS MD User    | IACS        |
    | Demo Tenant User| Demo Tenant |
```

---

## Quick Reference

**Single-User** (70%):
- One tag: `@iacs-md`
- Runs once
- `Given I am logged in to the Application`

**Multi-User** (30%):
- Tags: `@multi-user @iacs-md @iacs-finance`
- Runs N times
- `Given I am logged in as "<User>"`
- Use Scenario Outline with Examples

---

## Next Steps

Continue to [06-advanced-patterns.md](./06-advanced-patterns.md) for component library and TestDataLocator.
