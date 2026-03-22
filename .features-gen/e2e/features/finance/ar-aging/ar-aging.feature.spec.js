/** Generated from: e2e/features/finance/ar-aging/ar-aging.feature */
import { test } from "playwright-bdd";

test.describe("AR Aging Report", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("AR Aging report page loads for authorized user", { tag: ["@FIN-AR-TC-001", "@smoke", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I am on the AR aging report page", null, { page });
    await Then("I should see the AR aging report heading", null, { page });
    await And("AR aging report should finish loading", null, { page });
  });

  test("Dealer summary shows table or empty receivables message", { tag: ["@FIN-AR-TC-002", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the AR aging report page", null, { page });
    await Then("AR aging dealer summary should show table or empty receivables message", null, { page });
  });

  test("User can switch Dealer Summary Invoice Detail and Snapshots tabs", { tag: ["@FIN-AR-TC-003", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the AR aging report page", null, { page });
    await When("I open the AR aging invoice detail tab", null, { page });
    await Then("I should see AR aging invoice detail tab content", null, { page });
    await When("I open the AR aging snapshots tab", null, { page });
    await Then("I should see AR aging snapshots tab content", null, { page });
    await When("I open the AR aging dealer summary tab", null, { page });
    await Then("AR aging dealer summary should show table or empty receivables message", null, { page });
  });

  test("Filters panel opens and closes from toolbar", { tag: ["@FIN-AR-TC-004", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the AR aging report page", null, { page });
    await When("I open AR aging filters panel from toolbar", null, { page });
    await Then("AR aging filter options panel should be visible", null, { page });
    await When("I close AR aging filters panel from toolbar", null, { page });
    await Then("AR aging filter options panel should be hidden", null, { page });
  });

  test("Due date aging basis shows not due column after apply filters", { tag: ["@FIN-AR-TC-005", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the AR aging report page", null, { page });
    await When("I open AR aging filters panel from toolbar", null, { page });
    await And("I set AR aging basis to due date", null, { page });
    await And("I apply AR aging filters", null, { page });
    await Then("AR aging dealer summary should show not due column for due date basis", null, { page });
  });

  test("Dealer search with no match shows empty search message", { tag: ["@FIN-AR-TC-006", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the AR aging report page", null, { page });
    await When("I search AR aging with text \"___AUTO_QA_NO_DEALER_MATCH___\"", null, { page });
    await Then("I should see no AR aging dealers matching search message", null, { page });
  });

  test("Export Excel shows success when receivables data exists", { tag: ["@FIN-AR-TC-007", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the AR aging report page", null, { page });
    await When("I export AR aging Excel if data is available", null, { page });
    await Then("I should see AR aging Excel export success toast if export ran", null, { page });
  });

  test("Export PDF shows success when receivables data exists", { tag: ["@FIN-AR-TC-008", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the AR aging report page", null, { page });
    await When("I export AR aging PDF if data is available", null, { page });
    await Then("I should see AR aging PDF export success toast if export ran", null, { page });
  });

  test("User without AR aging module access is redirected from report URL", { tag: ["@FIN-AR-TC-009", "@negative", "@p2", "@iacs-ed"] }, async ({ When, page, Then }) => {
    await When("I attempt to open AR aging report as unauthorized user", null, { page });
    await Then("I should be denied access to AR aging report", null, { page });
  });

  test("Legacy finance reports AR aging URL redirects to canonical page", { tag: ["@FIN-AR-TC-010", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the AR aging report page via legacy reports path", null, { page });
    await Then("I should be on the canonical AR aging report URL", null, { page });
  });

  test("Snapshots tab shows heading or empty snapshots state", { tag: ["@FIN-AR-TC-011", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the AR aging report page", null, { page });
    await When("I open the AR aging snapshots tab", null, { page });
    await Then("I should see AR aging snapshots tab content", null, { page });
  });

  test("Generate Snapshot dialog opens and cancels without error", { tag: ["@FIN-AR-TC-012", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the AR aging report page", null, { page });
    await When("I open the AR aging snapshots tab", null, { page });
    await And("I open AR aging generate snapshot dialog", null, { page });
    await Then("AR aging generate snapshot dialog should be visible", null, { page });
    await When("I cancel AR aging generate snapshot dialog", null, { page });
    await Then("AR aging generate snapshot dialog should be hidden", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/ar-aging/ar-aging.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "AR Aging report page loads for authorized user": {"pickleLocation":"12:3","tags":["@FIN-AR-TC-001","@smoke","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@smoke","@FIN-AR-TC-001"]},
  "Dealer summary shows table or empty receivables message": {"pickleLocation":"18:3","tags":["@FIN-AR-TC-002","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-AR-TC-002"]},
  "User can switch Dealer Summary Invoice Detail and Snapshots tabs": {"pickleLocation":"23:3","tags":["@FIN-AR-TC-003","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-AR-TC-003"]},
  "Filters panel opens and closes from toolbar": {"pickleLocation":"33:3","tags":["@FIN-AR-TC-004","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-AR-TC-004"]},
  "Due date aging basis shows not due column after apply filters": {"pickleLocation":"42:3","tags":["@FIN-AR-TC-005","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-AR-TC-005"]},
  "Dealer search with no match shows empty search message": {"pickleLocation":"50:3","tags":["@FIN-AR-TC-006","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-AR-TC-006"]},
  "Export Excel shows success when receivables data exists": {"pickleLocation":"56:3","tags":["@FIN-AR-TC-007","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-AR-TC-007"]},
  "Export PDF shows success when receivables data exists": {"pickleLocation":"62:3","tags":["@FIN-AR-TC-008","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-AR-TC-008"]},
  "User without AR aging module access is redirected from report URL": {"pickleLocation":"69:3","tags":["@FIN-AR-TC-009","@negative","@p2","@iacs-ed"],"ownTags":["@iacs-ed","@p2","@negative","@FIN-AR-TC-009"]},
  "Legacy finance reports AR aging URL redirects to canonical page": {"pickleLocation":"74:3","tags":["@FIN-AR-TC-010","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-AR-TC-010"]},
  "Snapshots tab shows heading or empty snapshots state": {"pickleLocation":"79:3","tags":["@FIN-AR-TC-011","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-AR-TC-011"]},
  "Generate Snapshot dialog opens and cancels without error": {"pickleLocation":"85:3","tags":["@FIN-AR-TC-012","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-AR-TC-012"]},
};