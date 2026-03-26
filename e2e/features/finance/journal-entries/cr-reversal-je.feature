@finance @journal-entries @cr-reversal-je @iacs-md
Feature: Cash receipt reversal and unknown dealer JE patterns
  As Finance
  I want receipt reversals to post correct reversing journals

  Background:
    Given I am logged in to the Application

  @FIN-CRR-TC-001 @critical @p0 @iacs-md
  Scenario: Reverse unapplied cash receipt posts unapplied cash debit and bank credit
    Given I have created a JE test cash receipt with payment method "neft" and amount "380"
    And I open JE chain cash receipt detail page
    When I reverse unapplied cash receipt from detail for JE chain with reason "AUTO_QA_FIN_CRR_001"
    Then cash receipt status is reversed in database
    And cash receipt reversal journal debits unapplied cash and credits bank

  @FIN-CRR-TC-002 @critical @p0 @iacs-md
  Scenario: Null bank account reversal fallback is integration scope only
    Given cash receipt reversal bank null fallback is only integration tested

  @FIN-CRR-TC-003 @critical @p0 @iacs-md
  Scenario: Second reversal on same receipt is blocked or noop
    Given I have created a JE test cash receipt with payment method "neft" and amount "290"
    And I open JE chain cash receipt detail page
    When I reverse unapplied cash receipt from detail for JE chain with reason "AUTO_QA_FIN_CRR_003a"
    Then cash receipt status is reversed in database
    When I attempt second cash receipt reversal on same receipt
    Then cash receipt status is reversed in database

  @FIN-CRR-TC-004 @regression @p1 @iacs-md
  Scenario: Reverse with active applications may be blocked
    Given I have created a cash receipt with amount "500" for testing
    And I am on the apply page for the current cash receipt
    When I apply cash receipt "<receiptId>" to invoice "first" with amount "50"
    And I open JE chain cash receipt detail page
    When I attempt full cash receipt reversal from detail without unapplying applications
    Then reverse cash receipt with applications may fail or require unapply first

  @FIN-CRR-TC-005 @regression @p1 @iacs-md
  Scenario: Reversal journal is balanced
    Given I have created a JE test cash receipt with payment method "neft" and amount "310"
    And I open JE chain cash receipt detail page
    When I reverse unapplied cash receipt from detail for JE chain with reason "AUTO_QA_FIN_CRR_005"
    Then cash receipt reversal journal debits unapplied cash and credits bank

  @FIN-CRR-TC-006 @regression @p1 @iacs-md
  Scenario: Reversal uses posting profile driven GL accounts
    Given I have created a JE test cash receipt with payment method "neft" and amount "270"
    And I open JE chain cash receipt detail page
    When I reverse unapplied cash receipt from detail for JE chain with reason "AUTO_QA_FIN_CRR_006"
    Then cash receipt reversal journal debits unapplied cash and credits bank

  @FIN-CRR-TC-007 @regression @p2 @iacs-md
  Scenario: Cash receipt reversal audit trail is optional in E2E
    Given I have created a JE test cash receipt with payment method "neft" and amount "240"
    And I open JE chain cash receipt detail page
    When I reverse unapplied cash receipt from detail for JE chain with reason "AUTO_QA_FIN_CRR_007"
    Then cash receipt reversal may emit CASH_RECEIPT_REVERSED audit in product

  @FIN-CRR-TC-008 @regression @p2 @iacs-md
  Scenario: Reverse cash receipt with EPD applications is deferred to extended suite
    Given cash receipt EPD reversal extended coverage is deferred

  @FIN-UDCR-TC-001 @critical @p0 @iacs-md
  Scenario: Suspense or unknown dealer style receipt may use unapplied cash in JE
    Then unknown dealer style cash receipt from DB is skipped or journal uses unapplied cash

  @FIN-UDCR-TC-002 @regression @p1 @iacs-md
  Scenario: Unknown dealer receipt GL uses posting profiles when journal exists
    Then unknown dealer style cash receipt from DB is skipped or journal uses unapplied cash

  @FIN-UDCR-TC-003 @regression @p1 @iacs-md
  Scenario: Dealer assignment on suspense receipt is manual workflow
    Given suspense cash receipt dealer reassignment is manual workflow only

  @FIN-UDCR-TC-004 @regression @p2 @iacs-md
  Scenario: Suspense indicator visible when debouncing list checks
    Given suspense cash receipt dealer reassignment is manual workflow only

  @FIN-UDCR-TC-005 @regression @p2 @iacs-md
  Scenario: Suspense receipt cannot apply until dealer identified
    Given suspense cash receipt dealer reassignment is manual workflow only
