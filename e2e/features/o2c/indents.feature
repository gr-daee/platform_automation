Feature: O2C Indent Management
  As a dealer manager
  I want to create and manage indents
  So that I can process dealer orders efficiently

  Background:
    Given I am logged in to the Application

  @O2C-INDENT-TC-001 @smoke @critical @iacs-tenant @iacs-md
  Scenario: Create Indent for dealer creates new indent and navigates to detail page
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page

  @O2C-INDENT-TC-002 @regression @iacs-tenant @iacs-md
  Scenario: Create Indent for dealer with existing draft navigates to that draft
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I go back to the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the same indent detail page as before

  @O2C-INDENT-TC-003 @regression @dealer-search @iacs-tenant @iacs-md
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

  @O2C-INDENT-TC-004 @regression @iacs-tenant @iacs-md
  Scenario: Edit indent add product by search and save
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    Then the indent should be saved successfully

  @O2C-INDENT-TC-005 @regression @iacs-tenant @iacs-md
  Scenario: Submit indent after adding product
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully

  @O2C-INDENT-TC-006 @regression @iacs-tenant @iacs-md
  Scenario: Back from indent detail returns to list
    Given I am on the O2C Indents page
    And the indents table has at least one row
    When I click the first indent row
    Then I should be on the indent detail page
    When I go back to the O2C Indents page from the indent detail
    Then the O2C Indents list page should be loaded

  # Dealer search: by code, non-existent dealer
  @O2C-INDENT-TC-007 @regression @dealer-search @iacs-tenant @iacs-md
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

  @O2C-INDENT-TC-008 @regression @dealer-search @iacs-tenant @iacs-md
  Scenario: Search non-existent dealer shows no matching dealers
    Given I am on the O2C Indents page
    When I click the Create Indent button
    Then I should see the "Select Dealer" modal
    When I search for dealer by name "AUTO_QA_NONEXISTENT_DEALER_999"
    Then the dealer list should show no matching dealers

  @O2C-INDENT-TC-009 @regression @iacs-tenant @iacs-md
  Scenario: Search non-existent product shows no matching products in Add Products modal
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I open Add Products and search for "AUTO_QA_NONEXISTENT_PRODUCT_999"
    Then the Add Products modal should show no matching products

  # Draft state: Submit disabled when no items (requires dealer with no existing draft)
  @O2C-INDENT-TC-010 @regression @iacs-tenant @iacs-md
  Scenario: Submit Indent button is disabled when indent has no items
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    Then the Submit Indent button should be disabled

  @O2C-INDENT-TC-011 @regression @iacs-tenant @iacs-md
  Scenario: Draft indent shows Edit and Submit Indent but not Approve or Process Workflow
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    Then the Edit button should be visible on the indent detail page
    And the Submit Indent button should be visible on the indent detail page
    And the Approve button should not be visible on the indent detail page
    And the Process Workflow button should not be visible on the indent detail page

  # Straight path: List → Create → Load → Multiple products → Submit → Warehouse → Approve → Process Workflow → SO created (consolidates former list/detail/product/approval scenarios)
  @O2C-INDENT-TC-012 @smoke @critical @regression @iacs-tenant @iacs-md
  Scenario: Full straight path from list to Sales Order creation
    Given I am on the O2C Indents page
    Then the O2C Indents list page should be loaded
    When I create an indent for dealer "Ramesh ningappa diggai"
    Then I should be on the indent detail page
    And the indent detail page should be loaded
    When I click Edit on the indent detail page
    And I open Add Products, select 2 product(s) and add them
    Then the indent should show at least 1 line item(s)
    When I set the quantity of the first line item to 2
    Then the indent total amount should be greater than zero
    And the indent total amount should match the sum of line items
    When I save the indent
    Then the indent should be saved successfully
    When I submit the indent
    Then the indent should be submitted successfully
    Then the Warehouse Selection card should be visible
    Then the Approve button should be disabled
    When I select the first warehouse for the indent
    Then the Approve button should be enabled
    And the Approve button should be visible on the indent detail page
    When I click Approve on the indent detail page
    And I fill approval comments "AUTO_QA Straight path approval" and submit the approval dialog
    Then the indent should be approved successfully
    Then the Process Workflow button should be visible on the indent detail page
    When I click Process Workflow
    Then the Process Workflow dialog should show SO and Back Order preview
    When I confirm and process the workflow
    Then the workflow should complete successfully

  @O2C-INDENT-TC-013 @regression @iacs-tenant @iacs-md
  Scenario: Reject button in approval dialog is disabled until comment is provided
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    When I select the first warehouse for the indent
    When I click Reject on the indent detail page
    Then the Reject button in the approval dialog should be disabled
    When I fill approval comments "AUTO_QA Rejected for testing" and submit the approval dialog
    Then the indent detail page should be loaded

  # Reject flow: full reject with comments and verify status → Rejected
  @O2C-INDENT-TC-014 @regression @iacs-tenant @iacs-md
  Scenario: Reject indent with required comments and verify status Rejected
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    When I select the first warehouse for the indent
    When I click Reject on the indent detail page
    Then the Reject button in the approval dialog should be disabled
    When I fill approval comments "AUTO_QA Rejected for testing" and submit the approval dialog
    Then the indent status should be Rejected

  # Approval blocked when dealer has due invoices beyond 90 days (test data: VAYUPUTRA AGENCIES)
  @O2C-INDENT-TC-015 @regression @iacs-tenant @iacs-md
  Scenario: Approval blocked when dealer has due invoices beyond 90 days
    Given I am on the O2C Indents page
    When I create an indent for dealer "VAYUPUTRA AGENCIES"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    When I select the first warehouse for the indent
    When I click Approve on the indent detail page
    And I submit the approval dialog
    Then approval should be blocked due to overdue invoices

  # Transporter: no default (select manually) — Test data: IACS3039 has no preferred_transporter
  @O2C-INDENT-TC-016 @regression @iacs-tenant @iacs-md
  Scenario: Select transporter when dealer has no default transporter
    Given I am on the O2C Indents page
    When I create an indent for dealer "IACS3039"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    Then the Transporter Selection card should be visible on the indent detail page
    When I select the first transporter for the indent
    Then the indent detail page should be loaded

  # Transporter: dealer with default — Test data: Ramesh ningappa diggai (Own Transport)
  @O2C-INDENT-TC-017 @regression @iacs-tenant @iacs-md
  Scenario: Dealer with default transporter shows pre-selected transporter
    Given I am on the O2C Indents page
    When I create an indent for dealer "Ramesh ningappa diggai"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    Then the Transporter Selection card should be visible on the indent detail page
    Then a transporter should be pre-selected on the indent detail page

  # Credit limit — Test data: IACS1650 (insufficient credit limit). Credit Status (Workflow) can take a while to load.
  # Full flow (future): Approve → Process Workflow → dialog shows Credit Check Failed + Dealer Credit Info → Confirm → SO on credit hold → SO page shows credit hold banner and Cancel Order.
  @O2C-INDENT-TC-018 @regression @iacs-tenant @iacs-md
  Scenario: Credit limit check shows Credit Warning when insufficient
    Given I am on the O2C Indents page
    When I create an indent for dealer "IACS1650"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    When I select the first warehouse for the indent
    Then I should see Credit Warning on the indent detail page

  # Stock warning — 1013 and 1041 are in stock at Kurnook; NPK is NOT in stock. Selecting Kurnook shows warning for NPK.
  @O2C-INDENT-TC-019 @regression @iacs-tenant @iacs-md
  Scenario: Stock warning shown when selected warehouse has insufficient stock
    Given I am on the O2C Indents page
    When I create an indent for dealer "Ramesh ningappa diggai"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I add a product by searching for "1041"
    And I add a product by searching for "NPK"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    When I select warehouse "Kurnook Warehouse" for the indent
    Then I should see a stock warning or Approve with Back Orders on the indent detail page

  # Process Workflow dialog: assert SO vs Back Order preview before Confirm
  @O2C-INDENT-TC-020 @regression @iacs-tenant @iacs-md
  Scenario: Process Workflow dialog shows SO and Back Order preview before Confirm
    Given I am on the O2C Indents page
    When I create an indent for dealer "Ramesh ningappa diggai"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    When I submit the indent
    Then the indent should be submitted successfully
    When I select the first warehouse for the indent
    When I click Approve on the indent detail page
    And I submit the approval dialog
    Then the indent should be approved successfully
    When I click Process Workflow
    Then the Process Workflow dialog should show SO and Back Order preview
    When I close the Process Workflow dialog
