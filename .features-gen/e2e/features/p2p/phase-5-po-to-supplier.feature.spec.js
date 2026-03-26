/** Generated from: e2e/features/p2p/phase-5-po-to-supplier.feature */
import { test } from "playwright-bdd";

test.describe("Phase 5 - PO to Supplier", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("View Purchase Orders page for send flow", { tag: ["@P2P-P5-TC-001", "@p1", "@smoke", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the \"p2p/purchase-orders\" page", null, { page });
    await Then("I should see the \"Purchase Orders\" heading", null, { page });
    await And("I should see the list or empty state", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/p2p/phase-5-po-to-supplier.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "View Purchase Orders page for send flow": {"pickleLocation":"14:3","tags":["@P2P-P5-TC-001","@p1","@smoke","@iacs-md"],"ownTags":["@iacs-md","@smoke","@p1","@P2P-P5-TC-001"]},
};