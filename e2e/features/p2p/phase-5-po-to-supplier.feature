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
