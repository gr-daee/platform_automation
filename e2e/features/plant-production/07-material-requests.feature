@plant-production @PLANT-P4
Feature: Material Requests (MRN) Management (DAEE-167)

  Background:
    Given I am on the Material Requests page

  @PLANT-MRN-TC-001 @smoke @p1 @iacs-md @PLANT-P4
  Scenario: Material Requests page loads successfully
    Then the Material Requests page should be visible
    And the MRN list or empty state should be displayed

  @PLANT-MRN-TC-002 @regression @p2 @iacs-md @PLANT-P4
  Scenario: MRN list shows pending and partial issued by default
    Then the MRN list header should be visible
    And the page should display within the last 30 days date range filter

  @PLANT-MRN-TC-003 @regression @p2 @iacs-md @PLANT-P4
  Scenario: Navigate to Material Issuance from MRN
    Then the Material Requests page should be visible
    And the issue action should be available for pending MRNs
