/** Generated from: e2e/features/finance/journal-entries/sales-return-je.feature */
import { test } from "playwright-bdd";

test.describe("Sales return journal entry patterns", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Sales return credit memo path reaches finance with GL linkage when posted", { tag: ["@finance", "@journal-entries", "@sales-return-je", "@iacs-md", "@FIN-SR-TC-001", "@critical", "@p0"] }, async ({ Given, And, page, When, Then }) => {
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
    await Then("credit memo outcome should be visible on return or finance page", null, { page });
    await Then("sales return credit memo journal when posted has revenue debits or tax lines", null, { page });
  });

  test("Sales return CM may include tax related lines when GL posted", { tag: ["@finance", "@journal-entries", "@sales-return-je", "@iacs-md", "@FIN-SR-TC-002", "@critical", "@p0"] }, async ({ Given, And, page, When, Then }) => {
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
    await Then("sales return credit memo journal when posted has revenue debits or tax lines", null, { page });
  });

  test("Posted sales return credit memo JE is balanced when GL exists", { tag: ["@finance", "@journal-entries", "@sales-return-je", "@iacs-md", "@FIN-SR-TC-003", "@regression", "@p1"] }, async ({ Given, And, page, When, Then }) => {
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
    await Then("credit memo GL journal is balanced", null, { page });
  });

  test("Sales return credit memo uses posting profile credit_note not legacy codes", { tag: ["@finance", "@journal-entries", "@sales-return-je", "@iacs-md", "@FIN-SR-TC-004", "@regression", "@p1"] }, async ({ Given, And, page, When, Then }) => {
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
    await Then("posted credit memo debit line is not legacy account codes \"11116|4210\"", null, { page });
  });

  test("Goods receipt increases inventory for sales return line", { tag: ["@finance", "@journal-entries", "@sales-return-je", "@iacs-md", "@FIN-SR-TC-005", "@regression", "@p1"] }, async ({ Given, And, page, When, Then }) => {
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
    await When("sales return first line inventory available sum is stored from database before goods receipt", null, { page });
    await And("I complete record goods receipt on sales return detail with QC passed and default warehouse", null, { page });
    await Then("I should be on sales return detail with Goods Received status", null, { page });
    await And("database inventory available sum should increase by first line return quantity after goods receipt");
  });

  test("Partial quantity sales return proportional JE", { tag: ["@finance", "@journal-entries", "@sales-return-je", "@iacs-md", "@FIN-SR-TC-006", "@regression", "@p2"] }, async ({ Then }) => {
    await Then("partial sales return GL amounts are proportional or scenario skipped");
  });

  test("Second return for same invoice may be blocked", { tag: ["@finance", "@journal-entries", "@sales-return-je", "@iacs-md", "@FIN-SR-TC-007", "@regression", "@p2"] }, async ({ Then }) => {
    await Then("creating sales return for fully returned invoice may be blocked");
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/journal-entries/sales-return-je.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Sales return credit memo path reaches finance with GL linkage when posted": {"pickleLocation":"10:3","tags":["@finance","@journal-entries","@sales-return-je","@iacs-md","@FIN-SR-TC-001","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-SR-TC-001"]},
  "Sales return CM may include tax related lines when GL posted": {"pickleLocation":"29:3","tags":["@finance","@journal-entries","@sales-return-je","@iacs-md","@FIN-SR-TC-002","@critical","@p0"],"ownTags":["@iacs-md","@p0","@critical","@FIN-SR-TC-002"]},
  "Posted sales return credit memo JE is balanced when GL exists": {"pickleLocation":"47:3","tags":["@finance","@journal-entries","@sales-return-je","@iacs-md","@FIN-SR-TC-003","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-SR-TC-003"]},
  "Sales return credit memo uses posting profile credit_note not legacy codes": {"pickleLocation":"66:3","tags":["@finance","@journal-entries","@sales-return-je","@iacs-md","@FIN-SR-TC-004","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-SR-TC-004"]},
  "Goods receipt increases inventory for sales return line": {"pickleLocation":"84:3","tags":["@finance","@journal-entries","@sales-return-je","@iacs-md","@FIN-SR-TC-005","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-SR-TC-005"]},
  "Partial quantity sales return proportional JE": {"pickleLocation":"102:3","tags":["@finance","@journal-entries","@sales-return-je","@iacs-md","@FIN-SR-TC-006","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-SR-TC-006"]},
  "Second return for same invoice may be blocked": {"pickleLocation":"106:3","tags":["@finance","@journal-entries","@sales-return-je","@iacs-md","@FIN-SR-TC-007","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-SR-TC-007"]},
};