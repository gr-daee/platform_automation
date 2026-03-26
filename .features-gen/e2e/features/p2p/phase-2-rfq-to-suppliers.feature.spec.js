/** Generated from: e2e/features/p2p/phase-2-rfq-to-suppliers.feature */
import { test } from "playwright-bdd";

test.describe("Phase 2 - RFQ to Suppliers", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("View RFQ list page", { tag: ["@p2p-phase2", "@P2P-P2-TC-001", "@p1", "@smoke", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await Then("I should see the \"Request for Quotation\" heading", null, { page });
    await And("I should see the list or empty state", null, { page });
  });

  test("Create RFQ from approved PR with response deadline", { tag: ["@p2p-phase2", "@P2P-P2-TC-002", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
  });

  test("Approved PR shows converted status after RFQ is created", { tag: ["@p2p-phase2", "@P2P-P2-TC-004", "@p2", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("the source procurement request should show status \"Converted to RFQ\" or an equivalent converted indicator", null, { page });
  });

  test("Create RFQ page shows select PR step and submit not available until PR selected", { tag: ["@p2p-phase2", "@P2P-P2-TC-003", "@p2", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the \"p2p/rfq/create\" page", null, { page });
    await Then("I should see the \"Create RFQ\" heading", null, { page });
    await And("I should see \"Step 1: Select Procurement Request\"", null, { page });
    await And("the Create RFQ submit button should not be visible until a PR is selected", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/p2p/phase-2-rfq-to-suppliers.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "View RFQ list page": {"pickleLocation":"14:3","tags":["@p2p-phase2","@P2P-P2-TC-001","@p1","@smoke","@iacs-md"],"ownTags":["@iacs-md","@smoke","@p1","@P2P-P2-TC-001"]},
  "Create RFQ from approved PR with response deadline": {"pickleLocation":"20:3","tags":["@p2p-phase2","@P2P-P2-TC-002","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@P2P-P2-TC-002"]},
  "Approved PR shows converted status after RFQ is created": {"pickleLocation":"28:3","tags":["@p2p-phase2","@P2P-P2-TC-004","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P2-TC-004"]},
  "Create RFQ page shows select PR step and submit not available until PR selected": {"pickleLocation":"36:3","tags":["@p2p-phase2","@P2P-P2-TC-003","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P2-TC-003"]},
};