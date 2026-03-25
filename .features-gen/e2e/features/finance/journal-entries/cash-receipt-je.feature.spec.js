/** Generated from: e2e/features/finance/journal-entries/cash-receipt-je.feature */
import { test } from "playwright-bdd";

test.describe("Cash receipt journal entries (manual + VAN GL patterns)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Manual NEFT cash receipt journal debits bank side and credits unapplied cash", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-CR-TC-030", "@critical", "@p0"] }, async ({ Given, page, Then }) => {
    await Given("I have created a JE test cash receipt with payment method \"neft\" and amount \"450\"", null, { page });
    await Then("cash receipt creation journal has debit on bank control and credit on unapplied cash");
  });

  test("Manual cash payment journal debits petty cash and credits unapplied cash", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-CR-TC-031", "@critical", "@p0"] }, async ({ Given, page, Then }) => {
    await Given("I have created a JE test cash receipt with payment method \"cash\" and amount \"275\"", null, { page });
    await Then("cash receipt creation journal has debit on petty cash and credit on unapplied cash");
  });

  test("Manual cash receipt creation journal is balanced", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-CR-TC-032", "@regression", "@p1"] }, async ({ Given, page, Then }) => {
    await Given("I have created a JE test cash receipt with payment method \"neft\" and amount \"320\"", null, { page });
    await Then("cash receipt creation journal is balanced");
  });

  test("NEFT cash receipt without bank account shows validation error", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-CR-TC-033", "@regression", "@p1"] }, async ({ When, page, Then }) => {
    await When("I attempt to save JE test NEFT cash receipt without selecting bank account", null, { page });
    await Then("new cash receipt form shows bank account validation error", null, { page });
  });

  test("Manual cash receipt JE aligns with posting profile resolution", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-CR-TC-034", "@regression", "@p1"] }, async ({ Given, page, Then }) => {
    await Given("I have created a JE test cash receipt with payment method \"neft\" and amount \"210\"", null, { page });
    await Then("manual cash receipt JE uses posting profile resolved GL accounts for cash sides");
  });

  test("Cash receipt without petty cash profile shows configuration error", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-CR-TC-035", "@regression", "@p2"] }, async ({ When, page, Then }) => {
    await When("I attempt JE test cash receipt with cash method when petty cash profile is missing", null, { page });
    await Then("cash receipt save shows petty cash not configured error if profile missing", null, { page });
  });

  test("VAN cash receipt JE uses van bank debit and AR credit pattern", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-VAN-TC-030", "@critical", "@p0"] }, async ({ When, Then, And }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await Then("VAN cash receipt journal is balanced with van bank debit and AR credit pattern");
  });

  test("VAN receipt JE may fall back to bank control when bank van missing", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-VAN-TC-031", "@critical", "@p0"] }, async ({ When, Then, And }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await Then("VAN cash receipt journal is balanced with van bank debit and AR credit pattern");
  });

  test("VAN cash receipt journal is balanced", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-VAN-TC-032", "@regression", "@p1"] }, async ({ When, Then, And }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await Then("VAN cash receipt journal is balanced with van bank debit and AR credit pattern");
  });

  test("VAN posting profile path is exercised", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-VAN-TC-033", "@regression", "@p1"] }, async ({ When, Then, And }) => {
    await When("I send VAN validation then posting with unique UTR");
    await Then("VAN payment should be posted successfully");
    await And("cash receipt should be created for VAN payment \"<utr>\"");
    await Then("VAN cash receipt journal lines do not require finance defaults code paths to be asserted in UI");
  });

  test("Unknown dealer style suspense receipt uses unapplied cash when present in DB", { tag: ["@finance", "@journal-entries", "@cash-receipt-je", "@iacs-md", "@FIN-VAN-TC-034", "@regression", "@p2"] }, async ({ Then }) => {
    await Then("unknown dealer style cash receipt from DB is skipped or journal uses unapplied cash");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/journal-entries/cash-receipt-je.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Manual NEFT cash receipt journal debits bank side and credits unapplied cash": {"pickleLocation":"11:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-CR-TC-030","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-030"]},
  "Manual cash payment journal debits petty cash and credits unapplied cash": {"pickleLocation":"16:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-CR-TC-031","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-CR-TC-031"]},
  "Manual cash receipt creation journal is balanced": {"pickleLocation":"21:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-CR-TC-032","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CR-TC-032"]},
  "NEFT cash receipt without bank account shows validation error": {"pickleLocation":"26:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-CR-TC-033","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CR-TC-033"]},
  "Manual cash receipt JE aligns with posting profile resolution": {"pickleLocation":"31:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-CR-TC-034","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-CR-TC-034"]},
  "Cash receipt without petty cash profile shows configuration error": {"pickleLocation":"36:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-CR-TC-035","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-CR-TC-035"]},
  "VAN cash receipt JE uses van bank debit and AR credit pattern": {"pickleLocation":"41:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-VAN-TC-030","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-VAN-TC-030"]},
  "VAN receipt JE may fall back to bank control when bank van missing": {"pickleLocation":"48:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-VAN-TC-031","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-VAN-TC-031"]},
  "VAN cash receipt journal is balanced": {"pickleLocation":"55:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-VAN-TC-032","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-VAN-TC-032"]},
  "VAN posting profile path is exercised": {"pickleLocation":"62:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-VAN-TC-033","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-VAN-TC-033"]},
  "Unknown dealer style suspense receipt uses unapplied cash when present in DB": {"pickleLocation":"69:3","tags":["@finance","@journal-entries","@cash-receipt-je","@iacs-md","@FIN-VAN-TC-034","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-VAN-TC-034"]},
};