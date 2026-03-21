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
    const markers = [
      this.page.getByRole('heading', { name: /VAN Payments/i }).first(),
      this.page.locator('[data-slot="card-title"]').filter({ hasText: /VAN|Manage Dealer VANs/i }).first(),
      this.page.getByText('VAN Payments', { exact: false }).first(),
    ];
    let hasMarker = false;
    for (const marker of markers) {
      if (await marker.isVisible().catch(() => false)) {
        hasMarker = true;
        break;
      }
    }
    expect(hasMarker).toBe(true);
  }

  async verifyVANPaymentExists(identifiers: string | string[]): Promise<void> {
    const values = Array.isArray(identifiers) ? identifiers : [identifiers];
    for (const value of values) {
      if (!value) continue;
      const visible = await this.page.getByText(value, { exact: false }).first().isVisible().catch(() => false);
      if (visible) return;
    }
    throw new Error(`Unable to find VAN payment row using identifiers: ${values.join(', ')}`);
  }

  async verifyPaymentStatus(utr: string, status: string): Promise<void> {
    const row = this.page.locator('div, tr').filter({ hasText: utr }).first();
    await expect(row.getByText(status, { exact: false })).toBeVisible({ timeout: 5000 });
  }

  async openVANPayment(utr: string, paymentId?: string): Promise<void> {
    const normalized = utr.replace(/[^a-zA-Z0-9]/g, '');
    const candidateTexts = [utr, normalized].filter(Boolean);
    for (const candidate of candidateTexts) {
      const link = this.page.getByRole('link', { name: new RegExp(candidate, 'i') }).first();
      if (await link.isVisible().catch(() => false)) {
        await link.click();
        await this.page.waitForURL(/\/finance\/van-payments\/[a-f0-9-]+/, { timeout: 8000 }).catch(() => {});
        return;
      }
    }
    if (paymentId) {
      await this.navigateTo(`/finance/van-payments/${paymentId}`);
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      return;
    }
    throw new Error(`Unable to open VAN payment for identifier: ${utr}`);
  }
}
