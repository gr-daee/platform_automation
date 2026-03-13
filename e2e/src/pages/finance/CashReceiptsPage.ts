import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Cash Receipts List Page Object
 *
 * Source: ../web_app/src/app/finance/cash-receipts/page.tsx
 * Purpose: List cash receipts, navigate to new receipt and to detail/apply pages.
 */
export class CashReceiptsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newCashReceiptButton: Locator;
  readonly table: Locator;
  readonly loadingMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /Cash Receipts/i }).or(
      page.locator('[data-slot="card-title"]').filter({ hasText: 'Cash Receipts' })
    );
    this.newCashReceiptButton = page.getByRole('link', { name: /New Cash Receipt/i });
    this.table = page.locator('table');
    this.loadingMessage = page.getByText('Loading cash receipts...');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/finance/cash-receipts');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/cash-receipts/, { timeout: 10000 });
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async clickNewCashReceipt(): Promise<void> {
    await expect(this.newCashReceiptButton).toBeVisible({ timeout: 10000 });
    await Promise.all([
      this.page.waitForURL(/\/finance\/cash-receipts\/new/, { timeout: 15000 }),
      this.newCashReceiptButton.click(),
    ]);
  }

  async verifyCashReceiptExists(receiptNumber: string): Promise<void> {
    await expect(this.page.getByText(receiptNumber, { exact: false })).toBeVisible({ timeout: 10000 });
  }

  async openCashReceipt(receiptId: string): Promise<void> {
    await this.navigateTo(`/finance/cash-receipts/${receiptId}`);
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  async waitForTableLoaded(): Promise<void> {
    await expect(this.loadingMessage).toBeHidden({ timeout: 15000 });
    await expect(this.table.or(this.page.getByText('No cash receipts'))).toBeVisible({ timeout: 10000 });
  }
}
