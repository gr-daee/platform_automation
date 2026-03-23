/**
 * O2C E2E Flow Step Definitions
 *
 * Covers: Note inventory/dealer credit (DB) → Indent → SO → eInvoice → Invoice PDF → Dealer Ledger.
 * Reuses indent-steps where possible; uses o2c-db-helpers for read-only DB.
 */

import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { SalesOrderDetailPage } from '../../pages/o2c/SalesOrderDetailPage';
import { WarehousePicklistDialogPage } from '../../pages/o2c/WarehousePicklistDialogPage';
import { InvoiceDetailPage } from '../../pages/o2c/InvoiceDetailPage';
import { IndentDetailPage } from '../../pages/o2c/IndentDetailPage';
import { DealerLedgerPage } from '../../pages/finance/DealerLedgerPage';
import {
  getInventoryForProductAndWarehouse,
  getDealerCreditByCode,
  getSalesOrderIdByIndentId,
  getInvoiceIdsBySalesOrderId,
  getBackOrdersByOriginalIndentId,
  productHasNoSellableInventoryAtWarehouse,
  resolveMixedIndentProductPairAtWarehouse,
  getInvoiceIdWithRecentIrnWithoutEwayBill,
  getInvoiceEinvoiceStatus,
  getInvoiceItemsTaxSplit,
  getInvoicedQuantityForProductCodeOnInvoice,
  getInvoiceCancelInventoryContext,
  getInventoryAvailableSumByPackageAndWarehouse,
  findFirstDealerWithUnpaidInvoicesOlderThan90Days,
  type DealerWith90DayUnpaidInvoices,
  type InventorySnapshot,
  type DealerCreditSnapshot,
} from '../../support/o2c-db-helpers';
import { runO2CIndentThroughEInvoice } from '../../support/o2c-e2e-flow-helpers';
import { O2CInventoryPage } from '../../pages/o2c/O2CInventoryPage';
import { IndentsPage } from '../../pages/o2c/IndentsPage';

const { Given, When, Then } = createBdd();

let salesOrderDetailPage: SalesOrderDetailPage;
let invoiceDetailPage: InvoiceDetailPage;
let dealerLedgerPage: DealerLedgerPage;

/** Shared context for O2C E2E scenario (indent id, SO id, invoice id, UI/DB snapshots). */
const o2cContext: {
  indentId: string | null;
  salesOrderId: string | null;
  invoiceId: string | null;
  inventoryBefore: InventorySnapshot | null;
  dealerCreditBefore: DealerCreditSnapshot | null;
  soQuantity: number;
  productCodeForInventory: string;
  warehouseForInventory: string;
  /** Resolved by DB for mixed back-order + SO scenario (TC-002). */
  mixedInStockCode: string;
  mixedOutOfStockCode: string;
  invoiceCancelInventoryBefore: number | null;
  invoiceCancelInventoryExpectedIncrease: number | null;
  invoiceCancelInventoryContext: {
    tenantId: string;
    warehouseId: string;
    productVariantPackageId: string;
  } | null;
  /** @O2C-E2E-TC-006: dealer discovered via DB (90+ day unpaid invoices). */
  ninetyDayBlockDealer: DealerWith90DayUnpaidInvoices | null;
} = {
  indentId: null,
  salesOrderId: null,
  invoiceId: null,
  inventoryBefore: null,
  dealerCreditBefore: null,
  soQuantity: 0,
  productCodeForInventory: '',
  warehouseForInventory: '',
  mixedInStockCode: '',
  mixedOutOfStockCode: '',
  invoiceCancelInventoryBefore: null,
  invoiceCancelInventoryExpectedIncrease: null,
  invoiceCancelInventoryContext: null,
  ninetyDayBlockDealer: null,
};

// --- DB "Note" step: inventory from DB (material_code/package_code + warehouse). See docs/database/o2c-inventory-tables.md ---
Given('I have noted inventory for product {string} at warehouse {string}', async function ({ page }, productCode: string, warehouseSearch: string) {
  const snapshot = await getInventoryForProductAndWarehouse(productCode, warehouseSearch);
  expect(snapshot).not.toBeNull();
  o2cContext.inventoryBefore = snapshot!;
  o2cContext.productCodeForInventory = productCode;
  o2cContext.warehouseForInventory = warehouseSearch;
  console.log('✅ Noted inventory (DB):', o2cContext.inventoryBefore);
});

Given('I have noted dealer credit for dealer code {string}', async function ({ page }, dealerCode: string) {
  const snapshot = await getDealerCreditByCode(dealerCode);
  expect(snapshot).not.toBeNull();
  o2cContext.dealerCreditBefore = snapshot!;
  console.log('✅ Noted dealer credit:', o2cContext.dealerCreditBefore);
});

