Feature: O2C End-to-End Flow (Indent → Sales Order → eInvoice → Dealer Ledger)
  As a dealer manager
  I want to run a full system-level flow from indent to invoice and ledger
  So that we verify the complete O2C pipeline with fixed test data

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
    Then the indent should be approved successfully
    When I click Process Workflow
    Then the Process Workflow dialog should show SO and Back Order preview
    When I confirm and process the workflow
    Then the workflow should complete successfully

    # Phase B: SO verification
    When I navigate to the Sales Order created from the indent
    Then the Sales Order page shows dealer "Ramesh ningappa diggai"
    And the Sales Order page shows warehouse "Kurnook"
    And the Sales Order page shows source indent link
    And the Sales Order has allocated stock and net available is reduced by SO quantity
    And dealer credit is unchanged after SO creation

    # Phase C: eInvoice
    When I generate E-Invoice with transporter "Just In Time Shipper" on the Sales Order page
    Then E-Invoice generation completes and invoice link appears on the Sales Order page
    And the Sales Order status is updated

    # Phase D: Invoice page and PDF
    When I navigate to the Invoice from the Sales Order
    When I click Generate Custom E-Invoice PDF and download the PDF
    Then the downloaded PDF file exists and is non-empty

    # Phase E: Post-invoice DB and Dealer Ledger
    Then stock is reduced as per allocation
    And dealer credit is updated as per invoice totals
    When I navigate to Dealer Ledger and select dealer "IACS5509"
    Then the Dealer Ledger shows an invoice transaction
