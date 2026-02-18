/** Generated from: e2e/features/o2c/indents.feature */
import { test } from "playwright-bdd";

test.describe("O2C Indent Management", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Create Indent for dealer creates new indent and navigates to detail page", { tag: ["@O2C-INDENT-TC-001", "@smoke", "@critical", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
  });

  test("Create Indent for dealer with existing draft navigates to that draft", { tag: ["@O2C-INDENT-TC-002", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I go back to the O2C Indents page");
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the same indent detail page as before", null, { page });
  });

  test("User searches and selects dealer from Create Indent modal", { tag: ["@O2C-INDENT-TC-003", "@regression", "@dealer-search", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
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

  test("Edit indent add product by search and save", { tag: ["@O2C-INDENT-TC-004", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await Then("the indent should be saved successfully", null, { page });
  });

  test("Submit indent after adding product", { tag: ["@O2C-INDENT-TC-005", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
  });

  test("Back from indent detail returns to list", { tag: ["@O2C-INDENT-TC-006", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, And, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await And("the indents table has at least one row");
    await When("I click the first indent row", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I go back to the O2C Indents page from the indent detail", null, { page });
    await Then("the O2C Indents list page should be loaded");
  });

  test("User searches dealer by dealer code and selects", { tag: ["@O2C-INDENT-TC-007", "@regression", "@dealer-search", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
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

  test("Search non-existent dealer shows no matching dealers", { tag: ["@O2C-INDENT-TC-008", "@regression", "@dealer-search", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I click the Create Indent button", null, { page });
    await Then("I should see the \"Select Dealer\" modal", null, { page });
    await When("I search for dealer by name \"AUTO_QA_NONEXISTENT_DEALER_999\"", null, { page });
    await Then("the dealer list should show no matching dealers");
  });

  test("Search non-existent product shows no matching products in Add Products modal", { tag: ["@O2C-INDENT-TC-009", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I open Add Products and search for \"AUTO_QA_NONEXISTENT_PRODUCT_999\"", null, { page });
    await Then("the Add Products modal should show no matching products", null, { page });
  });

  test("Submit Indent button is disabled when indent has no items", { tag: ["@O2C-INDENT-TC-010", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await Then("the Submit Indent button should be disabled", null, { page });
  });

  test("Draft indent shows Edit and Submit Indent but not Approve or Process Workflow", { tag: ["@O2C-INDENT-TC-011", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await Then("the Edit button should be visible on the indent detail page", null, { page });
    await And("the Submit Indent button should be visible on the indent detail page", null, { page });
    await And("the Approve button should not be visible on the indent detail page", null, { page });
    await And("the Process Workflow button should not be visible on the indent detail page", null, { page });
  });

  test("Full straight path from list to Sales Order creation", { tag: ["@O2C-INDENT-TC-012", "@smoke", "@critical", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, Then, When, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await Then("the O2C Indents list page should be loaded");
    await When("I create an indent for dealer \"Ramesh ningappa diggai\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await And("the indent detail page should be loaded", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I open Add Products, select 2 product(s) and add them", null, { page });
    await Then("the indent should show at least 1 line item(s)", null, { page });
    await When("I set the quantity of the first line item to 2", null, { page });
    await Then("the indent total amount should be greater than zero", null, { page });
    await And("the indent total amount should match the sum of line items", null, { page });
    await When("I save the indent", null, { page });
    await Then("the indent should be saved successfully", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await Then("the Warehouse Selection card should be visible", null, { page });
    await Then("the Approve button should be disabled", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await Then("the Approve button should be enabled", null, { page });
    await And("the Approve button should be visible on the indent detail page", null, { page });
    await When("I click Approve on the indent detail page", null, { page });
    await And("I fill approval comments \"AUTO_QA Straight path approval\" and submit the approval dialog", null, { page });
    await Then("the indent should be approved successfully", null, { page });
    await Then("the Process Workflow button should be visible on the indent detail page", null, { page });
    await When("I click Process Workflow", null, { page });
    await Then("the Process Workflow dialog should show SO and Back Order preview", null, { page });
    await When("I confirm and process the workflow", null, { page });
    await Then("the workflow should complete successfully", null, { page });
  });

  test("Reject button in approval dialog is disabled until comment is provided", { tag: ["@O2C-INDENT-TC-013", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await When("I click Reject on the indent detail page", null, { page });
    await Then("the Reject button in the approval dialog should be disabled", null, { page });
    await When("I fill approval comments \"AUTO_QA Rejected for testing\" and submit the approval dialog", null, { page });
    await Then("the indent detail page should be loaded", null, { page });
  });

  test("Reject indent with required comments and verify status Rejected", { tag: ["@O2C-INDENT-TC-014", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await When("I click Reject on the indent detail page", null, { page });
    await Then("the Reject button in the approval dialog should be disabled", null, { page });
    await When("I fill approval comments \"AUTO_QA Rejected for testing\" and submit the approval dialog", null, { page });
    await Then("the indent status should be Rejected", null, { page });
  });

  test("Approval blocked when dealer has due invoices beyond 90 days", { tag: ["@O2C-INDENT-TC-015", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"VAYUPUTRA AGENCIES\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await When("I click Approve on the indent detail page", null, { page });
    await And("I submit the approval dialog", null, { page });
    await Then("approval should be blocked due to overdue invoices", null, { page });
  });

  test("Select transporter when dealer has no default transporter", { tag: ["@O2C-INDENT-TC-016", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"IACS3039\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await Then("the Transporter Selection card should be visible on the indent detail page", null, { page });
    await When("I select the first transporter for the indent", null, { page });
    await Then("the indent detail page should be loaded", null, { page });
  });

  test("Dealer with default transporter shows pre-selected transporter", { tag: ["@O2C-INDENT-TC-017", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"Ramesh ningappa diggai\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await Then("the Transporter Selection card should be visible on the indent detail page", null, { page });
    await Then("a transporter should be pre-selected on the indent detail page", null, { page });
  });

  test("Credit limit check shows Credit Warning when insufficient", { tag: ["@O2C-INDENT-TC-018", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"IACS1650\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await Then("I should see Credit Warning on the indent detail page", null, { page });
  });

  test("Stock warning shown when selected warehouse has insufficient stock", { tag: ["@O2C-INDENT-TC-019", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"Ramesh ningappa diggai\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I add a product by searching for \"1041\"", null, { page });
    await And("I add a product by searching for \"NPK\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await When("I select warehouse \"Kurnook Warehouse\" for the indent", null, { page });
    await Then("I should see a stock warning or Approve with Back Orders on the indent detail page", null, { page });
  });

  test("Process Workflow dialog shows SO and Back Order preview before Confirm", { tag: ["@O2C-INDENT-TC-020", "@regression", "@iacs-tenant", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the O2C Indents page", null, { page });
    await When("I create an indent for dealer \"Ramesh ningappa diggai\"", null, { page });
    await Then("I should be on the indent detail page", null, { page });
    await When("I click Edit on the indent detail page", null, { page });
    await And("I add a product by searching for \"1013\"", null, { page });
    await And("I save the indent", null, { page });
    await When("I submit the indent", null, { page });
    await Then("the indent should be submitted successfully", null, { page });
    await When("I select the first warehouse for the indent", null, { page });
    await When("I click Approve on the indent detail page", null, { page });
    await And("I submit the approval dialog", null, { page });
    await Then("the indent should be approved successfully", null, { page });
    await When("I click Process Workflow", null, { page });
    await Then("the Process Workflow dialog should show SO and Back Order preview", null, { page });
    await When("I close the Process Workflow dialog", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/o2c/indents.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Create Indent for dealer creates new indent and navigates to detail page": {"pickleLocation":"10:3","tags":["@O2C-INDENT-TC-001","@smoke","@critical","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@critical","@smoke","@O2C-INDENT-TC-001"]},
  "Create Indent for dealer with existing draft navigates to that draft": {"pickleLocation":"16:3","tags":["@O2C-INDENT-TC-002","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-002"]},
  "User searches and selects dealer from Create Indent modal": {"pickleLocation":"25:3","tags":["@O2C-INDENT-TC-003","@regression","@dealer-search","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@dealer-search","@regression","@O2C-INDENT-TC-003"]},
  "Edit indent add product by search and save": {"pickleLocation":"39:3","tags":["@O2C-INDENT-TC-004","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-004"]},
  "Submit indent after adding product": {"pickleLocation":"49:3","tags":["@O2C-INDENT-TC-005","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-005"]},
  "Back from indent detail returns to list": {"pickleLocation":"60:3","tags":["@O2C-INDENT-TC-006","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-006"]},
  "User searches dealer by dealer code and selects": {"pickleLocation":"70:3","tags":["@O2C-INDENT-TC-007","@regression","@dealer-search","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@dealer-search","@regression","@O2C-INDENT-TC-007"]},
  "Search non-existent dealer shows no matching dealers": {"pickleLocation":"82:3","tags":["@O2C-INDENT-TC-008","@regression","@dealer-search","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@dealer-search","@regression","@O2C-INDENT-TC-008"]},
  "Search non-existent product shows no matching products in Add Products modal": {"pickleLocation":"90:3","tags":["@O2C-INDENT-TC-009","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-009"]},
  "Submit Indent button is disabled when indent has no items": {"pickleLocation":"100:3","tags":["@O2C-INDENT-TC-010","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-010"]},
  "Draft indent shows Edit and Submit Indent but not Approve or Process Workflow": {"pickleLocation":"107:3","tags":["@O2C-INDENT-TC-011","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-011"]},
  "Full straight path from list to Sales Order creation": {"pickleLocation":"118:3","tags":["@O2C-INDENT-TC-012","@smoke","@critical","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@critical","@smoke","@O2C-INDENT-TC-012"]},
  "Reject button in approval dialog is disabled until comment is provided": {"pickleLocation":"149:3","tags":["@O2C-INDENT-TC-013","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-013"]},
  "Reject indent with required comments and verify status Rejected": {"pickleLocation":"166:3","tags":["@O2C-INDENT-TC-014","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-014"]},
  "Approval blocked when dealer has due invoices beyond 90 days": {"pickleLocation":"183:3","tags":["@O2C-INDENT-TC-015","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-015"]},
  "Select transporter when dealer has no default transporter": {"pickleLocation":"199:3","tags":["@O2C-INDENT-TC-016","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-016"]},
  "Dealer with default transporter shows pre-selected transporter": {"pickleLocation":"214:3","tags":["@O2C-INDENT-TC-017","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-017"]},
  "Credit limit check shows Credit Warning when insufficient": {"pickleLocation":"229:3","tags":["@O2C-INDENT-TC-018","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-018"]},
  "Stock warning shown when selected warehouse has insufficient stock": {"pickleLocation":"243:3","tags":["@O2C-INDENT-TC-019","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-019"]},
  "Process Workflow dialog shows SO and Back Order preview before Confirm": {"pickleLocation":"259:3","tags":["@O2C-INDENT-TC-020","@regression","@iacs-tenant","@iacs-md"],"ownTags":["@iacs-md","@iacs-tenant","@regression","@O2C-INDENT-TC-020"]},
};