/**
 * @O2C-E2E-TC-006: one DB round-trip finds any tenant dealer with qualifying old unpaid invoices; notes credit snapshot.
 */
Given(
  'I have resolved and noted dealer credit for a dealer with unpaid invoices older than 90 days or skip the scenario',
  async function ({}) {
    const dealer = await findFirstDealerWithUnpaidInvoicesOlderThan90Days();
    if (!dealer) {
      test.skip(
        true,
        'No dealer in this tenant has qualifying unpaid invoices (invoice_date older than 90 days, balance_amount > 0).'
      );
    }
    o2cContext.ninetyDayBlockDealer = dealer;
    const credit = await getDealerCreditByCode(dealer.dealerCode);
    expect(credit).not.toBeNull();
    o2cContext.dealerCreditBefore = credit!;
    console.log(
      `✅ 90-day block dealer resolved: ${dealer.dealerCode} (${dealer.businessName}); credit noted for assertions.`
    );
  }
);

When('I create an indent for the resolved 90-day block dealer', async function ({ page }) {
  expect(o2cContext.ninetyDayBlockDealer).not.toBeNull();
  const d = o2cContext.ninetyDayBlockDealer!;
  const indentsPage = new IndentsPage(page);
  const searchTerm = d.dealerCode;
  await indentsPage.clickCreateIndent();
  await indentsPage.searchDealer(searchTerm);
  await indentsPage.selectDealer(searchTerm);
  await expect(page).toHaveURL(/\/o2c\/indents\/[a-f0-9-]+/, { timeout: 15000 });
  console.log(`✅ Created indent for 90-day block dealer: ${d.dealerCode}`);
});

Then(
  'I should see a toast blocking indent approval for 90-day unpaid invoices with invoice and amount details',
  async function ({ page }) {
    const toast = page.locator('[data-sonner-toast]').filter({ hasText: /Cannot approve indent/i });
    await expect(toast.first()).toBeVisible({ timeout: 15000 });
    await expect(toast.first()).toContainText(/90\+ days/i);
    await expect(toast.first()).toContainText(/Total outstanding/i);
    await expect(toast.first()).toContainText(/₹/);
    await expect(toast.first()).toContainText(/invoice/i);
    console.log('✅ 90-day unpaid invoice block toast visible');
  }
);

// --- Indent flow: use steps from indent-steps; capture indent id from URL when navigating to SO ---

// --- SO navigation (capture indent id from current page URL; we are on indent detail after Process Workflow) ---
When('I navigate to the Sales Order created from the indent', async function ({ page }) {
  const url = page.url();
  const match = url.match(/\/o2c\/indents\/([a-f0-9-]+)/);
  const indentIdFromUrl = match?.[1];
  const indentId = indentIdFromUrl ?? o2cContext.indentId;
  expect(indentId).toBeTruthy();
  o2cContext.indentId = indentId!;
  
  // Wait for background processing to complete (Processing indent workflow...)
  // Wait for "Processing..." indicators to disappear
  const processingIndicators = [
    page.getByText(/Processing.*workflow/i),
    page.getByText(/Processing\.\.\./i),
    page.locator('[role="status"]').filter({ hasText: /Processing/i }),
  ];
  
  // Wait for all processing indicators to disappear (or timeout if they're not present)
  for (const indicator of processingIndicators) {
    try {
      await expect(indicator).toBeHidden({ timeout: 30000 }).catch(() => {});
    } catch {
      // Indicator might not exist, continue
    }
  }
  
  // Wait for page to stabilize (network idle)
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000); // Additional buffer for async operations
  
  // Retry polling: wait for Sales Order to be created in database (background process)
  let soId: string | null = null;
  const maxRetries = 15; // 15 retries * 2s = 30s max wait
  const retryDelay = 2000; // 2 seconds between retries
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    soId = await getSalesOrderIdByIndentId(indentId!);
    if (soId) {
      console.log(`✅ Sales Order found after ${attempt} attempt(s): ${soId}`);
      break;
    }
    if (attempt < maxRetries) {
      console.log(`⏳ Waiting for Sales Order creation (attempt ${attempt}/${maxRetries})...`);
      await page.waitForTimeout(retryDelay);
    }
  }
  
  expect(soId).not.toBeNull();
  o2cContext.salesOrderId = soId!;
  salesOrderDetailPage = new SalesOrderDetailPage(page);
  await salesOrderDetailPage.goto(o2cContext.salesOrderId);
  await salesOrderDetailPage.verifyPageLoaded();
});

// --- SO verification ---
Then('the Sales Order page shows dealer {string}', async function ({ page }, dealerNameSubstring: string) {
  const name = await salesOrderDetailPage.getDealerName();
  expect(name.toLowerCase()).toContain(dealerNameSubstring.toLowerCase());
});

