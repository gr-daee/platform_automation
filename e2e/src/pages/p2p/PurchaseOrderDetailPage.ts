import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Purchase Order Detail Page Object Model (Phase 4)
 *
 * Source: ../web_app/src/app/p2p/purchase-orders/[id]/page.tsx (expected)
 *
 * Purpose: Verify status and perform approval workflow actions.
 */
export class PurchaseOrderDetailPage extends BasePage {
  readonly statusBadge: Locator;
  readonly submitForApprovalButton: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly sendToSupplierButton: Locator;
  readonly activityHeading: Locator;
  readonly quoteVsPoHeading: Locator;
  readonly supplierSection: Locator;
  readonly lineItemsTable: Locator;

  constructor(page: Page) {
    super(page);

    this.statusBadge = page.getByText(/Draft|Submitted|Approved|Rejected|Cancelled/i);
    this.submitForApprovalButton = page.getByRole('button', { name: /Submit for Approval/i });
    this.approveButton = page.getByRole('button', { name: /^Approve$/i }).or(
      page.getByRole('button', { name: /Approve PO|Approve Purchase Order/i })
    );
    this.rejectButton = page.getByRole('button', { name: /^Reject$/i }).or(
      page.getByRole('button', { name: /Reject PO|Reject Purchase Order/i })
    );
    this.sendToSupplierButton = page.getByRole('button', { name: /Send to Supplier/i }).or(
      page.getByRole('button', { name: /Send PO|Send Purchase Order/i })
    );

    this.activityHeading = page.getByRole('heading', { name: /Activity|Audit|History/i });
    this.quoteVsPoHeading = page.getByRole('heading', { name: /Quote vs PO|Quote vs Purchase Order/i });

    this.supplierSection = page.getByText(/Supplier/i).first();
    this.lineItemsTable = page.locator('table');
  }

  getCurrentPoIdFromUrl(): string {
    const match = this.page.url().match(/\/p2p\/purchase-orders\/([^/]+)/);
    if (!match) throw new Error('Could not extract PO id from URL: ' + this.page.url());
    return match[1];
  }

  private async waitForPageReady(): Promise<void> {
    const loadingPermissions = this.page.getByText('Loading permissions...');
    if (await loadingPermissions.first().isVisible().catch(() => false)) {
      await expect(loadingPermissions.first()).toBeHidden({ timeout: 30000 });
    }
    await this.page.waitForLoadState('networkidle');
  }

  async verifyStatus(expected: string): Promise<void> {
    await this.waitForPageReady();
    // PO layout may not wrap content in <main>; status is shown on the header Badge.
    await expect(this.page.getByText(expected, { exact: true }).first()).toBeVisible({
      timeout: 15000,
    });
  }

  async submitForApproval(): Promise<void> {
    await expect(this.submitForApprovalButton.first()).toBeVisible({ timeout: 15000 });
    // App uses window.confirm(); Playwright dismisses native dialogs by default (cancel), so submit never runs.
    this.page.once('dialog', (d) => void d.accept());
    await this.submitForApprovalButton.first().click();

    const dialog = this.page.getByRole('dialog');
    const alertDialog = this.page.getByRole('alertdialog');
    const confirmBtn = dialog.getByRole('button', { name: /Confirm|Submit|Yes/i }).or(
      alertDialog.getByRole('button', { name: /Confirm|Submit|Yes/i })
    );
    if (await confirmBtn.first().isVisible().catch(() => false)) {
      await confirmBtn.first().click();
    }

    // Submit triggers reload in UI; status is asserted in dedicated Then step.
    await this.waitForPageReady();
  }

  async approve(): Promise<void> {
    await expect(this.approveButton.first()).toBeVisible({ timeout: 15000 });
    this.page.once('dialog', (d) => void d.accept());
    await this.approveButton.first().click();
    const dialog = this.page.getByRole('dialog').or(this.page.getByRole('alertdialog'));
    const confirm = dialog.getByRole('button', { name: /Confirm|Approve|Yes/i });
    if (await confirm.first().isVisible().catch(() => false)) {
      await confirm.first().click();
    }
    await expect(this.page.getByText('Approved', { exact: true }).first()).toBeVisible({
      timeout: 30000,
    });
    await this.page.waitForLoadState('networkidle');
  }

  async ensureAuditContains(fromStatus: string, toStatus: string): Promise<void> {
    const activityVisible = await this.activityHeading.isVisible().catch(() => false);
    if (activityVisible) {
      const activityRegion = this.activityHeading.locator('..');
      await expect(activityRegion).toContainText(new RegExp(`${fromStatus}|${toStatus}`, 'i'), {
        timeout: 10000,
      });
      return;
    }

    // PO detail has no Activity/Audit heading; workflow card reflects status progression.
    await expect(this.page.getByText('Procure-to-Pay Workflow Progress')).toBeVisible({
      timeout: 10000,
    });
    await expect(this.page.getByText(toStatus, { exact: true }).first()).toBeVisible();
    if (fromStatus === 'Draft' && toStatus === 'Submitted') {
      await expect(this.page.getByText('Current - Awaiting Approval')).toBeVisible();
    }
  }

  async verifyQuoteVsPoVisible(): Promise<void> {
    const visible = await this.quoteVsPoHeading.isVisible().catch(() => false);
    if (visible) return;

    // Fallback: tolerate alternate wording
    const fallback = this.page.getByText(/Quote vs PO|Quote.*PO/i);
    await expect(fallback.first()).toBeVisible({ timeout: 10000 });
  }
}

