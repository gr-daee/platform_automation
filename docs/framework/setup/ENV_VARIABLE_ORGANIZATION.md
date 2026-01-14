# Environment Variable Organization Standards

## Industry Best Practices for Multi-Tenant, Multi-Role Scenarios

This document defines the standard naming convention for organizing test user credentials across multiple tenants and roles.

## Recommended Pattern: Tenant-First Hierarchy

**Format**: `TEST_[TENANT]_[ROLE]_[FIELD]`

### Why Tenant-First?

1. **Primary Organizational Boundary**: Tenants are the top-level organizational unit
2. **Logical Grouping**: All users from one tenant are grouped together
3. **Scalability**: Easy to add new tenants without restructuring
4. **Industry Standard**: Common pattern in multi-tenant SaaS applications
5. **Clear Separation**: Prevents confusion between tenant contexts

## Naming Convention

### Structure

```
TEST_[TENANT_IDENTIFIER]_[ROLE]_[FIELD]
```

### Components

- **TENANT_IDENTIFIER**: Short, meaningful identifier for the tenant
  - Examples: `PRIMARY`, `SECONDARY`, `TENANT1`, `TENANT2`, `ORG_A`, `ORG_B`
  - Recommendation: Use uppercase, alphanumeric, underscores only
  - Keep it short (3-15 characters)

- **ROLE**: User role in the system
  - Examples: `ADMIN`, `DEALER`, `ACCOUNTANT`, `SALES_MANAGER`, `WAREHOUSE_MANAGER`
  - Use uppercase, match role names in your system

- **FIELD**: The credential field
  - `EMAIL` - User email address
  - `PASSWORD` - User password
  - `TOTP_SECRET` - TOTP MFA secret (Base32)

## Examples

### Single Tenant, Multiple Roles

```env
# Primary Tenant - Admin
TEST_PRIMARY_ADMIN_EMAIL=admin@primary.com
TEST_PRIMARY_ADMIN_PASSWORD=AdminPass123!
TEST_PRIMARY_ADMIN_TOTP_SECRET=JBSWY3DPEHPK3PXP

# Primary Tenant - Dealer
TEST_PRIMARY_DEALER_EMAIL=dealer@primary.com
TEST_PRIMARY_DEALER_PASSWORD=DealerPass123!
TEST_PRIMARY_DEALER_TOTP_SECRET=DEALER_SECRET_HERE

# Primary Tenant - Accountant
TEST_PRIMARY_ACCOUNTANT_EMAIL=accountant@primary.com
TEST_PRIMARY_ACCOUNTANT_PASSWORD=AccountantPass123!
TEST_PRIMARY_ACCOUNTANT_TOTP_SECRET=ACCOUNTANT_SECRET_HERE
```

### Multiple Tenants, Multiple Roles

```env
# ==========================================
# Primary Tenant (Tenant 1)
# ==========================================
TEST_PRIMARY_ADMIN_EMAIL=admin@primary.com
TEST_PRIMARY_ADMIN_PASSWORD=AdminPass123!
TEST_PRIMARY_ADMIN_TOTP_SECRET=PRIMARY_ADMIN_SECRET

TEST_PRIMARY_DEALER_EMAIL=dealer@primary.com
TEST_PRIMARY_DEALER_PASSWORD=DealerPass123!
TEST_PRIMARY_DEALER_TOTP_SECRET=PRIMARY_DEALER_SECRET

TEST_PRIMARY_ACCOUNTANT_EMAIL=accountant@primary.com
TEST_PRIMARY_ACCOUNTANT_PASSWORD=AccountantPass123!
TEST_PRIMARY_ACCOUNTANT_TOTP_SECRET=PRIMARY_ACCOUNTANT_SECRET

# ==========================================
# Secondary Tenant (Tenant 2)
# ==========================================
TEST_SECONDARY_ADMIN_EMAIL=admin@secondary.com
TEST_SECONDARY_ADMIN_PASSWORD=AdminPass456!
TEST_SECONDARY_ADMIN_TOTP_SECRET=SECONDARY_ADMIN_SECRET

TEST_SECONDARY_DEALER_EMAIL=dealer@secondary.com
TEST_SECONDARY_DEALER_PASSWORD=DealerPass456!
TEST_SECONDARY_DEALER_TOTP_SECRET=SECONDARY_DEALER_SECRET

TEST_SECONDARY_SALES_MANAGER_EMAIL=sales@secondary.com
TEST_SECONDARY_SALES_MANAGER_PASSWORD=SalesPass456!
TEST_SECONDARY_SALES_MANAGER_TOTP_SECRET=SECONDARY_SALES_SECRET
```

### Named Tenants (More Descriptive)

