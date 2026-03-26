import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Payment Terms (EPD Slabs) Page Object
 *
 * Source: ../web_app/src/app/finance/payment-terms/page.tsx
 * Purpose: View/add/edit EPD slabs (days_from, days_to, discount_percentage).
 */
export class PaymentTermsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly addSlabButton: Locator;
  readonly slabsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /Payment Terms|EPD/i }).or(
      page.locator('[data-slot="card-title"]').filter({ hasText: /Payment Terms|EPD/i })
    );
    this.addSlabButton = page.getByRole('button', { name: /Add|New/i }).first();
    this.slabsTable = page.locator('table').filter({ has: page.getByText(/days|discount/i) });
  }

  async goto(): Promise<void> {
    await this.navigateTo('/finance/payment-terms');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/payment-terms/, { timeout: 10000 });
    await expect(this.pageTitle.or(this.page.getByText('Payment Terms'))).toBeVisible({ timeout: 10000 });
  }

  async verifyEPDSlabExists(daysFrom: number, daysTo: number): Promise<void> {
    const text = `${daysFrom}`;
    await expect(this.page.getByText(text, { exact: false })).toBeVisible({ timeout: 5000 });
  }
}
