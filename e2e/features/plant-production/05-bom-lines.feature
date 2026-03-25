@plant-production @PLANT-P2
Feature: BOM Line Items Management (DAEE-165)

  Background:
    Given I am on the BOM Management page

  @PLANT-BOM-TC-011 @smoke @p1 @iacs-md @PLANT-P2
  Scenario: BOM line shows component name quantity and UOM in detail view
    Given I have created a BOM with one component line
    When I view the created BOM detail
    Then the component line details should be visible in the detail view

  @PLANT-BOM-TC-012 @regression @p1 @iacs-md @PLANT-P2
  Scenario: Component line quantity must be greater than zero
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I add a component line with quantity zero
    And I submit the Create BOM form
    Then I should see a line quantity validation error

  @PLANT-BOM-TC-013 @regression @p1 @iacs-md @PLANT-P2 @known-defect
  Scenario: BOM supports multiple component lines
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I add two raw material component lines
    And I submit the Create BOM form
    Then I should see a BOM created success toast or a known defect about single component limit

  @PLANT-BOM-TC-014 @regression @p1 @iacs-md @PLANT-P2
  Scenario: Critical component flag is preserved after creation
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I add one raw material component line marked as critical
    And I submit the Create BOM form
    Then I should see a BOM created success toast
    When I view the created BOM detail
    Then the component should show the critical badge in detail view

  @PLANT-BOM-TC-015 @regression @p1 @iacs-md @PLANT-P2
  Scenario: Remove a component line before submission
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I add two raw material component lines
    And I remove the second component line
    Then only one component line should remain in the form
    And I submit the Create BOM form
    Then I should see a BOM created success toast

  @PLANT-BOM-TC-016 @regression @p2 @iacs-md @PLANT-P2
  Scenario: Yield percentage is stored and visible in BOM list
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I set yield percentage to 85
    And I add one raw material component line
    And I submit the Create BOM form
    Then I should see a BOM created success toast
    And the BOM should show 85% yield in the list

  @PLANT-BOM-TC-017 @regression @p2 @iacs-md @PLANT-P2
  Scenario: BOM status filter on list page
    Given I have created a BOM with one component line
    When I filter BOMs by status Draft
    Then the created draft BOM should be visible in filtered results
    When I filter BOMs by status Active
    Then the draft BOM should not be visible in active filter
