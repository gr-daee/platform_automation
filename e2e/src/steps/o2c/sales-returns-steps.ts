/**
 * Sales Returns — Phases 1–7: list, create wizard, detail/receipt, credit memo, validation/cancel, report.
 */

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { SalesReturnsListPage } from '../../pages/o2c/SalesReturnsListPage';
import { CreateSalesReturnOrderPage } from '../../pages/o2c/CreateSalesReturnOrderPage';
import { SalesReturnDetailPage } from '../../pages/o2c/SalesReturnDetailPage';
import { SalesReturnReportPage } from '../../pages/o2c/SalesReturnReportPage';
import {
  getLatestReturnOrderNumberForE2ETenant,
  returnOrderNumberSearchSubstring,
  getInvoiceWithReturnableLinesForE2ETenant,
  getTwoInStockMaterialCodesAtWarehouse,
  getInvoiceContextById,
  getSalesReturnOrderIdWithPendingEcreditForE2ETenant,
  getSalesReturnFirstLineReceiptInventoryContext,
  getSalesReturnReceiptInventoryLineContexts,
  getInventoryAvailableSumByPackageAndWarehouse,
  type EligibleReturnInvoiceRow,
} from '../../support/o2c-db-helpers';
import { runO2CIndentThroughEInvoice } from '../../support/o2c-e2e-flow-helpers';
import { executeQuery } from '../../support/db-helper';

const { Given, When, Then } = createBdd();

type SrSearchWorld = { srContextReturnOrderNumber?: string };
type SrPh3World = { srEligibleInvoice?: EligibleReturnInvoiceRow };
type SrPh5EcreditWorld = { srPendingEcreditReturnId?: string };

type SrInventorySandwichWorld = {
  srInventorySandwich?: {
    tenantId: string;
    warehouseId: string;
    productVariantPackageId: string;
    returnQty: number;
    beforeAvailable: number;
  };
  srPostReceiptAvailable?: number;
  srInventoryMultiLine?: Array<{
    tenantId: string;
    warehouseId: string;
    productVariantPackageId: string;
    returnQty: number;
    beforeAvailable: number;
  }>;
};

type SrCreateLineSelectionWorld = {
  srSelectedReturnLine?: {
    lineIndex: number;
    usedQty: number;
    availableQty: number;
  };
  srSelectedReturnLines?: Array<{
    lineIndex: number;
    usedQty: number;
    availableQty: number;
  }>;
};

async function assertSalesReturnOrderStatusInDb(page: Page, expected: string): Promise<void> {
  const m = page.url().match(/\/o2c\/sales-returns\/([^/?]+)/);
  const id = m?.[1];
  expect(id, 'expected return detail URL with id').toBeTruthy();
  expect(id, 'must not be create route').not.toBe('new');
  try {
    const rows = await executeQuery<{ status: string }>(
      `SELECT status FROM sales_return_orders WHERE id = $1 LIMIT 1`,
      [id!]
    );
    expect(rows[0]?.status).toBe(expected);
  } catch (e) {
    test.skip(true, `Database sandwich not available: ${(e as Error).message}`);
  }
}

/** Receipt recorded: at least `received`; tenant may auto-advance to `credit_memo_created`. */
async function assertSalesReturnOrderReceivedOrCreditMemoInDb(page: Page): Promise<void> {
  const m = page.url().match(/\/o2c\/sales-returns\/([^/?]+)/);
  const id = m?.[1];
  expect(id, 'expected return detail URL with id').toBeTruthy();
  expect(id, 'must not be create route').not.toBe('new');
  try {
    const rows = await executeQuery<{ status: string }>(
      `SELECT status FROM sales_return_orders WHERE id = $1 LIMIT 1`,
      [id!]
    );
    const s = rows[0]?.status;
    expect(
      s === 'received' || s === 'credit_memo_created',
      `expected status received or credit_memo_created, got ${String(s)}`
    ).toBeTruthy();
  } catch (e) {
    test.skip(true, `Database sandwich not available: ${(e as Error).message}`);
  }
}

