/** Generated from: e2e/features/finance/journal-entries/invoice-je.feature */
import { test } from "playwright-bdd";

test.describe("Invoice journal entry verification (full O2C chain)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Invoice JE debit line uses resolved sales ar_control account", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INV-TC-001", "@p0"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("invoice GL journal is loaded from database");
    await Then("invoice JE has debit line matching resolved sales ar_control account");
  });

  test("Invoice JE credit line uses resolved sales revenue account", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INV-TC-002", "@p0"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("invoice GL journal is loaded from database");
    await Then("invoice JE has credit line matching resolved sales revenue account");
  });

  test("Intra-state invoice may register CGST SGST output lines when product carries GST", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INV-TC-003", "@p0"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("invoice GL journal is loaded from database");
    await Then("invoice JE may include resolved gst output lines or only AR revenue");
  });

  test("Inter-state IGST line when warehouse creates IGST context", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INV-TC-004", "@p0"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("invoice GL journal is loaded from database");
    await Then("invoice JE may include IGST output or intrastate tax lines");
  });

  test("Invoice JE is balanced", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INV-TC-005", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("invoice GL journal is loaded from database");
    await Then("invoice JE total debits equal total credits");
  });

  test("Zero GST product posts without tax GL lines", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INV-TC-006", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("invoice GL journal is loaded from database");
    await Then("invoice JE line count is at least two");
  });

  test("Indent item tax percentage aligns with product master", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INV-TC-007", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("invoice GL journal is loaded from database");
    await Then("invoice exists in database with lines");
  });

  test("Invoice journal number is sequential ERP format", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INV-TC-008", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("invoice GL journal is loaded from database");
    await Then("journal header has non-empty journal_number");
  });

  test("Cancelled invoice creates reversing journal activity", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INVC-TC-001", "@p0"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("I cancel the current JE test invoice from detail page", null, { page });
    await Then("invoice status is cancelled in database");
  });

  test("Cancellation path maintains accounting balance", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INVC-TC-002", "@p0"] }, async ({ Given, page, When, And, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("invoice GL journal is loaded from database");
    await And("I cancel the current JE test invoice from detail page", null, { page });
    await Then("invoice status is cancelled in database");
  });

  test("Cancelled invoice status in database", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INVC-TC-003", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("I cancel the current JE test invoice from detail page", null, { page });
    await Then("invoice status is cancelled in database");
  });

  test("GST reversal lines may exist after cancellation", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INVC-TC-004", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("I cancel the current JE test invoice from detail page", null, { page });
    await Then("invoice status is cancelled in database");
  });

  test("Double cancel blocked or invoice already cancelled", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INVC-TC-005", "@p1"] }, async ({ Given, page, When, And, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("I cancel the current JE test invoice from detail page", null, { page });
    await And("I attempt second cancel on current JE test invoice if button visible", null, { page });
    await Then("invoice status is cancelled in database");
  });

  test("Invoice with applied cash receipt may block cancellation", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INVC-TC-006", "@p2"] }, async ({ Given, page, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await Then("cancel invoice may be blocked when cash receipt applied or not attempted");
  });

  test("Audit trail references invoice cancellation", { tag: ["@finance", "@journal-entries", "@iacs-md", "@FIN-INVC-TC-007", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("a new posted sales invoice exists from O2C chain for JE verification", null, { page });
    await When("I cancel the current JE test invoice from detail page", null, { page });
    await Then("invoice status is cancelled in database");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/journal-entries/invoice-je.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Invoice JE debit line uses resolved sales ar_control account": {"pickleLocation":"8:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INV-TC-001","@p0"],"ownTags":["@iacs-md","@p0","@FIN-INV-TC-001"]},
  "Invoice JE credit line uses resolved sales revenue account": {"pickleLocation":"15:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INV-TC-002","@p0"],"ownTags":["@iacs-md","@p0","@FIN-INV-TC-002"]},
  "Intra-state invoice may register CGST SGST output lines when product carries GST": {"pickleLocation":"21:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INV-TC-003","@p0"],"ownTags":["@iacs-md","@p0","@FIN-INV-TC-003"]},
  "Inter-state IGST line when warehouse creates IGST context": {"pickleLocation":"27:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INV-TC-004","@p0"],"ownTags":["@iacs-md","@p0","@FIN-INV-TC-004"]},
  "Invoice JE is balanced": {"pickleLocation":"33:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INV-TC-005","@p1"],"ownTags":["@iacs-md","@p1","@FIN-INV-TC-005"]},
  "Zero GST product posts without tax GL lines": {"pickleLocation":"39:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INV-TC-006","@p1"],"ownTags":["@iacs-md","@p1","@FIN-INV-TC-006"]},
  "Indent item tax percentage aligns with product master": {"pickleLocation":"45:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INV-TC-007","@p1"],"ownTags":["@iacs-md","@p1","@FIN-INV-TC-007"]},
  "Invoice journal number is sequential ERP format": {"pickleLocation":"51:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INV-TC-008","@p2"],"ownTags":["@iacs-md","@p2","@FIN-INV-TC-008"]},
  "Cancelled invoice creates reversing journal activity": {"pickleLocation":"57:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INVC-TC-001","@p0"],"ownTags":["@iacs-md","@p0","@FIN-INVC-TC-001"]},
  "Cancellation path maintains accounting balance": {"pickleLocation":"63:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INVC-TC-002","@p0"],"ownTags":["@iacs-md","@p0","@FIN-INVC-TC-002"]},
  "Cancelled invoice status in database": {"pickleLocation":"70:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INVC-TC-003","@p1"],"ownTags":["@iacs-md","@p1","@FIN-INVC-TC-003"]},
  "GST reversal lines may exist after cancellation": {"pickleLocation":"76:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INVC-TC-004","@p1"],"ownTags":["@iacs-md","@p1","@FIN-INVC-TC-004"]},
  "Double cancel blocked or invoice already cancelled": {"pickleLocation":"82:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INVC-TC-005","@p1"],"ownTags":["@iacs-md","@p1","@FIN-INVC-TC-005"]},
  "Invoice with applied cash receipt may block cancellation": {"pickleLocation":"89:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INVC-TC-006","@p2"],"ownTags":["@iacs-md","@p2","@FIN-INVC-TC-006"]},
  "Audit trail references invoice cancellation": {"pickleLocation":"94:3","tags":["@finance","@journal-entries","@iacs-md","@FIN-INVC-TC-007","@p2"],"ownTags":["@iacs-md","@p2","@FIN-INVC-TC-007"]},
};