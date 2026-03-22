/** Generated from: e2e/features/o2c/o2c-e2e-indent-so-invoice.feature */
import { test } from "playwright-bdd";

test.describe("O2C End-to-End Flow (Indent → Sales Order → Picklist → eInvoice → Dispatch → Dealer Ledger)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Full E2E flow with Dealer IACS5509, Product 1013, Warehouse Kurnook, Transporter Just In Time Shipper", { tag: ["@O2C-E2E-TC-001", "@o2c-flow", "@smoke", "@critical", "@p0", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have noted inventory for product \"1013\" at warehouse \"Kurnook\"", null, { page });
    await And("I have noted dealer credit for dealer code \"IACS5509\"", null, { page });
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"Ramesh ningappa diggai\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await Then("the indent should be saved successfully", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await Then("the Warehouse Selection card should be visible", null, { page });
    await Then("the Approve button should be disabled", null, { page });
    await When("I select warehouse \"Kurnook Warehouse\" for the indent", null, { page });
    await Then("the Approve button should be enabled", null, { page });
    await When("I select transporter \"Just In Time Shipper\" for the indent", null, { page });
    await When("I click Approve on the indent detail page", null, { page });
    await And("I fill approval comments \"AUTO_QA E2E approval\" and submit the approval dialog", null, { page });
    await When("I confirm the stock availability warning with Approve Anyway if it appears", null, { page });
    await Then("the indent should be approved successfully", null, { page });
    await When("I click Process Workflow", null, { page });
    await Then("the Process Workflow dialog should show SO and Back Order preview", null, { page });
    await When("I confirm and process the workflow", null, { page });
    await Then("the workflow should complete successfully", null, { page });
    await When("I navigate to the Sales Order created from the indent", null, { page });
    await Then("the Sales Order page shows dealer \"Ramesh ningappa diggai\"", null, { page });
    await And("the Sales Order page shows warehouse \"Kurnool\"", null, { page });
    await And("the Sales Order page shows source indent link", null, { page });
    await And("the Sales Order has allocated stock and net available is reduced by SO quantity", null, { page });
    await And("dealer credit is unchanged after SO creation", null, { page });
    await When("I generate picklist from the Sales Order page", null, { page });
    await And("I run the warehouse picklist flow picking all lines to completion", null, { page });
    await When("I generate E-Invoice with transporter \"Just In Time Shipper\" on the Sales Order page", null, { page });
    await Then("E-Invoice generation completes and invoice link appears on the Sales Order page", null, { page });
    await And("the Sales Order status is updated", null, { page });
    await When("I mark the Sales Order as packed from the detail page", null, { page });
    await And("I mark the Sales Order as ready to ship from the detail page", null, { page });
    await When("I dispatch the Sales Order entering transporter \"Just In Time Shipper\" with vehicle details deferred", null, { page });
    await Then("the Sales Order dispatch completes successfully", null, { page });
    await When("I navigate to the Invoice from the Sales Order", null, { page });
    await When("I click Generate Custom E-Invoice PDF and download the PDF", null, { page });
    await Then("the downloaded PDF file exists and is non-empty", null, { page });
    await Then("stock is reduced as per allocation", null, { page });
    await And("dealer credit is updated as per invoice totals", null, { page });
    await When("I navigate to Dealer Ledger and select dealer \"IACS5509\"", null, { page });
    await Then("the Dealer Ledger shows an invoice transaction", null, { page });
  });

  test("Mixed indent — DB-resolved OOS + in-stock at Kurnook → back order + SO → invoice (full pipeline)", { tag: ["@O2C-E2E-TC-002", "@o2c-flow", "@regression", "@p1", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have resolved an in-stock and an out-of-stock product at warehouse \"Kurnook\" for mixed SO and back order", null, { page });
    await And("I have noted inventory for the resolved in-stock product at warehouse \"Kurnook\"", null, { page });
    await And("I have noted dealer credit for dealer code \"IACS5509\"", null, { page });
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"Ramesh ningappa diggai\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await When("I add the resolved out-of-stock product to the indent", null, { page });
    await And("I add the resolved in-stock product to the indent", null, { page });
    await And("I save the indent", null, { page });
    await Then("the indent should be saved successfully", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await Then("the Warehouse Selection card should be visible", null, { page });
    await Then("the Approve button should be disabled", null, { page });
    await When("I select warehouse \"Kurnook Warehouse\" for the indent", null, { page });
    await Then("I should see a stock warning or Approve with Back Orders on the indent detail page", null, { page });
    await Then("the Approve button should be enabled", null, { page });
    await When("I select transporter \"Just In Time Shipper\" for the indent", null, { page });
    await When("I click Approve on the indent detail page", null, { page });
    await And("I fill approval comments \"AUTO_QA mixed back order + SO E2E\" and submit the approval dialog", null, { page });
    await When("I confirm the stock availability warning with Approve Anyway if it appears", null, { page });
    await Then("the indent should be approved successfully", null, { page });
    await When("I click Process Workflow", null, { page });
    await Then("the Process Workflow dialog should show SO and Back Order preview", null, { page });
    await When("I confirm and process the workflow", null, { page });
    await Then("the workflow should complete successfully", null, { page });
    await Then("a back order should exist in DB for the current indent", null, { page });
    await When("I am on the O2C Inventory page", null, { page });
    await And("I search inventory for the resolved out-of-stock product and filter warehouse \"Kurnook\"", null, { page });
    await Then("the inventory list shows no rows for the current search", null, { page });
    await When("I navigate to the Sales Order created from the indent", null, { page });
    await Then("the Sales Order page shows dealer \"Ramesh ningappa diggai\"", null, { page });
    await And("the Sales Order page shows warehouse \"Kurnool\"", null, { page });
    await And("the Sales Order page shows source indent link", null, { page });
    await And("the Sales Order has allocated stock and net available is reduced by SO quantity", null, { page });
    await And("dealer credit is unchanged after SO creation", null, { page });
    await When("I generate picklist from the Sales Order page", null, { page });
    await And("I run the warehouse picklist flow picking all lines to completion", null, { page });
    await When("I generate E-Invoice with transporter \"Just In Time Shipper\" on the Sales Order page", null, { page });
    await Then("E-Invoice generation completes and invoice link appears on the Sales Order page", null, { page });
    await And("the Sales Order status is updated", null, { page });
    await When("I mark the Sales Order as packed from the detail page", null, { page });
    await And("I mark the Sales Order as ready to ship from the detail page", null, { page });
    await When("I dispatch the Sales Order entering transporter \"Just In Time Shipper\" with vehicle details deferred", null, { page });
    await Then("the Sales Order dispatch completes successfully", null, { page });
    await When("I navigate to the Invoice from the Sales Order", null, { page });
    await When("I click Generate Custom E-Invoice PDF and download the PDF", null, { page });
    await Then("the downloaded PDF file exists and is non-empty", null, { page });
    await Then("stock is reduced as per allocation", null, { page });
    await And("dealer credit is updated as per invoice totals", null, { page });
    await When("I navigate to Dealer Ledger and select dealer \"IACS5509\"", null, { page });
    await Then("the Dealer Ledger shows an invoice transaction", null, { page });
  });

  test("Generate E-Invoice without E-Way bill (picklist path)", { tag: ["@O2C-E2E-TC-003", "@o2c-flow", "@regression", "@p1", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have noted inventory for product \"1013\" at warehouse \"Kurnook\"", null, { page });
    await And("I have noted dealer credit for dealer code \"IACS5509\"", null, { page });
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"Ramesh ningappa diggai\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await Then("the indent should be saved successfully", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await Then("the Warehouse Selection card should be visible", null, { page });
    await When("I select warehouse \"Kurnook Warehouse\" for the indent", null, { page });
    await When("I select transporter \"Just In Time Shipper\" for the indent", null, { page });
    await When("I click Approve on the indent detail page", null, { page });
    await And("I fill approval comments \"AUTO_QA E2E e-invoice no eway\" and submit the approval dialog", null, { page });
    await Then("the indent should be approved successfully", null, { page });
    await When("I click Process Workflow", null, { page });
    await When("I confirm and process the workflow", null, { page });
    await Then("the workflow should complete successfully", null, { page });
    await When("I navigate to the Sales Order created from the indent", null, { page });
    await When("I generate picklist from the Sales Order page", null, { page });
    await And("I run the warehouse picklist flow picking all lines to completion", null, { page });
    await When("I generate E-Invoice without E-Way bill on the Sales Order page", null, { page });
    await Then("E-Invoice generation completes and invoice link appears on the Sales Order page", null, { page });
  });

  test("Cancel e-invoice within 24 hours (recent IRN without E-Way bill, or e-invoice-only O2C setup)", { tag: ["@O2C-E2E-TC-004", "@o2c-flow", "@regression", "@p1", "@iacs-tenant", "@iacs-md"] }, async ({ When, page, Then }) => {
    await When("I open an invoice with IRN from the last 24 hours or complete O2C flow to generate one", null, { page });
    await When("I cancel the e-invoice from the invoice detail using the default cancellation reason", null, { page });
    await Then("the invoice e-invoice status in the database should be \"cancelled\"", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/o2c/o2c-e2e-indent-so-invoice.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Full E2E flow with Dealer IACS5509, Product 1013, Warehouse Kurnook, Transporter Just In Time Shipper": {"pickleLocation":"10:3","tags":["@O2C-E2E-TC-001","@o2c-flow","@smoke","@critical","@p0","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@p0","@critical","@smoke","@o2c-flow","@O2C-E2E-TC-001"]},
  "Mixed indent — DB-resolved OOS + in-stock at Kurnook → back order + SO → invoice (full pipeline)": {"pickleLocation":"70:3","tags":["@O2C-E2E-TC-002","@o2c-flow","@regression","@p1","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@p1","@regression","@o2c-flow","@O2C-E2E-TC-002"]},
  "Generate E-Invoice without E-Way bill (picklist path)": {"pickleLocation":"129:3","tags":["@O2C-E2E-TC-003","@o2c-flow","@regression","@p1","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@p1","@regression","@o2c-flow","@O2C-E2E-TC-003"]},
  "Cancel e-invoice within 24 hours (recent IRN without E-Way bill, or e-invoice-only O2C setup)": {"pickleLocation":"158:3","tags":["@O2C-E2E-TC-004","@o2c-flow","@regression","@p1","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@p1","@regression","@o2c-flow","@O2C-E2E-TC-004"]},
};