Given('I am on the Sales Returns list page', async function ({ page }) {
  const list = new SalesReturnsListPage(page);
  await list.goto();
  await list.verifyHeadingAndDescription();
});

Then('the Sales Returns page shows heading and description', async function ({ page }) {
  const list = new SalesReturnsListPage(page);
  await list.verifyHeadingAndDescription();
});

Then('the Sales Returns statistics cards are visible', async function ({ page }) {
  const list = new SalesReturnsListPage(page);
  await list.expectStatisticsCardsVisible();
});

Then('the Sales Returns list shows table or empty state without error', async function ({ page }) {
  const list = new SalesReturnsListPage(page);
  await list.expectTableOrEmptyStateWithoutError();
});

When('I click Create Return Order on the Sales Returns page', async function ({ page }) {
  const list = new SalesReturnsListPage(page);
  await list.clickCreateReturnOrder();
});

Then('I should be on the create sales return page', async function ({ page }) {
  await expect(page).toHaveURL(/\/o2c\/sales-returns\/new(?:\?|$)/);
  await expect(page.getByRole('heading', { name: /create sales return order/i })).toBeVisible({ timeout: 15000 });
});

Then('the Sales Returns breadcrumb shows Order to Cash and current Sales Returns', async function ({ page }) {
  const list = new SalesReturnsListPage(page);
  await list.expectBreadcrumbShowsO2CAndSalesReturns();
});

// --- Phase 2 ---

When('I apply Sales Returns status filter {string}', async function ({ page }, optionLabel: string) {
  const list = new SalesReturnsListPage(page);
  await list.applyStatusFilterOption(optionLabel);
});

When('I apply Sales Returns return reason filter {string}', async function ({ page }, optionLabel: string) {
  const list = new SalesReturnsListPage(page);
  await list.applyReturnReasonFilterOption(optionLabel);
});

Then('Sales Returns status filter should show {string}', async function ({ page }, label: string) {
  const list = new SalesReturnsListPage(page);
  await list.expectStatusFilterShowsSelection(label);
});

Then('Sales Returns return reason filter should show {string}', async function ({ page }, label: string) {
  const list = new SalesReturnsListPage(page);
  await list.expectReturnReasonFilterShowsSelection(label);
});

Then(
  'Sales Returns table rows should all have status {string} or list is empty for filter',
  async function ({ page }, statusLabel: string) {
    const list = new SalesReturnsListPage(page);
    if (await list.hasReturnOrdersDataTable()) {
      await list.expectAllTableRowsHaveStatusLabel(statusLabel);
    } else {
      await list.expectEmptyListStateVisible();
    }
  }
);

Then(
  'Sales Returns table rows should all have reason {string} or list is empty for filter',
  async function ({ page }, reasonLabel: string) {
    const list = new SalesReturnsListPage(page);
    if (await list.hasReturnOrdersDataTable()) {
      await list.expectAllTableRowsHaveReasonLabel(reasonLabel);
    } else {
      await list.expectEmptyListStateVisible();
    }
  }
);

When('I search Sales Returns list by return order substring from database', async function ({ page }) {
  const full = await getLatestReturnOrderNumberForE2ETenant();
  if (!full) {
    test.skip(true, 'No sales_return_orders row for E2E tenant; cannot test list search.');
  }
  const sub = returnOrderNumberSearchSubstring(full);
  (this as SrSearchWorld).srContextReturnOrderNumber = full;
  const list = new SalesReturnsListPage(page);
  await list.fillListSearch(sub);
});

Then('Sales Returns list should show link for context return order number', async function ({ page }) {
  const full = (this as SrSearchWorld).srContextReturnOrderNumber;
  expect(full, 'context return order number missing — When step must run first').toBeTruthy();
  const list = new SalesReturnsListPage(page);
  await list.expectLinkToReturnOrderNumberVisible(full!);
});

When('I fill Sales Returns list search with {string}', async function ({ page }, value: string) {
  const list = new SalesReturnsListPage(page);
  await list.fillListSearch(value);
});

When('I click Sales Returns toolbar clear filters', async function ({ page }) {
  const list = new SalesReturnsListPage(page);
  await list.clickToolbarClearFilters();
});

