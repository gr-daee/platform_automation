/** Generated from: e2e/features/p2p/phase-8-payment.feature */
import { test } from "playwright-bdd";

test.describe("Phase 8 - Payment", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("View payment queue with marked invoices", { tag: ["@P2P-P8-TC-001", "@p1", "@smoke", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the \"p2p/payment-queue\" page", null, { page });
    await Then("I should see the \"Payment Queue\" heading", null, { page });
    await And("I should see the list or empty state", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/p2p/phase-8-payment.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "View payment queue with marked invoices": {"pickleLocation":"14:3","tags":["@P2P-P8-TC-001","@p1","@smoke","@iacs-md"],"ownTags":["@iacs-md","@smoke","@p1","@P2P-P8-TC-001"]},
};