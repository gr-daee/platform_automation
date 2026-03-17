/** Generated from: e2e/features/p2p/phase-1-requirement-approval.feature */
import { test } from "playwright-bdd";

test.describe("Phase 1 - Procurement Request Requirement and Approval", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("View Procurement Requests list page", { tag: ["@p2p-phase1", "@P2P-P1-TC-001", "@p1", "@smoke", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await Then("I should see the \"Procurement Requests\" heading", null, { page });
    await And("I should see the requests table or empty state", null, { page });
  });

  test("Create a Procurement Request in Draft with required fields", { tag: ["@p2p-phase1", "@P2P-P1-TC-002", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await When("I create a new procurement request in draft with purpose \"AUTO_QA_ Phase1 test\"", null, { page });
    await Then("I should see a success message for procurement request creation", null, { page });
    await And("the new procurement request should appear in the list with status \"Draft\"", null, { page });
  });

  test("Submit Draft PR for approval", { tag: ["@p2p-phase1", "@P2P-P1-TC-003", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await And("there is a draft procurement request for testing", null, { page });
    await When("I submit the draft procurement request for approval", null, { page });
    await Then("I should see a success message for submission", null, { page });
    await And("the procurement request status should be \"Submitted\"", null, { page });
  });

  test("Approver approves submitted PR", { tag: ["@p2p-phase1", "@P2P-P1-TC-004", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await And("there is a submitted procurement request for testing", null, { page });
    await When("I approve the submitted procurement request", null, { page });
    await Then("I should see a success message for approval", null, { page });
    await And("the procurement request status should be \"Approved\"", null, { page });
  });

  test("Approver rejects submitted PR", { tag: ["@p2p-phase1", "@P2P-P1-TC-005", "@p2", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await And("there is a submitted procurement request for testing", null, { page });
    await When("I reject the submitted procurement request with reason \"AUTO_QA_ Rejection for test\"", null, { page });
    await Then("I should see a success message for rejection", null, { page });
    await And("the procurement request status should be \"Rejected\"", null, { page });
  });

  test("Approve button not available for Draft PR", { tag: ["@p2p-phase1", "@P2P-P1-TC-006", "@p2", "@iacs-md"] }, async ({ Given, page, And, Then }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await And("there is a draft procurement request for testing", null, { page });
    await Then("the Approve action should not be available for the draft request", null, { page });
  });

  test("Approved PR shows Create RFQ or Convert to PO option", { tag: ["@p2p-phase1", "@P2P-P1-TC-007", "@p1", "@iacs-md"] }, async ({ Given, page, And, Then }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await And("there is an approved procurement request for testing", null, { page });
    await Then("the Convert to PO or Create RFQ action should be available for the approved request", null, { page });
  });

  test("Rejecting a PR requires a rejection reason", { tag: ["@p2p-phase1", "@P2P-P1-TC-008", "@p2", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await And("there is a submitted procurement request for testing", null, { page });
    await When("I attempt to reject the submitted procurement request without a reason", null, { page });
    await Then("I should see a validation message for missing rejection reason", null, { page });
    await And("the procurement request status should be \"Submitted\"", null, { page });
  });

  test("Procurement Request audit trail shows user names and status change history", { tag: ["@p2p-phase1", "@P2P-P1-TC-009", "@p2", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the \"p2p/procurement-requests\" page", null, { page });
    await And("there is a submitted procurement request for testing", null, { page });
    await When("I open the procurement request audit trail", null, { page });
    await Then("the audit trail should show \"Created By\" and \"Last Updated By\" as user names", null, { page });
    await And("the audit trail should list status transitions such as \"Draft\" to \"Submitted\" or \"Approved\"", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/p2p/phase-1-requirement-approval.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "View Procurement Requests list page": {"pickleLocation":"16:3","tags":["@p2p-phase1","@P2P-P1-TC-001","@p1","@smoke","@iacs-md"],"ownTags":["@iacs-md","@smoke","@p1","@P2P-P1-TC-001"]},
  "Create a Procurement Request in Draft with required fields": {"pickleLocation":"23:3","tags":["@p2p-phase1","@P2P-P1-TC-002","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@P2P-P1-TC-002"]},
  "Submit Draft PR for approval": {"pickleLocation":"31:3","tags":["@p2p-phase1","@P2P-P1-TC-003","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@P2P-P1-TC-003"]},
  "Approver approves submitted PR": {"pickleLocation":"40:3","tags":["@p2p-phase1","@P2P-P1-TC-004","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@P2P-P1-TC-004"]},
  "Approver rejects submitted PR": {"pickleLocation":"49:3","tags":["@p2p-phase1","@P2P-P1-TC-005","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P1-TC-005"]},
  "Approve button not available for Draft PR": {"pickleLocation":"58:3","tags":["@p2p-phase1","@P2P-P1-TC-006","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P1-TC-006"]},
  "Approved PR shows Create RFQ or Convert to PO option": {"pickleLocation":"65:3","tags":["@p2p-phase1","@P2P-P1-TC-007","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@P2P-P1-TC-007"]},
  "Rejecting a PR requires a rejection reason": {"pickleLocation":"72:3","tags":["@p2p-phase1","@P2P-P1-TC-008","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P1-TC-008"]},
  "Procurement Request audit trail shows user names and status change history": {"pickleLocation":"81:3","tags":["@p2p-phase1","@P2P-P1-TC-009","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@P2P-P1-TC-009"]},
};