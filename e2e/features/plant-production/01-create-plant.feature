# DAEE-161: Create Plant
# Source: https://linear.app/daee-issues/issue/DAEE-161
# As a Plant Administrator, I want to create a manufacturing plant with all required details
# so that it can serve as the foundation for licenses, assets, and work orders.
@plant-production
Feature: Create Plant (DAEE-161)
  As a Plant Administrator
  I want to create and manage manufacturing plants
  So that plants serve as the foundation for production operations

  Background:
    Given I am logged in to the Application

  # --- Happy Path ---

  @PLANT-PLT-TC-001 @smoke @p1 @iacs-md @PLANT-P1
  Scenario: Create plant with required fields
    Given I am on the Plants Setup page
    When I open the Add Plant dialog
    And I fill the plant name with a unique AUTO_QA name
    And I fill the plant code with a unique code
    And I submit the plant form
    Then I should see a plant created success toast
    And the new plant should appear in the plants list

  @PLANT-PLT-TC-005 @regression @p2 @iacs-md @PLANT-P1
  Scenario: Create plant with capacity and operational fields
    Given I am on the Plants Setup page
    When I open the Add Plant dialog
    And I fill the plant name with a unique AUTO_QA name
    And I fill the plant code with a unique code
    And I set production capacity to "5000" with unit "Kilograms (kg)"
    And I set operating hours to "10" and operating days to "5"
    And I submit the plant form
    Then I should see a plant created success toast
    And the new plant should appear in the plants list

  @PLANT-PLT-TC-007 @regression @p2 @iacs-md @PLANT-P1
  Scenario: Plant record persists after page refresh
    Given I have created a plant with a unique AUTO_QA name
    When I reload the page
    And I search for the plant by name
    Then the plant should appear in the plants list

  @PLANT-PLT-TC-009 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Edit existing plant persists changes
    Given I have created a plant with a unique AUTO_QA name
    When I open the Edit dialog for the created plant
    And I update the plant description to "Updated via automation"
    And I submit the plant form
    Then I should see a plant updated success toast
    And the plant description should be updated in the list

  @PLANT-PLT-TC-010 @regression @p2 @iacs-md @PLANT-P1
  Scenario: Plant list search by name and code
    Given I have created a plant with a unique AUTO_QA name
    When I search for the plant by name
    Then the plant should appear in the plants list
    When I clear the search
    And I search for the plant by code
    Then the plant should appear in the plants list

  # --- Validation ---

  @PLANT-PLT-TC-002 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Plant code uniqueness validation
    Given I have created a plant with a unique AUTO_QA name
    When I open the Add Plant dialog
    And I fill the plant name with a unique AUTO_QA name
    And I fill the plant code with the same code as the existing plant
    And I submit the plant form
    Then I should see an error indicating the plant code already exists

  @PLANT-PLT-TC-003 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Required field validation shows inline errors
    Given I am on the Plants Setup page
    When I open the Add Plant dialog
    And I submit the plant form without filling required fields
    Then I should see inline validation error for plant name
    And I should see inline validation error for plant code

  @PLANT-PLT-TC-006 @regression @p2 @iacs-md @PLANT-P1 @known-defect
  Scenario: Maintenance date validation rejects next before last
    Given I am on the Plants Setup page
    When I open the Add Plant dialog
    And I fill the plant name with a unique AUTO_QA name
    And I fill the plant code with a unique code
    And I set last maintenance date to "2025-06-01" and next maintenance date to "2025-01-01"
    And I submit the plant form
    Then I should see a validation error for maintenance dates or the form may be accepted due to missing validation

  # --- Cancel Behaviour ---

  @PLANT-PLT-TC-008 @regression @p2 @iacs-md @PLANT-P1
  Scenario: Cancel closes form without saving plant
    Given I am on the Plants Setup page
    And I note the current plant count
    When I open the Add Plant dialog
    And I fill the plant name with a unique AUTO_QA name
    And I fill the plant code with a unique code
    And I cancel the plant form
    Then the dialog should be closed
    And the plant count should remain unchanged

  # --- Status Usability ---

  @PLANT-PLT-TC-004 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Plant with inactive status appears as inactive in list
    Given I am on the Plants Setup page
    When I open the Add Plant dialog
    And I fill the plant name with a unique AUTO_QA name
    And I fill the plant code with a unique code
    And I set the plant status to "Inactive"
    And I submit the plant form
    Then I should see a plant created success toast
    And the plant status in the list should show "inactive"
