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
