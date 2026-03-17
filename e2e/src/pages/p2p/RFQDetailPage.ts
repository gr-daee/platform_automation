import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * RFQ Detail Page Object Model
 *
 * Source: ../web_app/src/app/p2p/rfq/[id]/components/RFQDetailPage.tsx
 *
 * Purpose: View RFQ detail, Compare Quotes, Approve/Reject selection, Create PO (Phase 3).
 */
export class RFQDetailPage extends BasePage {
  readonly compareQuotesButton: Locator;
  readonly createPOButton: Locator;
  readonly approveSelectionButton: Locator;
  readonly rejectSelectionButton: Locator;
  readonly statusBadge: Locator;
  readonly enterQuoteButton: Locator;
  readonly issueRfqButton: Locator;
  readonly issueRfqDialogJustification: Locator;
  readonly issueRfqConfirmButton: Locator;

  constructor(page: Page) {
    super(page);
    this.compareQuotesButton = page.getByRole('button', { name: /Compare Quotes/i });
    this.createPOButton = page.getByRole('button', { name: /Create Purchase Order/i });
    this.approveSelectionButton = page.getByRole('button', { name: /Approve Selection/i });
    this.rejectSelectionButton = page.getByRole('button', { name: /Reject Selection/i });
    this.statusBadge = page.getByText(/Draft|Issued|Quotes Received|Under Evaluation|Selection Pending|Selection Approved|Selection Rejected|Converted to PO|Cancelled|Expired/i);
    this.enterQuoteButton = page.getByRole('button', { name: /Enter Quote/i });
    this.issueRfqButton = page.getByRole('button', { name: /Issue RFQ/i });
    this.issueRfqDialogJustification = page.getByRole('alertdialog').getByPlaceholder(/justification for sole source/i);
    this.issueRfqConfirmButton = page.getByRole('alertdialog').getByRole('button', { name: /^Issue RFQ$/i });
  }

  async goto(rfqId: string): Promise<void> {
    await this.page.goto(`/p2p/rfq/${rfqId}`);
    await this.page.waitForLoadState('networkidle');
    console.log(`✅ [P2P] Navigated to RFQ detail ${rfqId}`);
  }

  async verifyDetailLoaded(): Promise<void> {
    await expect(this.statusBadge.first()).toBeVisible({ timeout: 15000 });
    console.log('✅ [P2P] RFQ detail page loaded');
  }

  async goToComparison(): Promise<void> {
    await this.compareQuotesButton.click();
    await this.page.waitForURL(/\/p2p\/rfq\/[^/]+\/comparison/);
    console.log('✅ [P2P] Navigated to Quote Comparison');
  }

  getCurrentRfqIdFromUrl(): string {
    const match = this.page.url().match(/\/p2p\/rfq\/([^/]+)/);
    if (!match) throw new Error('Could not extract RFQ id from URL: ' + this.page.url());
    if (match[1] === 'create') {
      throw new Error('Not on RFQ detail URL; still on /p2p/rfq/create. URL: ' + this.page.url());
    }
    return match[1];
  }

  async isCompareQuotesVisible(): Promise<boolean> {
    return this.compareQuotesButton.isVisible();
  }

  async isCreatePOVisible(): Promise<boolean> {
    return this.createPOButton.isVisible();
  }

  /** Click Issue RFQ and confirm; optionally fill sole-source justification. */
  async issueRfqAndConfirm(soleSourceJustification?: string): Promise<void> {
    await this.issueRfqButton.click();
    const alert = this.page.getByRole('alertdialog');
    await expect(alert).toBeVisible({ timeout: 5000 });
    if (soleSourceJustification) {
      const justificationField = alert.getByPlaceholder(/justification for sole source/i);
      if (await justificationField.isVisible().catch(() => false)) {
        await justificationField.fill(soleSourceJustification);
      }
    }
    await alert.getByRole('button', { name: /^Issue RFQ$/i }).click();
    await expect(this.page.locator('[data-sonner-toast]').filter({ hasText: /issued|success/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(alert).toBeHidden({ timeout: 5000 });
    console.log('✅ [P2P] RFQ issued');
  }

  /** Open Enter Quote dialog and submit a quote: select first supplier, set valid until, ensure line unit price, Create Quote. */
  async enterQuoteAndSubmit(validUntilDate: string): Promise<void> {
    await this.enterQuoteButton.click();
    const dialog = this.page.getByRole('dialog').filter({ hasText: /Enter Supplier Quote/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const supplierCombo = dialog.getByRole('combobox', { name: /Select invited supplier/i });
    await supplierCombo.click();
    await this.page.getByRole('option').first().click();
    await dialog.getByLabel(/Valid Until/i).fill(validUntilDate);
    const firstUnitPrice = dialog.getByPlaceholder('0.00').first();
    if (await firstUnitPrice.isVisible().catch(() => false)) {
      const val = await firstUnitPrice.inputValue();
      if (!val || parseFloat(val) <= 0) await firstUnitPrice.fill('10');
    }
    await dialog.getByRole('button', { name: /Create Quote/i }).click();
    await expect(this.page.locator('[data-sonner-toast]').filter({ hasText: /created|submitted|success/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(dialog).toBeHidden({ timeout: 5000 });
    console.log('✅ [P2P] Quote entered and submitted');
  }

  async goToInvite(): Promise<void> {
    await this.page.getByRole('button', { name: /Invite Suppliers/i }).click();
    await this.page.waitForURL(/\/p2p\/rfq\/[^/]+\/invite/);
    console.log('✅ [P2P] Navigated to Invite Suppliers');
  }
}
