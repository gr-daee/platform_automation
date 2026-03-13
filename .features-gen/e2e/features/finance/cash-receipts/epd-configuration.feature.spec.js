/** Generated from: e2e/features/finance/cash-receipts/epd-configuration.feature */
import { test } from "playwright-bdd";

test.describe("Tenant EPD Configuration", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Configure EPD approach", { tag: ["@FIN-EPD-TC-001", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the EPD calculator page", null, { page });
    await When("I select EPD approach \"reduce_outstanding\"", null, { page });
    await Then("EPD should be \"0\" based on slab", null, { page });
  });

  test("Configure EPD formula", { tag: ["@FIN-EPD-TC-002", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the EPD calculator page", null, { page });
    await When("I calculate EPD for invoice dated \"2025-01-01\" paid on \"2025-01-05\"", null, { page });
    await Then("EPD should be \"0\" based on slab", null, { page });
  });

  test("Add EPD slab (0-7 days, 2.5%)", { tag: ["@FIN-EPD-TC-003", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the payment terms page", null, { page });
    await When("I add EPD slab with days 0 to 7 and discount 2%", null, { page });
    await Then("I should see EPD slab for 0-7 days", null, { page });
  });

  test("Verify EPD calculation with configured slabs", { tag: ["@FIN-EPD-TC-004", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("tenant is configured with EPD approach \"reduce_outstanding\"", null, { page });
    await And("tenant has EPD slabs configured");
    await When("I calculate EPD for invoice dated \"2025-01-01\" paid on \"2025-01-05\"", null, { page });
    await Then("EPD should be \"0\" based on slab", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/cash-receipts/epd-configuration.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Configure EPD approach": {"pickleLocation":"12:3","tags":["@FIN-EPD-TC-001","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-001"]},
  "Configure EPD formula": {"pickleLocation":"18:3","tags":["@FIN-EPD-TC-002","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-002"]},
  "Add EPD slab (0-7 days, 2.5%)": {"pickleLocation":"24:3","tags":["@FIN-EPD-TC-003","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-003"]},
  "Verify EPD calculation with configured slabs": {"pickleLocation":"30:3","tags":["@FIN-EPD-TC-004","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@FIN-EPD-TC-004"]},
};