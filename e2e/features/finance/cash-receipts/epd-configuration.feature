# Tenant EPD Configuration - EPD approach, formula, slabs (Phase 5.3)
# Source: Test plan Phase 5.3; docs/modules/finance/cash-receipts/features/FEATURE-001-cash-receipts-analysis.md
# Page: http://localhost:3000/finance/epd-configuration (EPD Slabs, Preview Calculator, Default Slabs tabs)

Feature: Tenant EPD Configuration
  As a finance admin I can configure EPD approach, formula, and slabs
  so that early payment discounts are calculated correctly per tenant.

  Background:
    Given I am logged in to the Application

  # --- EPD Configuration page (EPD Slabs tab) ---
  @FIN-EPD-TC-001 @p1 @iacs-md
  Scenario: View EPD configuration page
    Given I am on the EPD configuration page
    Then I should see the EPD Slabs tab and heading

  @FIN-EPD-TC-002 @p1 @iacs-md
  Scenario: Add EPD slab on configuration page (91-99 days, 2%)
    # Fail-safe: delete 91-99 from DB if present (avoid overlap), then create; cleanup in DB after
    Given I am on the EPD configuration page
    When I remove the EPD slab for days 91 to 99 from the database if it exists
    And I add EPD slab on configuration page with days 91 to 99 and discount 2%
    Then I should see slab created success message
    And I should see EPD slab 91-99 days on configuration page
    When I remove the EPD slab for days 91 to 99 from the database

  @FIN-EPD-TC-003 @p1 @iacs-md
  Scenario: Validation - days to must be greater than days from
    Given I am on the EPD configuration page
    When I try to add EPD slab with invalid days 7 to 5 and discount 2%
    Then I should see error that days to must be greater than days from

  @FIN-EPD-TC-004 @p1 @iacs-md
  Scenario: Validation - discount must be between 0 and 100
    Given I am on the EPD configuration page
    When I try to add EPD slab with days 0 to 7 and invalid discount 101%
    Then I should see error that discount must be between 0 and 100

  @FIN-EPD-TC-005 @p1 @iacs-md
  Scenario: Preview Calculator shows result for due date and payment date
    Given I am on the EPD configuration page
    When I open the Preview Calculator tab and calculate EPD for due date "2025-02-01" payment date "2025-01-25" amount 10000
    Then the EPD preview result should be visible

  @FIN-EPD-TC-006 @p2 @iacs-md
  Scenario: Toggle Show Inactive slabs
    Given I am on the EPD configuration page
    When I toggle Show Inactive slabs
    Then the EPD Slabs tab should still show table or empty state

  # --- EPD config change reflects in CR apply (smart: oldest invoice + slab update + rollback) ---
  @FIN-EPD-TC-007 @p1 @iacs-md
  Scenario: Update slab for oldest allocatable invoice to temporary % and verify EPD reflects then restore
    # Smart: find oldest pending invoice, determine its EPD slab by days-from-invoice, set slab to 2-decimal % (e.g. 7.25), run checks, restore in DB
    Given the EPD slab for the oldest allocatable invoice is set to a temporary test percentage
    When I have created a cash receipt with amount "500" for testing
    And I am on the apply page for the current cash receipt
    And I select the invoice that shows the temporary EPD percentage
    Then the EPD shown for that invoice should match the temporary percentage
    Then the EPD slab is restored to its original percentage in the database
