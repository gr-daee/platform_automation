/** Generated from: e2e/features/p2p/phase-6-receipt-and-quality.feature */
import { test } from "playwright-bdd";

test.describe("Phase 6 - Receipt and Quality (GRN)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("View GRN list page", { tag: ["@P2P-P6-TC-001", "@p1", "@smoke", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the \"p2p/grn\" page", null, { page });
    await Then("I should see the \"Goods Receipt Notes\" heading", null, { page });
    await And("I should see the list or empty state", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/p2p/phase-6-receipt-and-quality.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "View GRN list page": {"pickleLocation":"14:3","tags":["@P2P-P6-TC-001","@p1","@smoke","@iacs-md"],"ownTags":["@iacs-md","@smoke","@p1","@P2P-P6-TC-001"]},
};