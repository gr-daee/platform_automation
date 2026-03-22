# Credit Memos — Cycles 1–6 + RBAC @iacs-ed (FIN-CM-TC-022)

Feature: Credit Memos
  As a finance user I can create and apply credit memos
  so that invoice outstanding is reduced correctly with reliable data integrity.

  Background:
    Given I am logged in to the Application

  @FIN-CM-TC-001 @critical @p0 @iacs-md
  Scenario: Create credit memo with valid inputs
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "120" and reason "transport_allowance"
    Then credit memo should be created successfully

  @FIN-CM-TC-002 @critical @p0 @iacs-md
  Scenario: Partially apply credit memo to oldest outstanding invoice
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "120" and reason "transport_allowance"
    And I apply "60" from current credit memo to the oldest outstanding invoice of the same customer
    Then credit memo should be created successfully

  @FIN-CM-TC-006 @critical @p1 @iacs-md
  Scenario: Credit memo header and application rows should reconcile
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "120" and reason "transport_allowance"
    And I apply "60" from current credit memo to the oldest outstanding invoice of the same customer
    Then credit memo financial totals should reconcile in database

  @FIN-CM-TC-007 @critical @p1 @iacs-md
  Scenario: Invoice outstanding should reduce by applied credit amount
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "120" and reason "transport_allowance"
    And I apply "60" from current credit memo to the oldest outstanding invoice of the same customer
    Then the target invoice outstanding should decrease by applied credit amount

  @FIN-CM-TC-003 @critical @p0 @iacs-md
  Scenario: Full settlement in one-shot apply using matching credit memo amount
    Given I prepare a full-settlement target invoice for customer "Ramesh ningappa diggai" and create matching credit memo
    When I apply current credit memo fully to the prepared target invoice
    Then the prepared target invoice should be fully settled
    And the current credit memo should be fully applied

  @FIN-CM-TC-004 @critical @p0 @iacs-md
  Scenario: Partial apply then second credit memo settles remaining invoice balance
    Given I prepare a full-settlement target invoice for customer "Ramesh ningappa diggai" and create matching credit memo
    When I apply partial amount "10" to the prepared target invoice
    And I create another credit memo for remaining target invoice balance and apply it fully
    Then the prepared target invoice should be fully settled

  @FIN-CM-TC-008 @critical @p1 @iacs-md
  Scenario: Full settlement keeps credit memo totals reconciled
    Given I prepare a full-settlement target invoice for customer "Ramesh ningappa diggai" and create matching credit memo
    When I apply current credit memo fully to the prepared target invoice
    Then credit memo financial totals should reconcile in database
    And the prepared target invoice should be fully settled

  @FIN-CM-TC-005 @critical @p1 @iacs-md
  Scenario: Credit memo linked to one invoice can be applied to another invoice of same customer
    Given I prepare a cross-invoice setup for customer "Ramesh ningappa diggai" and create credit memo linked to oldest invoice
    When I apply current credit memo to the prepared cross-invoice target
    Then the target invoice outstanding should decrease by applied credit amount
    And credit memo financial totals should reconcile in database

  @FIN-CM-TC-011 @critical @p1 @iacs-md
  Scenario: Transport allowance over-balance apply creates dealer advance
    Given I prepare a transport allowance over-balance setup for customer "Ramesh ningappa diggai"
    Then dealer advance should be created for current credit memo application

  @FIN-CM-TC-012 @critical @p1 @iacs-md
  Scenario: Transport allowance over-balance path fully applies credit and creates dealer advance
    Given I prepare a transport allowance over-balance setup for customer "Ramesh ningappa diggai"
    Then the current credit memo should be fully applied
    And dealer advance should be created for current credit memo application

  @FIN-CM-TC-013 @negative @p1 @iacs-md
  Scenario: Apply credit rejects amount above available credit
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "80" and reason "transport_allowance"
    And I open apply credit dialog for current credit memo
    And I select the oldest outstanding invoice in apply dialog for customer "Ramesh ningappa diggai"
    And I set apply amount exceeding available credit for negative test
    And I attempt to apply credit expecting validation failure
    Then I should see credit memo apply error containing "available credit"

  @FIN-CM-TC-014 @negative @p1 @iacs-md
  Scenario: Apply credit blocks zero amount via disabled submit
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "80" and reason "transport_allowance"
    And I open apply credit dialog for current credit memo
    And I select the oldest outstanding invoice in apply dialog for customer "Ramesh ningappa diggai"
    And I set apply amount to "0"
    Then the Apply Credit button should be disabled on apply dialog

  @FIN-CM-TC-015 @negative @p1 @iacs-md
  Scenario: Apply dialog does not list invoices from other customers
    Given I am on the credit memos page
    And I resolve a foreign invoice number not belonging to customer "Ramesh ningappa diggai"
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "50" and reason "transport_allowance"
    And I open apply credit dialog for current credit memo
    And I open invoice selector in apply dialog
    Then invoice options in apply dialog should not include foreign invoice number

  @FIN-CM-TC-016 @negative @p1 @iacs-md
  Scenario: Duplicate apply to same invoice is rejected
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "200" and reason "transport_allowance"
    And I apply "50" from current credit memo to the oldest outstanding invoice of the same customer
    And I open apply credit dialog for current credit memo
    And I select the prior target invoice in apply dialog
    And I set apply amount to "25"
    And I attempt to apply credit expecting validation failure
    Then I should see credit memo apply error containing "already applied"

  @FIN-CM-TC-017 @negative @p1 @iacs-md
  Scenario: Non-transport credit memo apply rejects amount above invoice balance
    Given I am on the credit memos page
    When I prepare a pricing error credit memo for customer "Ramesh ningappa diggai" with credit exceeding smallest outstanding invoice balance
    And I attempt to apply prepared pricing error credit memo to smallest invoice at full credit amount
    Then I should see credit memo apply error containing "exceed invoice balance"

  @FIN-CM-TC-018 @critical @p1 @iacs-md
  Scenario: Post new credit memo to general ledger
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "75" and reason "transport_allowance"
    And I post current credit memo to general ledger
    Then I should see credit memo post to GL success toast
    And credit memo should have GL journal in database
    And Post to GL button should not be visible on credit memo detail

  @FIN-CM-TC-019 @critical @p1 @iacs-md
  Scenario: Reverse credit memo application restores CM balances and reverses application row
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "185" and reason "transport_allowance"
    And I apply "52" from current credit memo to the oldest outstanding invoice of the same customer
    And I reverse the application for current target invoice with reason "AUTO_QA_cycle5_reversal_test"
    Then I should see credit memo reversal success toast
    And credit memo applications for target invoice should be reversed in database
    And current credit memo should have no active applications in database
    And credit memo available credit should equal total amount after reversal

  @FIN-CM-TC-020 @negative @p2 @iacs-md
  Scenario: Reverse dialog requires reason before confirm and cancel leaves application active
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "110" and reason "transport_allowance"
    And I apply "33" from current credit memo to the oldest outstanding invoice of the same customer
    And I open reverse dialog for current target invoice without confirming
    Then Confirm Reversal button should be disabled on reverse dialog
    When I fill reverse application reason in dialog with "AUTO_QA_cycle6_reason_enables_confirm"
    Then Confirm Reversal button should be enabled on reverse dialog
    When I cancel reverse application dialog
    Then reverse application dialog should be closed
    And credit memo applications for target invoice should remain active in database

  @FIN-CM-TC-021 @regression @p2 @iacs-md
  Scenario: After reversal application history shows Reversed without Reverse action
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "165" and reason "transport_allowance"
    And I apply "44" from current credit memo to the oldest outstanding invoice of the same customer
    And I reverse the application for current target invoice with reason "AUTO_QA_cycle6_reversal_ui_state"
    Then I should see credit memo reversal success toast
    And application history row for target invoice should show reversed status
    And application history row for target invoice should not show Reverse action

  @FIN-CM-TC-022 @negative @p2 @iacs-ed
  Scenario: User without credit memos access is redirected from credit memos URL
    When I attempt to open credit memos as unauthorized user
    Then I should be denied access to credit memos
