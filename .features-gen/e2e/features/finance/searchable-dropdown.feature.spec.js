/** Generated from: e2e/features/finance/searchable-dropdown.feature */
import { test } from "playwright-bdd";

test.describe("Searchable dropdown regression across key modules", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("I am logged in to the Application", null, { page });
  });

  test.describe("Page has at least one searchable dropdown", () => {

    test("Example #1", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/audit-trail\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/audit-trail\"", null, { page });
      await Then("page should expose a searchable combobox with query \"action\"", null, { page });
    });

    test("Example #2", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/adjustments\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/adjustments\"", null, { page });
      await Then("page should expose a searchable combobox with query \"approved\"", null, { page });
    });

    test("Example #3", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/credit-memos\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/credit-memos\"", null, { page });
      await Then("page should expose a searchable combobox with query \"applied\"", null, { page });
    });

    test("Example #4", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/compliance/gstr1\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/compliance/gstr1\"", null, { page });
      await Then("page should expose a searchable combobox with query \"feb\"", null, { page });
    });

    test("Example #5", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/reports/profit-loss\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/reports/profit-loss\"", null, { page });
      await Then("page should expose a searchable combobox with query \"current\"", null, { page });
    });

    test("Example #6", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/reports/day-book\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/reports/day-book\"", null, { page });
      await Then("page should expose a searchable combobox with query \"ledger\"", null, { page });
    });

    test("Example #7", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/reports/group-summary\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/reports/group-summary\"", null, { page });
      await Then("page should expose a searchable combobox with query \"region\"", null, { page });
    });

    test("Example #8", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/reports/dealer-outstanding\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/reports/dealer-outstanding\"", null, { page });
      await Then("page should expose a searchable combobox with query \"territory\"", null, { page });
    });

    test("Example #9", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/trial-balance\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/trial-balance\"", null, { page });
      await Then("page should expose a searchable combobox with query \"summary\"", null, { page });
    });

    test("Example #10", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/balance-sheet\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/balance-sheet\"", null, { page });
      await Then("page should expose a searchable combobox with query \"monthly\"", null, { page });
    });

    test("Example #11", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/profit-loss\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/profit-loss\"", null, { page });
      await Then("page should expose a searchable combobox with query \"monthly\"", null, { page });
    });

    test("Example #12", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/fiscal-periods\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/fiscal-periods\"", null, { page });
      await Then("page should expose a searchable combobox with query \"period\"", null, { page });
    });

    test("Example #13", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/epd-summary\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/epd-summary\"", null, { page });
      await Then("page should expose a searchable combobox with query \"amount\"", null, { page });
    });

    test("Example #14", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/epd-calculator\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/epd-calculator\"", null, { page });
      await Then("page should expose a searchable combobox with query \"scheme\"", null, { page });
    });

    test("Example #15", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/ar-aging\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/ar-aging\"", null, { page });
      await Then("page should expose a searchable combobox with query \"bucket\"", null, { page });
    });

    test("Example #16", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/payments/create\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/payments/create\"", null, { page });
      await Then("page should expose a searchable combobox with query \"cash\"", null, { page });
    });

    test("Example #17", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/finance/ap-invoices/new\"", null, { page });
      await And("I prepare CA39 context for page \"/finance/ap-invoices/new\"", null, { page });
      await Then("page should expose a searchable combobox with query \"supplier\"", null, { page });
    });

    test("Example #18", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/o2c/audit\"", null, { page });
      await And("I prepare CA39 context for page \"/o2c/audit\"", null, { page });
      await Then("page should expose a searchable combobox with query \"status\"", null, { page });
    });

    test("Example #19", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/o2c/back-orders\"", null, { page });
      await And("I prepare CA39 context for page \"/o2c/back-orders\"", null, { page });
      await Then("page should expose a searchable combobox with query \"pending\"", null, { page });
    });

    test("Example #20", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/inventory/reports/batch-tracking\"", null, { page });
      await And("I prepare CA39 context for page \"/inventory/reports/batch-tracking\"", null, { page });
      await Then("page should expose a searchable combobox with query \"warehouse\"", null, { page });
    });

    test("Example #21", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/inventory/reports/inter-warehouse-transfer\"", null, { page });
      await And("I prepare CA39 context for page \"/inventory/reports/inter-warehouse-transfer\"", null, { page });
      await Then("page should expose a searchable combobox with query \"source\"", null, { page });
    });

    test("Example #22", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/inventory/reports/inventory-health\"", null, { page });
      await And("I prepare CA39 context for page \"/inventory/reports/inventory-health\"", null, { page });
      await Then("page should expose a searchable combobox with query \"product\"", null, { page });
    });

    test("Example #23", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/inventory/reports/stock-movement\"", null, { page });
      await And("I prepare CA39 context for page \"/inventory/reports/stock-movement\"", null, { page });
      await Then("page should expose a searchable combobox with query \"movement\"", null, { page });
    });

    test("Example #24", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/inventory/reports/inventory-ledger\"", null, { page });
      await And("I prepare CA39 context for page \"/inventory/reports/inventory-ledger\"", null, { page });
      await Then("page should expose a searchable combobox with query \"material\"", null, { page });
    });

    test("Example #25", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/crm/gamified-rebate/dashboard\"", null, { page });
      await And("I prepare CA39 context for page \"/crm/gamified-rebate/dashboard\"", null, { page });
      await Then("page should expose a searchable combobox with query \"campaign\"", null, { page });
    });

    test("Example #26", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/plant-production/quality\"", null, { page });
      await And("I prepare CA39 context for page \"/plant-production/quality\"", null, { page });
      await Then("page should expose a searchable combobox with query \"status\"", null, { page });
    });

    test("Example #27", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/admin/modules/price-lists/create\"", null, { page });
      await And("I prepare CA39 context for page \"/admin/modules/price-lists/create\"", null, { page });
      await Then("page should expose a searchable combobox with query \"currency\"", null, { page });
    });

    test("Example #28", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/admin/roles/create\"", null, { page });
      await And("I prepare CA39 context for page \"/admin/roles/create\"", null, { page });
      await Then("page should expose a searchable combobox with query \"tenant\"", null, { page });
    });

    test("Example #29", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/p2p/procurement-requests/create\"", null, { page });
      await And("I prepare CA39 context for page \"/p2p/procurement-requests/create\"", null, { page });
      await Then("page should expose a searchable combobox with query \"priority\"", null, { page });
    });

    test("Example #30", { tag: ["@CA-39-FULL", "@regression", "@p1", "@iacs-md"] }, async ({ When, page, And, Then }) => {
      await When("I open page \"/p2p/supplier-invoices/create\"", null, { page });
      await And("I prepare CA39 context for page \"/p2p/supplier-invoices/create\"", null, { page });
      await Then("page should expose a searchable combobox with query \"supplier\"", null, { page });
    });

  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("e2e/features/finance/searchable-dropdown.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "Page has at least one searchable dropdown|Example #1": {"pickleLocation":"17:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #2": {"pickleLocation":"18:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #3": {"pickleLocation":"19:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #4": {"pickleLocation":"20:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #5": {"pickleLocation":"21:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #6": {"pickleLocation":"22:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #7": {"pickleLocation":"23:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #8": {"pickleLocation":"24:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #9": {"pickleLocation":"25:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #10": {"pickleLocation":"26:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #11": {"pickleLocation":"27:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #12": {"pickleLocation":"28:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #13": {"pickleLocation":"29:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #14": {"pickleLocation":"30:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #15": {"pickleLocation":"31:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #16": {"pickleLocation":"32:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #17": {"pickleLocation":"33:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #18": {"pickleLocation":"34:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #19": {"pickleLocation":"35:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #20": {"pickleLocation":"36:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #21": {"pickleLocation":"37:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #22": {"pickleLocation":"38:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #23": {"pickleLocation":"39:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #24": {"pickleLocation":"40:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #25": {"pickleLocation":"41:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #26": {"pickleLocation":"42:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #27": {"pickleLocation":"43:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #28": {"pickleLocation":"44:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #29": {"pickleLocation":"45:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
  "Page has at least one searchable dropdown|Example #30": {"pickleLocation":"46:7","tags":["@CA-39-FULL","@regression","@p1","@iacs-md"]},
};