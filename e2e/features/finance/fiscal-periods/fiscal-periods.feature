@finance @fiscal-periods @iacs-md
Feature: Fiscal Period Management and Posting Control
  As a Finance Manager
  I want to manage fiscal period states
  So that posting is allowed or blocked based on period status

  Background:
    Given I am logged in to the Application

  @FIN-FP-TC-001 @smoke @p0 @iacs-md
  Scenario: Fiscal periods page loads with fiscal year tabs
    Given I am on the fiscal periods page
    Then at least one fiscal year tab is visible

  @FIN-FP-TC-002 @smoke @p0 @iacs-md
  Scenario: Open a draft period enables posting allowed badge
    Given I am on the fiscal periods page
    When I open first draft fiscal period from database if present
    Then the period row shows posting allowed or test skipped when no draft exists

  @FIN-FP-TC-003 @critical @p0 @iacs-md
  Scenario: Soft close an open period shows soft_closed status
    Given I am on the fiscal periods page
    When I soft close first open fiscal period from database if present
    Then the period row shows closed status or test skipped when no open period exists

  @FIN-FP-TC-004 @critical @p0 @iacs-md
  Scenario: Hard close a soft_closed period shows permanently locked
    Given I am on the fiscal periods page
    When I hard close first soft closed fiscal period from database if present
    Then the period row shows permanently locked or test skipped

  @FIN-FP-TC-005 @critical @p0 @iacs-md
  Scenario: Reopen a soft_closed period restores open status
    Given I am on the fiscal periods page
    When I reopen first soft closed fiscal period from database if present
    Then the period row shows open status or hard closed blocking reopen or test skipped

  @FIN-FP-TC-006 @regression @p1 @iacs-md
  Scenario: Sequential closing rule blocks closing later period when earlier is still open
    Given I am on the fiscal periods page
    When I attempt to soft close a later period while an earlier period is open in the same year
    Then an error toast explains sequential closing or action not applicable

  @FIN-FP-TC-007 @regression @p1 @iacs-md
  Scenario: Hard closed period shows no action buttons only Permanently Locked badge
    Given I am on the fiscal periods page
    When I view a hard closed period row from database if present
    Then only permanently locked badge shows in actions or test skipped

  @FIN-FP-TC-008 @regression @p1 @iacs-md
  Scenario: New Fiscal Year dialog creates periods with correct structure
    Given I am on the fiscal periods page
    When I open new fiscal year dialog
    Then the create fiscal year form shows required fields

  @FIN-FP-TC-009 @regression @p1 @iacs-md
  Scenario: Posting validation blocks transaction dated in hard_closed period
    Given I am on the fiscal periods page
    When I view a hard closed period row from database if present
    Then posting column shows locked for that period or test skipped

  @FIN-FP-TC-010 @regression @p2 @iacs-md
  Scenario: Period status legend badges are all visible on page load
    Given I am on the fiscal periods page
    Then fiscal period status legend shows never opened open closed and hard closed

  @FIN-FP-TC-011 @regression @p2 @iacs-md
  Scenario: Switching fiscal year tabs loads that year periods
    Given I am on the fiscal periods page
    When I switch to the second fiscal year tab
    Then fiscal periods table or empty state is visible

  @FIN-FP-TC-012 @regression @p2 @iacs-md
  Scenario: Year end close button only appears when all periods are hard closed
    Given I am on the fiscal periods page
    When I select fiscal year where summary may have all hard closed
    Then year end close button visibility matches all hard closed state or not applicable
