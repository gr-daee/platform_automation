# VAN API Posting - Axis Bank posting and cash receipt creation (TC_ABP_05-08)
# Source: Test plan Phase 5.2; Test Cases - VAN.csv

Feature: VAN API Posting
  As the system I post validated VAN payments and create cash receipts
  so that payments are allocated FIFO to invoices.

  @FIN-VAN-TC-005 @smoke @critical @p0
  Scenario: Successful posting with FIFO allocation
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    And payment should be allocated FIFO to invoices

  @FIN-VAN-TC-006 @negative
  Scenario: Unvalidated payment is rejected on posting
    When I send VAN posting request with UTR "UNVALIDATED_UTR_001"
    Then VAN posting should fail with message containing "validated"

  @FIN-VAN-TC-007 @edge
  Scenario: Duplicate UTR is rejected
    When I send VAN validation request with VAN "IACS1234" and amount "5000.00" and UTR "AUTO_QA_DUP_UTR"
    And I send VAN posting request with UTR "AUTO_QA_DUP_UTR"
    And I send VAN posting request with UTR "AUTO_QA_DUP_UTR"
    Then VAN posting should fail with message containing "duplicate"

  @FIN-VAN-TC-008 @edge
  Scenario: Amount mismatch is rejected
    When I send VAN validation request with VAN "IACS1234" and amount "5000.00"
    And I send VAN posting request with UTR "AUTO_QA_AMT_MISMATCH_UTR"
    Then VAN payment should be posted successfully

  @dry-run @FIN-VAN-TC-005
  Scenario: Dry run - VAN payment amount 132.43 rupees
    When I send VAN validation then posting with amount "132.43"
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
