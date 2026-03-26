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
  Scenario: End-to-end VAN flow from validation to VAN payment details with receipt and allocation checks
    When I send VAN validation then posting with amount "234.56"
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    And I should see the latest VAN cash receipt on cash receipts page
    When I open the latest VAN cash receipt details page
    Then the cash receipt detail should show VAN payment summary and journal details
    And the cash receipt detail should show auto allocation in FIFO order
    And the cash receipt detail should validate CCN calculation and hyperlink details when discount exists
    And the invoice for the last VAN payment should reflect updated outstanding balance
    Then I should see latest VAN payment on VAN payments page and open details
    And I should be able to navigate VAN payment detail tabs and see content

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

  @FIN-VAN-TC-010 @critical @p1 @iacs-md
  Scenario: VAN posting reflects temporary slab override from payment terms configuration
    # Gap covered: VAN flow should react to payment-terms slab changes, not static EPD defaults
    Given the EPD slab for the oldest allocatable invoice is set to a temporary test percentage
    When I send VAN validation then posting with unique UTR
    Then VAN payment should be posted successfully
    And cash receipt should be created for VAN payment "<utr>"
    And I open the cash receipt for the last VAN payment
    Then the receipt detail shows EPD discount displayed
    Then the EPD slab is restored to its original percentage in the database

  @FIN-VAN-TC-011 @critical @p1 @iacs-md
  Scenario: Data integrity - VAN posting should reconcile VAN collection and cash receipt amounts
    Given I load the latest posted VAN payment with linked cash receipt
    Then VAN payment and cash receipt totals should reconcile

  @FIN-VAN-TC-012 @critical @p1 @iacs-md
  Scenario: VAN lifecycle integrity - un-apply then re-apply keeps receipt totals consistent
    Given I load the latest posted VAN payment with linked cash receipt
    And I open the cash receipt for the last VAN payment
    And I un-apply the receipt
    Then the last VAN cash receipt totals should reconcile in database
    When I re-apply the receipt to invoices
    And I open the cash receipt for the last VAN payment
    Then the last VAN cash receipt totals should reconcile in database
