@finance @journal-entries @sales-return-je @iacs-md
Feature: Sales return journal entry patterns
  As Finance and O2C
  I want sales returns to post correct contra revenue and credit memo GL

  Background:
    Given I am logged in to the Application

  @FIN-SR-TC-001 @critical @p0 @iacs-md
  Scenario: Sales return credit memo path reaches finance with GL linkage when posted
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
    Then sales return credit memo journal when posted has revenue debits or tax lines

  @FIN-SR-TC-002 @critical @p0 @iacs-md
  Scenario: Sales return CM may include tax related lines when GL posted
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
    Then sales return credit memo journal when posted has revenue debits or tax lines

  @FIN-SR-TC-003 @regression @p1 @iacs-md
  Scenario: Posted sales return credit memo JE is balanced when GL exists
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
    Then credit memo for sales return path uses dealer_management credit_note GL when posted
    Then credit memo GL journal is balanced

  @FIN-SR-TC-004 @regression @p1 @iacs-md
  Scenario: Sales return credit memo uses posting profile credit_note not legacy codes
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
    Then posted credit memo debit line is not legacy account codes "11116|4210"

  @FIN-SR-TC-005 @regression @p1 @iacs-md
  Scenario: Goods receipt increases inventory for sales return line
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

  @FIN-SR-TC-006 @regression @p2 @iacs-md
  Scenario: Partial quantity sales return proportional JE
    Then partial sales return GL amounts are proportional or scenario skipped

  @FIN-SR-TC-007 @regression @p2 @iacs-md
  Scenario: Second return for same invoice may be blocked
    Then creating sales return for fully returned invoice may be blocked