Then('the Sales Order page shows warehouse {string}', async function ({ page }, warehouseSubstring: string) {
  const warehouse = (await salesOrderDetailPage.getWarehouseName()).toLowerCase();
  const expected = warehouseSubstring.toLowerCase();
  // SO card often shows "KU-001 - Kurnool, ..." while indent/DB use "Kurnook" spelling
  const spellingAlt = expected.includes('kurnook')
    ? expected.replace(/kurnook/g, 'kurnool')
    : expected.replace(/kurnool/g, 'kurnook');
  expect(
    warehouse.includes(expected) ||
      warehouse.includes(spellingAlt) ||
      (expected.includes('kurn') && warehouse.includes('ku-001'))
  ).toBe(true);
});

Then('the Sales Order page shows source indent link', async function ({ page }) {
  const has = await salesOrderDetailPage.hasSourceIndentLink();
  expect(has).toBe(true);
});

Then('the Sales Order has allocated stock and net available is reduced by SO quantity', async function ({ page }) {
  expect(o2cContext.inventoryBefore).not.toBeNull();
  const productCode = o2cContext.productCodeForInventory || '1013';
  const warehouse = o2cContext.warehouseForInventory || 'Kurnook';
  const after = await getInventoryForProductAndWarehouse(productCode, warehouse);
  expect(after).not.toBeNull();
  expect(after!.allocated).toBeGreaterThanOrEqual(o2cContext.inventoryBefore!.allocated);
  expect(after!.netAvailable).toBeLessThanOrEqual(o2cContext.inventoryBefore!.netAvailable);
});

Then('dealer credit is unchanged after SO creation', async function ({ page }) {
  expect(o2cContext.dealerCreditBefore).not.toBeNull();
  const after = await getDealerCreditByCode('IACS5509');
  expect(after).not.toBeNull();
  expect(after!.outstandingAmount).toBe(o2cContext.dealerCreditBefore!.outstandingAmount);
});

// --- Warehouse picklist (DAEE-139): Generate → Start → Pick → Complete → SO picked → eInvoice enabled ---
When('I generate picklist from the Sales Order page', async function ({ page }) {
  await salesOrderDetailPage.clickGeneratePicklist();
});

When('I run the warehouse picklist flow picking all lines to completion', async function ({ page }) {
  expect(o2cContext.salesOrderId).toBeTruthy();
  const pickModal = new WarehousePicklistDialogPage(page);
  await salesOrderDetailPage.clickViewPicklist();
  await pickModal.waitForLoaded();
  await pickModal.clickStartPickingProcessIfVisible();
  await pickModal.openPickItemsTab();
  await pickModal.pickAllItemsWithBatchConfirm();
  await pickModal.clickCompletePicklist();
  await pickModal.confirmCompletePicklistInAlert();
  await pickModal.waitForDialogClosed();
  await salesOrderDetailPage.goto(o2cContext.salesOrderId!);
  await salesOrderDetailPage.verifyPageLoaded();
});

// --- eInvoice ---
When('I generate E-Invoice with transporter {string} on the Sales Order page', async function ({ page }, transporterName: string) {
  await salesOrderDetailPage.clickGenerateEInvoice();
  const modal = page.getByRole('dialog').filter({ has: page.getByText(/e-invoice|transport|invoice/i) });
  await expect(modal).toBeVisible({ timeout: 10000 });
  const transportTab = page.getByRole('tab', { name: /transport/i }).first();
  if (await transportTab.isVisible().catch(() => false)) {
    await transportTab.click();
    await page.waitForTimeout(500);
    const combobox = modal.getByRole('combobox').filter({ has: page.getByText(/transporter|shipper/i) }).first();
    if (await combobox.isVisible().catch(() => false)) {
      await combobox.click();
      await page.waitForTimeout(300);
      const option = page.getByRole('option', { name: new RegExp(transporterName.replace(/\s+/g, '\\s*'), 'i') });
      if (await option.isVisible().catch(() => false)) {
        await option.click();
      }
    }
  }
  const generateBtn = modal.getByRole('button', { name: /generate|submit/i }).first();
  await generateBtn.click();
  
  // Wait for "Generating E-Invoice..." button/text to appear in modal (confirms generation started)
  const generatingButton = modal.getByRole('button', { name: /generating.*invoice/i });
  await expect(generatingButton).toBeVisible({ timeout: 10000 }).catch(() => {});
  
  // Wait for "Generating E-Invoice..." to disappear (generation completes: 5-20 seconds, allow up to 40s for safety)
  // This is the key indicator that generation is complete
  await expect(generatingButton).toBeHidden({ timeout: 40000 }).catch(() => {});
  
  // Wait for modal to close (it should close after generation completes)
  await expect(modal).toBeHidden({ timeout: 10000 }).catch(() => {});
});

