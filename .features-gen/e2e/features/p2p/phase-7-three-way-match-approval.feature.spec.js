/** Generated from: e2e/features/p2p/phase-7-three-way-match-approval.feature */
import { test } from "playwright-bdd";

test.describe("Phase 7 - Three-Way Match and Approval for Payment", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("View three-way match or payment queue page", { tag: ["@P2P-P7-TC-001", "@p1", "@smoke", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the \"p2p/matching\" page", null, { page });
    await Then("I should see the \"Three-Way Matching\" heading", null, { page });
    await And("I should see the list or empty state", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/p2p/phase-7-three-way-match-approval.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "View three-way match or payment queue page": {"pickleLocation":"14:3","tags":["@P2P-P7-TC-001","@p1","@smoke","@iacs-md"],"ownTags":["@iacs-md","@smoke","@p1","@P2P-P7-TC-001"]},
};