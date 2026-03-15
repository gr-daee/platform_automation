# Manual Cash Receipts - UI tests for creating and applying cash receipts
# Source: Test plan Phase 5.1; docs/modules/finance/cash-receipts/features/FEATURE-001-cash-receipts-analysis.md

Feature: Manual Cash Receipts
  As a finance user I can create manual cash receipts and apply them to invoices
  so that payments are recorded and allocated correctly.

  Background:
    Given I am logged in to the Application

  @FIN-CR-TC-003 @critical @p0 @iacs-md
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

  @FIN-CR-TC-004 @p1 @iacs-md
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

  @FIN-CR-TC-005 @p1 @iacs-md
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

  @FIN-CR-TC-006 @critical @p0 @iacs-md
  Scenario: Full application of cash receipt to invoice
    # Use receipt amount >= first invoice balance so invoice can be fully paid
    Given I have created a cash receipt with amount "15000" for testing
    And I am on the apply page for the current cash receipt
    When I apply full outstanding amount to invoice "first"
    Then the payment should be allocated to invoice "first"
    And invoice "first" should be fully paid
    # Note: Unapplied balance decrease verified via DB in step definition

  @FIN-CR-TC-007 @critical @p0 @iacs-md
  Scenario: Partial application of cash receipt to invoice
    Given I have created a cash receipt with amount "5000" for testing
    And I am on the apply page for the current cash receipt
    When I apply partial amount "1000" to invoice "first"
    Then the payment should be allocated to invoice "first"
    # Note: Remaining balance verified via UI in step definition
    # Note: Unapplied balance decrease verified via DB in step definition

  @FIN-CR-TC-008 @p1 @iacs-md
  Scenario: Partial application then full application
    Given I have created a cash receipt with amount "5000" for testing
    And I am on the apply page for the current cash receipt
    When I apply partial amount "1000" to invoice "first"
    # Note: Remaining balance verified via UI
    When I navigate to the apply page for the current cash receipt again
    And I apply remaining amount to invoice "first"
    Then invoice "first" should be fully paid
