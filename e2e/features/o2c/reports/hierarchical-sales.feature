Feature: Hierarchical Sales Report
  As a Sales / Finance user with sales_reports.read
  I want to view sales by State → Region → Territory → Dealer and export to Excel
  So that I can analyze performance by geography and share reports

  Background:
    Given I am logged in to the Application

  # 4.1 Access (documented only - not implemented)
  # @O2C-HSR-TC-001 @smoke @p0 @iacs-md
  # Scenario: User with sales_reports.read can open Hierarchical Sales Report page
  #   Given I am on the Hierarchical Sales Report page
  #   Then I should see the Hierarchical Sales Report page

  # @O2C-HSR-TC-002 @critical @p0 @multi-user - documented only
  # Scenario Outline: User without sales_reports.read is denied access
  #   Given I am logged in as "<User>"
  #   When I navigate to "/o2c/reports/hierarchical-sales"
  #   Then I should see "<Expected Result>" for Hierarchical Sales Report access

  @O2C-HSR-TC-003 @regression @p1 @iacs-md
  Scenario: Generate Report is disabled when From or To date is missing
    Given I am on the Hierarchical Sales Report page
    Then I should see the Hierarchical Sales Report page
    When I clear the From Date and To Date
    Then the Generate Report button should be disabled

  @O2C-HSR-TC-004 @regression @iacs-md
  Scenario: Quick period This Month sets From and To date to current month
    Given I am on the Hierarchical Sales Report page
    When I click quick period "This Month"
    Then the From Date and To Date should reflect current month range

  @O2C-HSR-TC-005 @regression @iacs-md
  Scenario: Quick period This Quarter sets correct quarter range
    Given I am on the Hierarchical Sales Report page
    When I click quick period "This Quarter"
    Then the From Date and To Date should reflect current quarter range

  @O2C-HSR-TC-006 @regression @iacs-md
  Scenario: Quick period This Year sets Jan 1 to today
    Given I am on the Hierarchical Sales Report page
    When I click quick period "This Year"
    Then the From Date and To Date should reflect year to date

  @O2C-HSR-TC-007 @regression @iacs-md
  Scenario: State GSTIN dropdown shows All states and state options
    Given I am on the Hierarchical Sales Report page
    Then the State GSTIN dropdown should be visible
    And the State dropdown should contain "All states" option

  # TC-010: Toast when Generate without dates - skipped: button is disabled when dates missing, so click never triggers toast
  # @O2C-HSR-TC-010 Scenario: Toast shown when Generate Report clicked without dates

  @O2C-HSR-TC-011 @smoke @p0 @iacs-md
  Scenario: Generate Report with valid date range loads report and summary cards
    Given I am on the Hierarchical Sales Report page
    When I set date range to a valid past period
    And I click Generate Report
    Then the report should load successfully
    And summary cards and Grand Total should be visible

  @O2C-HSR-TC-012 @regression @iacs-md
  Scenario: Loading state shows Generating on button during fetch
    Given I am on the Hierarchical Sales Report page
    When I set date range to a valid past period
    And I click Generate Report
    Then the Generate Report button should show "Generating" during load

  @O2C-HSR-TC-022 @regression @iacs-md
  Scenario: Export Excel is disabled when no report data
    Given I am on the Hierarchical Sales Report page
    Then the Export Excel button should be disabled or not visible when no report

  @O2C-HSR-TC-025 @regression @iacs-md
  Scenario: Initial load shows No Report Generated empty state
    Given I am on the Hierarchical Sales Report page
    Then I should see the empty state "No Report Generated"

  @O2C-HSR-TC-026 @regression @iacs-md
  Scenario: After Generate with no invoices shows No Sales Data Found
    Given I am on the Hierarchical Sales Report page
    When I set date range to a future period with no data
    And I click Generate Report
    Then I should see "No Sales Data Found" or report loads with zero dealers

  @O2C-HSR-TC-029 @regression @p1 @iacs-md
  Scenario: Exported By Dealer sheet includes City column and values
    Given I am on the Hierarchical Sales Report page
    When I set date range to a valid past period
    And I click Generate Report
    And I export Hierarchical Sales report to Excel
    Then the Hierarchical Sales By Dealer sheet should include City column
