# Phase 5: PO to Supplier (DAEE-153)
# Source: https://linear.app/daee-issues/issue/DAEE-153/phase-5-po-to-supplier
# Full scenarios to be added when step definitions are implemented.

Feature: Phase 5 - PO to Supplier
  As a Procurement Officer
  I want to mark the PO as sent to the supplier and support amendments and cancellation
  So that supplier receives the correct PO and all sends and changes are auditable.

  Background:
    Given I am logged in to the Application

  @P2P-P5-TC-001 @p1 @smoke @iacs-md
  Scenario: View Purchase Orders page for send flow
    Given I am on the "p2p/purchase-orders" page
    Then I should see the "Purchase Orders" heading
    And I should see the list or empty state

  @P2P-P5-TC-002 @p1 @regression @iacs-md @daee-153
  Scenario: Approved PO can be marked as sent to supplier with audit evidence
    Given there is an approved purchase order for supplier send flow
    When I mark the current purchase order as sent to supplier
    Then the purchase order should be in "sent to supplier" or equivalent dispatched state
    And PO send event should be auditable with recipient, date, or version context

  @P2P-P5-TC-003 @p2 @regression @iacs-md @daee-153
  Scenario: PO amendment should create versioned change trail with supersede evidence
    Given there is a sent-to-supplier purchase order for amendment flow
    When I attempt to amend the current purchase order and submit the amendment
    Then amendment action should create audit evidence for versioned PO change

  @P2P-P5-TC-004 @p1 @regression @iacs-md @daee-153
  Scenario: Cancel PO before GRN should block downstream GRN and invoice recording
    Given there is an approved purchase order without GRN for cancellation flow
    When I cancel the current purchase order
    Then the cancelled PO should block GRN and supplier invoice recording actions

  @P2P-P5-TC-005 @p2 @regression @iacs-md @daee-153
  Scenario: Cancelling PO after GRN exists should be blocked or policy-gated
    Given there is a purchase order with at least one GRN for cancellation policy validation
    When I attempt to cancel that purchase order
    Then cancellation should be blocked or require policy-based escalation

  @P2P-P5-TC-006 @p2 @regression @iacs-md @daee-153
  Scenario: Send and amendment events should be available in PO audit trail
    Given there is a sent-to-supplier purchase order for amendment flow
    Then PO send and amendment related events should be queryable from audit trail
