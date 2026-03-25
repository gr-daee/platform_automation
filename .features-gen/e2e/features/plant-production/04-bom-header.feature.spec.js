/** Generated from: e2e/features/plant-production/04-bom-header.feature */
import { test } from "playwright-bdd";

test.describe("BOM Header Management (DAEE-164)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am on the BOM Management page", null, { page });
  });

  test("Create BOM with required fields and one line item", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-001", "@smoke", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I add one raw material component line", null, { page });
    await And("I submit the Create BOM form", null, { page });
    await Then("I should see a BOM created success toast", null, { page });
    await And("the new BOM should appear in the BOM list", null, { page });
  });

  test("BOM name is required — validation blocks submission", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-002", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I add one raw material component line", null, { page });
    await And("I submit the Create BOM form without filling BOM name", null, { page });
    await Then("I should see a BOM name required validation error", null, { page });
  });

  test("Product selection is required — validation blocks submission", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-003", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I add one raw material component line", null, { page });
    await And("I submit the Create BOM form", null, { page });
    await Then("I should see a product required validation error", null, { page });
  });

  test("At least one component line is required", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-004", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I submit the Create BOM form without adding any lines", null, { page });
    await Then("I should see a lines required validation error", null, { page });
  });

  test("Yield percentage must be between 1 and 100", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-005", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I set yield percentage to 0", null, { page });
    await And("I add one raw material component line", null, { page });
    await And("I submit the Create BOM form", null, { page });
    await Then("I should see a yield percentage validation error", null, { page });
  });

  test("Cancel closes dialog without saving", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-006", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I cancel the Create BOM form", null, { page });
    await Then("the Create BOM dialog should be closed", null, { page });
    await And("the BOM should not appear in the list", null, { page });
  });

  test("Created BOM starts in draft status", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-007", "@regression", "@p2", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I add one raw material component line", null, { page });
    await And("I submit the Create BOM form", null, { page });
    await Then("I should see a BOM created success toast", null, { page });
    await And("the new BOM should show status DRAFT in the list", null, { page });
  });

  test("BOM number is auto-generated and immutable", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-008", "@regression", "@p2", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I add one raw material component line", null, { page });
    await And("I submit the Create BOM form", null, { page });
    await Then("I should see a BOM created success toast", null, { page });
    await When("I view the created BOM detail", null, { page });
    await Then("the BOM number should follow the auto-generated format", null, { page });
  });

  test("BOM status workflow draft → under_review → approved → active", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-009", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a BOM with one component line", null, { page });
    await When("I submit the BOM for review from the list", null, { page });
    await Then("the BOM status should be UNDER REVIEW", null, { page });
    await When("I approve the BOM from the list", null, { page });
    await Then("the BOM status should be APPROVED", null, { page });
    await When("I activate the BOM from the list", null, { page });
    await Then("the BOM status should be ACTIVE", null, { page });
  });

  test("Delete draft BOM shows toast confirmation", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-010", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a BOM with one component line", null, { page });
    await When("I delete the BOM from the list", null, { page });
    await Then("I should see a BOM deleted toast", null, { page });
  });

  test("BOM list search filters by BOM name", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-018", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a BOM with one component line", null, { page });
    await When("I search for the BOM by name", null, { page });
    await Then("only matching BOMs should be visible", null, { page });
    await When("I clear the BOM search", null, { page });
    await Then("BOM list shows unfiltered results", null, { page });
  });

  test("BOM without lines cannot be submitted for review", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-019", "@regression", "@p2", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I submit the Create BOM form without adding any lines", null, { page });
    await Then("I should see a lines required validation error", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/plant-production/04-bom-header.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Create BOM with required fields and one line item": {"pickleLocation":"8:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-001","@smoke","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@smoke","@PLANT-BOM-TC-001"]},
  "BOM name is required — validation blocks submission": {"pickleLocation":"18:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-002","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@regression","@PLANT-BOM-TC-002"]},
  "Product selection is required — validation blocks submission": {"pickleLocation":"26:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-003","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@regression","@PLANT-BOM-TC-003"]},
  "At least one component line is required": {"pickleLocation":"34:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-004","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@regression","@PLANT-BOM-TC-004"]},
  "Yield percentage must be between 1 and 100": {"pickleLocation":"42:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-005","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@regression","@PLANT-BOM-TC-005"]},
  "Cancel closes dialog without saving": {"pickleLocation":"52:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-006","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@regression","@PLANT-BOM-TC-006"]},
  "Created BOM starts in draft status": {"pickleLocation":"60:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-007","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p2","@regression","@PLANT-BOM-TC-007"]},
  "BOM number is auto-generated and immutable": {"pickleLocation":"70:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-008","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p2","@regression","@PLANT-BOM-TC-008"]},
  "BOM status workflow draft → under_review → approved → active": {"pickleLocation":"81:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-009","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@regression","@PLANT-BOM-TC-009"]},
  "Delete draft BOM shows toast confirmation": {"pickleLocation":"91:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-010","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p2","@regression","@PLANT-BOM-TC-010"]},
  "BOM list search filters by BOM name": {"pickleLocation":"100:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-018","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p2","@regression","@PLANT-BOM-TC-018"]},
  "BOM without lines cannot be submitted for review": {"pickleLocation":"108:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-019","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p2","@regression","@PLANT-BOM-TC-019"]},
};