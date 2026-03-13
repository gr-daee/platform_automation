# VAN Auto Payment E2E - API + UI verification (VAN-EPD-e2e.md)
# Source: Plan van_e2e_auto_payment_testing; EPD-TEST-CASES-AND-CONFIGURATION.md; Signature Utility

Feature: VAN Auto Payment E2E
  As the system I trigger VAN payment via API and verify receipt and invoice in the UI
  so that auto payment flow and EPD are validated end-to-end.

  Background:
    Given I am logged in to the Application

  @FIN-VAN-E2E-001 @smoke @critical @p0
  Scenario: Happy path - VAN payment then verify receipt and invoice in UI
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    And I open the cash receipt for the last VAN payment
    And the receipt detail shows amount applied and status
    And the invoice for the last VAN payment is Paid with balance zero

  @FIN-VAN-E2E-002 @critical @p0
  Scenario: EPD verification - VAN payment then verify EPD on receipt detail
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    And I open the cash receipt for the last VAN payment
    And the receipt detail shows EPD discount displayed

  @FIN-VAN-E2E-003 @regression @p1
  Scenario: Un-apply then re-apply receipt (Phase 5 regression)
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    And I open the cash receipt for the last VAN payment
    And I un-apply the receipt
    When I re-apply the receipt to invoices
    And I open the cash receipt for the last VAN payment
    Then the receipt detail shows amount applied and status
