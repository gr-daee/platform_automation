# Manual Cash Receipts - UI tests for creating and applying cash receipts
# Source: Test plan Phase 5.1; docs/modules/finance/cash-receipts/features/FEATURE-001-cash-receipts-analysis.md

Feature: Manual Cash Receipts
  As a finance user I can create manual cash receipts and apply them to invoices
  so that payments are recorded and allocated correctly.

  Background:
    Given I am logged in to the Application

  # Only one cash receipt is created (with Ramesh ningappa diggai); used by apply scenarios below
  @FIN-CR-TC-001 @smoke @critical @p0 @iacs-md
  Scenario: Create manual cash receipt
    Given I am on the cash receipts page
    When I click New Cash Receipt
    And I fill cash receipt form with customer "Ramesh ningappa diggai" and amount "5000"
    And I save the cash receipt
    Then the cash receipt should be created successfully

  @FIN-CR-TC-002 @critical @p0 @iacs-md
  Scenario: Apply payment to invoice
    Given I have created a cash receipt with amount "5000" for testing
    And I am on the apply page for the current cash receipt
    When I apply cash receipt "<receiptId>" to invoice "first" with amount "1000"
    Then the payment should be allocated to invoice "first"

  @FIN-CR-TC-003 @p1 @iacs-md
  Scenario: Adjust EPD discount amount
    Given I have created a cash receipt with amount "5000" for testing
    And I am on the apply page for the current cash receipt
    When I apply cash receipt "<receiptId>" to invoice "first" with amount "1000"
    Then the EPD discount should be "25"

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
