/** Generated from: e2e/features/plant-production/06-work-orders.feature */
import { test } from "playwright-bdd";

test.describe("Production Work Orders Management (DAEE-166)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am on the Work Orders page", null, { page });
  });

  test("Work Orders page loads with statistics", { tag: ["@plant-production", "@PLANT-P3", "@PLANT-WO-TC-001", "@smoke", "@p1", "@iacs-md"] }, async ({ Then, page, And }) => {
    await Then("the Work Orders page should show statistics cards", null, { page });
    await And("the work orders table should be visible", null, { page });
  });

  test("Create a work order in manual mode", { tag: ["@plant-production", "@PLANT-P3", "@PLANT-WO-TC-002", "@smoke", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create Work Order dialog", null, { page });
    await And("I select manual work order type", null, { page });
    await And("I select any available product for the work order", null, { page });
    await And("I select any available plant for the work order", null, { page });
    await And("I fill quantity as 10", null, { page });
    await And("I fill planned start date as today", null, { page });
    await And("I fill planned end date as tomorrow", null, { page });
    await And("I submit the work order form", null, { page });
    await Then("I should see a work order created success toast", null, { page });
    await And("the work order should appear in the list", null, { page });
  });

  test("Work order quantity validation", { tag: ["@plant-production", "@PLANT-P3", "@PLANT-WO-TC-003", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
    await When("I open the Create Work Order dialog", null, { page });
    await And("I select manual work order type", null, { page });
    await And("I select any available product for the work order", null, { page });
    await And("I select any available plant for the work order", null, { page });
    await And("I fill quantity as 0", null, { page });
    await And("I submit the work order form", null, { page });
    await Then("I should see a quantity validation error", null, { page });
  });

  test("Filter work orders by status", { tag: ["@plant-production", "@PLANT-P3", "@PLANT-WO-TC-004", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, Then }) => {
    await When("I filter work orders by status Pending", null, { page });
    await Then("only pending work orders should be visible in the list", null, { page });
  });

  test("Search work orders by keyword", { tag: ["@plant-production", "@PLANT-P3", "@PLANT-WO-TC-005", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a work order in manual mode", null, { page });
    await When("I search for the work order by number", null, { page });
    await Then("the matching work order should be visible", null, { page });
  });

  test("Delete a work order", { tag: ["@plant-production", "@PLANT-P3", "@PLANT-WO-TC-006", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a work order in manual mode", null, { page });
    await When("I delete the created work order", null, { page });
    await Then("the work order should not appear in the list", null, { page });
  });

  test("Approve a pending work order", { tag: ["@plant-production", "@PLANT-P3", "@PLANT-WO-TC-007", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I have created a work order in manual mode", null, { page });
    await When("I approve the created work order", null, { page });
    await Then("the work order status should be approved", null, { page });
  });

  test("Work Orders page shows No work orders message when list is empty", { tag: ["@plant-production", "@PLANT-P3", "@PLANT-WO-TC-008", "@regression", "@p2", "@iacs-md"] }, async ({ When, page, Then }) => {
    await When("I filter work orders by status Cancelled", null, { page });
    await Then("the work orders list should show no results or be empty", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/plant-production/06-work-orders.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Work Orders page loads with statistics": {"pickleLocation":"8:3","tags":["@plant-production","@PLANT-P3","@PLANT-WO-TC-001","@smoke","@p1","@iacs-md"],"ownTags":["@PLANT-P3","@iacs-md","@p1","@smoke","@PLANT-WO-TC-001"]},
  "Create a work order in manual mode": {"pickleLocation":"13:3","tags":["@plant-production","@PLANT-P3","@PLANT-WO-TC-002","@smoke","@p1","@iacs-md"],"ownTags":["@PLANT-P3","@iacs-md","@p1","@smoke","@PLANT-WO-TC-002"]},
  "Work order quantity validation": {"pickleLocation":"26:3","tags":["@plant-production","@PLANT-P3","@PLANT-WO-TC-003","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P3","@iacs-md","@p1","@regression","@PLANT-WO-TC-003"]},
  "Filter work orders by status": {"pickleLocation":"36:3","tags":["@plant-production","@PLANT-P3","@PLANT-WO-TC-004","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P3","@iacs-md","@p1","@regression","@PLANT-WO-TC-004"]},
  "Search work orders by keyword": {"pickleLocation":"41:3","tags":["@plant-production","@PLANT-P3","@PLANT-WO-TC-005","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P3","@iacs-md","@p1","@regression","@PLANT-WO-TC-005"]},
  "Delete a work order": {"pickleLocation":"47:3","tags":["@plant-production","@PLANT-P3","@PLANT-WO-TC-006","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P3","@iacs-md","@p2","@regression","@PLANT-WO-TC-006"]},
  "Approve a pending work order": {"pickleLocation":"53:3","tags":["@plant-production","@PLANT-P3","@PLANT-WO-TC-007","@regression","@p1","@iacs-md"],"ownTags":["@PLANT-P3","@iacs-md","@p1","@regression","@PLANT-WO-TC-007"]},
  "Work Orders page shows No work orders message when list is empty": {"pickleLocation":"59:3","tags":["@plant-production","@PLANT-P3","@PLANT-WO-TC-008","@regression","@p2","@iacs-md"],"ownTags":["@PLANT-P3","@iacs-md","@p2","@regression","@PLANT-WO-TC-008"]},
};