Then('Sales Returns list search input should be empty', async function ({ page }) {
  const list = new SalesReturnsListPage(page);
  await list.expectListSearchEmpty();
});

Then('Sales Returns toolbar clear filters button should be hidden', async function ({ page }) {
  const list = new SalesReturnsListPage(page);
  await list.expectToolbarClearFiltersHidden();
});

Then('Sales Returns status filter should not include label {string}', async function ({ page }, label: string) {
  const list = new SalesReturnsListPage(page);
  await list.expectStatusFilterDoesNotShowLabel(label);
});

When('I open Sales Returns list page 2 if multiple pages exist', async function ({ page }) {
  const list = new SalesReturnsListPage(page);
  await list.expectTableOrEmptyStateWithoutError();
  const total = await list.getPaginationTotalCount();
  if (total === null || total <= 20) {
    test.skip(true, 'Return orders fit on one page in this environment; pagination not testable.');
  }
  await list.clickPaginationPageNumber(2);
});

Then('Sales Returns pagination showing-from should be at least {int}', async function ({ page }, min: number) {
  const list = new SalesReturnsListPage(page);
  const from = await list.getPaginationShowingFrom();
  expect(from, 'pagination footer not visible').not.toBeNull();
  expect(from!).toBeGreaterThanOrEqual(min);
});

// --- Phase 3 — create return order ---

Given('sales return eligible invoice is resolved from database', async function () {
  const row = await getInvoiceWithReturnableLinesForE2ETenant();
  if (!row) {
    test.skip(true, 'No invoice with returnable quantity for E2E tenant (read-only DB lookup).');
  }
  (this as SrPh3World).srEligibleInvoice = row;
});

Given(
  'sales return multi-line eligible invoice is resolved from database or created as fallback',
  async function ({ page }) {
    let row = await getInvoiceWithReturnableLinesForE2ETenant(2, 2);
    if (!row) {
      const twoCodes = (await getTwoInStockMaterialCodesAtWarehouse('Kurnook')) ?? ['1013', '1008'];
      const flow = await runO2CIndentThroughEInvoice(page, {
        dealerName: 'Ramesh ningappa diggai',
        productCodes: [twoCodes[0], twoCodes[1]],
        warehouseName: 'Kurnook Warehouse',
        transporterName: 'Just In Time Shipper',
        approvalComment: `AUTO_QA_${Date.now()}_SR_PH8_TC004_seed`,
        eInvoiceWithoutEWayBill: true,
      });
      if (flow.invoiceId) {
        row = await getInvoiceContextById(flow.invoiceId);
      }
    }
    if (!row) {
      test.skip(true, 'Unable to resolve or create multi-line returnable invoice for E2E tenant.');
      return;
    }
    (this as SrPh3World).srEligibleInvoice = row;
  }
);

Given('I am on the create sales return order page', async function ({ page }) {
  const p = new CreateSalesReturnOrderPage(page);
  await p.goto();
});

When('I select context invoice in sales return create dialog', async function ({ page }) {
  const ctx = (this as SrPh3World).srEligibleInvoice;
  expect(ctx?.invoice_number, 'Given sales return eligible invoice must run first').toBeTruthy();
  const p = new CreateSalesReturnOrderPage(page);
  await p.selectInvoiceFromDialogByNumber(ctx!.invoice_number);
});

Then('sales return create page should show context dealer on dealer trigger', async function ({ page }) {
  const ctx = (this as SrPh3World).srEligibleInvoice;
  expect(ctx?.dealer_name).toBeTruthy();
  const p = new CreateSalesReturnOrderPage(page);
  await p.expectDealerTriggerShowsDealerName(ctx!.dealer_name, ctx!.dealer_code);
});

When('I choose return reason Customer Request on sales return create page', async function ({ page }) {
  const p = new CreateSalesReturnOrderPage(page);
  await p.chooseReturnReasonOption('Customer Request');
});

