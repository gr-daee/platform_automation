import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * RFQ List Page Object Model
 *
 * Source: ../web_app/src/app/p2p/rfq/page.tsx, RFQListManager.tsx
 *
 * Purpose: List RFQs, navigate to Create RFQ (Phase 2).
 */
export class RFQListPage extends BasePage {
  readonly heading: Locator;
  readonly createRfqButton: Locator;
  readonly table: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Request for Quotation' });
    this.createRfqButton = page.getByRole('button', { name: /Create RFQ/i });
    this.table = page.locator('table');
    this.emptyState = page.getByText(/No RFQs found|No .* yet/i);
  }

  async goto(): Promise<void> {
    await this.navigateTo('/p2p/rfq');
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [P2P] Navigated to RFQ list page');
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    console.log('✅ [P2P] RFQ list page loaded');
  }

  async gotoCreate(): Promise<void> {
    await expect(this.createRfqButton).toBeVisible({ timeout: 5000 });
    await this.createRfqButton.click();
    await this.page.waitForURL(/\/p2p\/rfq\/create/);
    console.log('✅ [P2P] Navigated to Create RFQ page');
  }

  /** Click first RFQ row to open detail (expects at least one row). */
  async openFirstRFQ(): Promise<void> {
    const firstRow = this.page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });
    await firstRow.click();
    await this.page.waitForURL(/\/p2p\/rfq\/[^/]+$/);
    console.log('✅ [P2P] Opened first RFQ detail');
  }

  /** Get RFQ id from current URL (must be on /p2p/rfq/:id or /p2p/rfq/:id/...). */
  getCurrentRfqIdFromUrl(): string {
    const match = this.page.url().match(/\/p2p\/rfq\/([^/]+)/);
    if (!match) throw new Error('Could not extract RFQ id from URL: ' + this.page.url());
    return match[1];
  }

  async hasAtLeastOneRFQ(): Promise<boolean> {
    const emptyRow = this.page.locator('table tbody tr').filter({ hasText: 'No RFQs found' });
    const visible = await emptyRow.isVisible().catch(() => false);
    return !visible;
  }
}
