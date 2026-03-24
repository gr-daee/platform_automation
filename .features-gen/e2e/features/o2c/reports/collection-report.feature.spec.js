/** Generated from: e2e/features/o2c/reports/collection-report.feature */
import { test } from "playwright-bdd";

test.describe("Collection Report correctness and export parity", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Quick period This Month sets From and To date correctly", { tag: ["@O2C-CR-TC-001", "@smoke", "@p0", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Collection Report page", null, { page });
    await When("I select collection quick period \"This Month\"", null, { page });
    await Then("the collection report From and To date should reflect current month range", null, { page });
  });

  test("Collection efficiency KPI card is visible after loading report", { tag: ["@O2C-CR-TC-002", "@smoke", "@p0", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Collection Report page", null, { page });
    await When("I click Load Report in Collection Report", null, { page });
    await Then("I should see \"Collections vs Outstanding %\" in collection summary cards", null, { page });
  });

  test("Period totals should match summary total amount", { tag: ["@O2C-CR-TC-003", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Collection Report page", null, { page });
    await When("I click Load Report in Collection Report", null, { page });
    await Then("sum of By Period amounts should approximately match summary total amount", null, { page });
  });

  test("Payment, region and dealer totals should match summary total amount", { tag: ["@O2C-CR-TC-005", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Collection Report page", null, { page });
    await When("I click Load Report in Collection Report", null, { page });
    await Then("sum of By Payment Method, By Region and By Dealer amounts should approximately match summary total amount", null, { page });
  });

  test("Export Excel should include efficiency and comparison sections", { tag: ["@O2C-CR-TC-004", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Collection Report page", null, { page });
    await When("I click Load Report in Collection Report", null, { page });
    await And("I export Collection Report to Excel", null, { page });
    await Then("the exported Collection Report workbook should include efficiency and comparison sections");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/o2c/reports/collection-report.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Quick period This Month sets From and To date correctly": {"pickleLocation":"10:3","tags":["@O2C-CR-TC-001","@smoke","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@smoke","@O2C-CR-TC-001"]},
  "Collection efficiency KPI card is visible after loading report": {"pickleLocation":"16:3","tags":["@O2C-CR-TC-002","@smoke","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@smoke","@O2C-CR-TC-002"]},
  "Period totals should match summary total amount": {"pickleLocation":"22:3","tags":["@O2C-CR-TC-003","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@O2C-CR-TC-003"]},
  "Payment, region and dealer totals should match summary total amount": {"pickleLocation":"28:3","tags":["@O2C-CR-TC-005","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@O2C-CR-TC-005"]},
  "Export Excel should include efficiency and comparison sections": {"pickleLocation":"34:3","tags":["@O2C-CR-TC-004","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@O2C-CR-TC-004"]},
};