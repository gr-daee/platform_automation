# Tenant EPD Configuration - EPD approach, formula, slabs (Phase 5.3)
# Source: Test plan Phase 5.3; docs/modules/finance/cash-receipts/features/FEATURE-001-cash-receipts-analysis.md

Feature: Tenant EPD Configuration
  As a finance admin I can configure EPD approach, formula, and slabs
  so that early payment discounts are calculated correctly per tenant.

  Background:
    Given I am logged in to the Application

  @FIN-EPD-TC-001 @p1 @iacs-md
  Scenario: Configure EPD approach
    Given I am on the EPD calculator page
    When I select EPD approach "reduce_outstanding"
    Then EPD should be "0" based on slab

  @FIN-EPD-TC-002 @p1 @iacs-md
  Scenario: Configure EPD formula
    Given I am on the EPD calculator page
    When I calculate EPD for invoice dated "2025-01-01" paid on "2025-01-05"
    Then EPD should be "0" based on slab

  @FIN-EPD-TC-003 @p1 @iacs-md
  Scenario: Add EPD slab (0-7 days, 2.5%)
    Given I am on the payment terms page
    When I add EPD slab with days 0 to 7 and discount 2%
    Then I should see EPD slab for 0-7 days

  @FIN-EPD-TC-004 @p1 @iacs-md
  Scenario: Verify EPD calculation with configured slabs
    Given tenant is configured with EPD approach "reduce_outstanding"
    And tenant has EPD slabs configured
    When I calculate EPD for invoice dated "2025-01-01" paid on "2025-01-05"
    Then EPD should be "0" based on slab
