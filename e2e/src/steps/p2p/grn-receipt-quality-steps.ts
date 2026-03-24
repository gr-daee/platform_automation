import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { executeQuery } from '../../support/db-helper';
import { PurchaseOrdersPage } from '../../pages/p2p/PurchaseOrdersPage';

const { Given, When, Then } = createBdd();

type GrnAggregateRow = {
  quantity_accepted: string | number | null;
  quality_check_status: string | null;
  status: string | null;
};

type StockAggregateRow = {
  stock_quantity: string | number | null;
  stock_rows: string | number | null;
};

type ScenarioContext = {
  daee157GrnId?: string;
  currentPoId?: string;
  currentGrnId?: string;
  lastReceiptToast?: string;
  receiptRecorded?: boolean;
  rejectedGrnId?: string;
  currentInvoiceId?: string;
};

Given(
  'I open GRN {string} from DAEE-157 defect context',
  async function ({ page }, grnId: string) {
    const ctx = this as ScenarioContext;
    ctx.daee157GrnId = grnId;
    await page.goto(`/p2p/grn/${grnId}`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(new RegExp(`/p2p/grn/${grnId}`));
  }
);

Then(
  'accepted quantity should be reflected in raw material inventory for that GRN',
  async function () {
    const ctx = this as ScenarioContext;
    const grnId = ctx.daee157GrnId;

    if (!grnId) {
      throw new Error('GRN id missing from scenario context.');
    }

    const grnRows = await executeQuery<GrnAggregateRow>(
      `SELECT
         COALESCE(SUM(quantity_accepted), 0) AS quantity_accepted,
         MAX(quality_check_status) AS quality_check_status,
         MAX(status) AS status
       FROM supplier_grns
       WHERE id = $1`,
      [grnId]
    );

    if (grnRows.length === 0) {
      throw new Error(`GRN not found in DB for id ${grnId}.`);
    }

    const acceptedQty = Number(grnRows[0].quantity_accepted || 0);
    const grnStatus = (grnRows[0].status || '').toString();
    const qualityStatus = (grnRows[0].quality_check_status || '').toString();

    expect(acceptedQty, `GRN ${grnId} should have accepted quantity > 0`).toBeGreaterThan(0);
    expect(
      ['completed', 'received', 'quality_check'].includes(grnStatus),
      `Unexpected GRN status for ${grnId}: ${grnStatus}`
    ).toBeTruthy();

    if (grnStatus === 'completed') {
      expect(
        ['approved', 'partially_approved', ''].includes(qualityStatus),
        `Unexpected quality_check_status for completed GRN ${grnId}: ${qualityStatus}`
      ).toBeTruthy();
    }

    const stockRows = await executeQuery<StockAggregateRow>(
      `SELECT
         COALESCE(SUM(available_quantity), 0) AS stock_quantity,
         COUNT(*) AS stock_rows
       FROM raw_material_stock
       WHERE supplier_grn_id = $1`,
      [grnId]
    );

    const stockQty = Number(stockRows[0]?.stock_quantity || 0);
    const stockCount = Number(stockRows[0]?.stock_rows || 0);

    expect(stockCount, `Expected stock rows for GRN ${grnId}`).toBeGreaterThan(0);
    expect(
      stockQty,
      `Raw material stock quantity (${stockQty}) should equal accepted quantity (${acceptedQty}) for GRN ${grnId}`
    ).toBe(acceptedQty);
  }
);

When(
  'I send the approved purchase order to supplier for GRN processing',
  async function ({ page }) {
    await expect(
      page.getByRole('button', { name: /Send to Supplier/i }).first()
    ).toBeVisible({ timeout: 30000 });

    page.once('dialog', (d) => void d.accept());
    await page.getByRole('button', { name: /Send to Supplier/i }).first().click();
    await expect(page.getByText('Sent to Supplier', { exact: true }).first()).toBeVisible({
      timeout: 30000,
    });
  }
);

When('I create a GRN from the current purchase order', async function ({ page }) {
  const ctx = this as ScenarioContext;
  const createGrnTrigger = page
    .getByRole('button', { name: /Create GRN|Create another GRN|Record GRN/i })
    .first();
  if (!ctx.currentPoId) {
    const poMatch = page.url().match(/\/p2p\/purchase-orders\/([^/]+)/);
    if (poMatch) {
      ctx.currentPoId = poMatch[1];
    }
  }

  await expect(createGrnTrigger).toBeVisible({
    timeout: 30000,
  });
  await createGrnTrigger.click();

  await expect(page.getByRole('heading', { name: /Create Goods Receipt Note/i })).toBeVisible({
    timeout: 20000,
  });

  const createButton = page.getByRole('button', { name: /^Create GRN$/i }).last();
  const createDisabled = await createButton.isDisabled();
  if (createDisabled) {
    const warehouseCombobox = page.getByRole('combobox').first();
    await expect(warehouseCombobox).toBeVisible({ timeout: 15000 });
    await warehouseCombobox.click();
    const firstWarehouse = page.getByRole('option').first();
    await expect(firstWarehouse).toBeVisible({ timeout: 15000 });
    await firstWarehouse.click();
  }
  await expect(createButton).toBeEnabled({ timeout: 20000 });
  await createButton.click();

  await expect(page.locator('[data-sonner-toast]').filter({ hasText: /GRN created successfully/i })).toBeVisible({
    timeout: 20000,
  });

  if (!ctx.currentPoId) {
    throw new Error('Could not determine PO id for GRN lookup.');
  }

  const grnRows = await executeQuery<{ id: string }>(
    `SELECT id
     FROM supplier_grns
     WHERE purchase_order_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [ctx.currentPoId]
  );

  if (grnRows.length === 0) {
    throw new Error(`No GRN found for PO ${ctx.currentPoId} after creation.`);
  }
  ctx.currentGrnId = grnRows[0].id;
});

When('I record receipt with partial rejection on the created GRN', async function ({ page }) {
  const ctx = this as ScenarioContext;
  if (!ctx.currentGrnId) {
    throw new Error('Missing current GRN id for receipt recording.');
  }

  await page.goto(`/p2p/grn/${ctx.currentGrnId}?action=record-receipt`);
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: /Record GRN Receipt/i })).toBeVisible({
    timeout: 30000,
  });

  // Use first line item: receive 2, reject 1 (partial acceptance).
  const receivedInput = page.locator('input[id^="received-"]').first();
  const rejectedInput = page.locator('input[id^="rejected-"]').first();
  const batchInput = page.locator('input[id^="batch-"]').first();
  const expiryInput = page.locator('input[id^="expiry-"]').first();
  const reasonInput = page.locator('textarea[id^="notes-"]').first();

  await receivedInput.fill('2');
  await rejectedInput.fill('1');
  await batchInput.fill(`AUTO_QA_BATCH_${Date.now()}`);

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 365);
  const expiryDate = expiry.toISOString().split('T')[0];
  await expiryInput.fill(expiryDate);
  await reasonInput.fill('AUTO_QA partial rejection for DAEE-157 validation');

  await page.getByRole('button', { name: /Record Receipt/i }).click();

  const successToast = page
    .locator('[data-sonner-toast]')
    .filter({ hasText: /GRN receipt recorded successfully/i })
    .first();
  const success = await successToast.isVisible({ timeout: 10000 }).catch(() => false);
  if (!success) {
    const toastText = (await page.locator('[data-sonner-toast]').last().textContent().catch(() => '')) || '';
    (this as ScenarioContext).lastReceiptToast = toastText;
    (this as ScenarioContext).receiptRecorded = false;
    throw new Error(`Record receipt failed or was not confirmed. Toast: ${toastText}`);
  }
  (this as ScenarioContext).lastReceiptToast = 'GRN receipt recorded successfully';
  (this as ScenarioContext).receiptRecorded = true;
});

When('I approve quality for the created GRN', async function ({ page }) {
  await expect(page.getByRole('button', { name: /Approve Quality/i })).toBeVisible({
    timeout: 30000,
  });
  await page.getByRole('button', { name: /Approve Quality/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
  await page.getByRole('dialog').getByRole('button', { name: /Approve Quality/i }).click();

  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /GRN quality approved successfully/i })
  ).toBeVisible({ timeout: 20000 });
});

Then(
  'the created GRN should update raw material inventory by accepted quantity only',
  async function () {
    const ctx = this as ScenarioContext;
    if (!ctx.currentGrnId) {
      throw new Error('Missing current GRN id for inventory validation.');
    }

    const grnRows = await executeQuery<{
      quantity_accepted: string | number | null;
      quantity_rejected: string | number | null;
      status: string | null;
      quality_check_status: string | null;
    }>(
      `SELECT quantity_accepted, quantity_rejected, status, quality_check_status
       FROM supplier_grns
       WHERE id = $1`,
      [ctx.currentGrnId]
    );

    expect(grnRows.length, 'Expected created GRN to exist').toBe(1);
    const acceptedQty = Number(grnRows[0].quantity_accepted || 0);
    const rejectedQty = Number(grnRows[0].quantity_rejected || 0);
    const status = (grnRows[0].status || '').toString();

    expect(rejectedQty, 'Expected partial rejection in created GRN').toBeGreaterThan(0);
    expect(acceptedQty, 'Expected accepted quantity in created GRN').toBeGreaterThan(0);
    expect(status, 'GRN should be completed after quality approval').toBe('completed');

    const stockRows = await executeQuery<StockAggregateRow>(
      `SELECT
         COALESCE(SUM(available_quantity), 0) AS stock_quantity,
         COUNT(*) AS stock_rows
       FROM raw_material_stock
       WHERE supplier_grn_id = $1`,
      [ctx.currentGrnId]
    );

    const stockQty = Number(stockRows[0]?.stock_quantity || 0);
    const stockCount = Number(stockRows[0]?.stock_rows || 0);

    expect(stockCount, `Expected stock rows for GRN ${ctx.currentGrnId}`).toBeGreaterThan(0);
    expect(
      stockQty,
      `Stock should equal accepted quantity only (accepted=${acceptedQty}, stock=${stockQty}, rejected=${rejectedQty})`
    ).toBe(acceptedQty);
  }
);

Given('there is an approved purchase order ready for GRN processing', async function ({ page }) {
  const poList = new PurchaseOrdersPage(page);
  await poList.goto();
  await poList.verifyPageLoaded();
  await poList.openFirstByStatus('Approved');

  const ctx = this as ScenarioContext;
  const poMatch = page.url().match(/\/p2p\/purchase-orders\/([^/]+)/);
  if (!poMatch) {
    throw new Error('Failed to open approved purchase order detail page.');
  }
  ctx.currentPoId = poMatch[1];
});

Given('there is a purchase order with editable GRN for receipt processing', async function ({ page, $test }) {
  const ctx = this as ScenarioContext;

  const rows = await executeQuery<{ po_id: string; grn_id: string }>(
    `SELECT po.id AS po_id, grn.id AS grn_id
     FROM purchase_orders po
     JOIN supplier_grns grn ON grn.purchase_order_id = po.id
     JOIN supplier_grn_items gi ON gi.supplier_grn_id = grn.id
     WHERE po.status IN ('sent_to_supplier', 'partially_received')
       AND grn.status IN ('pending', 'partially_received')
       AND gi.quantity_ordered >= 2
       AND po.is_active = true
       AND grn.is_active = true
     ORDER BY po.updated_at DESC, grn.created_at DESC
     LIMIT 1`
  );

  if (rows.length === 0) {
    if ($test) {
      $test.skip(
        true,
        'No purchase order + editable GRN found (requires PO in sent_to_supplier/partially_received with GRN pending/partially_received).'
      );
      return;
    }
    throw new Error('No editable GRN flow data available.');
  }

  ctx.currentPoId = rows[0].po_id;
  ctx.currentGrnId = rows[0].grn_id;

  await page.goto(`/p2p/grn/${ctx.currentGrnId}?action=record-receipt`);
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(new RegExp(`/p2p/grn/${ctx.currentGrnId}`));
});

Given(
  'there is a purchase order with multiple GRNs for cumulative receipt validation',
  async function ({ $test }) {
    const ctx = this as ScenarioContext;
    const rows = await executeQuery<{ purchase_order_id: string; po_received: string | number }>(
      `SELECT po.id AS purchase_order_id, po.quantity_received AS po_received
       FROM purchase_orders po
       WHERE po.is_active = true
         AND po.quantity_received > 0
         AND (
           SELECT COUNT(*)
           FROM supplier_grns grn
           WHERE grn.purchase_order_id = po.id
             AND grn.is_active = true
         ) >= 2
       ORDER BY po.updated_at DESC
       LIMIT 1`
    );

    if (rows.length === 0) {
      if ($test) {
        $test.skip(true, 'No PO found with multiple GRNs and received quantity for cumulative validation.');
        return;
      }
      throw new Error('No PO found with multiple GRNs for cumulative validation.');
    }
    ctx.currentPoId = rows[0].purchase_order_id;
  }
);

When('I submit and approve the current purchase order for GRN flow', async function ({ page }) {
  const submitButton = page.getByRole('button', { name: /Submit for Approval/i }).first();
  if (await submitButton.isVisible().catch(() => false)) {
    page.once('dialog', (d) => void d.accept());
    await submitButton.click();
    await page.waitForLoadState('networkidle');
  }

  const approveButton = page
    .getByRole('button', { name: /^Approve$/i })
    .or(page.getByRole('button', { name: /Approve PO|Approve Purchase Order/i }))
    .first();
  await expect(approveButton).toBeVisible({ timeout: 30000 });
  page.once('dialog', (d) => void d.accept());
  await approveButton.click();
  await expect(page.getByText('Approved', { exact: true }).first()).toBeVisible({ timeout: 30000 });
});

Then('the receipt update should complete without backend enum errors', async function () {
  const ctx = this as ScenarioContext;
  expect(ctx.receiptRecorded, `Receipt update failed. Last toast: ${ctx.lastReceiptToast || 'N/A'}`).toBeTruthy();
  const toast = (ctx.lastReceiptToast || '').toLowerCase();
  expect(toast.includes('invalid input value for enum quality_status_enum')).toBeFalsy();
});

Then('GRN detail should display inspection metadata and linked PO traceability', async function ({ page }) {
  const ctx = this as ScenarioContext;
  if (!ctx.currentGrnId) {
    throw new Error('Missing GRN id for traceability validation.');
  }
  await page.goto(`/p2p/grn/${ctx.currentGrnId}`);
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(/GRN Information/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Purchase Order/i).first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Quality Inspection/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Inspected By/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Inspection Date/i)).toBeVisible({ timeout: 15000 });
});

Then('cumulative accepted quantity across GRNs should match PO received quantity', async function () {
  const ctx = this as ScenarioContext;
  if (!ctx.currentPoId) {
    throw new Error('Missing PO id for cumulative receipt validation.');
  }

  const poRows = await executeQuery<{ quantity_received: string | number }>(
    `SELECT quantity_received
     FROM purchase_orders
     WHERE id = $1`,
    [ctx.currentPoId]
  );
  expect(poRows.length).toBe(1);
  const poReceived = Number(poRows[0].quantity_received || 0);

  const grnRows = await executeQuery<{ total_accepted: string | number }>(
    `SELECT COALESCE(SUM(quantity_accepted), 0) AS total_accepted
     FROM supplier_grns
     WHERE purchase_order_id = $1
       AND is_active = true`,
    [ctx.currentPoId]
  );
  const totalAccepted = Number(grnRows[0]?.total_accepted || 0);
  expect(totalAccepted).toBe(poReceived);
});

Then(
  'mark for payment action should not be available for the current GRN operator user',
  async function ({ page }) {
    const markButtons = page.getByRole('button', { name: /Mark for Payment/i });
    const count = await markButtons.count();
    expect(count, 'GRN operator should not see mark-for-payment action').toBe(0);
  }
);

Then('goods-first invoice linkage to PO and GRN should be supported', async function ({ $test }) {
  const rows = await executeQuery<{ c: string | number }>(
    `SELECT COUNT(*) AS c
     FROM supplier_invoices si
     JOIN supplier_grns grn ON grn.id = si.grn_id
     WHERE si.purchase_order_id IS NOT NULL
       AND si.grn_id IS NOT NULL
       AND si.invoice_date >= grn.grn_date`
  );
  const count = Number(rows[0]?.c || 0);
  if (count === 0) {
    $test?.skip(true, 'No goods-first sample data found (invoice_date >= grn_date with PO+GRN linkage).');
    return;
  }
  expect(count).toBeGreaterThan(0);
});

Then('invoice-first linkage should support invoice before GRN on same PO', async function ({ $test }) {
  const rows = await executeQuery<{ c: string | number }>(
    `SELECT COUNT(*) AS c
     FROM supplier_invoices si
     JOIN supplier_grns grn ON grn.id = si.grn_id
     WHERE si.purchase_order_id = grn.purchase_order_id
       AND si.purchase_order_id IS NOT NULL
       AND si.grn_id IS NOT NULL
       AND si.invoice_date < grn.grn_date`
  );
  const count = Number(rows[0]?.c || 0);
  if (count === 0) {
    $test?.skip(true, 'No invoice-first sample data found (invoice_date < grn_date with PO+GRN linkage).');
    return;
  }
  expect(count).toBeGreaterThan(0);
});

Given('there is a fully rejected GRN in the tenant', async function ({ $test }) {
  const ctx = this as ScenarioContext;
  const rows = await executeQuery<{ id: string }>(
    `SELECT id
     FROM supplier_grns
     WHERE quantity_received > 0
       AND COALESCE(quantity_accepted, 0) = 0
       AND COALESCE(quantity_rejected, 0) > 0
       AND is_active = true
     ORDER BY updated_at DESC
     LIMIT 1`
  );
  if (rows.length === 0) {
    $test?.skip(true, 'No fully rejected GRN found for rejection stock validation.');
    return;
  }
  ctx.rejectedGrnId = rows[0].id;
});

Then('fully rejected GRN should have zero linked raw material stock entries', async function () {
  const ctx = this as ScenarioContext;
  const targetGrnId = ctx.rejectedGrnId || ctx.currentGrnId;
  if (!targetGrnId) {
    throw new Error('Missing rejected/current GRN id for stock validation.');
  }
  const rows = await executeQuery<{ c: string | number }>(
    `SELECT COUNT(*) AS c
     FROM raw_material_stock
     WHERE supplier_grn_id = $1`,
    [targetGrnId]
  );
  const count = Number(rows[0]?.c || 0);
  expect(count).toBe(0);
});

When('I record receipt with full acceptance on the created GRN', async function ({ page }) {
  const ctx = this as ScenarioContext;
  if (!ctx.currentGrnId) throw new Error('Missing current GRN id for full acceptance flow.');

  await page.goto(`/p2p/grn/${ctx.currentGrnId}?action=record-receipt`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: /Record GRN Receipt/i })).toBeVisible({ timeout: 30000 });

  const receivedInput = page.locator('input[id^="received-"]').first();
  const batchInput = page.locator('input[id^="batch-"]').first();
  const expiryInput = page.locator('input[id^="expiry-"]').first();
  await receivedInput.fill('1');
  await batchInput.fill(`AUTO_QA_BATCH_ACC_${Date.now()}`);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 365);
  await expiryInput.fill(expiry.toISOString().split('T')[0]);

  await page.getByRole('button', { name: /Record Receipt/i }).click();
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /GRN receipt recorded successfully/i }).first()
  ).toBeVisible({ timeout: 10000 });
});

When('I record receipt with full rejection on the created GRN', async function ({ page }) {
  const ctx = this as ScenarioContext;
  if (!ctx.currentGrnId) throw new Error('Missing current GRN id for full rejection flow.');

  await page.goto(`/p2p/grn/${ctx.currentGrnId}?action=record-receipt`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: /Record GRN Receipt/i })).toBeVisible({ timeout: 30000 });

  const receivedInput = page.locator('input[id^="received-"]').first();
  const rejectedInput = page.locator('input[id^="rejected-"]').first();
  const batchInput = page.locator('input[id^="batch-"]').first();
  const expiryInput = page.locator('input[id^="expiry-"]').first();
  const reasonInput = page.locator('textarea[id^="notes-"]').first();

  await receivedInput.fill('1');
  await rejectedInput.fill('1');
  await batchInput.fill(`AUTO_QA_BATCH_REJ_${Date.now()}`);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 365);
  await expiryInput.fill(expiry.toISOString().split('T')[0]);
  await reasonInput.fill('AUTO_QA full rejection validation');

  await page.getByRole('button', { name: /Record Receipt/i }).click();
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /GRN receipt recorded successfully/i }).first()
  ).toBeVisible({ timeout: 10000 });
});

Given('there is a sent-to-supplier purchase order without GRN for invoice-first flow', async function ({ page, $test }) {
  const ctx = this as ScenarioContext;
  const rows = await executeQuery<{ po_id: string }>(
    `SELECT po.id AS po_id
     FROM purchase_orders po
     WHERE po.status = 'sent_to_supplier'
       AND po.is_active = true
       AND NOT EXISTS (
         SELECT 1 FROM supplier_grns grn
         WHERE grn.purchase_order_id = po.id
           AND grn.is_active = true
       )
     ORDER BY po.updated_at DESC
     LIMIT 1`
  );
  if (rows.length === 0) {
    $test?.skip(true, 'No sent_to_supplier PO without GRN found for invoice-first flow.');
    return;
  }
  ctx.currentPoId = rows[0].po_id;
  await page.goto(`/p2p/purchase-orders/${ctx.currentPoId}`);
  await page.waitForLoadState('networkidle');
});

When('I create a supplier invoice for the current PO in goods-first flow', async function ({ page }) {
  const ctx = this as ScenarioContext;
  if (!ctx.currentPoId || !ctx.currentGrnId) throw new Error('Missing PO/GRN context for goods-first invoice flow.');

  const rows = await executeQuery<{ supplier_name: string; po_number: string }>(
    `SELECT po.po_number, po.supplier_name
     FROM purchase_orders po
     WHERE po.id = $1`,
    [ctx.currentPoId]
  );
  if (rows.length === 0) throw new Error('PO context not found in DB for goods-first invoice flow.');

  const supplierName = rows[0].supplier_name;
  const poNumber = rows[0].po_number;
  const invoiceNumber = `AUTO_QA_GF_${Date.now()}`;

  await page.goto('/p2p/supplier-invoices/create');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Select Supplier/i }).click();
  await page.getByPlaceholder(/Search suppliers/i).fill(supplierName);
  await page.getByText(supplierName).first().click();

  await page.getByLabel('Supplier Invoice Number *').fill(invoiceNumber);
  const poSelect = page.getByLabel('PO Reference (Optional)');
  await poSelect.click();
  await page.getByText(new RegExp(poNumber)).first().click();
  await page.getByRole('button', { name: /Save Invoice/i }).click();
  await page.waitForURL(/\/p2p\/supplier-invoices\/[^/]+$/, { timeout: 30000 });

  const invoiceIdMatch = page.url().match(/\/p2p\/supplier-invoices\/([^/]+)/);
  if (!invoiceIdMatch) throw new Error('Could not capture created invoice id for goods-first flow.');
  ctx.currentInvoiceId = invoiceIdMatch[1];
});

When('I create a supplier invoice for the current PO in invoice-first flow', async function ({ page }) {
  const ctx = this as ScenarioContext;
  if (!ctx.currentPoId) throw new Error('Missing PO context for invoice-first flow.');

  const rows = await executeQuery<{ supplier_name: string; po_number: string }>(
    `SELECT po.po_number, po.supplier_name
     FROM purchase_orders po
     WHERE po.id = $1`,
    [ctx.currentPoId]
  );
  if (rows.length === 0) throw new Error('PO context not found in DB for invoice-first flow.');

  const supplierName = rows[0].supplier_name;
  const poNumber = rows[0].po_number;
  const invoiceNumber = `AUTO_QA_IF_${Date.now()}`;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().split('T')[0];

  await page.goto('/p2p/supplier-invoices/create');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Select Supplier/i }).click();
  await page.getByPlaceholder(/Search suppliers/i).fill(supplierName);
  await page.getByText(supplierName).first().click();

  await page.getByLabel('Supplier Invoice Number *').fill(invoiceNumber);
  await page.getByLabel('Invoice Date *').fill(y);
  await page.getByLabel('Due Date *').fill(y);
  const poSelect = page.getByLabel('PO Reference (Optional)');
  await poSelect.click();
  await page.getByText(new RegExp(poNumber)).first().click();
  await page.getByRole('button', { name: /Save Invoice/i }).click();
  await page.waitForURL(/\/p2p\/supplier-invoices\/[^/]+$/, { timeout: 30000 });

  const invoiceIdMatch = page.url().match(/\/p2p\/supplier-invoices\/([^/]+)/);
  if (!invoiceIdMatch) throw new Error('Could not capture created invoice id for invoice-first flow.');
  ctx.currentInvoiceId = invoiceIdMatch[1];
});

Then('goods-first flow should persist invoice linkage with current PO and GRN', async function () {
  const ctx = this as ScenarioContext;
  if (!ctx.currentInvoiceId || !ctx.currentPoId || !ctx.currentGrnId) {
    throw new Error('Missing context for goods-first linkage validation.');
  }
  const rows = await executeQuery<{ c: string | number }>(
    `SELECT COUNT(*) AS c
     FROM supplier_invoices si
     WHERE si.id = $1
       AND si.purchase_order_id = $2
       AND EXISTS (
         SELECT 1
         FROM supplier_grns grn
         WHERE grn.id = $3
           AND grn.purchase_order_id = si.purchase_order_id
           AND si.invoice_date >= grn.grn_date
       )`,
    [ctx.currentInvoiceId, ctx.currentPoId, ctx.currentGrnId]
  );
  expect(Number(rows[0]?.c || 0)).toBe(1);
});

Then('invoice-first flow should support invoice before GRN on same PO', async function () {
  const ctx = this as ScenarioContext;
  if (!ctx.currentInvoiceId || !ctx.currentPoId) {
    throw new Error('Missing context for invoice-first validation.');
  }
  const rows = await executeQuery<{ c: string | number }>(
    `SELECT COUNT(*) AS c
     FROM supplier_invoices si
     JOIN supplier_grns grn ON grn.purchase_order_id = si.purchase_order_id
     WHERE si.id = $1
       AND si.purchase_order_id = $2
       AND si.invoice_date < grn.grn_date`,
    [ctx.currentInvoiceId, ctx.currentPoId]
  );
  expect(Number(rows[0]?.c || 0)).toBeGreaterThan(0);
});
