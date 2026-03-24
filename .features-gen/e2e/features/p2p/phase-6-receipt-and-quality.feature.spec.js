/** Generated from: e2e/features/p2p/phase-6-receipt-and-quality.feature */
import { test } from "playwright-bdd";

test.describe("Phase 6 - Receipt and Quality (GRN)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("View GRN list page", { tag: ["@P2P-P6-TC-001", "@p1", "@smoke", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the \"p2p/grn\" page", null, { page });
    await Then("I should see the \"Goods Receipt Notes\" heading", null, { page });
    await And("I should see the list or empty state", null, { page });
  });

  test("Accepted quantity from partial rejection updates raw material stock", { tag: ["@P2P-P6-TC-002", "@p0", "@critical", "@iacs-md", "@daee-157"] }, async ({ Given, page, Then }) => {
    await Given("I open GRN \"d86ed2c0-cdad-4952-af58-b31c2ae24b94\" from DAEE-157 defect context", null, { page });
    await Then("accepted quantity should be reflected in raw material inventory for that GRN");
  });

  test("E2E partial rejection updates stock by accepted quantity", { tag: ["@P2P-P6-TC-003", "@p0", "@critical", "@iacs-md", "@daee-157", "@e2e"] }, async ({ Given, page, And, Then }) => {
    await Given("there is a purchase order with editable GRN for receipt processing", null, { page });
    await And("I record receipt with partial rejection on the created GRN", null, { page });
    await And("I approve quality for the created GRN", null, { page });
    await Then("the created GRN should update raw material inventory by accepted quantity only");
  });

  test("Recording partial rejection should not fail with quality status enum errors", { tag: ["@P2P-P6-TC-004", "@p0", "@critical", "@iacs-md", "@daee-157", "@negative"] }, async ({ Given, page, When, Then }) => {
    await Given("there is a purchase order with editable GRN for receipt processing", null, { page });
    await When("I record receipt with partial rejection on the created GRN", null, { page });
    await Then("the receipt update should complete without backend enum errors");
  });

  test("GRN detail should show quality inspection and traceability fields after approval", { tag: ["@P2P-P6-TC-005", "@p1", "@regression", "@iacs-md", "@daee-157", "@audit"] }, async ({ Given, page, And, When, Then }) => {
    await Given("there is a purchase order with editable GRN for receipt processing", null, { page });
    await And("I record receipt with partial rejection on the created GRN", null, { page });
    await When("I approve quality for the created GRN", null, { page });
    await Then("GRN detail should display inspection metadata and linked PO traceability", null, { page });
  });

  test("PO with multiple GRNs should accumulate accepted quantities correctly", { tag: ["@P2P-P6-TC-006", "@p1", "@regression", "@iacs-md", "@daee-157", "@partial-delivery"] }, async ({ Given, Then }) => {
    await Given("there is a purchase order with multiple GRNs for cumulative receipt validation");
    await Then("cumulative accepted quantity across GRNs should match PO received quantity");
  });

  test("GRN operator should not be able to mark invoices for payment", { tag: ["@P2P-P6-TC-007", "@p1", "@regression", "@iacs-md", "@daee-157", "@sod"] }, async ({ Given, page, Then }) => {
    await Given("I am on the \"p2p/payment-queue\" page", null, { page });
    await Then("mark for payment action should not be available for the current GRN operator user", null, { page });
  });

  test("Goods-first flow should support invoice linked to PO and GRN", { tag: ["@P2P-P6-TC-008", "@p1", "@regression", "@iacs-md", "@daee-157", "@invoice-linkage"] }, async ({ Given, page, When, And, Then }) => {
    await Given("there is a purchase order with editable GRN for receipt processing", null, { page });
    await When("I record receipt with full acceptance on the created GRN", null, { page });
    await And("I approve quality for the created GRN", null, { page });
    await And("I create a supplier invoice for the current PO in goods-first flow", null, { page });
    await Then("goods-first flow should persist invoice linkage with current PO and GRN");
  });

  test("Invoice-first flow should support later GRN linkage", { tag: ["@P2P-P6-TC-009", "@p1", "@regression", "@iacs-md", "@daee-157", "@invoice-linkage"] }, async ({ Given, page, When, And, Then }) => {
    await Given("there is a sent-to-supplier purchase order without GRN for invoice-first flow", null, { page });
    await When("I create a supplier invoice for the current PO in invoice-first flow", null, { page });
    await And("I create a GRN from the current purchase order", null, { page });
    await Then("invoice-first flow should support invoice before GRN on same PO");
  });

  test("Fully rejected GRN should not create raw material stock", { tag: ["@P2P-P6-TC-010", "@p1", "@regression", "@iacs-md", "@daee-157", "@rejection"] }, async ({ Given, page, When, And, Then }) => {
    await Given("there is a purchase order with editable GRN for receipt processing", null, { page });
    await When("I record receipt with full rejection on the created GRN", null, { page });
    await And("I approve quality for the created GRN", null, { page });
    await Then("fully rejected GRN should have zero linked raw material stock entries");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/p2p/phase-6-receipt-and-quality.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "View GRN list page": {"pickleLocation":"14:3","tags":["@P2P-P6-TC-001","@p1","@smoke","@iacs-md"],"ownTags":["@iacs-md","@smoke","@p1","@P2P-P6-TC-001"]},
  "Accepted quantity from partial rejection updates raw material stock": {"pickleLocation":"20:3","tags":["@P2P-P6-TC-002","@p0","@critical","@iacs-md","@daee-157"],"ownTags":["@daee-157","@iacs-md","@critical","@p0","@P2P-P6-TC-002"]},
  "E2E partial rejection updates stock by accepted quantity": {"pickleLocation":"25:3","tags":["@P2P-P6-TC-003","@p0","@critical","@iacs-md","@daee-157","@e2e"],"ownTags":["@e2e","@daee-157","@iacs-md","@critical","@p0","@P2P-P6-TC-003"]},
  "Recording partial rejection should not fail with quality status enum errors": {"pickleLocation":"32:3","tags":["@P2P-P6-TC-004","@p0","@critical","@iacs-md","@daee-157","@negative"],"ownTags":["@negative","@daee-157","@iacs-md","@critical","@p0","@P2P-P6-TC-004"]},
  "GRN detail should show quality inspection and traceability fields after approval": {"pickleLocation":"38:3","tags":["@P2P-P6-TC-005","@p1","@regression","@iacs-md","@daee-157","@audit"],"ownTags":["@audit","@daee-157","@iacs-md","@regression","@p1","@P2P-P6-TC-005"]},
  "PO with multiple GRNs should accumulate accepted quantities correctly": {"pickleLocation":"45:3","tags":["@P2P-P6-TC-006","@p1","@regression","@iacs-md","@daee-157","@partial-delivery"],"ownTags":["@partial-delivery","@daee-157","@iacs-md","@regression","@p1","@P2P-P6-TC-006"]},
  "GRN operator should not be able to mark invoices for payment": {"pickleLocation":"50:3","tags":["@P2P-P6-TC-007","@p1","@regression","@iacs-md","@daee-157","@sod"],"ownTags":["@sod","@daee-157","@iacs-md","@regression","@p1","@P2P-P6-TC-007"]},
  "Goods-first flow should support invoice linked to PO and GRN": {"pickleLocation":"55:3","tags":["@P2P-P6-TC-008","@p1","@regression","@iacs-md","@daee-157","@invoice-linkage"],"ownTags":["@invoice-linkage","@daee-157","@iacs-md","@regression","@p1","@P2P-P6-TC-008"]},
  "Invoice-first flow should support later GRN linkage": {"pickleLocation":"63:3","tags":["@P2P-P6-TC-009","@p1","@regression","@iacs-md","@daee-157","@invoice-linkage"],"ownTags":["@invoice-linkage","@daee-157","@iacs-md","@regression","@p1","@P2P-P6-TC-009"]},
  "Fully rejected GRN should not create raw material stock": {"pickleLocation":"70:3","tags":["@P2P-P6-TC-010","@p1","@regression","@iacs-md","@daee-157","@rejection"],"ownTags":["@rejection","@daee-157","@iacs-md","@regression","@p1","@P2P-P6-TC-010"]},
};