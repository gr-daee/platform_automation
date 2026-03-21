/** Generated from: e2e/features/finance/cash-receipts/van-cash-receipts.feature */
import { test } from "playwright-bdd";

test.describe("VAN Cash Receipts", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Valid VAN validation succeeds", { tag: ["@FIN-VAN-TC-001", "@smoke", "@critical", "@p0", "@iacs-md"] }, async ({ When, Then }) => {
    await When("I send VAN validation request with VAN \"IACS1234\" and amount \"5000.00\"");
    await Then("VAN validation should succeed with dealer");
  });

  test("Invalid VAN is rejected", { tag: ["@FIN-VAN-TC-002", "@negative", "@iacs-md"] }, async ({ When, Then }) => {
    await When("I send VAN validation request with VAN \"INVALID_VAN_999\" and amount \"5000.00\"");
    await Then("VAN validation should fail with message containing \"not found or inactive\"");
  });

  test("Invalid signature is rejected", { tag: ["@FIN-VAN-TC-003", "@security", "@iacs-md"] }, async ({ When, Then }) => {
    await When("I send VAN validation request with invalid signature");
    await Then("VAN validation should fail with message containing \"signature\"");
  });

  test("Unvalidated payment is rejected on posting", { tag: ["@FIN-VAN-TC-004", "@negative", "@iacs-md"] }, async ({ When, Then }) => {
    await When("I send VAN posting request with UTR \"UNVALIDATED_UTR_001\"");
    await Then("VAN posting should fail with message containing \"validated\"");
  });

  test("Successful posting creates cash receipt and FIFO allocation", { tag: ["@FIN-VAN-TC-005", "@critical", "@p0", "@iacs-md"] }, async ({ When, Then, And }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await And("payment should be allocated FIFO to invoices");
  });

  test("Duplicate UTR is rejected", { tag: ["@FIN-VAN-TC-006", "@edge", "@iacs-md"] }, async ({ When, And, Then }) => {
    await When("I send VAN validation request with VAN \"IACS1234\" and amount \"5000.00\" and UTR \"AUTO_QA_DUP_UTR\"");
    await And("I send VAN posting request with UTR \"AUTO_QA_DUP_UTR\"");
    await And("I send VAN posting request with UTR \"AUTO_QA_DUP_UTR\"");
    await Then("VAN posting should fail with message containing \"duplicate\"");
  });

  test("Posted VAN payment shows EPD discount in receipt details", { tag: ["@FIN-VAN-TC-007", "@critical", "@p0", "@iacs-md"] }, async ({ When, Then, And, page }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await And("I open the cash receipt for the last VAN payment", null, { page });
    await And("the receipt detail shows EPD discount displayed", null, { page });
  });

  test("VAN payment then verify receipt and invoice in UI", { tag: ["@FIN-VAN-TC-008", "@smoke", "@critical", "@p0", "@iacs-md"] }, async ({ When, Then, And, page }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await And("I open the cash receipt for the last VAN payment", null, { page });
    await And("the receipt detail shows amount applied and status", null, { page });
    await And("the invoice for the last VAN payment is Paid with balance zero", null, { page });
  });

  test("Un-apply then re-apply receipt", { tag: ["@FIN-VAN-TC-009", "@regression", "@p1", "@iacs-md"] }, async ({ When, Then, And, page }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await And("I open the cash receipt for the last VAN payment", null, { page });
    await And("I un-apply the receipt", null, { page });
    await When("I re-apply the receipt to invoices", null, { page });
    await And("I open the cash receipt for the last VAN payment", null, { page });
    await Then("the receipt detail shows amount applied and status", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/cash-receipts/van-cash-receipts.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Valid VAN validation succeeds": {"pickleLocation":"15:3","tags":["@FIN-VAN-TC-001","@smoke","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@smoke","@FIN-VAN-TC-001"]},
  "Invalid VAN is rejected": {"pickleLocation":"20:3","tags":["@FIN-VAN-TC-002","@negative","@iacs-md"],"ownTags":["@iacs-md","@negative","@FIN-VAN-TC-002"]},
  "Invalid signature is rejected": {"pickleLocation":"25:3","tags":["@FIN-VAN-TC-003","@security","@iacs-md"],"ownTags":["@iacs-md","@security","@FIN-VAN-TC-003"]},
  "Unvalidated payment is rejected on posting": {"pickleLocation":"30:3","tags":["@FIN-VAN-TC-004","@negative","@iacs-md"],"ownTags":["@iacs-md","@negative","@FIN-VAN-TC-004"]},
  "Successful posting creates cash receipt and FIFO allocation": {"pickleLocation":"35:3","tags":["@FIN-VAN-TC-005","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-VAN-TC-005"]},
  "Duplicate UTR is rejected": {"pickleLocation":"42:3","tags":["@FIN-VAN-TC-006","@edge","@iacs-md"],"ownTags":["@iacs-md","@edge","@FIN-VAN-TC-006"]},
  "Posted VAN payment shows EPD discount in receipt details": {"pickleLocation":"49:3","tags":["@FIN-VAN-TC-007","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-VAN-TC-007"]},
  "VAN payment then verify receipt and invoice in UI": {"pickleLocation":"57:3","tags":["@FIN-VAN-TC-008","@smoke","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@smoke","@FIN-VAN-TC-008"]},
  "Un-apply then re-apply receipt": {"pickleLocation":"66:3","tags":["@FIN-VAN-TC-009","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@FIN-VAN-TC-009"]},
};