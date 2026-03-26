/** Generated from: e2e/features/plant-production/02-plant-licenses.feature */
import { test } from "playwright-bdd";

test.describe("Add Plant Licenses (DAEE-162)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Create license with required fields", { tag: ["@plant-production", "@PLANT-LIC-TC-001", "@smoke", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await And("there is an active plant for license testing", null, { page });
    await When("I switch to the Plant Licenses tab", null, { page });
    await And("I open the Add License dialog", null, { page });
    await And("I select the test plant in the license form", null, { page });
    await And("I select license type \"Manufacturing License\"", null, { page });
    await And("I fill the license number with a unique AUTO_QA number", null, { page });
    await And("I set license issue date to \"2024-01-01\"", null, { page });
    await And("I set license expiry date to \"2026-12-31\"", null, { page });
    await And("I submit the license form", null, { page });
    await Then("I should see a license created success toast", null, { page });
    await And("the new license should appear in the licenses list", null, { page });
  });

  test("License renewal - update expiry date to future date", { tag: ["@plant-production", "@PLANT-LIC-TC-007", "@regression", "@p2", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I have created a plant license with a unique AUTO_QA number", null, { page });
    await When("I switch to the Plant Licenses tab", null, { page });
    await And("I open the Edit dialog for the created license", null, { page });
    await And("I set license expiry date to \"2028-12-31\"", null, { page });
    await And("I submit the license form", null, { page });
    await Then("I should see a license updated success toast", null, { page });
  });

  test("Edit license updates and persists", { tag: ["@plant-production", "@PLANT-LIC-TC-011", "@regression", "@p2", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I have created a plant license with a unique AUTO_QA number", null, { page });
    await When("I switch to the Plant Licenses tab", null, { page });
    await And("I open the Edit dialog for the created license", null, { page });
    await And("I set license expiry date to \"2027-06-30\"", null, { page });
    await And("I submit the license form", null, { page });
    await Then("I should see a license updated success toast", null, { page });
    await And("the license expiry date should be updated in the list", null, { page });
  });

  test("License mandatory field validation shows inline errors", { tag: ["@plant-production", "@PLANT-LIC-TC-002", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await When("I switch to the Plant Licenses tab", null, { page });
    await And("I open the Add License dialog", null, { page });
    await And("I submit the license form without filling required fields", null, { page });
    await Then("I should see inline validation errors for required license fields", null, { page });
  });

  test("License date validation rejects expiry before issue date", { tag: ["@plant-production", "@PLANT-LIC-TC-003", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the Plants Setup page", null, { page });
    await And("there is an active plant for license testing", null, { page });
    await When("I switch to the Plant Licenses tab", null, { page });
    await And("I open the Add License dialog", null, { page });
    await And("I select the test plant in the license form", null, { page });
    await And("I select license type \"Manufacturing License\"", null, { page });
    await And("I fill the license number with a unique AUTO_QA number", null, { page });
    await And("I set license issue date to \"2025-06-01\"", null, { page });
    await And("I set license expiry date to \"2025-01-01\"", null, { page });
    await And("I submit the license form", null, { page });
    await Then("I should see a validation error for license expiry date", null, { page });
  });

  test("License number uniqueness per plant validation", { tag: ["@plant-production", "@PLANT-LIC-TC-004", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I have created a plant license with a unique AUTO_QA number", null, { page });
    await When("I switch to the Plant Licenses tab", null, { page });
    await And("I open the Add License dialog", null, { page });
    await And("I select the test plant in the license form", null, { page });
    await And("I select license type \"Trade License\"", null, { page });
    await And("I fill the license number with the same number as the existing license", null, { page });
    await And("I set license issue date to \"2024-01-01\"", null, { page });
    await And("I set license expiry date to \"2026-12-31\"", null, { page });
    await And("I submit the license form", null, { page });
    await Then("I should see an error indicating the license number already exists", null, { page });
  });

  test("Expired license is visually identifiable in the list", { tag: ["@plant-production", "@PLANT-LIC-TC-006", "@regression", "@p2", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a plant license with an expiry date in the past", null, { page });
    await When("I switch to the Plant Licenses tab", null, { page });
    await Then("the expired license should appear in the licenses list with past expiry date", null, { page });
  });

  test("Plant with valid license can be selected for work order", { tag: ["@plant-production", "@PLANT-LIC-TC-008", "@regression", "@p1", "@iacs-md", "@PLANT-P1"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created an active plant with a valid license and an active asset", null, { page });
    await When("I navigate to work order creation", null, { page });
    await Then("the production-ready plant should be available for selection", null, { page });
  });

  test("Work order blocked when plant has no valid license", { tag: ["@plant-production", "@PLANT-LIC-TC-005", "@regression", "@p1", "@iacs-md", "@PLANT-P1", "@known-defect"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a plant with no licenses", null, { page });
    await When("I navigate to work order creation", null, { page });
    await Then("the plant without a license should not be selectable for a work order", null, { page });
  });

  test("License deletion is available in the UI", { tag: ["@plant-production", "@PLANT-LIC-TC-009", "@regression", "@p2", "@iacs-md", "@PLANT-P1", "@known-defect"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a plant license with a unique AUTO_QA number", null, { page });
    await When("I switch to the Plant Licenses tab", null, { page });
    await Then("the Delete button should be visible for the license row", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/plant-production/02-plant-licenses.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Create license with required fields": {"pickleLocation":"17:3","tags":["@plant-production","@PLANT-LIC-TC-001","@smoke","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@smoke","@PLANT-LIC-TC-001"]},
  "License renewal - update expiry date to future date": {"pickleLocation":"32:3","tags":["@plant-production","@PLANT-LIC-TC-007","@regression","@p2","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-LIC-TC-007"]},
  "Edit license updates and persists": {"pickleLocation":"41:3","tags":["@plant-production","@PLANT-LIC-TC-011","@regression","@p2","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-LIC-TC-011"]},
  "License mandatory field validation shows inline errors": {"pickleLocation":"53:3","tags":["@plant-production","@PLANT-LIC-TC-002","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-LIC-TC-002"]},
  "License date validation rejects expiry before issue date": {"pickleLocation":"61:3","tags":["@plant-production","@PLANT-LIC-TC-003","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-LIC-TC-003"]},
  "License number uniqueness per plant validation": {"pickleLocation":"75:3","tags":["@plant-production","@PLANT-LIC-TC-004","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-LIC-TC-004"]},
  "Expired license is visually identifiable in the list": {"pickleLocation":"90:3","tags":["@plant-production","@PLANT-LIC-TC-006","@regression","@p2","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-LIC-TC-006"]},
  "Plant with valid license can be selected for work order": {"pickleLocation":"96:3","tags":["@plant-production","@PLANT-LIC-TC-008","@regression","@p1","@iacs-md","@PLANT-P1"],"ownTags":["@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-LIC-TC-008"]},
  "Work order blocked when plant has no valid license": {"pickleLocation":"104:3","tags":["@plant-production","@PLANT-LIC-TC-005","@regression","@p1","@iacs-md","@PLANT-P1","@known-defect"],"ownTags":["@known-defect","@PLANT-P1","@iacs-md","@p1","@regression","@PLANT-LIC-TC-005"]},
  "License deletion is available in the UI": {"pickleLocation":"112:3","tags":["@plant-production","@PLANT-LIC-TC-009","@regression","@p2","@iacs-md","@PLANT-P1","@known-defect"],"ownTags":["@known-defect","@PLANT-P1","@iacs-md","@p2","@regression","@PLANT-LIC-TC-009"]},
};