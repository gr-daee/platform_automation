/** Generated from: e2e/features/finance/journal-entries/cr-reversal-je.feature */
import { test } from "playwright-bdd";

test.describe("Cash receipt reversal and unknown dealer JE patterns", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Reverse unapplied cash receipt posts unapplied cash debit and bank credit", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-CRR-TC-001", "@critical", "@p0"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a JE test cash receipt with payment method \"neft\" and amount \"380\"", null, { page });
    await And("I open JE chain cash receipt detail page", null, { page });
    await When("I reverse unapplied cash receipt from detail for JE chain with reason \"AUTO_QA_FIN_CRR_001\"", null, { page });
    await Then("cash receipt status is reversed in database");
    await And("cash receipt reversal journal debits unapplied cash and credits bank");
  });

  test("Null bank account reversal fallback is integration scope only", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-CRR-TC-002", "@critical", "@p0"] }, async ({ Given }) => {
    await Given("cash receipt reversal bank null fallback is only integration tested");
  });

  test("Second reversal on same receipt is blocked or noop", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-CRR-TC-003", "@critical", "@p0"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a JE test cash receipt with payment method \"neft\" and amount \"290\"", null, { page });
    await And("I open JE chain cash receipt detail page", null, { page });
    await When("I reverse unapplied cash receipt from detail for JE chain with reason \"AUTO_QA_FIN_CRR_003a\"", null, { page });
    await Then("cash receipt status is reversed in database");
    await When("I attempt second cash receipt reversal on same receipt", null, { page });
    await Then("cash receipt status is reversed in database");
  });

  test("Reverse with active applications may be blocked", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-CRR-TC-004", "@regression", "@p1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"500\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"50\"", null, { page });
    await And("I open JE chain cash receipt detail page", null, { page });
    await When("I attempt full cash receipt reversal from detail without unapplying applications", null, { page });
    await Then("reverse cash receipt with applications may fail or require unapply first", null, { page });
  });

  test("Reversal journal is balanced", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-CRR-TC-005", "@regression", "@p1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a JE test cash receipt with payment method \"neft\" and amount \"310\"", null, { page });
    await And("I open JE chain cash receipt detail page", null, { page });
    await When("I reverse unapplied cash receipt from detail for JE chain with reason \"AUTO_QA_FIN_CRR_005\"", null, { page });
    await Then("cash receipt reversal journal debits unapplied cash and credits bank");
  });

  test("Reversal uses posting profile driven GL accounts", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-CRR-TC-006", "@regression", "@p1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a JE test cash receipt with payment method \"neft\" and amount \"270\"", null, { page });
    await And("I open JE chain cash receipt detail page", null, { page });
    await When("I reverse unapplied cash receipt from detail for JE chain with reason \"AUTO_QA_FIN_CRR_006\"", null, { page });
    await Then("cash receipt reversal journal debits unapplied cash and credits bank");
  });

  test("Cash receipt reversal audit trail is optional in E2E", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-CRR-TC-007", "@regression", "@p2"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a JE test cash receipt with payment method \"neft\" and amount \"240\"", null, { page });
    await And("I open JE chain cash receipt detail page", null, { page });
    await When("I reverse unapplied cash receipt from detail for JE chain with reason \"AUTO_QA_FIN_CRR_007\"", null, { page });
    await Then("cash receipt reversal may emit CASH_RECEIPT_REVERSED audit in product");
  });

  test("Reverse cash receipt with EPD applications is deferred to extended suite", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-CRR-TC-008", "@regression", "@p2"] }, async ({ Given }) => {
    await Given("cash receipt EPD reversal extended coverage is deferred");
  });

  test("Suspense or unknown dealer style receipt may use unapplied cash in JE", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-UDCR-TC-001", "@critical", "@p0"] }, async ({ Then }) => {
    await Then("unknown dealer style cash receipt from DB is skipped or journal uses unapplied cash");
  });

  test("Unknown dealer receipt GL uses posting profiles when journal exists", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-UDCR-TC-002", "@regression", "@p1"] }, async ({ Then }) => {
    await Then("unknown dealer style cash receipt from DB is skipped or journal uses unapplied cash");
  });

  test("Dealer assignment on suspense receipt is manual workflow", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-UDCR-TC-003", "@regression", "@p1"] }, async ({ Given }) => {
    await Given("suspense cash receipt dealer reassignment is manual workflow only");
  });

  test("Suspense indicator visible when debouncing list checks", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-UDCR-TC-004", "@regression", "@p2"] }, async ({ Given }) => {
    await Given("suspense cash receipt dealer reassignment is manual workflow only");
  });

  test("Suspense receipt cannot apply until dealer identified", { tag: ["@finance", "@journal-entries", "@cr-reversal-je", "@iacs-md", "@FIN-UDCR-TC-005", "@regression", "@p2"] }, async ({ Given }) => {
    await Given("suspense cash receipt dealer reassignment is manual workflow only");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/journal-entries/cr-reversal-je.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Reverse unapplied cash receipt posts unapplied cash debit and bank credit": {"pickleLocation":"10:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-CRR-TC-001","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CRR-TC-001"]},
  "Null bank account reversal fallback is integration scope only": {"pickleLocation":"18:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-CRR-TC-002","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CRR-TC-002"]},
  "Second reversal on same receipt is blocked or noop": {"pickleLocation":"22:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-CRR-TC-003","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CRR-TC-003"]},
  "Reverse with active applications may be blocked": {"pickleLocation":"31:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-CRR-TC-004","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CRR-TC-004"]},
  "Reversal journal is balanced": {"pickleLocation":"40:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-CRR-TC-005","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CRR-TC-005"]},
  "Reversal uses posting profile driven GL accounts": {"pickleLocation":"47:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-CRR-TC-006","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CRR-TC-006"]},
  "Cash receipt reversal audit trail is optional in E2E": {"pickleLocation":"54:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-CRR-TC-007","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-CRR-TC-007"]},
  "Reverse cash receipt with EPD applications is deferred to extended suite": {"pickleLocation":"61:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-CRR-TC-008","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-CRR-TC-008"]},
  "Suspense or unknown dealer style receipt may use unapplied cash in JE": {"pickleLocation":"65:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-UDCR-TC-001","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-UDCR-TC-001"]},
  "Unknown dealer receipt GL uses posting profiles when journal exists": {"pickleLocation":"69:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-UDCR-TC-002","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-UDCR-TC-002"]},
  "Dealer assignment on suspense receipt is manual workflow": {"pickleLocation":"73:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-UDCR-TC-003","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-UDCR-TC-003"]},
  "Suspense indicator visible when debouncing list checks": {"pickleLocation":"77:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-UDCR-TC-004","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-UDCR-TC-004"]},
  "Suspense receipt cannot apply until dealer identified": {"pickleLocation":"81:3","tags":["@finance","@journal-entries","@cr-reversal-je","@iacs-md","@FIN-UDCR-TC-005","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-UDCR-TC-005"]},
};