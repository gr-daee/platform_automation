/** Generated from: e2e/features/finance/cash-receipts/epd-configuration.feature */
import { test } from "playwright-bdd";

test.describe("Tenant EPD Configuration", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
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
  $uri: ({}, use) => use("e2e/features/finance/cash-receipts/epd-configuration.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "View EPD configuration page": {"pickleLocation":"14:3","tags":["@FIN-EPD-TC-001","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-001"]},
  "Add EPD slab on configuration page (91-99 days, 2%)": {"pickleLocation":"19:3","tags":["@FIN-EPD-TC-002","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-002"]},
  "Validation - days to must be greater than days from": {"pickleLocation":"29:3","tags":["@FIN-EPD-TC-003","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-003"]},
  "Validation - discount must be between 0 and 100": {"pickleLocation":"35:3","tags":["@FIN-EPD-TC-004","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-004"]},
  "Preview Calculator shows result for due date and payment date": {"pickleLocation":"41:3","tags":["@FIN-EPD-TC-005","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-005"]},
  "Toggle Show Inactive slabs": {"pickleLocation":"47:3","tags":["@FIN-EPD-TC-006","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@FIN-EPD-TC-006"]},
  "Update slab for oldest allocatable invoice to temporary % and verify EPD reflects then restore": {"pickleLocation":"54:3","tags":["@FIN-EPD-TC-007","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-007"]},
};