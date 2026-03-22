/** Generated from: e2e/features/finance/dealer-ledger/dealer-ledger.feature */
import { test } from "playwright-bdd";

test.describe("Dealer Ledger", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Load dealer ledger by business name shows summary and transactions", { tag: ["@FIN-DL-TC-001", "@smoke", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"Ramesh ningappa diggai\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await Then("dealer information should display business name \"Ramesh ningappa diggai\" and dealer code \"IACS5509\"", null, { page });
    await And("dealer ledger summary cards should be visible", null, { page });
    await And("dealer ledger transaction history table should be visible", null, { page });
    await And("dealer ledger should have at least one transaction row", null, { page });
  });

  test("Load dealer ledger by dealer code shows invoice transaction", { tag: ["@FIN-DL-TC-002", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await Then("dealer information should display business name \"Ramesh ningappa diggai\" and dealer code \"IACS5509\"", null, { page });
    await And("dealer ledger should show at least one invoice transaction", null, { page });
  });

  test("Load Ledger is disabled until a dealer is selected", { tag: ["@FIN-DL-TC-003", "@negative", "@p2", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await Then("Load Ledger button should be disabled", null, { page });
  });

  test("Load dealer ledger with explicit date range still returns transactions", { tag: ["@FIN-DL-TC-004", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I set dealer ledger date range from \"2020-01-01\" to \"2030-12-31\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await Then("dealer ledger should have at least one transaction row", null, { page });
  });

  test("Export dealer ledger CSV shows success toast with row count", { tag: ["@FIN-DL-TC-005", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await And("I export dealer ledger as CSV", null, { page });
    await Then("I should see dealer ledger CSV export success toast", null, { page });
  });

  test("Transaction type filter shows invoices only", { tag: ["@FIN-DL-TC-006", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await And("I filter dealer ledger transactions by type \"Invoices\"", null, { page });
    await Then("all visible dealer ledger data rows should show transaction type \"Invoice\"", null, { page });
  });

  test("Invoice document link navigates to O2C invoice detail", { tag: ["@FIN-DL-TC-007", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await And("I filter dealer ledger transactions by type \"Invoices\"", null, { page });
    await And("I open the first invoice document link from dealer ledger", null, { page });
    await Then("I should be on an O2C invoice detail page", null, { page });
  });

  test("User without dealer ledger access is redirected from dealer ledger URL", { tag: ["@FIN-DL-TC-008", "@negative", "@p2", "@iacs-ed"] }, async ({ When, page, Then }) => {
    await When("I attempt to open dealer ledger as unauthorized user", null, { page });
    await Then("I should be denied access to dealer ledger", null, { page });
  });

  test("Export standard dealer ledger PDF shows success toast", { tag: ["@FIN-DL-TC-009", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await And("I export dealer ledger standard PDF", null, { page });
    await Then("I should see dealer ledger standard PDF export success toast", null, { page });
  });

  test("Export detailed invoice ledger PDF shows success toast", { tag: ["@FIN-DL-TC-010", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await And("I export dealer ledger detailed invoice PDF", null, { page });
    await Then("I should see dealer ledger detailed PDF export success toast", null, { page });
  });

  test("Search by document number narrows transaction rows", { tag: ["@FIN-DL-TC-011", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await And("I filter dealer ledger transactions by type \"Invoices\"", null, { page });
    await And("I search dealer ledger transactions with first row document number", null, { page });
    await Then("dealer ledger transaction table should show exactly one data row", null, { page });
  });

  test("Date column header toggles sort without breaking table", { tag: ["@FIN-DL-TC-012", "@regression", "@p3", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await And("I click dealer ledger date column header to toggle sort", null, { page });
    await Then("dealer ledger should have at least one transaction row", null, { page });
  });

  test("Payment document link navigates to O2C payment detail", { tag: ["@FIN-DL-TC-013", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await And("I filter dealer ledger transactions by type \"Payments\"", null, { page });
    await And("I open the first payment document link from dealer ledger", null, { page });
    await Then("I should be on an O2C payment detail page", null, { page });
  });

  test("Credit note document link navigates to credit memo detail", { tag: ["@FIN-DL-TC-014", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await And("I filter dealer ledger transactions by type \"Credit Notes\"", null, { page });
    await And("I open the first credit note document link from dealer ledger", null, { page });
    await Then("I should be on a credit memo detail page", null, { page });
  });

  test("AR aging analysis appears when outstanding aging data exists", { tag: ["@FIN-DL-TC-015", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await Then("dealer ledger AR aging analysis may be visible when data exists", null, { page });
  });

  test("VAN section appears when unallocated payment data exists", { tag: ["@FIN-DL-TC-016", "@regression", "@p3", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the dealer ledger page", null, { page });
    await When("I select dealer by search text \"IACS5509\"", null, { page });
    await And("I load dealer ledger", null, { page });
    await Then("dealer ledger VAN section may be visible when data exists", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/dealer-ledger/dealer-ledger.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Load dealer ledger by business name shows summary and transactions": {"pickleLocation":"11:3","tags":["@FIN-DL-TC-001","@smoke","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@smoke","@FIN-DL-TC-001"]},
  "Load dealer ledger by dealer code shows invoice transaction": {"pickleLocation":"21:3","tags":["@FIN-DL-TC-002","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@FIN-DL-TC-002"]},
  "Load Ledger is disabled until a dealer is selected": {"pickleLocation":"29:3","tags":["@FIN-DL-TC-003","@negative","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@negative","@FIN-DL-TC-003"]},
  "Load dealer ledger with explicit date range still returns transactions": {"pickleLocation":"34:3","tags":["@FIN-DL-TC-004","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-DL-TC-004"]},
  "Export dealer ledger CSV shows success toast with row count": {"pickleLocation":"42:3","tags":["@FIN-DL-TC-005","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-DL-TC-005"]},
  "Transaction type filter shows invoices only": {"pickleLocation":"50:3","tags":["@FIN-DL-TC-006","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-DL-TC-006"]},
  "Invoice document link navigates to O2C invoice detail": {"pickleLocation":"58:3","tags":["@FIN-DL-TC-007","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-DL-TC-007"]},
  "User without dealer ledger access is redirected from dealer ledger URL": {"pickleLocation":"67:3","tags":["@FIN-DL-TC-008","@negative","@p2","@iacs-ed"],"ownTags":["@iacs-ed","@p2","@negative","@FIN-DL-TC-008"]},
  "Export standard dealer ledger PDF shows success toast": {"pickleLocation":"72:3","tags":["@FIN-DL-TC-009","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-DL-TC-009"]},
  "Export detailed invoice ledger PDF shows success toast": {"pickleLocation":"80:3","tags":["@FIN-DL-TC-010","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-DL-TC-010"]},
  "Search by document number narrows transaction rows": {"pickleLocation":"88:3","tags":["@FIN-DL-TC-011","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-DL-TC-011"]},
  "Date column header toggles sort without breaking table": {"pickleLocation":"97:3","tags":["@FIN-DL-TC-012","@regression","@p3","@iacs-md"],"ownTags":["@iacs-md","@p3","@regression","@FIN-DL-TC-012"]},
  "Payment document link navigates to O2C payment detail": {"pickleLocation":"105:3","tags":["@FIN-DL-TC-013","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-DL-TC-013"]},
  "Credit note document link navigates to credit memo detail": {"pickleLocation":"114:3","tags":["@FIN-DL-TC-014","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-DL-TC-014"]},
  "AR aging analysis appears when outstanding aging data exists": {"pickleLocation":"123:3","tags":["@FIN-DL-TC-015","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-DL-TC-015"]},
  "VAN section appears when unallocated payment data exists": {"pickleLocation":"130:3","tags":["@FIN-DL-TC-016","@regression","@p3","@iacs-md"],"ownTags":["@iacs-md","@p3","@regression","@FIN-DL-TC-016"]},
};