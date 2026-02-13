/** Generated from: e2e/features/finance/compliance/gstr1.feature */
import { test } from "playwright-bdd";

test.describe("GSTR-1 Review Page", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("User with compliance.read can open GSTR-1 Review page", { tag: ["@GSTR1-DAEE-100-TC-001", "@DAEE-100", "@smoke", "@regression", "@p0", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the GSTR-1 Review page", null, { page });
    await Then("I should see the GSTR-1 Review page", null, { page });
  });

  test.describe("User access control for GSTR-1 page", () => {

    test("Example #1", { tag: ["@GSTR1-DAEE-100-TC-003", "@DAEE-100", "@regression", "@p1", "@multi-user", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
      await Given("I am logged in as \"IACS MD User\"", null, { page });
      await When("I navigate to \"/finance/compliance/gstr1\"", null, { page });
      await Then("I should see \"the GSTR-1 Review page\" for GSTR-1 access", null, { page });
    });

  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/compliance/gstr1.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "User with compliance.read can open GSTR-1 Review page": {"pickleLocation":"10:3","tags":["@GSTR1-DAEE-100-TC-001","@DAEE-100","@smoke","@regression","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@regression","@smoke","@DAEE-100","@GSTR1-DAEE-100-TC-001"]},
  "User access control for GSTR-1 page|Example #1": {"pickleLocation":"23:7","tags":["@GSTR1-DAEE-100-TC-003","@DAEE-100","@regression","@p1","@multi-user","@iacs-md"]},
};