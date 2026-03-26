/** Generated from: e2e/features/finance/journal-entries/cr-application-je.feature */
import { test } from "playwright-bdd";

test.describe("Cash receipt application journal entries", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Apply cash receipt posts AR credit and unapplied cash debit", { tag: ["@finance", "@journal-entries", "@cr-application-je", "@iacs-md", "@FIN-ACR-TC-001", "@critical", "@p0"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"500\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"100\"", null, { page });
    await Then("latest cash receipt journal for current receipt shows AR credit and unapplied cash debit on apply");
  });

  test("Apply with EPD may include early payment discount debit", { tag: ["@finance", "@journal-entries", "@cr-application-je", "@iacs-md", "@FIN-ACR-TC-002", "@critical", "@p0"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"450.78\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I toggle EPD on for invoice \"first\"", null, { page });
    await And("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"98.45\"", null, { page });
    await Then("latest cash receipt journal for apply may include early payment discount debit line");
  });

  test("Full apply drives invoice toward paid status", { tag: ["@finance", "@journal-entries", "@cr-application-je", "@iacs-md", "@FIN-ACR-TC-003", "@regression", "@p1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"15000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await And("I remember an invoice fully payable by current cash receipt");
    await When("I apply full outstanding amount to remembered invoice", null, { page });
    await Then("invoice for first outstanding is paid in database after full apply");
  });

  test("Cash receipt applied amount matches applications in database", { tag: ["@finance", "@journal-entries", "@cr-application-je", "@iacs-md", "@FIN-ACR-TC-004", "@regression", "@p1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"400\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"75\"", null, { page });
    await Then("cash receipt applied amount matches applications total in database");
  });

  test("Apply amount exceeding invoice balance shows error", { tag: ["@finance", "@journal-entries", "@cr-application-je", "@iacs-md", "@FIN-ACR-TC-005", "@regression", "@p1"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"2000\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I attempt apply cash receipt to first invoice with excessive amount", null, { page });
    await Then("I should see cash receipt apply error for excessive amount", null, { page });
  });

  test("Two separate applies may create multiple journal headers", { tag: ["@finance", "@journal-entries", "@cr-application-je", "@iacs-md", "@FIN-ACR-TC-006", "@regression", "@p2"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"900\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"40\"", null, { page });
    await And("I navigate to the apply page for the current cash receipt again", null, { page });
    await And("I apply cash receipt \"<receiptId>\" to invoice \"second\" with amount \"35\"", null, { page });
    await Then("cash receipt applied amount matches applications total in database");
  });

  test("EPD path uses posting profiles in principle", { tag: ["@finance", "@journal-entries", "@cr-application-je", "@iacs-md", "@FIN-ACR-TC-007", "@regression", "@p2"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I have created a cash receipt with amount \"450.78\" for testing", null, { page });
    await And("I am on the apply page for the current cash receipt", null, { page });
    await When("I toggle EPD on for invoice \"first\"", null, { page });
    await And("I apply cash receipt \"<receiptId>\" to invoice \"first\" with amount \"50\"", null, { page });
    await Then("EPD cash application uses resolveGL posting profile accounts");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/journal-entries/cr-application-je.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Apply cash receipt posts AR credit and unapplied cash debit": {"pickleLocation":"10:3","tags":["@finance","@journal-entries","@cr-application-je","@iacs-md","@FIN-ACR-TC-001","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-ACR-TC-001"]},
  "Apply with EPD may include early payment discount debit": {"pickleLocation":"17:3","tags":["@finance","@journal-entries","@cr-application-je","@iacs-md","@FIN-ACR-TC-002","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-ACR-TC-002"]},
  "Full apply drives invoice toward paid status": {"pickleLocation":"25:3","tags":["@finance","@journal-entries","@cr-application-je","@iacs-md","@FIN-ACR-TC-003","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-ACR-TC-003"]},
  "Cash receipt applied amount matches applications in database": {"pickleLocation":"33:3","tags":["@finance","@journal-entries","@cr-application-je","@iacs-md","@FIN-ACR-TC-004","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-ACR-TC-004"]},
  "Apply amount exceeding invoice balance shows error": {"pickleLocation":"40:3","tags":["@finance","@journal-entries","@cr-application-je","@iacs-md","@FIN-ACR-TC-005","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-ACR-TC-005"]},
  "Two separate applies may create multiple journal headers": {"pickleLocation":"47:3","tags":["@finance","@journal-entries","@cr-application-je","@iacs-md","@FIN-ACR-TC-006","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-ACR-TC-006"]},
  "EPD path uses posting profiles in principle": {"pickleLocation":"56:3","tags":["@finance","@journal-entries","@cr-application-je","@iacs-md","@FIN-ACR-TC-007","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-ACR-TC-007"]},
};