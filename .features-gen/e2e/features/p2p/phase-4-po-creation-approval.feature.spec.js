/** Generated from: e2e/features/p2p/phase-4-po-creation-approval.feature */
import { test } from "playwright-bdd";

test.describe("Phase 4 - Purchase Order Creation and Approval", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("View Purchase Orders list page", { tag: ["@P2P-P4-TC-001", "@p1", "@smoke", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the \"p2p/purchase-orders\" page", null, { page });
    await Then("I should see the \"Purchase Orders\" heading", null, { page });
    await And("I should see the list or empty state", null, { page });
  });

  test("Create PO from approved quote selection and submit for approval", { tag: ["@P2P-P4-TC-002", "@p1", "@iacs-md", "@e2e"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await When("I create a new procurement request in draft with unique purpose prefix \"AUTO_QA_P4_E2E\"", null, { page });
    await Then("I should see a success message for procurement request creation", null, { page });
    await And("the new procurement request should appear in the list with status \"Draft\"", null, { page });
    await When("I submit the draft procurement request for approval", null, { page });
    await Then("the procurement request status should be \"Submitted\"", null, { page });
    await When("I approve the submitted procurement request", null, { page });
    await Then("I should see a success message for approval", null, { page });
    await And("the procurement request status should be \"Approved\"", null, { page });
    await When("I create an RFQ from the current phase 4 E2E approved procurement request", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await When("I invite up to 3 suppliers and issue the RFQ for phase 4 E2E", null, { page });
    await And("I enter quotes from each invited supplier with distinct unit prices for phase 4 E2E", null, { page });
    await When("I navigate to Quote Comparison for that RFQ", null, { page });
    await Then("I should see the comparison table with at least one quote row", null, { page });
    await When("I select the first quote as winning and submit with reason \"AUTO_QA_ Best price and delivery for P4 E2E\"", null, { page });
    await Then("I should see a success message for quote selection", null, { page });
    await And("I capture the winning quote snapshot from Quote Comparison for the current RFQ", null, { page });
    await When("I approve the RFQ quote selection via test database for the current RFQ", null, { page });
    await When("I create a purchase order from the approved quote selection", null, { page });
    await Then("the purchase order should be created in \"Draft\" status", null, { page });
    await And("the PO supplier, items, quantities, and rates should match the winning quote", null, { page });
    await When("I submit the purchase order for approval", null, { page });
    await Then("the purchase order status should be \"Submitted\"", null, { page });
    await And("the PO status change from \"Draft\" to \"Submitted\" should be auditable", null, { page });
  });

  test("Approver sees quote vs PO and approves within approval limit", { tag: ["@P2P-P4-TC-003", "@p1", "@iacs-md", "@requires-iacs-ed"] }, async ({ Given, page, When, Then, And, browser }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await When("I create a new procurement request in draft with unique purpose prefix \"AUTO_QA_P4_TC003\"", null, { page });
    await Then("I should see a success message for procurement request creation", null, { page });
    await And("the new procurement request should appear in the list with status \"Draft\"", null, { page });
    await When("I submit the draft procurement request for approval", null, { page });
    await Then("the procurement request status should be \"Submitted\"", null, { page });
    await When("I approve the submitted procurement request", null, { page });
    await Then("I should see a success message for approval", null, { page });
    await And("the procurement request status should be \"Approved\"", null, { page });
    await When("I create an RFQ from the current phase 4 E2E approved procurement request", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await When("I invite up to 3 suppliers and issue the RFQ for phase 4 E2E", null, { page });
    await And("I enter quotes from each invited supplier with distinct unit prices for phase 4 E2E", null, { page });
    await When("I navigate to Quote Comparison for that RFQ", null, { page });
    await Then("I should see the comparison table with at least one quote row", null, { page });
    await When("I select the first quote as winning and submit with reason \"AUTO_QA_ Best price and delivery for P4 TC003\"", null, { page });
    await Then("I should see a success message for quote selection", null, { page });
    await And("I capture the winning quote snapshot from Quote Comparison for the current RFQ", null, { page });
    await When("the ED approver approves the RFQ quote selection in a separate session", null, { browser, page });
    await When("I create a purchase order from the approved quote selection", null, { page });
    await Then("the purchase order should be created in \"Draft\" status", null, { page });
    await And("the PO supplier, items, quantities, and rates should match the winning quote", null, { page });
    await When("I submit the purchase order for approval", null, { page });
    await Then("the purchase order status should be \"Submitted\"", null, { page });
    await When("the approver reviews the purchase order with quote vs PO details", null, { browser });
    await Then("the approver should see the winning quote details alongside the PO lines", null, { page });
    await When("the approver approves the submitted purchase order", null, { page });
    await And("the approver logs out and control returns to MD session", null, { page });
    await Then("the purchase order status should be \"Approved\"", null, { page });
    await And("the approval action and status change should be auditable", null, { page });
  });

  test("PO at approver limit is allowed but value above routes to higher approver", { tag: ["@P2P-P4-TC-004", "@p2", "@iacs-md"] }, async ({ Given, When, Then, And }) => {
    await Given("there is a submitted purchase order with value exactly at the current approver's approval limit");
    await When("the approver approves that purchase order");
    await Then("the purchase order should be approved without escalation");
    await And("the approval should respect the configured approval limit");
    await Given("there is another submitted purchase order with value just above the current approver's limit");
    await When("the same approver attempts to approve that purchase order");
    await Then("the system should route the approval to a higher level approver or prevent approval");
    await And("the attempted approval and routing should be auditable");
  });

  test("Approve and send to supplier actions not allowed from Draft", { tag: ["@P2P-P4-TC-005", "@p2", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("there is a draft purchase order for testing", null, { page });
    await Then("the Approve action should not be available for the draft purchase order", null, { page });
    await And("the Send to supplier action should not be available for the draft purchase order", null, { page });
  });

  test("Approve only from Submitted and send to supplier only from Approved", { tag: ["@P2P-P4-TC-006", "@p2", "@iacs-md"] }, async ({ Given, page, Then, And, When }) => {
    await Given("there is a submitted purchase order for testing", null, { page });
    await Then("the Approve action should be available for the submitted purchase order", null, { page });
    await And("the Send to supplier action should not be available for the submitted purchase order", null, { page });
    await When("I approve the submitted purchase order", null, { page });
    await Then("the purchase order status should be \"Approved\"", null, { page });
    await And("the Send to supplier action should now be available", null, { page });
  });

  test("Delivery Warehouse selection shows available warehouses during PO creation", { tag: ["@P2P-P4-TC-008", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await When("I create a new procurement request in draft with unique purpose prefix \"AUTO_QA_P4_TC008\"", null, { page });
    await Then("I should see a success message for procurement request creation", null, { page });
    await And("the new procurement request should appear in the list with status \"Draft\"", null, { page });
    await When("I submit the draft procurement request for approval", null, { page });
    await Then("the procurement request status should be \"Submitted\"", null, { page });
    await When("I approve the submitted procurement request", null, { page });
    await Then("I should see a success message for approval", null, { page });
    await And("the procurement request status should be \"Approved\"", null, { page });
    await When("I create an RFQ from the current phase 4 E2E approved procurement request", null, { page });
    await Then("I should be on the RFQ detail page", null, { page });
    await When("I invite up to 3 suppliers and issue the RFQ for phase 4 E2E", null, { page });
    await And("I enter quotes from each invited supplier with distinct unit prices for phase 4 E2E", null, { page });
    await When("I navigate to Quote Comparison for that RFQ", null, { page });
    await Then("I should see the comparison table with at least one quote row", null, { page });
    await When("I select the first quote as winning and submit with reason \"AUTO_QA_ Delivery warehouse check for P4 TC008\"", null, { page });
    await Then("I should see a success message for quote selection", null, { page });
    await When("I approve the RFQ quote selection via test database for the current RFQ", null, { page });
    await When("I start creating a purchase order from the approved quote selection", null, { page });
    await Then("the Delivery Warehouse selection dialog should list at least one warehouse for the tenant", null, { page });
  });

  test("One procurement request generates multiple purchase orders and PR is fully converted", { tag: ["@P2P-P4-TC-007", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("there is an approved procurement request with items awarded to multiple suppliers via quote selection", null, { page });
    await When("I create a purchase order for the lines awarded to Supplier A from that procurement request", null, { page });
    await And("I create another purchase order for the lines awarded to Supplier B from that procurement request", null, { page });
    await And("I create a third purchase order for the remaining split quantities from that procurement request", null, { page });
    await Then("the procurement request should track that all its lines are covered by purchase orders", null, { page });
    await And("the procurement request should be marked as \"Fully converted\" or equivalent status", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/p2p/phase-4-po-creation-approval.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "View Purchase Orders list page": {"pickleLocation":"14:3","tags":["@P2P-P4-TC-001","@p1","@smoke","@iacs-md"],"ownTags":["@iacs-md","@smoke","@p1","@P2P-P4-TC-001"]},
  "Create PO from approved quote selection and submit for approval": {"pickleLocation":"23:3","tags":["@P2P-P4-TC-002","@p1","@iacs-md","@e2e"],"ownTags":["@e2e","@iacs-md","@p1","@P2P-P4-TC-002"]},
  "Approver sees quote vs PO and approves within approval limit": {"pickleLocation":"52:3","tags":["@P2P-P4-TC-003","@p1","@iacs-md","@requires-iacs-ed"],"ownTags":["@requires-iacs-ed","@iacs-md","@p1","@P2P-P4-TC-003"]},
  "PO at approver limit is allowed but value above routes to higher approver": {"pickleLocation":"88:3","tags":["@P2P-P4-TC-004","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P4-TC-004"]},
  "Approve and send to supplier actions not allowed from Draft": {"pickleLocation":"100:3","tags":["@P2P-P4-TC-005","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P4-TC-005"]},
  "Approve only from Submitted and send to supplier only from Approved": {"pickleLocation":"106:3","tags":["@P2P-P4-TC-006","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P4-TC-006"]},
  "Delivery Warehouse selection shows available warehouses during PO creation": {"pickleLocation":"116:3","tags":["@P2P-P4-TC-008","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P4-TC-008"]},
  "One procurement request generates multiple purchase orders and PR is fully converted": {"pickleLocation":"140:3","tags":["@P2P-P4-TC-007","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P4-TC-007"]},
};