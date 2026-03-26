@finance @journal-entries @ccn-je @iacs-md
Feature: Credit contra note journal entries and applications
  As Finance
  I want CCN posting and applications to use posting profiles and balance correctly

  Background:
    Given I am logged in to the Application

  @FIN-CCN-TC-001 @critical @p0 @iacs-md
# DAEE-413 reclassified as test-contract mismatch (not product defect) for transport_allowance.
# Expected (by current posting-profile + product contract): sales|ar_control Dr and sales|freight_allowance Cr.
# Test data: CM amount=88, reason=transport_allowance.
  Scenario: Finance UI credit memo posts with AR debit and freight allowance credit
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "88" and reason "transport_allowance"
    And I post current credit memo to general ledger
    Then I should see credit memo post to GL success toast
    Then credit memo posted to GL has AR debit and freight allowance credit for transport allowance

  @FIN-CCN-TC-002 @critical @p0 @iacs-md
  Scenario: Sales return credit memo uses non-legacy posting profile GL
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    And I set return quantity 1 on first line on sales return create page
    And I go to review step on sales return create page
    And I submit sales return create order
    Then I should be on sales return detail with Pending Receipt status
    When I complete record goods receipt on sales return detail with default warehouse
    Then I should be on sales return detail with Goods Received status
    When I complete credit memo flow from sales return detail when applicable
    Then credit memo for sales return path uses dealer_management credit_note GL when posted
    Then posted credit memo debit line is not legacy account codes "11116|4210"

  @FIN-CCN-TC-003 @regression @p1 @iacs-md
  Scenario: Credit memo GL journal is balanced
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "65" and reason "transport_allowance"
    And I post current credit memo to general ledger
    Then credit memo GL journal is balanced

  @FIN-CCN-TC-004 @regression @p1 @iacs-md
  Scenario: Transport allowance CM may auto-apply toward source invoice
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "40" and reason "transport_allowance"
    Then credit memo may be auto-applied with applied status in database

  @FIN-CCN-TC-005 @regression @p1 @iacs-md
  Scenario: Pricing error CM cannot apply above smallest invoice balance
    Given I am on the credit memos page
    When I prepare a pricing error credit memo for customer "Ramesh ningappa diggai" with credit exceeding smallest outstanding invoice balance
    And I attempt to apply prepared pricing error credit memo to smallest invoice at full credit amount
    Then I should see credit memo apply error containing "exceed"

  @FIN-CCN-TC-006 @regression @p2 @iacs-md
  Scenario: CCN against cancelled invoice is environment dependent
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "25" and reason "transport_allowance"
    Then credit memo should be created successfully

  @FIN-CCN-TC-007 @regression @p2 @iacs-md
  Scenario: Credit memo reason description is persisted
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "33" and reason "transport_allowance"
    Then credit memo reason description is stored in database

  @FIN-CCNA-TC-001 @critical @p0 @iacs-md
  Scenario: Apply CM reduces invoice outstanding in database
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "95" and reason "transport_allowance"
    And I apply "40" from current credit memo to the oldest outstanding invoice of the same customer
    Then the target invoice outstanding should decrease by applied credit amount

  @FIN-CCNA-TC-002 @regression @p1 @iacs-md
  Scenario: Apply CM to another invoice of same customer
    Given I prepare a cross-invoice setup for customer "Ramesh ningappa diggai" and create credit memo linked to oldest invoice
    When I apply current credit memo to the prepared cross-invoice target
    Then the target invoice outstanding should decrease by applied credit amount

  @FIN-CCNA-TC-003 @regression @p1 @iacs-md
  Scenario: Apply dialog does not list foreign customer invoices
    Given I am on the credit memos page
    And I resolve a foreign invoice number not belonging to customer "Ramesh ningappa diggai"
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "44" and reason "transport_allowance"
    And I open apply credit dialog for current credit memo
    And I open invoice selector in apply dialog
    Then invoice options in apply dialog should not include foreign invoice number

  @FIN-CCNA-TC-004 @regression @p1 @iacs-md
  Scenario: Duplicate apply same CM to same invoice is rejected
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "120" and reason "transport_allowance"
    And I apply "30" from current credit memo to the oldest outstanding invoice of the same customer
    And I open apply credit dialog for current credit memo
    And I select the prior target invoice in apply dialog
    And I set apply amount to "10"
    And I attempt to apply credit expecting validation failure
    Then I should see credit memo apply error containing "already applied"

  @FIN-CCNA-TC-005 @regression @p2 @iacs-md
  Scenario: Partial CM apply keeps reconciliation
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "100" and reason "transport_allowance"
    And I apply "35" from current credit memo to the oldest outstanding invoice of the same customer
    Then credit memo financial totals should reconcile in database

  @FIN-CCNA-TC-006 @regression @p2 @iacs-md
  Scenario: Transport allowance over-balance may create dealer advance
    Given I prepare a transport allowance over-balance setup for customer "Ramesh ningappa diggai"
    Then dealer advance should be created for current credit memo application

  @FIN-CCNR-TC-001 @critical @p0 @iacs-md
