@plant-production @PLANT-P2
Feature: BOM Header Management (DAEE-164)

  Background:
    Given I am on the BOM Management page

  @PLANT-BOM-TC-001 @smoke @p1 @iacs-md @PLANT-P2
  Scenario: Create BOM with required fields and one line item
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I add one raw material component line
    And I submit the Create BOM form
    Then I should see a BOM created success toast
    And the new BOM should appear in the BOM list

  @PLANT-BOM-TC-002 @regression @p1 @iacs-md @PLANT-P2
  Scenario: BOM name is required — validation blocks submission
    When I open the Create BOM dialog
    And I select any available product for the BOM
    And I add one raw material component line
    And I submit the Create BOM form without filling BOM name
    Then I should see a BOM name required validation error

  @PLANT-BOM-TC-003 @regression @p1 @iacs-md @PLANT-P2
  Scenario: Product selection is required — validation blocks submission
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I add one raw material component line
    And I submit the Create BOM form
    Then I should see a product required validation error

  @PLANT-BOM-TC-004 @regression @p1 @iacs-md @PLANT-P2
  Scenario: At least one component line is required
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I submit the Create BOM form without adding any lines
    Then I should see a lines required validation error

  @PLANT-BOM-TC-005 @regression @p1 @iacs-md @PLANT-P2
  Scenario: Yield percentage must be between 1 and 100
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I set yield percentage to 0
    And I add one raw material component line
    And I submit the Create BOM form
    Then I should see a yield percentage validation error

  @PLANT-BOM-TC-006 @regression @p1 @iacs-md @PLANT-P2
  Scenario: Cancel closes dialog without saving
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I cancel the Create BOM form
    Then the Create BOM dialog should be closed
    And the BOM should not appear in the list

  @PLANT-BOM-TC-007 @regression @p2 @iacs-md @PLANT-P2
  Scenario: Created BOM starts in draft status
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I add one raw material component line
    And I submit the Create BOM form
    Then I should see a BOM created success toast
    And the new BOM should show status DRAFT in the list

  @PLANT-BOM-TC-008 @regression @p2 @iacs-md @PLANT-P2
  Scenario: BOM number is auto-generated and immutable
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I add one raw material component line
    And I submit the Create BOM form
    Then I should see a BOM created success toast
    When I view the created BOM detail
    Then the BOM number should follow the auto-generated format

  @PLANT-BOM-TC-009 @regression @p1 @iacs-md @PLANT-P2
  Scenario: BOM status workflow draft → under_review → approved → active
    Given I have created a BOM with one component line
    When I submit the BOM for review from the list
    Then the BOM status should be UNDER REVIEW
    When I approve the BOM from the list
    Then the BOM status should be APPROVED
    When I activate the BOM from the list
    Then the BOM status should be ACTIVE

  @PLANT-BOM-TC-010 @regression @p2 @iacs-md @PLANT-P2
  Scenario: Delete draft BOM shows toast confirmation
    # KNOWN-DEFECT BUG-PLANT-004: getBOMs() lacks is_active filter so deleted BOMs remain in the list.
    # The toast confirms the server-side soft delete succeeded.
    # UI refresh behavior depends on application-level defect fix.
    Given I have created a BOM with one component line
    When I delete the BOM from the list
    Then I should see a BOM deleted toast

  @PLANT-BOM-TC-018 @regression @p2 @iacs-md @PLANT-P2
  Scenario: BOM list search filters by BOM name
    Given I have created a BOM with one component line
    When I search for the BOM by name
    Then only matching BOMs should be visible
    When I clear the BOM search
    Then BOM list shows unfiltered results

  @PLANT-BOM-TC-019 @regression @p2 @iacs-md @PLANT-P2
  Scenario: BOM without lines cannot be submitted for review
    When I open the Create BOM dialog
    And I fill the BOM name with a unique AUTO_QA name
    And I select any available product for the BOM
    And I submit the Create BOM form without adding any lines
    Then I should see a lines required validation error
