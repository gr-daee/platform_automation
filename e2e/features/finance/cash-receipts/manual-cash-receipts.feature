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
    Given I have created a cash receipt with amount "5000" for testing
    And I am on the apply page for the current cash receipt
    When I apply cash receipt "<receiptId>" to invoice "first" with amount "1000"
    Then the payment should be allocated to invoice "first"

  @FIN-CR-TC-005 @p1 @iacs-md
  Scenario: Apply payment to multiple invoices
    Given I have created a cash receipt with amount "5000" for testing
    And I am on the apply page for the current cash receipt
    When I apply cash receipt "<receiptId>" to invoice "first" with amount "500"
    And I apply cash receipt "<receiptId>" to invoice "second" with amount "500"
    Then the payment should be allocated to invoice "first"
    And the payment should be allocated to invoice "second"

  @FIN-CR-TC-006 @critical @p0 @iacs-md
  Scenario: Full application of cash receipt to invoice
    Given I have created a cash receipt with amount "5000" for testing
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
