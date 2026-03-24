Feature: Collection Report correctness and export parity
  As a Sales / Finance user
  I want Collection Report filters, KPIs, and exports to stay consistent
  So that I can trust reconciliation and daily reporting

  Background:
    Given I am logged in to the Application

  @O2C-CR-TC-001 @smoke @p0 @iacs-md
  Scenario: Quick period This Month sets From and To date correctly
    Given I am on the Collection Report page
    When I select collection quick period "This Month"
    Then the collection report From and To date should reflect current month range

  @O2C-CR-TC-002 @smoke @p0 @iacs-md
  Scenario: Collection efficiency KPI card is visible after loading report
    Given I am on the Collection Report page
    When I click Load Report in Collection Report
    Then I should see "Collections vs Outstanding %" in collection summary cards

  @O2C-CR-TC-003 @regression @p1 @iacs-md
  Scenario: Period totals should match summary total amount
    Given I am on the Collection Report page
    When I click Load Report in Collection Report
    Then sum of By Period amounts should approximately match summary total amount

  @O2C-CR-TC-005 @regression @p1 @iacs-md
  Scenario: Payment, region and dealer totals should match summary total amount
    Given I am on the Collection Report page
    When I click Load Report in Collection Report
    Then sum of By Payment Method, By Region and By Dealer amounts should approximately match summary total amount

  @O2C-CR-TC-004 @regression @p1 @iacs-md
  Scenario: Export Excel should include efficiency and comparison sections
    Given I am on the Collection Report page
    When I click Load Report in Collection Report
    And I export Collection Report to Excel
    Then the exported Collection Report workbook should include efficiency and comparison sections
