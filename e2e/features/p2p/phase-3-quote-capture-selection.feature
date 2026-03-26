# Phase 3: Quote Capture & Selection (DAEE-151)
# Source: https://linear.app/daee-issues/issue/DAEE-151/phase-3-quote-capture-and-selection
# AC3.1–AC3.6: Capture quotes, compare, recommend with reason, approval, create PO.
@p2p-phase3
Feature: Phase 3 - Quote Capture and Selection
  As a Procurement Officer
  I want to capture supplier quotes, compare them, recommend a supplier with reason, and get selection approved
  So that selection is evidence-based, auditable, and free from single-person bias.

  Background:
    Given I am logged in to the Application

  @P2P-P3-TC-001 @p1 @smoke @iacs-md
  Scenario: View Quote Comparison page for an RFQ
    Given I am on the "p2p/rfq" page
    And there is at least one RFQ in the list
    When I open the first RFQ and navigate to Quote Comparison
    Then I should see the "Quote Comparison" heading
    And I should see either the quote comparison table or "No quotes" message

  @P2P-P3-TC-002 @p1 @iacs-md
  Scenario: RFQ detail shows Compare Quotes when quotes received or evaluation
    Given I am on the "p2p/rfq" page
    And there is at least one RFQ in the list
    When I open the first RFQ detail
    Then I should see the RFQ detail page with status and actions

  # E2E: Create RFQ → invite → issue → enter quote → comparison → recommend. Requires approved PR and suppliers in tenant.
  @P2P-P3-TC-003 @p2 @iacs-md @e2e
  Scenario: Quote comparison to recommendation – full E2E validation
    Given I am on the "p2p/rfq" page
    And there is at least one approved PR available for RFQ
    When I create an RFQ from an approved PR with response deadline in 7 days
    Then I should be on the RFQ detail page
    And I ensure the current RFQ has one quote for comparison
    When I navigate to Quote Comparison for that RFQ
    Then I should see the "Quote Comparison" heading
    And I should see the comparison table with at least one quote row
    And I should see "Lowest Price" or "Total Quotes" summary
    When I select the first quote as winning and submit with reason "AUTO_QA_ Best price and delivery"
    Then I should see a success message for quote selection
    And the RFQ should show selection pending or approved state

  @P2P-P3-TC-004 @p2 @iacs-md
  Scenario: Create PO from approved selection not available until selection approved
    Given I am on the RFQ detail page for an RFQ with selection not yet approved
    Then the "Create PO" button should not be visible or should be disabled
