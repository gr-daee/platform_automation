/** Generated from: e2e/features/o2c/reports/hierarchical-product-sales.feature */
import { test } from "playwright-bdd";

test.describe("Hierarchical Product Sales dealer level and city export", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Hierarchy shows Dealer level between Territory and Product", { tag: ["@O2C-HPS-TC-001", "@smoke", "@p0", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Hierarchical Product Sales Report page", null, { page });
    await When("I generate the Hierarchical Product Sales report with this month", null, { page });
    await Then("I should see at least one dealer row in the hierarchy", null, { page });
  });

  test("Dealer city is visible in hierarchy UI", { tag: ["@O2C-HPS-TC-002", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Hierarchical Product Sales Report page", null, { page });
    await When("I generate the Hierarchical Product Sales report with this month", null, { page });
    await Then("dealer rows should show city badge or fallback \"-\"", null, { page });
  });

  test("Excel hierarchy report includes DEALER level and City column", { tag: ["@O2C-HPS-TC-003", "@smoke", "@p0", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Hierarchical Product Sales Report page", null, { page });
    await When("I generate the Hierarchical Product Sales report with this month", null, { page });
    await And("I export Hierarchical Product Sales to detailed Excel", null, { page });
    await Then("Hierarchy Report sheet should contain City column and DEALER rows");
  });

  test("Excel dealer city is available in invoice and ranking sheets", { tag: ["@O2C-HPS-TC-004", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Hierarchical Product Sales Report page", null, { page });
    await When("I generate the Hierarchical Product Sales report with this month", null, { page });
    await And("I export Hierarchical Product Sales to detailed Excel", null, { page });
    await Then("Invoice Details and Dealer Ranking sheets should include City column");
  });

  test("Excel hierarchy report includes Variant Code column", { tag: ["@O2C-HPS-TC-005", "@DAEE-336", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Hierarchical Product Sales Report page", null, { page });
    await When("I generate the Hierarchical Product Sales report with this month", null, { page });
    await And("I export Hierarchical Product Sales to detailed Excel", null, { page });
    await Then("Hierarchy Report sheet should include Variant Code column with data");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/o2c/reports/hierarchical-product-sales.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Hierarchy shows Dealer level between Territory and Product": {"pickleLocation":"10:3","tags":["@O2C-HPS-TC-001","@smoke","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@smoke","@O2C-HPS-TC-001"]},
  "Dealer city is visible in hierarchy UI": {"pickleLocation":"16:3","tags":["@O2C-HPS-TC-002","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@O2C-HPS-TC-002"]},
  "Excel hierarchy report includes DEALER level and City column": {"pickleLocation":"22:3","tags":["@O2C-HPS-TC-003","@smoke","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@smoke","@O2C-HPS-TC-003"]},
  "Excel dealer city is available in invoice and ranking sheets": {"pickleLocation":"29:3","tags":["@O2C-HPS-TC-004","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@O2C-HPS-TC-004"]},
  "Excel hierarchy report includes Variant Code column": {"pickleLocation":"36:3","tags":["@O2C-HPS-TC-005","@DAEE-336","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-336","@O2C-HPS-TC-005"]},
};