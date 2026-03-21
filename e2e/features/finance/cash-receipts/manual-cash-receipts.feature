# Manual Cash Receipts - UI tests for creating and applying cash receipts
# Source: Test plan Phase 5.1; docs/modules/finance/cash-receipts/features/FEATURE-001-cash-receipts-analysis.md

Feature: Manual Cash Receipts
  As a finance user I can create manual cash receipts and apply them to invoices
  so that payments are recorded and allocated correctly.

  Background:
    Given I am logged in to the Application

  @FIN-CR-TC-001 @critical @p0 @iacs-md
  Scenario: Apply payment and auto-calculated EPD discount amount
    Given I have created a cash receipt with amount "500" for testing
    And I am on the apply page for the current cash receipt
    When I apply cash receipt "<receiptId>" to invoice "first" with amount "100"
    Then the payment should be allocated to invoice "first"
    And the outstanding balance for invoice "first" should decrease by "100"
    And the cash receipt application details for invoice "first" should be correct
    And on clicking the CCN link for invoice "first" the CCN details should be correct
    And on clicking the journal entry the JE details should be correct
    Then the EPD discount should be correctly calculated for invoice "first"

  @FIN-CR-TC-002 @p1 @iacs-md
  Scenario: Toggle EPD enabled or disabled
    # 1) Cash receipt with decimals; allocation with decimals
    Given I have created a cash receipt with amount "450.78" for testing
    And I am on the apply page for the current cash receipt
    # 2) Verify JE after creation of Cash Receipt
    Then journal entry should be present for the current cash receipt
    And I navigate to the apply page for the current cash receipt again
    # 4) Toggle EPD on and off and verify data displayed (amount set so EPD discount value shows)
    When I set amount to apply "98.45" for invoice "first" without saving
    When I toggle EPD off for invoice "first"
    Then the apply page should show no EPD discount for invoice "first"
    When I toggle EPD on for invoice "first"
    Then the apply page should show EPD discount for invoice "first"
    When I toggle EPD off for invoice "first"
    # 3) Apply without EPD (no CCN)
    And I apply cash receipt "<receiptId>" to invoice "first" with amount "98.45"
    Then the payment should be allocated to invoice "first"
    And no CCN should be created for the current receipt
    And the outstanding balance for invoice "first" should decrease by "98.45"
    And the cash receipt application details for invoice "first" should be correct
    # 2) Verify JE after allocation
    And on clicking the journal entry the JE details should be correct

  @FIN-CR-TC-003 @p1 @iacs-md
  Scenario: Apply payment to two invoices in one submit (first with CCN, second without CCN)
    # Single combined flow: both invoices selected and applied in one submit; CR detail page load is waited explicitly
    Given I have created a cash receipt with amount "234.45" for testing
    And I am on the apply page for the current cash receipt
    When I select invoice "first"
    And I set amount to apply "23.36" for invoice "first" without saving
    And I toggle EPD on for invoice "first"
    And I select invoice "second"
    And I set amount to apply "45.23" for invoice "second" without saving
    And I toggle EPD off for invoice "second"
    And I expect 2 invoice(s) to be selected on the apply page
    And I wait for apply form to be ready
    And I wait for the Apply Payments button to be enabled
    When I apply the payments
    Then the payment should be allocated to invoice "first"
    And the payment should be allocated to invoice "second"
    And the cash receipt application details for invoice "first" should be correct
    And the cash receipt application details for invoice "second" should be correct
    And on clicking the journal entry the JE details should be correct
    And on clicking the CCN link for invoice "first" the CCN details should be correct
    And the outstanding balance for invoice "first" should decrease by the total amount credited for that invoice
    And the outstanding balance for invoice "second" should decrease by the total amount credited for that invoice

  @FIN-CR-TC-004 @critical @p0 @iacs-md
  Scenario: Full application of cash receipt to invoice
    # Select an invoice whose outstanding <= current receipt amount, so scenario is independent.
    Given I have created a cash receipt with amount "15000" for testing
    And I am on the apply page for the current cash receipt
    And I remember an invoice fully payable by current cash receipt
    When I apply full outstanding amount to remembered invoice
    Then the payment should be allocated to remembered invoice
    And the remembered invoice should be fully paid
    # Note: Unapplied balance decrease verified via DB in step definition

  @FIN-CR-TC-005 @critical @p0 @iacs-md
  Scenario: Partial application of cash receipt to invoice
    Given I have created a cash receipt with amount "5000" for testing
    And I am on the apply page for the current cash receipt
    When I apply partial amount "1000" to invoice "first"
    Then the payment should be allocated to invoice "first"
    # Note: Remaining balance verified via UI in step definition
    # Note: Unapplied balance decrease verified via DB in step definition

  @FIN-CR-TC-006 @p1 @iacs-md
  Scenario: Dynamic split settlement on same oldest pending invoice across CR-01 and CR-02
    # Business rule: same cash receipt cannot be partially applied and then applied again to fully settle the same invoice.
    # Dynamic design: pick oldest pending invoice from DB; create CRs from fixed ratios of its outstanding balance.
    Given I have created a cash receipt with amount "5000" for testing
    And I am on the apply page for the current cash receipt
    And I remember the oldest pending invoice as the target invoice
    Given I create a cash receipt using ratio "0.40" of remembered invoice outstanding
    And I am on the apply page for the current cash receipt
    When I apply full cash receipt amount to remembered invoice
    Given I create a cash receipt using ratio "1.10" of remembered invoice outstanding
    And I am on the apply page for the current cash receipt
    When I apply remaining amount to remembered invoice
    Then the remembered invoice should be fully paid

  # --- EPD Configuration (consolidated into manual cash receipts module file) ---
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

  @FIN-EPD-TC-007 @p1 @iacs-md
  Scenario: Update slab for oldest allocatable invoice to temporary % and verify EPD reflects then restore
    # Smart: find oldest pending invoice, determine its EPD slab by days-from-invoice, set slab to 2-decimal % (e.g. 7.25), run checks, restore in DB
    Given the EPD slab for the oldest allocatable invoice is set to a temporary test percentage
    When I have created a cash receipt with amount "500" for testing
    And I am on the apply page for the current cash receipt
    And I select the invoice that shows the temporary EPD percentage
    Then the EPD shown for that invoice should match the temporary percentage
    Then the EPD slab is restored to its original percentage in the database
