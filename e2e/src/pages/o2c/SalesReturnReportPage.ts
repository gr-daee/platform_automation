import { Page, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * O2C — Sales Return Order report (`/o2c/reports/sales-return`).
 *
 * Source: ../web_app/src/app/o2c/reports/sales-return/page.tsx, SalesReturnContent.tsx
 */
export class SalesReturnReportPage extends BasePage {
  static readonly REPORT_PATH = '/o2c/reports/sales-return';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigateTo(SalesReturnReportPage.REPORT_PATH);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** SR-PH7-TC-001 — core shell: filters + load action (module `sales_orders` read). */
  async expectReportShellVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Load Report' })).toBeVisible({ timeout: 60000 });
    await expect(this.page.getByText('Filters', { exact: true }).first()).toBeVisible();
  }
}
