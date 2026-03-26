# DAEE-163: Add Plant Assets
# Source: https://linear.app/daee-issues/issue/DAEE-163
# As a Plant Administrator, I want to add assets (production equipment) to a plant
# so that assets can be assigned to work orders and production is traceable.
@plant-production
Feature: Add Plant Assets (DAEE-163)
  As a Plant Administrator
  I want to add and manage assets for manufacturing plants
  So that equipment is available for production work orders

  Background:
    Given I am logged in to the Application

  # --- Happy Path ---

  @PLANT-AST-TC-001 @smoke @p1 @iacs-md @PLANT-P1
  Scenario: Create asset with required fields
    Given I am on the Plants Setup page
    And there is an active plant for asset testing
    When I switch to the Plant Assets tab
    And I open the Add Asset dialog
    And I select the test plant in the asset form
    And I fill the asset name with a unique AUTO_QA name
    And I fill the asset code with a unique code
    And I select asset category "Production Equipment"
    And I submit the asset form
    Then I should see an asset created success toast
    And the new asset should appear in the assets list

  @PLANT-AST-TC-008 @regression @p2 @iacs-md @PLANT-P1
  Scenario: Asset edit persists after page refresh
    Given I have created a plant asset with a unique AUTO_QA name
    When I switch to the Plant Assets tab
    And I open the Edit dialog for the created asset
    And I update the asset name with a new unique AUTO_QA name
    And I submit the asset form
    Then I should see an asset updated success toast
    When I reload the page
    And I switch to the Plant Assets tab
    Then the updated asset name should appear in the assets list

  @PLANT-AST-TC-011 @regression @p2 @iacs-md @PLANT-P1
  Scenario: Edit asset name and status
    Given I have created a plant asset with a unique AUTO_QA name
    When I switch to the Plant Assets tab
    And I open the Edit dialog for the created asset
    And I update the asset name with a new unique AUTO_QA name
    And I submit the asset form
    Then I should see an asset updated success toast

  @PLANT-AST-TC-012 @regression @p2 @iacs-md @PLANT-P1 @known-defect
  Scenario: Delete asset soft-deletes and sets status to retired
    Given I have created a plant asset with a unique AUTO_QA name
    When I switch to the Plant Assets tab
    And I delete the created asset
    Then I should see an asset deleted success toast
    And the deleted asset should have retired status in the list

  # --- Validation ---

  @PLANT-AST-TC-002 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Asset category is restricted to predefined values only
    Given I am on the Plants Setup page
    And there is an active plant for asset testing
    When I switch to the Plant Assets tab
    And I open the Add Asset dialog
    And I select the test plant in the asset form
    And I open the asset category dropdown
    Then only the predefined category options should be available
    And I should not be able to enter a custom category value

  @PLANT-AST-TC-007 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Asset code uniqueness validation
    Given I have created a plant asset with a unique AUTO_QA name
    When I switch to the Plant Assets tab
    And I open the Add Asset dialog
    And I select the test plant in the asset form
    And I fill the asset name with a unique AUTO_QA name
    And I fill the asset code with the same code as the existing asset
    And I select asset category "Production Equipment"
    And I submit the asset form
    Then I should see an error indicating the asset code already exists

  # --- Status & Assignment Rules ---

  @PLANT-AST-TC-003 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Asset with maintenance status is blocked from work order assignment
    Given I have created a plant asset with status "maintenance"
    When I navigate to work order creation
    Then the maintenance asset should not be available for assignment

  @PLANT-AST-TC-009 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Asset under_maintenance cannot be assigned to work order
    Given I have created a plant asset with status "maintenance"
    When I navigate to work order creation
    Then the asset under maintenance should not be selectable in the asset dropdown

  @PLANT-AST-TC-004 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Plant without active assets is blocked from work order creation
    Given I have created a plant with no active assets
    When I navigate to work order creation
    Then the plant without active assets should not be selectable

  @PLANT-AST-TC-005 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Active asset can be assigned to work order
    Given I have created an active plant with a valid license and an active asset
    When I navigate to work order creation and assign the asset
    Then the asset should be successfully assigned to the work order
