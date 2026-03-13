/** Generated from: e2e/features/finance/cash-receipts/van-api-validation.feature */
import { test } from "playwright-bdd";

test.describe("VAN API Validation", () => {

  test("Valid VAN validation succeeds", { tag: ["@FIN-VAN-TC-001", "@smoke", "@critical", "@p0"] }, async ({ When, Then }) => {
    await When("I send VAN validation request with VAN \"IACS1234\" and amount \"5000.00\"");
    await Then("VAN validation should succeed with dealer");
  });

  test("Invalid VAN is rejected", { tag: ["@FIN-VAN-TC-002", "@negative"] }, async ({ When, Then }) => {
    await When("I send VAN validation request with VAN \"INVALID_VAN_999\" and amount \"5000.00\"");
    await Then("VAN validation should fail with message containing \"invalid\"");
  });

  test("Invalid signature is rejected", { tag: ["@FIN-VAN-TC-003", "@security"] }, async ({ When, Then }) => {
    await When("I send VAN validation request with invalid signature");
    await Then("VAN validation should fail with message containing \"signature\"");
  });

  test("Inactive dealer VAN is rejected", { tag: ["@FIN-VAN-TC-004", "@edge"] }, async ({ When, Then }) => {
    await When("I send VAN validation request with VAN \"INACTIVE_VAN\" and amount \"5000.00\"");
    await Then("VAN validation should fail with message containing \"inactive\"");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/cash-receipts/van-api-validation.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Valid VAN validation succeeds": {"pickleLocation":"9:3","tags":["@FIN-VAN-TC-001","@smoke","@critical","@p0"],"ownTags":["@p0","@critical","@smoke","@FIN-VAN-TC-001"]},
  "Invalid VAN is rejected": {"pickleLocation":"14:3","tags":["@FIN-VAN-TC-002","@negative"],"ownTags":["@negative","@FIN-VAN-TC-002"]},
  "Invalid signature is rejected": {"pickleLocation":"19:3","tags":["@FIN-VAN-TC-003","@security"],"ownTags":["@security","@FIN-VAN-TC-003"]},
  "Inactive dealer VAN is rejected": {"pickleLocation":"24:3","tags":["@FIN-VAN-TC-004","@edge"],"ownTags":["@edge","@FIN-VAN-TC-004"]},
};