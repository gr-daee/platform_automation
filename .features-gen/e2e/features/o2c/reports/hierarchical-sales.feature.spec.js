/** Generated from: e2e/features/o2c/reports/hierarchical-sales.feature */
import { test } from "playwright-bdd";

test.describe("Hierarchical Sales Report", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Generate Report is disabled when From or To date is missing", { tag: ["@O2C-HSR-TC-003", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, When }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await Then("I should see the Hierarchical Sales Report page", null, { page });
    await When("I clear the From Date and To Date", null, { page });
    await Then("the Generate Report button should be disabled", null, { page });
  });

  test("Quick period This Month sets From and To date to current month", { tag: ["@O2C-HSR-TC-004", "@regression", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await When("I click quick period \"This Month\"", null, { page });
    await Then("the From Date and To Date should reflect current month range", null, { page });
  });

  test("Quick period This Quarter sets correct quarter range", { tag: ["@O2C-HSR-TC-005", "@regression", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await When("I click quick period \"This Quarter\"", null, { page });
    await Then("the From Date and To Date should reflect current quarter range", null, { page });
  });

  test("Quick period This Year sets Jan 1 to today", { tag: ["@O2C-HSR-TC-006", "@regression", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await When("I click quick period \"This Year\"", null, { page });
    await Then("the From Date and To Date should reflect year to date", null, { page });
  });

  test("State GSTIN dropdown shows All states and state options", { tag: ["@O2C-HSR-TC-007", "@regression", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await Then("the State GSTIN dropdown should be visible", null, { page });
    await And("the State dropdown should contain \"All states\" option", null, { page });
  });

  test("Generate Report with valid date range loads report and summary cards", { tag: ["@O2C-HSR-TC-011", "@smoke", "@p0", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await When("I set date range to a valid past period", null, { page });
    await And("I click Generate Report", null, { page });
    await Then("the report should load successfully", null, { page });
    await And("summary cards and Grand Total should be visible", null, { page });
  });

  test("Loading state shows Generating on button during fetch", { tag: ["@O2C-HSR-TC-012", "@regression", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await When("I set date range to a valid past period", null, { page });
    await And("I click Generate Report", null, { page });
    await Then("the Generate Report button should show \"Generating\" during load", null, { page });
  });

  test("Export Excel is disabled when no report data", { tag: ["@O2C-HSR-TC-022", "@regression", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await Then("the Export Excel button should be disabled or not visible when no report", null, { page });
  });

  test("Initial load shows No Report Generated empty state", { tag: ["@O2C-HSR-TC-025", "@regression", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await Then("I should see the empty state \"No Report Generated\"", null, { page });
  });

  test("After Generate with no invoices shows No Sales Data Found", { tag: ["@O2C-HSR-TC-026", "@regression", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await When("I set date range to a future period with no data", null, { page });
    await And("I click Generate Report", null, { page });
    await Then("I should see \"No Sales Data Found\" or report loads with zero dealers", null, { page });
  });

  test("Exported By Dealer sheet includes City column and values", { tag: ["@O2C-HSR-TC-029", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Hierarchical Sales Report page", null, { page });
    await When("I set date range to a valid past period", null, { page });
    await And("I click Generate Report", null, { page });
    await And("I export Hierarchical Sales report to Excel", null, { page });
    await Then("the Hierarchical Sales By Dealer sheet should include City column");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/o2c/reports/hierarchical-sales.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Generate Report is disabled when From or To date is missing": {"pickleLocation":"22:3","tags":["@O2C-HSR-TC-003","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@O2C-HSR-TC-003"]},
  "Quick period This Month sets From and To date to current month": {"pickleLocation":"29:3","tags":["@O2C-HSR-TC-004","@regression","@iacs-md"],"ownTags":["@iacs-md","@regression","@O2C-HSR-TC-004"]},
  "Quick period This Quarter sets correct quarter range": {"pickleLocation":"35:3","tags":["@O2C-HSR-TC-005","@regression","@iacs-md"],"ownTags":["@iacs-md","@regression","@O2C-HSR-TC-005"]},
  "Quick period This Year sets Jan 1 to today": {"pickleLocation":"41:3","tags":["@O2C-HSR-TC-006","@regression","@iacs-md"],"ownTags":["@iacs-md","@regression","@O2C-HSR-TC-006"]},
  "State GSTIN dropdown shows All states and state options": {"pickleLocation":"47:3","tags":["@O2C-HSR-TC-007","@regression","@iacs-md"],"ownTags":["@iacs-md","@regression","@O2C-HSR-TC-007"]},
  "Generate Report with valid date range loads report and summary cards": {"pickleLocation":"56:3","tags":["@O2C-HSR-TC-011","@smoke","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@smoke","@O2C-HSR-TC-011"]},
  "Loading state shows Generating on button during fetch": {"pickleLocation":"64:3","tags":["@O2C-HSR-TC-012","@regression","@iacs-md"],"ownTags":["@iacs-md","@regression","@O2C-HSR-TC-012"]},
  "Export Excel is disabled when no report data": {"pickleLocation":"71:3","tags":["@O2C-HSR-TC-022","@regression","@iacs-md"],"ownTags":["@iacs-md","@regression","@O2C-HSR-TC-022"]},
  "Initial load shows No Report Generated empty state": {"pickleLocation":"76:3","tags":["@O2C-HSR-TC-025","@regression","@iacs-md"],"ownTags":["@iacs-md","@regression","@O2C-HSR-TC-025"]},
  "After Generate with no invoices shows No Sales Data Found": {"pickleLocation":"81:3","tags":["@O2C-HSR-TC-026","@regression","@iacs-md"],"ownTags":["@iacs-md","@regression","@O2C-HSR-TC-026"]},
  "Exported By Dealer sheet includes City column and values": {"pickleLocation":"88:3","tags":["@O2C-HSR-TC-029","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@O2C-HSR-TC-029"]},
};