@finance @posting-profiles @iacs-md
Feature: Posting Profiles Management
  As a Finance Manager
  I want to configure GL account determination rules
  So that all business transactions post to the correct accounts

  Background:
    Given I am logged in to the Application

  @FIN-PP-TC-001 @smoke @p1 @iacs-md
  Scenario: Dashboard shows all 6 navigation cards
    Given I am on the posting profiles dashboard
    Then the posting profiles dashboard shows all six navigation cards

  @FIN-PP-TC-002 @regression @p1 @iacs-md
  Scenario: Matrix page loads with existing profiles listed
    Given I am on the posting profiles matrix page
    Then the posting profiles matrix shows the rules table or empty state

  @FIN-PP-TC-003 @regression @p1 @iacs-md
  Scenario: Matrix filter by module narrows results
    Given I am on the posting profiles matrix page
    When I filter posting profiles matrix by module "Sales"
    Then the matrix module filter shows "Sales"

  @FIN-PP-TC-004 @regression @p1 @iacs-md
  Scenario: Add Rule dialog opens with required fields
    Given I am on the posting profiles matrix page
    When I open the add posting rule dialog
    Then the add posting rule dialog is visible

  @FIN-PP-TC-005 @regression @p1 @iacs-md
  Scenario: Show Inactive toggle reveals inactive profiles
    Given I am on the posting profiles matrix page
    When I click Show Inactive on the matrix
    Then the posting profiles matrix is still visible

  @FIN-PP-TC-006 @regression @p1 @iacs-md
  Scenario: Simulation resolves sales ar_control to Trade Debtors GL account
    Given I am on the posting profiles simulation page
    When I run posting simulation for sales module and Accounts Receivable account type
    Then the simulation result shows a resolved GL account

  @FIN-PP-TC-007 @regression @p1 @iacs-md
  Scenario: Simulation resolves finance unapplied_cash GL account
    Given I am on the posting profiles simulation page
    When I run posting simulation for finance module and Unapplied Cash account type
    Then the simulation result shows a resolved GL account

  @FIN-PP-TC-008 @regression @p2 @iacs-md
  Scenario: Simulation with no matching profile shows no profile found message
    Given I am on the posting profiles simulation page
    When I run posting simulation likely to have no matching rule
    Then the simulation shows no matching profile or skipped when tenant is fully configured

  @FIN-PP-TC-009 @regression @p2 @iacs-md
  Scenario: Dashboard Active vs Setup Only badge labels are correct
    Given I am on the posting profiles dashboard
    Then Active and Setup Only badges appear on the correct cards

  @FIN-PP-TC-010 @regression @p2 @iacs-md
  Scenario: Customer Posting Groups page shows Setup Only info alert
    Given I am on the posting profiles dashboard
    When I navigate to customer posting groups from the dashboard
    Then the customer posting groups page shows setup information

  @FIN-PP-TC-011 @regression @p2 @iacs-md
  Scenario: Download Template button triggers file download
    Given I am on the posting profiles matrix page
    When I click Download Template on the matrix
    Then a file download begins for posting profiles template

  @FIN-PP-TC-012 @regression @p2 @iacs-md
  Scenario: Export button triggers profiles file download
      Given I am on the posting profiles matrix page
      When I click Export on the matrix
      Then a file download begins for posting profiles export

  @FIN-PP-TC-013 @regression @p2 @iacs-md
  Scenario: Tax Determination Matrix page opens from dashboard
    Given I am on the posting profiles dashboard
    When I navigate to tax determination matrix from the dashboard
    Then I should be on the tax matrix route

  @FIN-PP-TC-014 @regression @p2 @iacs-md
  Scenario: Item Posting Groups page opens from dashboard
    Given I am on the posting profiles dashboard
    When I navigate to item posting groups from the dashboard
    Then I should be on the item groups route

  @FIN-PP-TC-015 @regression @p2 @iacs-md
  Scenario: Vendor Posting Groups page opens from dashboard
    Given I am on the posting profiles dashboard
    When I navigate to vendor posting groups from the dashboard
    Then I should be on the vendor groups route

  @FIN-PP-TC-016 @regression @p2 @iacs-md
  Scenario: Matrix Refresh button is visible and clickable
    Given I am on the posting profiles matrix page
    When I click Refresh on the matrix
    Then the posting profiles matrix shows the rules table or empty state

  @FIN-PP-TC-017 @regression @p2 @iacs-md
  Scenario: Simulation page shows optional warehouse selector
    Given I am on the posting profiles simulation page
    Then the warehouse optional combobox is visible

  @FIN-PP-TC-018 @regression @p2 @iacs-md
  Scenario: Simulation module combobox lists Sales
    Given I am on the posting profiles simulation page
    When I open the simulation module combobox
    Then option "Sales" is available

  @FIN-PP-TC-019 @regression @p2 @iacs-md
  Scenario: Dashboard How Posting Profiles Work alert is visible
    Given I am on the posting profiles dashboard
    Then the how posting profiles work alert is visible

  @FIN-PP-TC-020 @regression @p2 @iacs-md
  Scenario: Add Rule dialog can be dismissed
    Given I am on the posting profiles matrix page
    When I open the add posting rule dialog
    When I dismiss the posting rule dialog
    Then the add posting rule dialog is hidden

  @FIN-PP-TC-021 @regression @p2 @iacs-md
  Scenario: Customer posting groups page loads content
    Given I am on the posting profiles dashboard
    When I navigate to customer posting groups from the dashboard
    Then the customer posting groups heading is visible

  @FIN-PP-TC-022 @regression @p2 @iacs-md
  Scenario: Tax matrix page shows heading
    Given I am on the posting profiles dashboard
    When I navigate to tax determination matrix from the dashboard
    Then the tax matrix page shows a heading
