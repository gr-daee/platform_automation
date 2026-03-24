/** Generated from: e2e/features/o2c/dealers-city.feature */
import { test } from "playwright-bdd";

test.describe("Dealers list city visibility", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Dealers list shows city in Region/Territory/City column", { tag: ["@DAEE-347", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, Then, And }) => {
    await When("I open dealers list page", null, { page });
    await Then("the dealers list should show \"Region / Territory / City\" column", null, { page });
    await And("at least one dealer row should display city in the location column", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/o2c/dealers-city.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Dealers list shows city in Region/Territory/City column": {"pickleLocation":"10:3","tags":["@DAEE-347","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@DAEE-347"]},
};