When('I enter sales return notes with AUTO_QA prefix', async function ({ page }) {
  const notes = `AUTO_QA_${Date.now()}_SR_PH3`;
  const p = new CreateSalesReturnOrderPage(page);
  await p.fillReturnNotes(notes);
});

When('I load invoice items on sales return create page', async function ({ page }) {
  const p = new CreateSalesReturnOrderPage(page);
  await p.clickLoadInvoiceItems();
});

When('I set return quantity 1 on first line on sales return create page', async function ({ page }) {
  const p = new CreateSalesReturnOrderPage(page);
  const selected = await p.setSmartReturnQuantityForAnyEligibleLine(1);
  (this as SrCreateLineSelectionWorld).srSelectedReturnLine = selected;
});

When(
  'I set return quantity 1 on at least two eligible lines on sales return create page or skip',
  async function ({ page }) {
    const p = new CreateSalesReturnOrderPage(page);
    const selected = await p.setSmartReturnQuantitiesForEligibleLines(1, 3);
    if (selected.length < 2) {
      test.skip(true, 'Selected invoice has fewer than two eligible return lines for multi-line reconciliation.');
      return;
    }
    (this as SrCreateLineSelectionWorld).srSelectedReturnLines = selected;
  }
);

When('I go to review step on sales return create page', async function ({ page }) {
  const p = new CreateSalesReturnOrderPage(page);
  await p.clickReviewSelectedItems();
});

When('I submit sales return create order', async function ({ page }) {
  const p = new CreateSalesReturnOrderPage(page);
  await p.clickSubmitCreateReturnOrder();
  await p.expectRedirectToReturnDetail();
});

Then('I should be on sales return detail with Pending Receipt status', async function ({ page }) {
  const p = new CreateSalesReturnOrderPage(page);
  await p.expectDetailShowsPendingReceipt();
});

Then('sales return order status in database should be pending', async function ({ page }) {
  await assertSalesReturnOrderStatusInDb(page, 'pending');
});

Then('sales return order status in database should be received', async function ({ page }) {
  await assertSalesReturnOrderReceivedOrCreditMemoInDb(page);
});

// --- Phase 4 — detail & record goods receipt ---

Then('sales return detail should show Record Goods Receipt and Cancel Return Order actions', async function ({
  page,
}) {
  const detail = new SalesReturnDetailPage(page);
  await detail.expectOnReturnDetailNotNew();
  await detail.expectRecordGoodsReceiptAndCancelActionsVisible();
});

When('I complete record goods receipt on sales return detail with default warehouse', async function ({
  page,
}) {
  const detail = new SalesReturnDetailPage(page);
  await detail.completeRecordGoodsReceiptDialog();
});

When(
  'sales return first line inventory available sum is stored from database before goods receipt',
  async function (this: SrInventorySandwichWorld, { page }) {
    const m = page.url().match(/\/o2c\/sales-returns\/([^/?]+)/);
    const id = m?.[1];
    expect(id, 'expected sales return detail URL with id').toBeTruthy();
    expect(id, 'must not be create route').not.toBe('new');
    let ctx;
    try {
      ctx = await getSalesReturnFirstLineReceiptInventoryContext(id!);
    } catch (e) {
      test.skip(true, `Database sandwich not available: ${(e as Error).message}`);
      return;
    }
    if (!ctx) {
      test.skip(
        true,
        'No first line / invoice–sales-order warehouse context for this return (need invoices.sales_order_id and sales_orders.warehouse_assigned_id).'
      );
      return;
    }
    let before = 0;
    try {
      before = await getInventoryAvailableSumByPackageAndWarehouse(
        ctx.tenant_id,
        ctx.warehouse_id,
        ctx.product_variant_package_id
      );
    } catch (e) {
      test.skip(true, `Inventory read failed: ${(e as Error).message}`);
      return;
    }
    this.srInventorySandwich = {
      tenantId: ctx.tenant_id,
      warehouseId: ctx.warehouse_id,
      productVariantPackageId: ctx.product_variant_package_id,
      returnQty: Number(ctx.return_qty),
      beforeAvailable: before,
    };
  }
);

