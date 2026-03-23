import { Page, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * O2C — Sales return order detail (`/o2c/sales-returns/[id]`).
 *
 * Source: ../web_app/src/app/o2c/sales-returns/[id]/page.tsx
 * Actions: RecordGoodsReceiptButton.tsx, CancelReturnOrderButton.tsx, RetryECreditNoteButton.tsx
 */
export class SalesReturnDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async expectOnReturnDetailNotNew(): Promise<void> {
    await expect(this.page).toHaveURL(/\/o2c\/sales-returns\/(?!new)[a-zA-Z0-9-]+\/?$/);
  }

  async expectPendingReceiptStatusVisible(): Promise<void> {
    await expect(this.page.getByText('Pending Receipt', { exact: true }).first()).toBeVisible({
      timeout: 30000,
    });
  }

  /** SR-PH4-TC-001 — `pending` status only. */
  async expectRecordGoodsReceiptAndCancelActionsVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Record Goods Receipt', exact: true })).toBeVisible({
      timeout: 30000,
    });
    await expect(this.page.getByRole('button', { name: 'Cancel Return Order', exact: true })).toBeVisible();
  }

  /**
   * SR-PH4-TC-002 — Submit receipt dialog; warehouse often auto-filled from invoice.
   * If trigger still shows “Select Warehouse…”, opens nested dialog and picks first row.
   * @param options.qcPassed — SR-PH4-TC-004: set **QC Passed** so GRN stock update matches accepted path (`RecordGoodsReceiptButton.tsx`).
   */
  async completeRecordGoodsReceiptDialog(options?: { qcPassed?: boolean }): Promise<void> {
    await this.page.getByRole('button', { name: 'Record Goods Receipt', exact: true }).click();
    const dialog = this.page.getByRole('dialog', { name: /record goods receipt/i });
    await expect(dialog).toBeVisible();

    if (options?.qcPassed) {
      await dialog.locator('#qcStatus').click();
      await this.page.getByRole('option', { name: /QC Passed/i }).click();
    }

    const warehouseTrigger = dialog.locator('div.space-y-4').getByRole('button').first();
    await expect(warehouseTrigger).not.toContainText(/loading warehouses/i, { timeout: 120000 });

    const whLabel = await warehouseTrigger.textContent();
    if (whLabel?.includes('Select Warehouse')) {
      await warehouseTrigger.click();
      const whDialog = this.page.getByRole('dialog', { name: /select warehouse/i });
      await expect(whDialog).toBeVisible();
      const firstRow = whDialog.locator('tbody tr').first();
      await expect(firstRow).toBeVisible({ timeout: 60000 });
      await firstRow.getByRole('button', { name: 'Select', exact: true }).click();
      await expect(whDialog).toBeHidden({ timeout: 15000 });
    }

    await dialog.getByRole('button', { name: 'Record Receipt', exact: true }).click();
    await expect(dialog).toBeHidden({ timeout: 120000 });
  }

  /**
   * After `recordGoodsReceipt`, badge is usually **Goods Received**; some environments advance quickly to **Credit Memo Created**.
   * Both mean the receipt step succeeded and **Record Goods Receipt** is no longer applicable.
   */
  async expectGoodsReceivedOrCreditMemoCreatedStatus(): Promise<void> {
    const received = this.page.getByText('Goods Received', { exact: true });
    const creditMemo = this.page.getByText('Credit Memo Created', { exact: true });
    await expect(received.or(creditMemo).first()).toBeVisible({ timeout: 120000 });
  }

  /** SR-PH4-TC-003 — button not rendered after `received`. */
  async expectCancelReturnOrderActionAbsent(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Cancel Return Order', exact: true })).toHaveCount(0);
  }

  // --- Phase 5 — credit memo ---

  /**
   * If **Create Credit Memo** is shown (`received` without CM), submit dialog → may navigate to `/finance/credit-memos/{id}`.
   * If workflow already linked a CM, assert **Credit Memo Created** or **View Credit Memo** link.
   */
  async completeCreditMemoFlowWhenApplicable(): Promise<void> {
    const createBtn = this.page.getByRole('button', { name: 'Create Credit Memo', exact: true });
    const visible = await createBtn.isVisible().catch(() => false);
    if (visible) {
      await createBtn.click();
      const dlg = this.page.getByRole('dialog', { name: /create credit memo/i });
      await expect(dlg).toBeVisible({ timeout: 15000 });
      await dlg.getByRole('button', { name: 'Create Credit Memo', exact: true }).click();
      await expect(this.page).toHaveURL(/\/finance\/credit-memos\/[^/?]+/, { timeout: 120000 });
      return;
    }
    await expect(
      this.page
        .getByText('Credit Memo Created', { exact: true })
        .or(this.page.getByRole('link', { name: /view credit memo/i }))
        .first()
    ).toBeVisible({ timeout: 30000 });
  }

  async expectCreditMemoOutcomeVisibleOnReturnOrFinancePage(): Promise<void> {
    if (/\/finance\/credit-memos\//.test(this.page.url())) {
      await expect(this.page.getByText('Credit Memo Details', { exact: true })).toBeVisible({ timeout: 60000 });
      return;
    }
    await expect(
      this.page
        .getByText('Credit Memo Created', { exact: true })
        .or(this.page.getByRole('link', { name: /view credit memo/i }))
        .first()
    ).toBeVisible({ timeout: 30000 });
  }

  /** SR-PH5-TC-003 — deep-link to return detail (read-only DB–picked id). */
  async gotoByReturnOrderId(returnOrderId: string): Promise<void> {
    await this.navigateTo(`/o2c/sales-returns/${returnOrderId}`);
    await this.page.waitForLoadState('domcontentloaded');
    await this.expectOnReturnDetailNotNew();
  }

  /** Retry E-Credit Note trigger + dialog shell only (no GST portal call asserted). */
  async expectRetryEcreditNoteButtonAndDialogShell(): Promise<void> {
    const trigger = this.page.getByRole('button', { name: 'Retry E-Credit Note', exact: true });
    await expect(trigger).toBeVisible({ timeout: 60000 });
    await trigger.click();
    const dlg = this.page.getByRole('dialog', { name: /retry e-credit note generation/i });
    await expect(dlg).toBeVisible({ timeout: 15000 });
    await expect(dlg.getByText(/gst portal|gstzen|irn/i).first()).toBeVisible();
    await dlg.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dlg).toBeHidden({ timeout: 10000 });
  }

  // --- Phase 6 — cancel ---

  async openCancelReturnOrderDialog(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel Return Order', exact: true }).click();
    await expect(this.page.getByRole('alertdialog', { name: /cancel return order/i })).toBeVisible({
      timeout: 15000,
    });
  }

  /** SR-PH6-TC-001 — destructive confirm disabled until reason entered. */
  async expectCancelReturnConfirmDisabledWhenReasonEmpty(): Promise<void> {
    const dlg = this.page.getByRole('alertdialog', { name: /cancel return order/i });
    await expect(dlg.getByRole('button', { name: 'Yes, Cancel Return Order' })).toBeDisabled();
  }

  async dismissCancelReturnOrderDialog(): Promise<void> {
    const dlg = this.page.getByRole('alertdialog', { name: /cancel return order/i });
    await dlg.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dlg).toBeHidden({ timeout: 10000 });
  }

  /** SR-PH6-TC-002 */
  async submitCancelReturnOrderWithReason(reason: string): Promise<void> {
    const dlg = this.page.getByRole('alertdialog', { name: /cancel return order/i });
    await dlg.getByLabel(/cancellation reason/i).fill(reason);
    await dlg.getByRole('button', { name: 'Yes, Cancel Return Order' }).click();
    await expect(dlg).toBeHidden({ timeout: 120000 });
  }

  async expectCancelledStatusVisible(): Promise<void> {
    await expect(this.page.getByText('Cancelled', { exact: true }).first()).toBeVisible({ timeout: 60000 });
  }
}
