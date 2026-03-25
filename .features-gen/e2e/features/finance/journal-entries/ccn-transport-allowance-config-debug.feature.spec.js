/** Generated from: e2e/features/finance/journal-entries/ccn-transport-allowance-config-debug.feature */
import { test } from "playwright-bdd";

test.describe("Debug posting profile resolution for transport_allowance (freight_allowance)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Inspect posting_profiles vs fallback account names", { tag: ["@finance", "@journal-entries", "@ccn-je", "@debug", "@iacs-md", "@FIN-CCN-DEBUG-001"] }, async ({ Then }) => {
    await Then("I inspect posting profiles for transport_allowance sales-freight_allowance");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/journal-entries/ccn-transport-allowance-config-debug.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Inspect posting_profiles vs fallback account names": {"pickleLocation":"8:3","tags":["@finance","@journal-entries","@ccn-je","@debug","@iacs-md","@FIN-CCN-DEBUG-001"],"ownTags":["@FIN-CCN-DEBUG-001"]},
};