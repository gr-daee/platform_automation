/** Generated from: e2e/features/finance/credit-memos/credit-memos.feature */
import { test } from "playwright-bdd";

test.describe("Credit Memos", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Create credit memo with valid inputs", { tag: ["@FIN-CM-TC-001", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"120\" and reason \"transport_allowance\"", null, { page });
    await Then("credit memo should be created successfully");
  });

  test("Partially apply credit memo to oldest outstanding invoice", { tag: ["@FIN-CM-TC-002", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"120\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"60\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await Then("credit memo should be created successfully");
  });

  test("Credit memo header and application rows should reconcile", { tag: ["@FIN-CM-TC-006", "@critical", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"120\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"60\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await Then("credit memo financial totals should reconcile in database");
  });

  test("Invoice outstanding should reduce by applied credit amount", { tag: ["@FIN-CM-TC-007", "@critical", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"120\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"60\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await Then("the target invoice outstanding should decrease by applied credit amount");
  });

  test("Full settlement in one-shot apply using matching credit memo amount", { tag: ["@FIN-CM-TC-003", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I prepare a full-settlement target invoice for customer \"Ramesh ningappa diggai\" and create matching credit memo", null, { page });
    await When("I apply current credit memo fully to the prepared target invoice", null, { page });
    await Then("the prepared target invoice should be fully settled");
    await And("the current credit memo should be fully applied");
  });

  test("Partial apply then second credit memo settles remaining invoice balance", { tag: ["@FIN-CM-TC-004", "@critical", "@p0", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I prepare a full-settlement target invoice for customer \"Ramesh ningappa diggai\" and create matching credit memo", null, { page });
    await When("I apply partial amount \"10\" to the prepared target invoice", null, { page });
    await And("I create another credit memo for remaining target invoice balance and apply it fully", null, { page });
    await Then("the prepared target invoice should be fully settled");
  });

  test("Full settlement keeps credit memo totals reconciled", { tag: ["@FIN-CM-TC-008", "@critical", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I prepare a full-settlement target invoice for customer \"Ramesh ningappa diggai\" and create matching credit memo", null, { page });
    await When("I apply current credit memo fully to the prepared target invoice", null, { page });
    await Then("credit memo financial totals should reconcile in database");
    await And("the prepared target invoice should be fully settled");
  });

  test("Credit memo linked to one invoice can be applied to another invoice of same customer", { tag: ["@FIN-CM-TC-005", "@critical", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I prepare a cross-invoice setup for customer \"Ramesh ningappa diggai\" and create credit memo linked to oldest invoice", null, { page });
    await When("I apply current credit memo to the prepared cross-invoice target", null, { page });
    await Then("the target invoice outstanding should decrease by applied credit amount");
    await And("credit memo financial totals should reconcile in database");
  });

  test("Transport allowance over-balance apply creates dealer advance", { tag: ["@FIN-CM-TC-011", "@critical", "@p1", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I prepare a transport allowance over-balance setup for customer \"Ramesh ningappa diggai\"", null, { page });
    await Then("dealer advance should be created for current credit memo application");
  });

  test("Transport allowance over-balance path fully applies credit and creates dealer advance", { tag: ["@FIN-CM-TC-012", "@critical", "@p1", "@iacs-md"] }, async ({ Given, page, Then, And }) => {
    await Given("I prepare a transport allowance over-balance setup for customer \"Ramesh ningappa diggai\"", null, { page });
    await Then("the current credit memo should be fully applied");
    await And("dealer advance should be created for current credit memo application");
  });

  test("Apply credit rejects amount above available credit", { tag: ["@FIN-CM-TC-013", "@negative", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"80\" and reason \"transport_allowance\"", null, { page });
    await And("I open apply credit dialog for current credit memo", null, { page });
    await And("I select the oldest outstanding invoice in apply dialog for customer \"Ramesh ningappa diggai\"", null, { page });
    await And("I set apply amount exceeding available credit for negative test", null, { page });
    await And("I attempt to apply credit expecting validation failure", null, { page });
    await Then("I should see credit memo apply error containing \"available credit\"", null, { page });
  });

  test("Apply credit blocks zero amount via disabled submit", { tag: ["@FIN-CM-TC-014", "@negative", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"80\" and reason \"transport_allowance\"", null, { page });
    await And("I open apply credit dialog for current credit memo", null, { page });
    await And("I select the oldest outstanding invoice in apply dialog for customer \"Ramesh ningappa diggai\"", null, { page });
    await And("I set apply amount to \"0\"", null, { page });
    await Then("the Apply Credit button should be disabled on apply dialog", null, { page });
  });

  test("Apply dialog does not list invoices from other customers", { tag: ["@FIN-CM-TC-015", "@negative", "@p1", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await And("I resolve a foreign invoice number not belonging to customer \"Ramesh ningappa diggai\"", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"50\" and reason \"transport_allowance\"", null, { page });
    await And("I open apply credit dialog for current credit memo", null, { page });
    await And("I open invoice selector in apply dialog", null, { page });
    await Then("invoice options in apply dialog should not include foreign invoice number", null, { page });
  });

  test("Duplicate apply to same invoice is rejected", { tag: ["@FIN-CM-TC-016", "@negative", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"200\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"50\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I open apply credit dialog for current credit memo", null, { page });
    await And("I select the prior target invoice in apply dialog", null, { page });
    await And("I set apply amount to \"25\"", null, { page });
    await And("I attempt to apply credit expecting validation failure", null, { page });
    await Then("I should see credit memo apply error containing \"already applied\"", null, { page });
  });

  test("Non-transport credit memo apply rejects amount above invoice balance", { tag: ["@FIN-CM-TC-017", "@negative", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I prepare a pricing error credit memo for customer \"Ramesh ningappa diggai\" with credit exceeding smallest outstanding invoice balance", null, { page });
    await And("I attempt to apply prepared pricing error credit memo to smallest invoice at full credit amount", null, { page });
    await Then("I should see credit memo apply error containing \"exceed invoice balance\"", null, { page });
  });

  test("Post new credit memo to general ledger", { tag: ["@FIN-CM-TC-018", "@critical", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"75\" and reason \"transport_allowance\"", null, { page });
    await And("I post current credit memo to general ledger", null, { page });
    await Then("I should see credit memo post to GL success toast", null, { page });
    await And("credit memo should have GL journal in database");
    await And("Post to GL button should not be visible on credit memo detail", null, { page });
  });

  test("Reverse credit memo application restores CM balances and reverses application row", { tag: ["@FIN-CM-TC-019", "@critical", "@p1", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"185\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"52\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I reverse the application for current target invoice with reason \"AUTO_QA_cycle5_reversal_test\"", null, { page });
    await Then("I should see credit memo reversal success toast", null, { page });
    await And("credit memo applications for target invoice should be reversed in database");
    await And("current credit memo should have no active applications in database");
    await And("credit memo available credit should equal total amount after reversal");
  });

  test("Reverse dialog requires reason before confirm and cancel leaves application active", { tag: ["@FIN-CM-TC-020", "@negative", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"110\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"33\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I open reverse dialog for current target invoice without confirming", null, { page });
    await Then("Confirm Reversal button should be disabled on reverse dialog", null, { page });
    await When("I fill reverse application reason in dialog with \"AUTO_QA_cycle6_reason_enables_confirm\"", null, { page });
    await Then("Confirm Reversal button should be enabled on reverse dialog", null, { page });
    await When("I cancel reverse application dialog", null, { page });
    await Then("reverse application dialog should be closed", null, { page });
    await And("credit memo applications for target invoice should remain active in database");
  });

  test("After reversal application history shows Reversed without Reverse action", { tag: ["@FIN-CM-TC-021", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"165\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"44\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I reverse the application for current target invoice with reason \"AUTO_QA_cycle6_reversal_ui_state\"", null, { page });
    await Then("I should see credit memo reversal success toast", null, { page });
    await And("application history row for target invoice should show reversed status", null, { page });
    await And("application history row for target invoice should not show Reverse action", null, { page });
  });

  test("User without credit memos access is redirected from credit memos URL", { tag: ["@FIN-CM-TC-022", "@negative", "@p2", "@iacs-ed"] }, async ({ When, page, Then }) => {
    await When("I attempt to open credit memos as unauthorized user", null, { page });
    await Then("I should be denied access to credit memos", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/credit-memos/credit-memos.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Create credit memo with valid inputs": {"pickleLocation":"11:3","tags":["@FIN-CM-TC-001","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CM-TC-001"]},
  "Partially apply credit memo to oldest outstanding invoice": {"pickleLocation":"17:3","tags":["@FIN-CM-TC-002","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CM-TC-002"]},
  "Credit memo header and application rows should reconcile": {"pickleLocation":"24:3","tags":["@FIN-CM-TC-006","@critical","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@critical","@FIN-CM-TC-006"]},
  "Invoice outstanding should reduce by applied credit amount": {"pickleLocation":"31:3","tags":["@FIN-CM-TC-007","@critical","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@critical","@FIN-CM-TC-007"]},
  "Full settlement in one-shot apply using matching credit memo amount": {"pickleLocation":"38:3","tags":["@FIN-CM-TC-003","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CM-TC-003"]},
  "Partial apply then second credit memo settles remaining invoice balance": {"pickleLocation":"45:3","tags":["@FIN-CM-TC-004","@critical","@p0","@iacs-md"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CM-TC-004"]},
  "Full settlement keeps credit memo totals reconciled": {"pickleLocation":"52:3","tags":["@FIN-CM-TC-008","@critical","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@critical","@FIN-CM-TC-008"]},
  "Credit memo linked to one invoice can be applied to another invoice of same customer": {"pickleLocation":"59:3","tags":["@FIN-CM-TC-005","@critical","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@critical","@FIN-CM-TC-005"]},
  "Transport allowance over-balance apply creates dealer advance": {"pickleLocation":"66:3","tags":["@FIN-CM-TC-011","@critical","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@critical","@FIN-CM-TC-011"]},
  "Transport allowance over-balance path fully applies credit and creates dealer advance": {"pickleLocation":"71:3","tags":["@FIN-CM-TC-012","@critical","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@critical","@FIN-CM-TC-012"]},
  "Apply credit rejects amount above available credit": {"pickleLocation":"77:3","tags":["@FIN-CM-TC-013","@negative","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@negative","@FIN-CM-TC-013"]},
  "Apply credit blocks zero amount via disabled submit": {"pickleLocation":"87:3","tags":["@FIN-CM-TC-014","@negative","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@negative","@FIN-CM-TC-014"]},
  "Apply dialog does not list invoices from other customers": {"pickleLocation":"96:3","tags":["@FIN-CM-TC-015","@negative","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@negative","@FIN-CM-TC-015"]},
  "Duplicate apply to same invoice is rejected": {"pickleLocation":"105:3","tags":["@FIN-CM-TC-016","@negative","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@negative","@FIN-CM-TC-016"]},
  "Non-transport credit memo apply rejects amount above invoice balance": {"pickleLocation":"116:3","tags":["@FIN-CM-TC-017","@negative","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@negative","@FIN-CM-TC-017"]},
  "Post new credit memo to general ledger": {"pickleLocation":"123:3","tags":["@FIN-CM-TC-018","@critical","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@critical","@FIN-CM-TC-018"]},
  "Reverse credit memo application restores CM balances and reverses application row": {"pickleLocation":"132:3","tags":["@FIN-CM-TC-019","@critical","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@critical","@FIN-CM-TC-019"]},
  "Reverse dialog requires reason before confirm and cancel leaves application active": {"pickleLocation":"143:3","tags":["@FIN-CM-TC-020","@negative","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@negative","@FIN-CM-TC-020"]},
  "After reversal application history shows Reversed without Reverse action": {"pickleLocation":"156:3","tags":["@FIN-CM-TC-021","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@FIN-CM-TC-021"]},
  "User without credit memos access is redirected from credit memos URL": {"pickleLocation":"166:3","tags":["@FIN-CM-TC-022","@negative","@p2","@iacs-ed"],"ownTags":["@iacs-ed","@p2","@negative","@FIN-CM-TC-022"]},
};