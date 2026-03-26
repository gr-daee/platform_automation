import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Quote Comparison Page Object Model (Phase 3)
 *
 * Source: ../web_app/src/app/p2p/rfq/[id]/comparison/components/QuoteComparisonPage.tsx
 *
 * Purpose: View and compare quotes, recommend winning quote with reason (DAEE-151).
 */
export class QuoteComparisonPage extends BasePage {
  readonly heading: Locator;
  readonly backToRfqButton: Locator;
  readonly noQuotesAlert: Locator;
  readonly comparisonTable: Locator;
  readonly totalQuotesCard: Locator;
  readonly lowestPriceCard: Locator;
  readonly selectQuoteButton: Locator;
  readonly selectionDialog: Locator;
  readonly selectionReasonTextarea: Locator;
  readonly submitForApprovalButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /Quote Comparison/i });
    this.backToRfqButton = page.getByRole('button', { name: /Back to RFQ/i });
    this.noQuotesAlert = page.getByText('No quotes have been submitted for this RFQ yet');
    this.comparisonTable = page.locator('table').filter({ has: page.getByRole('columnheader', { name: /Supplier|Rank/i }) });
    this.totalQuotesCard = page.getByText('Total Quotes').locator('..');
    this.lowestPriceCard = page.getByText('Lowest Price').locator('..');
    this.selectQuoteButton = page.getByRole('button', { name: 'Select' }).first();
    this.selectionDialog = page.getByRole('dialog').filter({ hasText: 'Select Winning Quote' });
    this.selectionReasonTextarea = page.getByLabel(/Selection Reason/i);
    this.submitForApprovalButton = page.getByRole('button', { name: /Submit for Approval/i });
  }

  async goto(rfqId: string): Promise<void> {
    await this.page.goto(`/p2p/rfq/${rfqId}/comparison`);
    await this.page.waitForLoadState('networkidle');
    console.log(`✅ [P2P] Navigated to Quote Comparison for RFQ ${rfqId}`);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    console.log('✅ [P2P] Quote Comparison page loaded');
  }

  async expectComparisonTableOrNoQuotes(): Promise<void> {
    const tableOrNoQuotes = this.comparisonTable.or(this.noQuotesAlert);
    await expect(tableOrNoQuotes).toBeVisible({ timeout: 10000 });
    console.log('✅ [P2P] Comparison table or No quotes message visible');
  }

  async selectFirstQuoteAndSubmitReason(reason: string): Promise<void> {
    await this.selectQuoteButton.click();
    await expect(this.selectionDialog).toBeVisible({ timeout: 5000 });
    await this.selectionReasonTextarea.fill(reason);
    await this.submitForApprovalButton.click();
    await expect(this.selectionDialog).toBeHidden({ timeout: 5000 });
    const successAlert = this.page.getByText(/Quote selected successfully|Awaiting approval/i);
    await expect(successAlert).toBeVisible({ timeout: 10000 });
    console.log('✅ [P2P] Selected winning quote with reason');
  }
}
