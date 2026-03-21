/** Generated from: e2e/features/finance/cash-receipts/manual-cash-receipts.feature */
import { test } from "playwright-bdd";

test.describe("Manual Cash Receipts", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Apply payment and auto-calculated EPD discount amount", { tag: ["@FIN-CR-TC-001", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"500\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"100\"", null, { page });
    await Then("the payment should be allocated to invoice \"first\"", null, { page });
    await And("the outstanding balance for invoice \"first\" should decrease by \"100\"", null, { page });
    await And("the cash receipt application details for invoice \"first\" should be correct", null, { page });
    await And("on clicking the CCN link for invoice \"first\" the CCN details should be correct", null, { page });
    await And("on clicking the journal entry the JE details should be correct", null, { page });
    await Then("the EPD discount should be correctly calculated for invoice \"first\"", null, { page });
  });

  test("Toggle EPD enabled or disabled", { tag: ["@FIN-CR-TC-002", "@p1", "@iacs-md"] }, async ({ Given, page, And, Then, When }) => {
    await Given("I have created a cash receipt with amount \"450.78\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await Then("journal entry should be present for the current cash receipt", null, { page });
    await And("I navigate to the apply page for the current cash receipt again", null, { page });
    await When("I set amount to apply \"98.45\" for invoice \"first\" without saving", null, { page });
    await When("I toggle EPD off for invoice \"first\"", null, { page });
    await Then("the apply page should show no EPD discount for invoice \"first\"", null, { page });
    await When("I toggle EPD on for invoice \"first\"", null, { page });
    await Then("the apply page should show EPD discount for invoice \"first\"", null, { page });
    await When("I toggle EPD off for invoice \"first\"", null, { page });
    await And("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"98.45\"", null, { page });
    await Then("the payment should be allocated to invoice \"first\"", null, { page });
    await And("no CCN should be created for the current receipt");
    await And("the outstanding balance for invoice \"first\" should decrease by \"98.45\"", null, { page });
    await And("the cash receipt application details for invoice \"first\" should be correct", null, { page });
    await And("on clicking the journal entry the JE details should be correct", null, { page });
  });

  test("Apply payment to two invoices in one submit (first with CCN, second without CCN)", { tag: ["@FIN-CR-TC-003", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"234.45\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I select invoice \"first\"", null, { page });
    await And("I set amount to apply \"23.36\" for invoice \"first\" without saving", null, { page });
    await And("I toggle EPD on for invoice \"first\"", null, { page });
    await And("I select invoice \"second\"", null, { page });
    await And("I set amount to apply \"45.23\" for invoice \"second\" without saving", null, { page });
    await And("I toggle EPD off for invoice \"second\"", null, { page });
    await And("I expect 2 invoice(s) to be selected on the apply page", null, { page });
    await And("I wait for apply form to be ready", null, { page });
    await And("I wait for the Apply Payments button to be enabled", null, { page });
    await When("I apply the payments", null, { page });
    await Then("the payment should be allocated to invoice \"first\"", null, { page });
    await And("the payment should be allocated to invoice \"second\"", null, { page });
    await And("the cash receipt application details for invoice \"first\" should be correct", null, { page });
    await And("the cash receipt application details for invoice \"second\" should be correct", null, { page });
    await And("on clicking the journal entry the JE details should be correct", null, { page });
    await And("on clicking the CCN link for invoice \"first\" the CCN details should be correct", null, { page });
    await And("the outstanding balance for invoice \"first\" should decrease by the total amount credited for that invoice", null, { page });
    await And("the outstanding balance for invoice \"second\" should decrease by the total amount credited for that invoice", null, { page });
  });

  test("Full application of cash receipt to invoice", { tag: ["@FIN-CR-TC-004", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"15000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await And("I remember an invoice fully payable by current cash receipt");
    await When("I apply full outstanding amount to remembered invoice", null, { page });
    await Then("the payment should be allocated to remembered invoice", null, { page });
    await And("the remembered invoice should be fully paid", null, { page });
  });

  test("Partial application of cash receipt to invoice", { tag: ["@FIN-CR-TC-005", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"5000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply partial amount \"1000\" to invoice \"first\"", null, { page });
    await Then("the payment should be allocated to invoice \"first\"", null, { page });
  });

  test("Dynamic split settlement on same oldest pending invoice across CR-01 and CR-02", { tag: ["@FIN-CR-TC-006", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"5000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await And("I remember the oldest pending invoice as the target invoice");
    await Given("I create a cash receipt using ratio \"0.40\" of remembered invoice outstanding", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply full cash receipt amount to remembered invoice", null, { page });
    await Given("I create a cash receipt using ratio \"1.10\" of remembered invoice outstanding", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply remaining amount to remembered invoice", null, { page });
    await Then("the remembered invoice should be fully paid", null, { page });
  });

  test("View EPD configuration page", { tag: ["@FIN-EPD-TC-001", "@p1", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the EPD configuration page", null, { page });
    await Then("I should see the EPD Slabs tab and heading", null, { page });
  });

  test("Add EPD slab on configuration page (91-99 days, 2%)", { tag: ["@FIN-EPD-TC-002", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the EPD configuration page", null, { page });
    await When("I remove the EPD slab for days 91 to 99 from the database if it exists", null, { page });
    await And("I add EPD slab on configuration page with days 91 to 99 and discount 2%", null, { page });
    await Then("I should see slab created success message", null, { page });
    await And("I should see EPD slab 91-99 days on configuration page", null, { page });
    await When("I remove the EPD slab for days 91 to 99 from the database", null, { page });
  });

  test("Validation - days to must be greater than days from", { tag: ["@FIN-EPD-TC-003", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the EPD configuration page", null, { page });
    await When("I try to add EPD slab with invalid days 7 to 5 and discount 2%", null, { page });
    await Then("I should see error that days to must be greater than days from", null, { page });
  });

  test("Validation - discount must be between 0 and 100", { tag: ["@FIN-EPD-TC-004", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the EPD configuration page", null, { page });
    await When("I try to add EPD slab with days 0 to 7 and invalid discount 101%", null, { page });
    await Then("I should see error that discount must be between 0 and 100", null, { page });
  });

  test("Preview Calculator shows result for due date and payment date", { tag: ["@FIN-EPD-TC-005", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the EPD configuration page", null, { page });
    await When("I open the Preview Calculator tab and calculate EPD for due date \"2025-02-01\" payment date \"2025-01-25\" amount 10000", null, { page });
    await Then("the EPD preview result should be visible", null, { page });
  });

  test("Toggle Show Inactive slabs", { tag: ["@FIN-EPD-TC-006", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the EPD configuration page", null, { page });
    await When("I toggle Show Inactive slabs", null, { page });
    await Then("the EPD Slabs tab should still show table or empty state", null, { page });
  });

  test("Update slab for oldest allocatable invoice to temporary % and verify EPD reflects then restore", { tag: ["@FIN-EPD-TC-007", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("the EPD slab for the oldest allocatable invoice is set to a temporary test percentage", null, { page });
    await When("I have created a cash receipt with amount \"500\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await And("I select the invoice that shows the temporary EPD percentage", null, { page });
    await Then("the EPD shown for that invoice should match the temporary percentage", null, { page });
    await Then("the EPD slab is restored to its original percentage in the database", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/cash-receipts/manual-cash-receipts.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Apply payment and auto-calculated EPD discount amount": {"pickleLocation":"12:3","tags":["@FIN-CR-TC-001","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-001"]},
  "Toggle EPD enabled or disabled": {"pickleLocation":"24:3","tags":["@FIN-CR-TC-002","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-CR-TC-002"]},
  "Apply payment to two invoices in one submit (first with CCN, second without CCN)": {"pickleLocation":"48:3","tags":["@FIN-CR-TC-003","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-CR-TC-003"]},
  "Full application of cash receipt to invoice": {"pickleLocation":"72:3","tags":["@FIN-CR-TC-004","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-004"]},
  "Partial application of cash receipt to invoice": {"pickleLocation":"83:3","tags":["@FIN-CR-TC-005","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-005"]},
  "Dynamic split settlement on same oldest pending invoice across CR-01 and CR-02": {"pickleLocation":"92:3","tags":["@FIN-CR-TC-006","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-CR-TC-006"]},
  "View EPD configuration page": {"pickleLocation":"108:3","tags":["@FIN-EPD-TC-001","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-001"]},
  "Add EPD slab on configuration page (91-99 days, 2%)": {"pickleLocation":"113:3","tags":["@FIN-EPD-TC-002","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-002"]},
  "Validation - days to must be greater than days from": {"pickleLocation":"123:3","tags":["@FIN-EPD-TC-003","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-003"]},
  "Validation - discount must be between 0 and 100": {"pickleLocation":"129:3","tags":["@FIN-EPD-TC-004","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-004"]},
  "Preview Calculator shows result for due date and payment date": {"pickleLocation":"135:3","tags":["@FIN-EPD-TC-005","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-005"]},
  "Toggle Show Inactive slabs": {"pickleLocation":"141:3","tags":["@FIN-EPD-TC-006","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@FIN-EPD-TC-006"]},
  "Update slab for oldest allocatable invoice to temporary % and verify EPD reflects then restore": {"pickleLocation":"147:3","tags":["@FIN-EPD-TC-007","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-007"]},
};