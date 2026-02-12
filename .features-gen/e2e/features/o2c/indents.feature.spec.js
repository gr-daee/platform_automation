/** Generated from: e2e/features/o2c/indents.feature */
import { test } from "playwright-bdd";

test.describe("O2C Indent Management", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in as \"IACS MD User\"", null, { page });
  });

  test("User searches and selects dealer from Create Indent modal", { tag: ["@O2C-INDENT-TC-012", "@regression", "@dealer-search", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I click the Create Indent button", null, { page });
    await Then("I should see the \"Select Dealer\" modal", null, { page });
    await And("the modal should display a list of active dealers");
    await And("the modal should have a search input", null, { page });
    await When("I search for dealer by name \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("the dealer list should be filtered", null, { page });
    await And("I should see \"VAYUPUTRA AGENCIES\" in the results", null, { page });
    await When("I select the dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("the modal should close", null, { page });
    await And("I should be on the indent creation page with dealer pre-selected", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/o2c/indents.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "User searches and selects dealer from Create Indent modal": {"pickleLocation":"10:3","tags":["@O2C-INDENT-TC-012","@regression","@dealer-search","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@dealer-search","@regression","@O2C-INDENT-TC-012"]},
};