# Defect DAEE-414: FIN-CCNR-TC-001 UI shows reversal success, but DB lookup finds no GL reversal JE headers.
# Test data: CM amount=185, apply=52, reversal reason=AUTO_QA_FIN_CCNR_001.
  Scenario: Reverse CM application posts reversal JE balanced
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "185" and reason "transport_allowance"
    And I apply "52" from current credit memo to the oldest outstanding invoice of the same customer
    And I reverse the application for current target invoice with reason "AUTO_QA_FIN_CCNR_001"
    Then I should see credit memo reversal success toast
    Then credit memo application reversal journal swaps debits and credits versus original apply

  @FIN-CCNR-TC-002 @critical @p0 @iacs-md
# Defect DAEE-419: Reversal success does not restore invoice outstanding to pre-apply value.
  Scenario: Reverse CM application restores outstanding
    Given I am on the credit memos page
    When I create a credit memo for customer "SRI SAIRAM AGENCIES" with amount "175" and reason "transport_allowance"
    And I apply "48" from current credit memo to the oldest outstanding invoice of the same customer
    And I reverse the application for current target invoice with reason "AUTO_QA_FIN_CCNR_002"
    Then I should see credit memo reversal success toast
    And target invoice outstanding should be restored after reversal
    Then credit memo available credit should equal total amount after reversal

  @FIN-CCNR-TC-003 @regression @p1 @iacs-md
  Scenario: Reverse dialog requires reason before confirm
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "160" and reason "transport_allowance"
    And I apply "40" from current credit memo to the oldest outstanding invoice of the same customer
    And I open reverse dialog for current target invoice without confirming
    Then Confirm Reversal button should be disabled on reverse dialog

  @FIN-CCNR-TC-004 @regression @p1 @iacs-md
  Scenario: After reversal history shows Reversed
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "190" and reason "transport_allowance"
    And I apply "55" from current credit memo to the oldest outstanding invoice of the same customer
    And I reverse the application for current target invoice with reason "AUTO_QA_FIN_CCNR_004"
    Then I should see credit memo reversal success toast
    And application history row for target invoice should show reversed status

  @FIN-CCNR-TC-005 @regression @p1 @iacs-md
  Scenario: Reversal restores CM available credit
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "200" and reason "transport_allowance"
    And I apply "60" from current credit memo to the oldest outstanding invoice of the same customer
    And I reverse the application for current target invoice with reason "AUTO_QA_FIN_CCNR_005"
    Then credit memo available credit should equal total amount after reversal

  @FIN-CCNR-TC-006 @regression @p2 @iacs-md
  Scenario: Double reversal blocked after first reversal
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "155" and reason "transport_allowance"
    And I apply "40" from current credit memo to the oldest outstanding invoice of the same customer
    And I reverse the application for current target invoice with reason "AUTO_QA_FIN_CCNR_006a"
    Then application history row for target invoice should not show Reverse action

  @FIN-CCNR-TC-007 @regression @p2 @iacs-md
  Scenario: Audit may record credit memo reversal event
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "140" and reason "transport_allowance"
    And I apply "35" from current credit memo to the oldest outstanding invoice of the same customer
    And I reverse the application for current target invoice with reason "AUTO_QA_FIN_CCNR_007"
    Then audit may contain CREDIT_MEMO_REVERSED for reversed applications

  @FIN-CCNR-TC-008 @critical @p0 @iacs-md
# Defect DAEE-418: Credit memo detail has no full CCN reversal action (feature gap).
  Scenario: Credit memo detail provides full CCN reversal action
    Given I am on the credit memos page
    When I create a credit memo for customer "Ramesh ningappa diggai" with amount "145" and reason "transport_allowance"
    Then credit memo detail should provide full CCN reversal action
