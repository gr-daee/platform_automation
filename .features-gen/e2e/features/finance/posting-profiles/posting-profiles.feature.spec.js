/** Generated from: e2e/features/finance/posting-profiles/posting-profiles.feature */
import { test } from "playwright-bdd";

test.describe("Posting Profiles Management", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Dashboard shows all 6 navigation cards", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-001", "@smoke", "@p1"] }, async ({ Given, page, Then }) => {
    await Given("I am on the posting profiles dashboard", null, { page });
    await Then("the posting profiles dashboard shows all six navigation cards", null, { page });
  });

  test("Matrix page loads with existing profiles listed", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-002", "@regression", "@p1"] }, async ({ Given, page, Then }) => {
    await Given("I am on the posting profiles matrix page", null, { page });
    await Then("the posting profiles matrix shows the rules table or empty state", null, { page });
  });

  test("Matrix filter by module narrows results", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-003", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles matrix page", null, { page });
    await When("I filter posting profiles matrix by module \"Sales\"", null, { page });
    await Then("the matrix module filter shows \"Sales\"", null, { page });
  });

  test("Add Rule dialog opens with required fields", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-004", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles matrix page", null, { page });
    await When("I open the add posting rule dialog", null, { page });
    await Then("the add posting rule dialog is visible", null, { page });
  });

  test("Show Inactive toggle reveals inactive profiles", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-005", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles matrix page", null, { page });
    await When("I click Show Inactive on the matrix", null, { page });
    await Then("the posting profiles matrix is still visible", null, { page });
  });

  test("Simulation resolves sales ar_control to Trade Debtors GL account", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-006", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles simulation page", null, { page });
    await When("I run posting simulation for sales module and Accounts Receivable account type", null, { page });
    await Then("the simulation result shows a resolved GL account", null, { page });
  });

  test("Simulation resolves finance unapplied_cash GL account", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-007", "@regression", "@p1"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles simulation page", null, { page });
    await When("I run posting simulation for finance module and Unapplied Cash account type", null, { page });
    await Then("the simulation result shows a resolved GL account", null, { page });
  });

  test("Simulation with no matching profile shows no profile found message", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-008", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles simulation page", null, { page });
    await When("I run posting simulation likely to have no matching rule", null, { page });
    await Then("the simulation shows no matching profile or skipped when tenant is fully configured", null, { page });
  });

  test("Dashboard Active vs Setup Only badge labels are correct", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-009", "@regression", "@p2"] }, async ({ Given, page, Then }) => {
    await Given("I am on the posting profiles dashboard", null, { page });
    await Then("Active and Setup Only badges appear on the correct cards", null, { page });
  });

  test("Customer Posting Groups page shows Setup Only info alert", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-010", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles dashboard", null, { page });
    await When("I navigate to customer posting groups from the dashboard", null, { page });
    await Then("the customer posting groups page shows setup information", null, { page });
  });

  test("Download Template button triggers file download", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-011", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles matrix page", null, { page });
    await When("I click Download Template on the matrix", null, { page });
    await Then("a file download begins for posting profiles template");
  });

  test("Export button triggers profiles file download", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-012", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles matrix page", null, { page });
    await When("I click Export on the matrix", null, { page });
    await Then("a file download begins for posting profiles export");
  });

  test("Tax Determination Matrix page opens from dashboard", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-013", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles dashboard", null, { page });
    await When("I navigate to tax determination matrix from the dashboard", null, { page });
    await Then("I should be on the tax matrix route", null, { page });
  });

  test("Item Posting Groups page opens from dashboard", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-014", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles dashboard", null, { page });
    await When("I navigate to item posting groups from the dashboard", null, { page });
    await Then("I should be on the item groups route", null, { page });
  });

  test("Vendor Posting Groups page opens from dashboard", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-015", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles dashboard", null, { page });
    await When("I navigate to vendor posting groups from the dashboard", null, { page });
    await Then("I should be on the vendor groups route", null, { page });
  });

  test("Matrix Refresh button is visible and clickable", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-016", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles matrix page", null, { page });
    await When("I click Refresh on the matrix", null, { page });
    await Then("the posting profiles matrix shows the rules table or empty state", null, { page });
  });

  test("Simulation page shows optional warehouse selector", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-017", "@regression", "@p2"] }, async ({ Given, page, Then }) => {
    await Given("I am on the posting profiles simulation page", null, { page });
    await Then("the warehouse optional combobox is visible", null, { page });
  });

  test("Simulation module combobox lists Sales", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-018", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles simulation page", null, { page });
    await When("I open the simulation module combobox", null, { page });
    await Then("option \"Sales\" is available", null, { page });
  });

  test("Dashboard How Posting Profiles Work alert is visible", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-019", "@regression", "@p2"] }, async ({ Given, page, Then }) => {
    await Given("I am on the posting profiles dashboard", null, { page });
    await Then("the how posting profiles work alert is visible", null, { page });
  });

  test("Add Rule dialog can be dismissed", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-020", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles matrix page", null, { page });
    await When("I open the add posting rule dialog", null, { page });
    await When("I dismiss the posting rule dialog", null, { page });
    await Then("the add posting rule dialog is hidden", null, { page });
  });

  test("Customer posting groups page loads content", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-021", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles dashboard", null, { page });
    await When("I navigate to customer posting groups from the dashboard", null, { page });
    await Then("the customer posting groups heading is visible", null, { page });
  });

  test("Tax matrix page shows heading", { tag: ["@finance", "@posting-profiles", "@iacs-md", "@FIN-PP-TC-022", "@regression", "@p2"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the posting profiles dashboard", null, { page });
    await When("I navigate to tax determination matrix from the dashboard", null, { page });
    await Then("the tax matrix page shows a heading", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/posting-profiles/posting-profiles.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Dashboard shows all 6 navigation cards": {"pickleLocation":"11:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-001","@smoke","@p1"],"ownTags":["@iacs-md","@p1","@smoke","@FIN-PP-TC-001"]},
  "Matrix page loads with existing profiles listed": {"pickleLocation":"16:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-002","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-PP-TC-002"]},
  "Matrix filter by module narrows results": {"pickleLocation":"21:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-003","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-PP-TC-003"]},
  "Add Rule dialog opens with required fields": {"pickleLocation":"27:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-004","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-PP-TC-004"]},
  "Show Inactive toggle reveals inactive profiles": {"pickleLocation":"33:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-005","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-PP-TC-005"]},
  "Simulation resolves sales ar_control to Trade Debtors GL account": {"pickleLocation":"39:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-006","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-PP-TC-006"]},
  "Simulation resolves finance unapplied_cash GL account": {"pickleLocation":"45:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-007","@regression","@p1"],"ownTags":["@iacs-md","@p1","@regression","@FIN-PP-TC-007"]},
  "Simulation with no matching profile shows no profile found message": {"pickleLocation":"51:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-008","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-008"]},
  "Dashboard Active vs Setup Only badge labels are correct": {"pickleLocation":"57:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-009","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-009"]},
  "Customer Posting Groups page shows Setup Only info alert": {"pickleLocation":"62:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-010","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-010"]},
  "Download Template button triggers file download": {"pickleLocation":"68:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-011","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-011"]},
  "Export button triggers profiles file download": {"pickleLocation":"74:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-012","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-012"]},
  "Tax Determination Matrix page opens from dashboard": {"pickleLocation":"80:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-013","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-013"]},
  "Item Posting Groups page opens from dashboard": {"pickleLocation":"86:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-014","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-014"]},
  "Vendor Posting Groups page opens from dashboard": {"pickleLocation":"92:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-015","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-015"]},
  "Matrix Refresh button is visible and clickable": {"pickleLocation":"98:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-016","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-016"]},
  "Simulation page shows optional warehouse selector": {"pickleLocation":"104:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-017","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-017"]},
  "Simulation module combobox lists Sales": {"pickleLocation":"109:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-018","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-018"]},
  "Dashboard How Posting Profiles Work alert is visible": {"pickleLocation":"115:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-019","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-019"]},
  "Add Rule dialog can be dismissed": {"pickleLocation":"120:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-020","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-020"]},
  "Customer posting groups page loads content": {"pickleLocation":"127:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-021","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-021"]},
  "Tax matrix page shows heading": {"pickleLocation":"133:3","tags":["@finance","@posting-profiles","@iacs-md","@FIN-PP-TC-022","@regression","@p2"],"ownTags":["@iacs-md","@p2","@regression","@FIN-PP-TC-022"]},
};