/** Generated from: e2e/features/finance/cash-receipts/van-fifo-allocation.feature */
import { test } from "playwright-bdd";

test.describe("VAN FIFO Allocation", () => {

  test("Overpayment creates advance", { tag: ["@FIN-VAN-TC-023", "@edge"] }, async ({ When, Then, And }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("payment should be allocated FIFO to invoices");
  });

  test("No invoices creates full advance", { tag: ["@FIN-VAN-TC-024", "@edge"] }, async ({ When, Then }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/cash-receipts/van-fifo-allocation.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Overpayment creates advance": {"pickleLocation":"9:3","tags":["@FIN-VAN-TC-023","@edge"],"ownTags":["@edge","@FIN-VAN-TC-023"]},
  "No invoices creates full advance": {"pickleLocation":"15:3","tags":["@FIN-VAN-TC-024","@edge"],"ownTags":["@edge","@FIN-VAN-TC-024"]},
};