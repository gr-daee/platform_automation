# DAEE-162: Add Plant Licenses
# Source: https://linear.app/daee-issues/issue/DAEE-162
# As a Plant Administrator, I want to add licenses to a plant so it becomes production-ready
# and meets regulatory compliance requirements.
@plant-production
Feature: Add Plant Licenses (DAEE-162)
  As a Plant Administrator
  I want to add and manage licenses for manufacturing plants
  So that plants are compliant and production-ready

  Background:
    Given I am logged in to the Application

  # --- Happy Path ---

  @PLANT-LIC-TC-001 @smoke @p1 @iacs-md @PLANT-P1
  Scenario: Create license with required fields
    Given I am on the Plants Setup page
    And there is an active plant for license testing
    When I switch to the Plant Licenses tab
    And I open the Add License dialog
    And I select the test plant in the license form
    And I select license type "Manufacturing License"
    And I fill the license number with a unique AUTO_QA number
    And I set license issue date to "2024-01-01"
    And I set license expiry date to "2026-12-31"
    And I submit the license form
    Then I should see a license created success toast
    And the new license should appear in the licenses list

  @PLANT-LIC-TC-007 @regression @p2 @iacs-md @PLANT-P1
  Scenario: License renewal - update expiry date to future date
    Given I have created a plant license with a unique AUTO_QA number
    When I switch to the Plant Licenses tab
    And I open the Edit dialog for the created license
    And I set license expiry date to "2028-12-31"
    And I submit the license form
    Then I should see a license updated success toast

  @PLANT-LIC-TC-011 @regression @p2 @iacs-md @PLANT-P1
  Scenario: Edit license updates and persists
    Given I have created a plant license with a unique AUTO_QA number
    When I switch to the Plant Licenses tab
    And I open the Edit dialog for the created license
    And I set license expiry date to "2027-06-30"
    And I submit the license form
    Then I should see a license updated success toast
    And the license expiry date should be updated in the list

  # --- Validation ---

  @PLANT-LIC-TC-002 @regression @p1 @iacs-md @PLANT-P1
  Scenario: License mandatory field validation shows inline errors
    Given I am on the Plants Setup page
    When I switch to the Plant Licenses tab
    And I open the Add License dialog
    And I submit the license form without filling required fields
    Then I should see inline validation errors for required license fields

  @PLANT-LIC-TC-003 @regression @p1 @iacs-md @PLANT-P1
  Scenario: License date validation rejects expiry before issue date
    Given I am on the Plants Setup page
    And there is an active plant for license testing
    When I switch to the Plant Licenses tab
    And I open the Add License dialog
    And I select the test plant in the license form
    And I select license type "Manufacturing License"
    And I fill the license number with a unique AUTO_QA number
    And I set license issue date to "2025-06-01"
    And I set license expiry date to "2025-01-01"
    And I submit the license form
    Then I should see a validation error for license expiry date

  @PLANT-LIC-TC-004 @regression @p1 @iacs-md @PLANT-P1
  Scenario: License number uniqueness per plant validation
    Given I have created a plant license with a unique AUTO_QA number
    When I switch to the Plant Licenses tab
    And I open the Add License dialog
    And I select the test plant in the license form
    And I select license type "Trade License"
    And I fill the license number with the same number as the existing license
    And I set license issue date to "2024-01-01"
    And I set license expiry date to "2026-12-31"
    And I submit the license form
    Then I should see an error indicating the license number already exists

  # --- Expiry & Status ---

  @PLANT-LIC-TC-006 @regression @p2 @iacs-md @PLANT-P1
  Scenario: Expired license is visually identifiable in the list
    Given I have created a plant license with an expiry date in the past
    When I switch to the Plant Licenses tab
    Then the expired license should appear in the licenses list with past expiry date

  @PLANT-LIC-TC-008 @regression @p1 @iacs-md @PLANT-P1
  Scenario: Plant with valid license can be selected for work order
    Given I have created an active plant with a valid license and an active asset
    When I navigate to work order creation
    Then the production-ready plant should be available for selection

  # --- Known Defects ---

  @PLANT-LIC-TC-005 @regression @p1 @iacs-md @PLANT-P1 @known-defect
  Scenario: Work order blocked when plant has no valid license
    # BUG-PLANT-001: Work order creation currently does NOT enforce production readiness
    # This test documents the expected behaviour; expected to fail until bug is fixed
    Given I have created a plant with no licenses
    When I navigate to work order creation
    Then the plant without a license should not be selectable for a work order

  @PLANT-LIC-TC-009 @regression @p2 @iacs-md @PLANT-P1 @known-defect
  Scenario: License deletion is available in the UI
    # BUG-PLANT-002: License deletion button not available for test user
    # This test documents expected behaviour; expected to fail until bug is fixed
    Given I have created a plant license with a unique AUTO_QA number
    When I switch to the Plant Licenses tab
    Then the Delete button should be visible for the license row