```env
# ==========================================
# Production Tenant
# ==========================================
TEST_PROD_ADMIN_EMAIL=admin@prod.com
TEST_PROD_ADMIN_PASSWORD=ProdAdmin123!
TEST_PROD_ADMIN_TOTP_SECRET=PROD_ADMIN_SECRET

# ==========================================
# Staging Tenant
# ==========================================
TEST_STAGING_ADMIN_EMAIL=admin@staging.com
TEST_STAGING_ADMIN_PASSWORD=StagingAdmin123!
TEST_STAGING_ADMIN_TOTP_SECRET=STAGING_ADMIN_SECRET

# ==========================================
# Demo Tenant
# ==========================================
TEST_DEMO_ADMIN_EMAIL=admin@demo.com
TEST_DEMO_ADMIN_PASSWORD=DemoAdmin123!
TEST_DEMO_ADMIN_TOTP_SECRET=DEMO_ADMIN_SECRET
```

## Alternative Patterns (When Needed)

### Multiple Users Per Role Per Tenant

If you need multiple users with the same role in the same tenant:

```env
# Primary Tenant - First Admin
TEST_PRIMARY_ADMIN_1_EMAIL=admin1@primary.com
TEST_PRIMARY_ADMIN_1_PASSWORD=Admin1Pass123!
TEST_PRIMARY_ADMIN_1_TOTP_SECRET=ADMIN1_SECRET

# Primary Tenant - Second Admin
TEST_PRIMARY_ADMIN_2_EMAIL=admin2@primary.com
TEST_PRIMARY_ADMIN_2_PASSWORD=Admin2Pass123!
TEST_PRIMARY_ADMIN_2_TOTP_SECRET=ADMIN2_SECRET
```

### Role-Specific Variations

If you need role-specific variations:

```env
# Primary Tenant - Senior Admin
TEST_PRIMARY_ADMIN_SENIOR_EMAIL=senior.admin@primary.com
TEST_PRIMARY_ADMIN_SENIOR_PASSWORD=SeniorAdmin123!
TEST_PRIMARY_ADMIN_SENIOR_TOTP_SECRET=SENIOR_ADMIN_SECRET

# Primary Tenant - Junior Admin
TEST_PRIMARY_ADMIN_JUNIOR_EMAIL=junior.admin@primary.com
TEST_PRIMARY_ADMIN_JUNIOR_PASSWORD=JuniorAdmin123!
TEST_PRIMARY_ADMIN_JUNIOR_TOTP_SECRET=JUNIOR_ADMIN_SECRET
```

## Organization Best Practices

### 1. Group by Tenant

```env
# ==========================================
# Tenant: Primary Organization
# Tenant ID: d2353f40-81ea-4f43-99d5-58dcf0becdc5
# ==========================================
TEST_PRIMARY_ADMIN_EMAIL=...
TEST_PRIMARY_DEALER_EMAIL=...
TEST_PRIMARY_ACCOUNTANT_EMAIL=...

# ==========================================
# Tenant: Secondary Organization
# Tenant ID: aeb3ce14-987e-412b-a32d-419f3c1d6e01
# ==========================================
TEST_SECONDARY_ADMIN_EMAIL=...
TEST_SECONDARY_DEALER_EMAIL=...
```

### 2. Use Clear Section Headers

```env
# ==========================================
# PRIMARY TENANT - Admin Role
# ==========================================
TEST_PRIMARY_ADMIN_EMAIL=admin@primary.com
TEST_PRIMARY_ADMIN_PASSWORD=AdminPass123!
TEST_PRIMARY_ADMIN_TOTP_SECRET=PRIMARY_ADMIN_SECRET

# ==========================================
# PRIMARY TENANT - Dealer Role
# ==========================================
TEST_PRIMARY_DEALER_EMAIL=dealer@primary.com
TEST_PRIMARY_DEALER_PASSWORD=DealerPass123!
TEST_PRIMARY_DEALER_TOTP_SECRET=PRIMARY_DEALER_SECRET
```

### 3. Document Tenant Context

```env
# ==========================================
# Tenant: Primary Organization
# Description: Main production tenant for testing
# Tenant UUID: d2353f40-81ea-4f43-99d5-58dcf0becdc5
# Environment: Staging
# ==========================================
TEST_PRIMARY_ADMIN_EMAIL=admin@primary.com
```

### 4. Maintain Consistency

- Use the same tenant identifier throughout
- Keep role names consistent with system roles
- Use the same field names (EMAIL, PASSWORD, TOTP_SECRET)

## Code Usage Examples

### Reading Tenant-Specific User

```typescript
// Get primary tenant admin
const email = process.env.TEST_PRIMARY_ADMIN_EMAIL;
const password = process.env.TEST_PRIMARY_ADMIN_PASSWORD;
const totpSecret = process.env.TEST_PRIMARY_ADMIN_TOTP_SECRET;

// Get secondary tenant dealer
const dealerEmail = process.env.TEST_SECONDARY_DEALER_EMAIL;
const dealerPassword = process.env.TEST_SECONDARY_DEALER_PASSWORD;
const dealerTotpSecret = process.env.TEST_SECONDARY_DEALER_TOTP_SECRET;
```

### Helper Function Pattern

