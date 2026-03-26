/** Generated from: e2e/features/plant-production/08-quality-control.feature */
import { test } from "playwright-bdd";

test.describe("Quality Control — Production Anomalies (DAEE-168)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am on the Quality Control page", null, { page });
  });

  test("Quality Control page loads with anomaly list", { tag: ["@plant-production", "@PLANT-P4", "@PLANT-QC-TC-001", "@smoke", "@p1", "@iacs-md"] }, async ({ Then, page, And }) => {
    await Then("the Quality Control page should be visible", null, { page });
    await And("the production anomalies list should be displayed", null, { page });
  });

  test("Report a production anomaly", { tag: ["@plant-production", "@PLANT-P4", "@PLANT-QC-TC-002", "@smoke", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Report Anomaly dialog", null, { page });
    await And("I select anomaly type \"Quality Issue\"", null, { page });
    await And("I select severity Medium", null, { page });
    await And("I submit the anomaly form", null, { page });
    await Then("I should see an anomaly reported success toast", null, { page });
    await And("the anomaly should appear in the list", null, { page });
  });

  test("Anomaly severity defaults to medium on create", { tag: ["@plant-production", "@PLANT-P4", "@PLANT-QC-TC-003", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, Then }) => {
    await When("I open the Report Anomaly dialog", null, { page });
    await Then("the severity should default to medium", null, { page });
  });

  test("Acknowledge a production anomaly", { tag: ["@plant-production", "@PLANT-P4", "@PLANT-QC-TC-004", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a test anomaly", null, { page });
    await When("I acknowledge the created anomaly", null, { page });
    await Then("the anomaly should show as acknowledged", null, { page });
  });

  test("Delete a production anomaly", { tag: ["@plant-production", "@PLANT-P4", "@PLANT-QC-TC-005", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a test anomaly", null, { page });
    await When("I delete the created anomaly", null, { page });
    await Then("the anomaly should not appear in the list", null, { page });
  });

  test("Filter anomalies by severity", { tag: ["@plant-production", "@PLANT-P4", "@PLANT-QC-TC-006", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a test anomaly", null, { page });
    await When("I filter anomalies by severity Medium", null, { page });
    await Then("the medium severity anomaly should be visible", null, { page });
  });

  test("Anomaly type options include all expected types", { tag: ["@plant-production", "@PLANT-P4", "@PLANT-QC-TC-007", "@regression", "@p2", "@iacs-md"] }, async ({ When, page, Then, And }) => {
    await When("I open the Report Anomaly dialog", null, { page });
    await Then("the anomaly type dropdown should contain \"Quality Issue\"", null, { page });
    await And("the anomaly type dropdown should contain \"Equipment Failure\"", null, { page });
    await And("the anomaly type dropdown should contain \"Production Delay\"", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/plant-production/08-quality-control.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Quality Control page loads with anomaly list": {"pickleLocation":"8:3","tags":["@plant-production","@PLANT-P4","@PLANT-QC-TC-001","@smoke","@p1","@iacs-md"],"ownTags":["@PLANT-P4","@iacs-md","@p1","@smoke","@PLANT-QC-TC-001"]},
  "Report a production anomaly": {"pickleLocation":"13:3","tags":["@plant-production","@PLANT-P4","@PLANT-QC-TC-002","@smoke","@p1","@iacs-md"],"ownTags":["@PLANT-P4","@iacs-md","@p1","@smoke","@PLANT-QC-TC-002"]},
  "Anomaly severity defaults to medium on create": {"pickleLocation":"22:3","tags":["@plant-production","@PLANT-P4","@PLANT-QC-TC-003","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P4","@iacs-md","@p1","@regression","@PLANT-QC-TC-003"]},
  "Acknowledge a production anomaly": {"pickleLocation":"27:3","tags":["@plant-production","@PLANT-P4","@PLANT-QC-TC-004","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P4","@iacs-md","@p1","@regression","@PLANT-QC-TC-004"]},
  "Delete a production anomaly": {"pickleLocation":"33:3","tags":["@plant-production","@PLANT-P4","@PLANT-QC-TC-005","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P4","@iacs-md","@p2","@regression","@PLANT-QC-TC-005"]},
  "Filter anomalies by severity": {"pickleLocation":"39:3","tags":["@plant-production","@PLANT-P4","@PLANT-QC-TC-006","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P4","@iacs-md","@p2","@regression","@PLANT-QC-TC-006"]},
  "Anomaly type options include all expected types": {"pickleLocation":"45:3","tags":["@plant-production","@PLANT-P4","@PLANT-QC-TC-007","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P4","@iacs-md","@p2","@regression","@PLANT-QC-TC-007"]},
};