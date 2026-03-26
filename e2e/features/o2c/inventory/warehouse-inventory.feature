Feature: Warehouse Inventory (WH-INV)
  As an operations user
  I want the warehouse inventory shell to load with analytics, tabs, search rules, and refresh
  So that we can regression-test `/o2c/inventory` before a future move to `/warehouses/inventory`

  Background:
    Given I am logged in to the Application

  @WH-INV-TC-001 @smoke @regression @p1 @iacs-md
  Scenario: Warehouse inventory page shows heading and subtitle
    Given I am on the warehouse inventory page
    Then I should see warehouse inventory heading and subtitle

  @WH-INV-TC-002 @regression @p1 @iacs-md
  Scenario: Analytics summary cards show totals
    Given I am on the warehouse inventory page
    Then warehouse inventory analytics cards should be visible

  @WH-INV-TC-003 @regression @p1 @iacs-md
  Scenario: Inventory Items tab shows search and grid
    Given I am on the warehouse inventory page
    Then inventory items tab should show inventory grid

  @WH-INV-TC-004 @regression @p2 @iacs-md
  Scenario: Allocations tab shows allocation section
    Given I am on the warehouse inventory page
    When I open the warehouse inventory Allocations tab
    Then warehouse inventory allocations content should be visible

  @WH-INV-TC-005 @regression @p2 @iacs-md
  Scenario: Analytics tab shows dashboard or loading or empty state
    Given I am on the warehouse inventory page
    When I open the warehouse inventory Analytics tab
    Then warehouse inventory analytics tab content should be visible

  @WH-INV-TC-006 @regression @p3 @iacs-md
  Scenario: Settings tab shows Coming Soon
    Given I am on the warehouse inventory page
    When I open the warehouse inventory Settings tab
    Then warehouse inventory settings should show coming soon

  @WH-INV-TC-007 @regression @p2 @iacs-md
  Scenario: Search with fewer than three characters shows helper text
    Given I am on the warehouse inventory page
    When I type "ab" into warehouse inventory search
    Then warehouse inventory search should require three characters message

  @WH-INV-TC-008 @regression @p2 @iacs-md
  Scenario: Refresh completes and grid is ready
    Given I am on the warehouse inventory page
    When I refresh warehouse inventory list
    Then warehouse inventory grid should be ready

  # --- Phase 2: filters, search (3+), pagination, page size ---

  @WH-INV-TC-009 @regression @p2 @iacs-md
  Scenario: Status filter Low Stock applies
    Given I am on the warehouse inventory page
    When I select warehouse inventory status "Low Stock"
    Then warehouse inventory grid should be ready

  @WH-INV-TC-010 @regression @p2 @iacs-md
  Scenario: Warehouse filter Kurnook then reset to all warehouses
    Given I am on the warehouse inventory page
    When I select warehouse inventory warehouse matching "Kurnook"
    Then warehouse inventory grid should be ready
    When I reset warehouse inventory warehouse filter to all
    Then warehouse inventory grid should be ready

  @WH-INV-TC-011 @regression @p2 @iacs-md
  Scenario: Search with three characters shows query in results summary
    Given I am on the warehouse inventory page
    When I type "101" into warehouse inventory search
    Then warehouse inventory results summary should include search query "101"

  @WH-INV-TC-012 @regression @p2 @iacs-md
  Scenario: Single character search shows waiting line in results summary
    Given I am on the warehouse inventory page
    When I type "a" into warehouse inventory search
    Then warehouse inventory results summary should show waiting for search characters

  @WH-INV-TC-013 @regression @p2 @iacs-md
  Scenario: Next page updates pagination indicator
    Given I am on the warehouse inventory page
    When I go to the next warehouse inventory results page
    Then warehouse inventory pagination page index should be greater than 1

  @WH-INV-TC-014 @regression @p2 @iacs-md
  Scenario: Page size twenty-five per page updates control and footer range
    Given I am on the warehouse inventory page
    When I set warehouse inventory page size to "25 per page"
    Then warehouse inventory page size control should show "25 per page"
    And warehouse inventory footer end index should be at most 25

  @WH-INV-TC-015 @regression @p3 @iacs-md
  Scenario: Combined warehouse Kurnook and In Stock status filters apply
    Given I am on the warehouse inventory page
    When I select warehouse inventory warehouse matching "Kurnook"
    Then warehouse inventory grid should be ready
    When I select warehouse inventory status "In Stock"
    Then warehouse inventory grid should be ready
