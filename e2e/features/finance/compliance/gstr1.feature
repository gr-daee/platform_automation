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
