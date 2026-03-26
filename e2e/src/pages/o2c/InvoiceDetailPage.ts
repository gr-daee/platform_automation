import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * O2C Invoice Detail Page Object Model
 *
 * Source: ../web_app/src/app/o2c/invoices/[id]/page.tsx
 *         ../web_app/src/app/o2c/invoices/[id]/components/InvoiceDetailsContent.tsx
 *
 * Purpose: Invoice detail – Generate Custom eInvoice PDF, download trigger,
 * header **Cancel Invoice** (`CancelInvoiceDialog` / `cancelInvoiceWithGST`).
 *
 * Note: **Cancel E-Invoice** in the E-Invoice card (`EInvoiceCancellation`) is broken in staging (400) — use header flow; see Linear **DAEE-362**.
 */
export class InvoiceDetailPage extends BasePage {
  readonly generateCustomEInvoicePdfButton: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);

    // CardTitle "E-Invoice Information" renders as div, not heading; use getByText
    this.pageHeading = page.getByText(/e-invoice information/i).first();
    // Either button (for verifyPageLoaded): "Generate custom..." or "Download Custom..." when PDF ready
    this.generateCustomEInvoicePdfButton = page.getByRole('button', {
      name: /generate custom e-?invoice pdf|download custom .*invoice pdf/i,
    });
  }

  async goto(invoiceId: string): Promise<void> {
    await this.navigateTo(`/o2c/invoices/${invoiceId}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyPageLoaded(): Promise<void> {
    // Wait for loading indicator to disappear first (page may show "Loading invoice details...")
    const loadingIndicators = [
      this.page.getByText(/Loading.*invoice/i),
      this.page.getByText(/Loading\.\.\./i),
      this.page.locator('[role="status"]').filter({ hasText: /Loading/i }),
    ];
    
    // Wait for all loading indicators to disappear (up to 30s)
    for (const indicator of loadingIndicators) {
      try {
        await expect(indicator).toBeHidden({ timeout: 30000 }).catch(() => {});
      } catch {
        // Indicator might not exist, continue
      }
    }
    
    // Wait for network to stabilize
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
    
    // Verify page loaded: E-Invoice Information section is visible (button may or may not be present)
    // Note: The Custom E-Invoice PDF button is only present when e-invoice is generated,
    // so we don't require it for page load verification
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
  }

  async isGenerateCustomEInvoicePdfVisible(): Promise<boolean> {
    return this.generateCustomEInvoicePdfButton.isVisible().catch(() => false);
  }

  /** Locator for "Download Custom..." (shown when PDF is already generated). */
  get downloadCustomInvoicePdfButton(): Locator {
    return this.page.getByRole('button', { name: /download custom .*invoice pdf/i });
  }

  /** Locator for "Generate custom..." (shown when PDF is not yet generated). */
  get generateCustomEInvoicePdfButtonOnly(): Locator {
    return this.page.getByRole('button', { name: /generate custom .*e-?invoice pdf/i });
  }

  async isDownloadCustomInvoicePdfVisible(): Promise<boolean> {
    return this.downloadCustomInvoicePdfButton.isVisible().catch(() => false);
  }

  /**
   * Click "Generate custom..." (triggers backend generation; UI then shows "Download Custom..." when ready).
   */
  async clickGenerateCustomEInvoicePdf(): Promise<void> {
    await this.pageHeading.scrollIntoViewIfNeeded().catch(() => {});
    await this.page.waitForTimeout(300);
    const btn = this.generateCustomEInvoicePdfButtonOnly;
    await btn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);
    await btn.click();
  }

  /**
   * Click "Download Custom..." (triggers download; use when PDF is already generated).
   */
  async clickDownloadCustomInvoicePdf(): Promise<void> {
    await this.pageHeading.scrollIntoViewIfNeeded().catch(() => {});
    await this.page.waitForTimeout(300);
    const btn = this.downloadCustomInvoicePdfButton;
    await btn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);
    await btn.click();
  }

  /**
   * Wait for "Download Custom..." button to appear (e.g. after "Generate custom..." finished).
   */
  async waitForDownloadCustomInvoicePdfButton(timeoutMs: number = 60000): Promise<void> {
    await expect(this.downloadCustomInvoicePdfButton).toBeVisible({ timeout: timeoutMs });
  }

  /** Verify invoice status badge shows Paid. */
  async verifyStatusPaid(): Promise<void> {
    await expect(this.page.getByText('Paid', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  }

  /** Verify balance is zero or Paid (PaymentHistoryCard shows "Paid" when balance <= 0.01). */
  async verifyPaidWithBalanceZero(): Promise<void> {
    await this.verifyStatusPaid();
    const paidOrZero = this.page.getByText(/Paid|0\.00|₹\s*0/).first();
    await expect(paidOrZero).toBeVisible({ timeout: 10000 });
  }

  /**
   * Header **Cancel Invoice** (DAE-219) — opens `CancelInvoiceDialog` (Radix Dialog), not the E-Invoice card control.
   * @deprecated For legacy / defect repro only — E-Invoice card path returns 400 in staging (DAEE-362).
   */
  async clickCancelEInvoiceTrigger(): Promise<void> {
    const btn = this.page.getByRole('button', { name: /^cancel e-invoice$/i }).first();
    await expect(btn).toBeVisible({ timeout: 25000 });
    await btn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(600);
    await btn.click();
    const dialog = this.page.getByRole('alertdialog').filter({ hasText: /cancel e-invoice/i });
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await this.page.waitForTimeout(500);
  }

  /** @deprecated Use {@link clickCancelInvoiceHeaderButton} + {@link fillCancelInvoiceDialogAndConfirm} (DAEE-362). */
  async confirmCancelEInvoiceInDialog(): Promise<void> {
    const dialog = this.page.getByRole('alertdialog').filter({ hasText: /cancel e-invoice/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByRole('button', { name: /keep e-invoice/i })).toBeVisible({ timeout: 5000 });
    await this.page.waitForTimeout(1200);
    const confirmBtn = dialog.getByRole('button', { name: /^cancel e-invoice$/i });
    await expect(confirmBtn).toBeVisible({ timeout: 10000 });
    await confirmBtn.click();
  }

  /**
   * When `journal_entry_id` is missing, header **Cancel Invoice** is hidden — post to GL first (create / TC-003 path).
   */
  async postToGeneralLedgerIfButtonVisible(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    const postBtn = this.page.getByRole('button', { name: /^post to general ledger$/i });
    if (!(await postBtn.isVisible().catch(() => false))) return;
    await postBtn.click();
    const posting = this.page.getByRole('button', { name: /posting to gl/i });
    await expect(posting).toBeVisible({ timeout: 10000 }).catch(() => {});
    await expect(posting).toBeHidden({ timeout: 120000 });
    const postedToast = this.page.locator('[data-sonner-toast]').filter({ hasText: /posted to general ledger/i });
    await expect(postedToast.first()).toBeVisible({ timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(2500);
  }

  /** Top toolbar **Cancel Invoice** next to Post to GL / Back (InvoiceDetailsContent). */
  async clickCancelInvoiceHeaderButton(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(400);
    const btn = this.page.getByRole('button', { name: /^cancel invoice$/i });
    await expect(btn).toBeVisible({ timeout: 25000 });
    await btn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(600);
    await btn.click();
    const dlg = this.page.getByRole('dialog').filter({ hasText: /cancel invoice:/i });
    await expect(dlg).toBeVisible({ timeout: 15000 });
    await this.page.waitForTimeout(500);
  }

  /**
   * `CancelInvoiceDialog`: default GST reason is already "Order Cancelled" (code 3); remarks are required.
   */
  async fillCancelInvoiceDialogAndConfirm(remarks: string): Promise<void> {
    const dlg = this.page.getByRole('dialog').filter({ hasText: /cancel invoice:/i });
    await expect(dlg).toBeVisible({ timeout: 5000 });
    await this.page.waitForTimeout(800);
    const remarksBox = dlg.getByLabel(/cancellation reason.*remarks/i);
    await expect(remarksBox).toBeVisible({ timeout: 10000 });
    await remarksBox.fill(remarks);
    await this.page.waitForTimeout(500);
    const confirm = dlg.getByRole('button', { name: /confirm cancellation/i });
    await expect(confirm).toBeVisible({ timeout: 10000 });
    await confirm.click();
  }

  /**
   * Waits for Sonner success after IRN cancel. Surfaces provider/API errors if a failure toast appears instead.
   */
  async waitForEInvoiceCancelledToast(): Promise<void> {
    const deadline = Date.now() + 120_000;
    /** EInvoiceCancellation: toast.success('E-invoice cancelled successfully'). CancelInvoiceDialog: 'Invoice Cancelled Successfully'. */
    const successToast = this.page
      .locator('[data-sonner-toast]')
      .filter({ hasText: /e-invoice cancelled successfully|invoice cancelled successfully/i })
      .first();
    const failToast = this.page
      .locator('[data-sonner-toast]')
      .filter({
        hasText:
          /cancel.*failed|failed to cancel|cancellation failed|cancellation error|cannot cancel|e-invoice api|processing failed|rejected|unknown error/i,
      })
      .first();

    while (Date.now() < deadline) {
      if (await successToast.isVisible().catch(() => false)) return;
      if (await failToast.isVisible().catch(() => false)) {
        const t = (await failToast.textContent()) || '';
        throw new Error(`E-invoice cancellation failed (toast): ${t.trim().slice(0, 500)}`);
      }
      await this.page.waitForTimeout(1200);
    }

    const any = await this.page.locator('[data-sonner-toast]').allTextContents();
    throw new Error(
      `Timeout: no cancellation success toast (check GST / IRN / e-way / network). Sonner toasts seen: ${JSON.stringify(any)}`
    );
  }
}
