Feature: Sales Returns (Phases 1-7 consolidated)
  As an O2C user
  I want Sales Returns list, create, detail, validation, and report flows covered together
  So that one feature file captures the full automation scope for this module slice

  Background:
    Given I am logged in to the Application

  # --- Phase 1: list shell ---
  @SR-PH1-TC-001 @sales-returns @SR-PH1 @smoke @regression @p1 @iacs-md
  Scenario: Sales Returns page shows heading and description
    Given I am on the Sales Returns list page
    Then the Sales Returns page shows heading and description

  @SR-PH1-TC-002 @sales-returns @SR-PH1 @regression @p1 @iacs-md
  Scenario: Create Return Order navigates to new return wizard
    Given I am on the Sales Returns list page
    When I click Create Return Order on the Sales Returns page
    Then I should be on the create sales return page

  @SR-PH1-TC-003 @sales-returns @SR-PH1 @regression @p1 @iacs-md
  Scenario: Sales Returns statistics cards are visible
    Given I am on the Sales Returns list page
    Then the Sales Returns statistics cards are visible

  @SR-PH1-TC-004 @sales-returns @SR-PH1 @regression @p1 @iacs-md
  Scenario: Sales Returns list shows table or empty state without error
    Given I am on the Sales Returns list page
    Then the Sales Returns list shows table or empty state without error

  @SR-PH1-TC-005 @sales-returns @SR-PH1 @regression @p2 @iacs-md
  Scenario: Sales Returns breadcrumb shows Order to Cash and current page
    Given I am on the Sales Returns list page
    Then the Sales Returns breadcrumb shows Order to Cash and current Sales Returns

  # --- Phase 2: filters, search, pagination ---
  @SR-PH2-TC-001 @sales-returns @SR-PH2 @regression @p2 @iacs-md
  Scenario: Sales Returns status filter Pending applies
    Given I am on the Sales Returns list page
    When I apply Sales Returns status filter "Pending"
    Then Sales Returns status filter should show "Pending"
    And Sales Returns table rows should all have status "Pending" or list is empty for filter

  @SR-PH2-TC-002 @sales-returns @SR-PH2 @regression @p2 @iacs-md
  Scenario: Sales Returns return reason filter Defective applies
    Given I am on the Sales Returns list page
    When I apply Sales Returns return reason filter "Defective"
    Then Sales Returns return reason filter should show "Defective"
    And Sales Returns table rows should all have reason "Defective" or list is empty for filter

  @SR-PH2-TC-003 @sales-returns @SR-PH2 @regression @p2 @iacs-md
  Scenario: Sales Returns search finds return order by substring from database
    Given I am on the Sales Returns list page
    When I search Sales Returns list by return order substring from database
    Then Sales Returns list should show link for context return order number

  @SR-PH2-TC-004 @sales-returns @SR-PH2 @regression @p2 @iacs-md
  Scenario: Sales Returns clear filters resets search and status filter
    Given I am on the Sales Returns list page
    When I apply Sales Returns status filter "Pending"
    And I fill Sales Returns list search with "zzzz_no_match_sr_ph2_clear"
    And I click Sales Returns toolbar clear filters
    Then Sales Returns list search input should be empty
    And Sales Returns toolbar clear filters button should be hidden
    And Sales Returns status filter should not include label "Pending"

  @SR-PH2-TC-005 @sales-returns @SR-PH2 @regression @p3 @iacs-md
  Scenario: Sales Returns pagination page 2 when more than one page
    Given I am on the Sales Returns list page
    When I open Sales Returns list page 2 if multiple pages exist
    Then Sales Returns pagination showing-from should be at least 21

  # --- Phase 3: create wizard ---
  @SR-PH3-TC-001 @SR-PH3-TC-002 @SR-PH3-TC-003 @SR-PH3-TC-004 @SR-PH3 @sales-returns @regression @p1 @iacs-md
  Scenario: Create sales return order full happy path
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    And I set return quantity 1 on first line on sales return create page
    And I go to review step on sales return create page
    And I submit sales return create order
    Then I should be on sales return detail with Pending Receipt status
    And sales return order status in database should be pending

  # --- Phase 4: detail + goods receipt ---
  @SR-PH4-TC-001 @SR-PH4-TC-002 @SR-PH4-TC-003 @SR-PH4 @sales-returns @regression @p1 @iacs-md
  Scenario: Pending return shows receipt actions then record receipt to received
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    And I set return quantity 1 on first line on sales return create page
    And I go to review step on sales return create page
    And I submit sales return create order
    Then I should be on sales return detail with Pending Receipt status
    And sales return detail should show Record Goods Receipt and Cancel Return Order actions
    When I complete record goods receipt on sales return detail with default warehouse
    Then I should be on sales return detail with Goods Received status
    And sales return detail should not show Cancel Return Order action
    And sales return order status in database should be received

  @SR-PH4-TC-004 @SR-PH4 @sales-returns @regression @p1 @iacs-md
  Scenario: Goods receipt increases inventory available by returned quantity verified in database
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    And I set return quantity 1 on first line on sales return create page
    And I go to review step on sales return create page
    And I submit sales return create order
    Then I should be on sales return detail with Pending Receipt status
    When sales return first line inventory available sum is stored from database before goods receipt
    And I complete record goods receipt on sales return detail with QC passed and default warehouse
    Then I should be on sales return detail with Goods Received status
    And database inventory available sum should increase by first line return quantity after goods receipt

  # --- Phase 5: credit memo / e-credit note ---
  @SR-PH5-TC-001 @SR-PH5-TC-002 @SR-PH5 @sales-returns @regression @p1 @iacs-md
  Scenario: Credit memo from return after receipt when applicable
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    And I set return quantity 1 on first line on sales return create page
    And I go to review step on sales return create page
    And I submit sales return create order
    Then I should be on sales return detail with Pending Receipt status
    When I complete record goods receipt on sales return detail with default warehouse
    Then I should be on sales return detail with Goods Received status
    When I complete credit memo flow from sales return detail when applicable
    Then credit memo outcome should be visible on return or finance page

  @SR-PH5-TC-003 @SR-PH5 @sales-returns @regression @p2 @iacs-md
  Scenario: Retry E-Credit Note shell when credit memo has pending e-credit
    Given a sales return with pending e-credit is resolved from database
    When I open sales return detail for pending e-credit context
    Then Retry E-Credit Note button and dialog shell should be visible

  # --- Phase 6: validation + cancel ---
  @SR-PH6-TC-003 @SR-PH6 @sales-returns @regression @p2 @iacs-md
  Scenario: Review blocked when no return lines are selected
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    When I attempt review on sales return create page with zero items selected
    Then I should remain on sales return create step 2

  @SR-PH6-TC-004 @SR-PH6 @sales-returns @regression @p2 @iacs-md
  Scenario: Return quantity cannot exceed available on line
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    When I attempt return quantity above available on first line on sales return create page
    Then I should remain on sales return create step 2

  @SR-PH6-TC-001 @SR-PH6-TC-002 @SR-PH6 @sales-returns @regression @p2 @iacs-md
  Scenario: Cancel pending return requires reason before confirm
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    And I set return quantity 1 on first line on sales return create page
    And I go to review step on sales return create page
    And I submit sales return create order
    Then I should be on sales return detail with Pending Receipt status
    When I open cancel return order dialog on sales return detail
    Then cancel return confirm should be disabled when reason is empty
    When I dismiss cancel return order dialog
    When I open cancel return order dialog on sales return detail
    And I confirm cancel return order with AUTO_QA reason
    Then I should be on sales return detail with Cancelled status

  # --- Phase 7: report access ---
  @SR-PH7-TC-001 @SR-PH7 @sales-returns @regression @p2 @iacs-md
  Scenario: Sales Return Order report page loads for authorized user
    When I open the Sales Return Order report page
    Then Sales Return Order report shell should be visible

  @SR-PH7-TC-002 @SR-PH7 @sales-returns @regression @p2 @iacs-ed @multi-user
  Scenario: Sales Return Order report access denied for ED when sales_orders read is absent
    When I navigate to Sales Return Order report URL for access check
    Then I should be denied access to Sales Return Order report or skip if tenant grants access

  # --- Phase 8: inventory invariants ---
  @SR-PH8-TC-001 @SR-PH8 @sales-returns @regression @p1 @iacs-md
  Scenario: QC failed goods receipt does not change inventory available
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    And I set return quantity 1 on first line on sales return create page
    And I go to review step on sales return create page
    And I submit sales return create order
    Then I should be on sales return detail with Pending Receipt status
    When sales return first line inventory available sum is stored from database before goods receipt
    And I complete record goods receipt on sales return detail with QC failed and default warehouse
    Then sales return receipt QC status should be failed in database
    Then database inventory available sum should remain unchanged after QC failed goods receipt

  @SR-PH8-TC-002 @SR-PH8 @sales-returns @regression @p1 @iacs-md
  Scenario: Cancelling pending return before GRN does not change inventory available
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    And I set return quantity 1 on first line on sales return create page
    And I go to review step on sales return create page
    And I submit sales return create order
    Then I should be on sales return detail with Pending Receipt status
    When sales return first line inventory available sum is stored from database before goods receipt
    When I open cancel return order dialog on sales return detail
    And I confirm cancel return order with AUTO_QA reason
    Then I should be on sales return detail with Cancelled status
    And database inventory available sum should remain unchanged after cancelling pending return

  @SR-PH8-TC-003 @SR-PH8 @sales-returns @regression @p1 @iacs-md
  Scenario: Credit memo flow does not cause additional inventory movement after goods receipt
    Given sales return eligible invoice is resolved from database
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    And I set return quantity 1 on first line on sales return create page
    And I go to review step on sales return create page
    And I submit sales return create order
    Then I should be on sales return detail with Pending Receipt status
    When sales return first line inventory available sum is stored from database before goods receipt
    And I complete record goods receipt on sales return detail with QC passed and default warehouse
    Then database inventory available sum should increase by first line return quantity after goods receipt
    When I store post-receipt inventory available baseline for sales return first line
    And I complete credit memo flow from sales return detail when applicable
    Then credit memo outcome should be visible on return or finance page
    And database inventory available sum should remain unchanged after credit memo flow

  @SR-PH8-TC-004 @SR-PH8 @sales-returns @regression @p1 @iacs-md
  Scenario: Multi-line goods receipt reconciles inventory increase across all return lines
    Given sales return multi-line eligible invoice is resolved from database or created as fallback
    And I am on the create sales return order page
    When I select context invoice in sales return create dialog
    Then sales return create page should show context dealer on dealer trigger
    When I choose return reason Customer Request on sales return create page
    And I enter sales return notes with AUTO_QA prefix
    And I load invoice items on sales return create page
    And I set return quantity 1 on at least two eligible lines on sales return create page or skip
    And I go to review step on sales return create page
    And I submit sales return create order
    Then I should be on sales return detail with Pending Receipt status
    When sales return multi-line inventory available sums are stored from database before goods receipt
    And I complete record goods receipt on sales return detail with QC passed and default warehouse
    Then database inventory available sums should increase by return quantities across all selected return lines
