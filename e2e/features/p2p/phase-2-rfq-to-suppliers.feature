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