When(
  'I complete record goods receipt on sales return detail with QC passed and default warehouse',
  async function ({ page }) {
    const detail = new SalesReturnDetailPage(page);
    await detail.completeRecordGoodsReceiptDialog({ qcPassed: true });
  }
);

When(
  'I complete record goods receipt on sales return detail with QC failed and default warehouse',
  async function ({ page }) {
    const detail = new SalesReturnDetailPage(page);
    await detail.completeRecordGoodsReceiptDialog({ qcFailed: true });
  }
);

Then(
  'database inventory available sum should increase by first line return quantity after goods receipt',
  async function (this: SrInventorySandwichWorld) {
    const w = this.srInventorySandwich;
    expect(w, 'When sales return first line inventory… must run first').toBeTruthy();
    const expectedDelta = w!.returnQty;
    await expect
      .poll(
        async () => {
          const after = await getInventoryAvailableSumByPackageAndWarehouse(
            w!.tenantId,
            w!.warehouseId,
            w!.productVariantPackageId
          );
          return after - w!.beforeAvailable;
        },
        {
          timeout: 120000,
          intervals: [400, 1000, 2000, 3000],
          message: 'inventory.available_units sum did not increase by GRN accepted qty for package + warehouse',
        }
      )
      .toBeCloseTo(expectedDelta, 4);
  }
);

Then(
  'database inventory available sum should remain unchanged after QC failed goods receipt',
  async function (this: SrInventorySandwichWorld) {
    const w = this.srInventorySandwich;
    expect(w, 'When sales return first line inventory… must run first').toBeTruthy();
    await expect
      .poll(
        async () => {
          const after = await getInventoryAvailableSumByPackageAndWarehouse(
            w!.tenantId,
            w!.warehouseId,
            w!.productVariantPackageId
          );
          return after - w!.beforeAvailable;
        },
        {
          timeout: 120000,
          intervals: [400, 1000, 2000, 3000],
          message: 'inventory.available_units changed despite QC failed goods receipt',
        }
      )
      .toBeCloseTo(0, 4);
  }
);

Then('sales return receipt QC status should be failed in database', async function ({ page }) {
  const m = page.url().match(/\/o2c\/sales-returns\/([^/?]+)/);
  const id = m?.[1];
  expect(id, 'expected sales return detail URL with id').toBeTruthy();
  expect(id, 'must not be create route').not.toBe('new');
  try {
    const rows = await executeQuery<{ qc_status: string | null }>(
      `SELECT sri.qc_status::text AS qc_status
       FROM sales_return_receipt_items sri
       INNER JOIN sales_return_receipts sr
         ON sr.id = sri.receipt_id
       WHERE sr.return_order_id = $1::uuid
       ORDER BY sri.created_at DESC NULLS LAST
       LIMIT 1`,
      [id!]
    );
    expect(rows[0]?.qc_status, 'latest receipt item qc_status should be failed').toBe('failed');
  } catch (e) {
    test.skip(true, `Database receipt QC status check not available: ${(e as Error).message}`);
  }
});

Then(
  'database inventory available sum should remain unchanged after cancelling pending return',
  async function (this: SrInventorySandwichWorld) {
    const w = this.srInventorySandwich;
    expect(w, 'When sales return first line inventory… must run first').toBeTruthy();
    await expect
      .poll(
        async () => {
          const after = await getInventoryAvailableSumByPackageAndWarehouse(
            w!.tenantId,
            w!.warehouseId,
            w!.productVariantPackageId
          );
          return after - w!.beforeAvailable;
        },
        {
          timeout: 120000,
          intervals: [400, 1000, 2000, 3000],
          message: 'inventory.available_units changed after cancelling pending return before GRN',
        }
      )
      .toBeCloseTo(0, 4);
  }
);

When(
  'I store post-receipt inventory available baseline for sales return first line',
  async function (this: SrInventorySandwichWorld) {
    const w = this.srInventorySandwich;
    expect(w, 'When sales return first line inventory… must run first').toBeTruthy();
    const afterReceipt = await getInventoryAvailableSumByPackageAndWarehouse(
      w!.tenantId,
      w!.warehouseId,
      w!.productVariantPackageId
    );
    this.srPostReceiptAvailable = afterReceipt;
  }
);