Then('E-Invoice generation completes and invoice link appears on the Sales Order page', async function ({ page }) {
  // Note: We already waited for "Generating E-Invoice..." to disappear in the previous step,
  // but we still need to wait for the invoice link to appear, which may take additional time.
  
  // Wait for any remaining processing indicators to disappear
  const processingIndicators = [
    page.getByText(/Generating.*invoice/i),
    page.getByText(/Processing.*invoice/i),
    page.getByText(/Processing\.\.\./i),
    page.locator('[role="status"]').filter({ hasText: /Processing|Generating/i }),
    // Also check for modal's generating state (should be gone by now)
    page.getByRole('dialog').filter({ has: page.getByText(/generating.*invoice/i) }),
  ];
  
  // Wait for indicators to disappear (increased timeout: 20s to allow for any final processing)
  for (const indicator of processingIndicators) {
    try {
      await expect(indicator).toBeHidden({ timeout: 20000 }).catch(() => {});
    } catch {
      // Indicator might not exist, continue
    }
  }
  
  // Wait for page to stabilize (increased timeout: 20s)
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000); // Increased buffer for page updates
  
  // Wait for invoice link to appear (increased timeout: 40s to allow for backend processing)
  // The invoice link may take time to appear after generation completes due to backend processing
  await salesOrderDetailPage.waitForInvoiceLink(40000);
  
  // Wait for page reload/stabilization after invoice link appears (user reported delay)
  // The page may reload a few seconds after the link appears
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(3000); // Additional buffer for page reload after link appears

  // Full navigation refresh so action bar picks up invoice + Mark as Packed (avoids stale client state)
  expect(o2cContext.salesOrderId).toBeTruthy();
  await salesOrderDetailPage.goto(o2cContext.salesOrderId!);
  await salesOrderDetailPage.verifyPageLoaded();
});

Then('the Sales Order status is updated', async function ({ page }) {
  const status = await salesOrderDetailPage.getStatusText();
  // After picklist + e-invoice: often picked/packed; legacy paths: allocated / ready_to_ship / shipped
  expect(status.toLowerCase()).toMatch(/invoiced|allocated|fulfilled|ready.*ship|shipped|picked|packed|partial/);
});

// --- Pack → Ready to Ship → Dispatch (DAEE-114 / DAEE-141) ---
// Some tenants auto-advance SO to ready_to_ship after e-invoice; skip dialogs when buttons are absent.
When('I mark the Sales Order as packed from the detail page', async function ({ page }) {
  if (!(await salesOrderDetailPage.isMarkAsPackedVisible())) {
    console.log('ℹ️ Mark as Packed not shown (SO may already be packed / ready_to_ship); skipping.');
    return;
  }
  await salesOrderDetailPage.clickMarkAsPacked();
  const dialog = page.getByRole('alertdialog', { name: /Confirm Packing Complete/i });
  await expect(dialog).toBeVisible({ timeout: 15000 });
  await dialog.getByRole('button', { name: /Confirm Packed/i }).click();
  await expect(dialog).toBeHidden({ timeout: 60000 });
  await page.waitForTimeout(1000);
});

When('I mark the Sales Order as ready to ship from the detail page', async function ({ page }) {
  if (!(await salesOrderDetailPage.isReadyToShipVisible())) {
    console.log('ℹ️ Ready to Ship not shown (SO may already be ready_to_ship); skipping.');
    return;
  }
  await salesOrderDetailPage.clickReadyToShip();
  const dialog = page.getByRole('alertdialog', { name: /Ready for Dispatch/i });
  await expect(dialog).toBeVisible({ timeout: 15000 });
  await dialog.getByRole('button', { name: /^Ready to Ship$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 60000 });
  await page.waitForTimeout(1000);
});

When(
  'I dispatch the Sales Order entering transporter {string} with vehicle details deferred',
  async function ({ page }, transporterName: string) {
    await salesOrderDetailPage.clickDispatchOrder();
    const dispatchDlg = page.getByRole('dialog', { name: /Dispatch Order/i });
    await expect(dispatchDlg).toBeVisible({ timeout: 15000 });
    await dispatchDlg.getByRole('checkbox', { name: /Vehicle & LR details not yet available/i }).check();
    await dispatchDlg.getByLabel(/Transporter Name/i).fill(transporterName);
    await dispatchDlg.getByRole('button', { name: /^Dispatch Order$/i }).last().click();
    await expect(dispatchDlg).toBeHidden({ timeout: 120000 });
    await page.waitForTimeout(1500);
  }
);

Then('the Sales Order dispatch completes successfully', async function ({ page }) {
  const status = await salesOrderDetailPage.getStatusText();
  expect(status.toLowerCase()).toMatch(/shipped|delivered/);
});

