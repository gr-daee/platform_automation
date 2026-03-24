# Phase 6: Receipt & Quality (DAEE-157)
# Source: https://linear.app/daee-issues/issue/DAEE-157/phase-6-receipt-and-quality-user-story
# Full scenarios to be added when step definitions are implemented.

Feature: Phase 6 - Receipt and Quality (GRN)
  As a Store or Warehouse User
  I want to record goods receipt (GRN) against the PO and perform quality check
  So that inventory reflects only accepted goods and quality issues are tracked.

  Background:
    Given I am logged in to the Application

  @P2P-P6-TC-001 @p1 @smoke @iacs-md
  Scenario: View GRN list page
    Given I am on the "p2p/grn" page
    Then I should see the "Goods Receipt Notes" heading
    And I should see the list or empty state

  @P2P-P6-TC-002 @p0 @critical @iacs-md @daee-157
  Scenario: Accepted quantity from partial rejection updates raw material stock
    Given I open GRN "d86ed2c0-cdad-4952-af58-b31c2ae24b94" from DAEE-157 defect context
    Then accepted quantity should be reflected in raw material inventory for that GRN

  @P2P-P6-TC-003 @p0 @critical @iacs-md @daee-157 @e2e
  Scenario: E2E partial rejection updates stock by accepted quantity
    Given there is a purchase order with editable GRN for receipt processing
    And I record receipt with partial rejection on the created GRN
    And I approve quality for the created GRN
    Then the created GRN should update raw material inventory by accepted quantity only

  @P2P-P6-TC-004 @p0 @critical @iacs-md @daee-157 @negative
  Scenario: Recording partial rejection should not fail with quality status enum errors
    Given there is a purchase order with editable GRN for receipt processing
    When I record receipt with partial rejection on the created GRN
    Then the receipt update should complete without backend enum errors

  @P2P-P6-TC-005 @p1 @regression @iacs-md @daee-157 @audit
  Scenario: GRN detail should show quality inspection and traceability fields after approval
    Given there is a purchase order with editable GRN for receipt processing
    And I record receipt with partial rejection on the created GRN
    When I approve quality for the created GRN
    Then GRN detail should display inspection metadata and linked PO traceability

  @P2P-P6-TC-006 @p1 @regression @iacs-md @daee-157 @partial-delivery
  Scenario: PO with multiple GRNs should accumulate accepted quantities correctly
    Given there is a purchase order with multiple GRNs for cumulative receipt validation
    Then cumulative accepted quantity across GRNs should match PO received quantity

  @P2P-P6-TC-007 @p1 @regression @iacs-md @daee-157 @sod
  Scenario: GRN operator should not be able to mark invoices for payment
    Given I am on the "p2p/payment-queue" page
    Then mark for payment action should not be available for the current GRN operator user

  @P2P-P6-TC-008 @p1 @regression @iacs-md @daee-157 @invoice-linkage
  Scenario: Goods-first flow should support invoice linked to PO and GRN
    Given there is a purchase order with editable GRN for receipt processing
    When I record receipt with full acceptance on the created GRN
    And I approve quality for the created GRN
    And I create a supplier invoice for the current PO in goods-first flow
    Then goods-first flow should persist invoice linkage with current PO and GRN

  @P2P-P6-TC-009 @p1 @regression @iacs-md @daee-157 @invoice-linkage
  Scenario: Invoice-first flow should support later GRN linkage
    Given there is a sent-to-supplier purchase order without GRN for invoice-first flow
    When I create a supplier invoice for the current PO in invoice-first flow
    And I create a GRN from the current purchase order
    Then invoice-first flow should support invoice before GRN on same PO

  @P2P-P6-TC-010 @p1 @regression @iacs-md @daee-157 @rejection
  Scenario: Fully rejected GRN should not create raw material stock
    Given there is a purchase order with editable GRN for receipt processing
    When I record receipt with full rejection on the created GRN
    And I approve quality for the created GRN
    Then fully rejected GRN should have zero linked raw material stock entries
