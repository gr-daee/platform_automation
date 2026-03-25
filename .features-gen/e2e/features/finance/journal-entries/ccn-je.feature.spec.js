/** Generated from: e2e/features/finance/journal-entries/ccn-je.feature */
import { test } from "playwright-bdd";

test.describe("Credit contra note journal entries and applications", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Finance UI credit memo posts with dealer credit_note debit and AR credit", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCN-TC-001", "@critical", "@p0"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"88\" and reason \"transport_allowance\"", null, { page });
    await And("I post current credit memo to general ledger", null, { page });
    await Then("I should see credit memo post to GL success toast", null, { page });
    await Then("credit memo posted to GL has debit on dealer credit_note and credit on AR");
  });

  test("Sales return credit memo uses non-legacy posting profile GL", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCN-TC-002", "@critical", "@p0"] }, async ({ Given, And, page, When, Then }) => {
    await Given("sales return eligible invoice is resolved from database");
    await And("I am on the create sales return order page", null, { page });
    await When("I select context invoice in sales return create dialog", null, { page });
    await Then("sales return create page should show context dealer on dealer trigger", null, { page });
    await When("I choose return reason Customer Request on sales return create page", null, { page });
    await And("I enter sales return notes with AUTO_QA prefix", null, { page });
    await And("I load invoice items on sales return create page", null, { page });
    await And("I set return quantity 1 on first line on sales return create page", null, { page });
    await And("I go to review step on sales return create page", null, { page });
    await And("I submit sales return create order", null, { page });
    await Then("I should be on sales return detail with Pending Receipt status", null, { page });
    await When("I complete record goods receipt on sales return detail with default warehouse", null, { page });
    await Then("I should be on sales return detail with Goods Received status", null, { page });
    await When("I complete credit memo flow from sales return detail when applicable", null, { page });
    await Then("credit memo for sales return path uses dealer_management credit_note GL when posted", null, { page });
    await Then("posted credit memo debit line is not legacy account codes \"11116|4210\"", null, { page });
  });

  test("Credit memo GL journal is balanced", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCN-TC-003", "@regression", "@p1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"65\" and reason \"transport_allowance\"", null, { page });
    await And("I post current credit memo to general ledger", null, { page });
    await Then("credit memo GL journal is balanced", null, { page });
  });

  test("Transport allowance CM may auto-apply toward source invoice", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCN-TC-004", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"40\" and reason \"transport_allowance\"", null, { page });
    await Then("credit memo may be auto-applied with applied status in database");
  });

  test("Pricing error CM cannot apply above smallest invoice balance", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCN-TC-005", "@regression", "@p1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I prepare a pricing error credit memo for customer \"Ramesh ningappa diggai\" with credit exceeding smallest outstanding invoice balance", null, { page });
    await And("I attempt to apply prepared pricing error credit memo to smallest invoice at full credit amount", null, { page });
    await Then("I should see credit memo apply error containing \"exceed\"", null, { page });
  });

  test("CCN against cancelled invoice is environment dependent", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCN-TC-006", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"25\" and reason \"transport_allowance\"", null, { page });
    await Then("credit memo should be created successfully");
  });

  test("Credit memo reason description is persisted", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCN-TC-007", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"33\" and reason \"transport_allowance\"", null, { page });
    await Then("credit memo reason description is stored in database");
  });

  test("Apply CM reduces invoice outstanding in database", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNA-TC-001", "@critical", "@p0"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"95\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"40\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await Then("the target invoice outstanding should decrease by applied credit amount");
  });

  test("Apply CM to another invoice of same customer", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNA-TC-002", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I prepare a cross-invoice setup for customer \"Ramesh ningappa diggai\" and create credit memo linked to oldest invoice", null, { page });
    await When("I apply current credit memo to the prepared cross-invoice target", null, { page });
    await Then("the target invoice outstanding should decrease by applied credit amount");
  });

  test("Apply dialog does not list foreign customer invoices", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNA-TC-003", "@regression", "@p1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await And("I resolve a foreign invoice number not belonging to customer \"Ramesh ningappa diggai\"", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"44\" and reason \"transport_allowance\"", null, { page });
    await And("I open apply credit dialog for current credit memo", null, { page });
    await And("I open invoice selector in apply dialog", null, { page });
    await Then("invoice options in apply dialog should not include foreign invoice number", null, { page });
  });

  test("Duplicate apply same CM to same invoice is rejected", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNA-TC-004", "@regression", "@p1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"120\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"30\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I open apply credit dialog for current credit memo", null, { page });
    await And("I select the prior target invoice in apply dialog", null, { page });
    await And("I set apply amount to \"10\"", null, { page });
    await And("I attempt to apply credit expecting validation failure", null, { page });
    await Then("I should see credit memo apply error containing \"already applied\"", null, { page });
  });

  test("Partial CM apply keeps reconciliation", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNA-TC-005", "@regression", "@p2"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"100\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"35\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await Then("credit memo financial totals should reconcile in database");
  });

  test("Transport allowance over-balance may create dealer advance", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNA-TC-006", "@regression", "@p2"] }, async ({ Given, page, Then }) => {
    await Given("I prepare a transport allowance over-balance setup for customer \"Ramesh ningappa diggai\"", null, { page });
    await Then("dealer advance should be created for current credit memo application");
  });

  test("Reverse CM application posts reversal JE balanced", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNR-TC-001", "@critical", "@p0"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"185\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"52\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I reverse the application for current target invoice with reason \"AUTO_QA_FIN_CCNR_001\"", null, { page });
    await Then("I should see credit memo reversal success toast", null, { page });
    await Then("credit memo application reversal journal swaps debits and credits versus original apply");
  });

  test("Reverse CM application restores outstanding", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNR-TC-002", "@critical", "@p0"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"175\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"48\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I reverse the application for current target invoice with reason \"AUTO_QA_FIN_CCNR_002\"", null, { page });
    await Then("I should see credit memo reversal success toast", null, { page });
    await Then("credit memo available credit should equal total amount after reversal");
  });

  test("Reverse dialog requires reason before confirm", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNR-TC-003", "@regression", "@p1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"160\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"40\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I open reverse dialog for current target invoice without confirming", null, { page });
    await Then("Confirm Reversal button should be disabled on reverse dialog", null, { page });
  });

  test("After reversal history shows Reversed", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNR-TC-004", "@regression", "@p1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"190\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"55\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I reverse the application for current target invoice with reason \"AUTO_QA_FIN_CCNR_004\"", null, { page });
    await Then("I should see credit memo reversal success toast", null, { page });
    await And("application history row for target invoice should show reversed status", null, { page });
  });

  test("Reversal restores CM available credit", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNR-TC-005", "@regression", "@p1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"200\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"60\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I reverse the application for current target invoice with reason \"AUTO_QA_FIN_CCNR_005\"", null, { page });
    await Then("credit memo available credit should equal total amount after reversal");
  });

  test("Double reversal blocked after first reversal", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNR-TC-006", "@regression", "@p2"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"155\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"40\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I reverse the application for current target invoice with reason \"AUTO_QA_FIN_CCNR_006a\"", null, { page });
    await Then("application history row for target invoice should not show Reverse action", null, { page });
  });

  test("Audit may record credit memo reversal event", { tag: ["@finance", "@journal-entries", "@ccn-je", "@iacs-md", "@FIN-CCNR-TC-007", "@regression", "@p2"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the credit memos page", null, { page });
    await When("I create a credit memo for customer \"Ramesh ningappa diggai\" with amount \"140\" and reason \"transport_allowance\"", null, { page });
    await And("I apply \"35\" from current credit memo to the oldest outstanding invoice of the same customer", null, { page });
    await And("I reverse the application for current target invoice with reason \"AUTO_QA_FIN_CCNR_007\"", null, { page });
    await Then("audit may contain CREDIT_MEMO_REVERSED for reversed applications");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/journal-entries/ccn-je.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Finance UI credit memo posts with dealer credit_note debit and AR credit": {"pickleLocation":"13:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCN-TC-001","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CCN-TC-001"]},
  "Sales return credit memo uses non-legacy posting profile GL": {"pickleLocation":"21:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCN-TC-002","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CCN-TC-002"]},
  "Credit memo GL journal is balanced": {"pickleLocation":"40:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCN-TC-003","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CCN-TC-003"]},
  "Transport allowance CM may auto-apply toward source invoice": {"pickleLocation":"47:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCN-TC-004","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CCN-TC-004"]},
  "Pricing error CM cannot apply above smallest invoice balance": {"pickleLocation":"53:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCN-TC-005","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CCN-TC-005"]},
  "CCN against cancelled invoice is environment dependent": {"pickleLocation":"60:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCN-TC-006","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-CCN-TC-006"]},
  "Credit memo reason description is persisted": {"pickleLocation":"66:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCN-TC-007","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-CCN-TC-007"]},
  "Apply CM reduces invoice outstanding in database": {"pickleLocation":"72:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNA-TC-001","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CCNA-TC-001"]},
  "Apply CM to another invoice of same customer": {"pickleLocation":"79:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNA-TC-002","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CCNA-TC-002"]},
  "Apply dialog does not list foreign customer invoices": {"pickleLocation":"85:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNA-TC-003","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CCNA-TC-003"]},
  "Duplicate apply same CM to same invoice is rejected": {"pickleLocation":"94:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNA-TC-004","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CCNA-TC-004"]},
  "Partial CM apply keeps reconciliation": {"pickleLocation":"105:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNA-TC-005","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-CCNA-TC-005"]},
  "Transport allowance over-balance may create dealer advance": {"pickleLocation":"112:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNA-TC-006","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-CCNA-TC-006"]},
  "Reverse CM application posts reversal JE balanced": {"pickleLocation":"119:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNR-TC-001","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CCNR-TC-001"]},
  "Reverse CM application restores outstanding": {"pickleLocation":"128:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNR-TC-002","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CCNR-TC-002"]},
  "Reverse dialog requires reason before confirm": {"pickleLocation":"137:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNR-TC-003","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CCNR-TC-003"]},
  "After reversal history shows Reversed": {"pickleLocation":"145:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNR-TC-004","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CCNR-TC-004"]},
  "Reversal restores CM available credit": {"pickleLocation":"154:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNR-TC-005","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CCNR-TC-005"]},
  "Double reversal blocked after first reversal": {"pickleLocation":"162:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNR-TC-006","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-CCNR-TC-006"]},
  "Audit may record credit memo reversal event": {"pickleLocation":"170:3","tags":["@finance","@journal-entries","@ccn-je","@iacs-md","@FIN-CCNR-TC-007","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-CCNR-TC-007"]},
};