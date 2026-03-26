# Phase 2: RFQ to Suppliers (DAEE-150)
# Source: https://linear.app/daee-issues/issue/DAEE-150/phase-2-rfq-to-suppliers
# AC2.1: Generate RFQ from Approved PR; AC2.2: Set response deadline.
@p2p-phase2
Feature: Phase 2 - RFQ to Suppliers
  As a Procurement Officer
  I want to generate and send RFQ from an approved PR to suppliers
  So that suppliers receive a consistent, sanitised request and all RFQ sends are traceable.

  Background:
    Given I am logged in to the Application

  @P2P-P2-TC-001 @p1 @smoke @iacs-md
  Scenario: View RFQ list page
    Given I am on the "p2p/rfq" page
    Then I should see the "Request for Quotation" heading
    And I should see the list or empty state

  @P2P-P2-TC-002 @p1 @iacs-md
  Scenario: Create RFQ from approved PR with response deadline
    Given I am on the "p2p/rfq" page
    And there is at least one approved PR available for RFQ
    When I create an RFQ from an approved PR with response deadline in 7 days
    Then I should be on the RFQ detail page

  # --- PR status should reflect RFQ conversion (Defect 2) ---
  @P2P-P2-TC-004 @p2 @iacs-md
  Scenario: Approved PR shows converted status after RFQ is created
    Given I am on the "p2p/rfq" page
    And there is at least one approved PR available for RFQ
    When I create an RFQ from an approved PR with response deadline in 7 days
    Then I should be on the RFQ detail page
    And the source procurement request should show status "Converted to RFQ" or an equivalent converted indicator

  @P2P-P2-TC-003 @p2 @iacs-md
  Scenario: Create RFQ page shows select PR step and submit not available until PR selected
    Given I am on the "p2p/rfq/create" page
    Then I should see the "Create RFQ" heading
    And I should see "Step 1: Select Procurement Request"
    And the Create RFQ submit button should not be visible until a PR is selected

  @P2P-P2-TC-005 @p1 @regression @iacs-md @daee-150
  Scenario: RFQ generated from PR should exclude internal budget and cost-center details
    Given I am on the "p2p/rfq" page
    And there is at least one approved PR available for RFQ
    When I create an RFQ from an approved PR with response deadline in 7 days
    Then I should be on the RFQ detail page
    And the RFQ document view should not expose internal budget or cost-center fields

  @P2P-P2-TC-006 @p1 @regression @iacs-md @daee-150
  Scenario: RFQ issue flow should log recipients, issue date, and version for audit
    Given I am on the "p2p/rfq" page
    And there is at least one approved PR available for RFQ
    When I create an RFQ from an approved PR with response deadline in 7 days
    And I invite up to 3 suppliers for the current RFQ
    And I issue the current RFQ to invited suppliers
    Then the RFQ send audit should capture recipients, issue timestamp, and version details

  @P2P-P2-TC-007 @p2 @regression @iacs-md @daee-150
  Scenario: RFQ resend should create additional send log entry for audit traceability
    Given there is an issued RFQ with supplier recipients in audit
    When I perform a resend style action by inviting an additional supplier for the RFQ
    Then the RFQ send audit log count should increase for the same RFQ

  @P2P-P2-TC-008 @p1 @regression @iacs-md @daee-150
  Scenario: PR converted to RFQ should not allow direct Convert to PO action
    Given I am on the "p2p/rfq" page
    And there is at least one approved PR available for RFQ
    When I create an RFQ from an approved PR with response deadline in 7 days
    Then I should be on the RFQ detail page
    And the source procurement request should block direct Convert to PO after RFQ conversion

  @P2P-P2-TC-009 @p2 @regression @iacs-md @daee-150
  Scenario: RFQ minimum suppliers policy should enforce justification for single-source issue
    Given I am on the "p2p/rfq" page
    And there is at least one approved PR available for RFQ
    When I create an RFQ from an approved PR with response deadline in 7 days
    And I invite up to 1 suppliers for the current RFQ
    Then issuing the RFQ should require single-source justification when only one supplier is invited

  @P2P-P2-TC-010 @p2 @regression @iacs-md @daee-150
  Scenario: RFQ should allow progression before deadline when all responses are received
    Given there is an issued RFQ with at least one received quote
    Then the RFQ should remain actionable for evaluation before response deadline passes

  @P2P-P2-TC-011 @p2 @regression @multi-user @iacs-md @iacs-ed @daee-150
  Scenario Outline: RFQ quote visibility should respect role-based policy
    Given I am logged in as "<User>"
    When I open an RFQ that has at least one quote
    Then quote visibility for "<User>" should match configured policy

    Examples:
      | User         |
      | IACS MD User |
      | IACS ED User |
