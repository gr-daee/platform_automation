# Dealer Ledger — IACS5509 / Ramesh ningappa diggai; cycles 1–3 (+ RBAC @iacs-ed for TC-008)

Feature: Dealer Ledger
  As a finance user I can open a dealer's ledger
  So that I can review invoices, payments, credits, and running balance.

  Background:
    Given I am logged in to the Application

  @FIN-DL-TC-001 @smoke @regression @p1 @iacs-md
  Scenario: Load dealer ledger by business name shows summary and transactions
    Given I am on the dealer ledger page
    When I select dealer by search text "Ramesh ningappa diggai"
    And I load dealer ledger
    Then dealer information should display business name "Ramesh ningappa diggai" and dealer code "IACS5509"
    And dealer ledger summary cards should be visible
    And dealer ledger transaction history table should be visible
    And dealer ledger should have at least one transaction row

  @FIN-DL-TC-002 @regression @p1 @iacs-md
  Scenario: Load dealer ledger by dealer code shows invoice transaction
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    Then dealer information should display business name "Ramesh ningappa diggai" and dealer code "IACS5509"
    And dealer ledger should show at least one invoice transaction

  @FIN-DL-TC-003 @negative @p2 @iacs-md
  Scenario: Load Ledger is disabled until a dealer is selected
    Given I am on the dealer ledger page
    Then Load Ledger button should be disabled

  @FIN-DL-TC-004 @regression @p2 @iacs-md
  Scenario: Load dealer ledger with explicit date range still returns transactions
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I set dealer ledger date range from "2020-01-01" to "2030-12-31"
    And I load dealer ledger
    Then dealer ledger should have at least one transaction row

  @FIN-DL-TC-005 @regression @p2 @iacs-md
  Scenario: Export dealer ledger CSV shows success toast with row count
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    And I export dealer ledger as CSV
    Then I should see dealer ledger CSV export success toast

  @FIN-DL-TC-006 @regression @p2 @iacs-md
  Scenario: Transaction type filter shows invoices only
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    And I filter dealer ledger transactions by type "Invoices"
    Then all visible dealer ledger data rows should show transaction type "Invoice"

  @FIN-DL-TC-007 @regression @p2 @iacs-md
  Scenario: Invoice document link navigates to O2C invoice detail
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    And I filter dealer ledger transactions by type "Invoices"
    And I open the first invoice document link from dealer ledger
    Then I should be on an O2C invoice detail page

  @FIN-DL-TC-008 @negative @p2 @iacs-ed
  Scenario: User without dealer ledger access is redirected from dealer ledger URL
    When I attempt to open dealer ledger as unauthorized user
    Then I should be denied access to dealer ledger

  @FIN-DL-TC-009 @regression @p2 @iacs-md
  Scenario: Export standard dealer ledger PDF shows success toast
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    And I export dealer ledger standard PDF
    Then I should see dealer ledger standard PDF export success toast

  @FIN-DL-TC-010 @regression @p2 @iacs-md
  Scenario: Export detailed invoice ledger PDF shows success toast
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    And I export dealer ledger detailed invoice PDF
    Then I should see dealer ledger detailed PDF export success toast

  @FIN-DL-TC-011 @regression @p2 @iacs-md
  Scenario: Search by document number narrows transaction rows
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    And I filter dealer ledger transactions by type "Invoices"
    And I search dealer ledger transactions with first row document number
    Then dealer ledger transaction table should show exactly one data row

  @FIN-DL-TC-012 @regression @p3 @iacs-md
  Scenario: Date column header toggles sort without breaking table
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    And I click dealer ledger date column header to toggle sort
    Then dealer ledger should have at least one transaction row

  @FIN-DL-TC-013 @regression @p2 @iacs-md
  Scenario: Payment document link navigates to O2C payment detail
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    And I filter dealer ledger transactions by type "Payments"
    And I open the first payment document link from dealer ledger
    Then I should be on an O2C payment detail page

  @FIN-DL-TC-014 @regression @p2 @iacs-md
  Scenario: Credit note document link navigates to credit memo detail
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    And I filter dealer ledger transactions by type "Credit Notes"
    And I open the first credit note document link from dealer ledger
    Then I should be on a credit memo detail page

  @FIN-DL-TC-015 @regression @p2 @iacs-md
  Scenario: AR aging analysis appears when outstanding aging data exists
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    Then dealer ledger AR aging analysis may be visible when data exists

  @FIN-DL-TC-016 @regression @p3 @iacs-md
  Scenario: VAN section appears when unallocated payment data exists
    Given I am on the dealer ledger page
    When I select dealer by search text "IACS5509"
    And I load dealer ledger
    Then dealer ledger VAN section may be visible when data exists
