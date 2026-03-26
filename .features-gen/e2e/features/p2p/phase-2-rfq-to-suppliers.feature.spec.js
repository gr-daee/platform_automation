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

  test("RFQ generated from PR should exclude internal budget and cost-center details", { tag: ["@p2p-phase2", "@P2P-P2-TC-005", "@p1", "@regression", "@iacs-md", "@daee-150"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("the RFQ document view should not expose internal budget or cost-center fields", null, { page });
  });

  test("RFQ issue flow should log recipients, issue date, and version for audit", { tag: ["@p2p-phase2", "@P2P-P2-TC-006", "@p1", "@regression", "@iacs-md", "@daee-150"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await And("I invite up to 3 suppliers for the current RFQ", null, { page });
    await And("I issue the current RFQ to invited suppliers", null, { page });
    await Then("the RFQ send audit should capture recipients, issue timestamp, and version details");
  });

  test("RFQ resend should create additional send log entry for audit traceability", { tag: ["@p2p-phase2", "@P2P-P2-TC-007", "@p2", "@regression", "@iacs-md", "@daee-150"] }, async ({ Given, page, When, Then }) => {
    await Given("there is an issued RFQ with supplier recipients in audit", null, { page });
    await When("I perform a resend style action by inviting an additional supplier for the RFQ", null, { page });
    await Then("the RFQ send audit log count should increase for the same RFQ");
  });

  test("PR converted to RFQ should not allow direct Convert to PO action", { tag: ["@p2p-phase2", "@P2P-P2-TC-008", "@p1", "@regression", "@iacs-md", "@daee-150"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("the source procurement request should block direct Convert to PO after RFQ conversion", null, { page });
  });

  test("RFQ minimum suppliers policy should enforce justification for single-source issue", { tag: ["@p2p-phase2", "@P2P-P2-TC-009", "@p2", "@regression", "@iacs-md", "@daee-150"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await And("I invite up to 1 suppliers for the current RFQ", null, { page });
    await Then("issuing the RFQ should require single-source justification when only one supplier is invited", null, { page });
  });

  test("RFQ should allow progression before deadline when all responses are received", { tag: ["@p2p-phase2", "@P2P-P2-TC-010", "@p2", "@regression", "@iacs-md", "@daee-150"] }, async ({ Given, page, Then }) => {
    await Given("there is an issued RFQ with at least one received quote", null, { page });
    await Then("the RFQ should remain actionable for evaluation before response deadline passes", null, { page });
  });

  test.describe("RFQ quote visibility should respect role-based policy", () => {

    test("Example #1", { tag: ["@p2p-phase2", "@P2P-P2-TC-011", "@p2", "@regression", "@multi-user", "@iacs-md", "@iacs-ed", "@daee-150"] }, async ({ Given, page, When, Then }) => {
      await Given("I am logged in as \"IACS MD User\"", null, { page });
      await When("I open an RFQ that has at least one quote", null, { page });
      await Then("quote visibility for \"IACS MD User\" should match configured policy", null, { page });
    });

    test("Example #2", { tag: ["@p2p-phase2", "@P2P-P2-TC-011", "@p2", "@regression", "@multi-user", "@iacs-md", "@iacs-ed", "@daee-150"] }, async ({ Given, page, When, Then }) => {
      await Given("I am logged in as \"IACS ED User\"", null, { page });
      await When("I open an RFQ that has at least one quote", null, { page });
      await Then("quote visibility for \"IACS ED User\" should match configured policy", null, { page });
    });

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
  "RFQ generated from PR should exclude internal budget and cost-center details": {"pickleLocation":"43:3","tags":["@p2p-phase2","@P2P-P2-TC-005","@p1","@regression","@iacs-md","@daee-150"],"ownTags":["@daee-150","@iacs-md","@regression","@p1","@P2P-P2-TC-005"]},
  "RFQ issue flow should log recipients, issue date, and version for audit": {"pickleLocation":"51:3","tags":["@p2p-phase2","@P2P-P2-TC-006","@p1","@regression","@iacs-md","@daee-150"],"ownTags":["@daee-150","@iacs-md","@regression","@p1","@P2P-P2-TC-006"]},
  "RFQ resend should create additional send log entry for audit traceability": {"pickleLocation":"60:3","tags":["@p2p-phase2","@P2P-P2-TC-007","@p2","@regression","@iacs-md","@daee-150"],"ownTags":["@daee-150","@iacs-md","@regression","@p2","@P2P-P2-TC-007"]},
  "PR converted to RFQ should not allow direct Convert to PO action": {"pickleLocation":"66:3","tags":["@p2p-phase2","@P2P-P2-TC-008","@p1","@regression","@iacs-md","@daee-150"],"ownTags":["@daee-150","@iacs-md","@regression","@p1","@P2P-P2-TC-008"]},
  "RFQ minimum suppliers policy should enforce justification for single-source issue": {"pickleLocation":"74:3","tags":["@p2p-phase2","@P2P-P2-TC-009","@p2","@regression","@iacs-md","@daee-150"],"ownTags":["@daee-150","@iacs-md","@regression","@p2","@P2P-P2-TC-009"]},
  "RFQ should allow progression before deadline when all responses are received": {"pickleLocation":"82:3","tags":["@p2p-phase2","@P2P-P2-TC-010","@p2","@regression","@iacs-md","@daee-150"],"ownTags":["@daee-150","@iacs-md","@regression","@p2","@P2P-P2-TC-010"]},
  "RFQ quote visibility should respect role-based policy|Example #1": {"pickleLocation":"94:7","tags":["@p2p-phase2","@P2P-P2-TC-011","@p2","@regression","@multi-user","@iacs-md","@iacs-ed","@daee-150"]},
  "RFQ quote visibility should respect role-based policy|Example #2": {"pickleLocation":"95:7","tags":["@p2p-phase2","@P2P-P2-TC-011","@p2","@regression","@multi-user","@iacs-md","@iacs-ed","@daee-150"]},
};