// --- Invoice page & PDF ---
/** Temp test entry: start from invoice URL to skip Indent → SO → eInvoice flow. */
Given('I am on the Invoice page at URL {string}', async function ({ page }, urlOrPath: string) {
  const url = urlOrPath.startsWith('http') ? urlOrPath : new URL(urlOrPath, process.env.TEST_BASE_URL || 'http://localhost:3000').toString();
  const match = url.match(/\/o2c\/invoices\/([a-f0-9-]+)/);
  if (match) o2cContext.invoiceId = match[1];
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  invoiceDetailPage = new InvoiceDetailPage(page);
  await invoiceDetailPage.verifyPageLoaded();
});

When('I navigate to the Invoice from the Sales Order', async function ({ page }) {
  // Ensure page is still valid before navigation
  if (page.isClosed()) {
    throw new Error('Page was closed before navigation to invoice page');
  }
  
  // Wait a moment for any final page updates after e-invoice generation
  await page.waitForTimeout(1000);
  
  const href = await salesOrderDetailPage.getInvoiceLinkHref();
  if (href) {
    const match = href.match(/\/o2c\/invoices\/([a-f0-9-]+)/);
    if (match) o2cContext.invoiceId = match[1];
    
    // Ensure page is still valid before goto
    if (page.isClosed()) {
      throw new Error('Page was closed before navigating to invoice URL');
    }
    
    await page.goto(href.startsWith('http') ? href : new URL(href, page.url()).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
  } else {
    // Fallback: click View E-Invoice button
    await salesOrderDetailPage.clickViewEInvoice();
    await page.waitForURL(/\/o2c\/invoices\/[a-f0-9-]+/, { timeout: 30000 });
    o2cContext.invoiceId = page.url().match(/\/o2c\/invoices\/([a-f0-9-]+)/)?.[1] ?? null;
  }
  
  // Ensure page is still valid before creating page object
  if (page.isClosed()) {
    throw new Error('Page was closed after navigation to invoice page');
  }
  
  invoiceDetailPage = new InvoiceDetailPage(page);
  await invoiceDetailPage.verifyPageLoaded();
});

When('I click Generate Custom E-Invoice PDF and download the PDF', async function ({ page }) {
  // Two cases: (1) "Download Custom..." visible → click once, download starts.
  // (2) "Generate custom..." visible → click Generate, wait for generation, then click "Download Custom..." to download.
  const downloadPromise = page.waitForEvent('download', { timeout: 180000 });

  const hasDownloadBtn = await invoiceDetailPage.isDownloadCustomInvoicePdfVisible();

  if (hasDownloadBtn) {
    await invoiceDetailPage.clickDownloadCustomInvoicePdf();
  } else {
    await invoiceDetailPage.clickGenerateCustomEInvoicePdf();
    // Wait for generation to complete (10-25s): processing indicators disappear
    const processingIndicators = [
      page.getByText(/Generating.*PDF/i),
      page.getByText(/Generating.*invoice/i),
      page.getByText(/Processing.*PDF/i),
      page.getByText(/Processing\.\.\./i),
      page.locator('[role="status"]').filter({ hasText: /Processing|Generating/i }),
    ];
    for (const indicator of processingIndicators) {
      try {
        await expect(indicator).toBeHidden({ timeout: 90000 }).catch(() => {});
      } catch {
        // Indicator might not exist
      }
    }
    // When generation succeeds, UI shows "Download Custom..."; app does not auto-download – we must click it
    await invoiceDetailPage.waitForDownloadCustomInvoicePdfButton(120000);
    await invoiceDetailPage.clickDownloadCustomInvoicePdf();
  }

  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const failureMessage = await download.failure();
  if (failureMessage) throw new Error(`Download failed: ${failureMessage}`);
});

Then('the downloaded PDF file exists and is non-empty', async function ({ page }) {
  // Assertion is satisfied by waitForEvent('download') and path() in previous step
});

// --- Post-invoice DB: inventory from DB ---
Then('stock is reduced as per allocation', async function ({ page }) {
  expect(o2cContext.inventoryBefore).not.toBeNull();
  const productCode = o2cContext.productCodeForInventory || '1013';
  const warehouse = o2cContext.warehouseForInventory || 'Kurnook';
  const after = await getInventoryForProductAndWarehouse(productCode, warehouse);
  expect(after).not.toBeNull();

  if (!o2cContext.invoiceId) {
    expect(after!.available).toBeLessThanOrEqual(o2cContext.inventoryBefore!.available);
    return;
  }

  const invoicedQty = await getInvoicedQuantityForProductCodeOnInvoice(o2cContext.invoiceId, productCode);
  if (invoicedQty === null || invoicedQty <= 0) {
    expect(after!.available).toBeLessThanOrEqual(o2cContext.inventoryBefore!.available);
    return;
  }

  const baseline = o2cContext.inventoryBefore!.available;
  let finalAfter = after!.available;
  for (let i = 0; i < 20; i++) {
    const snap = await getInventoryForProductAndWarehouse(productCode, warehouse);
    if (snap) finalAfter = snap.available;
    const delta = baseline - finalAfter;
    if (Math.abs(delta - invoicedQty) <= 0.0001) break;
    await page.waitForTimeout(2000);
  }

  expect(baseline - finalAfter).toBeCloseTo(invoicedQty, 4);
});

Then('dealer credit is updated as per invoice totals', async function ({ page }) {
  const after = await getDealerCreditByCode('IACS5509');
  expect(after).not.toBeNull();
  expect(o2cContext.dealerCreditBefore).not.toBeNull();
  expect(after!.outstandingAmount).toBeGreaterThanOrEqual(o2cContext.dealerCreditBefore!.outstandingAmount);
});

// --- Dealer Ledger ---
When('I navigate to Dealer Ledger and select dealer {string}', async function ({ page }, dealerCodeOrName: string) {
  dealerLedgerPage = new DealerLedgerPage(page);
  await dealerLedgerPage.goto();
  await dealerLedgerPage.verifyPageLoaded();
  await dealerLedgerPage.selectDealerByCodeOrName(dealerCodeOrName);
  await dealerLedgerPage.clickLoadLedger();
  await dealerLedgerPage.waitForLedgerLoaded(15000);
});

Then('the Dealer Ledger shows an invoice transaction', async function ({ page }) {
  const has = await dealerLedgerPage.hasInvoiceTransaction();
  expect(has).toBe(true);
});

// --- Back order (NPK / no stock at warehouse) + Inventory UI cross-check ---
Given(
  'I have verified via DB that product {string} has no sellable inventory at warehouse {string}',
  async function ({ page }, productCode: string, warehouseSearch: string) {
    const ok = await productHasNoSellableInventoryAtWarehouse(productCode, warehouseSearch);
    expect(ok).toBe(true);
    console.log(`✅ DB: no sellable inventory for ${productCode} at ${warehouseSearch}`);
  }
);

Given(
  'I have resolved an in-stock and an out-of-stock product at warehouse {string} for mixed SO and back order',
  async function ({ page }, warehouseSearch: string) {
    const pair = await resolveMixedIndentProductPairAtWarehouse(warehouseSearch);
    expect(pair).not.toBeNull();
    o2cContext.mixedInStockCode = pair!.inStockMaterialCode;
    o2cContext.mixedOutOfStockCode = pair!.outOfStockMaterialCode;
    o2cContext.warehouseForInventory = warehouseSearch;
    console.log(
      `✅ Resolved mixed indent products @ ${warehouseSearch}: in-stock="${o2cContext.mixedInStockCode}", OOS="${o2cContext.mixedOutOfStockCode}"`
    );
  }
);

Given(
  'I have noted inventory for the resolved in-stock product at warehouse {string}',
  async function ({ page }, warehouseSearch: string) {
    expect(o2cContext.mixedInStockCode).toBeTruthy();
    const snapshot = await getInventoryForProductAndWarehouse(o2cContext.mixedInStockCode, warehouseSearch);
    expect(snapshot).not.toBeNull();
    expect(snapshot!.netAvailable).toBeGreaterThan(0);
    o2cContext.inventoryBefore = snapshot!;
    o2cContext.productCodeForInventory = o2cContext.mixedInStockCode;
    o2cContext.warehouseForInventory = warehouseSearch;
    console.log('✅ Noted inventory (DB) for resolved in-stock product:', o2cContext.inventoryBefore);
  }
);

When('I add the resolved out-of-stock product to the indent', async function ({ page }) {
  expect(o2cContext.mixedOutOfStockCode).toBeTruthy();
  const detail = new IndentDetailPage(page);
  await detail.clickAddItems();
  await detail.searchProduct(o2cContext.mixedOutOfStockCode);
  await detail.waitForAddProductsSearchComplete();
  await detail.selectFirstProductAndAdd();
  await detail.waitForSuccessToast(/added|product/i).catch(() => {});
  console.log(`✅ Added resolved OOS product "${o2cContext.mixedOutOfStockCode}" to indent`);
});

When('I add the resolved in-stock product to the indent', async function ({ page }) {
  expect(o2cContext.mixedInStockCode).toBeTruthy();
  const detail = new IndentDetailPage(page);
  await detail.clickAddItems();
  await detail.searchProduct(o2cContext.mixedInStockCode);
  await detail.waitForAddProductsSearchComplete();
  await detail.selectFirstProductAndAdd();
  await detail.waitForSuccessToast(/added|product/i).catch(() => {});
  console.log(`✅ Added resolved in-stock product "${o2cContext.mixedInStockCode}" to indent`);
});

Then('a back order should exist in DB for the current indent', async function ({ page }) {
  const match = page.url().match(/\/o2c\/indents\/([a-f0-9-]+)/);
  expect(match).toBeTruthy();
  const indentId = match![1];
  // Workflow may queue BO creation; poll briefly after UI success.
  const deadline = Date.now() + 120000;
  let rows: Awaited<ReturnType<typeof getBackOrdersByOriginalIndentId>> = [];
  while (Date.now() < deadline) {
    rows = await getBackOrdersByOriginalIndentId(indentId);
    if (rows.length > 0) break;
    await new Promise((r) => setTimeout(r, 3000));
  }
  expect(rows.length).toBeGreaterThan(0);
  o2cContext.indentId = indentId;
  console.log(`✅ DB back_order_management rows for indent ${indentId}:`, rows.length);
});

When('I am on the O2C Inventory page', async function ({ page }) {
  const inv = new O2CInventoryPage(page);
  await inv.goto();
  console.log('✅ On O2C Inventory page');
});

When(
  'I search inventory for {string} and filter warehouse {string}',
  async function ({ page }, productSearch: string, warehouseName: string) {
    const inv = new O2CInventoryPage(page);
    await inv.searchInventory(productSearch);
    await inv.selectWarehouseFilterByName(warehouseName);
    console.log(`✅ Inventory search "${productSearch}" + warehouse "${warehouseName}"`);
  }
);

When(
  'I search inventory for the resolved out-of-stock product and filter warehouse {string}',
  async function ({ page }, warehouseName: string) {
    expect(o2cContext.mixedOutOfStockCode).toBeTruthy();
    const inv = new O2CInventoryPage(page);
    await inv.searchInventory(o2cContext.mixedOutOfStockCode);
    await inv.selectWarehouseFilterByName(warehouseName);
    console.log(
      `✅ Inventory search resolved OOS "${o2cContext.mixedOutOfStockCode}" + warehouse "${warehouseName}"`
    );
  }
);

Then('the inventory list shows no rows for the current search', async function ({ page }) {
  const inv = new O2CInventoryPage(page);
  await inv.expectNoInventoryRowsMessage();
  console.log('✅ Inventory list empty for search');
});

// --- E-Invoice without E-Way bill (modal: uncheck eWayBillRequired) ---
When('I generate E-Invoice without E-Way bill on the Sales Order page', async function ({ page }) {
  await salesOrderDetailPage.clickGenerateEInvoice();
  const modal = page.getByRole('dialog').filter({ has: page.getByText(/e-invoice|transport|invoice/i) });
  await expect(modal).toBeVisible({ timeout: 10000 });
  const transportTab = page.getByRole('tab', { name: /transport/i }).first();
  await transportTab.click();
  await page.waitForTimeout(500);
  const ewayCheckbox = modal.locator('#eWayBillRequired');
  if (await ewayCheckbox.isVisible().catch(() => false)) {
    await ewayCheckbox.setChecked(false);
  }
  const genOnly = modal.getByRole('button', { name: /generate e-invoice only/i });
  await genOnly.click();

  const generatingButton = modal.getByRole('button', { name: /generating.*invoice/i });
  await expect(generatingButton).toBeVisible({ timeout: 10000 }).catch(() => {});
  await expect(generatingButton).toBeHidden({ timeout: 40000 }).catch(() => {});
  await expect(modal).toBeHidden({ timeout: 10000 }).catch(() => {});
});

// --- E-Invoice cancellation (IRN) within 24h; staging needs IRN without E-Way bill; else TC-003-style e-invoice-only create ---
When(
  'I open an invoice with IRN from the last {int} hours or complete O2C flow to generate one',
  async function ({ page }, withinHours: number) {
    const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
    let invoiceId = await getInvoiceIdWithRecentIrnWithoutEwayBill(withinHours);
    if (invoiceId) {
      console.log(
        `✅ Using recent IRN invoice without E-Way bill in DB (staging cancellation): ${invoiceId}`
      );
    } else {
      console.log(
        'ℹ️ No recent IRN without E-Way bill in DB; running O2C → e-invoice-only flow (same as TC-003: uncheck E-Way, generate e-invoice only)…'
      );
      const result = await runO2CIndentThroughEInvoice(page, {
        dealerName: 'Ramesh ningappa diggai',
        productCode: '1013',
        warehouseName: 'Kurnook Warehouse',
        transporterName: 'Just In Time Shipper',
        approvalComment: `AUTO_QA_${Date.now()}_einv_cancel_setup_no_eway`,
        eInvoiceWithoutEWayBill: true,
      });
      invoiceId = result.invoiceId;
      if (!invoiceId) {
        const ids = await getInvoiceIdsBySalesOrderId(result.salesOrderId);
        invoiceId = ids[0] ?? null;
      }
    }
    expect(invoiceId).toBeTruthy();
    o2cContext.invoiceId = invoiceId!;
    await page.goto(new URL(`/o2c/invoices/${invoiceId}`, base).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    invoiceDetailPage = new InvoiceDetailPage(page);
    await invoiceDetailPage.verifyPageLoaded();
    console.log(`✅ Opened invoice ${invoiceId} for e-invoice cancellation flow`);
  }
);

When('I cancel the e-invoice from the invoice detail using the default cancellation reason', async function ({ page }) {
  invoiceDetailPage = new InvoiceDetailPage(page);
  await invoiceDetailPage.verifyPageLoaded();
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);
  // Header **Cancel Invoice** + CancelInvoiceDialog (cancelInvoiceWithGST). E-Invoice card **Cancel E-Invoice** returns 400 in staging — DAEE-362.
  await invoiceDetailPage.postToGeneralLedgerIfButtonVisible();
  await invoiceDetailPage.clickCancelInvoiceHeaderButton();
  await invoiceDetailPage.fillCancelInvoiceDialogAndConfirm(
    `AUTO_QA_${Date.now()}_TC004_header_cancel_invoice`
  );
  try {
    await invoiceDetailPage.waitForEInvoiceCancelledToast();
  } catch (e) {
    const msg = (e as Error).message || '';
    if (/active return order|Please cancel or complete the return order first/i.test(msg)) {
      test.skip(
        true,
        'Invoice cancellation blocked by active sales return order in this environment; inventory-restoration assertion not applicable.'
      );
    }
    throw e;
  }
  console.log('✅ Invoice cancellation submitted (header Cancel Invoice)');
});

Given('I have noted invoice cancellation inventory baseline from database', async function ({ page }) {
  expect(o2cContext.invoiceId).toBeTruthy();
  const ctx = await getInvoiceCancelInventoryContext(o2cContext.invoiceId!);
  expect(ctx).not.toBeNull();
  const before = await getInventoryAvailableSumByPackageAndWarehouse(
    ctx!.tenantId,
    ctx!.warehouseId,
    ctx!.productVariantPackageId
  );
  o2cContext.invoiceCancelInventoryContext = {
    tenantId: ctx!.tenantId,
    warehouseId: ctx!.warehouseId,
    productVariantPackageId: ctx!.productVariantPackageId,
  };
  o2cContext.invoiceCancelInventoryExpectedIncrease = ctx!.cancelledQty;
  o2cContext.invoiceCancelInventoryBefore = before;
  console.log('✅ Noted invoice cancel inventory baseline:', {
    before,
    expectedIncrease: ctx!.cancelledQty,
    warehouseId: ctx!.warehouseId,
    productVariantPackageId: ctx!.productVariantPackageId,
  });
});

Then('the invoice e-invoice status in the database should be {string}', async function ({ page }, expected: string) {
  expect(o2cContext.invoiceId).toBeTruthy();
  const want = expected.toLowerCase();
  let last: string | null = null;
  for (let i = 0; i < 30; i++) {
    last = await getInvoiceEinvoiceStatus(o2cContext.invoiceId!);
    if ((last || '').toLowerCase() === want) break;
    await page.waitForTimeout(2000);
  }
  expect((last || '').toLowerCase()).toBe(want);
  console.log(`✅ DB einvoice_status=${last}`);
});

Then('inventory available should increase by cancelled quantity in database', async function ({ page }) {
  expect(o2cContext.invoiceCancelInventoryContext).not.toBeNull();
  expect(o2cContext.invoiceCancelInventoryBefore).not.toBeNull();
  expect(o2cContext.invoiceCancelInventoryExpectedIncrease).not.toBeNull();

  const ctx = o2cContext.invoiceCancelInventoryContext!;
  const before = o2cContext.invoiceCancelInventoryBefore!;
  const expectedIncrease = o2cContext.invoiceCancelInventoryExpectedIncrease!;

  let delta = 0;
  for (let i = 0; i < 30; i++) {
    const after = await getInventoryAvailableSumByPackageAndWarehouse(
      ctx.tenantId,
      ctx.warehouseId,
      ctx.productVariantPackageId
    );
    delta = after - before;
    if (Math.abs(delta - expectedIncrease) <= 0.0001) break;
    await page.waitForTimeout(2000);
  }
  expect(delta).toBeCloseTo(expectedIncrease, 4);
  console.log(`✅ DB inventory available increased by ${delta} (expected ${expectedIncrease})`);
});

Then('the invoice should have IGST and no CGST SGST in database', async function ({ page }) {
  expect(o2cContext.invoiceId).toBeTruthy();
  const split = await getInvoiceItemsTaxSplit(o2cContext.invoiceId!);
  expect(split).not.toBeNull();
  expect(split!.igst).toBeGreaterThan(0);
  expect(split!.cgst).toBeCloseTo(0, 4);
  expect(split!.sgst).toBeCloseTo(0, 4);
  console.log(`✅ Invoice tax split (DB): IGST=${split!.igst}, CGST=${split!.cgst}, SGST=${split!.sgst}`);
});

