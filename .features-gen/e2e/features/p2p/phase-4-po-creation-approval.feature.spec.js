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

  test("Create PO from approved quote selection and submit for approval", { tag: ["@P2P-P4-TC-002", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("there is an RFQ with an approved quote selection ready for PO creation", null, { page });
    await When("I create a purchase order from the approved quote selection", null, { page });
    await Then("the purchase order should be created in \"Draft\" status", null, { page });
    await And("the PO supplier, items, quantities, and rates should match the winning quote", null, { page });
    await When("I submit the purchase order for approval", null, { page });
    await Then("the purchase order status should be \"Submitted\"", null, { page });
    await And("the PO status change from \"Draft\" to \"Submitted\" should be auditable", null, { page });
  });

  test("Approver sees quote vs PO and approves within approval limit", { tag: ["@P2P-P4-TC-003", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("there is a submitted purchase order awaiting approval and within the approver's value limit", null, { page });
    await When("the approver reviews the purchase order with quote vs PO details", null, { page });
    await Then("the approver should see the winning quote details alongside the PO lines", null, { page });
    await When("the approver approves the submitted purchase order", null, { page });
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

  test("Delivery Warehouse selection shows available warehouses during PO creation", { tag: ["@P2P-P4-TC-008", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("there is an RFQ with an approved quote selection ready for PO creation", null, { page });
    await When("I start creating a purchase order from the approved quote selection", null, { page });
    await Then("the Delivery Warehouse selection dialog should list at least one warehouse for the tenant", null, { page });
  });

  test("One procurement request generates multiple purchase orders and PR is fully converted", { tag: ["@P2P-P4-TC-007", "@p2", "@iacs-md"] }, async ({ Given, When, And, Then }) => {
    await Given("there is an approved procurement request with items awarded to multiple suppliers via quote selection");
    await When("I create a purchase order for the lines awarded to Supplier A from that procurement request");
    await And("I create another purchase order for the lines awarded to Supplier B from that procurement request");
    await Then("the procurement request should track that all its lines are covered by purchase orders");
    await And("the procurement request should be marked as \"Fully converted\" or equivalent status");
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
  "Create PO from approved quote selection and submit for approval": {"pickleLocation":"21:3","tags":["@P2P-P4-TC-002","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@P2P-P4-TC-002"]},
  "Approver sees quote vs PO and approves within approval limit": {"pickleLocation":"32:3","tags":["@P2P-P4-TC-003","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@P2P-P4-TC-003"]},
  "PO at approver limit is allowed but value above routes to higher approver": {"pickleLocation":"42:3","tags":["@P2P-P4-TC-004","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P4-TC-004"]},
  "Approve and send to supplier actions not allowed from Draft": {"pickleLocation":"54:3","tags":["@P2P-P4-TC-005","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P4-TC-005"]},
  "Approve only from Submitted and send to supplier only from Approved": {"pickleLocation":"60:3","tags":["@P2P-P4-TC-006","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P4-TC-006"]},
  "Delivery Warehouse selection shows available warehouses during PO creation": {"pickleLocation":"70:3","tags":["@P2P-P4-TC-008","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P4-TC-008"]},
  "One procurement request generates multiple purchase orders and PR is fully converted": {"pickleLocation":"77:3","tags":["@P2P-P4-TC-007","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P4-TC-007"]},
};