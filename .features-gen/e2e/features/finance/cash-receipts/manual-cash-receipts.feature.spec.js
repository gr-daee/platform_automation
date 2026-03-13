/** Generated from: e2e/features/finance/cash-receipts/manual-cash-receipts.feature */
import { test } from "playwright-bdd";

test.describe("Manual Cash Receipts", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Create manual cash receipt", { tag: ["@FIN-CR-TC-001", "@smoke", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the cash receipts page", null, { page });
    await When("I click New Cash Receipt", null, { page });
    await And("I fill cash receipt form with customer \"Ramesh ningappa diggai\" and amount \"5000\"", null, { page });
    await And("I save the cash receipt", null, { page });
    await Then("the cash receipt should be created successfully", null, { page });
  });

  test("Apply payment to invoice", { tag: ["@FIN-CR-TC-002", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"5000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"1000\"", null, { page });
    await Then("the payment should be allocated to invoice \"first\"", null, { page });
  });

  test("Adjust EPD discount amount", { tag: ["@FIN-CR-TC-003", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"5000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"1000\"", null, { page });
    await Then("the EPD discount should be \"25\"", null, { page });
  });

  test("Toggle EPD enabled or disabled", { tag: ["@FIN-CR-TC-004", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"5000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"1000\"", null, { page });
    await Then("the payment should be allocated to invoice \"first\"", null, { page });
  });

  test("Apply payment to multiple invoices", { tag: ["@FIN-CR-TC-005", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"5000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"500\"", null, { page });
    await And("I apply cash receipt \"<receiptId>\" to invoice \"second\" with amount \"500\"", null, { page });
    await Then("the payment should be allocated to invoice \"first\"", null, { page });
    await And("the payment should be allocated to invoice \"second\"", null, { page });
  });

  test("Full application of cash receipt to invoice", { tag: ["@FIN-CR-TC-006", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"5000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply full outstanding amount to invoice \"first\"", null, { page });
    await Then("the payment should be allocated to invoice \"first\"", null, { page });
    await And("invoice \"first\" should be fully paid", null, { page });
  });

  test("Partial application of cash receipt to invoice", { tag: ["@FIN-CR-TC-007", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"5000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply partial amount \"1000\" to invoice \"first\"", null, { page });
    await Then("the payment should be allocated to invoice \"first\"", null, { page });
  });

  test("Partial application then full application", { tag: ["@FIN-CR-TC-008", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"5000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply partial amount \"1000\" to invoice \"first\"", null, { page });
    await When("I navigate to the apply page for the current cash receipt again", null, { page });
    await And("I apply remaining amount to invoice \"first\"", null, { page });
    await Then("invoice \"first\" should be fully paid", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/cash-receipts/manual-cash-receipts.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Create manual cash receipt": {"pickleLocation":"13:3","tags":["@FIN-CR-TC-001","@smoke","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@smoke","@FIN-CR-TC-001"]},
  "Apply payment to invoice": {"pickleLocation":"21:3","tags":["@FIN-CR-TC-002","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-002"]},
  "Adjust EPD discount amount": {"pickleLocation":"28:3","tags":["@FIN-CR-TC-003","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-CR-TC-003"]},
  "Toggle EPD enabled or disabled": {"pickleLocation":"35:3","tags":["@FIN-CR-TC-004","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-CR-TC-004"]},
  "Apply payment to multiple invoices": {"pickleLocation":"42:3","tags":["@FIN-CR-TC-005","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-CR-TC-005"]},
  "Full application of cash receipt to invoice": {"pickleLocation":"51:3","tags":["@FIN-CR-TC-006","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-006"]},
  "Partial application of cash receipt to invoice": {"pickleLocation":"60:3","tags":["@FIN-CR-TC-007","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-007"]},
  "Partial application then full application": {"pickleLocation":"69:3","tags":["@FIN-CR-TC-008","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-CR-TC-008"]},
};