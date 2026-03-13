/** Generated from: e2e/features/finance/cash-receipts/van-auto-payment-e2e.feature */
import { test } from "playwright-bdd";

test.describe("VAN Auto Payment E2E", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Happy path - VAN payment then verify receipt and invoice in UI", { tag: ["@FIN-VAN-E2E-001", "@smoke", "@critical", "@p0"] }, async ({ When, Then, And, page }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await And("I open the cash receipt for the last VAN payment", null, { page });
    await And("the receipt detail shows amount applied and status", null, { page });
    await And("the invoice for the last VAN payment is Paid with balance zero", null, { page });
  });

  test("EPD verification - VAN payment then verify EPD on receipt detail", { tag: ["@FIN-VAN-E2E-002", "@critical", "@p0"] }, async ({ When, Then, And, page }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await And("I open the cash receipt for the last VAN payment", null, { page });
    await And("the receipt detail shows EPD discount displayed", null, { page });
  });

  test("Un-apply then re-apply receipt (Phase 5 regression)", { tag: ["@FIN-VAN-E2E-003", "@regression", "@p1"] }, async ({ When, Then, And, page }) => {
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
  $uri: ({}, use) => use("e2e/features/finance/cash-receipts/van-auto-payment-e2e.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Happy path - VAN payment then verify receipt and invoice in UI": {"pickleLocation":"12:3","tags":["@FIN-VAN-E2E-001","@smoke","@critical","@p0"],"ownTags":["@p0","@critical","@smoke","@FIN-VAN-E2E-001"]},
  "EPD verification - VAN payment then verify EPD on receipt detail": {"pickleLocation":"21:3","tags":["@FIN-VAN-E2E-002","@critical","@p0"],"ownTags":["@p0","@critical","@FIN-VAN-E2E-002"]},
  "Un-apply then re-apply receipt (Phase 5 regression)": {"pickleLocation":"29:3","tags":["@FIN-VAN-E2E-003","@regression","@p1"],"ownTags":["@p1","@regression","@FIN-VAN-E2E-003"]},
};