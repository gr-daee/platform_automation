@finance @journal-entries @cr-application-je @iacs-md
Feature: Cash receipt application journal entries
  As Finance
  I want applying receipts to invoices to post correct AR and unapplied cash movements

  Background:
    Given I am logged in to the Application

  @FIN-ACR-TC-001 @critical @p0 @iacs-md
  Scenario: Apply cash receipt posts AR credit and unapplied cash debit
    Given I have created a cash receipt with amount "500" for testing
    And I am on the apply page for the current cash receipt
    When I apply cash receipt "<receiptId>" to invoice "first" with amount "100"
    Then latest cash receipt journal for current receipt shows AR credit and unapplied cash debit on apply

  @FIN-ACR-TC-002 @critical @p0 @iacs-md
  Scenario: Apply with EPD may include early payment discount debit
    Given I have created a cash receipt with amount "450.78" for testing
    And I am on the apply page for the current cash receipt
    When I toggle EPD on for invoice "first"
    And I apply cash receipt "<receiptId>" to invoice "first" with amount "98.45"
    Then latest cash receipt journal for apply may include early payment discount debit line

  @FIN-ACR-TC-003 @regression @p1 @iacs-md
  Scenario: Full apply drives invoice toward paid status
    Given I have created a cash receipt with amount "15000" for testing
    And I am on the apply page for the current cash receipt
    And I remember an invoice fully payable by current cash receipt
    When I apply full outstanding amount to remembered invoice
    Then invoice for first outstanding is paid in database after full apply

  @FIN-ACR-TC-004 @regression @p1 @iacs-md
  Scenario: Cash receipt applied amount matches applications in database
    Given I have created a cash receipt with amount "400" for testing
    And I am on the apply page for the current cash receipt
    When I apply cash receipt "<receiptId>" to invoice "first" with amount "75"
    Then cash receipt applied amount matches applications total in database

  @FIN-ACR-TC-005 @regression @p1 @iacs-md
  Scenario: Apply amount exceeding invoice balance shows error
    Given I have created a cash receipt with amount "2000" for testing
    And I am on the apply page for the current cash receipt
    When I attempt apply cash receipt to first invoice with excessive amount
    Then I should see cash receipt apply error for excessive amount

  @FIN-ACR-TC-006 @regression @p2 @iacs-md
  Scenario: Two separate applies may create multiple journal headers
    Given I have created a cash receipt with amount "900" for testing
    And I am on the apply page for the current cash receipt
    When I apply cash receipt "<receiptId>" to invoice "first" with amount "40"
    And I navigate to the apply page for the current cash receipt again
    And I apply cash receipt "<receiptId>" to invoice "second" with amount "35"
    Then cash receipt applied amount matches applications total in database

  @FIN-ACR-TC-007 @regression @p2 @iacs-md
  Scenario: EPD path uses posting profiles in principle
    Given I have created a cash receipt with amount "450.78" for testing
    And I am on the apply page for the current cash receipt
    When I toggle EPD on for invoice "first"
    And I apply cash receipt "<receiptId>" to invoice "first" with amount "50"
    Then EPD cash application uses resolveGL posting profile accounts
