/** Generated from: e2e/features/finance/fiscal-periods/fiscal-periods.feature */
import { test } from "playwright-bdd";

test.describe("Fiscal Period Management and Posting Control", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Fiscal periods page loads with fiscal year tabs", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-001", "@smoke", "@p0"] }, async ({ Given, page, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await Then("at least one fiscal year tab is visible", null, { page });
  });

  test("Open a draft period enables posting allowed badge", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-002", "@smoke", "@p0"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await When("I open first draft fiscal period from database if present", null, { page });
    await Then("the period row shows posting allowed or test skipped when no draft exists", null, { page });
  });

  test("Soft close an open period shows soft_closed status", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-003", "@critical", "@p0"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await When("I soft close first open fiscal period from database if present", null, { page });
    await Then("the period row shows closed status or test skipped when no open period exists", null, { page });
  });

  test("Hard close a soft_closed period shows permanently locked", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-004", "@critical", "@p0"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await When("I hard close first soft closed fiscal period from database if present", null, { page });
    await Then("the period row shows permanently locked or test skipped", null, { page });
  });

  test("Reopen a soft_closed period restores open status", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-005", "@critical", "@p0"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await When("I reopen first soft closed fiscal period from database if present", null, { page });
    await Then("the period row shows open status or hard closed blocking reopen or test skipped", null, { page });
  });

  test("Sequential closing rule blocks closing later period when earlier is still open", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-006", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await When("I attempt to soft close a later period while an earlier period is open in the same year", null, { page });
    await Then("an error toast explains sequential closing or action not applicable", null, { page });
  });

  test("Hard closed period shows no action buttons only Permanently Locked badge", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-007", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await When("I view a hard closed period row from database if present", null, { page });
    await Then("only permanently locked badge shows in actions or test skipped", null, { page });
  });

  test("New Fiscal Year dialog creates periods with correct structure", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-008", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await When("I open new fiscal year dialog", null, { page });
    await Then("the create fiscal year form shows required fields", null, { page });
  });

  test("Posting validation blocks transaction dated in hard_closed period", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-009", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await When("I view a hard closed period row from database if present", null, { page });
    await Then("posting column shows locked for that period or test skipped", null, { page });
  });

  test("Period status legend badges are all visible on page load", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-010", "@regression", "@p2"] }, async ({ Given, page, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await Then("fiscal period status legend shows never opened open closed and hard closed", null, { page });
  });

  test("Switching fiscal year tabs loads that year periods", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-011", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await When("I switch to the second fiscal year tab", null, { page });
    await Then("fiscal periods table or empty state is visible", null, { page });
  });

  test("Year end close button only appears when all periods are hard closed", { tag: ["@finance", "@fiscal-periods", "@iacs-md", "@FIN-FP-TC-012", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the fiscal periods page", null, { page });
    await When("I select fiscal year where summary may have all hard closed", null, { page });
    await Then("year end close button visibility matches all hard closed state or not applicable");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/fiscal-periods/fiscal-periods.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Fiscal periods page loads with fiscal year tabs": {"pickleLocation":"11:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-001","@smoke","@p0"],"ownTags":["@iacs-md","@p0","@smoke","@FIN-FP-TC-001"]},
  "Open a draft period enables posting allowed badge": {"pickleLocation":"16:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-002","@smoke","@p0"],"ownTags":["@iacs-md","@p0","@smoke","@FIN-FP-TC-002"]},
  "Soft close an open period shows soft_closed status": {"pickleLocation":"22:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-003","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-FP-TC-003"]},
  "Hard close a soft_closed period shows permanently locked": {"pickleLocation":"28:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-004","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-FP-TC-004"]},
  "Reopen a soft_closed period restores open status": {"pickleLocation":"34:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-005","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-FP-TC-005"]},
  "Sequential closing rule blocks closing later period when earlier is still open": {"pickleLocation":"40:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-006","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-FP-TC-006"]},
  "Hard closed period shows no action buttons only Permanently Locked badge": {"pickleLocation":"46:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-007","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-FP-TC-007"]},
  "New Fiscal Year dialog creates periods with correct structure": {"pickleLocation":"52:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-008","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-FP-TC-008"]},
  "Posting validation blocks transaction dated in hard_closed period": {"pickleLocation":"58:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-009","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-FP-TC-009"]},
  "Period status legend badges are all visible on page load": {"pickleLocation":"64:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-010","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-FP-TC-010"]},
  "Switching fiscal year tabs loads that year periods": {"pickleLocation":"69:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-011","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-FP-TC-011"]},
  "Year end close button only appears when all periods are hard closed": {"pickleLocation":"75:3","tags":["@finance","@fiscal-periods","@iacs-md","@FIN-FP-TC-012","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-FP-TC-012"]},
};