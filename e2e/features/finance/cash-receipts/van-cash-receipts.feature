# VAN Cash Receipts - consolidated, independent scenario patterns
# Pattern:
# 1) Contract validation (standalone)
# 2) Posting guard rails (standalone)
# 3) Posted-payment lifecycle (self-contained per scenario)

Feature: VAN Cash Receipts
  As the system I validate, post, and verify VAN-based cash receipts end-to-end
  so that dealer payments are correctly converted into receipts and allocations.

  Background:
    Given I am logged in to the Application

  @FIN-VAN-TC-001 @smoke @critical @p0 @iacs-md
  Scenario: Valid VAN validation succeeds
    When I send VAN validation request with VAN "IACS1234" and amount "5000.00"
    Then VAN validation should succeed with dealer

  @FIN-VAN-TC-002 @negative @iacs-md
  Scenario: Invalid VAN is rejected
    When I send VAN validation request with VAN "INVALID_VAN_999" and amount "5000.00"
    Then VAN validation should fail with message containing "not found or inactive"

  @FIN-VAN-TC-003 @security @iacs-md
  Scenario: Invalid signature is rejected
    When I send VAN validation request with invalid signature
    Then VAN validation should fail with message containing "signature"

  @FIN-VAN-TC-004 @negative @iacs-md
  Scenario: Unvalidated payment is rejected on posting
    When I send VAN posting request with UTR "UNVALIDATED_UTR_001"
    Then VAN posting should fail with message containing "validated"

  @FIN-VAN-TC-005 @critical @p0 @iacs-md
  Scenario: Successful posting creates cash receipt and FIFO allocation
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    And payment should be allocated FIFO to invoices

  @FIN-VAN-TC-006 @edge @iacs-md
  Scenario: Duplicate UTR is rejected
    When I send VAN validation request with VAN "IACS1234" and amount "5000.00" and UTR "AUTO_QA_DUP_UTR"
    And I send VAN posting request with UTR "AUTO_QA_DUP_UTR"
    And I send VAN posting request with UTR "AUTO_QA_DUP_UTR"
    Then VAN posting should fail with message containing "duplicate"

  @FIN-VAN-TC-007 @critical @p0 @iacs-md
  Scenario: Posted VAN payment shows EPD discount in receipt details
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    And I open the cash receipt for the last VAN payment
    And the receipt detail shows EPD discount displayed

  @FIN-VAN-TC-008 @smoke @critical @p0 @iacs-md
  Scenario: VAN payment then verify receipt and invoice in UI
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    And I open the cash receipt for the last VAN payment
    And the receipt detail shows amount applied and status
    And the invoice for the last VAN payment is Paid with balance zero

  @FIN-VAN-TC-009 @regression @p1 @iacs-md
  Scenario: Un-apply then re-apply receipt
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    And I open the cash receipt for the last VAN payment
    And I un-apply the receipt
    When I re-apply the receipt to invoices
    And I open the cash receipt for the last VAN payment
    Then the receipt detail shows amount applied and status
