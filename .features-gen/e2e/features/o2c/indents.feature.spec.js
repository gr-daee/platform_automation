/** Generated from: e2e/features/o2c/indents.feature */
import { test } from "playwright-bdd";

test.describe("O2C Indent Management", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("O2C Indents list page loads with title, status cards, and table or empty state", { tag: ["@O2C-INDENT-TC-001", "@smoke", "@critical", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await Then("the O2C Indents list page should be loaded");
  });

  test("Create Indent for dealer creates new indent and navigates to detail page", { tag: ["@O2C-INDENT-TC-002", "@smoke", "@critical", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
  });

  test("Create Indent for dealer with existing draft navigates to that draft", { tag: ["@O2C-INDENT-TC-003", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I go back to the O2C Indents page");
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the same indent detail page as before", null, { page });
  });

  test("Search indents by dealer name or indent number filters the list", { tag: ["@O2C-INDENT-TC-004", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I type \"VAYUPUTRA\" in the indents search box", null, { page });
    await Then("the list should show filtered results or the empty state");
  });

  test("Filter by Status shows only matching indents", { tag: ["@O2C-INDENT-TC-005", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I filter by Status \"Draft\"", null, { page });
    await Then("the list should show filtered results or the empty state");
  });

  test("Clear filters restores the full list", { tag: ["@O2C-INDENT-TC-006", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I filter by Status \"Draft\"", null, { page });
    await And("I clear all filters");
    await Then("the Clear filters button should not be visible");
  });

  test("Clicking an indent row navigates to indent detail page", { tag: ["@O2C-INDENT-TC-008", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await And("the indents table has at least one row");
    await When("I click the first indent row", null, { page });
    await Then("I should be on the indent detail page", null, { page });
  });

  test("When no indents match the filter the empty state is shown", { tag: ["@O2C-INDENT-TC-023", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I filter by Status \"Rejected\"", null, { page });
    await Then("I should see the empty state for indents or at least one indent row");
  });

  test("User searches and selects dealer from Create Indent modal", { tag: ["@O2C-INDENT-TC-012", "@regression", "@dealer-search", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I click the Create Indent button", null, { page });
    await Then("I should see the \"Select Dealer\" modal", null, { page });
    await And("the modal should display a list of active dealers");
    await And("the modal should have a search input", null, { page });
    await When("I search for dealer by name \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("the dealer list should be filtered", null, { page });
    await And("I should see \"VAYUPUTRA AGENCIES\" in the results", null, { page });
    await When("I select the dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("the modal should close", null, { page });
    await And("I should be on the indent creation page with dealer pre-selected", null, { page });
  });

  test("Indent detail page loads with heading and Indent Information", { tag: ["@O2C-INDENT-TC-024", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await And("the indent detail page should be loaded", null, { page });
  });

  test("Edit indent add product by search and save", { tag: ["@O2C-INDENT-TC-025", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"NPK\"", null, { page });
    await And("I save the indent", null, { page });
    await Then("the indent should be saved successfully", null, { page });
  });

  test("Submit indent after adding product", { tag: ["@O2C-INDENT-TC-026", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"NPK\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
  });

  test("Back from indent detail returns to list", { tag: ["@O2C-INDENT-TC-038", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await And("the indents table has at least one row");
    await When("I click the first indent row", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I go back to the O2C Indents page from the indent detail", null, { page });
    await Then("the O2C Indents list page should be loaded");
  });

  test("User searches dealer by dealer code and selects", { tag: ["@O2C-INDENT-TC-039", "@regression", "@dealer-search", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I click the Create Indent button", null, { page });
    await Then("I should see the \"Select Dealer\" modal", null, { page });
    await When("I search for dealer by code \"VAYU\"", null, { page });
    await Then("the dealer list should be filtered", null, { page });
    await And("I should see \"VAYUPUTRA\" in the results", null, { page });
    await When("I select the dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("the modal should close", null, { page });
    await And("I should be on the indent creation page with dealer pre-selected", null, { page });
  });

  test("Search non-existent dealer shows no matching dealers", { tag: ["@O2C-INDENT-TC-040", "@regression", "@dealer-search", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I click the Create Indent button", null, { page });
    await Then("I should see the \"Select Dealer\" modal", null, { page });
    await When("I search for dealer by name \"AUTO_QA_NONEXISTENT_DEALER_999\"", null, { page });
    await Then("the dealer list should show no matching dealers");
  });

  test("Search product by product code shows results in Add Products modal", { tag: ["@O2C-INDENT-TC-041", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I open Add Products and search for \"NPK\"", null, { page });
    await Then("the Add Products modal should show at least one product", null, { page });
  });

  test("Search non-existent product shows no matching products in Add Products modal", { tag: ["@O2C-INDENT-TC-042", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I open Add Products and search for \"AUTO_QA_NONEXISTENT_PRODUCT_999\"", null, { page });
    await Then("the Add Products modal should show no matching products", null, { page });
  });

  test("Submit Indent button is disabled when indent has no items", { tag: ["@O2C-INDENT-TC-030", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await Then("the Submit Indent button should be disabled", null, { page });
  });

  test("Draft indent shows Edit and Submit Indent but not Approve or Process Workflow", { tag: ["@O2C-INDENT-TC-035", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await Then("the Edit button should be visible on the indent detail page", null, { page });
    await And("the Submit Indent button should be visible on the indent detail page", null, { page });
    await And("the Approve button should not be visible on the indent detail page", null, { page });
    await And("the Process Workflow button should not be visible on the indent detail page", null, { page });
  });

  test("Submitted indent shows Warehouse Selection and selecting warehouse enables Approve", { tag: ["@O2C-INDENT-TC-027", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"NPK\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await Then("the Warehouse Selection card should be visible", null, { page });
    await Then("the Approve button should be disabled", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await Then("the Approve button should be enabled", null, { page });
  });

  test("Approve button is disabled when warehouse not selected on submitted indent", { tag: ["@O2C-INDENT-TC-031", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"NPK\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await Then("the Warehouse Selection card should be visible", null, { page });
    await And("the Approve button should be disabled", null, { page });
  });

  test("Submitted indent shows Warehouse Selection and Approve and Reject buttons", { tag: ["@O2C-INDENT-TC-036", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"NPK\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await Then("the Warehouse Selection card should be visible", null, { page });
    await And("the Approve button should be visible on the indent detail page", null, { page });
    await And("the Process Workflow button should not be visible on the indent detail page", null, { page });
  });

  test("Approve indent with optional comments after selecting warehouse", { tag: ["@O2C-INDENT-TC-028", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"NPK\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await When("I click Approve on the indent detail page", null, { page });
    await And("I submit the approval dialog", null, { page });
    await Then("the indent should be approved successfully", null, { page });
  });

  test("Reject button in approval dialog is disabled until comment is provided", { tag: ["@O2C-INDENT-TC-032", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"NPK\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await When("I click Reject on the indent detail page", null, { page });
    await Then("the Reject button in the approval dialog should be disabled", null, { page });
    await When("I fill approval comments \"AUTO_QA Rejected for testing\" and submit the approval dialog", null, { page });
    await Then("the indent detail page should be loaded", null, { page });
  });

  test("Approved indent shows Process Workflow button", { tag: ["@O2C-INDENT-TC-037", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"NPK\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await When("I click Approve on the indent detail page", null, { page });
    await And("I submit the approval dialog", null, { page });
    await Then("the indent should be approved successfully", null, { page });
    await Then("the Process Workflow button should be visible on the indent detail page", null, { page });
  });

  test("Process Workflow creates Sales Order or Back Order from approved indent", { tag: ["@O2C-INDENT-TC-029", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"NPK\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await When("I click Approve on the indent detail page", null, { page });
    await And("I submit the approval dialog", null, { page });
    await Then("the indent should be approved successfully", null, { page });
    await When("I click Process Workflow", null, { page });
    await And("I confirm and process the workflow", null, { page });
    await Then("the workflow should complete successfully", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/o2c/indents.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "O2C Indents list page loads with title, status cards, and table or empty state": {"pickleLocation":"10:3","tags":["@O2C-INDENT-TC-001","@smoke","@critical","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@critical","@smoke","@O2C-INDENT-TC-001"]},
  "Create Indent for dealer creates new indent and navigates to detail page": {"pickleLocation":"15:3","tags":["@O2C-INDENT-TC-002","@smoke","@critical","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@critical","@smoke","@O2C-INDENT-TC-002"]},
  "Create Indent for dealer with existing draft navigates to that draft": {"pickleLocation":"21:3","tags":["@O2C-INDENT-TC-003","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-003"]},
  "Search indents by dealer name or indent number filters the list": {"pickleLocation":"30:3","tags":["@O2C-INDENT-TC-004","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-004"]},
  "Filter by Status shows only matching indents": {"pickleLocation":"36:3","tags":["@O2C-INDENT-TC-005","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-005"]},
  "Clear filters restores the full list": {"pickleLocation":"42:3","tags":["@O2C-INDENT-TC-006","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-006"]},
  "Clicking an indent row navigates to indent detail page": {"pickleLocation":"49:3","tags":["@O2C-INDENT-TC-008","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-008"]},
  "When no indents match the filter the empty state is shown": {"pickleLocation":"56:3","tags":["@O2C-INDENT-TC-023","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-023"]},
  "User searches and selects dealer from Create Indent modal": {"pickleLocation":"62:3","tags":["@O2C-INDENT-TC-012","@regression","@dealer-search","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@dealer-search","@regression","@O2C-INDENT-TC-012"]},
  "Indent detail page loads with heading and Indent Information": {"pickleLocation":"77:3","tags":["@O2C-INDENT-TC-024","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-024"]},
  "Edit indent add product by search and save": {"pickleLocation":"84:3","tags":["@O2C-INDENT-TC-025","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-025"]},
  "Submit indent after adding product": {"pickleLocation":"94:3","tags":["@O2C-INDENT-TC-026","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-026"]},
  "Back from indent detail returns to list": {"pickleLocation":"105:3","tags":["@O2C-INDENT-TC-038","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-038"]},
  "User searches dealer by dealer code and selects": {"pickleLocation":"115:3","tags":["@O2C-INDENT-TC-039","@regression","@dealer-search","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@dealer-search","@regression","@O2C-INDENT-TC-039"]},
  "Search non-existent dealer shows no matching dealers": {"pickleLocation":"127:3","tags":["@O2C-INDENT-TC-040","@regression","@dealer-search","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@dealer-search","@regression","@O2C-INDENT-TC-040"]},
  "Search product by product code shows results in Add Products modal": {"pickleLocation":"136:3","tags":["@O2C-INDENT-TC-041","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-041"]},
  "Search non-existent product shows no matching products in Add Products modal": {"pickleLocation":"145:3","tags":["@O2C-INDENT-TC-042","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-042"]},
  "Submit Indent button is disabled when indent has no items": {"pickleLocation":"155:3","tags":["@O2C-INDENT-TC-030","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-030"]},
  "Draft indent shows Edit and Submit Indent but not Approve or Process Workflow": {"pickleLocation":"162:3","tags":["@O2C-INDENT-TC-035","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-035"]},
  "Submitted indent shows Warehouse Selection and selecting warehouse enables Approve": {"pickleLocation":"173:3","tags":["@O2C-INDENT-TC-027","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-027"]},
  "Approve button is disabled when warehouse not selected on submitted indent": {"pickleLocation":"188:3","tags":["@O2C-INDENT-TC-031","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-031"]},
  "Submitted indent shows Warehouse Selection and Approve and Reject buttons": {"pickleLocation":"201:3","tags":["@O2C-INDENT-TC-036","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-036"]},
  "Approve indent with optional comments after selecting warehouse": {"pickleLocation":"216:3","tags":["@O2C-INDENT-TC-028","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-028"]},
  "Reject button in approval dialog is disabled until comment is provided": {"pickleLocation":"231:3","tags":["@O2C-INDENT-TC-032","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-032"]},
  "Approved indent shows Process Workflow button": {"pickleLocation":"248:3","tags":["@O2C-INDENT-TC-037","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-037"]},
  "Process Workflow creates Sales Order or Back Order from approved indent": {"pickleLocation":"264:3","tags":["@O2C-INDENT-TC-029","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-029"]},
};