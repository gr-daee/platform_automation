/** Generated from: e2e/features/o2c/sales-returns/sales-returns.feature */
import { test } from "playwright-bdd";

test.describe("Sales Returns (Phases 1-7 consolidated)", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test("Sales Returns page shows heading and description", { tag: ["@SR-PH1-TC-001", "@sales-returns", "@SR-PH1", "@smoke", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the Sales Returns list page", null, { page });
    await Then("the Sales Returns page shows heading and description", null, { page });
  });

  test("Create Return Order navigates to new return wizard", { tag: ["@SR-PH1-TC-002", "@sales-returns", "@SR-PH1", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Sales Returns list page", null, { page });
    await When("I click Create Return Order on the Sales Returns page", null, { page });
    await Then("I should be on the create sales return page", null, { page });
  });

  test("Sales Returns statistics cards are visible", { tag: ["@SR-PH1-TC-003", "@sales-returns", "@SR-PH1", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the Sales Returns list page", null, { page });
    await Then("the Sales Returns statistics cards are visible", null, { page });
  });

  test("Sales Returns list shows table or empty state without error", { tag: ["@SR-PH1-TC-004", "@sales-returns", "@SR-PH1", "@regression", "@p1", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the Sales Returns list page", null, { page });
    await Then("the Sales Returns list shows table or empty state without error", null, { page });
  });

  test("Sales Returns breadcrumb shows Order to Cash and current page", { tag: ["@SR-PH1-TC-005", "@sales-returns", "@SR-PH1", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, Then }) => {
    await Given("I am on the Sales Returns list page", null, { page });
    await Then("the Sales Returns breadcrumb shows Order to Cash and current Sales Returns", null, { page });
  });

  test("Sales Returns status filter Pending applies", { tag: ["@SR-PH2-TC-001", "@sales-returns", "@SR-PH2", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the Sales Returns list page", null, { page });
    await When("I apply Sales Returns status filter \"Pending\"", null, { page });
    await Then("Sales Returns status filter should show \"Pending\"", null, { page });
    await And("Sales Returns table rows should all have status \"Pending\" or list is empty for filter", null, { page });
  });

  test("Sales Returns return reason filter Defective applies", { tag: ["@SR-PH2-TC-002", "@sales-returns", "@SR-PH2", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then, And }) => {
    await Given("I am on the Sales Returns list page", null, { page });
    await When("I apply Sales Returns return reason filter \"Defective\"", null, { page });
    await Then("Sales Returns return reason filter should show \"Defective\"", null, { page });
    await And("Sales Returns table rows should all have reason \"Defective\" or list is empty for filter", null, { page });
  });

  test("Sales Returns search finds return order by substring from database", { tag: ["@SR-PH2-TC-003", "@sales-returns", "@SR-PH2", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Sales Returns list page", null, { page });
    await When("I search Sales Returns list by return order substring from database", null, { page });
    await Then("Sales Returns list should show link for context return order number", null, { page });
  });

  test("Sales Returns clear filters resets search and status filter", { tag: ["@SR-PH2-TC-004", "@sales-returns", "@SR-PH2", "@regression", "@p2", "@iacs-md"] }, async ({ Given, page, When, And, Then }) => {
    await Given("I am on the Sales Returns list page", null, { page });
    await When("I apply Sales Returns status filter \"Pending\"", null, { page });
    await And("I fill Sales Returns list search with \"zzzz_no_match_sr_ph2_clear\"", null, { page });
    await And("I click Sales Returns toolbar clear filters", null, { page });
    await Then("Sales Returns list search input should be empty", null, { page });
    await And("Sales Returns toolbar clear filters button should be hidden", null, { page });
    await And("Sales Returns status filter should not include label \"Pending\"", null, { page });
  });

  test("Sales Returns pagination page 2 when more than one page", { tag: ["@SR-PH2-TC-005", "@sales-returns", "@SR-PH2", "@regression", "@p3", "@iacs-md"] }, async ({ Given, page, When, Then }) => {
    await Given("I am on the Sales Returns list page", null, { page });
    await When("I open Sales Returns list page 2 if multiple pages exist", null, { page });
    await Then("Sales Returns pagination showing-from should be at least 21", null, { page });
  });

  test("Create sales return order full happy path", { tag: ["@SR-PH3-TC-001", "@SR-PH3-TC-002", "@SR-PH3-TC-003", "@SR-PH3-TC-004", "@SR-PH3", "@sales-returns", "@regression", "@p1", "@iacs-md"] }, async ({ Given, And, page, When, Then }) => {
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
    await And("sales return order status in database should be pending", null, { page });
  });

  test("Pending return shows receipt actions then record receipt to received", { tag: ["@SR-PH4-TC-001", "@SR-PH4-TC-002", "@SR-PH4-TC-003", "@SR-PH4", "@sales-returns", "@regression", "@p1", "@iacs-md"] }, async ({ Given, And, page, When, Then }) => {
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
    await And("sales return detail should show Record Goods Receipt and Cancel Return Order actions", null, { page });
    await When("I complete record goods receipt on sales return detail with default warehouse", null, { page });
    await Then("I should be on sales return detail with Goods Received status", null, { page });
    await And("sales return detail should not show Cancel Return Order action", null, { page });
    await And("sales return order status in database should be received", null, { page });
  });

  test("Goods receipt increases inventory available by returned quantity verified in database", { tag: ["@SR-PH4-TC-004", "@SR-PH4", "@sales-returns", "@regression", "@p1", "@iacs-md"] }, async ({ Given, And, page, When, Then }) => {
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

  test("Credit memo from return after receipt when applicable", { tag: ["@SR-PH5-TC-001", "@SR-PH5-TC-002", "@SR-PH5", "@sales-returns", "@regression", "@p1", "@iacs-md"] }, async ({ Given, And, page, When, Then }) => {
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
  });

  test("Retry E-Credit Note shell when credit memo has pending e-credit", { tag: ["@SR-PH5-TC-003", "@SR-PH5", "@sales-returns", "@regression", "@p2", "@iacs-md"] }, async ({ Given, When, page, Then }) => {
    await Given("a sales return with pending e-credit is resolved from database");
    await When("I open sales return detail for pending e-credit context", null, { page });
    await Then("Retry E-Credit Note button and dialog shell should be visible", null, { page });
  });

  test("Review blocked when no return lines are selected", { tag: ["@SR-PH6-TC-003", "@SR-PH6", "@sales-returns", "@regression", "@p2", "@iacs-md"] }, async ({ Given, And, page, When, Then }) => {
    await Given("sales return eligible invoice is resolved from database");
    await And("I am on the create sales return order page", null, { page });
    await When("I select context invoice in sales return create dialog", null, { page });
    await Then("sales return create page should show context dealer on dealer trigger", null, { page });
    await When("I choose return reason Customer Request on sales return create page", null, { page });
    await And("I enter sales return notes with AUTO_QA prefix", null, { page });
    await And("I load invoice items on sales return create page", null, { page });
    await When("I attempt review on sales return create page with zero items selected", null, { page });
    await Then("I should remain on sales return create step 2", null, { page });
  });

  test("Return quantity cannot exceed available on line", { tag: ["@SR-PH6-TC-004", "@SR-PH6", "@sales-returns", "@regression", "@p2", "@iacs-md"] }, async ({ Given, And, page, When, Then }) => {
    await Given("sales return eligible invoice is resolved from database");
    await And("I am on the create sales return order page", null, { page });
    await When("I select context invoice in sales return create dialog", null, { page });
    await Then("sales return create page should show context dealer on dealer trigger", null, { page });
    await When("I choose return reason Customer Request on sales return create page", null, { page });
    await And("I enter sales return notes with AUTO_QA prefix", null, { page });
    await And("I load invoice items on sales return create page", null, { page });
    await When("I attempt return quantity above available on first line on sales return create page", null, { page });
    await Then("I should remain on sales return create step 2", null, { page });
  });

  test("Cancel pending return requires reason before confirm", { tag: ["@SR-PH6-TC-001", "@SR-PH6-TC-002", "@SR-PH6", "@sales-returns", "@regression", "@p2", "@iacs-md"] }, async ({ Given, And, page, When, Then }) => {
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
    await When("I open cancel return order dialog on sales return detail", null, { page });
    await Then("cancel return confirm should be disabled when reason is empty", null, { page });
    await When("I dismiss cancel return order dialog", null, { page });
    await When("I open cancel return order dialog on sales return detail", null, { page });
    await And("I confirm cancel return order with AUTO_QA reason", null, { page });
    await Then("I should be on sales return detail with Cancelled status", null, { page });
  });

  test("Sales Return Order report page loads for authorized user", { tag: ["@SR-PH7-TC-001", "@SR-PH7", "@sales-returns", "@regression", "@p2", "@iacs-md"] }, async ({ When, page, Then }) => {
    await When("I open the Sales Return Order report page", null, { page });
    await Then("Sales Return Order report shell should be visible", null, { page });
  });

  test("Sales Return Order report access denied for ED when sales_orders read is absent", { tag: ["@SR-PH7-TC-002", "@SR-PH7", "@sales-returns", "@regression", "@p2", "@iacs-ed", "@multi-user"] }, async ({ When, page, Then }) => {
    await When("I navigate to Sales Return Order report URL for access check", null, { page });
    await Then("I should be denied access to Sales Return Order report or skip if tenant grants access", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/o2c/sales-returns/sales-returns.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Sales Returns page shows heading and description": {"pickleLocation":"11:3","tags":["@SR-PH1-TC-001","@sales-returns","@SR-PH1","@smoke","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@smoke","@SR-PH1","@sales-returns","@SR-PH1-TC-001"]},
  "Create Return Order navigates to new return wizard": {"pickleLocation":"16:3","tags":["@SR-PH1-TC-002","@sales-returns","@SR-PH1","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@SR-PH1","@sales-returns","@SR-PH1-TC-002"]},
  "Sales Returns statistics cards are visible": {"pickleLocation":"22:3","tags":["@SR-PH1-TC-003","@sales-returns","@SR-PH1","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@SR-PH1","@sales-returns","@SR-PH1-TC-003"]},
  "Sales Returns list shows table or empty state without error": {"pickleLocation":"27:3","tags":["@SR-PH1-TC-004","@sales-returns","@SR-PH1","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@SR-PH1","@sales-returns","@SR-PH1-TC-004"]},
  "Sales Returns breadcrumb shows Order to Cash and current page": {"pickleLocation":"32:3","tags":["@SR-PH1-TC-005","@sales-returns","@SR-PH1","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@SR-PH1","@sales-returns","@SR-PH1-TC-005"]},
  "Sales Returns status filter Pending applies": {"pickleLocation":"38:3","tags":["@SR-PH2-TC-001","@sales-returns","@SR-PH2","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@SR-PH2","@sales-returns","@SR-PH2-TC-001"]},
  "Sales Returns return reason filter Defective applies": {"pickleLocation":"45:3","tags":["@SR-PH2-TC-002","@sales-returns","@SR-PH2","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@SR-PH2","@sales-returns","@SR-PH2-TC-002"]},
  "Sales Returns search finds return order by substring from database": {"pickleLocation":"52:3","tags":["@SR-PH2-TC-003","@sales-returns","@SR-PH2","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@SR-PH2","@sales-returns","@SR-PH2-TC-003"]},
  "Sales Returns clear filters resets search and status filter": {"pickleLocation":"58:3","tags":["@SR-PH2-TC-004","@sales-returns","@SR-PH2","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@SR-PH2","@sales-returns","@SR-PH2-TC-004"]},
  "Sales Returns pagination page 2 when more than one page": {"pickleLocation":"68:3","tags":["@SR-PH2-TC-005","@sales-returns","@SR-PH2","@regression","@p3","@iacs-md"],"ownTags":["@iacs-md","@p3","@regression","@SR-PH2","@sales-returns","@SR-PH2-TC-005"]},
  "Create sales return order full happy path": {"pickleLocation":"75:3","tags":["@SR-PH3-TC-001","@SR-PH3-TC-002","@SR-PH3-TC-003","@SR-PH3-TC-004","@SR-PH3","@sales-returns","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@sales-returns","@SR-PH3","@SR-PH3-TC-004","@SR-PH3-TC-003","@SR-PH3-TC-002","@SR-PH3-TC-001"]},
  "Pending return shows receipt actions then record receipt to received": {"pickleLocation":"91:3","tags":["@SR-PH4-TC-001","@SR-PH4-TC-002","@SR-PH4-TC-003","@SR-PH4","@sales-returns","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@sales-returns","@SR-PH4","@SR-PH4-TC-003","@SR-PH4-TC-002","@SR-PH4-TC-001"]},
  "Goods receipt increases inventory available by returned quantity verified in database": {"pickleLocation":"110:3","tags":["@SR-PH4-TC-004","@SR-PH4","@sales-returns","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@sales-returns","@SR-PH4","@SR-PH4-TC-004"]},
  "Credit memo from return after receipt when applicable": {"pickleLocation":"129:3","tags":["@SR-PH5-TC-001","@SR-PH5-TC-002","@SR-PH5","@sales-returns","@regression","@p1","@iacs-md"],"ownTags":["@iacs-md","@p1","@regression","@sales-returns","@SR-PH5","@SR-PH5-TC-002","@SR-PH5-TC-001"]},
  "Retry E-Credit Note shell when credit memo has pending e-credit": {"pickleLocation":"147:3","tags":["@SR-PH5-TC-003","@SR-PH5","@sales-returns","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@sales-returns","@SR-PH5","@SR-PH5-TC-003"]},
  "Review blocked when no return lines are selected": {"pickleLocation":"154:3","tags":["@SR-PH6-TC-003","@SR-PH6","@sales-returns","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@sales-returns","@SR-PH6","@SR-PH6-TC-003"]},
  "Return quantity cannot exceed available on line": {"pickleLocation":"166:3","tags":["@SR-PH6-TC-004","@SR-PH6","@sales-returns","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@sales-returns","@SR-PH6","@SR-PH6-TC-004"]},
  "Cancel pending return requires reason before confirm": {"pickleLocation":"178:3","tags":["@SR-PH6-TC-001","@SR-PH6-TC-002","@SR-PH6","@sales-returns","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@sales-returns","@SR-PH6","@SR-PH6-TC-002","@SR-PH6-TC-001"]},
  "Sales Return Order report page loads for authorized user": {"pickleLocation":"199:3","tags":["@SR-PH7-TC-001","@SR-PH7","@sales-returns","@regression","@p2","@iacs-md"],"ownTags":["@iacs-md","@p2","@regression","@sales-returns","@SR-PH7","@SR-PH7-TC-001"]},
  "Sales Return Order report access denied for ED when sales_orders read is absent": {"pickleLocation":"204:3","tags":["@SR-PH7-TC-002","@SR-PH7","@sales-returns","@regression","@p2","@iacs-ed","@multi-user"],"ownTags":["@multi-user","@iacs-ed","@p2","@regression","@sales-returns","@SR-PH7","@SR-PH7-TC-002"]},
};