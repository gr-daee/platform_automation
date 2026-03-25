/** Generated from: e2e/features/plant-production/03-plant-assets.feature */
import { test } from "playwright-bdd";

test.describe("Add Plant Assets (DAEE-163)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Create asset with required fields", { tag: ["@plant-production", "@PLANT-AST-TC-001", "@smoke", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await And("there is an active plant for asset testing", null, { page });
    await When("I switch to the Plant Assets tab", null, { page });
    await And("I open the Add Asset dialog", null, { page });
    await And("I select the test plant in the asset form", null, { page });
    await And("I fill the asset name with a unique AUTO_QA name", null, { page });
    await And("I fill the asset code with a unique code", null, { page });
    await And("I select asset category \"Production Equipment\"", null, { page });
    await And("I submit the asset form", null, { page });
    await Then("I should see an asset created success toast", null, { page });
    await And("the new asset should appear in the assets list", null, { page });
  });

  test("Asset edit persists after page refresh", { tag: ["@plant-production", "@PLANT-AST-TC-008", "@regression", "@p2", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I have created a plant asset with a unique AUTO_QA name", null, { page });
    await When("I switch to the Plant Assets tab", null, { page });
    await And("I open the Edit dialog for the created asset", null, { page });
    await And("I update the asset name with a new unique AUTO_QA name", null, { page });
    await And("I submit the asset form", null, { page });
    await Then("I should see an asset updated success toast", null, { page });
    await When("I reload the page", null, { page });
    await And("I switch to the Plant Assets tab", null, { page });
    await Then("the updated asset name should appear in the assets list", null, { page });
  });

  test("Edit asset name and status", { tag: ["@plant-production", "@PLANT-AST-TC-011", "@regression", "@p2", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I have created a plant asset with a unique AUTO_QA name", null, { page });
    await When("I switch to the Plant Assets tab", null, { page });
    await And("I open the Edit dialog for the created asset", null, { page });
    await And("I update the asset name with a new unique AUTO_QA name", null, { page });
    await And("I submit the asset form", null, { page });
    await Then("I should see an asset updated success toast", null, { page });
  });

  test("Delete asset soft-deletes and sets status to retired", { tag: ["@plant-production", "@PLANT-AST-TC-012", "@regression", "@p2", "@iacs-md", "@PLANT-P1", "@known-defect"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I have created a plant asset with a unique AUTO_QA name", null, { page });
    await When("I switch to the Plant Assets tab", null, { page });
    await And("I delete the created asset", null, { page });
    await Then("I should see an asset deleted success toast", null, { page });
    await And("the deleted asset should have retired status in the list", null, { page });
  });

  test("Asset category is restricted to predefined values only", { tag: ["@plant-production", "@PLANT-AST-TC-002", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await And("there is an active plant for asset testing", null, { page });
    await When("I switch to the Plant Assets tab", null, { page });
    await And("I open the Add Asset dialog", null, { page });
    await And("I select the test plant in the asset form", null, { page });
    await And("I open the asset category dropdown", null, { page });
    await Then("only the predefined category options should be available", null, { page });
    await And("I should not be able to enter a custom category value", null, { page });
  });

  test("Asset code uniqueness validation", { tag: ["@plant-production", "@PLANT-AST-TC-007", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I have created a plant asset with a unique AUTO_QA name", null, { page });
    await When("I switch to the Plant Assets tab", null, { page });
    await And("I open the Add Asset dialog", null, { page });
    await And("I select the test plant in the asset form", null, { page });
    await And("I fill the asset name with a unique AUTO_QA name", null, { page });
    await And("I fill the asset code with the same code as the existing asset", null, { page });
    await And("I select asset category \"Production Equipment\"", null, { page });
    await And("I submit the asset form", null, { page });
    await Then("I should see an error indicating the asset code already exists", null, { page });
  });

  test("Asset with maintenance status is blocked from work order assignment", { tag: ["@plant-production", "@PLANT-AST-TC-003", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a plant asset with status \"maintenance\"", null, { page });
    await When("I navigate to work order creation", null, { page });
    await Then("the maintenance asset should not be available for assignment", null, { page });
  });

  test("Asset under_maintenance cannot be assigned to work order", { tag: ["@plant-production", "@PLANT-AST-TC-009", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a plant asset with status \"maintenance\"", null, { page });
    await When("I navigate to work order creation", null, { page });
    await Then("the asset under maintenance should not be selectable in the asset dropdown", null, { page });
  });

  test("Plant without active assets is blocked from work order creation", { tag: ["@plant-production", "@PLANT-AST-TC-004", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a plant with no active assets", null, { page });
    await When("I navigate to work order creation", null, { page });
    await Then("the plant without active assets should not be selectable", null, { page });
  });

  test("Active asset can be assigned to work order", { tag: ["@plant-production", "@PLANT-AST-TC-005", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created an active plant with a valid license and an active asset", null, { page });
    await When("I navigate to work order creation and assign the asset", null, { page });
    await Then("the asset should be successfully assigned to the work order", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/plant-production/03-plant-assets.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Create asset with required fields": {"pickleLocation":"17:3","tags":["@plant-production","@PLANT-AST-TC-001","@smoke","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@smoke","@PLANT-AST-TC-001"]},
  "Asset edit persists after page refresh": {"pickleLocation":"31:3","tags":["@plant-production","@PLANT-AST-TC-008","@regression","@p2","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-AST-TC-008"]},
  "Edit asset name and status": {"pickleLocation":"43:3","tags":["@plant-production","@PLANT-AST-TC-011","@regression","@p2","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-AST-TC-011"]},
  "Delete asset soft-deletes and sets status to retired": {"pickleLocation":"52:3","tags":["@plant-production","@PLANT-AST-TC-012","@regression","@p2","@iacs-md","@PLANT-P1","@known-defect"],"ownTags":["@known-defect","@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-AST-TC-012"]},
  "Asset category is restricted to predefined values only": {"pickleLocation":"62:3","tags":["@plant-production","@PLANT-AST-TC-002","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-AST-TC-002"]},
  "Asset code uniqueness validation": {"pickleLocation":"73:3","tags":["@plant-production","@PLANT-AST-TC-007","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-AST-TC-007"]},
  "Asset with maintenance status is blocked from work order assignment": {"pickleLocation":"87:3","tags":["@plant-production","@PLANT-AST-TC-003","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-AST-TC-003"]},
  "Asset under_maintenance cannot be assigned to work order": {"pickleLocation":"93:3","tags":["@plant-production","@PLANT-AST-TC-009","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-AST-TC-009"]},
  "Plant without active assets is blocked from work order creation": {"pickleLocation":"99:3","tags":["@plant-production","@PLANT-AST-TC-004","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-AST-TC-004"]},
  "Active asset can be assigned to work order": {"pickleLocation":"105:3","tags":["@plant-production","@PLANT-AST-TC-005","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-AST-TC-005"]},
};