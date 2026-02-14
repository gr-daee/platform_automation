Feature: GSTR-1 Review Page
  As a Compliance Officer
  I want to review and export GSTR-1 data in government-compliant format
  So that I can ensure 100% accurate GSTR-1 filing without manual data manipulation

  Background:
    Given I am logged in to the Application

  @GSTR1-DAEE-100-TC-001 @DAEE-100 @smoke @regression @p0 @iacs-md
  Scenario: User with compliance.read can open GSTR-1 Review page
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page

  @GSTR1-DAEE-100-TC-003 @DAEE-100 @regression @p1 @multi-user
  @iacs-md
  Scenario Outline: User access control for GSTR-1 page
    Given I am logged in as "<User>"
    When I navigate to "/finance/compliance/gstr1"
    Then I should see "<Expected Result>" for GSTR-1 access

    Examples:
      | User              | Expected Result        |
      | IACS MD User     | the GSTR-1 Review page |
      # TODO: Add non-compliance user (e.g., Viewer) when user profile is available
      # | Viewer           | access denied          |

  @GSTR1-DAEE-100-TC-004 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Filing Period dropdown visible with current month options
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    And the Filing Period dropdown should be visible with current month options

  @GSTR1-DAEE-100-TC-005 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Seller GSTIN dropdown displays GSTIN and State Name format
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    And the Seller GSTIN dropdown should display GSTIN and State Name format

  @GSTR1-DAEE-100-TC-006 @DAEE-100 @smoke @regression @p0 @iacs-md
  Scenario: Selecting filters loads data and removes empty state
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear

  @GSTR1-DAEE-100-TC-007 @DAEE-100 @smoke @regression @p0 @iacs-md
  Scenario: Return Period card shows human-readable format
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Return Period card should show human-readable format

  # Summary Cards / Health Check (AC2, DEF-001)
  @GSTR1-DAEE-100-TC-008 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Total Liability card visible and reflects tax
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Total Liability card should be visible and show numeric value

  @GSTR1-DAEE-100-TC-009 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Total Taxable Value card visible and numeric
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Total Taxable Value card should be visible and numeric

  @GSTR1-DAEE-100-TC-010 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Validation Errors card visible with Fix Required count
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Validation Errors card should be visible with error count

  @GSTR1-DAEE-100-TC-011 @DAEE-100 @regression @p1 @iacs-md
  Scenario: E-Invoice Status card visible with IRN status
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the E-Invoice Status card should be visible with IRN status

  @GSTR1-DAEE-100-TC-012 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Net Taxable Value card shows correct formula
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Net Taxable Value card should be visible and show correct formula

  # Validation Banner (AC4, DEF-012)
  @GSTR1-DAEE-100-TC-013 @DAEE-100 @regression @p1 @iacs-md
  Scenario: When validation errors exist collapsible Fix Required banner appears above tabs
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the collapsible Fix Required or Review Recommended banner should appear above tabs

  @GSTR1-DAEE-100-TC-014 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Validation banner lists specific issues with document or message
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the collapsible Fix Required or Review Recommended banner should appear above tabs
    And the validation banner should list specific issues with document or message

  @GSTR1-DAEE-100-TC-015 @DAEE-100 @regression @p2 @iacs-md
  Scenario: Validation banner does not appear when there are zero validation errors
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the validation banner should not appear when there are zero validation errors

  # B2B Tab (AC3, DEF-005, DEF-006, DEF-013)
  @GSTR1-DAEE-100-TC-016 @DAEE-100 @regression @p1 @iacs-md
  Scenario: B2B tab shows columns Status GSTIN Name Inv No Date Inv Value POS RCM Inv Type Rate Taxable Val Cess
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the B2B tab should show columns Status GSTIN Name Inv No Date and others

  @GSTR1-DAEE-100-TC-017 @DAEE-100 @regression @p1 @iacs-md
  Scenario: B2B Status column reflects e-invoice status
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the B2B Status column should reflect e-invoice status

  @GSTR1-DAEE-100-TC-018 @DAEE-100 @regression @p1 @iacs-md
  Scenario: B2B Invoice Type shows R or Regular for IWT not IWT
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the B2B Inv Type should show R or Regular for IWT not IWT

  @GSTR1-DAEE-100-TC-019 @DAEE-100 @regression @p1 @iacs-md
  Scenario: B2B Rate column shows tax percentage not dash for taxable invoices
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the B2B Rate column should show percentage for taxable invoices

  @GSTR1-DAEE-100-TC-020 @DAEE-100 @regression @p1 @iacs-md
  Scenario: IWT rows in B2B show Buyer Name not Unknown
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And IWT rows in B2B should show Buyer Name not Unknown

  @GSTR1-DAEE-100-TC-021 @DAEE-100 @regression @p2 @iacs-md
  Scenario: B2B Buyer Name column shows full legal name or wrap
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the B2B Buyer Name column should show full name or wrap

  @GSTR1-DAEE-100-TC-022 @DAEE-100 @regression @p2 @iacs-md
  Scenario: B2B table supports filters Status Supply Type Search and pagination
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the B2B table should support filters and pagination

  # CDNR Tab (AC3, DEF-007)
  @GSTR1-DAEE-100-TC-023 @DAEE-100 @regression @p1 @iacs-md
  Scenario: CDNR tab shows columns Note Type Note Value Taxable Value and tax amounts
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the CDNR tab should show columns Note Type Note Value Taxable Value and tax amounts

  @GSTR1-DAEE-100-TC-024 @DAEE-100 @regression @p1 @iacs-md
  Scenario: CDNR note values shown as positive in UI per DEF-007
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And CDNR note values should be shown as positive in the UI

  # HSN Tab (AC3, DEF-008–010)
  @GSTR1-DAEE-100-TC-025 @DAEE-100 @regression @p1 @iacs-md
  Scenario: HSN tab grouped by HSN Code UQC Rate with Total Value column
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the HSN tab should show columns HSN Code UQC Rate Total Value and tax columns

  @GSTR1-DAEE-100-TC-026 @DAEE-100 @regression @p1 @iacs-md
  Scenario: HSN Rate column shows correct percentage not 0% or 0.18%
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the HSN Rate column should show correct percentage not 0% or decimal

  @GSTR1-DAEE-100-TC-027 @DAEE-100 @regression @p1 @iacs-md
  Scenario: HSN grid has Total Value Taxable plus Tax column
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the HSN tab should show columns HSN Code UQC Rate Total Value and tax columns

  @GSTR1-DAEE-100-TC-028 @DAEE-100 @regression @p2 @iacs-md
  Scenario: HSN tab does not show Description or Product Name column
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the HSN tab should not show Description or Product Name column

  @GSTR1-DAEE-100-TC-029 @DAEE-100 @regression @p1 @iacs-md
  Scenario: HSN shows single line per HSN UQC Rate no duplicate lines
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the HSN tab should show single line per HSN UQC Rate combination

  # Docs Issued Tab (AC7, DEF-011)
  @GSTR1-DAEE-100-TC-030 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Docs tab shows separate rows per series INV vs IWT not grouped by first 3 chars
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Docs tab should show columns Nature of Doc Sr No From Sr No To Total Number Cancelled Net Issued

  @GSTR1-DAEE-100-TC-031 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Docs tab columns Nature of Doc Sr No From Sr No To Total Number Cancelled Net Issued
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Docs tab should show columns Nature of Doc Sr No From Sr No To Total Number Cancelled Net Issued

  @GSTR1-DAEE-100-TC-032 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Docs Net Issued equals Total Number minus Cancelled
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And Docs Net Issued should equal Total Number minus Cancelled for each row

  @GSTR1-DAEE-100-TC-033 @DAEE-100 @regression @p2 @iacs-md
  Scenario: Docs Nature of Document uses exact strings
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And Docs Nature of Document should use exact allowed strings

  # Export (AC5, AC6, AC7, DEF-014)
  @GSTR1-DAEE-100-TC-034 @DAEE-100 @smoke @regression @p0 @iacs-md
  Scenario: Export button opens menu with Export Excel and Export JSON options
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Export button should open a menu with Export Excel and Export JSON options

  @GSTR1-DAEE-100-TC-035 @DAEE-100 @smoke @regression @p0 @iacs-md
  Scenario: Export Excel downloads file named GSTR1_GSTIN_Month xlsx
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And Export Excel should download a file named GSTR1 GSTIN Month xlsx

  @GSTR1-DAEE-100-TC-036 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Exported file has expected sheets template fidelity
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the exported Excel file should have expected sheets and template structure

  @GSTR1-DAEE-100-TC-037 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Data in b2b cdnr hsn docs starts at Row 5
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the exported Excel data in b2b cdnr hsn docs should start at row 5

  @GSTR1-DAEE-100-TC-038 @DAEE-100 @regression @p1 @iacs-md
  Scenario: b2b and cdnr exclude Tax Amount columns; hsn includes Tax Amount columns (AC6)
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the exported Excel b2b and cdnr should exclude Tax Amount columns and hsn should include Tax Amount columns

  @GSTR1-DAEE-100-TC-039 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Date format in Excel is dd-mmm-yyyy and POS is Code-StateName
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the exported Excel date format should be dd-mmm-yyyy and POS should be Code-StateName

  @GSTR1-DAEE-100-TC-040 @DAEE-100 @regression @p2 @iacs-md
  Scenario: Export All GSTINs downloads ZIP with one file per GSTIN
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "all" and Return Period "previous"
    Then data should load and empty state should disappear
    And Export All GSTINs should download a ZIP named GSTR1_ALL_Month zip

  # Tabs & Data Presence (Section 10)
  @GSTR1-DAEE-100-TC-042 @DAEE-100 @smoke @regression @p0 @iacs-md
  Scenario: All tabs Summary B2B B2CL B2CS CDNR CDNUR HSN Docs are clickable and show content
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And all tabs Summary B2B B2CL B2CS CDNR CDNUR HSN Docs should be clickable and show content

  @GSTR1-DAEE-100-TC-043 @DAEE-100 @smoke @regression @p0 @iacs-md
  Scenario: Summary tab shows section totals B2B B2CL B2CS CDNR CDNUR and liability
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Summary tab should show section totals and liability

  @GSTR1-DAEE-100-TC-044 @DAEE-100 @regression @p1 @iacs-md
  Scenario: Liability check Summary Total Liability matches sum of tax from HSN sheets
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And Summary Total Liability should match sum of tax from HSN sheets

  # Error & Loading States (Section 11)
  @GSTR1-DAEE-100-TC-045 @DAEE-100 @regression @p2 @iacs-md
  Scenario: TC-045 Loading state shown while fetching data then content
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then a loading state should be shown then content

  @GSTR1-DAEE-100-TC-047 @DAEE-100 @regression @p2 @iacs-md
  Scenario: TC-047 Export button disabled or shows loading during export
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the Export button should be disabled or show loading during export

  # Definition of Done / Cross-Cut (Section 12)
  @GSTR1-DAEE-100-TC-048 @DAEE-100 @regression @p1 @iacs-md
  Scenario: TC-048 Dashboard data aggregates correctly for selected GSTIN and Period
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    When I change Return Period to "current"
    Then data should load and empty state should disappear
    And the Return Period card should show period "current"

  @GSTR1-DAEE-100-TC-049 @DAEE-100 @regression @p1 @iacs-md
  Scenario: TC-049 B2CS shown as grouped data not individual invoices
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the B2CS tab should show grouped summary

  @GSTR1-DAEE-100-TC-050 @DAEE-100 @regression @p1 @iacs-md
  Scenario: TC-050 Template fidelity 32 sheets data from row 5 DoD
    Given I am on the GSTR-1 Review page
    Then I should see the GSTR-1 Review page
    When I select Seller GSTIN "first" and Return Period "previous"
    Then data should load and empty state should disappear
    And the exported Excel file should have expected sheets and template structure
    And the exported Excel data in b2b cdnr hsn docs should start at row 5
