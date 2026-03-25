@plant-production @PLANT-P3
Feature: Production Work Orders Management (DAEE-166)

  Background:
    Given I am on the Work Orders page

  @PLANT-WO-TC-001 @smoke @p1 @iacs-md @PLANT-P3
  Scenario: Work Orders page loads with statistics
    Then the Work Orders page should show statistics cards
    And the work orders table should be visible

  @PLANT-WO-TC-002 @smoke @p1 @iacs-md @PLANT-P3
  Scenario: Create a work order in manual mode
    When I open the Create Work Order dialog
    And I select manual work order type
    And I select any available product for the work order
    And I select any available plant for the work order
    And I fill quantity as 10
    And I fill planned start date as today
    And I fill planned end date as tomorrow
    And I submit the work order form
    Then I should see a work order created success toast
    And the work order should appear in the list

  @PLANT-WO-TC-003 @regression @p1 @iacs-md @PLANT-P3
  Scenario: Work order quantity validation
    When I open the Create Work Order dialog
    And I select manual work order type
    And I select any available product for the work order
    And I select any available plant for the work order
    And I fill quantity as 0
    And I submit the work order form
    Then I should see a quantity validation error

  @PLANT-WO-TC-004 @regression @p1 @iacs-md @PLANT-P3
  Scenario: Filter work orders by status
    When I filter work orders by status Pending
    Then only pending work orders should be visible in the list

  @PLANT-WO-TC-005 @regression @p1 @iacs-md @PLANT-P3
  Scenario: Search work orders by keyword
    Given I have created a work order in manual mode
    When I search for the work order by number
    Then the matching work order should be visible

  @PLANT-WO-TC-006 @regression @p2 @iacs-md @PLANT-P3
  Scenario: Delete a work order
    Given I have created a work order in manual mode
    When I delete the created work order
    Then the work order should not appear in the list

  @PLANT-WO-TC-007 @regression @p1 @iacs-md @PLANT-P3
  Scenario: Approve a pending work order
    Given I have created a work order in manual mode
    When I approve the created work order
    Then the work order status should be approved

  @PLANT-WO-TC-008 @regression @p2 @iacs-md @PLANT-P3
  Scenario: Work Orders page shows No work orders message when list is empty
    When I filter work orders by status Cancelled
    Then the work orders list should show no results or be empty
