Feature: O2C End-to-End Flow (Indent → Sales Order → Picklist → eInvoice → Dispatch → Dealer Ledger)
  As a dealer manager
  I want to run a full system-level flow from indent through warehouse picking, e-invoice, dispatch, and ledger
  So that we verify the complete O2C pipeline with fixed test data (ERP pick-to-invoice path)

  Background:
    Given I am logged in to the Application

  @O2C-E2E-TC-001 @o2c-flow @smoke @critical @p0 @iacs-tenant @iacs-md
  Scenario: Full E2E flow with Dealer IACS5509, Product 1013, Warehouse Kurnook, Transporter Just In Time Shipper
    # Phase A: DB note and Indent creation
    Given I have noted inventory for product "1013" at warehouse "Kurnook"
    And I have noted dealer credit for dealer code "IACS5509"
    Given I am on the O2C Indents page
    When I create an indent for dealer "Ramesh ningappa diggai"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    Then the indent should be saved successfully
    When I submit the indent
    Then the indent should be submitted successfully
    Then the Warehouse Selection card should be visible
    Then the Approve button should be disabled
    When I select warehouse "Kurnook Warehouse" for the indent
    Then the Approve button should be enabled
    When I select transporter "Just In Time Shipper" for the indent
    When I click Approve on the indent detail page
    And I fill approval comments "AUTO_QA E2E approval" and submit the approval dialog
    When I confirm the stock availability warning with Approve Anyway if it appears
    Then the indent should be approved successfully
    When I click Process Workflow
    Then the Process Workflow dialog should show SO and Back Order preview
    When I confirm and process the workflow
    Then the workflow should complete successfully

    # Phase B: SO verification
    When I navigate to the Sales Order created from the indent
    Then the Sales Order page shows dealer "Ramesh ningappa diggai"
    And the Sales Order page shows warehouse "Kurnool"
    And the Sales Order page shows source indent link
    And the Sales Order has allocated stock and net available is reduced by SO quantity
    And dealer credit is unchanged after SO creation

    # Phase C: Warehouse picklist → SO picked (DAEE-139) → eInvoice enabled
    When I generate picklist from the Sales Order page
    And I run the warehouse picklist flow picking all lines to completion
    When I generate E-Invoice with transporter "Just In Time Shipper" on the Sales Order page
    Then E-Invoice generation completes and invoice link appears on the Sales Order page
    And the Sales Order status is updated

    # Phase C2: Pack → Ready to Ship → Dispatch (DAEE-114 / DAEE-141)
    When I mark the Sales Order as packed from the detail page
    And I mark the Sales Order as ready to ship from the detail page
    When I dispatch the Sales Order entering transporter "Just In Time Shipper" with vehicle details deferred
    Then the Sales Order dispatch completes successfully

    # Phase D: Invoice page and PDF
    When I navigate to the Invoice from the Sales Order
    When I click Generate Custom E-Invoice PDF and download the PDF
    Then the downloaded PDF file exists and is non-empty

    # Phase E: Post-invoice DB and Dealer Ledger
    Then stock is reduced as per allocation
    And dealer credit is updated as per invoice totals
    When I navigate to Dealer Ledger and select dealer "IACS5509"
    Then the Dealer Ledger shows an invoice transaction

  @O2C-E2E-TC-002 @o2c-flow @regression @p1 @iacs-tenant @iacs-md
  Scenario: Mixed indent — DB-resolved OOS + in-stock at Kurnook → back order + SO → invoice (full pipeline)
    # Discover material codes: positive net at Kurnook vs no sellable stock (SQL + verify; fallback 1013/NPK; override via E2E_O2C_MIXED_* env)
    Given I have resolved an in-stock and an out-of-stock product at warehouse "Kurnook" for mixed SO and back order
    And I have noted inventory for the resolved in-stock product at warehouse "Kurnook"
    And I have noted dealer credit for dealer code "IACS5509"
    Given I am on the O2C Indents page
    When I create an indent for dealer "Ramesh ningappa diggai"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    When I add the resolved out-of-stock product to the indent
    And I add the resolved in-stock product to the indent
    And I save the indent
    Then the indent should be saved successfully
    When I submit the indent
    Then the indent should be submitted successfully
    Then the Warehouse Selection card should be visible
    Then the Approve button should be disabled
    When I select warehouse "Kurnook Warehouse" for the indent
    Then I should see a stock warning or Approve with Back Orders on the indent detail page
    Then the Approve button should be enabled
    When I select transporter "Just In Time Shipper" for the indent
    When I click Approve on the indent detail page
    And I fill approval comments "AUTO_QA mixed back order + SO E2E" and submit the approval dialog
    When I confirm the stock availability warning with Approve Anyway if it appears
    Then the indent should be approved successfully
    When I click Process Workflow
    Then the Process Workflow dialog should show SO and Back Order preview
    When I confirm and process the workflow
    Then the workflow should complete successfully
    Then a back order should exist in DB for the current indent
    When I am on the O2C Inventory page
    And I search inventory for the resolved out-of-stock product and filter warehouse "Kurnook"
    Then the inventory list shows no rows for the current search

    # SO covers in-stock lines only; picklist → e-invoice → dispatch → ledger (same as TC-001 tail)
    When I navigate to the Sales Order created from the indent
    Then the Sales Order page shows dealer "Ramesh ningappa diggai"
    And the Sales Order page shows warehouse "Kurnool"
    And the Sales Order page shows source indent link
    And the Sales Order has allocated stock and net available is reduced by SO quantity
    And dealer credit is unchanged after SO creation
    When I generate picklist from the Sales Order page
    And I run the warehouse picklist flow picking all lines to completion
    When I generate E-Invoice with transporter "Just In Time Shipper" on the Sales Order page
    Then E-Invoice generation completes and invoice link appears on the Sales Order page
    And the Sales Order status is updated
    When I mark the Sales Order as packed from the detail page
    And I mark the Sales Order as ready to ship from the detail page
    When I dispatch the Sales Order entering transporter "Just In Time Shipper" with vehicle details deferred
    Then the Sales Order dispatch completes successfully
    When I navigate to the Invoice from the Sales Order
    When I click Generate Custom E-Invoice PDF and download the PDF
    Then the downloaded PDF file exists and is non-empty
    Then stock is reduced as per allocation
    And dealer credit is updated as per invoice totals
    When I navigate to Dealer Ledger and select dealer "IACS5509"
    Then the Dealer Ledger shows an invoice transaction

  @O2C-E2E-TC-003 @o2c-flow @regression @p1 @iacs-tenant @iacs-md
  Scenario: Generate E-Invoice without E-Way bill (picklist path)
    Given I have noted inventory for product "1013" at warehouse "Kurnook"
    And I have noted dealer credit for dealer code "IACS5509"
    Given I am on the O2C Indents page
    When I create an indent for dealer "Ramesh ningappa diggai"
    Then I should be on the indent detail page
    When I click Edit on the indent detail page
    And I add a product by searching for "1013"
    And I save the indent
    Then the indent should be saved successfully
    When I submit the indent
    Then the indent should be submitted successfully
    Then the Warehouse Selection card should be visible
    When I select warehouse "Kurnook Warehouse" for the indent
    When I select transporter "Just In Time Shipper" for the indent
    When I click Approve on the indent detail page
    And I fill approval comments "AUTO_QA E2E e-invoice no eway" and submit the approval dialog
    Then the indent should be approved successfully
    When I click Process Workflow
    When I confirm and process the workflow
    Then the workflow should complete successfully
    When I navigate to the Sales Order created from the indent
    When I generate picklist from the Sales Order page
    And I run the warehouse picklist flow picking all lines to completion
    When I generate E-Invoice without E-Way bill on the Sales Order page
    Then E-Invoice generation completes and invoice link appears on the Sales Order page

  @O2C-E2E-TC-004 @o2c-flow @regression @p1 @iacs-tenant @iacs-md
  # Staging: IRN cancel requires no E-Way bill — DB picks invoices with empty eway_bill_number; else TC-003-style e-invoice-only create.
  Scenario: Cancel e-invoice within 24 hours (recent IRN without E-Way bill, or e-invoice-only O2C setup)
    When I open an invoice with IRN from the last 24 hours or complete O2C flow to generate one
    # Uses header **Cancel Invoice** (not E-Invoice card — DAEE-362); Post to GL first if required.
    When I cancel the e-invoice from the invoice detail using the default cancellation reason
    Then the invoice e-invoice status in the database should be "cancelled"
