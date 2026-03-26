/** Generated from: e2e/features/plant-production/05-bom-lines.feature */
import { test } from "playwright-bdd";

test.describe("BOM Line Items Management (DAEE-165)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am on the BOM Management page", null, { page });
  });

  test("BOM line shows component name quantity and UOM in detail view", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-011", "@smoke", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a BOM with one component line", null, { page });
    await When("I view the created BOM detail", null, { page });
    await Then("the component line details should be visible in the detail view", null, { page });
  });

  test("Component line quantity must be greater than zero", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-012", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I add a component line with quantity zero", null, { page });
    await And("I submit the Create BOM form", null, { page });
    await Then("I should see a line quantity validation error", null, { page });
  });

  test("BOM supports multiple component lines", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-013", "@regression", "@p1", "@iacs-md", "@known-defect"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I add two raw material component lines", null, { page });
    await And("I submit the Create BOM form", null, { page });
    await Then("I should see a BOM created success toast or a known defect about single component limit", null, { page });
  });

  test("Critical component flag is preserved after creation", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-014", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I add one raw material component line marked as critical", null, { page });
    await And("I submit the Create BOM form", null, { page });
    await Then("I should see a BOM created success toast", null, { page });
    await When("I view the created BOM detail", null, { page });
    await Then("the component should show the critical badge in detail view", null, { page });
  });

  test("Remove a component line before submission", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-015", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I add two raw material component lines", null, { page });
    await And("I remove the second component line", null, { page });
    await Then("only one component line should remain in the form", null, { page });
    await And("I submit the Create BOM form", null, { page });
    await Then("I should see a BOM created success toast", null, { page });
  });

  test("Yield percentage is stored and visible in BOM list", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-016", "@regression", "@p2", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create BOM dialog", null, { page });
    await And("I fill the BOM name with a unique AUTO_QA name", null, { page });
    await And("I select any available product for the BOM", null, { page });
    await And("I set yield percentage to 85", null, { page });
    await And("I add one raw material component line", null, { page });
    await And("I submit the Create BOM form", null, { page });
    await Then("I should see a BOM created success toast", null, { page });
    await And("the BOM should show 85% yield in the list", null, { page });
  });

  test("BOM status filter on list page", { tag: ["@plant-production", "@PLANT-P2", "@PLANT-BOM-TC-017", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a BOM with one component line", null, { page });
    await When("I filter BOMs by status Draft", null, { page });
    await Then("the created draft BOM should be visible in filtered results", null, { page });
    await When("I filter BOMs by status Active", null, { page });
    await Then("the draft BOM should not be visible in active filter", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/plant-production/05-bom-lines.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "BOM line shows component name quantity and UOM in detail view": {"pickleLocation":"8:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-011","@smoke","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@smoke","@PLANT-BOM-TC-011"]},
  "Component line quantity must be greater than zero": {"pickleLocation":"14:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-012","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@regression","@PLANT-BOM-TC-012"]},
  "BOM supports multiple component lines": {"pickleLocation":"23:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-013","@regression","@p1","@iacs-md","@known-defect"],"ownTags":["@known-defect","@PLANT-P2","@iacs-md","@p1","@regression","@PLANT-BOM-TC-013"]},
  "Critical component flag is preserved after creation": {"pickleLocation":"32:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-014","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@regression","@PLANT-BOM-TC-014"]},
  "Remove a component line before submission": {"pickleLocation":"43:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-015","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p1","@regression","@PLANT-BOM-TC-015"]},
  "Yield percentage is stored and visible in BOM list": {"pickleLocation":"54:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-016","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p2","@regression","@PLANT-BOM-TC-016"]},
  "BOM status filter on list page": {"pickleLocation":"65:3","tags":["@plant-production","@PLANT-P2","@PLANT-BOM-TC-017","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P2","@iacs-md","@p2","@regression","@PLANT-BOM-TC-017"]},
};