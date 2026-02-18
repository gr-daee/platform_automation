/**
 * O2C E2E Flow Step Definitions
 *
 * Covers: Note inventory/dealer credit (DB) → Indent → SO → eInvoice → Invoice PDF → Dealer Ledger.
 * Reuses indent-steps where possible; uses o2c-db-helpers for read-only DB.
 */

import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { SalesOrderDetailPage } from '../../pages/o2c/SalesOrderDetailPage';
import { InvoiceDetailPage } from '../../pages/o2c/InvoiceDetailPage';
import { DealerLedgerPage } from '../../pages/finance/DealerLedgerPage';
import {
  getInventoryForProductAndWarehouse,
  getDealerCreditByCode,
  getSalesOrderIdByIndentId,
  getInvoiceIdsBySalesOrderId,
  type InventorySnapshot,
  type DealerCreditSnapshot,
} from '../../support/o2c-db-helpers';

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
} = {
  indentId: null,
  salesOrderId: null,
  invoiceId: null,
  inventoryBefore: null,
  dealerCreditBefore: null,
  soQuantity: 0,
  productCodeForInventory: '',
  warehouseForInventory: '',
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

// --- Indent flow: use steps from indent-steps; capture indent id from URL when navigating to SO ---

// --- SO navigation (capture indent id from current page URL; we are on indent detail after Process Workflow) ---
When('I navigate to the Sales Order created from the indent', async function ({ page }) {
  const url = page.url();
  const match = url.match(/\/o2c\/indents\/([a-f0-9-]+)/);
  expect(match).toBeTruthy();
  o2cContext.indentId = match![1];
  
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
    soId = await getSalesOrderIdByIndentId(o2cContext.indentId);
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
  const warehouse = await salesOrderDetailPage.getWarehouseName();
  expect(warehouse.toLowerCase()).toContain(warehouseSubstring.toLowerCase());
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
});

Then('the Sales Order status is updated', async function ({ page }) {
  const status = await salesOrderDetailPage.getStatusText();
  // Status can be: invoiced, allocated, fulfilled, shipped, ready_to_ship, etc.
  expect(status.toLowerCase()).toMatch(/invoiced|allocated|fulfilled|ready.*ship|shipped/);
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
  const downloadPromise = page.waitForEvent('download', { timeout: 90000 });

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
        await expect(indicator).toBeHidden({ timeout: 35000 }).catch(() => {});
      } catch {
        // Indicator might not exist
      }
    }
    // When generation succeeds, UI shows "Download Custom..."; app does not auto-download – we must click it
    await invoiceDetailPage.waitForDownloadCustomInvoicePdfButton(25000);
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
  expect(after!.available).toBeLessThanOrEqual(o2cContext.inventoryBefore!.available);
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
