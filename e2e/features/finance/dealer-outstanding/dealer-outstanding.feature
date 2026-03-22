# Dealer Outstanding Report — `/finance/reports/dealer-outstanding` (DAE-281 / DAEE-120)
# IMPL: phased E2E FIN-DO-TC-001–041

Feature: Dealer Outstanding Report
  As a finance user I can review dealer gross and net outstanding
  So that collections and credits (CR, CM, CCN, VAN) are reflected correctly.

  Background:
    Given I am logged in to the Application

  # --- Phase 1: shell & navigation ---
  @FIN-DO-TC-001 @smoke @regression @p1 @iacs-md
  Scenario: Dealer Outstanding report page loads for authorized user
    Given I am on the dealer outstanding report page
    Then I should see the dealer outstanding report heading
    And I should see the dealer outstanding report subtitle
    And dealer outstanding report filters should be visible

  @FIN-DO-TC-002 @regression @p2 @iacs-md
  Scenario: Initial state prompts to load report when no data loaded
    Given I am on the dealer outstanding report page
    Then dealer outstanding should show initial empty data message

  @FIN-DO-TC-003 @regression @p2 @iacs-md
  Scenario: Load report completes with success feedback
    Given I am on the dealer outstanding report page
    When I load the dealer outstanding report
    Then I should see dealer outstanding load success toast
    And dealer outstanding should show summary or empty table after load

  @FIN-DO-TC-004 @regression @p2 @iacs-md
  Scenario: After load summary shows gross and net labels when totals exist
    Given I am on the dealer outstanding report page
    When I load the dealer outstanding report
    Then dealer outstanding should show Gross Outstanding summary label if totals loaded

  # --- Phase 2: filters & exports ---
  @FIN-DO-TC-005 @regression @p2 @iacs-md
  Scenario: Very high min outstanding filter yields zero dealers
    Given I am on the dealer outstanding report page
    When I set dealer outstanding min outstanding to "999999999999"
    And I load the dealer outstanding report
    Then I should see dealer outstanding load success toast
    And dealer outstanding CSV export should be disabled

  @FIN-DO-TC-006 @regression @p2 @iacs-md
  Scenario: Region filter dropdown lists All Regions option
    Given I am on the dealer outstanding report page
    When I open dealer outstanding region filter
    Then dealer outstanding should list All Regions in region dropdown

  @FIN-DO-TC-007 @regression @p2 @iacs-md
  Scenario: Export CSV shows success when report has dealer rows
    Given I am on the dealer outstanding report page
    When I load the dealer outstanding report
    And I export dealer outstanding CSV if data is available
    Then I should see dealer outstanding CSV export success toast if export ran

  @FIN-DO-TC-008 @regression @p2 @iacs-md
  Scenario: Export PDF shows success when report has dealer rows
    Given I am on the dealer outstanding report page
    When I load the dealer outstanding report
    And I export dealer outstanding PDF if data is available
    Then I should see dealer outstanding PDF export success toast if export ran

  # --- Phase 3: drill-down ---
  @FIN-DO-TC-010 @regression @p2 @iacs-md
  Scenario: Drill-down opens invoice details dialog with columns
    Given I am on the dealer outstanding report page
    When I load the dealer outstanding report
    And I open dealer outstanding drill-down for first dealer if rows exist
    Then dealer outstanding drill-down should show invoice table headers if dialog opened

  @FIN-DO-TC-011 @regression @p2 @iacs-md
  Scenario: Drill-down dialog can be closed
    Given I am on the dealer outstanding report page
    When I load the dealer outstanding report
    And I open dealer outstanding drill-down for first dealer if rows exist
    And I close dealer outstanding drill-down if open
    Then dealer outstanding drill-down dialog should be hidden

  # --- Phase 4: DB reconciliation (sandwich read-only) ---
  @FIN-DO-TC-020 @regression @p2 @iacs-md
  Scenario: First dealer gross outstanding matches sum of invoice balances
    Given I am on the dealer outstanding report page
    When I load the dealer outstanding report
    Then first dealer outstanding gross should match database for as of date if row exists

  @FIN-DO-TC-021 @regression @p2 @iacs-md
  Scenario: First drill-down invoice balance matches database
    Given I am on the dealer outstanding report page
    When I load the dealer outstanding report
    And I open dealer outstanding drill-down for first dealer if rows exist
    Then first drill-down invoice balance should match database if invoice row exists

  # --- Phase 5: net formula (UI) ---
  @FIN-DO-TC-030 @regression @p3 @iacs-md
  Scenario: First dealer net outstanding matches gross minus credit components on screen
    Given I am on the dealer outstanding report page
    When I load the dealer outstanding report
    Then first dealer net outstanding should match UI formula if dealer row exists

  @FIN-DO-TC-031 @regression @p3 @iacs-md
  Scenario: Unapplied Credits column header visible when dealer grid is shown
    Given I am on the dealer outstanding report page
    When I load the dealer outstanding report
    Then dealer outstanding table should show Unapplied Credits column header

  # --- Phase 6: RBAC ---
  @FIN-DO-TC-040 @negative @p2 @iacs-ed
  Scenario: User without invoice report access is denied dealer outstanding URL
    When I attempt to open dealer outstanding report as unauthorized user
    Then I should be denied access to dealer outstanding report
