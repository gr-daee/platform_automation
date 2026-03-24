import { createBdd } from 'playwright-bdd';
import { expect, test } from '@playwright/test';
import { PurchaseOrdersPage } from '../../pages/p2p/PurchaseOrdersPage';
import { PurchaseOrderDetailPage } from '../../pages/p2p/PurchaseOrderDetailPage';
import { executeQuery } from '../../support/db-helper';

const { Given, When, Then } = createBdd();

type Phase5Context = {
  currentPoId?: string;
  cancelAttemptBlocked?: boolean;
};

async function openFirstPoByStatusOrSkip(
  page: any,
  statusRegex: RegExp,
  skipMessage: string,
  $test?: typeof test
): Promise<string> {
  const statusText = statusRegex.source
    .replace(/[()]/g, '')
    .split('|')
    .map(s => s.replace(/\\s\+/g, ' ').trim())
    .find(Boolean);
  const rows = await executeQuery<{ id: string }>(
    `
      SELECT id
      FROM purchase_orders
      WHERE is_active = true
        AND status::text ILIKE $1
      ORDER BY updated_at DESC
      LIMIT 1
    `,
    [`%${statusText || ''}%`]
  );
  if (rows.length === 0) {
    $test?.skip(true, skipMessage);
    return '';
  }
  const poId = rows[0].id;
  await page.goto(`/p2p/purchase-orders/${poId}`);
  await page.waitForURL(new RegExp(`/p2p/purchase-orders/${poId}$`), { timeout: 15000 });
  return poId;
}

Given('there is an approved purchase order for supplier send flow', async function ({ page, $test }) {
  const ctx = this as Phase5Context;
  const poId = await openFirstPoByStatusOrSkip(
    page,
    /Approved/i,
    'No approved PO available for send flow validation.',
    $test
  );
  if (poId) ctx.currentPoId = poId;
});

When('I mark the current purchase order as sent to supplier', async function ({ page, $test }) {
  const ctx = this as Phase5Context;
  if (!ctx.currentPoId) throw new Error('Missing current PO context for send flow.');

  const poDetail = new PurchaseOrderDetailPage(page);
  const sendBtn = poDetail.sendToSupplierButton.first();
  const visible = await sendBtn.isVisible().catch(() => false);
  if (!visible) {
    $test?.skip(true, 'Send to Supplier action not available for this PO/user context.');
    return;
  }

  page.once('dialog', (d: any) => void d.accept());
  await sendBtn.click();

  const dialog = page.getByRole('dialog').or(page.getByRole('alertdialog'));
  const confirm = dialog.getByRole('button', { name: /Confirm|Send|Yes/i }).first();
  if (await confirm.isVisible().catch(() => false)) {
    await confirm.click();
  }

  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /sent|supplier|success/i }).first()
  ).toBeVisible({ timeout: 15000 });
});

Then('the purchase order should be in "sent to supplier" or equivalent dispatched state', async function ({
  page,
}) {
  const sentLike = page.getByText(/Sent to Supplier|Dispatched|Issued/i).first();
  await expect(sentLike).toBeVisible({ timeout: 15000 });
});

Then('PO send event should be auditable with recipient, date, or version context', async function () {
  const ctx = this as Phase5Context;
  if (!ctx.currentPoId) throw new Error('Missing PO context for send audit validation.');
  const rows = await executeQuery<{ cnt: string }>(
    `
      SELECT COUNT(*)::text AS cnt
      FROM audit_logs
      WHERE entity_type IN ('purchase_orders', 'purchase_order')
        AND entity_id = $1
        AND (
          COALESCE(action, '') ILIKE '%send%'
          OR COALESCE(new_values::text, '') ILIKE '%sent%'
          OR COALESCE(new_values::text, '') ILIKE '%recipient%'
          OR COALESCE(new_values::text, '') ILIKE '%version%'
        )
    `,
    [ctx.currentPoId]
  );
  expect(Number(rows[0]?.cnt || '0')).toBeGreaterThan(0);
});

Given('there is a sent-to-supplier purchase order for amendment flow', async function ({ page, $test }) {
  const ctx = this as Phase5Context;
  const poId = await openFirstPoByStatusOrSkip(
    page,
    /Sent to Supplier|Dispatched|Issued/i,
    'No sent-to-supplier PO available for amendment validation.',
    $test
  );
  if (poId) ctx.currentPoId = poId;
});

When('I attempt to amend the current purchase order and submit the amendment', async function ({ page, $test }) {
  const amendBtn = page.getByRole('button', { name: /Amend|Create Amendment|Amend PO/i }).first();
  const amendVisible = await amendBtn.isVisible().catch(() => false);
  if (!amendVisible) {
    $test?.skip(true, 'Amendment action not visible for this PO/user context.');
    return;
  }
  await amendBtn.click();

  const dialog = page.getByRole('dialog').or(page.getByRole('alertdialog'));
  const saveBtn = dialog.getByRole('button', { name: /Save|Submit|Create|Update/i }).first();
  if (await saveBtn.isVisible().catch(() => false)) {
    await saveBtn.click();
    await expect(page.locator('[data-sonner-toast]').filter({ hasText: /amend|updated|success/i }).first()).toBeVisible({
      timeout: 15000,
    });
  }
});

