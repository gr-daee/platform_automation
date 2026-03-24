Feature: Hierarchical Product Sales dealer level and city export
  As a Sales / O2C user
  I want dealer hierarchy and city to be correct in UI and Excel
  So that dealer-wise product sales can be trusted and shared

  Background:
    Given I am logged in to the Application

  @O2C-HPS-TC-001 @smoke @p0 @iacs-md
  Scenario: Hierarchy shows Dealer level between Territory and Product
    Given I am on the Hierarchical Product Sales Report page
    When I generate the Hierarchical Product Sales report with this month
    Then I should see at least one dealer row in the hierarchy

  @O2C-HPS-TC-002 @regression @p1 @iacs-md
  Scenario: Dealer city is visible in hierarchy UI
    Given I am on the Hierarchical Product Sales Report page
    When I generate the Hierarchical Product Sales report with this month
    Then dealer rows should show city badge or fallback "-"

  @O2C-HPS-TC-003 @smoke @p0 @iacs-md
  Scenario: Excel hierarchy report includes DEALER level and City column
    Given I am on the Hierarchical Product Sales Report page
    When I generate the Hierarchical Product Sales report with this month
    And I export Hierarchical Product Sales to detailed Excel
    Then Hierarchy Report sheet should contain City column and DEALER rows

  @O2C-HPS-TC-004 @regression @p1 @iacs-md
  Scenario: Excel dealer city is available in invoice and ranking sheets
    Given I am on the Hierarchical Product Sales Report page
    When I generate the Hierarchical Product Sales report with this month
    And I export Hierarchical Product Sales to detailed Excel
    Then Invoice Details and Dealer Ranking sheets should include City column

  @O2C-HPS-TC-005 @DAEE-336 @regression @p1 @iacs-md
  Scenario: Excel hierarchy report includes Variant Code column
    Given I am on the Hierarchical Product Sales Report page
    When I generate the Hierarchical Product Sales report with this month
    And I export Hierarchical Product Sales to detailed Excel
    Then Hierarchy Report sheet should include Variant Code column with data
