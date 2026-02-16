/** Generated from: e2e/features/finance/compliance/gstr1.feature */
import { test } from "playwright-bdd";

test.describe("GSTR-1 Review Page", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("User with compliance.read can open GSTR-1 Review page", { tag: ["@GSTR1-DAEE-100-TC-001", "@DAEE-100", "@smoke", "@regression", "@p0", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
  });

  test.describe("User access control for GSTR-1 page", () => {

    test("Example #1", { tag: ["@GSTR1-DAEE-100-TC-003", "@DAEE-100", "@regression", "@p1", "@multi-user", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
      await Given("I am logged in as \"IACS MD User\"", null, { page });
      await When("I navigate to \"/finance/compliance/gstr1\"", null, { page });
      await Then("I should see \"the GSTR-1 Review page\" for GSTR-1 access", null, { page });
    });

  });

  test("Filing Period dropdown visible with current month options", { tag: ["@GSTR1-DAEE-100-TC-004", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await And("the Filing Period dropdown should be visible with current month options", null, { page });
  });

  test("Seller GSTIN dropdown displays GSTIN and State Name format", { tag: ["@GSTR1-DAEE-100-TC-005", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await And("the Seller GSTIN dropdown should display GSTIN and State Name format", null, { page });
  });

  test("Selecting filters loads data and removes empty state", { tag: ["@GSTR1-DAEE-100-TC-006", "@DAEE-100", "@smoke", "@regression", "@p0", "@iacs-md"] }, async ({ Given, page, Then, When }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
  });

  test("Return Period card shows human-readable format", { tag: ["@GSTR1-DAEE-100-TC-007", "@DAEE-100", "@smoke", "@regression", "@p0", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Return Period card should show human-readable format", null, { page });
  });

  test("Total Liability card visible and reflects tax", { tag: ["@GSTR1-DAEE-100-TC-008", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Total Liability card should be visible and show numeric value", null, { page });
  });

  test("Total Taxable Value card visible and numeric", { tag: ["@GSTR1-DAEE-100-TC-009", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Total Taxable Value card should be visible and numeric", null, { page });
  });

  test("Validation Errors card visible with Fix Required count", { tag: ["@GSTR1-DAEE-100-TC-010", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Validation Errors card should be visible with error count", null, { page });
  });

  test("E-Invoice Status card visible with IRN status", { tag: ["@GSTR1-DAEE-100-TC-011", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the E-Invoice Status card should be visible with IRN status", null, { page });
  });

  test("Net Taxable Value card shows correct formula", { tag: ["@GSTR1-DAEE-100-TC-012", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Net Taxable Value card should be visible and show correct formula", null, { page });
  });

  test("When validation errors exist collapsible Fix Required banner appears above tabs", { tag: ["@GSTR1-DAEE-100-TC-013", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the collapsible Fix Required or Review Recommended banner should appear above tabs", null, { page });
  });

  test("Validation banner lists specific issues with document or message", { tag: ["@GSTR1-DAEE-100-TC-014", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the collapsible Fix Required or Review Recommended banner should appear above tabs", null, { page });
    await And("the validation banner should list specific issues with document or message", null, { page });
  });

  test("Validation banner does not appear when there are zero validation errors", { tag: ["@GSTR1-DAEE-100-TC-015", "@DAEE-100", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the validation banner should not appear when there are zero validation errors", null, { page });
  });

  test("B2B tab shows columns Status GSTIN Name Inv No Date Inv Value POS RCM Inv Type Rate Taxable Val Cess", { tag: ["@GSTR1-DAEE-100-TC-016", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the B2B tab should show columns Status GSTIN Name Inv No Date and others", null, { page });
  });

  test("B2B Status column reflects e-invoice status", { tag: ["@GSTR1-DAEE-100-TC-017", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the B2B Status column should reflect e-invoice status", null, { page });
  });

  test("B2B Invoice Type shows R or Regular for IWT not IWT", { tag: ["@GSTR1-DAEE-100-TC-018", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the B2B Inv Type should show R or Regular for IWT not IWT", null, { page });
  });

  test("B2B Rate column shows tax percentage not dash for taxable invoices", { tag: ["@GSTR1-DAEE-100-TC-019", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the B2B Rate column should show percentage for taxable invoices", null, { page });
  });

  test("IWT rows in B2B show Buyer Name not Unknown", { tag: ["@GSTR1-DAEE-100-TC-020", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("IWT rows in B2B should show Buyer Name not Unknown", null, { page });
  });

  test("B2B Buyer Name column shows full legal name or wrap", { tag: ["@GSTR1-DAEE-100-TC-021", "@DAEE-100", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the B2B Buyer Name column should show full name or wrap", null, { page });
  });

  test("B2B table supports filters Status Supply Type Search and pagination", { tag: ["@GSTR1-DAEE-100-TC-022", "@DAEE-100", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the B2B table should support filters and pagination", null, { page });
  });

  test("CDNR tab shows columns Note Type Note Value Taxable Value and tax amounts", { tag: ["@GSTR1-DAEE-100-TC-023", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the CDNR tab should show columns Note Type Note Value Taxable Value and tax amounts", null, { page });
  });

  test("CDNR note values shown as positive in UI per DEF-007", { tag: ["@GSTR1-DAEE-100-TC-024", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("CDNR note values should be shown as positive in the UI", null, { page });
  });

  test("HSN tab grouped by HSN Code UQC Rate with Total Value column", { tag: ["@GSTR1-DAEE-100-TC-025", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the HSN tab should show columns HSN Code UQC Rate Total Value and tax columns", null, { page });
  });

  test("HSN Rate column shows correct percentage not 0% or 0.18%", { tag: ["@GSTR1-DAEE-100-TC-026", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the HSN Rate column should show correct percentage not 0% or decimal", null, { page });
  });

  test("HSN grid has Total Value Taxable plus Tax column", { tag: ["@GSTR1-DAEE-100-TC-027", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the HSN tab should show columns HSN Code UQC Rate Total Value and tax columns", null, { page });
  });

  test("HSN tab does not show Description or Product Name column", { tag: ["@GSTR1-DAEE-100-TC-028", "@DAEE-100", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the HSN tab should not show Description or Product Name column", null, { page });
  });

  test("HSN shows single line per HSN UQC Rate no duplicate lines", { tag: ["@GSTR1-DAEE-100-TC-029", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the HSN tab should show single line per HSN UQC Rate combination", null, { page });
  });

  test("Docs tab shows separate rows per series INV vs IWT not grouped by first 3 chars", { tag: ["@GSTR1-DAEE-100-TC-030", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Docs tab should show columns Nature of Doc Sr No From Sr No To Total Number Cancelled Net Issued", null, { page });
  });

  test("Docs tab columns Nature of Doc Sr No From Sr No To Total Number Cancelled Net Issued", { tag: ["@GSTR1-DAEE-100-TC-031", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Docs tab should show columns Nature of Doc Sr No From Sr No To Total Number Cancelled Net Issued", null, { page });
  });

  test("Docs Net Issued equals Total Number minus Cancelled", { tag: ["@GSTR1-DAEE-100-TC-032", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("Docs Net Issued should equal Total Number minus Cancelled for each row", null, { page });
  });

  test("Docs Nature of Document uses exact strings", { tag: ["@GSTR1-DAEE-100-TC-033", "@DAEE-100", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("Docs Nature of Document should use exact allowed strings", null, { page });
  });

  test("Export button opens menu with Export Excel and Export JSON options", { tag: ["@GSTR1-DAEE-100-TC-034", "@DAEE-100", "@smoke", "@regression", "@p0", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Export button should open a menu with Export Excel and Export JSON options", null, { page });
  });

  test("Export Excel downloads file named GSTR1_GSTIN_Month xlsx", { tag: ["@GSTR1-DAEE-100-TC-035", "@DAEE-100", "@smoke", "@regression", "@p0", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("Export Excel should download a file named GSTR1 GSTIN Month xlsx", null, { page });
  });

  test("Exported file has expected sheets template fidelity", { tag: ["@GSTR1-DAEE-100-TC-036", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the exported Excel file should have expected sheets and template structure", null, { page });
  });

  test("Data in b2b cdnr hsn docs starts at Row 5", { tag: ["@GSTR1-DAEE-100-TC-037", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the exported Excel data in b2b cdnr hsn docs should start at row 5", null, { page });
  });

  test("b2b and cdnr exclude Tax Amount columns; hsn includes Tax Amount columns (AC6)", { tag: ["@GSTR1-DAEE-100-TC-038", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the exported Excel b2b and cdnr should exclude Tax Amount columns and hsn should include Tax Amount columns", null, { page });
  });

  test("Date format in Excel is dd-mmm-yyyy and POS is Code-StateName", { tag: ["@GSTR1-DAEE-100-TC-039", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the exported Excel date format should be dd-mmm-yyyy and POS should be Code-StateName", null, { page });
  });

  test("Export All GSTINs downloads ZIP with one file per GSTIN", { tag: ["@GSTR1-DAEE-100-TC-040", "@DAEE-100", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"all\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("Export All GSTINs should download a ZIP named GSTR1_ALL_Month zip", null, { page });
  });

  test("All tabs Summary B2B B2CL B2CS CDNR CDNUR HSN Docs are clickable and show content", { tag: ["@GSTR1-DAEE-100-TC-042", "@DAEE-100", "@smoke", "@regression", "@p0", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("all tabs Summary B2B B2CL B2CS CDNR CDNUR HSN Docs should be clickable and show content", null, { page });
  });

  test("Summary tab shows section totals B2B B2CL B2CS CDNR CDNUR and liability", { tag: ["@GSTR1-DAEE-100-TC-043", "@DAEE-100", "@smoke", "@regression", "@p0", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Summary tab should show section totals and liability", null, { page });
  });

  test("Liability check Summary Total Liability matches sum of tax from HSN sheets", { tag: ["@GSTR1-DAEE-100-TC-044", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("Summary Total Liability should match sum of tax from HSN sheets", null, { page });
  });

  test("TC-045 Loading state shown while fetching data then content", { tag: ["@GSTR1-DAEE-100-TC-045", "@DAEE-100", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then, When }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("a loading state should be shown then content", null, { page });
  });

  test("TC-047 Export button disabled or shows loading during export", { tag: ["@GSTR1-DAEE-100-TC-047", "@DAEE-100", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Export button should be disabled or show loading during export", null, { page });
  });

  test("TC-048 Dashboard data aggregates correctly for selected GSTIN and Period", { tag: ["@GSTR1-DAEE-100-TC-048", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await When("I change Return Period to \"current\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the Return Period card should show period \"current\"", null, { page });
  });

  test("TC-049 B2CS shown as grouped data not individual invoices", { tag: ["@GSTR1-DAEE-100-TC-049", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the B2CS tab should show grouped summary", null, { page });
  });

  test("TC-050 Template fidelity 32 sheets data from row 5 DoD", { tag: ["@GSTR1-DAEE-100-TC-050", "@DAEE-100", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
    await When("I select Seller GSTIN \"first\" and Return Period \"previous\"", null, { page });
    await Then("data should load and empty state should disappear", null, { page });
    await And("the exported Excel file should have expected sheets and template structure", null, { page });
    await And("the exported Excel data in b2b cdnr hsn docs should start at row 5", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/compliance/gstr1.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "User with compliance.read can open GSTR-1 Review page": {"pickleLocation":"10:3","tags":["@GSTR1-DAEE-100-TC-001","@DAEE-100","@smoke","@regression","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@regression","@smoke","@DAEE-100","@GSTR1-DAEE-100-TC-001"]},
  "User access control for GSTR-1 page|Example #1": {"pickleLocation":"23:7","tags":["@GSTR1-DAEE-100-TC-003","@DAEE-100","@regression","@p1","@multi-user","@iacs-md"]},
  "Filing Period dropdown visible with current month options": {"pickleLocation":"28:3","tags":["@GSTR1-DAEE-100-TC-004","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-004"]},
  "Seller GSTIN dropdown displays GSTIN and State Name format": {"pickleLocation":"34:3","tags":["@GSTR1-DAEE-100-TC-005","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-005"]},
  "Selecting filters loads data and removes empty state": {"pickleLocation":"40:3","tags":["@GSTR1-DAEE-100-TC-006","@DAEE-100","@smoke","@regression","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@regression","@smoke","@DAEE-100","@GSTR1-DAEE-100-TC-006"]},
  "Return Period card shows human-readable format": {"pickleLocation":"47:3","tags":["@GSTR1-DAEE-100-TC-007","@DAEE-100","@smoke","@regression","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@regression","@smoke","@DAEE-100","@GSTR1-DAEE-100-TC-007"]},
  "Total Liability card visible and reflects tax": {"pickleLocation":"56:3","tags":["@GSTR1-DAEE-100-TC-008","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-008"]},
  "Total Taxable Value card visible and numeric": {"pickleLocation":"64:3","tags":["@GSTR1-DAEE-100-TC-009","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-009"]},
  "Validation Errors card visible with Fix Required count": {"pickleLocation":"72:3","tags":["@GSTR1-DAEE-100-TC-010","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-010"]},
  "E-Invoice Status card visible with IRN status": {"pickleLocation":"80:3","tags":["@GSTR1-DAEE-100-TC-011","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-011"]},
  "Net Taxable Value card shows correct formula": {"pickleLocation":"88:3","tags":["@GSTR1-DAEE-100-TC-012","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-012"]},
  "When validation errors exist collapsible Fix Required banner appears above tabs": {"pickleLocation":"97:3","tags":["@GSTR1-DAEE-100-TC-013","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-013"]},
  "Validation banner lists specific issues with document or message": {"pickleLocation":"105:3","tags":["@GSTR1-DAEE-100-TC-014","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-014"]},
  "Validation banner does not appear when there are zero validation errors": {"pickleLocation":"114:3","tags":["@GSTR1-DAEE-100-TC-015","@DAEE-100","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-015"]},
  "B2B tab shows columns Status GSTIN Name Inv No Date Inv Value POS RCM Inv Type Rate Taxable Val Cess": {"pickleLocation":"123:3","tags":["@GSTR1-DAEE-100-TC-016","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-016"]},
  "B2B Status column reflects e-invoice status": {"pickleLocation":"131:3","tags":["@GSTR1-DAEE-100-TC-017","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-017"]},
  "B2B Invoice Type shows R or Regular for IWT not IWT": {"pickleLocation":"139:3","tags":["@GSTR1-DAEE-100-TC-018","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-018"]},
  "B2B Rate column shows tax percentage not dash for taxable invoices": {"pickleLocation":"147:3","tags":["@GSTR1-DAEE-100-TC-019","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-019"]},
  "IWT rows in B2B show Buyer Name not Unknown": {"pickleLocation":"155:3","tags":["@GSTR1-DAEE-100-TC-020","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-020"]},
  "B2B Buyer Name column shows full legal name or wrap": {"pickleLocation":"163:3","tags":["@GSTR1-DAEE-100-TC-021","@DAEE-100","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-021"]},
  "B2B table supports filters Status Supply Type Search and pagination": {"pickleLocation":"171:3","tags":["@GSTR1-DAEE-100-TC-022","@DAEE-100","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-022"]},
  "CDNR tab shows columns Note Type Note Value Taxable Value and tax amounts": {"pickleLocation":"180:3","tags":["@GSTR1-DAEE-100-TC-023","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-023"]},
  "CDNR note values shown as positive in UI per DEF-007": {"pickleLocation":"188:3","tags":["@GSTR1-DAEE-100-TC-024","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-024"]},
  "HSN tab grouped by HSN Code UQC Rate with Total Value column": {"pickleLocation":"197:3","tags":["@GSTR1-DAEE-100-TC-025","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-025"]},
  "HSN Rate column shows correct percentage not 0% or 0.18%": {"pickleLocation":"205:3","tags":["@GSTR1-DAEE-100-TC-026","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-026"]},
  "HSN grid has Total Value Taxable plus Tax column": {"pickleLocation":"213:3","tags":["@GSTR1-DAEE-100-TC-027","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-027"]},
  "HSN tab does not show Description or Product Name column": {"pickleLocation":"221:3","tags":["@GSTR1-DAEE-100-TC-028","@DAEE-100","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-028"]},
  "HSN shows single line per HSN UQC Rate no duplicate lines": {"pickleLocation":"229:3","tags":["@GSTR1-DAEE-100-TC-029","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-029"]},
  "Docs tab shows separate rows per series INV vs IWT not grouped by first 3 chars": {"pickleLocation":"238:3","tags":["@GSTR1-DAEE-100-TC-030","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-030"]},
  "Docs tab columns Nature of Doc Sr No From Sr No To Total Number Cancelled Net Issued": {"pickleLocation":"246:3","tags":["@GSTR1-DAEE-100-TC-031","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-031"]},
  "Docs Net Issued equals Total Number minus Cancelled": {"pickleLocation":"254:3","tags":["@GSTR1-DAEE-100-TC-032","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-032"]},
  "Docs Nature of Document uses exact strings": {"pickleLocation":"262:3","tags":["@GSTR1-DAEE-100-TC-033","@DAEE-100","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-033"]},
  "Export button opens menu with Export Excel and Export JSON options": {"pickleLocation":"271:3","tags":["@GSTR1-DAEE-100-TC-034","@DAEE-100","@smoke","@regression","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@regression","@smoke","@DAEE-100","@GSTR1-DAEE-100-TC-034"]},
  "Export Excel downloads file named GSTR1_GSTIN_Month xlsx": {"pickleLocation":"279:3","tags":["@GSTR1-DAEE-100-TC-035","@DAEE-100","@smoke","@regression","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@regression","@smoke","@DAEE-100","@GSTR1-DAEE-100-TC-035"]},
  "Exported file has expected sheets template fidelity": {"pickleLocation":"287:3","tags":["@GSTR1-DAEE-100-TC-036","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-036"]},
  "Data in b2b cdnr hsn docs starts at Row 5": {"pickleLocation":"295:3","tags":["@GSTR1-DAEE-100-TC-037","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-037"]},
  "b2b and cdnr exclude Tax Amount columns; hsn includes Tax Amount columns (AC6)": {"pickleLocation":"303:3","tags":["@GSTR1-DAEE-100-TC-038","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-038"]},
  "Date format in Excel is dd-mmm-yyyy and POS is Code-StateName": {"pickleLocation":"311:3","tags":["@GSTR1-DAEE-100-TC-039","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-039"]},
  "Export All GSTINs downloads ZIP with one file per GSTIN": {"pickleLocation":"319:3","tags":["@GSTR1-DAEE-100-TC-040","@DAEE-100","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-040"]},
  "All tabs Summary B2B B2CL B2CS CDNR CDNUR HSN Docs are clickable and show content": {"pickleLocation":"328:3","tags":["@GSTR1-DAEE-100-TC-042","@DAEE-100","@smoke","@regression","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@regression","@smoke","@DAEE-100","@GSTR1-DAEE-100-TC-042"]},
  "Summary tab shows section totals B2B B2CL B2CS CDNR CDNUR and liability": {"pickleLocation":"336:3","tags":["@GSTR1-DAEE-100-TC-043","@DAEE-100","@smoke","@regression","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@regression","@smoke","@DAEE-100","@GSTR1-DAEE-100-TC-043"]},
  "Liability check Summary Total Liability matches sum of tax from HSN sheets": {"pickleLocation":"344:3","tags":["@GSTR1-DAEE-100-TC-044","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-044"]},
  "TC-045 Loading state shown while fetching data then content": {"pickleLocation":"353:3","tags":["@GSTR1-DAEE-100-TC-045","@DAEE-100","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-045"]},
  "TC-047 Export button disabled or shows loading during export": {"pickleLocation":"360:3","tags":["@GSTR1-DAEE-100-TC-047","@DAEE-100","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-047"]},
  "TC-048 Dashboard data aggregates correctly for selected GSTIN and Period": {"pickleLocation":"369:3","tags":["@GSTR1-DAEE-100-TC-048","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-048"]},
  "TC-049 B2CS shown as grouped data not individual invoices": {"pickleLocation":"379:3","tags":["@GSTR1-DAEE-100-TC-049","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-049"]},
  "TC-050 Template fidelity 32 sheets data from row 5 DoD": {"pickleLocation":"387:3","tags":["@GSTR1-DAEE-100-TC-050","@DAEE-100","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-100","@GSTR1-DAEE-100-TC-050"]},
};