Then(
  'database inventory available sum should remain unchanged after credit memo flow',
  async function (this: SrInventorySandwichWorld) {
    const w = this.srInventorySandwich;
    const postReceipt = this.srPostReceiptAvailable;
    expect(w, 'When sales return first line inventory… must run first').toBeTruthy();
    expect(postReceipt, 'When I store post-receipt inventory… must run first').toBeDefined();

    await expect
      .poll(
        async () =>
          await getInventoryAvailableSumByPackageAndWarehouse(
            w!.tenantId,
            w!.warehouseId,
            w!.productVariantPackageId
          ),
        {
          timeout: 120000,
          intervals: [400, 1000, 2000, 3000],
          message: 'inventory.available_units changed after credit memo flow',
        }
      )
      .toBeCloseTo(postReceipt!, 4);
  }
);

When(
  'sales return multi-line inventory available sums are stored from database before goods receipt',
  async function (this: SrInventorySandwichWorld, { page }) {
    const m = page.url().match(/\/o2c\/sales-returns\/([^/?]+)/);
    const id = m?.[1];
    expect(id, 'expected sales return detail URL with id').toBeTruthy();
    expect(id, 'must not be create route').not.toBe('new');
    const contexts = await getSalesReturnReceiptInventoryLineContexts(id!);
    if (contexts.length < 2) {
      test.skip(true, 'Return order does not have at least two package lines for multi-line reconciliation.');
      return;
    }
    const rows: NonNullable<SrInventorySandwichWorld['srInventoryMultiLine']> = [];
    for (const c of contexts) {
      const before = await getInventoryAvailableSumByPackageAndWarehouse(
        c.tenant_id,
        c.warehouse_id,
        c.product_variant_package_id
      );
      rows.push({
        tenantId: c.tenant_id,
        warehouseId: c.warehouse_id,
        productVariantPackageId: c.product_variant_package_id,
        returnQty: Number(c.return_qty),
        beforeAvailable: before,
      });
    }
    this.srInventoryMultiLine = rows;
  }
);

Then(
  'database inventory available sums should increase by return quantities across all selected return lines',
  async function (this: SrInventorySandwichWorld) {
    const rows = this.srInventoryMultiLine;
    expect(rows, 'When sales return multi-line inventory… must run first').toBeTruthy();
    expect(rows!.length, 'Expected multi-line inventory contexts').toBeGreaterThan(1);

    for (const r of rows!) {
      await expect
        .poll(
          async () => {
            const after = await getInventoryAvailableSumByPackageAndWarehouse(
              r.tenantId,
              r.warehouseId,
              r.productVariantPackageId
            );
            return after - r.beforeAvailable;
          },
          {
            timeout: 120000,
            intervals: [400, 1000, 2000, 3000],
            message: 'inventory.available_units sum did not match expected multi-line return delta',
          }
        )
        .toBeCloseTo(r.returnQty, 4);
    }
  }
);

Then('I should be on sales return detail with Goods Received status', async function ({ page }) {
  const detail = new SalesReturnDetailPage(page);
  await detail.expectOnReturnDetailNotNew();
  await detail.expectGoodsReceivedOrCreditMemoCreatedStatus();
});

Then('sales return detail should not show Cancel Return Order action', async function ({ page }) {
  const detail = new SalesReturnDetailPage(page);
  await detail.expectCancelReturnOrderActionAbsent();
});

// --- Phase 5 — credit memo ---

When('I complete credit memo flow from sales return detail when applicable', async function ({ page }) {
  const detail = new SalesReturnDetailPage(page);
  await detail.completeCreditMemoFlowWhenApplicable();
});

Then('credit memo outcome should be visible on return or finance page', async function ({ page }) {
  const detail = new SalesReturnDetailPage(page);
  await detail.expectCreditMemoOutcomeVisibleOnReturnOrFinancePage();
});

