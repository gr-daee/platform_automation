# AR Aging Report — `/finance/ar-aging` (phases 1–3, IMPL-040)

Feature: AR Aging Report
  As a finance user I can review AR aging
  So that I can analyze outstanding receivables by bucket and export reports.

  Background:
    Given I am logged in to the Application

  # --- Phase 1: shell & navigation ---
  @FIN-AR-TC-001 @smoke @regression @p1 @iacs-md
  Scenario: AR Aging report page loads for authorized user
    Given I am on the AR aging report page
    Then I should see the AR aging report heading
    And AR aging report should finish loading

  @FIN-AR-TC-002 @regression @p2 @iacs-md
  Scenario: Dealer summary shows table or empty receivables message
    Given I am on the AR aging report page
    Then AR aging dealer summary should show table or empty receivables message

  @FIN-AR-TC-003 @regression @p2 @iacs-md
  Scenario: User can switch Dealer Summary Invoice Detail and Snapshots tabs
    Given I am on the AR aging report page
    When I open the AR aging invoice detail tab
    Then I should see AR aging invoice detail tab content
    When I open the AR aging snapshots tab
    Then I should see AR aging snapshots tab content
    When I open the AR aging dealer summary tab
    Then AR aging dealer summary should show table or empty receivables message

  @FIN-AR-TC-004 @regression @p2 @iacs-md
  Scenario: Filters panel opens and closes from toolbar
    Given I am on the AR aging report page
    When I open AR aging filters panel from toolbar
    Then AR aging filter options panel should be visible
    When I close AR aging filters panel from toolbar
    Then AR aging filter options panel should be hidden

  # --- Phase 2: filters, search, exports ---
  @FIN-AR-TC-005 @regression @p2 @iacs-md
  Scenario: Due date aging basis shows not due column after apply filters
    Given I am on the AR aging report page
    When I open AR aging filters panel from toolbar
    And I set AR aging basis to due date
    And I apply AR aging filters
    Then AR aging dealer summary should show not due column for due date basis

  @FIN-AR-TC-006 @regression @p2 @iacs-md
  Scenario: Dealer search with no match shows empty search message
    Given I am on the AR aging report page
    When I search AR aging with text "___AUTO_QA_NO_DEALER_MATCH___"
    Then I should see no AR aging dealers matching search message

  @FIN-AR-TC-007 @regression @p2 @iacs-md
  Scenario: Export Excel shows success when receivables data exists
    Given I am on the AR aging report page
    When I export AR aging Excel if data is available
    Then I should see AR aging Excel export success toast if export ran

  @FIN-AR-TC-008 @regression @p2 @iacs-md
  Scenario: Export PDF shows success when receivables data exists
    Given I am on the AR aging report page
    When I export AR aging PDF if data is available
    Then I should see AR aging PDF export success toast if export ran

  # --- Phase 3: RBAC, redirect, snapshots ---
  @FIN-AR-TC-009 @negative @p2 @iacs-ed
  Scenario: User without AR aging module access is redirected from report URL
    When I attempt to open AR aging report as unauthorized user
    Then I should be denied access to AR aging report

  @FIN-AR-TC-010 @regression @p2 @iacs-md
  Scenario: Legacy finance reports AR aging URL redirects to canonical page
    Given I am on the AR aging report page via legacy reports path
    Then I should be on the canonical AR aging report URL

  @FIN-AR-TC-011 @regression @p2 @iacs-md
  Scenario: Snapshots tab shows heading or empty snapshots state
    Given I am on the AR aging report page
    When I open the AR aging snapshots tab
    Then I should see AR aging snapshots tab content

  @FIN-AR-TC-012 @regression @p2 @iacs-md
  Scenario: Generate Snapshot dialog opens and cancels without error
    Given I am on the AR aging report page
    When I open the AR aging snapshots tab
    And I open AR aging generate snapshot dialog
    Then AR aging generate snapshot dialog should be visible
    When I cancel AR aging generate snapshot dialog
    Then AR aging generate snapshot dialog should be hidden
