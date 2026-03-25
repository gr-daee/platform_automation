/** Generated from: e2e/features/plant-production/07-material-requests.feature */
import { test } from "playwright-bdd";

test.describe("Material Requests (MRN) Management (DAEE-167)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am on the Material Requests page", null, { page });
  });

  test("Material Requests page loads successfully", { tag: ["@plant-production", "@PLANT-P4", "@PLANT-MRN-TC-001", "@smoke", "@p1", "@iacs-md"] }, async ({ Then, page, And }) => {
    await Then("the Material Requests page should be visible", null, { page });
    await And("the MRN list or empty state should be displayed", null, { page });
  });

  test("MRN list shows pending and partial issued by default", { tag: ["@plant-production", "@PLANT-P4", "@PLANT-MRN-TC-002", "@regression", "@p2", "@iacs-md"] }, async ({ Then, page, And }) => {
    await Then("the MRN list header should be visible", null, { page });
    await And("the page should display within the last 30 days date range filter", null, { page });
  });

  test("Navigate to Material Issuance from MRN", { tag: ["@plant-production", "@PLANT-P4", "@PLANT-MRN-TC-003", "@regression", "@p2", "@iacs-md"] }, async ({ Then, page, And }) => {
    await Then("the Material Requests page should be visible", null, { page });
    await And("the issue action should be available for pending MRNs", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/plant-production/07-material-requests.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Material Requests page loads successfully": {"pickleLocation":"8:3","tags":["@plant-production","@PLANT-P4","@PLANT-MRN-TC-001","@smoke","@p1","@iacs-md"],"ownTags":["@PLANT-P4","@iacs-md","@p1","@smoke","@PLANT-MRN-TC-001"]},
  "MRN list shows pending and partial issued by default": {"pickleLocation":"13:3","tags":["@plant-production","@PLANT-P4","@PLANT-MRN-TC-002","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P4","@iacs-md","@p2","@regression","@PLANT-MRN-TC-002"]},
  "Navigate to Material Issuance from MRN": {"pickleLocation":"18:3","tags":["@plant-production","@PLANT-P4","@PLANT-MRN-TC-003","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P4","@iacs-md","@p2","@regression","@PLANT-MRN-TC-003"]},
};