# Setup Documentation

## Overview
Setup and configuration guides for the DAEE Platform test automation framework.

## Documentation Files

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup guide for the framework
- **[ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md)** - Environment variable configuration guide
- **[ENV_VARIABLE_ORGANIZATION.md](ENV_VARIABLE_ORGANIZATION.md)** - Multi-tenant, multi-role variable organization standards

## Quick Links

### Getting Started
1. Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for initial setup
2. Configure [Environment Variables](ENV_SETUP_GUIDE.md)
3. Review [Variable Organization](ENV_VARIABLE_ORGANIZATION.md) for multi-tenant scenarios

### Environment Configuration
- **Single Tenant**: Use `TEST_PRIMARY_[ROLE]_*` pattern
- **Multiple Tenants**: Use `TEST_[TENANT]_[ROLE]_*` pattern
- **Legacy Support**: `TEST_USER_[ROLE]_*` pattern still supported

## Navigation
- [Back to Framework Docs](../README.md)
- [Back to Main Docs](../../README.md)
