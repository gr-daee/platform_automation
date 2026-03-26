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

  test("Cancel e-invoice within 24 hours (recent IRN without E-Way bill, or e-invoice-only O2C setup)", { tag: ["@O2C-E2E-TC-004", "@o2c-flow", "@regression", "@p1", "@iacs-tenant", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open an invoice with IRN from the last 24 hours or complete O2C flow to generate one", null, { page });
    await And("I have noted invoice cancellation inventory baseline from database", null, { page });
    await When("I cancel the e-invoice from the invoice detail using the default cancellation reason", null, { page });
    await Then("the invoice e-invoice status in the database should be \"cancelled\"", null, { page });
    await And("inventory available should increase by cancelled quantity in database", null, { page });
  });

  test("SRI HANUMAN AGENCIES (IACS3558) dealer flow generates IGST invoice", { tag: ["@O2C-E2E-TC-005", "@o2c-flow", "@regression", "@p1", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have noted inventory for product \"1013\" at warehouse \"Kurnook\"", null, { page });
    await And("I have noted dealer credit for dealer code \"IACS3558\"", null, { page });
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"IACS3558\"", null, { page });
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
    await And("I fill approval comments \"AUTO_QA IACS3558 IGST flow\" and submit the approval dialog", null, { page });
    await When("I confirm the stock availability warning with Approve Anyway if it appears", null, { page });
    await Then("the indent should be approved successfully", null, { page });
    await When("I click Process Workflow", null, { page });
    await When("I confirm and process the workflow", null, { page });
    await Then("the workflow should complete successfully", null, { page });
    await When("I navigate to the Sales Order created from the indent", null, { page });
    await When("I generate picklist from the Sales Order page", null, { page });
    await And("I run the warehouse picklist flow picking all lines to completion", null, { page });
    await When("I generate E-Invoice with transporter \"Just In Time Shipper\" on the Sales Order page", null, { page });
    await Then("E-Invoice generation completes and invoice link appears on the Sales Order page", null, { page });
    await When("I navigate to the Invoice from the Sales Order", null, { page });
    await Then("the invoice should have IGST and no CGST SGST in database", null, { page });
  });

  test("Cancel e-invoice restores inventory across all invoice lines (full-line DB reconciliation)", { tag: ["@O2C-E2E-TC-007", "@o2c-flow", "@regression", "@p1", "@iacs-tenant", "@iacs-md"] }, async ({ When, page, Then, And }) => {
    await When("I open an invoice with IRN from the last 24 hours or complete O2C flow to generate one", null, { page });
    await When("I have noted invoice cancellation inventory baselines for all invoice lines from database");
    await When("I cancel the e-invoice from the invoice detail using the default cancellation reason", null, { page });
    await Then("the invoice e-invoice status in the database should be \"cancelled\"", null, { page });
    await And("inventory available should increase by cancelled quantity across all invoice lines in database", null, { page });
  });

  test("SO creation reconciles package-level allocated deltas exactly", { tag: ["@O2C-E2E-TC-008", "@o2c-flow", "@regression", "@p1", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
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
    await And("I fill approval comments \"AUTO_QA SO allocation reconciliation\" and submit the approval dialog", null, { page });
    await When("I confirm the stock availability warning with Approve Anyway if it appears", null, { page });
    await Then("the indent should be approved successfully", null, { page });
    await When("I click Process Workflow", null, { page });
    await Then("the Process Workflow dialog should show SO and Back Order preview", null, { page });
    await When("I confirm and process the workflow", null, { page });
    await Then("the workflow should complete successfully", null, { page });
    await When("I navigate to the Sales Order created from the indent", null, { page });
    await Then("the Sales Order line allocations should exactly match inventory allocated deltas by package", null, { page });
  });

  test("90+ day unpaid invoice blocks approval with toast — dealer resolved from database", { tag: ["@O2C-E2E-TC-006", "@o2c-flow", "@regression", "@p1", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have noted inventory for product \"1013\" at warehouse \"Kurnook\"", null, { page });
    await And("I have resolved and noted dealer credit for a dealer with unpaid invoices older than 90 days or skip the scenario");
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for the resolved 90-day block dealer", null, { page });
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
    await And("I fill approval comments \"AUTO_QA 90-day unpaid block\" and submit the approval dialog", null, { page });
    await Then("I should see a toast blocking indent approval for 90-day unpaid invoices with invoice and amount details", null, { page });
  });

  test("Invoice cancellation is idempotent and does not double-increment inventory", { tag: ["@O2C-E2E-TC-009", "@o2c-flow", "@regression", "@p1", "@iacs-tenant", "@iacs-md"] }, async ({ When, page, Then, And }) => {
    await When("I open an invoice with IRN from the last 24 hours or complete O2C flow to generate one", null, { page });
    await When("I have noted invoice cancellation inventory baselines for all invoice lines from database");
    await When("I cancel the e-invoice from the invoice detail using the default cancellation reason", null, { page });
    await Then("the invoice e-invoice status in the database should be \"cancelled\"", null, { page });
    await And("inventory available should increase by cancelled quantity across all invoice lines in database", null, { page });
    await When("I note post-cancellation inventory baselines for idempotency verification");
    await And("I attempt to cancel the same invoice again if action is available", null, { page });
    await Then("second cancel attempt should not change inventory for the cancelled invoice lines", null, { page });
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
  "SRI HANUMAN AGENCIES (IACS3558) dealer flow generates IGST invoice": {"pickleLocation":"167:3","tags":["@O2C-E2E-TC-005","@o2c-flow","@regression","@p1","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@p1","@regression","@o2c-flow","@O2C-E2E-TC-005"]},
  "Cancel e-invoice restores inventory across all invoice lines (full-line DB reconciliation)": {"pickleLocation":"198:3","tags":["@O2C-E2E-TC-007","@o2c-flow","@regression","@p1","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@p1","@regression","@o2c-flow","@O2C-E2E-TC-007"]},
  "SO creation reconciles package-level allocated deltas exactly": {"pickleLocation":"207:3","tags":["@O2C-E2E-TC-008","@o2c-flow","@regression","@p1","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@p1","@regression","@o2c-flow","@O2C-E2E-TC-008"]},
  "90+ day unpaid invoice blocks approval with toast — dealer resolved from database": {"pickleLocation":"238:3","tags":["@O2C-E2E-TC-006","@o2c-flow","@regression","@p1","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@p1","@regression","@o2c-flow","@O2C-E2E-TC-006"]},
  "Invoice cancellation is idempotent and does not double-increment inventory": {"pickleLocation":"258:3","tags":["@O2C-E2E-TC-009","@o2c-flow","@regression","@p1","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@p1","@regression","@o2c-flow","@O2C-E2E-TC-009"]},
};