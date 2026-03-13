import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * VAN Payments Page Object
 *
 * Source: ../web_app/src/app/finance/van-payments/page.tsx
 * Purpose: List VAN payments, verify UTR/status, open payment details.
 */
export class VANPaymentsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly paymentsList: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /VAN Payments/i }).or(
      page.locator('[data-slot="card-title"]').filter({ hasText: /VAN/i })
    );
    this.paymentsList = page.locator('main').or(page.locator('[class*="dashboard"]'));
    this.loadingIndicator = page.getByText('Loading').first();
  }

  async goto(): Promise<void> {
    await this.navigateTo('/finance/van-payments');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/van-payments/, { timeout: 10000 });
    await expect(this.pageTitle.or(this.page.getByText('VAN Payments'))).toBeVisible({ timeout: 10000 });
  }

  async verifyVANPaymentExists(utr: string): Promise<void> {
    await expect(this.page.getByText(utr, { exact: false })).toBeVisible({ timeout: 10000 });
  }

  async verifyPaymentStatus(utr: string, status: string): Promise<void> {
    const row = this.page.locator('div, tr').filter({ hasText: utr }).first();
    await expect(row.getByText(status, { exact: false })).toBeVisible({ timeout: 5000 });
  }

  async openVANPayment(utr: string): Promise<void> {
    const link = this.page.getByRole('link', { name: new RegExp(utr, 'i') }).or(
      this.page.getByText(utr).locator('..')
    );
    await link.first().click();
    await this.page.waitForURL(/\/finance\/van-payments\/[a-f0-9-]+/, { timeout: 5000 }).catch(() => {});
  }
}
