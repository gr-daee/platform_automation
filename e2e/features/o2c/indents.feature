Feature: O2C Indent Management
  As a dealer manager
  I want to create and manage indents
  So that I can process dealer orders efficiently

  Background:
    Given I am logged in to the Application

  @O2C-INDENT-TC-001 @smoke @critical @iacs-tenant @iacs-md
  Scenario: O2C Indents list page loads with title, status cards, and table or empty state
    Given I am on the O2C Indents page
    Then the O2C Indents list page should be loaded

  @O2C-INDENT-TC-002 @smoke @critical @iacs-tenant @iacs-md
  Scenario: Create Indent for dealer creates new indent and navigates to detail page
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page

  @O2C-INDENT-TC-003 @regression @iacs-tenant @iacs-md
  Scenario: Create Indent for dealer with existing draft navigates to that draft
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I go back to the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the same indent detail page as before

  @O2C-INDENT-TC-004 @regression @iacs-tenant @iacs-md
  Scenario: Search indents by dealer name or indent number filters the list
    Given I am on the O2C Indents page
    When I type "VAYUPUTRA" in the indents search box
    Then the list should show filtered results or the empty state

  @O2C-INDENT-TC-005 @regression @iacs-tenant @iacs-md
  Scenario: Filter by Status shows only matching indents
    Given I am on the O2C Indents page
    When I filter by Status "Draft"
    Then the list should show filtered results or the empty state

  @O2C-INDENT-TC-006 @regression @iacs-tenant @iacs-md
  Scenario: Clear filters restores the full list
    Given I am on the O2C Indents page
    When I filter by Status "Draft"
    And I clear all filters
    Then the Clear filters button should not be visible

  @O2C-INDENT-TC-008 @regression @iacs-tenant @iacs-md
  Scenario: Clicking an indent row navigates to indent detail page
    Given I am on the O2C Indents page
    And the indents table has at least one row
    When I click the first indent row
    Then I should be on the indent detail page

  @O2C-INDENT-TC-023 @regression @iacs-tenant @iacs-md
  Scenario: When no indents match the filter the empty state is shown
    Given I am on the O2C Indents page
    When I filter by Status "Rejected"
    Then I should see the empty state for indents or at least one indent row

  @O2C-INDENT-TC-012 @regression @dealer-search @iacs-tenant @iacs-md
  Scenario: User searches and selects dealer from Create Indent modal
    Given I am on the O2C Indents page
    When I click the Create Indent button
    Then I should see the "Select Dealer" modal
    And the modal should display a list of active dealers
    And the modal should have a search input
    When I search for dealer by name "VAYUPUTRA AGENCIES"
    Then the dealer list should be filtered
    And I should see "VAYUPUTRA AGENCIES" in the results
    When I select the dealer "VAYUPUTRA AGENCIES"
    Then the modal should close
    And I should be on the indent creation page with dealer pre-selected

  # Indent detail: load, edit, add product, save, submit, back (Indent → SO flow - Phase 1)
  @O2C-INDENT-TC-024 @regression @iacs-tenant @iacs-md
  Scenario: Indent detail page loads with heading and Indent Information
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    And the indent detail page should be loaded

  @O2C-INDENT-TC-025 @regression @iacs-tenant @iacs-md
  Scenario: Edit indent add product by search and save
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "NPK"
    And I save the indent
    Then the indent should be saved successfully

  @O2C-INDENT-TC-026 @regression @iacs-tenant @iacs-md
  Scenario: Submit indent after adding product
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "NPK"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully

  @O2C-INDENT-TC-038 @regression @iacs-tenant @iacs-md
  Scenario: Back from indent detail returns to list
    Given I am on the O2C Indents page
    And the indents table has at least one row
    When I click the first indent row
    Then I should be on the indent detail page
    When I go back to the O2C Indents page from the indent detail
    Then the O2C Indents list page should be loaded

  # Dealer search: by code, non-existent dealer
  @O2C-INDENT-TC-039 @regression @dealer-search @iacs-tenant @iacs-md
  Scenario: User searches dealer by dealer code and selects
    Given I am on the O2C Indents page
    When I click the Create Indent button
    Then I should see the "Select Dealer" modal
    When I search for dealer by code "VAYU"
    Then the dealer list should be filtered
    And I should see "VAYUPUTRA" in the results
    When I select the dealer "VAYUPUTRA AGENCIES"
    Then the modal should close
    And I should be on the indent creation page with dealer pre-selected

  @O2C-INDENT-TC-040 @regression @dealer-search @iacs-tenant @iacs-md
  Scenario: Search non-existent dealer shows no matching dealers
    Given I am on the O2C Indents page
    When I click the Create Indent button
    Then I should see the "Select Dealer" modal
    When I search for dealer by name "AUTO_QA_NONEXISTENT_DEALER_999"
    Then the dealer list should show no matching dealers

  # Product search: by product code, non-existent product
  @O2C-INDENT-TC-041 @regression @iacs-tenant @iacs-md
  Scenario: Search product by product code shows results in Add Products modal
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I open Add Products and search for "NPK"
    Then the Add Products modal should show at least one product

  @O2C-INDENT-TC-042 @regression @iacs-tenant @iacs-md
  Scenario: Search non-existent product shows no matching products in Add Products modal
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I open Add Products and search for "AUTO_QA_NONEXISTENT_PRODUCT_999"
    Then the Add Products modal should show no matching products

  # Draft state: Submit disabled when no items; button visibility
  @O2C-INDENT-TC-030 @regression @iacs-tenant @iacs-md
  Scenario: Submit Indent button is disabled when indent has no items
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    Then the Submit Indent button should be disabled

  @O2C-INDENT-TC-035 @regression @iacs-tenant @iacs-md
  Scenario: Draft indent shows Edit and Submit Indent but not Approve or Process Workflow
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    Then the Edit button should be visible on the indent detail page
    And the Submit Indent button should be visible on the indent detail page
    And the Approve button should not be visible on the indent detail page
    And the Process Workflow button should not be visible on the indent detail page

  # Submitted state: Warehouse selection, Approve disabled until warehouse, Reject requires comment
  @O2C-INDENT-TC-027 @regression @iacs-tenant @iacs-md
  Scenario: Submitted indent shows Warehouse Selection and selecting warehouse enables Approve
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "NPK"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    Then the Warehouse Selection card should be visible
    Then the Approve button should be disabled
    When I select the first warehouse for the indent
    Then the Approve button should be enabled

  @O2C-INDENT-TC-031 @regression @iacs-tenant @iacs-md
  Scenario: Approve button is disabled when warehouse not selected on submitted indent
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "NPK"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    Then the Warehouse Selection card should be visible
    And the Approve button should be disabled

  @O2C-INDENT-TC-036 @regression @iacs-tenant @iacs-md
  Scenario: Submitted indent shows Warehouse Selection and Approve and Reject buttons
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "NPK"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    Then the Warehouse Selection card should be visible
    And the Approve button should be visible on the indent detail page
    And the Process Workflow button should not be visible on the indent detail page

  # Approval: Approve with optional comments, Reject with required comments
  @O2C-INDENT-TC-028 @regression @iacs-tenant @iacs-md
  Scenario: Approve indent with optional comments after selecting warehouse
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "NPK"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    When I select the first warehouse for the indent
    When I click Approve on the indent detail page
    And I submit the approval dialog
    Then the indent should be approved successfully

  @O2C-INDENT-TC-032 @regression @iacs-tenant @iacs-md
  Scenario: Reject button in approval dialog is disabled until comment is provided
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "NPK"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    When I select the first warehouse for the indent
    When I click Reject on the indent detail page
    Then the Reject button in the approval dialog should be disabled
    When I fill approval comments "AUTO_QA Rejected for testing" and submit the approval dialog
    Then the indent detail page should be loaded

  # Approved state: Process Workflow
  @O2C-INDENT-TC-037 @regression @iacs-tenant @iacs-md
  Scenario: Approved indent shows Process Workflow button
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "NPK"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    When I select the first warehouse for the indent
    When I click Approve on the indent detail page
    And I submit the approval dialog
    Then the indent should be approved successfully
    Then the Process Workflow button should be visible on the indent detail page

  @O2C-INDENT-TC-029 @regression @iacs-tenant @iacs-md
  Scenario: Process Workflow creates Sales Order or Back Order from approved indent
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "NPK"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    When I select the first warehouse for the indent
    When I click Approve on the indent detail page
    And I submit the approval dialog
    Then the indent should be approved successfully
    When I click Process Workflow
    And I confirm and process the workflow
    Then the workflow should complete successfully
