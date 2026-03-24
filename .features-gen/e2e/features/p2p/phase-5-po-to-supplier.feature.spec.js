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

  test("Approved PO can be marked as sent to supplier with audit evidence", { tag: ["@P2P-P5-TC-002", "@p1", "@regression", "@iacs-md", "@daee-153"] }, async ({ Given, page, When, Then, And }) => {
    await Given("there is an approved purchase order for supplier send flow", null, { page });
    await When("I mark the current purchase order as sent to supplier", null, { page });
    await Then("the purchase order should be in \"sent to supplier\" or equivalent dispatched state", null, { page });
    await And("PO send event should be auditable with recipient, date, or version context");
  });

  test("PO amendment should create versioned change trail with supersede evidence", { tag: ["@P2P-P5-TC-003", "@p2", "@regression", "@iacs-md", "@daee-153"] }, async ({ Given, page, When, Then }) => {
    await Given("there is a sent-to-supplier purchase order for amendment flow", null, { page });
    await When("I attempt to amend the current purchase order and submit the amendment", null, { page });
    await Then("amendment action should create audit evidence for versioned PO change");
  });

  test("Cancel PO before GRN should block downstream GRN and invoice recording", { tag: ["@P2P-P5-TC-004", "@p1", "@regression", "@iacs-md", "@daee-153"] }, async ({ Given, page, When, Then }) => {
    await Given("there is an approved purchase order without GRN for cancellation flow", null, { page });
    await When("I cancel the current purchase order", null, { page });
    await Then("the cancelled PO should block GRN and supplier invoice recording actions", null, { page });
  });

  test("Cancelling PO after GRN exists should be blocked or policy-gated", { tag: ["@P2P-P5-TC-005", "@p2", "@regression", "@iacs-md", "@daee-153"] }, async ({ Given, page, When, Then }) => {
    await Given("there is a purchase order with at least one GRN for cancellation policy validation", null, { page });
    await When("I attempt to cancel that purchase order", null, { page });
    await Then("cancellation should be blocked or require policy-based escalation", null, { page });
  });

  test("Send and amendment events should be available in PO audit trail", { tag: ["@P2P-P5-TC-006", "@p2", "@regression", "@iacs-md", "@daee-153"] }, async ({ Given, page, Then }) => {
    await Given("there is a sent-to-supplier purchase order for amendment flow", null, { page });
    await Then("PO send and amendment related events should be queryable from audit trail");
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
  "Approved PO can be marked as sent to supplier with audit evidence": {"pickleLocation":"20:3","tags":["@P2P-P5-TC-002","@p1","@regression","@iacs-md","@daee-153"],"ownTags":["@daee-153","@iacs-md","@regression","@p1","@P2P-P5-TC-002"]},
  "PO amendment should create versioned change trail with supersede evidence": {"pickleLocation":"27:3","tags":["@P2P-P5-TC-003","@p2","@regression","@iacs-md","@daee-153"],"ownTags":["@daee-153","@iacs-md","@regression","@p2","@P2P-P5-TC-003"]},
  "Cancel PO before GRN should block downstream GRN and invoice recording": {"pickleLocation":"33:3","tags":["@P2P-P5-TC-004","@p1","@regression","@iacs-md","@daee-153"],"ownTags":["@daee-153","@iacs-md","@regression","@p1","@P2P-P5-TC-004"]},
  "Cancelling PO after GRN exists should be blocked or policy-gated": {"pickleLocation":"39:3","tags":["@P2P-P5-TC-005","@p2","@regression","@iacs-md","@daee-153"],"ownTags":["@daee-153","@iacs-md","@regression","@p2","@P2P-P5-TC-005"]},
  "Send and amendment events should be available in PO audit trail": {"pickleLocation":"45:3","tags":["@P2P-P5-TC-006","@p2","@regression","@iacs-md","@daee-153"],"ownTags":["@daee-153","@iacs-md","@regression","@p2","@P2P-P5-TC-006"]},
};