/** Generated from: e2e/features/auth/login.feature */
import { test } from "playwright-bdd";

test.describe("User Authentication with TOTP MFA", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am on the login page", null, { page });
  });

  test("Successful login with valid TOTP for Admin user", { tag: ["@AUTH-LOGIN-TC-001", "@smoke", "@critical"] }, async ({ When, And, Then, page }) => {
    await When("I enter valid admin credentials");
    await And("I submit the login form");
    await Then("I should see the TOTP verification step", null, { page });
    await When("I generate and enter a valid TOTP code");
    await And("I submit the TOTP verification", null, { page });
    await Then("I should see a success message", null, { page });
    await And("I should be redirected to the notes page", null, { page });
  });

  test("Login fails with invalid TOTP code", { tag: ["@AUTH-LOGIN-TC-002", "@smoke", "@critical"] }, async ({ When, And, Then, page }) => {
    await When("I enter valid admin credentials");
    await And("I submit the login form");
    await Then("I should see the TOTP verification step", null, { page });
    await When("I enter an invalid TOTP code \"000000\"");
    await And("I submit the TOTP verification", null, { page });
    await Then("I should see an error message", null, { page });
    await And("I should remain on the TOTP verification step", null, { page });
  });

  test("Login fails with incorrect password", { tag: ["@AUTH-LOGIN-TC-003", "@regression"] }, async ({ When, And, Then, page }) => {
    await When("I enter admin email \"admin@example.com\"");
    await And("I enter an incorrect password \"WrongPassword123!\"");
    await And("I submit the login form");
    await Then("I should see an error message", null, { page });
    await And("I should remain on the login page", null, { page });
  });

  test("Login form validation for empty fields", { tag: ["@AUTH-LOGIN-TC-004", "@regression"] }, async ({ When, Then, page, And }) => {
    await When("I submit the login form without entering credentials");
    await Then("the login form should show validation errors", null, { page });
    await And("I should remain on the login page", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/auth/login.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Successful login with valid TOTP for Admin user": {"pickleLocation":"11:3","tags":["@AUTH-LOGIN-TC-001","@smoke","@critical"],"ownTags":["@critical","@smoke","@AUTH-LOGIN-TC-001"]},
  "Login fails with invalid TOTP code": {"pickleLocation":"21:3","tags":["@AUTH-LOGIN-TC-002","@smoke","@critical"],"ownTags":["@critical","@smoke","@AUTH-LOGIN-TC-002"]},
  "Login fails with incorrect password": {"pickleLocation":"31:3","tags":["@AUTH-LOGIN-TC-003","@regression"],"ownTags":["@regression","@AUTH-LOGIN-TC-003"]},
  "Login form validation for empty fields": {"pickleLocation":"39:3","tags":["@AUTH-LOGIN-TC-004","@regression"],"ownTags":["@regression","@AUTH-LOGIN-TC-004"]},
};