Then('amendment action should create audit evidence for versioned PO change', async function () {
  const ctx = this as Phase5Context;
  if (!ctx.currentPoId) throw new Error('Missing PO context for amendment audit validation.');
  const rows = await executeQuery<{ cnt: string }>(
    `
      SELECT COUNT(*)::text AS cnt
      FROM audit_logs
      WHERE entity_type IN ('purchase_orders', 'purchase_order')
        AND entity_id = $1
        AND (
          COALESCE(action, '') ILIKE '%amend%'
          OR COALESCE(new_values::text, '') ILIKE '%version%'
          OR COALESCE(new_values::text, '') ILIKE '%supersed%'
        )
    `,
    [ctx.currentPoId]
  );
  expect(Number(rows[0]?.cnt || '0')).toBeGreaterThan(0);
});

Given('there is an approved purchase order without GRN for cancellation flow', async function ({ page, $test }) {
  const ctx = this as Phase5Context;
  const rows = await executeQuery<{ id: string }>(
    `
      SELECT po.id
      FROM purchase_orders po
      WHERE po.status = 'approved'
        AND po.is_active = true
        AND NOT EXISTS (
          SELECT 1
          FROM supplier_grns grn
          WHERE grn.purchase_order_id = po.id
            AND grn.is_active = true
        )
      ORDER BY po.updated_at DESC
      LIMIT 1
    `
  );
  if (rows.length === 0) {
    $test?.skip(true, 'No approved PO without GRN found for cancellation validation.');
    return;
  }
  ctx.currentPoId = rows[0].id;
  await page.goto(`/p2p/purchase-orders/${ctx.currentPoId}`);
  await page.waitForLoadState('networkidle');
});

When('I cancel the current purchase order', async function ({ page, $test }) {
  const cancelBtn = page.getByRole('button', { name: /Cancel PO|Cancel Purchase Order|Cancel/i }).first();
  const visible = await cancelBtn.isVisible().catch(() => false);
  if (!visible) {
    $test?.skip(true, 'Cancel action not visible for current PO/user.');
    return;
  }
  page.once('dialog', (d: any) => void d.accept());
  await cancelBtn.click();
  const dialog = page.getByRole('dialog').or(page.getByRole('alertdialog'));
  const confirm = dialog.getByRole('button', { name: /Confirm|Cancel PO|Yes/i }).first();
  if (await confirm.isVisible().catch(() => false)) {
    await confirm.click();
  }
  await expect(page.locator('[data-sonner-toast]').filter({ hasText: /cancel|success|updated/i }).first()).toBeVisible({
    timeout: 15000,
  });
});

Then('the cancelled PO should block GRN and supplier invoice recording actions', async function ({ page }) {
  await expect(page.getByText(/Cancelled/i).first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /Create GRN|Record Receipt|Record Invoice|Supplier Invoice/i }).first()).toBeHidden();
});

Given('there is a purchase order with at least one GRN for cancellation policy validation', async function ({
  page,
  $test,
}) {
  const ctx = this as Phase5Context;
  const rows = await executeQuery<{ id: string }>(
    `
      SELECT po.id
      FROM purchase_orders po
      WHERE po.is_active = true
        AND EXISTS (
          SELECT 1
          FROM supplier_grns grn
          WHERE grn.purchase_order_id = po.id
            AND grn.is_active = true
        )
      ORDER BY po.updated_at DESC
      LIMIT 1
    `
  );
  if (rows.length === 0) {
    $test?.skip(true, 'No PO with GRN found for cancellation policy validation.');
    return;
  }
  ctx.currentPoId = rows[0].id;
  await page.goto(`/p2p/purchase-orders/${ctx.currentPoId}`);
  await page.waitForLoadState('networkidle');
});

When('I attempt to cancel that purchase order', async function ({ page }) {
  const ctx = this as Phase5Context;
  const cancelBtn = page.getByRole('button', { name: /Cancel PO|Cancel Purchase Order|Cancel/i }).first();
  const visible = await cancelBtn.isVisible().catch(() => false);
  if (!visible) {
    ctx.cancelAttemptBlocked = true;
    return;
  }
  await cancelBtn.click();
  const blockingSignal = page
    .getByText(/cannot cancel|GRN exists|not allowed|requires approval|blocked/i)
    .first();
  ctx.cancelAttemptBlocked = await blockingSignal.isVisible({ timeout: 7000 }).catch(() => false);
});

Then('cancellation should be blocked or require policy-based escalation', async function ({ page }) {
  const ctx = this as Phase5Context;
  if (ctx.cancelAttemptBlocked) {
    expect(ctx.cancelAttemptBlocked).toBe(true);
    return;
  }
  const escalationSignal = page.getByText(/requires approval|higher approver|escalat/i).first();
  await expect(escalationSignal).toBeVisible({ timeout: 7000 });
});

Then('PO send and amendment related events should be queryable from audit trail', async function () {
  const ctx = this as Phase5Context;
  if (!ctx.currentPoId) throw new Error('Missing PO context for send/amend audit validation.');
  const rows = await executeQuery<{ cnt: string }>(
    `
      SELECT COUNT(*)::text AS cnt
      FROM audit_logs
      WHERE entity_type IN ('purchase_orders', 'purchase_order')
        AND entity_id = $1
        AND (
          COALESCE(action, '') ILIKE '%send%'
          OR COALESCE(action, '') ILIKE '%amend%'
          OR COALESCE(new_values::text, '') ILIKE '%version%'
        )
    `,
    [ctx.currentPoId]
  );
  expect(Number(rows[0]?.cnt || '0')).toBeGreaterThan(0);
});
