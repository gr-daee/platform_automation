Feature: GSTR-1 Review Page
  As a Compliance Officer
  I want to review and export GSTR-1 data in government-compliant format
  So that I can ensure 100% accurate GSTR-1 filing without manual data manipulation

  Background:
    Given I am logged in to the Application

  @GSTR1-DAEE-100-TC-001 @DAEE-100 @smoke @regression @p0 @iacs-md
  Scenario: User with compliance.read can open GSTR-1 Review page
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page

  @GSTR1-DAEE-100-TC-003 @DAEE-100 @regression @p1 @multi-user
  @iacs-md
  Scenario Outline: User access control for GSTR-1 page
    Given I am logged in as "<User>"
    When I navigate to "/finance/compliance/gstr1"
    Then I should see "<Expected Result>" for GSTR-1 access

    Examples:
      | User              | Expected Result        |
      | IACS MD User     | the GSTR-1 Review page |
      # TODO: Add non-compliance user (e.g., Viewer) when user profile is available
      # | Viewer           | access denied          |

  @GSTR1-DAEE-100-TC-004 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Filing Period dropdown visible with current month options
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    And the Filing Period dropdown should be visible with current month options

  @GSTR1-DAEE-100-TC-005 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Seller GSTIN dropdown displays GSTIN and State Name format
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    And the Seller GSTIN dropdown should display GSTIN and State Name format

  @GSTR1-DAEE-100-TC-006 @DAEE-100 @smoke @regression @p0 @iacs-md
  Scenario: Selecting filters loads data and removes empty state
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear

  @GSTR1-DAEE-100-TC-007 @DAEE-100 @smoke @regression @p0 @iacs-md
  Scenario: Return Period card shows human-readable format
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Return Period card should show human-readable format
