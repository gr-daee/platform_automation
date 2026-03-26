/** Generated from: e2e/features/p2p/phase-3-quote-capture-selection.feature */
import { test } from "playwright-bdd";

test.describe("Phase 3 - Quote Capture and Selection", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("View Quote Comparison page for an RFQ", { tag: ["@p2p-phase3", "@P2P-P3-TC-001", "@p1", "@smoke", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one RFQ in the list", null, { page });
    await When("I open the first RFQ and navigate to Quote Comparison", null, { page });
    await Then("I should see the \"Quote Comparison\" heading", null, { page });
    await And("I should see either the quote comparison table or \"No quotes\" message", null, { page });
  });

  test("RFQ detail shows Compare Quotes when quotes received or evaluation", { tag: ["@p2p-phase3", "@P2P-P3-TC-002", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one RFQ in the list", null, { page });
    await When("I open the first RFQ detail", null, { page });
    await Then("I should see the RFQ detail page with status and actions", null, { page });
  });

  test("Quote comparison to recommendation – full E2E validation", { tag: ["@p2p-phase3", "@P2P-P3-TC-003", "@p2", "@iacs-md", "@e2e"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("I ensure the current RFQ has one quote for comparison", null, { page });
    await When("I navigate to Quote Comparison for that RFQ", null, { page });
    await Then("I should see the \"Quote Comparison\" heading", null, { page });
    await And("I should see the comparison table with at least one quote row", null, { page });
    await And("I should see \"Lowest Price\" or \"Total Quotes\" summary", null, { page });
    await When("I select the first quote as winning and submit with reason \"AUTO_QA_ Best price and delivery\"", null, { page });
    await Then("I should see a success message for quote selection", null, { page });
    await And("the RFQ should show selection pending or approved state", null, { page });
  });

  test("Create PO from approved selection not available until selection approved", { tag: ["@p2p-phase3", "@P2P-P3-TC-004", "@p2", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the RFQ detail page for an RFQ with selection not yet approved", null, { page });
    await Then("the \"Create PO\" button should not be visible or should be disabled", null, { page });
  });

  test("Captured quote should persist structured fields for comparison", { tag: ["@p2p-phase3", "@P2P-P3-TC-005", "@p1", "@regression", "@iacs-md", "@daee-151"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("I ensure the current RFQ has one quote for comparison", null, { page });
    await Then("the latest quote should include structured fields for rates and validity", null, { page });
  });

  test("Quote comparison should show criteria-based evidence beyond only price", { tag: ["@p2p-phase3", "@P2P-P3-TC-006", "@p2", "@regression", "@iacs-md", "@daee-151"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("I ensure the current RFQ has one quote for comparison", null, { page });
    await When("I navigate to Quote Comparison for that RFQ", null, { page });
    await Then("quote comparison should display decision evidence across defined criteria dimensions", null, { page });
  });

  test("Supplier recommendation should require a documented selection reason", { tag: ["@p2p-phase3", "@P2P-P3-TC-007", "@p2", "@regression", "@iacs-md", "@daee-151"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("I ensure the current RFQ has one quote for comparison", null, { page });
    await When("I navigate to Quote Comparison for that RFQ", null, { page });
    await Then("selecting a winning quote without reason should be blocked by validation", null, { page });
  });

  test("Selector should not be allowed to approve own recommendation", { tag: ["@p2p-phase3", "@P2P-P3-TC-008", "@p1", "@regression", "@iacs-md", "@daee-151"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("I ensure the current RFQ has one quote for comparison", null, { page });
    await When("I navigate to Quote Comparison for that RFQ", null, { page });
    await And("I select the first quote as winning and submit with reason \"AUTO_QA_ recommendation for SoD block\"", null, { page });
    await Then("the selector should be blocked from approving the same RFQ selection", null, { page });
  });

  test("Non-selector approver should be able to approve recommended quote", { tag: ["@p2p-phase3", "@P2P-P3-TC-009", "@p1", "@regression", "@multi-user", "@iacs-md", "@iacs-ed", "@daee-151"] }, async ({ Given, page, And, When, Then, browser }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("I ensure the current RFQ has one quote for comparison", null, { page });
    await When("I navigate to Quote Comparison for that RFQ", null, { page });
    await And("I select the first quote as winning and submit with reason \"AUTO_QA_ recommendation for approver\"", null, { page });
    await And("the ED approver approves the RFQ quote selection in a separate session", null, { browser, page });
    await Then("the RFQ should show selection pending or approved state", null, { page });
  });

  test("Single-quote recommendation should require sole-source justification for issue flow", { tag: ["@p2p-phase3", "@P2P-P3-TC-010", "@p2", "@regression", "@iacs-md", "@daee-151"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("sole-source issue should require justification in RFQ issue confirmation", null, { page });
  });

  test("Non-selected quote should not be allowed for PO creation", { tag: ["@p2p-phase3", "@P2P-P3-TC-011", "@p2", "@regression", "@iacs-md", "@daee-151"] }, async ({ Given, page, Then }) => {
    await Given("I am on the RFQ detail page for an RFQ with selection not yet approved", null, { page });
    await Then("only approved winning selection should allow PO creation", null, { page });
  });

  test("Selected quote should be immutable after selection approval", { tag: ["@p2p-phase3", "@P2P-P3-TC-012", "@p2", "@regression", "@iacs-md", "@daee-151"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/rfq\" page", null, { page });
    await And("there is at least one approved PR available for RFQ", null, { page });
    await When("I create an RFQ from an approved PR with response deadline in 7 days", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await And("I ensure the current RFQ has one quote for comparison", null, { page });
    await When("I navigate to Quote Comparison for that RFQ", null, { page });
    await And("I select the first quote as winning and submit with reason \"AUTO_QA_ immutable check\"", null, { page });
    await Then("quote data for selected recommendation should be immutable or locked for edit", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/p2p/phase-3-quote-capture-selection.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "View Quote Comparison page for an RFQ": {"pickleLocation":"14:3","tags":["@p2p-phase3","@P2P-P3-TC-001","@p1","@smoke","@iacs-md"],"ownTags":["@iacs-md","@smoke","@p1","@P2P-P3-TC-001"]},
  "RFQ detail shows Compare Quotes when quotes received or evaluation": {"pickleLocation":"22:3","tags":["@p2p-phase3","@P2P-P3-TC-002","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@P2P-P3-TC-002"]},
  "Quote comparison to recommendation – full E2E validation": {"pickleLocation":"30:3","tags":["@p2p-phase3","@P2P-P3-TC-003","@p2","@iacs-md","@e2e"],"ownTags":["@e2e","@iacs-md","@p2","@P2P-P3-TC-003"]},
  "Create PO from approved selection not available until selection approved": {"pickleLocation":"45:3","tags":["@p2p-phase3","@P2P-P3-TC-004","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P3-TC-004"]},
  "Captured quote should persist structured fields for comparison": {"pickleLocation":"50:3","tags":["@p2p-phase3","@P2P-P3-TC-005","@p1","@regression","@iacs-md","@daee-151"],"ownTags":["@daee-151","@iacs-md","@regression","@p1","@P2P-P3-TC-005"]},
  "Quote comparison should show criteria-based evidence beyond only price": {"pickleLocation":"59:3","tags":["@p2p-phase3","@P2P-P3-TC-006","@p2","@regression","@iacs-md","@daee-151"],"ownTags":["@daee-151","@iacs-md","@regression","@p2","@P2P-P3-TC-006"]},
  "Supplier recommendation should require a documented selection reason": {"pickleLocation":"69:3","tags":["@p2p-phase3","@P2P-P3-TC-007","@p2","@regression","@iacs-md","@daee-151"],"ownTags":["@daee-151","@iacs-md","@regression","@p2","@P2P-P3-TC-007"]},
  "Selector should not be allowed to approve own recommendation": {"pickleLocation":"79:3","tags":["@p2p-phase3","@P2P-P3-TC-008","@p1","@regression","@iacs-md","@daee-151"],"ownTags":["@daee-151","@iacs-md","@regression","@p1","@P2P-P3-TC-008"]},
  "Non-selector approver should be able to approve recommended quote": {"pickleLocation":"90:3","tags":["@p2p-phase3","@P2P-P3-TC-009","@p1","@regression","@multi-user","@iacs-md","@iacs-ed","@daee-151"],"ownTags":["@daee-151","@iacs-ed","@iacs-md","@multi-user","@regression","@p1","@P2P-P3-TC-009"]},
  "Single-quote recommendation should require sole-source justification for issue flow": {"pickleLocation":"102:3","tags":["@p2p-phase3","@P2P-P3-TC-010","@p2","@regression","@iacs-md","@daee-151"],"ownTags":["@daee-151","@iacs-md","@regression","@p2","@P2P-P3-TC-010"]},
  "Non-selected quote should not be allowed for PO creation": {"pickleLocation":"110:3","tags":["@p2p-phase3","@P2P-P3-TC-011","@p2","@regression","@iacs-md","@daee-151"],"ownTags":["@daee-151","@iacs-md","@regression","@p2","@P2P-P3-TC-011"]},
  "Selected quote should be immutable after selection approval": {"pickleLocation":"115:3","tags":["@p2p-phase3","@P2P-P3-TC-012","@p2","@regression","@iacs-md","@daee-151"],"ownTags":["@daee-151","@iacs-md","@regression","@p2","@P2P-P3-TC-012"]},
};