```typescript
function getTestUser(tenant: string, role: string) {
  const prefix = `TEST_${tenant}_${role}`;
  return {
    email: process.env[`${prefix}_EMAIL`],
    password: process.env[`${prefix}_PASSWORD`],
    totpSecret: process.env[`${prefix}_TOTP_SECRET`],
  };
}

// Usage
const primaryAdmin = getTestUser('PRIMARY', 'ADMIN');
const secondaryDealer = getTestUser('SECONDARY', 'DEALER');
```

## Migration from Old Pattern

### Old Pattern (Single Tenant)
```env
TEST_USER_ADMIN_EMAIL=admin@example.com
TEST_USER_ADMIN_PASSWORD=AdminPass123!
TEST_USER_ADMIN_TOTP_SECRET=SECRET_HERE
```

### New Pattern (Multi-Tenant)
```env
# For backward compatibility, you can keep old pattern as alias
TEST_USER_ADMIN_EMAIL=admin@example.com  # Maps to TEST_PRIMARY_ADMIN_EMAIL
TEST_USER_ADMIN_PASSWORD=AdminPass123!
TEST_USER_ADMIN_TOTP_SECRET=SECRET_HERE

# New multi-tenant pattern
TEST_PRIMARY_ADMIN_EMAIL=admin@example.com
TEST_PRIMARY_ADMIN_PASSWORD=AdminPass123!
TEST_PRIMARY_ADMIN_TOTP_SECRET=SECRET_HERE
```

## Validation Rules

### Tenant Identifier
- ✅ Uppercase letters, numbers, underscores only
- ✅ 3-15 characters recommended
- ✅ Descriptive (PRIMARY, SECONDARY, PROD, STAGING)
- ❌ No spaces, hyphens, or special characters
- ❌ No lowercase (for consistency)

### Role Name
- ✅ Uppercase letters, underscores only
- ✅ Match system role names exactly
- ✅ Use underscores for multi-word roles (SALES_MANAGER)
- ❌ No spaces or hyphens

### Field Name
- ✅ Standard fields: EMAIL, PASSWORD, TOTP_SECRET
- ✅ Consistent across all users
- ❌ No variations (email, Email, EMAIL_ADDRESS)

## Common Patterns by Use Case

### Pattern 1: Environment-Based Tenants
```env
TEST_PROD_ADMIN_EMAIL=...
TEST_STAGING_ADMIN_EMAIL=...
TEST_DEV_ADMIN_EMAIL=...
```

### Pattern 2: Organization-Based Tenants
```env
TEST_ORG_A_ADMIN_EMAIL=...
TEST_ORG_B_ADMIN_EMAIL=...
TEST_ORG_C_ADMIN_EMAIL=...
```

### Pattern 3: Sequential Tenants
```env
TEST_TENANT1_ADMIN_EMAIL=...
TEST_TENANT2_ADMIN_EMAIL=...
TEST_TENANT3_ADMIN_EMAIL=...
```

### Pattern 4: Descriptive Tenants
```env
TEST_PRIMARY_ADMIN_EMAIL=...
TEST_SECONDARY_ADMIN_EMAIL=...
TEST_DEMO_ADMIN_EMAIL=...
```

## Recommendations for DAEE Platform

Based on your multi-tenant ERP scenario, recommended pattern:

```env
# ==========================================
# Primary Tenant (Main Organization)
# ==========================================
TEST_PRIMARY_ADMIN_EMAIL=admin@primary.com
TEST_PRIMARY_ADMIN_PASSWORD=AdminPass123!
TEST_PRIMARY_ADMIN_TOTP_SECRET=PRIMARY_ADMIN_SECRET

TEST_PRIMARY_DEALER_EMAIL=dealer@primary.com
TEST_PRIMARY_DEALER_PASSWORD=DealerPass123!
TEST_PRIMARY_DEALER_TOTP_SECRET=PRIMARY_DEALER_SECRET

# ==========================================
# Secondary Tenant (Another Organization)
# ==========================================
TEST_SECONDARY_ADMIN_EMAIL=admin@secondary.com
TEST_SECONDARY_ADMIN_PASSWORD=AdminPass456!
TEST_SECONDARY_ADMIN_TOTP_SECRET=SECONDARY_ADMIN_SECRET

TEST_SECONDARY_DEALER_EMAIL=dealer@secondary.com
TEST_SECONDARY_DEALER_PASSWORD=DealerPass456!
TEST_SECONDARY_DEALER_TOTP_SECRET=SECONDARY_DEALER_SECRET
```

## Benefits of This Pattern

1. **Scalability**: Easy to add new tenants or roles
2. **Clarity**: Immediately clear which tenant and role
3. **Grouping**: Related credentials are logically grouped
4. **Maintainability**: Easy to find and update specific users
5. **Industry Standard**: Follows common SaaS patterns
6. **Tool Support**: Works well with environment variable tools

## Related Documentation

- [Environment Setup Guide](ENV_SETUP_GUIDE.md) - How to configure environment variables
- [Setup Guide](SETUP_GUIDE.md) - Complete framework setup
- [Framework Implementation](../implementation/IMPLEMENTATION_COMPLETE.md) - Framework details
