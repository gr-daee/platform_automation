/** Generated from: e2e/features/finance/cash-receipts/van-epd-discount.feature */
import { test } from "playwright-bdd";

test.describe("VAN EPD Discount", () => {

  test("EPD discount calculated for VAN payment", { tag: ["@FIN-VAN-TC-014", "@critical", "@p0"] }, async ({ When, Then, And }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("EPD discount should be calculated correctly");
  });

  test("VAN payment allocated FIFO when no EPD", { tag: ["@FIN-VAN-TC-015", "@edge"] }, async ({ When, Then, And }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("payment should be allocated FIFO to invoices");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/cash-receipts/van-epd-discount.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "EPD discount calculated for VAN payment": {"pickleLocation":"9:3","tags":["@FIN-VAN-TC-014","@critical","@p0"],"ownTags":["@p0","@critical","@FIN-VAN-TC-014"]},
  "VAN payment allocated FIFO when no EPD": {"pickleLocation":"15:3","tags":["@FIN-VAN-TC-015","@edge"],"ownTags":["@edge","@FIN-VAN-TC-015"]},
};