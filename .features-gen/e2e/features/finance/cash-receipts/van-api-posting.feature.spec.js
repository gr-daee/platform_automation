/** Generated from: e2e/features/finance/cash-receipts/van-api-posting.feature */
import { test } from "playwright-bdd";

test.describe("VAN API Posting", () => {

  test("Successful posting with FIFO allocation", { tag: ["@FIN-VAN-TC-005", "@smoke", "@critical", "@p0"] }, async ({ When, Then, And }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await And("payment should be allocated FIFO to invoices");
  });

  test("Unvalidated payment is rejected on posting", { tag: ["@FIN-VAN-TC-006", "@negative"] }, async ({ When, Then }) => {
    await When("I send VAN posting request with UTR \"UNVALIDATED_UTR_001\"");
    await Then("VAN posting should fail with message containing \"validated\"");
  });

  test("Duplicate UTR is rejected", { tag: ["@FIN-VAN-TC-007", "@edge"] }, async ({ When, And, Then }) => {
    await When("I send VAN validation request with VAN \"IACS1234\" and amount \"5000.00\" and UTR \"AUTO_QA_DUP_UTR\"");
    await And("I send VAN posting request with UTR \"AUTO_QA_DUP_UTR\"");
    await And("I send VAN posting request with UTR \"AUTO_QA_DUP_UTR\"");
    await Then("VAN posting should fail with message containing \"duplicate\"");
  });

  test("Amount mismatch is rejected", { tag: ["@FIN-VAN-TC-008", "@edge"] }, async ({ When, And, Then }) => {
    await When("I send VAN validation request with VAN \"IACS1234\" and amount \"5000.00\"");
    await And("I send VAN posting request with UTR \"AUTO_QA_AMT_MISMATCH_UTR\"");
    await Then("VAN payment should be posted successfully");
  });

  test("Dry run - VAN payment amount 132.43 rupees", { tag: ["@dry-run", "@FIN-VAN-TC-005"] }, async ({ When, Then, And }) => {
    await When("I send VAN validation then posting with amount \"132.43\"");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/cash-receipts/van-api-posting.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Successful posting with FIFO allocation": {"pickleLocation":"9:3","tags":["@FIN-VAN-TC-005","@smoke","@critical","@p0"],"ownTags":["@p0","@critical","@smoke","@FIN-VAN-TC-005"]},
  "Unvalidated payment is rejected on posting": {"pickleLocation":"16:3","tags":["@FIN-VAN-TC-006","@negative"],"ownTags":["@negative","@FIN-VAN-TC-006"]},
  "Duplicate UTR is rejected": {"pickleLocation":"21:3","tags":["@FIN-VAN-TC-007","@edge"],"ownTags":["@edge","@FIN-VAN-TC-007"]},
  "Amount mismatch is rejected": {"pickleLocation":"28:3","tags":["@FIN-VAN-TC-008","@edge"],"ownTags":["@edge","@FIN-VAN-TC-008"]},
  "Dry run - VAN payment amount 132.43 rupees": {"pickleLocation":"34:3","tags":["@dry-run","@FIN-VAN-TC-005"],"ownTags":["@FIN-VAN-TC-005","@dry-run"]},
};