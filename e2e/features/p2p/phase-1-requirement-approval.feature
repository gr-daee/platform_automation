# Phase 1: Requirement & Approval (DAEE-149)
# Source: https://linear.app/daee-issues/issue/DAEE-149/phase-1-requirement-and-approval
# As a Requester or Procurement Officer, I want to create a PR in Draft, submit for approval with budget/cost-center check,
# and have it approved or rejected based on approval limits by value, so that only validated requirements proceed to RFQ/PO.
@p2p-phase1
Feature: Phase 1 - Procurement Request Requirement and Approval
  As a Requester or Procurement Officer
  I want to create and approve Procurement Requests (PR)
  So that only validated and authorised requirements proceed to RFQ/PO and spending is controlled.

  Background:
    Given I am logged in to the Application

  # --- View and navigation ---
  @P2P-P1-TC-001 @p1 @smoke @iacs-md
  Scenario: View Procurement Requests list page
    Given I am on the "p2p/procurement-requests" page
    Then I should see the "Procurement Requests" heading
    And I should see the requests table or empty state

  # --- Create PR in Draft (AC1.1) ---
  @P2P-P1-TC-002 @p1 @iacs-md
  Scenario: Create a Procurement Request in Draft with required fields
    Given I am on the "p2p/procurement-requests" page
    When I create a new procurement request in draft with purpose "AUTO_QA_ Phase1 test"
    Then I should see a success message for procurement request creation
    And the new procurement request should appear in the list with status "Draft"

  # --- Submit for approval (AC1.2) ---
  @P2P-P1-TC-003 @p1 @iacs-md
  Scenario: Submit Draft PR for approval
    Given I am on the "p2p/procurement-requests" page
    And there is a draft procurement request for testing
    When I submit the draft procurement request for approval
    Then I should see a success message for submission
    And the procurement request status should be "Submitted"

  # --- Approve PR (AC1.3) ---
  @P2P-P1-TC-004 @p1 @iacs-md
  Scenario: Approver approves submitted PR
    Given I am on the "p2p/procurement-requests" page
    And there is a submitted procurement request for testing
    When I approve the submitted procurement request
    Then I should see a success message for approval
    And the procurement request status should be "Approved"

  # --- Reject PR (AC1.3) ---
  @P2P-P1-TC-005 @p2 @iacs-md
  Scenario: Approver rejects submitted PR from details page and list page
    Given I am on the "p2p/procurement-requests" page
    When I create a new procurement request in draft with purpose "AUTO_QA_ Phase1 reject-flow detail"
    And I submit the draft procurement request for approval
    Then the procurement request status should be "Submitted"
    When I reject the current procurement request from the details page with reason "AUTO_QA_ Rejection from detail"
    Then I should see a success message for rejection
    And the procurement request status should be "Rejected"
    When I create a new procurement request in draft with purpose "AUTO_QA_ Phase1 reject-flow list"
    And I submit the draft procurement request for approval
    Then the procurement request status should be "Submitted"
    When I reject the submitted procurement request with reason "AUTO_QA_ Rejection from list"
    Then I should see a success message for rejection
    And the procurement request status should be "Rejected"

  # --- Negative: Approve from Draft not allowed (AC1.3) ---
  @P2P-P1-TC-006 @p2 @iacs-md
  Scenario: Approve button not available for Draft PR
    Given I am on the "p2p/procurement-requests" page
    And there is a draft procurement request for testing
    Then the Approve action should not be available for the draft request

  # --- Approved PR can initiate Create RFQ (AC1.4) ---
  @P2P-P1-TC-007 @p1 @iacs-md
  Scenario: Approved PR shows Create RFQ or Convert to PO option
    Given I am on the "p2p/procurement-requests" page
    And there is an approved procurement request for testing
    Then the Convert to PO or Create RFQ action should be available for the approved request

  # --- Audit trail shows human-readable user and status transitions (Defect 1) ---
  @P2P-P1-TC-009 @p2 @iacs-md
  Scenario: Procurement Request audit trail shows user names and status change history
    Given I am on the "p2p/procurement-requests" page
    And there is a submitted procurement request for testing
    When I open the procurement request audit trail
    Then the audit trail should show "Created By" and "Last Updated By" as user names
    And the audit trail should list status transitions such as "Draft" to "Submitted" or "Approved"
