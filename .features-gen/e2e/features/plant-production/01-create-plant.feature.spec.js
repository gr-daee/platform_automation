/** Generated from: e2e/features/plant-production/01-create-plant.feature */
import { test } from "playwright-bdd";

test.describe("Create Plant (DAEE-161)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Create plant with required fields", { tag: ["@plant-production", "@PLANT-PLT-TC-001", "@smoke", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await When("I open the Add Plant dialog", null, { page });
    await And("I fill the plant name with a unique AUTO_QA name", null, { page });
    await And("I fill the plant code with a unique code", null, { page });
    await And("I submit the plant form", null, { page });
    await Then("I should see a plant created success toast", null, { page });
    await And("the new plant should appear in the plants list", null, { page });
  });

  test("Create plant with capacity and operational fields", { tag: ["@plant-production", "@PLANT-PLT-TC-005", "@regression", "@p2", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await When("I open the Add Plant dialog", null, { page });
    await And("I fill the plant name with a unique AUTO_QA name", null, { page });
    await And("I fill the plant code with a unique code", null, { page });
    await And("I set production capacity to \"5000\" with unit \"Kilograms (kg)\"", null, { page });
    await And("I set operating hours to \"10\" and operating days to \"5\"", null, { page });
    await And("I submit the plant form", null, { page });
    await Then("I should see a plant created success toast", null, { page });
    await And("the new plant should appear in the plants list", null, { page });
  });

  test("Plant record persists after page refresh", { tag: ["@plant-production", "@PLANT-PLT-TC-007", "@regression", "@p2", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I have created a plant with a unique AUTO_QA name", null, { page });
    await When("I reload the page", null, { page });
    await And("I search for the plant by name", null, { page });
    await Then("the plant should appear in the plants list", null, { page });
  });

  test("Edit existing plant persists changes", { tag: ["@plant-production", "@PLANT-PLT-TC-009", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I have created a plant with a unique AUTO_QA name", null, { page });
    await When("I open the Edit dialog for the created plant", null, { page });
    await And("I update the plant description to \"Updated via automation\"", null, { page });
    await And("I submit the plant form", null, { page });
    await Then("I should see a plant updated success toast", null, { page });
    await And("the plant description should be updated in the list", null, { page });
  });

  test("Plant list search by name and code", { tag: ["@plant-production", "@PLANT-PLT-TC-010", "@regression", "@p2", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I have created a plant with a unique AUTO_QA name", null, { page });
    await When("I search for the plant by name", null, { page });
    await Then("the plant should appear in the plants list", null, { page });
    await When("I clear the search", null, { page });
    await And("I search for the plant by code", null, { page });
    await Then("the plant should appear in the plants list", null, { page });
  });

  test("Plant code uniqueness validation", { tag: ["@plant-production", "@PLANT-PLT-TC-002", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I have created a plant with a unique AUTO_QA name", null, { page });
    await When("I open the Add Plant dialog", null, { page });
    await And("I fill the plant name with a unique AUTO_QA name", null, { page });
    await And("I fill the plant code with the same code as the existing plant", null, { page });
    await And("I submit the plant form", null, { page });
    await Then("I should see an error indicating the plant code already exists", null, { page });
  });

  test("Required field validation shows inline errors", { tag: ["@plant-production", "@PLANT-PLT-TC-003", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await When("I open the Add Plant dialog", null, { page });
    await And("I submit the plant form without filling required fields", null, { page });
    await Then("I should see inline validation error for plant name", null, { page });
    await And("I should see inline validation error for plant code", null, { page });
  });

  test("Maintenance date validation rejects next before last", { tag: ["@plant-production", "@PLANT-PLT-TC-006", "@regression", "@p2", "@iacs-md", "@PLANT-P1", "@known-defect"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await When("I open the Add Plant dialog", null, { page });
    await And("I fill the plant name with a unique AUTO_QA name", null, { page });
    await And("I fill the plant code with a unique code", null, { page });
    await And("I set last maintenance date to \"2025-06-01\" and next maintenance date to \"2025-01-01\"", null, { page });
    await And("I submit the plant form", null, { page });
    await Then("I should see a validation error for maintenance dates or the form may be accepted due to missing validation", null, { page });
  });

  test("Cancel closes form without saving plant", { tag: ["@plant-production", "@PLANT-PLT-TC-008", "@regression", "@p2", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await And("I note the current plant count", null, { page });
    await When("I open the Add Plant dialog", null, { page });
    await And("I fill the plant name with a unique AUTO_QA name", null, { page });
    await And("I fill the plant code with a unique code", null, { page });
    await And("I cancel the plant form", null, { page });
    await Then("the dialog should be closed", null, { page });
    await And("the plant count should remain unchanged", null, { page });
  });

  test("Plant with inactive status appears as inactive in list", { tag: ["@plant-production", "@PLANT-PLT-TC-004", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await When("I open the Add Plant dialog", null, { page });
    await And("I fill the plant name with a unique AUTO_QA name", null, { page });
    await And("I fill the plant code with a unique code", null, { page });
    await And("I set the plant status to \"Inactive\"", null, { page });
    await And("I submit the plant form", null, { page });
    await Then("I should see a plant created success toast", null, { page });
    await And("the plant status in the list should show \"inactive\"", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/plant-production/01-create-plant.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Create plant with required fields": {"pickleLocation":"17:3","tags":["@plant-production","@PLANT-PLT-TC-001","@smoke","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@smoke","@PLANT-PLT-TC-001"]},
  "Create plant with capacity and operational fields": {"pickleLocation":"27:3","tags":["@plant-production","@PLANT-PLT-TC-005","@regression","@p2","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-PLT-TC-005"]},
  "Plant record persists after page refresh": {"pickleLocation":"39:3","tags":["@plant-production","@PLANT-PLT-TC-007","@regression","@p2","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-PLT-TC-007"]},
  "Edit existing plant persists changes": {"pickleLocation":"46:3","tags":["@plant-production","@PLANT-PLT-TC-009","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-PLT-TC-009"]},
  "Plant list search by name and code": {"pickleLocation":"55:3","tags":["@plant-production","@PLANT-PLT-TC-010","@regression","@p2","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-PLT-TC-010"]},
  "Plant code uniqueness validation": {"pickleLocation":"66:3","tags":["@plant-production","@PLANT-PLT-TC-002","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-PLT-TC-002"]},
  "Required field validation shows inline errors": {"pickleLocation":"75:3","tags":["@plant-production","@PLANT-PLT-TC-003","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-PLT-TC-003"]},
  "Maintenance date validation rejects next before last": {"pickleLocation":"83:3","tags":["@plant-production","@PLANT-PLT-TC-006","@regression","@p2","@iacs-md","@PLANT-P1","@known-defect"],"ownTags":["@known-defect","@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-PLT-TC-006"]},
  "Cancel closes form without saving plant": {"pickleLocation":"95:3","tags":["@plant-production","@PLANT-PLT-TC-008","@regression","@p2","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-PLT-TC-008"]},
  "Plant with inactive status appears as inactive in list": {"pickleLocation":"108:3","tags":["@plant-production","@PLANT-PLT-TC-004","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-PLT-TC-004"]},
};