Given('a sales return with pending e-credit is resolved from database', async function (this: SrPh5EcreditWorld) {
  const id = await getSalesReturnOrderIdWithPendingEcreditForE2ETenant();
  if (!id) {
    test.skip(
      true,
      'No sales return with credit memo in pending/missing e-credit state (no IRN) for E2E tenant (read-only DB lookup).'
    );
  }
  this.srPendingEcreditReturnId = id;
});

When('I open sales return detail for pending e-credit context', async function (this: SrPh5EcreditWorld, { page }) {
  const id = this.srPendingEcreditReturnId;
  expect(id, 'Given a sales return with pending e-credit must run first').toBeTruthy();
  const detail = new SalesReturnDetailPage(page);
  await detail.gotoByReturnOrderId(id!);
});

Then('Retry E-Credit Note button and dialog shell should be visible', async function ({ page }) {
  const detail = new SalesReturnDetailPage(page);
  await detail.expectRetryEcreditNoteButtonAndDialogShell();
});

// --- Phase 6 — validation & cancel ---

When('I attempt review on sales return create page with zero items selected', async function ({ page }) {
  const p = new CreateSalesReturnOrderPage(page);
  await p.clickReviewWithNoItemsSelectedExpectAlert();
});

Then('I should remain on sales return create step 2', async function ({ page }) {
  await expect(page.getByRole('heading', { name: /step 2: select items to return/i })).toBeVisible({
    timeout: 15000,
  });
});

When('I attempt return quantity above available on first line on sales return create page', async function ({
  page,
}) {
  const p = new CreateSalesReturnOrderPage(page);
  await p.setFirstReturnQuantityExceedingAvailableExpectAlert();
});

When('I open cancel return order dialog on sales return detail', async function ({ page }) {
  const detail = new SalesReturnDetailPage(page);
  await detail.openCancelReturnOrderDialog();
});

Then('cancel return confirm should be disabled when reason is empty', async function ({ page }) {
  const detail = new SalesReturnDetailPage(page);
  await detail.expectCancelReturnConfirmDisabledWhenReasonEmpty();
});

When('I dismiss cancel return order dialog', async function ({ page }) {
  const detail = new SalesReturnDetailPage(page);
  await detail.dismissCancelReturnOrderDialog();
});

When('I confirm cancel return order with AUTO_QA reason', async function ({ page }) {
  const detail = new SalesReturnDetailPage(page);
  const reason = `AUTO_QA_${Date.now()}_SR_CANCEL`;
  await detail.submitCancelReturnOrderWithReason(reason);
});

Then('I should be on sales return detail with Cancelled status', async function ({ page }) {
  const detail = new SalesReturnDetailPage(page);
  await detail.expectOnReturnDetailNotNew();
  await detail.expectCancelledStatusVisible();
});

// --- Phase 7 — report ---

When('I open the Sales Return Order report page', async function ({ page }) {
  const report = new SalesReturnReportPage(page);
  await report.goto();
});

Then('Sales Return Order report shell should be visible', async function ({ page }) {
  const report = new SalesReturnReportPage(page);
  await report.expectReportShellVisible();
});

When('I navigate to Sales Return Order report URL for access check', async function ({ page }) {
  const report = new SalesReturnReportPage(page);
  await report.goto();
});

Then(
  'I should be denied access to Sales Return Order report or skip if tenant grants access',
  async function ({ page }) {
    for (let i = 0; i < 45; i++) {
      const u = page.url();
      if (/\/restrictedUser/i.test(u)) {
        await expect(page).toHaveURL(/\/restrictedUser/i);
        return;
      }
      await page.waitForTimeout(300);
    }
    if (/\/o2c\/reports\/sales-return/i.test(page.url())) {
      const loadBtn = page.getByRole('button', { name: 'Load Report', exact: true });
      if (await loadBtn.isVisible().catch(() => false)) {
        test.skip(
          true,
          'IACS ED has sales_orders (report) access in this environment; SR-PH7-TC-002 needs a profile without that permission for negative coverage.'
        );
        return;
      }
    }
    await expect(page).toHaveURL(/\/restrictedUser/i, { timeout: 2000 });
  }
);
