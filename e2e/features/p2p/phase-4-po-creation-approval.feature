# Phase 4: PO Creation & Approval (DAEE-152)
# Source: https://linear.app/daee-issues/issue/DAEE-152/phase-4-po-creation-and-approval
# Full scenarios to be added when step definitions are implemented.

Feature: Phase 4 - Purchase Order Creation and Approval
  As a Procurement Officer
  I want to create a PO from the approved quote and have it approved
  So that POs reflect the selected quote accurately and approval is informed and controlled.

  Background:
    Given I am logged in to the Application

  @P2P-P4-TC-001 @p1 @smoke @iacs-md
  Scenario: View Purchase Orders list page
    Given I am on the "p2p/purchase-orders" page
    Then I should see the "Purchase Orders" heading
    And I should see the list or empty state

  # --- Create PO from approved selection (AC4.1, AC4.2, AC4.4, AC4.5) ---
  # Full chain: PR → submit → approve → RFQ → invite 2–3 suppliers → issue → quotes → compare →
  # select winner → submit for approval → approve selection via DB (bypasses SoD) → create PO → submit PO.
  @P2P-P4-TC-002 @p1 @iacs-md @e2e
  Scenario: Create PO from approved quote selection and submit for approval
    Given I am on the "p2p/procurement-requests" page
    When I create a new procurement request in draft with unique purpose prefix "AUTO_QA_P4_E2E"
    Then I should see a success message for procurement request creation
    And the new procurement request should appear in the list with status "Draft"
    When I submit the draft procurement request for approval
    Then the procurement request status should be "Submitted"
    When I approve the submitted procurement request
    Then I should see a success message for approval
    And the procurement request status should be "Approved"
    When I create an RFQ from the current phase 4 E2E approved procurement request
    Then I should be on the RFQ detail page
    When I invite up to 3 suppliers and issue the RFQ for phase 4 E2E
    And I enter quotes from each invited supplier with distinct unit prices for phase 4 E2E
    When I navigate to Quote Comparison for that RFQ
    Then I should see the comparison table with at least one quote row
    When I select the first quote as winning and submit with reason "AUTO_QA_ Best price and delivery for P4 E2E"
    Then I should see a success message for quote selection
    And I capture the winning quote snapshot from Quote Comparison for the current RFQ
    When I approve the RFQ quote selection via test database for the current RFQ
    When I create a purchase order from the approved quote selection
    Then the purchase order should be created in "Draft" status
    And the PO supplier, items, quantities, and rates should match the winning quote
    When I submit the purchase order for approval
    Then the purchase order status should be "Submitted"
    And the PO status change from "Draft" to "Submitted" should be auditable

  # --- Approver approval and quote vs PO visibility with approval limits (AC4.3, AC4.4, AC4.5) ---
  @P2P-P4-TC-003 @p1 @iacs-md
  Scenario: Approver sees quote vs PO and approves within approval limit
    Given there is a submitted purchase order awaiting approval and within the approver's value limit
    When the approver reviews the purchase order with quote vs PO details
    Then the approver should see the winning quote details alongside the PO lines
    When the approver approves the submitted purchase order
    Then the purchase order status should be "Approved"
    And the approval action and status change should be auditable

  # --- Edge: approval limit boundary routing (AC4.3) ---
  @P2P-P4-TC-004 @p2 @iacs-md
  Scenario: PO at approver limit is allowed but value above routes to higher approver
    Given there is a submitted purchase order with value exactly at the current approver's approval limit
    When the approver approves that purchase order
    Then the purchase order should be approved without escalation
    And the approval should respect the configured approval limit
    Given there is another submitted purchase order with value just above the current approver's limit
    When the same approver attempts to approve that purchase order
    Then the system should route the approval to a higher level approver or prevent approval
    And the attempted approval and routing should be auditable

  # --- Negative: approve only from Submitted; send to supplier only from Approved (AC4.3, AC4.4) ---
  @P2P-P4-TC-005 @p2 @iacs-md
  Scenario: Approve and send to supplier actions not allowed from Draft
    Given there is a draft purchase order for testing
    Then the Approve action should not be available for the draft purchase order
    And the Send to supplier action should not be available for the draft purchase order

  @P2P-P4-TC-006 @p2 @iacs-md
  Scenario: Approve only from Submitted and send to supplier only from Approved
    Given there is a submitted purchase order for testing
    Then the Approve action should be available for the submitted purchase order
    And the Send to supplier action should not be available for the submitted purchase order
    When I approve the submitted purchase order
    Then the purchase order status should be "Approved"
    And the Send to supplier action should now be available

  # --- Delivery Warehouse lookup should load warehouses (Defect 3) ---
  @P2P-P4-TC-008 @p2 @iacs-md
  Scenario: Delivery Warehouse selection shows available warehouses during PO creation
    Given there is an RFQ with an approved quote selection ready for PO creation
    When I start creating a purchase order from the approved quote selection
    Then the Delivery Warehouse selection dialog should list at least one warehouse for the tenant

  # --- Multi-PO from a single PR with PR fully converted tracking (AC4.6) ---
  @P2P-P4-TC-007 @p2 @iacs-md
  Scenario: One procurement request generates multiple purchase orders and PR is fully converted
    Given there is an approved procurement request with items awarded to multiple suppliers via quote selection
    When I create a purchase order for the lines awarded to Supplier A from that procurement request
    And I create another purchase order for the lines awarded to Supplier B from that procurement request
    Then the procurement request should track that all its lines are covered by purchase orders
    And the procurement request should be marked as "Fully converted" or equivalent status
