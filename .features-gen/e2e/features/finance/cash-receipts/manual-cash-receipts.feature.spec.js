/** Generated from: e2e/features/finance/cash-receipts/manual-cash-receipts.feature */
import { test } from "playwright-bdd";

test.describe("Manual Cash Receipts", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Apply payment and auto-calculated EPD discount amount", { tag: ["@FIN-CR-TC-003", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
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
  "Apply payment and auto-calculated EPD discount amount": {"pickleLocation":"12:3","tags":["@FIN-CR-TC-003","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-003"]},
  "Toggle EPD enabled or disabled": {"pickleLocation":"24:3","tags":["@FIN-CR-TC-004","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-CR-TC-004"]},
  "Apply payment to multiple invoices": {"pickleLocation":"31:3","tags":["@FIN-CR-TC-005","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-CR-TC-005"]},
  "Full application of cash receipt to invoice": {"pickleLocation":"40:3","tags":["@FIN-CR-TC-006","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-006"]},
  "Partial application of cash receipt to invoice": {"pickleLocation":"49:3","tags":["@FIN-CR-TC-007","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-007"]},
  "Partial application then full application": {"pickleLocation":"58:3","tags":["@FIN-CR-TC-008","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-CR-TC-008"]},
};