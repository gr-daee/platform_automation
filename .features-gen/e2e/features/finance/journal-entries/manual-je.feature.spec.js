/** Generated from: e2e/features/finance/journal-entries/manual-je.feature */
import { test } from "playwright-bdd";

test.describe("Manual journal entries and GL verification", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Create balanced manual JE and verify posted status in DB", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-JE-TC-001", "@p0"] }, async ({ When, page, Then }) => {
    await When("I create and post a balanced manual journal entry via UI", null, { page });
    await Then("the manual journal entry should be posted in the database");
  });

  test("Create multi-line JE (4 lines) and verify all lines in DB", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-JE-TC-002", "@p1"] }, async ({ When, page, Then }) => {
    await When("I create and post a four line manual journal entry via UI", null, { page });
    await Then("the journal entry should have 4 lines in the database");
  });

  test("Imbalanced JE blocked — no journal posted", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-JE-TC-003", "@p1"] }, async ({ When, page, Then }) => {
    await When("I attempt to post an imbalanced manual journal entry via UI", null, { page });
    await Then("no new posted journal header is created for the test description");
  });

  test("JE blocked when fiscal period is closed", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-JE-TC-004", "@p1"] }, async ({ When, page, Then }) => {
    await When("I set manual JE entry date to a hard closed fiscal period if available", null, { page });
    await Then("post immediately should show period error or test skipped", null, { page });
  });

  test("JE date links fiscal period in DB when posted", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-JE-TC-005", "@p2"] }, async ({ When, page, Then }) => {
    await When("I create and post a balanced manual journal entry via UI", null, { page });
    await Then("the posted journal should have fiscal_period_id set when periods exist");
  });

  test("JE narration text saved in description field", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-JE-TC-006", "@p2"] }, async ({ When, page, Then }) => {
    await When("I create and post a balanced manual journal entry via UI with narration", null, { page });
    await Then("the journal header description contains the narration text");
  });

  test("Manual JE audit source module", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-JE-TC-007", "@p2"] }, async ({ When, page, Then }) => {
    await When("I create and post a balanced manual journal entry via UI", null, { page });
    await Then("the journal header may be manual or automated per product implementation");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/journal-entries/manual-je.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Create balanced manual JE and verify posted status in DB": {"pickleLocation":"8:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-JE-TC-001","@p0"],"ownTags":["@iacs-md","@p0","@FIN-JE-TC-001"]},
  "Create multi-line JE (4 lines) and verify all lines in DB": {"pickleLocation":"13:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-JE-TC-002","@p1"],"ownTags":["@iacs-md","@p1","@FIN-JE-TC-002"]},
  "Imbalanced JE blocked — no journal posted": {"pickleLocation":"18:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-JE-TC-003","@p1"],"ownTags":["@iacs-md","@p1","@FIN-JE-TC-003"]},
  "JE blocked when fiscal period is closed": {"pickleLocation":"23:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-JE-TC-004","@p1"],"ownTags":["@iacs-md","@p1","@FIN-JE-TC-004"]},
  "JE date links fiscal period in DB when posted": {"pickleLocation":"28:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-JE-TC-005","@p2"],"ownTags":["@iacs-md","@p2","@FIN-JE-TC-005"]},
  "JE narration text saved in description field": {"pickleLocation":"33:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-JE-TC-006","@p2"],"ownTags":["@iacs-md","@p2","@FIN-JE-TC-006"]},
  "Manual JE audit source module": {"pickleLocation":"38:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-JE-TC-007","@p2"],"ownTags":["@iacs-md","@p2","@FIN-JE-TC-007"]},
};